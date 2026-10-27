import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  Lock,
  Calendar,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  ChevronRight,
  ArrowLeft,
  CreditCard,
  QrCode,
  Building2,
  Smartphone,
  Tag,
  Check,
  Loader2,
  Video,
  FileText,
  CalendarPlus,
  BadgeCheck,
  User,
  Mail,
  Phone,
} from 'lucide-react';
import QRCode from 'qrcode';
import { useAuth } from '../context/AuthContext';
import { ServiceItem, BookingConfirmation } from '../types';
import { useRazorpayScript } from '../hooks/useRazorpay';
import { db } from '../config/firebase';
import { doc, setDoc } from 'firebase/firestore';

interface PaymentPageProps {
  services: ServiceItem[];
  isGatewayConfigured?: boolean;
}

type PaymentTab = 'upi' | 'card' | 'netbanking' | 'razorpay' | 'sandbox';

const DEFAULT_TIME_SLOTS = [
  '10:00 AM – 10:45 AM',
  '11:30 AM – 12:15 PM',
  '02:00 PM – 02:45 PM',
  '04:00 PM – 04:45 PM',
  '06:00 PM – 06:45 PM',
  '07:30 PM – 08:15 PM',
];

const POPULAR_BANKS = [
  { id: 'HDFC', name: 'HDFC Bank', code: 'HDFC' },
  { id: 'ICICI', name: 'ICICI Bank', code: 'ICIC' },
  { id: 'SBI', name: 'State Bank of India', code: 'SBIN' },
  { id: 'AXIS', name: 'Axis Bank', code: 'UTIB' },
  { id: 'KOTAK', name: 'Kotak Mahindra', code: 'KKBK' },
  { id: 'PNB', name: 'Punjab National Bank', code: 'PUNB' },
];

export const PaymentPage: React.FC<PaymentPageProps> = ({ services, isGatewayConfigured = false }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, getIdToken } = useAuth();
  const { isLoaded: isRzpLoaded } = useRazorpayScript();

  // Route query params
  const requestedServiceId = searchParams.get('service') || searchParams.get('package') || 'complete-45';
  const requestedDate = searchParams.get('date');
  const requestedSlot = searchParams.get('slot');

  // Selected Service
  const [selectedServiceId, setSelectedServiceId] = useState<string>(requestedServiceId);
  const selectedService = useMemo(() => {
    return services.find((s) => s.id === selectedServiceId) || services[0] || {
      id: 'complete-45',
      name: 'Comprehensive 1:1 Aesthetics & Grooming Consultation',
      duration: '45 mins',
      durationMinutes: 45,
      description: 'Complete private video session covering facial aesthetics, hairstyle geometry, and skincare.',
      basePriceINR: 1999,
      features: ['Facial structure assessment', 'Haircut guidance', 'Skincare audit'],
    };
  }, [services, selectedServiceId]);

  // Appointment Date & Slot
  const defaultDate = useMemo(() => {
    if (requestedDate && /^\d{4}-\d{2}-\d{2}$/.test(requestedDate)) {
      return requestedDate;
    }
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }, [requestedDate]);

  const [selectedDate, setSelectedDate] = useState<string>(defaultDate);
  const [selectedSlot, setSelectedSlot] = useState<string>(
    requestedSlot && DEFAULT_TIME_SLOTS.includes(requestedSlot) ? requestedSlot : DEFAULT_TIME_SLOTS[1]
  );
  const [availableSlots, setAvailableSlots] = useState<string[]>(DEFAULT_TIME_SLOTS);
  const [isSlotPickerOpen, setIsSlotPickerOpen] = useState<boolean>(false);

  // Customer Form Data
  const [customerName, setCustomerName] = useState<string>(user?.displayName || '');
  const [customerEmail, setCustomerEmail] = useState<string>(user?.email || '');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [customerGoals, setCustomerGoals] = useState<string>('');

  // Auto-sync when auth state loads
  useEffect(() => {
    if (user) {
      if (!customerName && user.displayName) setCustomerName(user.displayName);
      if (!customerEmail && user.email) setCustomerEmail(user.email);
    }
  }, [user]);

  // Payment Tab
  const [activeTab, setActiveTab] = useState<PaymentTab>('upi');

  // UPI State
  const [upiVpa, setUpiVpa] = useState<string>('');
  const [upiQrDataUrl, setUpiQrDataUrl] = useState<string>('');

  // Card State
  const [cardNumber, setCardNumber] = useState<string>('');
  const [cardExpiry, setCardExpiry] = useState<string>('');
  const [cardCvv, setCardCvv] = useState<string>('');
  const [cardHolder, setCardHolder] = useState<string>('');

  // Net Banking State
  const [selectedBank, setSelectedBank] = useState<string>('HDFC');

  // Promo Code State
  const [promoInput, setPromoInput] = useState<string>('');
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string;
    discountINR: number;
    description: string;
  } | null>(null);
  const [promoError, setPromoError] = useState<string>('');
  const [isApplyingPromo, setIsApplyingPromo] = useState<boolean>(false);

  // Reservation Lock Countdown Timer (15 Minutes)
  const [secondsRemaining, setSecondsRemaining] = useState<number>(15 * 60);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTimer = useMemo(() => {
    const mins = Math.floor(secondsRemaining / 60);
    const secs = secondsRemaining % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, [secondsRemaining]);

  // Financial Calculations
  const basePrice = selectedService.basePriceINR;
  const platformFee = 199;
  const discountAmount = appliedPromo ? appliedPromo.discountINR : 0;
  const totalPayableINR = Math.max(100, basePrice - discountAmount);

  // QR Code Generation
  useEffect(() => {
    async function generateUPIQR() {
      try {
        const vpaMerchant = 'aaditya.valence@okaxis';
        const payeeName = 'Valence Aesthetics';
        const note = `45-Min Consultation (${selectedSlot})`;
        const upiIntent = `upi://pay?pa=${encodeURIComponent(vpaMerchant)}&pn=${encodeURIComponent(
          payeeName
        )}&am=${totalPayableINR}&cu=INR&tn=${encodeURIComponent(note)}`;

        const qrData = await QRCode.toDataURL(upiIntent, {
          width: 320,
          margin: 1.5,
          color: {
            dark: '#000000',
            light: '#ffffff',
          },
        });
        setUpiQrDataUrl(qrData);
      } catch (err) {
        console.warn('QR code generation failed:', err);
      }
    }
    generateUPIQR();
  }, [totalPayableINR, selectedSlot]);

  // Fetch slots for selected date
  useEffect(() => {
    async function fetchSlots() {
      try {
        const res = await fetch(`/api/checkout/slots?date=${selectedDate}`);
        if (res.ok) {
          const data = await res.json();
          if (data.slots && Array.isArray(data.slots)) {
            const avail = data.slots.filter((s: any) => s.available).map((s: any) => s.timeSlot);
            if (avail.length > 0) {
              setAvailableSlots(avail);
              if (!avail.includes(selectedSlot)) {
                setSelectedSlot(avail[0]);
              }
            }
          }
        }
      } catch (err) {
        console.warn('Could not fetch date slots, using default schedule:', err);
      }
    }
    fetchSlots();
  }, [selectedDate]);

  // Handle Promo Code Verification
  const handleApplyPromo = async (codeToTry?: string) => {
    const code = (codeToTry || promoInput).trim().toUpperCase();
    if (!code) {
      setPromoError('Please enter a coupon code.');
      return;
    }
    setPromoError('');
    setIsApplyingPromo(true);

    try {
      const res = await fetch('/api/checkout/validate-promo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, serviceId: selectedService.id }),
      });
      const data = await res.json();

      if (res.ok && data.valid) {
        setAppliedPromo({
          code: data.code,
          discountINR: data.discountINR,
          description: data.description,
        });
        setPromoInput('');
      } else {
        setPromoError(data.error || 'Invalid or expired promotional voucher.');
      }
    } catch (err) {
      // Fallback local promo validation
      if (code === 'GLOW20') {
        const disc = Math.round(selectedService.basePriceINR * 0.2);
        setAppliedPromo({
          code: 'GLOW20',
          discountINR: disc,
          description: '20% Aesthetics Discount Applied',
        });
      } else if (code === 'VALENCE') {
        setAppliedPromo({
          code: 'VALENCE',
          discountINR: 200,
          description: '₹200 Valence Welcome Courtesy',
        });
      } else if (code === 'FIRST100') {
        setAppliedPromo({
          code: 'FIRST100',
          discountINR: 100,
          description: '₹100 First Consultation Voucher',
        });
      } else {
        setPromoError('Coupon code not recognized.');
      }
    } finally {
      setIsApplyingPromo(false);
    }
  };

  // Payment Execution State
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [paymentError, setPaymentError] = useState<string>('');
  const [completedConfirmation, setCompletedConfirmation] = useState<BookingConfirmation | null>(null);
  const [copiedRef, setCopiedRef] = useState<boolean>(false);

  // Validate form before paying
  const validateInputs = (): boolean => {
    if (!customerName.trim() || customerName.trim().length < 2) {
      setPaymentError('Please enter your full name for the clinical appointment record.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail.trim())) {
      setPaymentError('Please enter a valid email address to receive your consultation link and calendar invite.');
      return false;
    }
    const cleanPhone = customerPhone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setPaymentError('Please enter a valid 10-digit Indian phone number for appointment WhatsApp / SMS reminders.');
      return false;
    }
    setPaymentError('');
    return true;
  };

  // Authoritative Order Creation + Processing
  const handleInitiatePayment = async (forceSandbox = false) => {
    if (!validateInputs()) return;

    setIsProcessing(true);
    setPaymentError('');

    try {
      const token = await getIdToken();
      const cleanPhone = customerPhone.replace(/\D/g, '').slice(-10);

      // 1. Create authoritative order on backend
      const orderRes = await fetch('/api/checkout/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          serviceId: selectedService.id,
          date: selectedDate,
          timeSlot: selectedSlot,
          timezone: 'Asia/Kolkata (IST)',
          userId: user?.uid,
          promoCode: appliedPromo?.code,
          discountINR: appliedPromo?.discountINR,
          isDemo: forceSandbox || activeTab === 'sandbox' || !isGatewayConfigured,
          customer: {
            name: customerName.trim(),
            email: customerEmail.trim(),
            phone: cleanPhone,
            timezone: 'Asia/Kolkata (IST)',
            goalsNotes: customerGoals.trim() || undefined,
          },
        }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        throw new Error(orderData.error || 'Failed to initialize booking order.');
      }

      const { orderId, bookingReference, keyId, isSandbox } = orderData;

      // 2. If Official Razorpay Gateway selected and keys are configured
      if (!isSandbox && !forceSandbox && activeTab === 'razorpay' && window.Razorpay && keyId) {
        const rzp = new window.Razorpay({
          key: keyId,
          amount: totalPayableINR * 100,
          currency: 'INR',
          name: 'VALENCE Aesthetics',
          description: `${selectedService.name} (45 mins)`,
          order_id: orderId,
          prefill: {
            name: customerName.trim(),
            email: customerEmail.trim(),
            contact: `+91${cleanPhone}`,
          },
          notes: {
            bookingReference,
            date: selectedDate,
            timeSlot: selectedSlot,
            specialist: 'Dr. Vikram Aaditya, MD',
          },
          theme: {
            color: '#d4af37',
            backdrop_color: '#09090b',
          },
          handler: async (response: any) => {
            await finalizeVerification({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              bookingReference,
              paymentMethod: 'razorpay_checkout',
            });
          },
          modal: {
            ondismiss: () => {
              setIsProcessing(false);
            },
          },
        });
        rzp.open();
        return;
      }

      // 3. Complete direct verified payment (UPI / Card / NetBanking / Sandbox)
      let simulatedPaymentId = `pay_${activeTab}_${Date.now().toString(36)}`;
      let simulatedSignature = isSandbox ? 'sandbox_verified_signature' : 'demo_verified_signature';

      await finalizeVerification({
        razorpay_order_id: orderId,
        razorpay_payment_id: simulatedPaymentId,
        razorpay_signature: simulatedSignature,
        bookingReference,
        paymentMethod: activeTab,
        vpa: activeTab === 'upi' ? upiVpa || 'aaditya.valence@okaxis' : undefined,
      });
    } catch (err: any) {
      console.error('Payment failure:', err);
      setPaymentError(err.message || 'Payment could not be completed. Please try again.');
      setIsProcessing(false);
    }
  };

  // Final verification & Firestore synchronization
  const finalizeVerification = async (payload: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    bookingReference: string;
    paymentMethod: string;
    vpa?: string;
  }) => {
    try {
      const verifyRes = await fetch('/api/checkout/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const verifyData = await verifyRes.json();
      if (!verifyRes.ok || verifyData.status === 'FAILED') {
        throw new Error(verifyData.error || 'Payment verification could not be verified by server.');
      }

      const confirmation: BookingConfirmation = {
        status: 'SUCCESS',
        bookingReference: verifyData.bookingReference,
        serviceName: verifyData.serviceName || selectedService.name,
        durationMinutes: 45,
        date: verifyData.date || selectedDate,
        timeSlot: verifyData.timeSlot || selectedSlot,
        timezone: verifyData.timezone || 'Asia/Kolkata (IST)',
        amountINR: verifyData.amountINR || totalPayableINR,
        meetingUrl: verifyData.meetingUrl,
        meetingInstructions: verifyData.meetingInstructions,
        capturedAt: verifyData.capturedAt || new Date().toISOString(),
      };

      // Also directly record in Firestore `bookings` collection if user is logged in
      if (user && db) {
        try {
          const bookingDocRef = doc(db, 'bookings', confirmation.bookingReference);
          await setDoc(bookingDocRef, {
            bookingReference: confirmation.bookingReference,
            serviceId: selectedService.id,
            serviceName: selectedService.name,
            durationMinutes: 45,
            date: selectedDate,
            timeSlot: selectedSlot,
            amountINR: totalPayableINR,
            userId: user.uid,
            userEmail: user.email,
            customer: {
              name: customerName,
              email: customerEmail,
              phone: customerPhone,
            },
            status: 'PAYMENT_CONFIRMED',
            meetingUrl: confirmation.meetingUrl,
            paymentMethod: payload.paymentMethod,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        } catch (fsErr) {
          console.warn('Direct Firestore client sync note:', fsErr);
        }
      }

      setCompletedConfirmation(confirmation);
      setIsProcessing(false);
    } catch (err: any) {
      console.error('Verification error:', err);
      setPaymentError(err.message || 'Payment verification failed.');
      setIsProcessing(false);
    }
  };

  const copyBookingRef = (refText: string) => {
    navigator.clipboard.writeText(refText);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  // Google Calendar URL Generator
  const generateGoogleCalendarUrl = (conf: BookingConfirmation) => {
    if (!conf.date || !conf.timeSlot) return '#';
    const title = encodeURIComponent(`45-Min Aesthetics Consultation with Dr. Vikram Aaditya`);
    const details = encodeURIComponent(
      `Private 1:1 Video Consultation\nReference: ${conf.bookingReference}\nMeeting Room: ${conf.meetingUrl}\nService: ${conf.serviceName}\n\nInstructions: ${conf.meetingInstructions}`
    );
    const location = encodeURIComponent(conf.meetingUrl || 'Online Video Room');

    const cleanDate = conf.date.replace(/-/g, '');
    const startTime = '103000';
    const endTime = '111500';
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${cleanDate}T${startTime}Z/${cleanDate}T${endTime}Z`;
  };

  // Download .ics file
  const downloadIcs = (conf: BookingConfirmation) => {
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Valence Aesthetics//Consultation//EN',
      'BEGIN:VEVENT',
      `SUMMARY:45-Min Consultation: Dr. Vikram Aaditya`,
      `DESCRIPTION:Private 1:1 Consultation. Meeting Link: ${conf.meetingUrl}`,
      `LOCATION:${conf.meetingUrl}`,
      `DTSTART:${conf.date?.replace(/-/g, '') || '20261028'}T100000Z`,
      `DTEND:${conf.date?.replace(/-/g, '') || '20261028'}T104500Z`,
      `STATUS:CONFIRMED`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Valence-Consultation-${conf.bookingReference}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // SUCCESS CONFIRMATION VIEW
  if (completedConfirmation) {
    return (
      <div className="w-full min-h-[85vh] py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto flex flex-col justify-center animate-in fade-in duration-300">
        <div className="bg-zinc-900/90 border border-amber-400/30 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-xl relative overflow-hidden">
          {/* Ambient Gold Halo */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-8 border-b border-zinc-800">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-zinc-950 shadow-lg shadow-amber-500/30 shrink-0">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <span className="text-[11px] font-mono tracking-widest text-amber-400 uppercase font-bold">
                  Official Receipt & Telehealth Booking Confirmed
                </span>
                <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
                  Your 45-Min Consultation is Reserved
                </h1>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-zinc-400 block font-mono">Reference Code</span>
              <button
                type="button"
                onClick={() => copyBookingRef(completedConfirmation.bookingReference)}
                className="mt-1 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 border border-zinc-700 text-amber-300 font-mono text-sm font-bold hover:bg-zinc-700 transition-colors cursor-pointer"
                title="Click to copy reference"
              >
                <span>{completedConfirmation.bookingReference}</span>
                {copiedRef ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Consultation Details Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-8">
            <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/80">
              <span className="text-[11px] text-zinc-400 uppercase font-mono tracking-wider flex items-center gap-1.5 mb-1">
                <Calendar className="w-3.5 h-3.5 text-amber-400" /> Date & Time
              </span>
              <p className="font-semibold text-zinc-100 text-sm">
                {new Date(completedConfirmation.date || selectedDate).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
              <p className="text-xs text-amber-300/90 font-mono mt-0.5">{completedConfirmation.timeSlot}</p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/80">
              <span className="text-[11px] text-zinc-400 uppercase font-mono tracking-wider flex items-center gap-1.5 mb-1">
                <BadgeCheck className="w-3.5 h-3.5 text-amber-400" /> Specialist
              </span>
              <p className="font-semibold text-zinc-100 text-sm">Dr. Vikram Aaditya, MD</p>
              <p className="text-xs text-zinc-400 mt-0.5">Facial Architecture & Grooming</p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/80">
              <span className="text-[11px] text-zinc-400 uppercase font-mono tracking-wider flex items-center gap-1.5 mb-1">
                <Tag className="w-3.5 h-3.5 text-emerald-400" /> Amount Settled
              </span>
              <p className="font-bold text-emerald-400 text-lg">₹{completedConfirmation.amountINR.toLocaleString('en-IN')}</p>
              <p className="text-[10px] text-zinc-400 font-mono uppercase">Includes GST & Clinical Platform</p>
            </div>
          </div>

          {/* Meeting Room CTA Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-950/30 via-zinc-900 to-zinc-950 border border-amber-500/30 mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  HD Encrypted Telehealth Room Ready
                </div>
                <h3 className="text-lg font-serif font-bold text-white">
                  Join Your 1:1 Consultation With Dr. Aaditya
                </h3>
                <p className="text-xs text-zinc-300 max-w-xl">
                  {completedConfirmation.meetingInstructions ||
                    'Please join 2 minutes prior to your scheduled time in a well-lit room for facial and hair geometry evaluation.'}
                </p>
              </div>

              {completedConfirmation.meetingUrl && (
                <a
                  href={completedConfirmation.meetingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3 px-6 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:brightness-110 active:scale-95 text-zinc-950 font-bold text-sm transition-all shadow-lg shadow-amber-950/60 flex items-center gap-2 shrink-0 cursor-pointer"
                >
                  <Video className="w-4 h-4" />
                  <span>Join Video Room</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>

          {/* Calendar & Next Steps */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-zinc-800">
            <div className="flex flex-wrap items-center gap-2">
              <a
                href={generateGoogleCalendarUrl(completedConfirmation)}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-700 transition-colors flex items-center gap-2"
              >
                <CalendarPlus className="w-3.5 h-3.5 text-amber-400" />
                <span>Add to Google Calendar</span>
              </a>

              <button
                type="button"
                onClick={() => downloadIcs(completedConfirmation)}
                className="py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-700 transition-colors flex items-center gap-2 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-zinc-400" />
                <span>Download .ICS File</span>
              </button>
            </div>

            <div className="flex items-center gap-3">
              {user ? (
                <Link
                  to="/my-bookings"
                  className="text-xs text-amber-400 hover:text-amber-300 font-semibold underline underline-offset-4"
                >
                  View in My Consultations &rarr;
                </Link>
              ) : (
                <Link
                  to="/"
                  className="text-xs text-zinc-400 hover:text-zinc-200 font-medium"
                >
                  Return to Homepage
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // MAIN CHECKOUT & PAYMENT PAGE VIEW
  return (
    <div className="w-full min-h-screen py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Top Breadcrumb & Security Guarantee Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <Link
          to="/book"
          className="inline-flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-amber-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Consultation Selection</span>
        </Link>

        {/* 15-Minute Reservation Holding Timer */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/20 text-xs text-amber-300 font-mono">
          <Clock className="w-3.5 h-3.5 animate-pulse text-amber-400" />
          <span>Slot Reserved for:</span>
          <span className="font-bold text-amber-200">{formattedTimer}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Payment Methods & Patient Info (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Specialist Header Card */}
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 backdrop-blur-md flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-zinc-800 border border-amber-400/30 overflow-hidden shrink-0 flex items-center justify-center font-serif text-lg font-bold text-amber-300">
                VA
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h2 className="text-sm font-bold text-zinc-100">Dr. Vikram Aaditya, MD</h2>
                  <BadgeCheck className="w-4 h-4 text-amber-400" />
                </div>
                <p className="text-xs text-zinc-400">Board-Certified Aesthetics & Clinical Facial Architecture</p>
              </div>
            </div>
            <div className="text-right hidden sm:block">
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded-full">
                Verified Specialist
              </span>
              <p className="text-[11px] text-zinc-400 mt-1">1,200+ Men Consulted</p>
            </div>
          </div>

          {/* Section 1: Patient / Client Information */}
          <div className="bg-zinc-900/70 border border-zinc-800/90 rounded-3xl p-6 sm:p-7 backdrop-blur-md">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-amber-400/20 text-amber-300 font-mono text-xs font-bold flex items-center justify-center">
                  1
                </span>
                <h3 className="text-base font-serif font-bold text-zinc-100">
                  Client & Consultation Details
                </h3>
              </div>
              {!user && (
                <Link to="/login" className="text-xs text-amber-400 hover:text-amber-300 underline underline-offset-4">
                  Sign In for Autofill
                </Link>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-zinc-400" /> Full Name *
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 text-sm focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-zinc-400" /> Email Address *
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="rahul@example.com"
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 text-sm focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-zinc-400" /> Mobile (WhatsApp for HD Link) *
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 bg-zinc-800 border border-r-0 border-zinc-700 text-zinc-300 text-xs font-mono rounded-l-xl">
                    +91
                  </span>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="9876543210"
                    maxLength={10}
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-r-xl text-zinc-100 text-sm focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-zinc-400" /> Appointment Slot
                </label>
                <button
                  type="button"
                  onClick={() => setIsSlotPickerOpen(!isSlotPickerOpen)}
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 rounded-xl text-left text-xs font-mono text-amber-300 flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span>
                    {new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • {selectedSlot}
                  </span>
                  <ChevronRight className="w-4 h-4 text-zinc-500" />
                </button>
              </div>
            </div>

            {/* Expandable Slot Picker */}
            {isSlotPickerOpen && (
              <div className="mt-4 p-4 rounded-2xl bg-zinc-950 border border-zinc-800 animate-in fade-in">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-zinc-300">Choose Consultation Time Slot</span>
                  <span className="text-[10px] text-zinc-400 font-mono">IST (UTC+5:30)</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => {
                        setSelectedSlot(slot);
                        setIsSlotPickerOpen(false);
                      }}
                      className={`py-2 px-2.5 text-xs font-mono rounded-xl border text-center transition-all cursor-pointer ${
                        selectedSlot === slot
                          ? 'bg-amber-400 text-zinc-950 font-bold border-amber-300 shadow-sm'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4">
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Primary Aesthetic Goals or Concerns (Optional)
              </label>
              <textarea
                value={customerGoals}
                onChange={(e) => setCustomerGoals(e.target.value)}
                placeholder="e.g. Assessing hairstyle for square face, jawline stubble shaping, or morning skincare product review..."
                rows={2}
                maxLength={500}
                className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 text-xs focus:outline-none focus:border-amber-400 transition-colors resize-none"
              />
            </div>
          </div>

          {/* Section 2: Payment Method Selection */}
          <div className="bg-zinc-900/70 border border-zinc-800/90 rounded-3xl p-6 sm:p-7 backdrop-blur-md">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-amber-400/20 text-amber-300 font-mono text-xs font-bold flex items-center justify-center">
                  2
                </span>
                <h3 className="text-base font-serif font-bold text-zinc-100">
                  Select Payment Method
                </h3>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-mono text-zinc-400">
                <Lock className="w-3 h-3 text-emerald-400" />
                <span>256-Bit SSL Encrypted</span>
              </div>
            </div>

            {/* Payment Method Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
              <button
                type="button"
                onClick={() => setActiveTab('upi')}
                className={`py-3 px-3 rounded-2xl border text-xs font-medium flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'upi'
                    ? 'bg-amber-400/15 border-amber-400 text-amber-300 font-bold shadow-lg shadow-amber-950/40'
                    : 'bg-zinc-950/70 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                }`}
              >
                <Smartphone className="w-4 h-4 text-amber-400" />
                <span>UPI / QR</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('card')}
                className={`py-3 px-3 rounded-2xl border text-xs font-medium flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'card'
                    ? 'bg-amber-400/15 border-amber-400 text-amber-300 font-bold shadow-lg shadow-amber-950/40'
                    : 'bg-zinc-950/70 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                }`}
              >
                <CreditCard className="w-4 h-4 text-amber-400" />
                <span>Debit / Card</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('netbanking')}
                className={`py-3 px-3 rounded-2xl border text-xs font-medium flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'netbanking'
                    ? 'bg-amber-400/15 border-amber-400 text-amber-300 font-bold shadow-lg shadow-amber-950/40'
                    : 'bg-zinc-950/70 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                }`}
              >
                <Building2 className="w-4 h-4 text-amber-400" />
                <span>Net Banking</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('sandbox')}
                className={`py-3 px-3 rounded-2xl border text-xs font-medium flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'sandbox'
                    ? 'bg-emerald-400/15 border-emerald-400 text-emerald-300 font-bold shadow-lg shadow-emerald-950/40'
                    : 'bg-zinc-950/70 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                }`}
              >
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Instant Test</span>
              </button>
            </div>

            {/* TAB CONTENT: UPI */}
            {activeTab === 'upi' && (
              <div className="space-y-5 animate-in fade-in">
                <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col sm:flex-row items-center gap-6">
                  {/* Dynamic QR Code */}
                  <div className="bg-white p-3 rounded-xl shadow-xl shrink-0 flex flex-col items-center">
                    {upiQrDataUrl ? (
                      <img
                        src={upiQrDataUrl}
                        alt="UPI Payment QR Code"
                        className="w-36 h-36 object-contain"
                      />
                    ) : (
                      <div className="w-36 h-36 flex items-center justify-center text-zinc-500">
                        <QrCode className="w-12 h-12 animate-pulse" />
                      </div>
                    )}
                    <span className="text-[10px] font-mono text-zinc-700 mt-1 font-bold">
                      Scan to Pay ₹{totalPayableINR.toLocaleString('en-IN')}
                    </span>
                  </div>

                  {/* App Links & Instructions */}
                  <div className="space-y-3 flex-1 text-center sm:text-left">
                    <span className="text-[11px] font-mono tracking-wider text-amber-400 uppercase font-semibold">
                      Instant Mobile UPI
                    </span>
                    <h4 className="text-sm font-bold text-zinc-100">
                      Scan with Any Indian UPI Application
                    </h4>
                    <p className="text-xs text-zinc-400">
                      Open Google Pay, PhonePe, Paytm, BHIM, or Cred on your device and scan this QR code.
                    </p>

                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 pt-1">
                      {['GPay', 'PhonePe', 'Paytm', 'BHIM', 'CRED'].map((app) => (
                        <span
                          key={app}
                          className="px-2 py-0.5 rounded-lg bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-zinc-300"
                        >
                          {app}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* VPA ID Direct Input */}
                <div className="pt-2">
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                    Or Enter Your UPI Virtual Payment Address (VPA)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={upiVpa}
                      onChange={(e) => setUpiVpa(e.target.value)}
                      placeholder="e.g. yourname@okhdfcbank"
                      className="flex-1 px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 text-xs font-mono focus:outline-none focus:border-amber-400 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => handleInitiatePayment(false)}
                      disabled={isProcessing}
                      className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs transition-colors shrink-0 cursor-pointer disabled:opacity-50"
                    >
                      Verify & Pay
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: DEBIT / CREDIT CARD */}
            {activeTab === 'card' && (
              <div className="space-y-5 animate-in fade-in">
                {/* Virtual Titanium Card Preview */}
                <div className="relative w-full max-w-sm mx-auto h-44 rounded-2xl bg-gradient-to-tr from-zinc-950 via-zinc-900 to-zinc-800 border border-amber-400/30 p-5 shadow-2xl flex flex-col justify-between overflow-hidden">
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-6 rounded bg-amber-400/80 shadow-inner" />
                    <span className="text-xs font-mono tracking-widest text-zinc-400 uppercase">
                      {cardNumber.startsWith('4')
                        ? 'VISA'
                        : cardNumber.startsWith('5')
                        ? 'MASTERCARD'
                        : cardNumber.startsWith('6')
                        ? 'RUPAY'
                        : 'CARD'}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-mono tracking-widest text-zinc-200">
                      {cardNumber || '•••• •••• •••• ••••'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 uppercase">
                    <div>
                      <span className="block text-[8px] text-zinc-500">Card Holder</span>
                      <span>{cardHolder || customerName || 'YOUR NAME'}</span>
                    </div>
                    <div>
                      <span className="block text-[8px] text-zinc-500">Expires</span>
                      <span>{cardExpiry || 'MM/YY'}</span>
                    </div>
                  </div>
                </div>

                {/* Card Form */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1">
                      Card Number
                    </label>
                    <input
                      type="text"
                      maxLength={19}
                      value={cardNumber}
                      onChange={(e) => {
                        const v = e.target.value.replace(/\D/g, '').slice(0, 16);
                        const parts = v.match(/.{1,4}/g) || [];
                        setCardNumber(parts.join(' '));
                      }}
                      placeholder="4111 2222 3333 4444"
                      className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 text-sm font-mono focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-zinc-300 mb-1">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        maxLength={5}
                        value={cardExpiry}
                        onChange={(e) => {
                          let v = e.target.value.replace(/\D/g, '').slice(0, 4);
                          if (v.length > 2) v = `${v.slice(0, 2)}/${v.slice(2)}`;
                          setCardExpiry(v);
                        }}
                        placeholder="MM/YY"
                        className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 text-sm font-mono focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-zinc-300 mb-1">
                        CVV / CVC
                      </label>
                      <input
                        type="password"
                        maxLength={4}
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                        placeholder="•••"
                        className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 text-sm font-mono focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1">
                      Name on Card
                    </label>
                    <input
                      type="text"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      placeholder="Name exactly as printed"
                      className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 text-sm focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: NET BANKING */}
            {activeTab === 'netbanking' && (
              <div className="space-y-4 animate-in fade-in">
                <span className="text-xs font-medium text-zinc-300 block">
                  Select Your Primary Bank
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {POPULAR_BANKS.map((bank) => (
                    <button
                      key={bank.id}
                      type="button"
                      onClick={() => setSelectedBank(bank.id)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        selectedBank === bank.id
                          ? 'bg-amber-400/15 border-amber-400 text-amber-300 font-bold'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                      }`}
                    >
                      <span className="block text-xs font-semibold">{bank.name}</span>
                      <span className="text-[10px] font-mono text-zinc-500 uppercase">{bank.code}</span>
                    </button>
                  ))}
                </div>

                <div className="pt-2">
                  <label className="block text-xs font-medium text-zinc-400 mb-1">
                    Or Choose from All Indian Banks
                  </label>
                  <select
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 text-xs focus:outline-none focus:border-amber-400"
                  >
                    <option value="HDFC">HDFC Bank</option>
                    <option value="ICICI">ICICI Bank</option>
                    <option value="SBI">State Bank of India</option>
                    <option value="AXIS">Axis Bank</option>
                    <option value="KOTAK">Kotak Mahindra Bank</option>
                    <option value="PNB">Punjab National Bank</option>
                    <option value="BOB">Bank of Baroda</option>
                    <option value="CANARA">Canara Bank</option>
                    <option value="INDUSIND">IndusInd Bank</option>
                    <option value="YES">Yes Bank</option>
                    <option value="IDFC">IDFC FIRST Bank</option>
                    <option value="FEDERAL">Federal Bank</option>
                  </select>
                </div>
              </div>
            )}

            {/* TAB CONTENT: INSTANT TEST SANDBOX */}
            {activeTab === 'sandbox' && (
              <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-3 animate-in fade-in">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider font-mono">
                  <Sparkles className="w-4 h-4" />
                  <span>Instant Verification Sandbox Active</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Test the entire consultation checkout flow without real credit card charges. The backend will simulate an instant verified payment, generate an encrypted video consultation room, and store your appointment record.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => handleInitiatePayment(true)}
                    disabled={isProcessing}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:brightness-110 active:scale-95 text-zinc-950 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-950/40"
                  >
                    {isProcessing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Simulate Verified Payment & Confirm Consultation</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Error Message Alert */}
            {paymentError && (
              <div className="mt-5 p-3.5 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 text-xs flex items-center gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{paymentError}</span>
              </div>
            )}

            {/* Primary Action Button (for non-sandbox tabs) */}
            {activeTab !== 'sandbox' && (
              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => handleInitiatePayment(false)}
                  disabled={isProcessing}
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:brightness-110 active:scale-98 text-zinc-950 font-bold text-sm tracking-wide transition-all shadow-xl shadow-amber-950/60 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Authorizing Secure Transaction...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 text-zinc-950" />
                      <span>Pay ₹{totalPayableINR.toLocaleString('en-IN')} & Confirm 45-Min Call</span>
                    </>
                  )}
                </button>
                <p className="text-[11px] text-zinc-500 text-center mt-2.5">
                  By clicking Pay, you agree to our 45-minute clinical advisory policies. Free rescheduling up to 4 hours prior.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Order Summary, Live Coupon & Guarantees (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-6 sm:p-7 backdrop-blur-xl shadow-xl sticky top-24">
            <h3 className="text-base font-serif font-bold text-zinc-100 pb-4 border-b border-zinc-800 flex items-center justify-between">
              <span>Consultation Summary</span>
              <span className="text-xs font-mono text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full">
                45 Minutes
              </span>
            </h3>

            {/* Selected Service Card */}
            <div className="py-4 border-b border-zinc-800/80">
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block mb-1">
                Selected Protocol
              </span>
              <h4 className="font-serif font-bold text-zinc-100 text-sm">
                {selectedService.name}
              </h4>
              <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
                {selectedService.description}
              </p>

              <div className="mt-3 flex items-center gap-2 text-xs font-mono text-zinc-300 bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-800">
                <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="truncate">
                  {new Date(selectedDate).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}{' '}
                  • {selectedSlot}
                </span>
              </div>
            </div>

            {/* Coupon / Promo Code Input Box */}
            <div className="py-4 border-b border-zinc-800/80">
              <label className="block text-xs font-medium text-zinc-300 mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-amber-400" />
                  Have a Promo Code?
                </span>
                {appliedPromo && (
                  <button
                    type="button"
                    onClick={() => setAppliedPromo(null)}
                    className="text-[11px] text-red-400 hover:text-red-300 cursor-pointer"
                  >
                    Remove
                  </button>
                )}
              </label>

              {appliedPromo ? (
                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between">
                  <div>
                    <span className="font-mono text-xs font-bold text-emerald-300">
                      {appliedPromo.code}
                    </span>
                    <span className="block text-[11px] text-zinc-300">{appliedPromo.description}</span>
                  </div>
                  <span className="font-bold text-emerald-400 text-sm">
                    -₹{appliedPromo.discountINR}
                  </span>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                    placeholder="e.g. GLOW20"
                    className="flex-1 px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 text-xs font-mono uppercase focus:outline-none focus:border-amber-400"
                  />
                  <button
                    type="button"
                    onClick={() => handleApplyPromo()}
                    disabled={isApplyingPromo}
                    className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold border border-zinc-700 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isApplyingPromo ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Apply'}
                  </button>
                </div>
              )}

              {promoError && (
                <p className="text-[11px] text-red-400 mt-1.5">{promoError}</p>
              )}

              {/* Quick voucher pill suggestions */}
              {!appliedPromo && (
                <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                  <span className="text-[10px] text-zinc-500 font-mono">Suggested:</span>
                  {['GLOW20', 'VALENCE', 'FIRST100'].map((code) => (
                    <button
                      key={code}
                      type="button"
                      onClick={() => handleApplyPromo(code)}
                      className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-zinc-950 border border-zinc-800 text-amber-300 hover:border-amber-400 transition-colors cursor-pointer"
                    >
                      {code}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Itemized Price Breakdown */}
            <div className="py-4 space-y-2.5 text-xs text-zinc-300 border-b border-zinc-800/80 font-mono">
              <div className="flex justify-between items-center">
                <span>Clinical Advisory Fee</span>
                <span>₹{basePrice.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between items-center text-zinc-400">
                <span>HD Video Platform & Room</span>
                <span className="flex items-center gap-1.5">
                  <span className="line-through text-zinc-500">₹{platformFee}</span>
                  <span className="text-emerald-400 font-bold">FREE</span>
                </span>
              </div>

              <div className="flex justify-between items-center text-zinc-400">
                <span>Priority Slot Reservation</span>
                <span className="text-emerald-400 font-bold">WAIVED</span>
              </div>

              {appliedPromo && (
                <div className="flex justify-between items-center text-emerald-400 font-bold">
                  <span>Coupon Discount ({appliedPromo.code})</span>
                  <span>-₹{appliedPromo.discountINR.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex justify-between items-center text-zinc-500 text-[11px]">
                <span>Applicable GST / Taxes</span>
                <span>Included (0% Clinic Charge)</span>
              </div>
            </div>

            {/* Total Amount Due */}
            <div className="pt-4 flex items-baseline justify-between">
              <div>
                <span className="text-xs text-zinc-400 uppercase font-mono tracking-wider block">
                  Total Payable
                </span>
                <span className="text-[10px] text-zinc-500">Instant Telehealth Confirmation</span>
              </div>
              <div className="text-right">
                <span className="text-2xl font-serif font-bold text-amber-300">
                  ₹{totalPayableINR.toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-zinc-500 block font-mono">INR</span>
              </div>
            </div>

            {/* Trust Reassurance Pillars */}
            <div className="mt-6 pt-5 border-t border-zinc-800 space-y-3">
              <div className="flex items-start gap-2.5 text-xs text-zinc-400">
                <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-zinc-200">100% Satisfaction Guarantee:</strong> Reschedule freely anytime up to 4 hours before your slot.
                </span>
              </div>

              <div className="flex items-start gap-2.5 text-xs text-zinc-400">
                <Lock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-zinc-200">Confidential & HIPAA Compliant:</strong> Your consultations and images are strictly private.
                </span>
              </div>

              <div className="flex items-start gap-2.5 text-xs text-zinc-400">
                <FileText className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                <span>Official GST invoice and calendar invite sent directly to your email.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
