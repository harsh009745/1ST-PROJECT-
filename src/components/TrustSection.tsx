import React, { useState } from 'react';
import { ShieldCheck, Calendar, Lock, AlertTriangle, ChevronDown, Mail, Clock } from 'lucide-react';

export const TrustSection: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: 'How does the 45-minute video call work?',
      a: 'After securing your slot, you receive an authoritative booking reference and private video meeting link. At the scheduled time, join via any browser with your webcam enabled. We spend the entire 45 minutes assessing facial framing, hairstyle geometry, skincare routine, and answering your specific grooming questions.',
    },
    {
      q: 'What should I prepare before joining the consultation?',
      a: 'Sit in a room with clean, natural or frontal light so your hairline, skin texture, and jawline framing are clearly visible on camera. Have a list of the current skincare products you use (cleansers, moisturizers, SPF) and any haircut styles you have considered.',
    },
    {
      q: 'What is your rescheduling and cancellation policy?',
      a: 'We understand schedules change. You can reschedule your appointment free of charge up to 24 hours prior to the scheduled start time by emailing contact@aaditya.dev with your booking reference. Cancellations within 24 hours are non-refundable as the slot is reserved exclusively for you.',
    },
    {
      q: 'Is my video call and personal information kept private?',
      a: 'Yes, 100%. All consultations are private 1-on-1 video sessions. We never record calls without explicit consent, and your photos, discussions, and contact details are never published, shared, or displayed publicly.',
    },
    {
      q: 'Do you promise permanent changes to bone or facial structure?',
      a: 'No. We provide actionable, science-backed personal styling, hairstyle geometry, facial hair grooming lines, and cosmetic skincare routine guidance. We do not make misleading biological claims or promise surgical or permanent bone changes.',
    },
  ];

  return (
    <section id="trust-policies" className="w-full py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      {/* Session Scope & Policies Card */}
      <div className="bg-zinc-900/70 border border-zinc-800 rounded-3xl p-6 sm:p-10 mb-16 shadow-2xl">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-amber-400 text-xs font-mono tracking-widest uppercase block mb-2">
            STANDARDS &amp; COMMITMENTS
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Consultation Policies &amp; Expectations
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-2">
            Transparent, ethical guidance without false promises or exaggerated marketing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Policy 1: Exactly 45 Minutes */}
          <div className="p-5 rounded-2xl bg-zinc-950/60 border border-zinc-800 space-y-2">
            <div className="p-2 w-fit rounded-lg bg-zinc-900 text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white">45-Minute Session Scope</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Every consultation starts promptly and runs for exactly 45 minutes. A written summary blueprint with reference photos and product recommendations is provided afterward.
            </p>
          </div>

          {/* Policy 2: Rescheduling */}
          <div className="p-5 rounded-2xl bg-zinc-950/60 border border-zinc-800 space-y-2">
            <div className="p-2 w-fit rounded-lg bg-zinc-900 text-amber-400">
              <Calendar className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white">Flexible Rescheduling</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Need to shift your date or time? Reschedule with at least 24 hours advance notice with zero penalty by emailing with your booking reference.
            </p>
          </div>

          {/* Policy 3: Confidentiality */}
          <div className="p-5 rounded-2xl bg-zinc-950/60 border border-zinc-800 space-y-2">
            <div className="p-2 w-fit rounded-lg bg-zinc-900 text-amber-400">
              <Lock className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white">Strict Privacy Guarantee</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Your consultation is completely confidential. We do not use client photos for marketing or share personal conversation details with anyone.
            </p>
          </div>
        </div>

        {/* Disclaimer Notice */}
        <div className="mt-8 p-4 rounded-xl bg-amber-950/20 border border-amber-800/30 text-xs text-zinc-300 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-amber-300">Important Disclaimer:</strong> Consultations provide grooming, styling, and appearance advice for informational and self-improvement purposes only. They do not constitute medical, dermatological, orthodontic, or surgical diagnoses. Always consult licensed medical specialists for clinical conditions.
          </p>
        </div>
      </div>

      {/* FAQ Accordion */}
      <div id="faq" className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <span className="text-amber-400 text-xs font-mono tracking-widest uppercase block mb-1">
            QUESTIONS &amp; ANSWERS
          </span>
          <h3 className="text-xl sm:text-2xl font-bold text-white">
            Frequently Asked Questions
          </h3>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={index}
                className="rounded-2xl border border-zinc-800 bg-zinc-900/60 overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-zinc-800/30 transition-colors"
                >
                  <span className="text-sm font-semibold text-zinc-200 pr-4">{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-amber-400 flex-shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs text-zinc-400 leading-relaxed border-t border-zinc-800/60 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
