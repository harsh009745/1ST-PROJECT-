import React, { useState } from 'react';
import { X, Lock, AlertCircle, Loader2, KeyRound, ExternalLink, HelpCircle } from 'lucide-react';
import { ServiceItem, CustomerFormData, PaymentStatus, BookingConfirmation } from '../types';
import { useRazorpayScript } from '../hooks/useRazorpay';
import { PROFILE_CONFIG } from '../config/profileConfig';

interface PaymentModalProps {
  service: ServiceItem;
  amountINR: number;
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: (confirmation: BookingConfirmation) => void;
  onPaymentFailure: (errorMsg: string) => void;
  onOpenSetupGuide: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  service,
  amountINR,
  isOpen,
  onClose,
  onPaymentSuccess,
  onPaymentFailure,
  onOpenSetupGuide,
}) => {
  const { isLoaded: isScriptLoaded, hasError: scriptError } = useRazorpayScript();

  const [formData, setFormData] = useState<CustomerFormData>({
    name: '',
    email: '',
    phone: '',
    notes: '',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<PaymentStatus>('IDLE');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [gatewayMissing, setGatewayMissing] = useState<boolean>(false);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    const trimmedName = formData.name.trim();

    if (!trimmedName || trimmedName.length < 2) {
      errors.name = 'Please enter your full name (minimum 2 characters)';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      errors.email = 'Please provide a valid email address';
    }

    const cleanedPhone = formData.phone.replace(/\D/g, '');
    if (!/^[6-9]\d{9}$/.test(cleanedPhone)) {
      errors.phone = 'Please provide a valid 10-digit Indian mobile number (e.g. 9876543210)';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (!isScriptLoaded) {
      setErrorMessage(
        scriptError
          ? 'Failed to load Razorpay Checkout script. Check your network connection.'
          : 'Payment gateway SDK is still loading, please retry in 2 seconds.'
      );
      return;
    }

    setStatus('INITIATING_ORDER');
    setErrorMessage('');
    setGatewayMissing(false);

    try {
      // 1. Submit selected service and amount to backend
      const response = await fetch('/api/checkout/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: service.id,
          customAmountINR: service.isCustomAmountAllowed ? amountINR : undefined,
          customer: {
            name: formData.name.trim(),
            email: formData.email.trim(),
            phone: formData.phone.replace(/\D/g, ''),
            notes: formData.notes?.trim() || undefined,
          },
        }),
      });

      const orderData = await response.json();

      if (!response.ok) {
        if (orderData.code === 'GATEWAY_NOT_CONFIGURED') {
          setGatewayMissing(true);
        }
        throw new Error(orderData.error || 'Failed to create payment order on server.');
      }

      // 2. Open official Razorpay Standard Checkout
      setStatus('CHECKOUT_OPEN');

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: PROFILE_CONFIG.name,
        description: service.name,
        order_id: orderData.orderId,
        prefill: {
          name: formData.name.trim(),
          email: formData.email.trim(),
          contact: `+91${formData.phone.replace(/\D/g, '')}`,
        },
        notes: {
          bookingReference: orderData.bookingReference,
        },
        theme: {
          color: '#10B981', // Emerald-500
          backdrop_color: '#09090b',
        },
        modal: {
          backdropclose: false,
          escape: true,
          handleback: true,
          confirm_close: true,
          ondismiss: () => {
            // User cancelled/closed without completing payment
            setStatus('IDLE');
          },
        },
        handler: async (paymentResponse: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          // 3. Signature received from client - now send to server for cryptographic verification
          setStatus('VERIFYING_PAYMENT');

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
              setStatus('PAYMENT_CONFIRMED');
              onPaymentSuccess({
                status: 'SUCCESS',
                bookingReference: verifyResult.bookingReference,
                serviceName: verifyResult.serviceName || service.name,
                amountINR: verifyResult.amountINR || amountINR,
                capturedAt: verifyResult.capturedAt,
              });
            } else if (verifyResult.status === 'PENDING') {
              setStatus('PAYMENT_PENDING');
              onPaymentSuccess({
                status: 'PENDING',
                bookingReference: verifyResult.bookingReference,
                serviceName: service.name,
                amountINR,
                isPending: true,
                message: verifyResult.message,
              });
            } else {
              throw new Error(verifyResult.error || 'Payment signature verification failed.');
            }
          } catch (err: any) {
            console.error('Verification error:', err);
            setStatus('PAYMENT_FAILED');
            onPaymentFailure(
              err.message ||
                'Server was unable to authoritatively verify payment signature. Please contact support before retrying.'
            );
          }
        },
      };

      const rzpInstance = new window.Razorpay(options);

      rzpInstance.on('payment.failed', (failResp: any) => {
        console.error('Payment failed at provider:', failResp);
        setStatus('PAYMENT_FAILED');
        setErrorMessage(
          failResp?.error?.description || 'Payment was declined or cancelled at UPI / Bank portal.'
        );
      });

      rzpInstance.open();
    } catch (err: any) {
      console.error('Checkout error:', err);
      setStatus('IDLE');
      setErrorMessage(err.message || 'An unexpected error occurred while communicating with backend.');
    }
  };

  const isWorking = status === 'INITIATING_ORDER' || status === 'VERIFYING_PAYMENT';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="payment-modal-title"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
    >
      <div className="bg-zinc-900 border border-zinc-800 w-full max-w-lg rounded-t-2xl sm:rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 bg-zinc-950/60">
          <div className="text-left">
            <h3 id="payment-modal-title" className="font-semibold text-zinc-100 text-sm">
              {service.name}
            </h3>
            <span className="text-emerald-400 font-bold text-base font-mono">
              ₹{amountINR.toLocaleString('en-IN')}{' '}
              <span className="text-xs text-zinc-400 font-sans font-normal">INR</span>
            </span>
          </div>

          <button
            onClick={onClose}
            disabled={isWorking}
            aria-label="Close checkout modal"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Missing Gateway Notice */}
          {gatewayMissing && (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs space-y-2">
              <div className="flex items-center gap-2 font-semibold">
                <KeyRound className="w-4 h-4 text-amber-400" />
                <span>Razorpay API Keys Required</span>
              </div>
              <p className="text-zinc-300">
                To test real or sandbox UPI payments, configure your test keys (<code>RAZORPAY_KEY_ID</code> and{' '}
                <code>RAZORPAY_KEY_SECRET</code>) in AI Studio Secrets or environment variables.
              </p>
              <button
                type="button"
                onClick={onOpenSetupGuide}
                className="inline-flex items-center gap-1.5 text-amber-300 underline font-medium hover:text-amber-200"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>View Quick Gateway Setup Guide</span>
              </button>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && !gatewayMissing && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5 text-left">
            <div>
              <label htmlFor="customer-name" className="block text-xs font-medium text-zinc-300 mb-1">
                Your Full Name <span className="text-emerald-400">*</span>
              </label>
              <input
                id="customer-name"
                type="text"
                required
                disabled={isWorking}
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  if (formErrors.name) setFormErrors({ ...formErrors, name: '' });
                }}
                placeholder="e.g. Rahul Sharma"
                className={`w-full bg-zinc-950 border rounded-lg px-3 py-2 text-sm text-white focus:outline-none transition-colors ${
                  formErrors.name ? 'border-rose-500' : 'border-zinc-700 focus:border-emerald-500'
                }`}
              />
              {formErrors.name && <span className="text-[11px] text-rose-400 mt-1 block">{formErrors.name}</span>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="customer-email" className="block text-xs font-medium text-zinc-300 mb-1">
                  Email Address <span className="text-emerald-400">*</span>
                </label>
                <input
                  id="customer-email"
                  type="email"
                  required
                  disabled={isWorking}
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    if (formErrors.email) setFormErrors({ ...formErrors, email: '' });
                  }}
                  placeholder="rahul@example.com"
                  className={`w-full bg-zinc-950 border rounded-lg px-3 py-2 text-sm text-white focus:outline-none transition-colors ${
                    formErrors.email ? 'border-rose-500' : 'border-zinc-700 focus:border-emerald-500'
                  }`}
                />
                {formErrors.email && <span className="text-[11px] text-rose-400 mt-1 block">{formErrors.email}</span>}
              </div>

              <div>
                <label htmlFor="customer-phone" className="block text-xs font-medium text-zinc-300 mb-1">
                  Indian Mobile (for UPI) <span className="text-emerald-400">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-zinc-500 text-xs font-mono">+91</span>
                  <input
                    id="customer-phone"
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
                    className={`w-full bg-zinc-950 border rounded-lg pl-10 pr-3 py-2 text-sm text-white font-mono focus:outline-none transition-colors ${
                      formErrors.phone ? 'border-rose-500' : 'border-zinc-700 focus:border-emerald-500'
                    }`}
                  />
                </div>
                {formErrors.phone && <span className="text-[11px] text-rose-400 mt-1 block">{formErrors.phone}</span>}
              </div>
            </div>

            <div>
              <label htmlFor="customer-notes" className="block text-xs font-medium text-zinc-300 mb-1">
                Project Notes / Questions (Optional)
              </label>
              <textarea
                id="customer-notes"
                rows={2}
                disabled={isWorking}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Briefly describe what you'd like to consult on..."
                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Security Guarantee */}
            <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-800 text-[11px] text-zinc-400 space-y-1">
              <div className="flex items-center gap-1.5 font-medium text-zinc-200">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Zero Direct Credential Storage</span>
              </div>
              <p>
                We do not collect or store UPI PINs, bank passwords, or card numbers. All payments are handled on Razorpay's PCI-DSS Level 1 certified gateway.
              </p>
            </div>

            {/* Action Button */}
            <button
              type="submit"
              disabled={isWorking}
              className="w-full py-3.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-800 disabled:text-zinc-600 font-semibold text-zinc-950 text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-950 cursor-pointer"
            >
              {isWorking ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-zinc-950" />
                  <span>
                    {status === 'INITIATING_ORDER'
                      ? 'Creating Razorpay Order...'
                      : 'Verifying Cryptographic Signature...'}
                  </span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Pay ₹{amountINR.toLocaleString('en-IN')} via UPI / Gateway</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
