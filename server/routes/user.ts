import { Router, Request, Response } from 'express';
import { DB } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Retrieve all consultations booked by the authenticated customer
router.get('/bookings', requireAuth, async (req: Request, res: Response) => {
  try {
    const userEmail = req.user!.email;
    const userId = req.user!.uid;

    const bookings = await DB.getUserBookings(userEmail, userId);

    return res.json({
      count: bookings.length,
      bookings: bookings.map((b) => ({
        bookingReference: b.bookingReference,
        serviceId: b.serviceId,
        serviceName: b.serviceName,
        durationMinutes: b.durationMinutes,
        date: b.date,
        timeSlot: b.timeSlot,
        timezone: b.timezone,
        amountINR: b.amountINR,
        status: b.status,
        meetingUrl: b.status === 'PAYMENT_CONFIRMED' ? b.meetingUrl : undefined,
        meetingInstructions: b.meetingInstructions,
        razorpayOrderId: b.razorpayOrderId,
        razorpayPaymentId: b.razorpayPaymentId,
        paymentMethod: b.paymentMethod,
        capturedAt: b.capturedAt,
        createdAt: b.createdAt,
      })),
    });
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    return res.status(500).json({ error: 'Failed to retrieve your consultation bookings' });
  }
});

export default router;
