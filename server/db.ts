import fs from 'fs';
import path from 'path';

export interface BookingRecord {
  bookingReference: string;
  serviceId: string;
  serviceName: string;
  durationMinutes: 45;
  date: string; // YYYY-MM-DD
  timeSlot: string; // e.g. "10:00 AM – 10:45 AM"
  slotKey: string; // e.g. "2026-10-28_10:00 AM – 10:45 AM"
  timezone: string;
  amountINR: number;
  amountPaise: number;
  currency: 'INR';
  userId?: string;
  userEmail?: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    timezone?: string;
    goalsNotes?: string;
  };
  status: 'AWAITING_PAYMENT' | 'PAYMENT_PENDING' | 'PAYMENT_CONFIRMED' | 'FAILED' | 'CANCELLED';
  reservationExpiresAt: string; // ISO string, e.g. now + 15 mins
  meetingUrl?: string;
  meetingInstructions?: string;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  paymentMethod?: string;
  vpa?: string;
  capturedAt?: string;
  failureReason?: string;
  webhookProcessed?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OrderRecord {
  orderId: string;
  bookingReference: string;
  amountPaise: number;
  currency: 'INR';
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserRecord {
  uid: string;
  email: string;
  displayName?: string;
  phoneNumber?: string;
  photoURL?: string;
  role: 'customer' | 'admin';
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

interface DatabaseSchema {
  bookings: Record<string, BookingRecord>;
  orders: Record<string, OrderRecord>;
  users: Record<string, UserRecord>;
}

export const DEFAULT_45_MIN_SLOTS = [
  '10:00 AM – 10:45 AM',
  '11:00 AM – 11:45 AM',
  '02:00 PM – 02:45 PM',
  '03:00 PM – 03:45 PM',
  '04:00 PM – 04:45 PM',
  '06:00 PM – 06:45 PM',
  '07:00 PM – 07:45 PM',
];

const DB_DIR = path.resolve(process.cwd(), '.data');
const DB_FILE = path.join(DB_DIR, 'db.json');

function ensureDbFile(): DatabaseSchema {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    const initial: DatabaseSchema = { bookings: {}, orders: {}, users: {} };
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
    return initial;
  }
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (!parsed.bookings) parsed.bookings = {};
    if (!parsed.orders) parsed.orders = {};
    if (!parsed.users) parsed.users = {};
    return parsed;
  } catch (e) {
    console.error('Failed reading db.json, reinitializing memory state:', e);
    return { bookings: {}, orders: {}, users: {} };
  }
}

function writeDbFile(data: DatabaseSchema): void {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  } catch (err) {
    console.error('Failed saving to db.json:', err);
  }
}

export const DB = {
  // Orders
  async saveOrder(orderId: string, data: Omit<OrderRecord, 'createdAt' | 'updatedAt' | 'orderId'>) {
    const db = ensureDbFile();
    const now = new Date().toISOString();
    const existing = db.orders[orderId];
    db.orders[orderId] = {
      ...data,
      orderId,
      createdAt: existing ? existing.createdAt : now,
      updatedAt: now,
    };
    writeDbFile(db);
  },

  async getOrder(orderId: string): Promise<OrderRecord | null> {
    const db = ensureDbFile();
    return db.orders[orderId] || null;
  },

  // Bookings
  async createBooking(
    bookingReference: string,
    data: Omit<BookingRecord, 'createdAt' | 'updatedAt' | 'bookingReference'>
  ): Promise<BookingRecord> {
    const db = ensureDbFile();
    const now = new Date().toISOString();
    const record: BookingRecord = {
      ...data,
      bookingReference,
      createdAt: now,
      updatedAt: now,
    };
    db.bookings[bookingReference] = record;
    writeDbFile(db);
    return record;
  },

  async updateBooking(
    bookingReference: string,
    update: Partial<BookingRecord>
  ): Promise<BookingRecord | null> {
    const db = ensureDbFile();
    const existing = db.bookings[bookingReference];
    if (!existing) return null;

    const updated: BookingRecord = {
      ...existing,
      ...update,
      updatedAt: new Date().toISOString(),
    };
    db.bookings[bookingReference] = updated;
    writeDbFile(db);
    return updated;
  },

  async getBooking(bookingReference: string): Promise<BookingRecord | null> {
    const db = ensureDbFile();
    return db.bookings[bookingReference] || null;
  },

  async findBookingByOrderId(orderId: string): Promise<BookingRecord | null> {
    const db = ensureDbFile();
    const values = Object.values(db.bookings);
    return values.find((b) => b.razorpayOrderId === orderId) || null;
  },

  async getUserBookings(userEmail: string, userId?: string): Promise<BookingRecord[]> {
    const db = ensureDbFile();
    const lowerEmail = userEmail.toLowerCase().trim();
    return Object.values(db.bookings)
      .filter((b) => {
        const matchesEmail =
          b.customer.email.toLowerCase().trim() === lowerEmail ||
          (b.userEmail && b.userEmail.toLowerCase().trim() === lowerEmail);
        const matchesUid = userId && b.userId === userId;
        return matchesEmail || matchesUid;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async getAllBookings(): Promise<BookingRecord[]> {
    const db = ensureDbFile();
    return Object.values(db.bookings).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  async cleanExpiredReservations(): Promise<number> {
    const db = ensureDbFile();
    const now = new Date().getTime();
    let releasedCount = 0;

    for (const [, booking] of Object.entries(db.bookings)) {
      if (booking.status === 'AWAITING_PAYMENT') {
        const expiryTime = new Date(booking.reservationExpiresAt).getTime();
        if (now > expiryTime) {
          booking.status = 'CANCELLED';
          booking.failureReason = 'Reservation expired before payment completion.';
          booking.updatedAt = new Date().toISOString();
          releasedCount++;
        }
      }
    }

    if (releasedCount > 0) {
      writeDbFile(db);
    }
    return releasedCount;
  },

  async isSlotAvailable(date: string, timeSlot: string, excludeBookingRef?: string): Promise<boolean> {
    const todayStr = new Date().toISOString().split('T')[0];
    if (date < todayStr) {
      return false;
    }

    if (!DEFAULT_45_MIN_SLOTS.includes(timeSlot)) {
      return false;
    }

    const db = ensureDbFile();
    const now = new Date().getTime();
    const slotKey = `${date}_${timeSlot}`;

    for (const booking of Object.values(db.bookings)) {
      if (excludeBookingRef && booking.bookingReference === excludeBookingRef) {
        continue;
      }

      if (booking.slotKey === slotKey) {
        if (booking.status === 'PAYMENT_CONFIRMED') {
          return false;
        }

        if (booking.status === 'AWAITING_PAYMENT' || booking.status === 'PAYMENT_PENDING') {
          const expiry = new Date(booking.reservationExpiresAt).getTime();
          if (now < expiry) {
            return false;
          }
        }
      }
    }

    return true;
  },

  async getAvailabilityForDate(date: string): Promise<{
    date: string;
    isPastDate: boolean;
    slots: Array<{
      timeSlot: string;
      durationMinutes: 45;
      available: boolean;
      status: 'AVAILABLE' | 'BOOKED' | 'RESERVED' | 'PAST';
    }>;
  }> {
    const todayStr = new Date().toISOString().split('T')[0];
    const isPast = date < todayStr;

    if (isPast) {
      return {
        date,
        isPastDate: true,
        slots: DEFAULT_45_MIN_SLOTS.map((timeSlot) => ({
          timeSlot,
          durationMinutes: 45,
          available: false,
          status: 'PAST',
        })),
      };
    }

    await this.cleanExpiredReservations();

    const db = ensureDbFile();
    const now = new Date().getTime();

    const slotResults = DEFAULT_45_MIN_SLOTS.map((timeSlot) => {
      const slotKey = `${date}_${timeSlot}`;
      let status: 'AVAILABLE' | 'BOOKED' | 'RESERVED' | 'PAST' = 'AVAILABLE';
      let available = true;

      for (const booking of Object.values(db.bookings)) {
        if (booking.slotKey === slotKey) {
          if (booking.status === 'PAYMENT_CONFIRMED') {
            status = 'BOOKED';
            available = false;
            break;
          } else if (booking.status === 'AWAITING_PAYMENT' || booking.status === 'PAYMENT_PENDING') {
            const expiry = new Date(booking.reservationExpiresAt).getTime();
            if (now < expiry) {
              status = 'RESERVED';
              available = false;
              break;
            }
          }
        }
      }

      return {
        timeSlot,
        durationMinutes: 45 as const,
        available,
        status,
      };
    });

    return {
      date,
      isPastDate: false,
      slots: slotResults,
    };
  },

  // Users & Roles
  async saveUser(user: Partial<UserRecord> & { uid: string; email: string }): Promise<UserRecord> {
    const db = ensureDbFile();
    const now = new Date().toISOString();
    const existing = db.users[user.uid];

    const saved: UserRecord = {
      uid: user.uid,
      email: user.email.toLowerCase().trim(),
      displayName: user.displayName ?? existing?.displayName ?? '',
      phoneNumber: user.phoneNumber ?? existing?.phoneNumber ?? '',
      photoURL: user.photoURL ?? existing?.photoURL ?? '',
      role: user.role ?? existing?.role ?? 'customer',
      emailVerified: user.emailVerified ?? existing?.emailVerified ?? false,
      createdAt: existing ? existing.createdAt : now,
      updatedAt: now,
    };

    db.users[user.uid] = saved;
    writeDbFile(db);
    return saved;
  },

  async getUser(uid: string): Promise<UserRecord | null> {
    const db = ensureDbFile();
    return db.users[uid] || null;
  },

  async getUserByEmail(email: string): Promise<UserRecord | null> {
    const db = ensureDbFile();
    const lower = email.toLowerCase().trim();
    return Object.values(db.users).find((u) => u.email.toLowerCase() === lower) || null;
  },

  async listUsers(): Promise<UserRecord[]> {
    const db = ensureDbFile();
    return Object.values(db.users).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  async setUserRole(email: string, role: 'customer' | 'admin'): Promise<UserRecord | null> {
    const db = ensureDbFile();
    const lower = email.toLowerCase().trim();
    const user = Object.values(db.users).find((u) => u.email.toLowerCase() === lower);
    if (!user) return null;
    user.role = role;
    user.updatedAt = new Date().toISOString();
    writeDbFile(db);
    return user;
  },
};
