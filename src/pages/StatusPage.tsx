import React, { useState, useEffect } from 'react';
import { useSearchParams, useLocation, Link } from 'react-router-dom';
import { StatusScreen } from '../components/StatusScreen';
import { BookingConfirmation } from '../types';
import { Search, Calendar, AlertCircle, Loader2 } from 'lucide-react';

export const StatusPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();

  const refParam = searchParams.get('ref') || '';
  const errorParam = searchParams.get('error') || '';

  // Use state passed from router if available, or fetch from server
  const [confirmation, setConfirmation] = useState<BookingConfirmation | null>(() => {
    return (location.state as any)?.confirmation || null;
  });

  const [inputRef, setInputRef] = useState(refParam);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState('');

  const fetchStatus = async (ref: string) => {
    if (!ref.trim()) return;
    setIsLoading(true);
    setFetchError('');

    try {
      const res = await fetch(`/api/checkout/status/${encodeURIComponent(ref.trim())}`);
      if (!res.ok) {
        throw new Error('Appointment reference not found. Please double-check your code.');
      }
      const data = await res.json();
      setConfirmation({
        status: data.status === 'PAYMENT_CONFIRMED' ? 'SUCCESS' : data.status === 'AWAITING_PAYMENT' ? 'PENDING' : 'FAILED',
        bookingReference: data.bookingReference,
        serviceName: data.serviceName,
        durationMinutes: 45,
        date: data.date,
        timeSlot: data.timeSlot,
        timezone: data.timezone,
        amountINR: data.amountINR,
        meetingUrl: data.meetingUrl,
        meetingInstructions: data.meetingInstructions,
        capturedAt: data.capturedAt,
      });
    } catch (err: any) {
      setFetchError(err.message || 'Failed to lookup appointment.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (refParam && !confirmation) {
      fetchStatus(refParam);
    }
  }, [refParam]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputRef.trim()) return;
    fetchStatus(inputRef.trim());
  };

  // If there was an error in query params
  if (errorParam && !confirmation) {
    return (
      <div className="w-full py-20 px-4 max-w-lg mx-auto text-center">
        <StatusScreen
          confirmation={{
            status: 'FAILED',
            bookingReference: 'ERR-CHECKOUT',
            serviceName: '1:1 Video Consultation',
            durationMinutes: 45,
            date: new Date().toISOString().split('T')[0],
            timeSlot: 'N/A',
            timezone: 'Asia/Kolkata (IST)',
            amountINR: 0,
            message: decodeURIComponent(errorParam),
          }}
          onReset={() => setConfirmation(null)}
        />
      </div>
    );
  }

  // If we have a confirmation record
  if (confirmation) {
    return (
      <div className="w-full py-12 px-4 animate-in fade-in">
        <StatusScreen
          confirmation={confirmation}
          onReset={() => {
            setConfirmation(null);
            setInputRef('');
          }}
        />
      </div>
    );
  }

  // Otherwise, render Search / Lookup Form
  return (
    <div className="w-full py-20 px-4 sm:px-6 lg:px-8 max-w-lg mx-auto animate-in fade-in">
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-6 sm:p-8 text-center shadow-2xl">
        <div className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 mx-auto mb-4">
          <Search className="w-6 h-6" />
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">
          Lookup Your 45-Min Appointment
        </h1>
        <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
          Enter your unique booking reference (e.g. <code className="text-amber-400">CONSULT-XXXXXX</code>) to view your video meeting link, scheduled date, and preparation checklist.
        </p>

        {fetchError && (
          <div className="p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 text-left">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{fetchError}</span>
          </div>
        )}

        <form onSubmit={handleSearch} className="space-y-3 mb-6">
          <input
            type="text"
            required
            value={inputRef}
            onChange={(e) => setInputRef(e.target.value)}
            placeholder="e.g. CONSULT-M12AB-3F"
            className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white font-mono placeholder:text-zinc-600 focus:outline-none focus:border-amber-400"
          />

          <button
            type="submit"
            disabled={isLoading || !inputRef.trim()}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:brightness-105 active:scale-95 disabled:bg-zinc-800 disabled:text-zinc-600 text-zinc-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-950/40 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Checking Ledger...</span>
              </>
            ) : (
              <span>Look Up Consultation Status</span>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-zinc-800 text-xs text-zinc-500 flex justify-between items-center">
          <span>Need to book a new session?</span>
          <Link to="/book" className="text-amber-400 font-semibold hover:underline">
            View Open Slots &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
};
