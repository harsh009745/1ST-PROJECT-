import React from 'react';
import { Scissors, Sparkles, Smile, Shirt, Compass, ShieldAlert, ArrowRight } from 'lucide-react';

interface PillarsSectionProps {
  onBookClick: () => void;
}

export const PillarsSection: React.FC<PillarsSectionProps> = ({ onBookClick }) => {
  const pillars = [
    {
      number: '01',
      title: 'Hairstyle & Hair-Grooming Review',
      icon: <Scissors className="w-5 h-5 text-amber-400" />,
      tagline: 'Geometry & Framing',
      description:
        'Objective analysis of head shape, hair density, hairline, and growth whorls. We determine which haircut lengths, tapers, and finishes complement your bone structure, along with exact phrasing and photos to show your barber.',
      takeaways: [
        'Face-shape framing & temple tapers',
        'Specific barber reference instructions',
        'Clay, matte paste, or cream styling choices',
      ],
      image:
        'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&q=80&w=600',
    },
    {
      number: '02',
      title: 'Skincare Routine & Presentation',
      icon: <Sparkles className="w-5 h-5 text-amber-400" />,
      tagline: 'Barrier & Texture',
      description:
        'A zero-nonsense audit of your current skincare products. We formulate a straightforward morning and night routine focused on essential actives (cleansers, retinoids, sunscreen, and hydrators) to improve clarity and daily freshness.',
      takeaways: [
        'Active ingredients tailored to oily/dry/normal skin',
        'Sunscreen & retinoid integration guide',
        'Under-eye hydration & fatigue management',
      ],
      image:
        'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=600',
    },
    {
      number: '03',
      title: 'Facial Hair & Grooming Advice',
      icon: <Smile className="w-5 h-5 text-amber-400" />,
      tagline: 'Jawline & Definition',
      description:
        'How to properly trim and shape your beard or stubble to enhance your lower jawline and cheek angles. Learn precise neck-line demarcation and grooming techniques that maximize visual symmetry.',
      takeaways: [
        'Proper neckline trimming height rules',
        'Stubble gradient & cheek line fading',
        'Beard oil, trimmer guard, and razor etiquette',
      ],
      image:
        'https://images.unsplash.com/photo-1517832606589-7629c3395909?auto=format&fit=crop&q=80&w=600',
    },
    {
      number: '04',
      title: 'Personal Style & Appearance',
      icon: <Shirt className="w-5 h-5 text-amber-400" />,
      tagline: 'Silhouettes & Fit',
      description:
        'Upgrade your day-to-day clothing choices without overspending on hype. We evaluate collar shapes, sleeve lengths, shoulder seam placement, and neutral color contrasts that flatter your build and posture.',
      takeaways: [
        'Neckline & collar styles for your neck and jaw',
        'Core capsule wardrobe & fit guidelines',
        'Proportion correction for height and frame',
      ],
      image:
        'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=600',
    },
    {
      number: '05',
      title: 'Personalized Self-Improvement Plan',
      icon: <Compass className="w-5 h-5 text-amber-400" />,
      tagline: 'Execution & Roadmap',
      description:
        'At the conclusion of our 45-minute call, your recommendations are synthesized into a step-by-step action plan. You leave with concrete daily habits and realistic short-term and long-term grooming milestones.',
      takeaways: [
        'Prioritized 30-day checklist',
        'Curated product links without sponsorship bias',
        'Follow-up guidance via email summary',
      ],
      image:
        'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=600',
    },
  ];

  return (
    <section id="services" className="w-full py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="text-amber-400 text-xs font-semibold tracking-widest uppercase font-mono block mb-2">
          THE 5 CORE PILLARS
        </span>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
          What Your 45-Minute Consultation Covers
        </h2>
        <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
          Every consultation is completely bespoke. We systematically inspect each aspect of your personal presentation and provide pragmatic, executable improvements.
        </p>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {pillars.map((pillar) => (
          <div
            key={pillar.number}
            className="group bg-zinc-900/60 border border-zinc-800 rounded-2xl overflow-hidden hover:border-amber-500/40 hover:bg-zinc-900/90 transition-all duration-300 flex flex-col justify-between shadow-xl"
          >
            {/* Image Thumbnail with Overlay */}
            <div className="relative h-44 w-full overflow-hidden bg-zinc-950">
              <img
                src={pillar.image}
                alt={pillar.title}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent" />
              <div className="absolute top-3 left-3 bg-zinc-950/80 backdrop-blur-sm border border-zinc-700/60 px-2.5 py-1 rounded-full text-[10px] font-mono text-amber-300 font-bold">
                PILLAR {pillar.number}
              </div>
              <div className="absolute top-3 right-3 p-2 rounded-full bg-zinc-950/80 border border-zinc-700/60">
                {pillar.icon}
              </div>
            </div>

            {/* Content */}
            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-semibold text-amber-400 tracking-wider uppercase font-mono block mb-1">
                  {pillar.tagline}
                </span>
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-amber-200 transition-colors">
                  {pillar.title}
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                  {pillar.description}
                </p>
              </div>

              {/* Takeaways list */}
              <div className="pt-3 border-t border-zinc-800/80 space-y-1.5">
                {pillar.takeaways.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-[11px] text-zinc-300">
                    <span className="text-amber-400 font-bold">&bull;</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}

        {/* 6th Card: Call to action card */}
        <div className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-amber-950/30 border border-amber-500/40 rounded-2xl p-6 flex flex-col justify-between shadow-xl">
          <div>
            <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 mb-4">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-semibold text-amber-400 tracking-wider uppercase font-mono block mb-1">
              45 MINUTES DEDICATED TO YOU
            </span>
            <h3 className="text-xl font-bold text-white mb-2">
              Ready to Upgrade Your Presentation?
            </h3>
            <p className="text-xs text-zinc-300 leading-relaxed mb-6">
              Skip endless trial-and-error. Reserve your 45-minute video consultation to receive unbiased, personalized recommendations tailored to your bone structure and goals.
            </p>
          </div>

          <button
            onClick={onBookClick}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:brightness-105 active:scale-95 text-zinc-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-950/40 cursor-pointer"
          >
            <span>Book Your 45-Min Session</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* Mandatory Honest Disclaimer Box */}
      <div className="p-4 sm:p-5 rounded-xl bg-zinc-950/70 border border-zinc-800 flex items-start gap-3.5 text-xs text-zinc-400 max-w-4xl mx-auto">
        <ShieldAlert className="w-5 h-5 text-amber-400/90 flex-shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-zinc-200 block mb-1 font-semibold">
            Transparency, Scope &amp; Medical Disclaimer:
          </strong>
          All recommendations provided during consultations are subjective personal appearance and grooming suggestions tailored to your individual preferences. Outcomes inherently vary between individuals. This consultation does not provide medical, surgical, dermatological, or psychological diagnosis, and does not promise permanent changes to underlying facial skeletal structure.
        </div>
      </div>
    </section>
  );
};
