import React, { useState } from 'react';
import { CalendarCheck, ShieldCheck, ChevronRight, Zap, Info, Clock, Check } from 'lucide-react';
import { ServiceItem } from '../types';

interface ServiceBookingProps {
  services: ServiceItem[];
  onSelectService: (service: ServiceItem, customAmount?: number) => void;
  isGatewayConfigured?: boolean;
}

export const ServiceBooking: React.FC<ServiceBookingProps> = ({
  services,
  onSelectService,
  isGatewayConfigured = true,
}) => {
  const [selectedId, setSelectedId] = useState<string>(() => (services[0] ? services[0].id : ''));
  const [customVal, setCustomVal] = useState<string>('500');
  const [customError, setCustomError] = useState<string>('');

  const currentService = services.find((s) => s.id === selectedId) || services[0];

  const handleCustomChange = (val: string) => {
    setCustomVal(val);
    const num = parseInt(val, 10);
    const min = currentService?.minAmountINR ?? 100;
    const max = currentService?.maxAmountINR ?? 50000;

    if (isNaN(num)) {
      setCustomError('Please enter a valid amount.');
    } else if (num < min || num > max) {
      setCustomError(`Amount must be between ₹${min.toLocaleString('en-IN')} and ₹${max.toLocaleString('en-IN')}`);
    } else {
      setCustomError('');
    }
  };

  const getComputedAmount = (): number => {
    if (!currentService) return 0;
    if (currentService.isCustomAmountAllowed) {
      const num = parseInt(customVal, 10);
      return isNaN(num) ? (currentService.minAmountINR ?? 100) : num;
    }
    return currentService.basePriceINR;
  };

  const handleProceed = () => {
    if (!currentService) return;

    if (currentService.isCustomAmountAllowed) {
      const num = parseInt(customVal, 10);
      const min = currentService.minAmountINR ?? 100;
      const max = currentService.maxAmountINR ?? 50000;
      if (isNaN(num) || num < min || num > max) {
        setCustomError(`Please enter an amount between ₹${min} and ₹${max}`);
        return;
      }
      onSelectService(currentService, num);
    } else {
      onSelectService(currentService);
    }
  };

  if (!services || services.length === 0) {
    return null;
  }

  const finalAmount = getComputedAmount();

  return (
    <section aria-label="Book services and payment" className="w-full px-4 py-3">
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

        {/* Section Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-950 border border-emerald-800/40 text-emerald-400">
              <CalendarCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white">Services & Direct UPI</h2>
              <p className="text-[11px] text-zinc-400">Select consultation or enter custom milestone</p>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded-full flex items-center gap-1">
            <Zap className="w-3 h-3 text-emerald-400 fill-emerald-400" />
            Instant UPI
          </span>
        </div>

        {/* Services Radio List */}
        <div className="space-y-2.5 mb-4" role="radiogroup" aria-label="Select service">
          {services.map((item) => {
            const isSelected = selectedId === item.id;
            return (
              <label
                key={item.id}
                className={`relative flex items-start justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-950/20 shadow-md shadow-emerald-950/30'
                    : 'border-zinc-800 bg-zinc-950/50 hover:border-zinc-700 hover:bg-zinc-950/80'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="pt-0.5">
                    <input
                      type="radio"
                      name="service-item"
                      value={item.id}
                      checked={isSelected}
                      onChange={() => {
                        setSelectedId(item.id);
                        setCustomError('');
                      }}
                      className="sr-only"
                    />
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                        isSelected
                          ? 'border-emerald-400 bg-emerald-500'
                          : 'border-zinc-600 bg-zinc-900'
                      }`}
                    >
                      {isSelected && <Check className="w-2.5 h-2.5 text-zinc-950 stroke-[3]" />}
                    </div>
                  </div>

                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-zinc-100">{item.name}</span>
                      {item.badge && (
                        <span className="text-[10px] font-semibold text-emerald-300 bg-emerald-950 border border-emerald-800/50 px-1.5 py-0.2 rounded">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">{item.description}</p>
                    <div className="flex items-center gap-1 text-[11px] text-zinc-500 mt-1">
                      <Clock className="w-3 h-3 text-zinc-500" />
                      <span>{item.duration}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right pl-3 flex-shrink-0">
                  <span className="text-sm sm:text-base font-bold text-emerald-400">
                    {item.isCustomAmountAllowed ? 'Custom' : `₹${item.basePriceINR.toLocaleString('en-IN')}`}
                  </span>
                  <span className="block text-[10px] text-zinc-500 uppercase font-mono">INR</span>
                </div>
              </label>
            );
          })}
        </div>

        {/* Custom Amount Input Box */}
        {currentService?.isCustomAmountAllowed && (
          <div className="mb-4 bg-zinc-950/70 p-3.5 rounded-xl border border-zinc-800 animate-in fade-in">
            <div className="flex justify-between items-center mb-1.5">
              <label htmlFor="custom-amount-input" className="text-xs font-medium text-zinc-300">
                Specify Custom Amount (₹):
              </label>
              <span className="text-[11px] text-zinc-500">
                Min ₹{currentService.minAmountINR} – Max ₹{currentService.maxAmountINR?.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-zinc-400 font-semibold text-sm">₹</span>
              <input
                id="custom-amount-input"
                type="number"
                min={currentService.minAmountINR ?? 100}
                max={currentService.maxAmountINR ?? 50000}
                step="1"
                value={customVal}
                onChange={(e) => handleCustomChange(e.target.value)}
                placeholder="500"
                className={`w-full bg-zinc-900 border rounded-lg pl-8 pr-3 py-2 text-sm text-white font-mono focus:outline-none transition-colors ${
                  customError
                    ? 'border-rose-500 focus:border-rose-500'
                    : 'border-zinc-700 focus:border-emerald-500'
                }`}
              />
            </div>
            {customError ? (
              <span className="text-[11px] text-rose-400 mt-1.5 block font-medium">{customError}</span>
            ) : (
              <div className="flex items-center gap-1 text-[11px] text-zinc-400 mt-1.5">
                <Info className="w-3 h-3 text-zinc-500" />
                <span>Supports any agreed milestone or project payment.</span>
              </div>
            )}
          </div>
        )}

        {/* Pre-checkout Amount Summary */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950 border border-zinc-800/80 mb-4 text-xs">
          <span className="text-zinc-400">Total payable at checkout:</span>
          <span className="text-base font-bold text-white font-mono">
            ₹{finalAmount.toLocaleString('en-IN')}{' '}
            <span className="text-xs text-emerald-400 font-sans">INR</span>
          </span>
        </div>

        {/* Notice on appointment booking */}
        <p className="text-[11px] text-zinc-400 leading-relaxed mb-4 bg-zinc-950/40 p-2.5 rounded-lg border border-zinc-800/50">
          <strong className="text-zinc-300">Appointment Note:</strong> Payment reserves your slot. You will receive an instant verified booking reference and calendar scheduling link upon confirmed authorization.
        </p>

        {/* Proceed Button */}
        <button
          onClick={handleProceed}
          disabled={Boolean(currentService?.isCustomAmountAllowed && customError)}
          className="w-full py-3.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.99] disabled:bg-zinc-800 disabled:text-zinc-600 disabled:pointer-events-none font-semibold text-zinc-950 text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-950"
        >
          <span>Continue to Booking Details</span>
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Trust Badges */}
        <div className="flex items-center justify-center gap-1.5 mt-3 text-[11px] text-zinc-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Razorpay Standard Checkout • Google Pay, PhonePe, Paytm, BHIM UPI</span>
        </div>
      </div>
    </section>
  );
};
