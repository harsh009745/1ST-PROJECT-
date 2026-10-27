import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, HelpCircle, ArrowRight, Calendar } from 'lucide-react';

export const FaqPage: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const categories = [
    {
      category: 'Session & Video Call Logistics',
      items: [
        {
          q: 'How does the private 45-minute video call work?',
          a: 'After securing your slot, you receive an authoritative booking reference and private meeting link. At the scheduled time, join via any browser with your webcam enabled. We spend the entire 45 minutes assessing facial framing, hairstyle geometry, skincare routine, and answering your specific grooming questions.',
        },
        {
          q: 'What equipment or preparation do I need?',
          a: 'A stable internet connection, an eye-level laptop or smartphone camera, and clean frontal or natural window lighting. Avoid backlighting. Have your current skincare and hair products nearby.',
        },
        {
          q: 'Can I record the consultation?',
          a: 'For privacy reasons, we do not record calls. However, you will receive a comprehensive written PDF summary with all haircut references, product links, and routine instructions within 24 hours of the call.',
        },
      ],
    },
    {
      category: 'Grooming & Aesthetic Guidance',
      items: [
        {
          q: 'Will I receive reference photos to show my barber?',
          a: 'Yes. In your post-call written blueprint, you receive high-resolution reference angles and exact clipper guard instructions (e.g. #2 into #3 low taper) to eliminate miscommunication.',
        },
        {
          q: 'What if I have thinning hair or a receding hairline?',
          a: 'We evaluate hairline recession patterns, density distribution, and crown whorls to recommend haircuts (like French crops, textured tapers, or high skin fades) that maximize thickness and reduce visible scalp contrast.',
        },
        {
          q: 'Do you promise permanent changes to facial or bone structure?',
          a: 'No. We provide cosmetic, styling, and grooming guidance (contouring beard lines, hair volume, clothing proportions). We do not promise surgical, orthodontic, or permanent bone changes.',
        },
      ],
    },
    {
      category: 'Booking, Payments & Policies',
      items: [
        {
          q: 'What payment methods are supported?',
          a: 'We accept instant UPI (Google Pay, PhonePe, Paytm, BHIM), Indian Netbanking, and major debit/credit cards through our official Razorpay integration.',
        },
        {
          q: 'Can I reschedule my appointment if something comes up?',
          a: 'Yes. You can reschedule your session free of charge up to 24 hours prior to your scheduled time by emailing contact@aaditya.dev with your booking reference.',
        },
        {
          q: 'Is my personal data and video call confidential?',
          a: 'Yes, 100%. We adhere to strict privacy standards. Your photos, conversation notes, and contact details are never shared or published publicly.',
        },
      ],
    },
  ];

  let counter = 0;

  return (
    <div className="w-full py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto animate-in fade-in">
      <div className="text-center max-w-2xl mx-auto mb-14">
        <span className="text-amber-400 text-xs font-mono uppercase tracking-widest block mb-2">
          HELP &bull; CLARITY
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
          Frequently Asked Questions
        </h1>
        <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
          Everything you need to know about our 45-minute video consultations, preparation, and booking.
        </p>
      </div>

      <div className="space-y-10 text-left">
        {categories.map((cat, cIdx) => (
          <div key={cIdx} className="space-y-4">
            <h2 className="text-base font-bold text-amber-400 uppercase tracking-wider font-mono">
              {cat.category}
            </h2>
            <div className="space-y-3">
              {cat.items.map((item) => {
                const currentIdx = counter++;
                const isOpen = openIdx === currentIdx;
                return (
                  <div
                    key={currentIdx}
                    className="rounded-2xl border border-zinc-800 bg-zinc-900/60 overflow-hidden transition-all"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenIdx(isOpen ? null : currentIdx)}
                      className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-zinc-800/30 transition-colors"
                    >
                      <span className="text-sm font-semibold text-zinc-200 pr-4">{item.q}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-amber-400 flex-shrink-0 transition-transform duration-200 ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5 text-xs text-zinc-400 leading-relaxed border-t border-zinc-800/60 pt-3">
                        {item.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* CTA Card */}
        <div className="pt-8 text-center">
          <p className="text-xs text-zinc-400 mb-4">Ready to reserve your 45-minute consultation?</p>
          <Link
            to="/book"
            className="inline-flex items-center gap-2 py-3.5 px-8 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-zinc-950 font-bold text-xs shadow-lg shadow-amber-950/40"
          >
            <Calendar className="w-4 h-4" />
            <span>Check Calendar Availability</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
