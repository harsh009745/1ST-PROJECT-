export interface ServiceItem {
  id: string;
  name: string;
  duration: string;
  durationMinutes: number;
  description: string;
  fullDescription?: string;
  basePriceINR: number;
  badge?: string;
  features: string[];
  isCustomAmountAllowed?: boolean;
  minAmountINR?: number;
  maxAmountINR?: number;
}

export interface SlotItem {
  timeSlot: string;
  durationMinutes: 45;
  available: boolean;
  status: 'AVAILABLE' | 'BOOKED' | 'RESERVED' | 'PAST';
}

export interface DateAvailabilityResponse {
  date: string;
  isPastDate: boolean;
  slots: SlotItem[];
}

export interface CustomerFormData {
  name: string;
  email: string;
  phone: string;
  timezone?: string;
  goalsNotes?: string;
  notes?: string;
}

export type PaymentStatus =
  | 'IDLE'
  | 'INITIATING_ORDER'
  | 'CHECKOUT_OPEN'
  | 'VERIFYING_PAYMENT'
  | 'PAYMENT_CONFIRMED'
  | 'PAYMENT_PENDING'
  | 'PAYMENT_FAILED';

export interface BookingConfirmation {
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
  bookingReference: string;
  serviceName: string;
  durationMinutes?: number;
  date?: string;
  timeSlot?: string;
  timezone?: string;
  amountINR: number;
  meetingUrl?: string;
  meetingInstructions?: string;
  capturedAt?: string;
  message?: string;
  isPending?: boolean;
}

export interface GatewayConfig {
  configured: boolean;
  keyId: string;
  services: ServiceItem[];
  currency: string;
  defaultSlots: string[];
  durationMinutes: number;
  timezone: string;
}
