import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Globe,
  Lock,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Sparkles,
  User,
  Mail,
  Phone,
  MessageSquare,
  CheckCircle2,
  CalendarCheck,
} from 'lucide-react';
import { ServiceItem, SlotItem, CustomerFormData, BookingConfirmation } from '../types';
import { useRazorpayScript } from '../hooks/useRazorpay';
import { useAuth } from '../context/AuthContext';

interface BookingSectionProps {
  services: ServiceItem[];
  onPaymentSuccess: (confirmation: BookingConfirmation) => void;
  onPaymentFailure: (errorMessage: string) => void;
  onOpenSetupGuide: () => void;
  isGatewayConfigured?: boolean;
}

export const BookingSection: React.FC<BookingSectionProps> = ({
  services,
  onPaymentSuccess,
  onPaymentFailure,
  onOpenSetupGuide,
  isGatewayConfigured = true,
}) => {
  const { isLoaded: isScriptLoaded, hasError: scriptError } = useRazorpayScript();
  const { user, getIdToken } = useAuth();

  // Selected Service
  const [selectedServiceId, setSelectedServiceId] = useState<string>(
    services[0]?.id || 'complete-45'
  );

  // Generate 14 upcoming dates (preventing any past date)
  const availableDates = React.useMemo(() => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const iso = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const monthName = d.toLocaleDateString('en-US', { month: 'short' });
      const dayNum = d.getDate();
      dates.push({
        iso,
        dayName,
        monthName,
        dayNum,
        isToday: i === 0,
        formatted: `${dayName}, ${monthName} ${dayNum}`,
      });
    }
    return dates;
  }, []);

  const [selectedDate, setSelectedDate] = useState<string>(availableDates[0]?.iso || '');
  const [slots, setSlots] = useState<SlotItem[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [loadingSlots, setLoadingSlots] = useState<boolean>(false);
  const [slotError, setSlotError] = useState<string>('');

  // Timezone auto-detection
  const [userTimezone, setUserTimezone] = useState<string>(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata (IST)';
    } catch {
      return 'Asia/Kolkata (IST)';
    }
  });

  // Customer Form Data
  const [formData, setFormData] = useState<CustomerFormData>({
    name: '',
    email: '',
    phone: '',
    timezone: userTimezone,
    goalsNotes: '',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [checkoutStatus, setCheckoutStatus] = useState<
    'IDLE' | 'INITIATING' | 'OPENED' | 'VERIFYING'
  >('IDLE');
  const [checkoutError, setCheckoutError] = useState<string>('');
  const [gatewayMissing, setGatewayMissing] = useState<boolean>(false);

  // Auto-prefill authenticated user profile if logged in
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: prev.name || user.displayName || '',
        email: prev.email || user.email || '',
        phone: prev.phone || user.phoneNumber || '',
      }));
    }
  }, [user]);

  // Fetch slot availability from server whenever selectedDate changes
  useEffect(() => {
    if (!selectedDate) return;

    let isMounted = true;
    setLoadingSlots(true);
    setSlotError('');

    fetch(`/api/checkout/slots?date=${selectedDate}`)
      .then((res) => {
        if (!res.ok) throw new Error('Could not load slots for this date');
        return res.json();
      })
      .then((data) => {
        if (!isMounted) return;
        setSlots(data.slots || []);
        // Automatically select the first available slot if previous is not available
        const firstAvail = data.slots?.find((s: SlotItem) => s.available);
        if (firstAvail) {
          setSelectedSlot((prev) => {
            const stillValid = data.slots?.find((s: SlotItem) => s.timeSlot === prev && s.available);
            return stillValid ? prev : firstAvail.timeSlot;
          });
        } else {
          setSelectedSlot('');
        }
      })
      .catch((err) => {
        if (isMounted) setSlotError(err.message || 'Failed to fetch slots.');
      })
      .finally(() => {
        if (isMounted) setLoadingSlots(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedDate]);

  const selectedService =
    services.find((s) => s.id === selectedServiceId) || services[0] || null;

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      errs.name = 'Full name is required (minimum 2 characters)';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = 'Valid email address is required';
    }
    const cleanPhone = formData.phone.replace(/\D/g, '');
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      errs.phone = 'Valid 10-digit Indian mobile number required (for UPI & SMS confirmation)';
    }
    if (!selectedSlot) {
      errs.slot = 'Please select an available 45-minute time slot';
    }
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (!selectedService) return;

    if (!isScriptLoaded) {
      setCheckoutError(
        scriptError
          ? 'Failed to load Razorpay payment library. Check your network.'
          : 'Payment gateway script is loading, please retry in a moment.'
      );
      return;
    }

    setCheckoutStatus('INITIATING');
    setCheckoutError('');
    setGatewayMissing(false);

    try {
      // 1. Submit slot reservation and customer details to backend with auth association
      const token = await getIdToken();
      const res = await fetch('/api/checkout/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          serviceId: selectedService.id,
          date: selectedDate,
          timeSlot: selectedSlot,
          timezone: userTimezone,
          userId: user?.uid,
          customer: {
            name: formData.name.trim(),
            email: formData.email.trim(),
            phone: formData.phone.replace(/\D/g, ''),
            timezone: userTimezone,
            goalsNotes: formData.goalsNotes?.trim() || undefined,
          },
        }),
      });

      const orderData = await res.json();

      if (!res.ok) {
        if (orderData.code === 'GATEWAY_NOT_CONFIGURED') {
          setGatewayMissing(true);
        }
        if (orderData.code === 'SLOT_UNAVAILABLE') {
          // Refresh slots to show updated state
          setSlotError('This slot was just reserved by another visitor. Please select a different slot.');
        }
        throw new Error(orderData.error || 'Failed to initialize booking order.');
      }

      // 2. Open official Razorpay Checkout with 15-minute temporary reservation
      setCheckoutStatus('OPENED');

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'VALENCE Aesthetics',
        description: `${selectedService.name} (45 mins)`,
        order_id: orderData.orderId,
        prefill: {
          name: formData.name.trim(),
          email: formData.email.trim(),
          contact: `+91${formData.phone.replace(/\D/g, '')}`,
        },
        notes: {
          bookingReference: orderData.bookingReference,
          date: selectedDate,
          timeSlot: selectedSlot,
          duration: '45 mins',
        },
        theme: {
          color: '#d4af37', // Refined champagne gold
          backdrop_color: '#09090b',
        },
        modal: {
          backdropclose: false,
          escape: true,
          handleback: true,
          confirm_close: true,
          ondismiss: () => {
            setCheckoutStatus('IDLE');
          },
        },
        handler: async (paymentResponse: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          // 3. Cryptographic Signature Verification on backend
          setCheckoutStatus('VERIFYING');

          try {
            const verifyRes = await fetch('/api/checkout/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: paymentResponse.razorpay_order_id,
                razorpay_payment_id: paymentResponse.razorpay_payment_id,
                razorpay_signature: paymentResponse.razorpay_signature,
                bookingReference: orderData.bookingReference,
              }),
            });

            const verifyResult = await verifyRes.json();

            if (verifyRes.ok && verifyResult.status === 'SUCCESS') {
              onPaymentSuccess({
                status: 'SUCCESS',
                bookingReference: verifyResult.bookingReference,
                serviceName: verifyResult.serviceName,
                durationMinutes: 45,
                date: verifyResult.date,
                timeSlot: verifyResult.timeSlot,
                timezone: verifyResult.timezone,
                amountINR: verifyResult.amountINR,
                meetingUrl: verifyResult.meetingUrl,
                meetingInstructions: verifyResult.meetingInstructions,
                capturedAt: verifyResult.capturedAt,
              });
            } else if (verifyResult.status === 'PENDING') {
              onPaymentSuccess({
                status: 'PENDING',
                bookingReference: verifyResult.bookingReference,
                serviceName: selectedService.name,
                durationMinutes: 45,
                date: selectedDate,
                timeSlot: selectedSlot,
                timezone: userTimezone,
                amountINR: selectedService.basePriceINR,
                isPending: true,
                message: verifyResult.message,
              });
            } else {
              throw new Error(verifyResult.error || 'Payment signature verification failed.');
            }
          } catch (err: any) {
            console.error('Verification error:', err);
            onPaymentFailure(
              err.message ||
                'Authoritative payment verification failed. Please contact support before retrying.'
            );
          }
        },
      };

      const rzpInstance = new window.Razorpay(options);

      rzpInstance.on('payment.failed', (failResp: any) => {
        setCheckoutStatus('IDLE');
        setCheckoutError(failResp?.error?.description || 'Payment was declined by bank or cancelled.');
      });

      rzpInstance.open();
    } catch (err: any) {
      setCheckoutStatus('IDLE');
      setCheckoutError(err.message || 'Unable to connect to booking service.');
    }
  };

  const isWorking = checkoutStatus === 'INITIATING' || checkoutStatus === 'VERIFYING';

  return (
    <section id="booking" className="w-full py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      <div className="text-center max-w-3xl mx-auto mb-14">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/40 border border-amber-800/40 text-amber-300 text-xs font-mono uppercase mb-3">
          <CalendarCheck className="w-3.5 h-3.5 text-amber-400" />
          <span>RESERVE YOUR 45-MINUTE VIDEO SESSION</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
          Select Your Consultation &amp; Time
        </h2>
        <p className="text-sm text-zinc-400 leading-relaxed">
          Choose a 45-minute consultation tier, select your date, pick an open slot, and secure your session with encrypted UPI or card checkout.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Service Selector & Date / Time Slot Picker (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Step 1: Consultation Service Tier */}
          <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-amber-400 tracking-wider uppercase font-mono">
                STEP 1 &bull; SELECT CONSULTATION
              </span>
              <span className="text-[11px] text-zinc-400 flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-400" />
                <span>Strictly 45 mins</span>
              </span>
            </div>

            <div className="space-y-3">
              {services.map((item) => {
                const isSelected = selectedServiceId === item.id;
                return (
                  <label
                    key={item.id}
                    className={`block p-4 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-amber-500/80 bg-amber-950/20 shadow-lg shadow-amber-950/20'
                        : 'border-zinc-800 bg-zinc-950/40 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          name="consultation-tier"
                          value={item.id}
                          checked={isSelected}
                          onChange={() => setSelectedServiceId(item.id)}
                          className="mt-1 text-amber-500 focus:ring-amber-500 bg-zinc-900 border-zinc-700"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white">{item.name}</span>
                            {item.badge && (
                              <span className="text-[10px] font-semibold text-amber-300 bg-amber-950/80 border border-amber-800/40 px-2 py-0.5 rounded-full">
                                {item.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                            {item.description}
                          </p>
                          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-[11px] text-zinc-300">
                            {item.features?.slice(0, 3).map((feat, fIdx) => (
                              <span key={fIdx} className="flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-amber-400 flex-shrink-0" />
                                <span>{feat}</span>
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <span className="text-base font-extrabold text-amber-400 font-mono">
                          ₹{item.basePriceINR.toLocaleString('en-IN')}
                        </span>
                        <span className="block text-[10px] text-zinc-500 uppercase font-mono">INR</span>
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Step 2: Date Selector (14 upcoming days) */}
          <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-amber-400 tracking-wider uppercase font-mono">
                STEP 2 &bull; CHOOSE DATE
              </span>
              <span className="text-[11px] text-zinc-400">Next 14 Days Available</span>
            </div>

            {/* Horizontal Date Picker Carousel */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
              {availableDates.map((d) => {
                const isSelected = selectedDate === d.iso;
                return (
                  <button
                    key={d.iso}
                    type="button"
                    onClick={() => setSelectedDate(d.iso)}
                    className={`flex-shrink-0 w-16 py-3 px-2 rounded-xl border text-center transition-all ${
                      isSelected
                        ? 'border-amber-400 bg-amber-500 text-zinc-950 shadow-md shadow-amber-950/50'
                        : 'border-zinc-800 bg-zinc-950/60 hover:border-zinc-700 text-zinc-300'
                    }`}
                  >
                    <span className={`block text-[10px] font-semibold uppercase ${isSelected ? 'text-zinc-950 font-bold' : 'text-zinc-500'}`}>
                      {d.dayName}
                    </span>
                    <span className={`block text-lg font-extrabold my-0.5 ${isSelected ? 'text-zinc-950' : 'text-zinc-100'}`}>
                      {d.dayNum}
                    </span>
                    <span className={`block text-[10px] uppercase font-mono ${isSelected ? 'text-zinc-900' : 'text-zinc-500'}`}>
                      {d.monthName}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 3: 45-Minute Time Slot Grid */}
          <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-amber-400 tracking-wider uppercase font-mono">
                STEP 3 &bull; SELECT 45-MINUTE TIME SLOT
              </span>
              <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
                <Globe className="w-3.5 h-3.5 text-amber-400" />
                <span>{userTimezone}</span>
              </div>
            </div>

            {slotError && (
              <div className="p-3 mb-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{slotError}</span>
              </div>
            )}

            {loadingSlots ? (
              <div className="py-8 flex flex-col items-center justify-center text-zinc-400 text-xs gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-amber-400" />
                <span>Checking live slot ledger...</span>
              </div>
            ) : slots.length === 0 ? (
              <p className="text-xs text-zinc-500 py-4 text-center">
                No slots configured for this date.
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {slots.map((s) => {
                  const isSelected = selectedSlot === s.timeSlot;
                  const isAvailable = s.available;

                  return (
                    <button
                      key={s.timeSlot}
                      type="button"
                      disabled={!isAvailable}
                      onClick={() => setSelectedSlot(s.timeSlot)}
                      className={`py-3 px-3 rounded-xl border text-center transition-all ${
                        isSelected
                          ? 'border-amber-400 bg-amber-950/40 text-amber-300 font-bold shadow-md'
                          : isAvailable
                          ? 'border-zinc-800 bg-zinc-950/50 hover:border-zinc-700 text-zinc-200'
                          : 'border-zinc-900 bg-zinc-900/30 text-zinc-600 cursor-not-allowed opacity-50'
                      }`}
                    >
                      <span className="block text-xs font-mono font-medium">{s.timeSlot}</span>
                      <span className="block text-[10px] mt-0.5">
                        {s.status === 'AVAILABLE'
                          ? 'Open (45m)'
                          : s.status === 'RESERVED'
                          ? 'Pending Hold'
                          : 'Booked'}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
            {formErrors.slot && (
              <span className="text-[11px] text-rose-400 mt-2 block font-medium">
                {formErrors.slot}
              </span>
            )}
          </div>
        </div>

        {/* Right Column: Customer Details, Order Summary & Checkout (5 cols) */}
        <div className="lg:col-span-5">
          <div className="bg-zinc-900/85 border border-zinc-800 rounded-2xl p-6 shadow-2xl sticky top-24">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-5">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-950/60 border border-amber-800/40 text-amber-400">
                  <Lock className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-white text-sm">Appointment Checkout</h3>
              </div>
              <span className="text-xs text-amber-400 font-bold font-mono">
                ₹{selectedService?.basePriceINR.toLocaleString('en-IN')} INR
              </span>
            </div>

            {/* Gateway Missing Notice */}
            {gatewayMissing && (
              <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs space-y-1.5">
                <div className="font-semibold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" />
                  <span>Razorpay API Keys Needed</span>
                </div>
                <p className="text-[11px] text-zinc-300">
                  To test live or sandbox booking payments, add your test keys in AI Studio Secrets.
                </p>
                <button
                  type="button"
                  onClick={onOpenSetupGuide}
                  className="text-amber-300 underline font-semibold text-[11px] hover:text-white"
                >
                  Configure Gateway Keys &rarr;
                </button>
              </div>
            )}

            {/* Checkout Error */}
            {checkoutError && !gatewayMissing && (
              <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{checkoutError}</span>
              </div>
            )}

            {/* Customer Information Form */}
            <form onSubmit={handleCheckout} className="space-y-3.5 text-left text-xs">
              <div>
                <label className="block text-zinc-300 mb-1 font-medium">
                  Your Full Name <span className="text-amber-400">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-zinc-500">
                    <User className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="text"
                    required
                    disabled={isWorking}
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      if (formErrors.name) setFormErrors({ ...formErrors, name: '' });
                    }}
                    placeholder="e.g. Vikramaditya Rathore"
                    className={`w-full bg-zinc-950 border rounded-lg pl-9 pr-3 py-2 text-white focus:outline-none transition-colors ${
                      formErrors.name ? 'border-rose-500' : 'border-zinc-700 focus:border-amber-400'
                    }`}
                  />
                </div>
                {formErrors.name && (
                  <span className="text-[11px] text-rose-400 mt-1 block">{formErrors.name}</span>
                )}
              </div>

              <div>
                <label className="block text-zinc-300 mb-1 font-medium">
                  Email Address <span className="text-amber-400">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-zinc-500">
                    <Mail className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="email"
                    required
                    disabled={isWorking}
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      if (formErrors.email) setFormErrors({ ...formErrors, email: '' });
                    }}
                    placeholder="vikram@example.com"
                    className={`w-full bg-zinc-950 border rounded-lg pl-9 pr-3 py-2 text-white focus:outline-none transition-colors ${
                      formErrors.email ? 'border-rose-500' : 'border-zinc-700 focus:border-amber-400'
                    }`}
                  />
                </div>
                {formErrors.email && (
                  <span className="text-[11px] text-rose-400 mt-1 block">{formErrors.email}</span>
                )}
              </div>

              <div>
                <label className="block text-zinc-300 mb-1 font-medium">
                  Indian Mobile Number (UPI / SMS) <span className="text-amber-400">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-zinc-500 font-mono text-[11px]">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    disabled={isWorking}
                    value={formData.phone}
                    onChange={(e) => {
                      const clean = e.target.value.replace(/\D/g, '');
                      setFormData({ ...formData, phone: clean });
                      if (formErrors.phone) setFormErrors({ ...formErrors, phone: '' });
                    }}
                    placeholder="9876543210"
                    className={`w-full bg-zinc-950 border rounded-lg pl-10 pr-3 py-2 text-white font-mono focus:outline-none transition-colors ${
                      formErrors.phone ? 'border-rose-500' : 'border-zinc-700 focus:border-amber-400'
                    }`}
                  />
                </div>
                {formErrors.phone && (
                  <span className="text-[11px] text-rose-400 mt-1 block">{formErrors.phone}</span>
                )}
              </div>

              <div>
                <label className="block text-zinc-300 mb-1 font-medium">
                  Goals &amp; Focus Context (Optional)
                </label>
                <textarea
                  rows={2}
                  disabled={isWorking}
                  value={formData.goalsNotes}
                  onChange={(e) => setFormData({ ...formData, goalsNotes: e.target.value })}
                  placeholder="e.g. Haircut recommendations for thin texture, beard framing, daily routine..."
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Pre-checkout Review Box */}
              <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Service:</span>
                  <span className="text-zinc-200 font-medium truncate max-w-[200px]">
                    {selectedService?.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Duration:</span>
                  <span className="text-amber-400 font-semibold font-mono">Exactly 45 Minutes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Date:</span>
                  <span className="text-zinc-200 font-medium">{selectedDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Time Slot:</span>
                  <span className="text-zinc-200 font-mono font-medium">
                    {selectedSlot || 'Not yet selected'}
                  </span>
                </div>
                <div className="flex justify-between pt-1 border-t border-zinc-800">
                  <span className="text-zinc-400 font-semibold">Total Payable:</span>
                  <span className="text-amber-400 font-bold font-mono text-xs">
                    ₹{selectedService?.basePriceINR.toLocaleString('en-IN')} INR
                  </span>
                </div>
              </div>

              {/* Concurrency and Reservation Guarantee */}
              <div className="text-[11px] text-zinc-500 leading-tight">
                * Initiating checkout holds this 45-minute slot for 15 minutes to prevent double-booking. If unpaid, the reservation automatically releases.
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isWorking}
                className="w-full py-4 px-4 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:brightness-105 active:scale-95 disabled:bg-zinc-800 disabled:text-zinc-600 font-bold text-zinc-950 text-sm flex items-center justify-center gap-2 transition-all shadow-xl shadow-amber-950/40 cursor-pointer"
              >
                {isWorking ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-zinc-950" />
                    <span>
                      {checkoutStatus === 'INITIATING'
                        ? 'Holding Slot & Creating Order...'
                        : 'Verifying Cryptographic Signature...'}
                    </span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Pay ₹{selectedService?.basePriceINR} &amp; Confirm 45m Call</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-zinc-500">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Instant UPI (GPay, PhonePe, Paytm, BHIM) &bull; PCI-DSS 256-bit</span>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};
