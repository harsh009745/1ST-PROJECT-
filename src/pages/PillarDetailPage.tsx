import React from 'react';
import { useParams, Link, Navigate, useNavigate } from 'react-router-dom';
import { PILLARS_DATA } from '../data/pillarsData';
import {
  CheckCircle2,
  Clock,
  ArrowRight,
  ArrowLeft,
  Calendar,
  Lightbulb,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';

export const PillarDetailPage: React.FC = () => {
  const { pillarId } = useParams<{ pillarId: string }>();
  const navigate = useNavigate();

  if (!pillarId || !PILLARS_DATA[pillarId]) {
    return <Navigate to="/services" replace />;
  }

  const pillar = PILLARS_DATA[pillarId];

  return (
    <div className="w-full py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto animate-in fade-in">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-zinc-500 mb-8">
        <Link to="/" className="hover:text-amber-400 transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/services" className="hover:text-amber-400 transition-colors">
          5 Pillars
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-zinc-200 font-semibold">{pillar.title}</span>
      </nav>

      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden mb-12 border border-zinc-800 bg-zinc-950 shadow-2xl">
        <div className="relative h-72 sm:h-96 w-full">
          <img
            src={pillar.heroImage}
            alt={pillar.title}
            className="w-full h-full object-cover object-center filter brightness-75 contrast-125 opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/60 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-800/60 text-amber-300 text-xs font-mono font-bold mb-3">
              <span>PILLAR {pillar.number}</span>
              <span>&bull;</span>
              <span>45-MIN DEEP DIVE</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
              {pillar.title}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-300 max-w-2xl font-medium">
              {pillar.subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Main Overview */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-6 sm:p-10 mb-12 shadow-xl space-y-6">
        <div>
          <span className="text-amber-400 text-xs font-mono uppercase tracking-widest block mb-2">
            OVERVIEW &amp; PHILOSOPHY
          </span>
          <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
            {pillar.fullOverview}
          </p>
        </div>

        {/* Topics Covered */}
        <div className="pt-6 border-t border-zinc-800">
          <h2 className="text-lg font-bold text-white mb-6">
            What We Evaluate During the 45-Minute Call
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {pillar.topics.map((t, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 space-y-2"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-400" />
                  <h3 className="text-sm font-bold text-white">{t.title}</h3>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">{t.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Deliverable Checklist */}
        <div className="pt-6 border-t border-zinc-800">
          <h2 className="text-lg font-bold text-white mb-4">
            Your Action Items &amp; Deliverables
          </h2>
          <div className="space-y-2.5">
            {pillar.checklist.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs text-zinc-300">
                <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pre-Call Prep Guidelines */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-6 sm:p-8 mb-12 shadow-xl space-y-4">
        <div className="flex items-center gap-2 text-amber-400">
          <Lightbulb className="w-5 h-5" />
          <h2 className="text-lg font-bold text-white">How to Prepare for This Section</h2>
        </div>
        <p className="text-xs text-zinc-400">
          Follow these quick recommendations so we can evaluate this area thoroughly within 45 minutes:
        </p>
        <ul className="space-y-2 text-xs text-zinc-300 list-disc pl-5">
          {pillar.preparationTips.map((tip, idx) => (
            <li key={idx} className="leading-relaxed">
              {tip}
            </li>
          ))}
        </ul>
      </div>

      {/* Pillar FAQ */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-6 sm:p-8 mb-12 shadow-xl">
        <h2 className="text-lg font-bold text-white mb-6">Pillar FAQ</h2>
        <div className="space-y-4">
          {pillar.faq.map((f, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800/80">
              <h3 className="text-xs sm:text-sm font-bold text-zinc-200 mb-1.5">{f.question}</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">{f.answer}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Booking CTA Banner */}
      <div className="bg-gradient-to-r from-zinc-900 via-zinc-900 to-amber-950/40 border border-amber-500/50 rounded-3xl p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
        <div className="space-y-2 text-center sm:text-left">
          <span className="text-amber-400 text-xs font-mono uppercase tracking-widest block">
            GET 1:1 PERSONALIZED FEEDBACK
          </span>
          <h3 className="text-xl sm:text-2xl font-bold text-white">
            Ready to upgrade this pillar?
          </h3>
          <p className="text-xs text-zinc-300">
            Book a private 45-minute video consultation to review your hairstyle, skin, and grooming.
          </p>
        </div>

        <button
          onClick={() => navigate(`/book?service=${pillar.associatedPackageId}`)}
          className="py-3.5 px-8 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:brightness-105 active:scale-95 text-zinc-950 font-bold text-xs sm:text-sm shadow-xl shadow-amber-950/50 flex items-center gap-2 flex-shrink-0 cursor-pointer"
        >
          <Calendar className="w-4 h-4" />
          <span>Book 45-Min Session</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
