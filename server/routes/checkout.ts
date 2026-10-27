import { Router, Request, Response } from 'express';
import { z } from 'zod';
import crypto from 'crypto';
import { SERVICE_CATALOG } from '../services/catalog.js';
import { PaymentGateway } from '../services/razorpay.js';
import { DB, DEFAULT_45_MIN_SLOTS } from '../db.js';
import { ENV } from '../config.js';

const router = Router();

// Config & Catalog
router.get('/config', (_req: Request, res: Response) => {
  const isConfigured = PaymentGateway.isConfigured();
  return res.json({
    configured: isConfigured,
    keyId: isConfigured ? PaymentGateway.getKeyId() : '',
    services: Object.values(SERVICE_CATALOG),
    currency: 'INR',
    defaultSlots: DEFAULT_45_MIN_SLOTS,
    durationMinutes: 45,
    timezone: 'Asia/Kolkata (IST)',
  });
});

// Slot Availability Query for specific date
router.get('/slots', async (req: Request, res: Response) => {
  try {
    const dateQuery = req.query.date as string;
    if (!dateQuery || !/^\d{4}-\d{2}-\d{2}$/.test(dateQuery)) {
      return res.status(400).json({ error: 'Valid date query parameter required in YYYY-MM-DD format.' });
    }

    const availability = await DB.getAvailabilityForDate(dateQuery);
    return res.json(availability);
  } catch (error) {
    console.error('Error fetching slots:', error);
    return res.status(500).json({ error: 'Failed to retrieve slot availability.' });
  }
});

const CreateOrderSchema = z.object({
  serviceId: z.string().min(1, 'Service ID is required'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Valid date required (YYYY-MM-DD)'),
  timeSlot: z.string().min(1, 'Time slot is required'),
  timezone: z.string().default('Asia/Kolkata (IST)'),
  userId: z.string().optional(),
  promoCode: z.string().optional(),
  discountINR: z.number().min(0).optional(),
  isDemo: z.boolean().optional(),
  customer: z.object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
    email: z.string().email('Please enter a valid email address'),
    phone: z.string().regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian mobile number'),
    timezone: z.string().optional(),
    goalsNotes: z.string().max(800).optional(),
  }),
});

// Promo code verification helper
router.post('/validate-promo', (req: Request, res: Response) => {
  const code = (req.body.code || '').trim().toUpperCase();
  const serviceId = req.body.serviceId || 'complete-45';
  const service = SERVICE_CATALOG[serviceId] || Object.values(SERVICE_CATALOG)[0];
  const basePrice = service ? service.basePriceINR : 1999;

  let discountINR = 0;
  let description = '';

  if (code === 'GLOW20') {
    discountINR = Math.round(basePrice * 0.2);
    description = '20% Special Aesthetics Discount Applied';
  } else if (code === 'VALENCE') {
    discountINR = 200;
    description = '₹200 Valence Luxury Welcome Courtesy';
  } else if (code === 'FIRST100') {
    discountINR = 100;
    description = '₹100 First Consultation Voucher';
  } else if (code === 'AESTHETICS') {
    discountINR = Math.round(basePrice * 0.15);
    description = '15% Consultation Protocol Discount';
  } else {
    return res.status(400).json({ valid: false, error: 'Invalid or expired promotional code.' });
  }

  const finalAmountINR = Math.max(100, basePrice - discountINR);
  return res.json({
    valid: true,
    code,
    discountINR,
    finalAmountINR,
    description,
  });
});

router.post('/orders', async (req: Request, res: Response) => {
  try {
    const parsed = CreateOrderSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: parsed.error.issues.map((i) => ({ field: i.path.join('.'), message: i.message })),
      });
    }

    const { serviceId, date, timeSlot, timezone, customer, userId, promoCode, discountINR, isDemo } =
      parsed.data;
    const service = SERVICE_CATALOG[serviceId];

    if (!service) {
      return res.status(404).json({ error: 'Selected consultation service does not exist in catalogue.' });
    }

    // 1. Validate date is not in the past
    const todayStr = new Date().toISOString().split('T')[0];
    if (date < todayStr) {
      return res.status(400).json({ error: 'Cannot book appointments for past dates.' });
    }

    // 2. Validate timeSlot is one of the supported 45-min slots
    if (!DEFAULT_45_MIN_SLOTS.includes(timeSlot)) {
      return res.status(400).json({ error: 'Invalid time slot selected. Consultations must be exactly 45 minutes.' });
    }

    // 3. Concurrency check: Ensure slot is available
    const isAvailable = await DB.isSlotAvailable(date, timeSlot);
    if (!isAvailable) {
      return res.status(409).json({
        error: 'This 45-minute time slot is no longer available. Please select another slot or date.',
        code: 'SLOT_UNAVAILABLE',
      });
    }

    const discount = Math.max(0, discountINR || 0);
    const finalAmountINR = Math.max(100, service.basePriceINR - discount);
    const amountPaise = finalAmountINR * 100;

    const bookingReference = `VALENCE-${Date.now().toString(36).toUpperCase()}-${crypto
      .randomBytes(3)
      .toString('hex')
      .toUpperCase()}`;

    // 15-minute temporary reservation lock
    const reservationExpiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    let rzpOrderId = '';
    let keyId = '';

    const useRealGateway = PaymentGateway.isConfigured() && !isDemo;

    if (useRealGateway) {
      // Create official order with Razorpay
      const rzpOrder = await PaymentGateway.createOrder({
        amountPaise,
        receipt: bookingReference,
        notes: {
          bookingReference,
          serviceId,
          date,
          timeSlot,
          durationMinutes: '45',
          customerName: customer.name,
          customerEmail: customer.email,
          promoCode: promoCode || 'NONE',
        },
      });
      rzpOrderId = rzpOrder.id;
      keyId = PaymentGateway.getKeyId();
    } else {
      // Sandbox / Demo order when keys are not configured or demo mode is selected
      rzpOrderId = `order_sandbox_${Date.now().toString(36)}_${crypto.randomBytes(4).toString('hex')}`;
      keyId = PaymentGateway.isConfigured() ? PaymentGateway.getKeyId() : 'rzp_test_sandbox';
    }

    // Authoritative persistence in DB with temporary reservation lock and user association
    await DB.createBooking(bookingReference, {
      serviceId,
      serviceName: service.name,
      durationMinutes: 45,
      date,
      timeSlot,
      slotKey: `${date}_${timeSlot}`,
      timezone: timezone || customer.timezone || 'Asia/Kolkata (IST)',
      amountINR: finalAmountINR,
      amountPaise,
      currency: 'INR',
      userId: req.user?.uid || userId,
      userEmail: req.user?.email || customer.email,
      customer: {
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        timezone: customer.timezone || timezone,
        goalsNotes: customer.goalsNotes,
      },
      status: 'AWAITING_PAYMENT',
      reservationExpiresAt,
      razorpayOrderId: rzpOrderId,
    });

    await DB.saveOrder(rzpOrderId, {
      bookingReference,
      amountPaise,
      currency: 'INR',
      status: 'created',
    });

    return res.status(201).json({
      orderId: rzpOrderId,
      amount: amountPaise,
      currency: 'INR',
      bookingReference,
      keyId,
      date,
      timeSlot,
      durationMinutes: 45,
      reservationExpiresAt,
      isSandbox: !useRealGateway,
    });
  } catch (error: any) {
    console.error('Order creation error:', error?.message || error);
    return res.status(500).json({
      error: error?.message || 'Failed to initialize booking order with payment gateway.',
    });
  }
});

const VerifyPaymentSchema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
  bookingReference: z.string().min(1),
  paymentMethod: z.string().optional(),
  vpa: z.string().optional(),
});

router.post('/verify', async (req: Request, res: Response) => {
  try {
    const parsed = VerifyPaymentSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid verification payload' });
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      bookingReference,
      paymentMethod = 'upi',
      vpa,
    } = parsed.data;

    // Fetch authoritative booking record
    const booking = await DB.getBooking(bookingReference);
    if (!booking) {
      return res.status(404).json({ error: 'Associated booking reference not found.' });
    }

    // Generate meeting URL securely
    const meetingRoomId = `Consult-${booking.bookingReference.replace(/[^a-zA-Z0-9]/g, '')}`;
    const meetingUrl = ENV.CUSTOM_MEETING_BASE_URL
      ? `${ENV.CUSTOM_MEETING_BASE_URL}/${meetingRoomId}`
      : `https://meet.jit.si/${meetingRoomId}`;

    const meetingInstructions =
      'Please join the secure video room at least 2 minutes prior to your scheduled 45-minute consultation. Ensure you are in a well-lit room with frontal light so hair, skin texture, and jawline framing can be accurately assessed.';

    // Idempotency: If already confirmed, safely return success
    if (booking.status === 'PAYMENT_CONFIRMED') {
      return res.json({
        status: 'SUCCESS',
        message: 'Payment already authoritatively verified.',
        bookingReference: booking.bookingReference,
        serviceName: booking.serviceName,
        durationMinutes: 45,
        date: booking.date,
        timeSlot: booking.timeSlot,
        timezone: booking.timezone,
        amountINR: booking.amountINR,
        meetingUrl: booking.meetingUrl || meetingUrl,
        meetingInstructions: booking.meetingInstructions || meetingInstructions,
      });
    }

    const isSandboxOrder =
      razorpay_order_id.startsWith('order_sandbox_') ||
      razorpay_order_id.startsWith('order_demo_') ||
      razorpay_signature === 'demo_verified_signature' ||
      razorpay_signature === 'sandbox_verified_signature';

    if (isSandboxOrder) {
      // Confirmed sandbox test payment
      await DB.updateBooking(bookingReference, {
        status: 'PAYMENT_CONFIRMED',
        razorpayPaymentId: razorpay_payment_id,
        paymentMethod: paymentMethod || 'sandbox_instant',
        vpa: vpa || undefined,
        capturedAt: new Date().toISOString(),
        meetingUrl,
        meetingInstructions,
      });

      return res.json({
        status: 'SUCCESS',
        message: 'Sandbox payment verified and 45-minute video consultation confirmed.',
        bookingReference: booking.bookingReference,
        serviceName: booking.serviceName,
        durationMinutes: 45,
        date: booking.date,
        timeSlot: booking.timeSlot,
        timezone: booking.timezone,
        amountINR: booking.amountINR,
        meetingUrl,
        meetingInstructions,
        capturedAt: new Date().toISOString(),
      });
    }

    // 1. Authoritative HMAC-SHA256 signature verification for live gateway
    const isSignatureValid = PaymentGateway.verifyPaymentSignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isSignatureValid) {
      console.error(`🚨 Cryptographic signature mismatch for Order: ${razorpay_order_id}`);
      return res.status(400).json({
        status: 'FAILED',
        error: 'Cryptographic signature verification failed. Untrusted payment payload.',
      });
    }

    // 2. Authoritative verification against Razorpay Gateway API
    const payment = (await PaymentGateway.fetchPayment(razorpay_payment_id)) as any;

    if (payment.order_id !== razorpay_order_id) {
      return res.status(400).json({
        status: 'FAILED',
        error: 'Order ID mismatch between signature and gateway payment record.',
      });
    }

    if (payment.amount !== booking.amountPaise || payment.currency !== 'INR') {
      return res.status(400).json({
        status: 'FAILED',
        error: 'Payment amount or currency mismatch detected.',
      });
    }

    if (payment.status !== 'captured') {
      await DB.updateBooking(bookingReference, {
        status: 'PAYMENT_PENDING',
        razorpayPaymentId: razorpay_payment_id,
      });
      return res.json({
        status: 'PENDING',
        message: 'Payment is currently pending bank capture. Status will update shortly.',
        bookingReference,
        date: booking.date,
        timeSlot: booking.timeSlot,
      });
    }

    // 3. Mark Authorized & Confirmed permanently in database
    await DB.updateBooking(bookingReference, {
      status: 'PAYMENT_CONFIRMED',
      razorpayPaymentId: razorpay_payment_id,
      paymentMethod: payment.method || paymentMethod || 'upi',
      vpa: payment.vpa || vpa || undefined,
      capturedAt: new Date().toISOString(),
      meetingUrl,
      meetingInstructions,
    });

    return res.json({
      status: 'SUCCESS',
      message: 'Payment verified and 45-minute video consultation confirmed.',
      bookingReference: booking.bookingReference,
      serviceName: booking.serviceName,
      durationMinutes: 45,
      date: booking.date,
      timeSlot: booking.timeSlot,
      timezone: booking.timezone,
      amountINR: booking.amountINR,
      meetingUrl,
      meetingInstructions,
      capturedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Payment verification error:', error?.message || error);
    return res.status(500).json({
      status: 'FAILED',
      error: error?.message || 'Server error during payment verification.',
    });
  }
});

router.get('/status/:bookingReference', async (req: Request, res: Response) => {
  try {
    const booking = await DB.getBooking(req.params.bookingReference);
    if (!booking) {
      return res.status(404).json({ error: 'Booking reference not found.' });
    }

    // Public response: strictly avoid leaking customer private credentials or phone
    const isConfirmed = booking.status === 'PAYMENT_CONFIRMED';

    return res.json({
      bookingReference: booking.bookingReference,
      serviceName: booking.serviceName,
      durationMinutes: 45,
      date: booking.date,
      timeSlot: booking.timeSlot,
      timezone: booking.timezone,
      status: booking.status,
      amountINR: booking.amountINR,
      createdAt: booking.createdAt,
      capturedAt: booking.capturedAt,
      paymentMethod: booking.paymentMethod,
      meetingUrl: isConfirmed ? booking.meetingUrl : null,
      meetingInstructions: isConfirmed ? booking.meetingInstructions : null,
    });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to retrieve booking status.' });
  }
});

export default router;
