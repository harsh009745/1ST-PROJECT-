import React from 'react';
import { Calendar, FileText, Video, Award, Clock } from 'lucide-react';

export const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      step: '01',
      title: 'Choose Date & 45-Min Slot',
      icon: <Calendar className="w-5 h-5 text-amber-400" />,
      description:
        'Select your preferred date and available 45-minute video window from the live calendar. Your slot is held with a temporary 15-minute reservation during checkout.',
    },
    {
      step: '02',
      title: 'Complete Intake Context',
      icon: <FileText className="w-5 h-5 text-amber-400" />,
      description:
        'Share your current haircut challenges, skincare products in use, and styling goals so we can maximize every single minute of our scheduled video call.',
    },
    {
      step: '03',
      title: 'Private 1:1 Video Consultation',
      icon: <Video className="w-5 h-5 text-amber-400" />,
      description:
        'Join the dedicated video meeting. We review your hairline angles, beard trim demarcation, posture, and facial framing with live feedback in real time.',
    },
    {
      step: '04',
      title: 'Receive Your Tailored Blueprint',
      icon: <Award className="w-5 h-5 text-amber-400" />,
      description:
        'Following our call, you receive a concise written action summary detailing haircut references, skincare actives, and wardrobe guidelines.',
    },
  ];

  return (
    <section id="how-it-works" className="w-full py-20 px-4 sm:px-6 lg:px-8 border-y border-zinc-800/80 bg-zinc-950/60">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-amber-400 text-xs font-mono mb-3">
            <Clock className="w-3.5 h-3.5" />
            <span>EXACTLY 45 MINUTES</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
            How The Consultation Works
          </h2>
          <p className="text-sm text-zinc-400 leading-relaxed">
            A structured, professional process engineered to deliver actionable clarity without wasting time.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s, index) => (
            <div
              key={s.step}
              className="relative p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800">
                    {s.icon}
                  </div>
                  <span className="font-mono text-2xl font-black text-zinc-800">
                    {s.step}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mb-2">{s.title}</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">{s.description}</p>
              </div>

              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 text-zinc-700 font-bold z-10">
                  &rarr;
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
