import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Clock, MapPin, Send, CheckCircle2, MessageSquare, Search } from 'lucide-react';
import { PROFILE_CONFIG } from '../config/profileConfig';

export const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bookingRef: '',
    message: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  return (
    <div className="w-full py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto animate-in fade-in">
      <div className="text-center max-w-2xl mx-auto mb-14">
        <span className="text-amber-400 text-xs font-mono uppercase tracking-widest block mb-2">
          DIRECT COMMUNICATION
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
          Contact &amp; Support
        </h1>
        <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
          Need to reschedule an appointment, inquire about corporate grooming advisories, or ask a question before booking?
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 text-left">
        {/* Contact Info (5 cols) */}
        <div className="md:col-span-5 space-y-6">
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-6 space-y-5">
            <h2 className="text-lg font-bold text-white">Direct Channels</h2>

            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-zinc-950 text-amber-400 border border-zinc-800">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-zinc-500 block">Official Support Email</span>
                  <a
                    href={`mailto:${PROFILE_CONFIG.contactEmail}`}
                    className="text-zinc-200 font-mono font-medium hover:text-amber-400 underline"
                  >
                    {PROFILE_CONFIG.contactEmail}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-zinc-950 text-amber-400 border border-zinc-800">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-zinc-500 block">Response Time</span>
                  <span className="text-zinc-200 font-medium">Within 12–24 business hours</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-zinc-950 text-amber-400 border border-zinc-800">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-zinc-500 block">Primary Timezone</span>
                  <span className="text-zinc-200 font-medium">Asia/Kolkata (IST) &bull; Online Video</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2 text-xs">
            <div className="flex items-center gap-1.5 text-amber-400 font-bold">
              <Search className="w-4 h-4" />
              <span>Looking for your video room?</span>
            </div>
            <p className="text-zinc-400 leading-relaxed">
              If you have already paid and need your meeting URL, check your appointment ledger:
            </p>
            <Link to="/status" className="text-amber-300 font-bold underline inline-block pt-1">
              Lookup Appointment Reference &rarr;
            </Link>
          </div>
        </div>

        {/* Contact Form (7 cols) */}
        <div className="md:col-span-7">
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
            {isSubmitted ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/30 rounded-full flex items-center justify-center mx-auto text-amber-400">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white">Message Dispatched</h3>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
                  Thank you, {formData.name}. We will review your message and reply to <strong className="text-zinc-200">{formData.email}</strong> shortly.
                </p>
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="mt-4 text-xs text-amber-400 underline font-semibold"
                >
                  Send another inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <h3 className="text-base font-bold text-white mb-2">Send an Inquiry</h3>

                <div>
                  <label className="block text-zinc-300 mb-1 font-medium">Your Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Vikramaditya"
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 mb-1 font-medium">Email Address</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="vikram@example.com"
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 mb-1 font-medium">
                    Booking Reference (Optional, for rescheduling)
                  </label>
                  <input
                    type="text"
                    value={formData.bookingRef}
                    onChange={(e) => setFormData({ ...formData, bookingRef: e.target.value })}
                    placeholder="e.g. CONSULT-XYZ-123"
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-white font-mono placeholder:text-zinc-600 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 mb-1 font-medium">Your Message / Question</label>
                  <textarea
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="How can we assist you?"
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:brightness-105 active:scale-95 text-zinc-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-950/40 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Message</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
