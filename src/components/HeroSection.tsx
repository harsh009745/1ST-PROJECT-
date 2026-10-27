import React, { useState } from 'react';
import { Clock, ShieldCheck, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

interface HeroSectionProps {
  onBookClick: () => void;
  onExploreServices: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onBookClick, onExploreServices }) => {
  const [bgImageFailed, setBgImageFailed] = useState(false);

  // Cinematic high-contrast editorial portrait of well-groomed man with dark neutral background
  const editorialImageUrl =
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=1600';

  return (
    <section className="relative w-full overflow-hidden min-h-[640px] lg:min-h-[720px] flex items-center justify-center border-b border-zinc-800/80 bg-[#09090b]">
      {/* Editorial Background Image with Fallback */}
      {!bgImageFailed && (
        <img
          src={editorialImageUrl}
          alt="Men's personal styling and grooming presentation"
          onError={() => setBgImageFailed(true)}
          className="absolute inset-0 w-full h-full object-cover object-top opacity-35 filter brightness-75 contrast-125 pointer-events-none select-none transition-opacity duration-700"
        />
      )}

      {/* Multi-layered cinematic gradient overlays for high typography legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/80 to-[#09090b]/60 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent pointer-events-none" />

      {/* Hero Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 text-center flex flex-col items-center">
        {/* Eyebrow badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900/90 border border-amber-500/40 text-amber-300 text-xs sm:text-xs font-semibold tracking-widest uppercase mb-6 shadow-lg shadow-amber-950/20 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>PERSONAL AESTHETICS &amp; GROOMING</span>
        </div>

        {/* 45-Minute Consultation Duration Indicator Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/60 border border-zinc-700/60 text-zinc-300 text-[11px] sm:text-xs font-medium mb-6">
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span>Private 1-to-1 Video Consultation &bull; Exactly 45 Minutes</span>
        </div>

        {/* Large Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1] max-w-4xl mb-6">
          Build Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200">Best Look</span>.
        </h1>

        {/* Supporting Copy */}
        <p className="max-w-2xl text-base sm:text-lg text-zinc-300 font-normal leading-relaxed mb-10 text-balance">
          A personalized 45-minute consultation focused on grooming, hairstyle, skincare routines, facial presentation, and practical improvements tailored to your goals.
        </p>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mb-12">
          <button
            onClick={onBookClick}
            className="w-full sm:w-auto py-4 px-8 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:brightness-110 active:scale-95 text-zinc-950 font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 transition-all shadow-xl shadow-amber-950/60 cursor-pointer"
          >
            <span>Book a 1:1 Consultation</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>

          <button
            onClick={onExploreServices}
            className="w-full sm:w-auto py-4 px-8 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 font-semibold text-sm sm:text-base flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span>Explore Services</span>
          </button>
        </div>

        {/* Trust & Transparency Feature Checklist */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6 pt-6 border-t border-zinc-800/80 w-full max-w-3xl text-left">
          <div className="flex items-center gap-2 text-xs sm:text-xs text-zinc-300">
            <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>Strictly confidential 45-min video call</span>
          </div>
          <div className="flex items-center gap-2 text-xs sm:text-xs text-zinc-300">
            <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>Tailored routine &amp; barber instructions</span>
          </div>
          <div className="flex items-center gap-2 text-xs sm:text-xs text-zinc-300">
            <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>Practical, science-backed grooming</span>
          </div>
        </div>
      </div>
    </section>
  );
};
