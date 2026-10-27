import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowLeft,
  Calendar,
  Clock,
  Video,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Download,
  Info,
} from 'lucide-react';
import { BookingConfirmation } from '../types';

interface StatusScreenProps {
  confirmation: BookingConfirmation;
  onReset: () => void;
}

export const StatusScreen: React.FC<StatusScreenProps> = ({ confirmation, onReset }) => {
  const [copiedRef, setCopiedRef] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<string>(confirmation.status);

  const handleCopyRef = async () => {
    try {
      await navigator.clipboard.writeText(confirmation.bookingReference);
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleCopyMeetingLink = async () => {
    if (!confirmation.meetingUrl) return;
    try {
      await navigator.clipboard.writeText(confirmation.meetingUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleCheckLatestStatus = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch(`/api/checkout/status/${confirmation.bookingReference}`);
      if (res.ok) {
        const data = await res.json();
        if (data.status === 'PAYMENT_CONFIRMED') {
          setCurrentStatus('SUCCESS');
        } else if (data.status === 'PAYMENT_PENDING') {
          setCurrentStatus('PENDING');
        } else if (data.status === 'FAILED') {
          setCurrentStatus('FAILED');
        }
      }
    } catch (e) {
      console.error('Failed to refresh status:', e);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Generate Google Calendar Link
  const getGoogleCalendarUrl = () => {
    const title = encodeURIComponent(`1:1 Aesthetics & Grooming Consultation (45m)`);
    const details = encodeURIComponent(
      `Private 45-minute video consultation with VALENCE.\nBooking Ref: ${confirmation.bookingReference}\nMeeting Room: ${confirmation.meetingUrl || 'Link sent via email'}\nPreparation: Please join from a well-lit room with natural or frontal light.`
    );
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}`;
  };

  // Download .ics calendar file
  const downloadIcsFile = () => {
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//VALENCE//Consultation Booking//EN
BEGIN:VEVENT
SUMMARY:1:1 Aesthetics & Grooming Consultation (45m)
DESCRIPTION:Private 45-minute consultation. Ref: ${confirmation.bookingReference}
LOCATION:${confirmation.meetingUrl || 'Online Video Room'}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `consultation-${confirmation.bookingReference}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isSuccess = currentStatus === 'SUCCESS';
  const isPending = currentStatus === 'PENDING';
  const isFailed = currentStatus === 'FAILED';

  return (
    <div className="w-full px-4 py-12 max-w-2xl mx-auto animate-in fade-in zoom-in-95 duration-200">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 text-center shadow-2xl relative overflow-hidden">
        {/* SUCCESS CONFIRMATION */}
        {isSuccess && (
          <>
            <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/30 rounded-full flex items-center justify-center mx-auto mb-4 text-amber-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/60 border border-amber-800/40 text-amber-300 text-xs font-mono mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>PAYMENT &amp; 45-MIN APPOINTMENT CONFIRMED</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
              Your 1:1 Consultation is Booked
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mb-8 max-w-md mx-auto leading-relaxed">
              Your appointment has been reserved on the calendar and verified authoritatively via payment gateway capture.
            </p>

            {/* Video Call Join Card */}
            {confirmation.meetingUrl ? (
              <div className="p-5 rounded-2xl bg-gradient-to-br from-zinc-950 via-zinc-950 to-amber-950/30 border border-amber-500/50 text-left mb-6 shadow-xl">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-3">
                  <div className="flex items-center gap-2">
                    <Video className="w-5 h-5 text-amber-400" />
                    <span className="font-bold text-white text-sm">Dedicated Video Meeting Room</span>
                  </div>
                  <span className="text-[10px] text-amber-300 font-mono bg-amber-950 px-2 py-0.5 rounded border border-amber-800/60">
                    45 MINUTES
                  </span>
                </div>

                <p className="text-xs text-zinc-300 mb-4 leading-relaxed">
                  {confirmation.meetingInstructions ||
                    'Please join 2 minutes prior to your scheduled time from a device with a clear camera and good lighting.'}
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-2.5">
                  <a
                    href={confirmation.meetingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto py-3 px-6 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:brightness-105 active:scale-95 text-zinc-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-950/40"
                  >
                    <span>Join Video Call</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>

                  <button
                    onClick={handleCopyMeetingLink}
                    className="w-full sm:w-auto py-3 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-zinc-700"
                  >
                    {copiedLink ? <Check className="w-4 h-4 text-amber-400" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedLink ? 'Copied Link' : 'Copy Meeting URL'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-left text-xs text-zinc-400 mb-6">
                <div className="flex items-center gap-2 text-amber-400 font-semibold mb-1">
                  <Info className="w-4 h-4" />
                  <span>Meeting Link Dispatching</span>
                </div>
                Your private video call link has been generated and dispatched to your email address.
              </div>
            )}

            {/* Appointment Details Grid */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 text-left space-y-3 mb-6 text-xs">
              <div className="flex justify-between items-center pb-2.5 border-b border-zinc-800/80">
                <span className="text-zinc-500">Booking Reference:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-amber-300 font-bold tracking-wide">
                    {confirmation.bookingReference}
                  </span>
                  <button
                    onClick={handleCopyRef}
                    title="Copy reference"
                    className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                  >
                    {copiedRef ? <Check className="w-3.5 h-3.5 text-amber-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-between">
                <span className="text-zinc-500">Service:</span>
                <span className="text-zinc-100 font-medium">{confirmation.serviceName}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-zinc-500">Consultation Date:</span>
                <span className="text-zinc-100 font-medium flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  {confirmation.date}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-zinc-500">Time Window:</span>
                <span className="text-amber-400 font-mono font-bold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {confirmation.timeSlot} (Exactly 45m)
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-zinc-500">Timezone:</span>
                <span className="text-zinc-300 font-mono">{confirmation.timezone}</span>
              </div>

              <div className="flex justify-between pt-2 border-t border-zinc-800/80">
                <span className="text-zinc-500">Amount Paid:</span>
                <span className="text-amber-400 font-extrabold font-mono text-sm">
                  ₹{confirmation.amountINR?.toLocaleString('en-IN')} INR
                </span>
              </div>
            </div>

            {/* Calendar Export Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
              <a
                href={getGoogleCalendarUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center justify-center gap-2 border border-zinc-700 transition-colors"
              >
                <Calendar className="w-4 h-4 text-amber-400" />
                <span>Add to Google Calendar</span>
              </a>

              <button
                onClick={downloadIcsFile}
                className="py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center justify-center gap-2 border border-zinc-700 transition-colors"
              >
                <Download className="w-4 h-4 text-amber-400" />
                <span>Download .ICS Calendar Event</span>
              </button>
            </div>
          </>
        )}

        {/* PENDING VERIFICATION */}
        {isPending && (
          <>
            <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/30 rounded-full flex items-center justify-center mx-auto mb-4 text-amber-400">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <h2 className="text-2xl font-bold text-white mb-2">Payment Capture Pending</h2>
            <p className="text-xs sm:text-sm text-zinc-400 mb-6 max-w-md mx-auto leading-relaxed">
              Your UPI payment was initiated. We are awaiting bank webhook settlement confirmation.
            </p>

            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 text-left text-xs space-y-2 mb-6">
              <div className="flex justify-between">
                <span className="text-zinc-500">Booking Reference:</span>
                <span className="font-mono text-white font-bold">{confirmation.bookingReference}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Reserved Slot:</span>
                <span className="font-mono text-amber-400">{confirmation.timeSlot} ({confirmation.date})</span>
              </div>
              <p className="text-amber-300 text-[11px] pt-2 border-t border-zinc-800">
                <strong>Important:</strong> Please do not submit another payment. Your slot reservation is held.
              </p>
            </div>

            <button
              onClick={handleCheckLatestStatus}
              disabled={isRefreshing}
              className="w-full mb-4 py-3 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center justify-center gap-2 transition-all border border-zinc-700"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
              <span>{isRefreshing ? 'Checking Bank Ledger...' : 'Refresh Payment Status'}</span>
            </button>
          </>
        )}

        {/* FAILED PAYMENT */}
        {isFailed && (
          <>
            <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/30 rounded-full flex items-center justify-center mx-auto mb-4 text-rose-400">
              <XCircle className="w-8 h-8" />
            </div>

            <h2 className="text-2xl font-bold text-white mb-2">Payment Incomplete</h2>
            <p className="text-xs sm:text-sm text-zinc-400 mb-6 max-w-md mx-auto leading-relaxed">
              {confirmation.message || 'The transaction was cancelled or declined at your UPI/bank application.'}
            </p>

            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 text-left text-xs text-zinc-400 mb-6">
              <p>The 45-minute slot reservation has been safely released back to the calendar.</p>
              <p className="mt-2 text-[11px] text-zinc-500">
                If money was deducted from your account during a bank timeout, UPI standard protocols automatically refund the transaction within 24 hours.
              </p>
            </div>
          </>
        )}

        {/* Back Button */}
        <button
          onClick={onReset}
          className="w-full py-3.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold flex items-center justify-center gap-2 transition-all border border-zinc-700"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Homepage</span>
        </button>
      </div>
    </div>
  );
};
