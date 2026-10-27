import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Scissors,
  Sparkles,
  Smile,
  Shirt,
  Compass,
  ArrowRight,
  Clock,
  ShieldCheck,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import { HeroSection } from '../components/HeroSection';
import { QRCodeSection } from '../components/QRCodeSection';
import { ServiceItem } from '../types';

interface HomePageProps {
  services: ServiceItem[];
}

export const HomePage: React.FC<HomePageProps> = ({ services }) => {
  const navigate = useNavigate();

  const previewPillars = [
    {
      slug: 'hairstyle',
      icon: <Scissors className="w-5 h-5 text-amber-400" />,
      title: 'Hairstyle & Hair-Grooming',
      tagline: 'Geometry & Framing',
      desc: 'Analysis of head shape, hair density, tapers, and reference photos to show your barber.',
    },
    {
      slug: 'skincare',
      icon: <Sparkles className="w-5 h-5 text-amber-400" />,
      title: 'Skincare Routine & Presentation',
      tagline: 'Actives & Barrier',
      desc: 'Audit of your cleansers, retinoids, sunscreen, and daily skin health protocols.',
    },
    {
      slug: 'facial-hair',
      icon: <Smile className="w-5 h-5 text-amber-400" />,
      title: 'Facial Hair & Jawline Grooming',
      tagline: 'Angles & Symmetry',
      desc: 'Neckline demarcation, beard fading, and stubble shaping for lower face definition.',
    },
    {
      slug: 'style',
      icon: <Shirt className="w-5 h-5 text-amber-400" />,
      title: 'Personal Style & Silhouettes',
      tagline: 'Fit & Contrast',
      desc: 'Collar styles, clothing proportions, and neutral palette coordination for your build.',
    },
    {
      slug: 'blueprint',
      icon: <Compass className="w-5 h-5 text-amber-400" />,
      title: 'Personalized Improvement Plan',
      tagline: 'Execution Roadmap',
      desc: 'Post-consultation written blueprint with actionable habit checklist and product recommendations.',
    },
  ];

  return (
    <div className="w-full flex flex-col items-center">
      {/* Hero Section */}
      <HeroSection
        onBookClick={() => navigate('/book')}
        onExploreServices={() => navigate('/services')}
      />

      {/* 5 Pillars Synopsis */}
      <section className="w-full py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <span className="text-amber-400 text-xs font-mono tracking-widest uppercase block mb-2">
              THE 5 PILLARS OF APPEARANCE
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              A Holistic Aesthetics Framework
            </h2>
          </div>
          <Link
            to="/services"
            className="mt-4 md:mt-0 inline-flex items-center gap-1.5 text-xs font-bold text-amber-300 hover:text-amber-200 transition-colors"
          >
            <span>Explore In-Depth Pillar Breakdown</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
          {previewPillars.map((p) => (
            <Link
              key={p.slug}
              to={`/pillars/${p.slug}`}
              className="group p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-amber-500/50 hover:bg-zinc-900/90 transition-all duration-300 flex flex-col justify-between shadow-xl block text-left"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800">
                    {p.icon}
                  </div>
                  <span className="font-mono text-[10px] text-amber-300 font-bold bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/40">
                    {p.tagline}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mb-2 group-hover:text-amber-200 transition-colors">
                  {p.title}
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">{p.desc}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-amber-400 group-hover:underline">
                  View Full Pillar Breakdown
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-amber-400 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}

          {/* Direct CTA card */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-amber-950/30 border border-amber-500/40 flex flex-col justify-between shadow-xl text-left">
            <div>
              <span className="text-xs font-mono text-amber-400 uppercase tracking-widest block mb-1">
                PRIVATE 1-ON-1
              </span>
              <h3 className="text-xl font-bold text-white mb-2">
                Book Your 45-Minute Consultation
              </h3>
              <p className="text-xs text-zinc-300 leading-relaxed mb-6">
                Receive unbiased, tailored guidance on your hairstyle, beard framing, and daily grooming routine.
              </p>
            </div>

            <Link
              to="/book"
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-zinc-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-950/40"
            >
              <span>Check Open Slots &amp; Book</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Why 45 Minutes Section */}
      <section className="w-full py-16 px-4 sm:px-6 lg:px-8 border-y border-zinc-800/80 bg-zinc-950/70">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1 space-y-4 text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/50 border border-amber-800/40 text-amber-300 text-xs font-mono">
              <Clock className="w-3.5 h-3.5" />
              <span>THE 45-MINUTE PHILOSOPHY</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Why Every Consultation Lasts Exactly 45 Minutes
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Standard 15-minute quick calls are too brief to diagnose facial framing or audit skincare formulations. Conversely, 90-minute lectures induce decision fatigue. 45 minutes provides the perfect, high-intensity window to evaluate your presentation, ask questions, and draft an executable blueprint.
            </p>
            <div className="pt-2 flex flex-wrap gap-4 text-xs text-zinc-300">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-amber-400" />
                <span>Zero fluff or time wasting</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-amber-400" />
                <span>Screen sharing &amp; photo analysis</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-amber-400" />
                <span>Written action PDF follow-up</span>
              </div>
            </div>

            <div className="pt-2">
              <Link
                to="/method"
                className="inline-flex items-center gap-1 text-xs font-bold text-amber-300 underline hover:text-amber-200"
              >
                <span>Read more about our consultation method &rarr;</span>
              </Link>
            </div>
          </div>

          <div className="w-full md:w-80 p-6 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl space-y-4 text-left">
            <h4 className="text-sm font-bold text-white">Consultation Tiers</h4>
            <div className="space-y-2 text-xs">
              {services.map((s) => (
                <Link
                  key={s.id}
                  to={`/packages/${s.id}`}
                  className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-amber-500/40 flex justify-between items-center transition-colors block"
                >
                  <div>
                    <div className="font-semibold text-zinc-200 text-xs truncate max-w-[170px]">
                      {s.name}
                    </div>
                    <div className="text-[10px] text-zinc-500">45 minutes &bull; View details &rarr;</div>
                  </div>
                  <span className="font-bold text-amber-400 font-mono">
                    ₹{s.basePriceINR.toLocaleString('en-IN')}
                  </span>
                </Link>
              ))}
            </div>

            <Link
              to="/book"
              className="w-full py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border border-zinc-700"
            >
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>Select Date &amp; Slot</span>
            </Link>
          </div>
        </div>
      </section>

      {/* QR Code Section */}
      <section className="w-full py-12 px-4 max-w-md mx-auto">
        <QRCodeSection profileName="VALENCE Aesthetics" />
      </section>
    </div>
  );
};
