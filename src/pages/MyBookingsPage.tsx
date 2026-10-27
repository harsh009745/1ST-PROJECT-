import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Calendar,
  Clock,
  Video,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Loader2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';

interface UserBooking {
  bookingReference: string;
  serviceId: string;
  serviceName: string;
  durationMinutes: number;
  date: string;
  timeSlot: string;
  timezone: string;
  amountINR: number;
  status: 'AWAITING_PAYMENT' | 'PAYMENT_PENDING' | 'PAYMENT_CONFIRMED' | 'FAILED' | 'CANCELLED';
  meetingUrl?: string;
  meetingInstructions?: string;
  razorpayOrderId?: string;
  capturedAt?: string;
  createdAt: string;
}

export const MyBookingsPage: React.FC = () => {
  const { getIdToken, user } = useAuth();
  const [bookings, setBookings] = useState<UserBooking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const token = await getIdToken();
      const res = await fetch('/api/user/bookings', {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) {
        throw new Error('Failed to retrieve your consultation appointments');
      }

      const data = await res.json();
      setBookings(data.bookings || []);
    } catch (err: any) {
      console.error('Error fetching bookings:', err);
      setError(err.message || 'Unable to load bookings.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [user]);

  const getStatusBadge = (status: UserBooking['status']) => {
    switch (status) {
      case 'PAYMENT_CONFIRMED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider bg-emerald-950/50 border border-emerald-800/40 text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Confirmed & Scheduled
          </span>
        );
      case 'AWAITING_PAYMENT':
      case 'PAYMENT_PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider bg-amber-950/50 border border-amber-800/40 text-amber-400">
            <Clock className="w-3.5 h-3.5" />
            Payment Incomplete
          </span>
        );
      case 'CANCELLED':
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider bg-zinc-800 border border-zinc-700 text-zinc-400">
            <AlertCircle className="w-3.5 h-3.5" />
            Cancelled / Released
          </span>
        );
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      {/* Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono uppercase tracking-wider mb-2">
            <Link to="/" className="hover:text-zinc-200">
              Home
            </Link>
            <span>/</span>
            <Link to="/account" className="hover:text-zinc-200">
              Account
            </Link>
            <span>/</span>
            <span className="text-amber-400">My Consultations</span>
          </div>
          <h1 className="text-3xl font-serif text-zinc-100 tracking-tight">
            Consultation Appointments
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Review your 45-minute private video consultations, join meeting rooms, or view receipt details.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchBookings(true)}
            disabled={refreshing}
            className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-zinc-100 hover:border-zinc-700 transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh appointments"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>

          <Link
            to="/book"
            className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-zinc-950 font-semibold text-xs tracking-wider uppercase hover:brightness-110 active:scale-[0.99] transition-all flex items-center gap-2 shadow-lg shadow-amber-400/10"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Book New Session</span>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center p-12 text-center bg-zinc-900/40 border border-zinc-800 rounded-3xl">
          <Loader2 className="w-8 h-8 text-amber-400 animate-spin mb-4" />
          <p className="text-xs uppercase font-mono tracking-widest text-zinc-400">
            Loading Appointments...
          </p>
        </div>
      ) : error ? (
        <div className="p-8 rounded-3xl bg-red-950/20 border border-red-800/40 text-center">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-3" />
          <p className="text-sm text-red-200 mb-4">{error}</p>
          <button
            onClick={() => fetchBookings()}
            className="py-2 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono uppercase"
          >
            Try Again
          </button>
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-20 px-4 bg-zinc-900/40 border border-zinc-800/80 rounded-3xl backdrop-blur-xl">
          <div className="w-16 h-16 rounded-2xl bg-zinc-800/60 border border-zinc-700/60 flex items-center justify-center mx-auto mb-5 text-zinc-400">
            <Calendar className="w-8 h-8 text-zinc-400" />
          </div>
          <h3 className="text-xl font-serif text-zinc-200 font-medium">No Consultations Yet</h3>
          <p className="text-xs text-zinc-400 max-w-md mx-auto mt-2 leading-relaxed">
            You haven't scheduled a 1:1 aesthetics consultation yet. Reserve your private 45-minute video session to analyze facial geometry, hairstyles, and grooming protocols.
          </p>
          <div className="mt-8">
            <Link
              to="/book"
              className="inline-flex items-center gap-2 py-3 px-6 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-zinc-950 font-semibold text-xs tracking-wider uppercase hover:brightness-110 shadow-xl shadow-amber-400/15"
            >
              <span>Explore Available 45-Min Slots</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {bookings.map((booking) => {
            const isConfirmed = booking.status === 'PAYMENT_CONFIRMED';
            const effectiveMeetingUrl =
              booking.meetingUrl || `/status/${booking.bookingReference}`;

            return (
              <div
                key={booking.bookingReference}
                className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl hover:border-zinc-700/80 transition-all shadow-xl"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  {/* Left Side: Booking Details */}
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      {getStatusBadge(booking.status)}
                      <span className="text-[11px] font-mono text-zinc-400">
                        Ref: <span className="text-zinc-200">{booking.bookingReference}</span>
                      </span>
                    </div>

                    <h3 className="text-xl font-serif text-zinc-100 font-medium">
                      {booking.serviceName}
                    </h3>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-300">
                      <div className="flex items-center gap-2 bg-zinc-950/60 border border-zinc-800 px-3 py-1.5 rounded-lg">
                        <Calendar className="w-3.5 h-3.5 text-amber-400" />
                        <span>{booking.date}</span>
                      </div>

                      <div className="flex items-center gap-2 bg-zinc-950/60 border border-zinc-800 px-3 py-1.5 rounded-lg">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        <span>{booking.timeSlot} (45 mins)</span>
                      </div>

                      <div className="flex items-center gap-1.5 text-zinc-400 text-[11px]">
                        <span>Fee Paid:</span>
                        <span className="font-mono text-zinc-200 font-medium">
                          ₹{booking.amountINR.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    {booking.meetingInstructions && (
                      <p className="text-xs text-zinc-400 bg-zinc-950/40 p-3 rounded-xl border border-zinc-800/80 max-w-xl">
                        <span className="font-medium text-zinc-300 block mb-0.5">Instructions:</span>
                        {booking.meetingInstructions}
                      </p>
                    )}
                  </div>

                  {/* Right Side: Actions */}
                  <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
                    {isConfirmed ? (
                      <a
                        href={effectiveMeetingUrl}
                        target={effectiveMeetingUrl.startsWith('http') ? '_blank' : '_self'}
                        rel="noreferrer"
                        className="py-3 px-5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-zinc-950 font-semibold text-xs tracking-wider uppercase hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-400/15 cursor-pointer text-center"
                      >
                        <Video className="w-4 h-4 text-zinc-950" />
                        <span>Join Video Room</span>
                        <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                      </a>
                    ) : (
                      <Link
                        to={`/book`}
                        className="py-3 px-5 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 border border-amber-400/30 text-xs font-semibold uppercase tracking-wider transition-all text-center"
                      >
                        Re-book Slot
                      </Link>
                    )}

                    <Link
                      to={`/status/${booking.bookingReference}`}
                      className="py-2.5 px-4 rounded-xl bg-zinc-800/70 hover:bg-zinc-800 text-zinc-300 hover:text-zinc-100 text-xs font-medium transition-all flex items-center justify-center gap-1.5 border border-zinc-700/60"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
                      <span>View Receipt & QR</span>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
