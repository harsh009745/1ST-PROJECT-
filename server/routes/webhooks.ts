import { Router, Request, Response } from 'express';
import { PaymentGateway } from '../services/razorpay.js';
import { DB } from '../db.js';

const router = Router();

router.post('/razorpay', async (req: Request, res: Response) => {
  const signature = req.headers['x-razorpay-signature'] as string;

  if (!signature) {
    return res.status(400).json({ error: 'Missing x-razorpay-signature header' });
  }

  const rawBody = (req as any).rawBody;
  if (!rawBody) {
    return res.status(400).json({ error: 'Raw body required for webhook verification' });
  }

  const isValid = PaymentGateway.verifyWebhookSignature(rawBody, signature);
  if (!isValid) {
    console.error('🚨 Invalid Razorpay Webhook Signature received.');
    return res.status(400).json({ error: 'Invalid webhook signature' });
  }

  const event = req.body;
  const eventType = event?.event;

  console.log(`Webhook received: ${eventType}`);

  try {
    if (eventType === 'payment.captured') {
      const payment = event.payload?.payment?.entity;
      const orderId = payment?.order_id;

      if (orderId) {
        const orderRecord = await DB.getOrder(orderId);
        const bookingRef = orderRecord?.bookingReference;
        const booking = bookingRef ? await DB.getBooking(bookingRef) : await DB.findBookingByOrderId(orderId);

        if (booking && booking.status !== 'PAYMENT_CONFIRMED') {
          const meetingRoomId = `Consult-${booking.bookingReference.replace(/[^a-zA-Z0-9]/g, '')}`;
          const meetingUrl = `https://meet.jit.si/${meetingRoomId}`;
          const meetingInstructions =
            'Please join the secure video room at least 2 minutes prior to your scheduled 45-minute consultation. Ensure you are in a well-lit room with natural or frontal light so hair, skin texture, and jawline framing can be accurately assessed.';

          await DB.updateBooking(booking.bookingReference, {
            status: 'PAYMENT_CONFIRMED',
            razorpayPaymentId: payment.id,
            paymentMethod: payment.method || 'upi',
            vpa: payment.vpa || undefined,
            capturedAt: new Date().toISOString(),
            meetingUrl: booking.meetingUrl || meetingUrl,
            meetingInstructions: booking.meetingInstructions || meetingInstructions,
            webhookProcessed: true,
          });
          console.log(`✅ Webhook confirmed booking: ${booking.bookingReference}`);
        }
      }
    } else if (eventType === 'payment.failed') {
      const payment = event.payload?.payment?.entity;
      const orderId = payment?.order_id;

      if (orderId) {
        const orderRecord = await DB.getOrder(orderId);
        const bookingRef = orderRecord?.bookingReference;
        const booking = bookingRef ? await DB.getBooking(bookingRef) : await DB.findBookingByOrderId(orderId);

        if (booking && booking.status !== 'PAYMENT_CONFIRMED') {
          await DB.updateBooking(booking.bookingReference, {
            status: 'FAILED',
            failureReason: payment.error_description || 'Payment failed at bank/gateway',
            razorpayPaymentId: payment.id,
          });
          console.log(`⚠️ Webhook marked booking as failed: ${booking.bookingReference}`);
        }
      }
    }

    return res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return res.status(500).json({ error: 'Internal error processing webhook' });
  }
});

export default router;
