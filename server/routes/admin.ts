import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { DB, BookingRecord } from '../db.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

// Apply requireAdmin to all routes in this file
router.use(requireAdmin);

// Dashboard Overview / Analytics Stats
router.get('/overview', async (_req: Request, res: Response) => {
  try {
    const bookings = await DB.getAllBookings();
    const users = await DB.listUsers();

    const confirmed = bookings.filter((b) => b.status === 'PAYMENT_CONFIRMED');
    const pending = bookings.filter((b) => b.status === 'AWAITING_PAYMENT' || b.status === 'PAYMENT_PENDING');
    const cancelled = bookings.filter((b) => b.status === 'CANCELLED' || b.status === 'FAILED');

    const totalRevenueINR = confirmed.reduce((acc, curr) => acc + (curr.amountINR || 0), 0);

    const todayStr = new Date().toISOString().split('T')[0];
    const upcoming = confirmed.filter((b) => b.date >= todayStr);

    return res.json({
      stats: {
        totalBookings: bookings.length,
        confirmedBookings: confirmed.length,
        pendingBookings: pending.length,
        cancelledBookings: cancelled.length,
        totalRevenueINR,
        totalUsers: users.length,
        upcomingConsultations: upcoming.length,
      },
    });
  } catch (error) {
    console.error('Error fetching admin overview:', error);
    return res.status(500).json({ error: 'Failed to calculate platform statistics' });
  }
});

// Full Bookings List with Search & Filtering
router.get('/bookings', async (req: Request, res: Response) => {
  try {
    const { search, status, date } = req.query;
    let bookings = await DB.getAllBookings();

    if (status && typeof status === 'string' && status !== 'ALL') {
      bookings = bookings.filter((b) => b.status === status);
    }

    if (date && typeof date === 'string') {
      bookings = bookings.filter((b) => b.date === date);
    }

    if (search && typeof search === 'string') {
      const q = search.toLowerCase().trim();
      bookings = bookings.filter(
        (b) =>
          b.bookingReference.toLowerCase().includes(q) ||
          b.customer.name.toLowerCase().includes(q) ||
          b.customer.email.toLowerCase().includes(q) ||
          b.customer.phone.includes(q) ||
          b.serviceName.toLowerCase().includes(q)
      );
    }

    return res.json({
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error('Error listing admin bookings:', error);
    return res.status(500).json({ error: 'Failed to retrieve bookings list' });
  }
});

// Single Booking Details
router.get('/bookings/:bookingReference', async (req: Request, res: Response) => {
  try {
    const booking = await DB.getBooking(req.params.bookingReference);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    return res.json({ booking });
  } catch (error) {
    console.error('Error fetching booking details:', error);
    return res.status(500).json({ error: 'Failed to retrieve booking' });
  }
});

// Update Booking (Status, Meeting URL, Instructions)
const UpdateBookingSchema = z.object({
  status: z.enum(['AWAITING_PAYMENT', 'PAYMENT_PENDING', 'PAYMENT_CONFIRMED', 'CANCELLED', 'FAILED']).optional(),
  meetingUrl: z.string().url('Must be a valid URL (Google Meet, Zoom, etc.)').optional().or(z.literal('')),
  meetingInstructions: z.string().max(1000).optional(),
});

router.patch('/bookings/:bookingReference', async (req: Request, res: Response) => {
  try {
    const { bookingReference } = req.params;
    const parsed = UpdateBookingSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid update payload', details: parsed.error.issues });
    }

    const existing = await DB.getBooking(bookingReference);
    if (!existing) {
      return res.status(404).json({ error: 'Booking reference not found' });
    }

    const updated = await DB.updateBooking(bookingReference, parsed.data);
    return res.json({
      success: true,
      message: 'Booking successfully updated',
      booking: updated,
    });
  } catch (error) {
    console.error('Error updating booking:', error);
    return res.status(500).json({ error: 'Failed to update booking' });
  }
});

// User Management: List all registered accounts
router.get('/users', async (_req: Request, res: Response) => {
  try {
    const users = await DB.listUsers();
    return res.json({ count: users.length, users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ error: 'Failed to fetch registered users' });
  }
});

// Update User Role
const UpdateRoleSchema = z.object({
  role: z.enum(['customer', 'admin']),
});

router.patch('/users/:email/role', async (req: Request, res: Response) => {
  try {
    const { email } = req.params;
    const parsed = UpdateRoleSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const updated = await DB.setUserRole(email, parsed.data.role);
    if (!updated) {
      return res.status(404).json({ error: 'User with specified email not found' });
    }

    return res.json({ success: true, user: updated });
  } catch (error) {
    console.error('Error changing user role:', error);
    return res.status(500).json({ error: 'Failed to change user role' });
  }
});

export default router;
