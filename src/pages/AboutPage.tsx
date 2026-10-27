import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ShieldCheck, Clock, CheckCircle2, ArrowRight, User } from 'lucide-react';
import { PROFILE_CONFIG } from '../config/profileConfig';

export const AboutPage: React.FC = () => {
  return (
    <div className="w-full py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto animate-in fade-in">
      <div className="text-center max-w-2xl mx-auto mb-14">
        <span className="text-amber-400 text-xs font-mono uppercase tracking-widest block mb-2">
          PHILOSOPHY &bull; CREDIBILITY
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
          About VALENCE
        </h1>
        <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
          Objective, personalized aesthetics and grooming guidance for men who value discipline, precision, and authentic presentation.
        </p>
      </div>

      <div className="space-y-12 text-left">
        {/* Story & Mission Card */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-6 sm:p-10 shadow-xl space-y-5">
          <h2 className="text-2xl font-bold text-white">Our Core Thesis</h2>
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
            Most men navigate personal grooming through contradictory internet advice, viral TikTok micro-trends, and aggressive marketing for products they do not need. A haircut that looks striking on one cranial shape can completely distort another. A skincare acid that cleared someone else’s complexion can destroy your skin barrier.
          </p>
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
            VALENCE was created to provide an objective, personalized mirror. We do not sell proprietary skincare lines or take kickbacks from barbershops. In 45 focused minutes, we examine your cranial structure, hair density, beard growth patterns, and skin type to deliver high-signal advice.
          </p>
        </div>

        {/* 3 Core Principles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2">
            <span className="font-mono text-xs font-bold text-amber-400 block mb-1">
              PRINCIPLE 01
            </span>
            <h3 className="text-base font-bold text-white">No Fluff or Lectures</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Every consultation runs for exactly 45 minutes with a strict minute-by-minute agenda.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2">
            <span className="font-mono text-xs font-bold text-amber-400 block mb-1">
              PRINCIPLE 02
            </span>
            <h3 className="text-base font-bold text-white">Zero Sponsor Bias</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              We recommend affordable, accessible formulations and classic garments based strictly on effectiveness.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2">
            <span className="font-mono text-xs font-bold text-amber-400 block mb-1">
              PRINCIPLE 03
            </span>
            <h3 className="text-base font-bold text-white">Strict Confidentiality</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Your consultation is completely private. We never record calls or publish client photos publicly.
            </p>
          </div>
        </div>

        {/* Action Banner */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-zinc-900 via-zinc-900 to-amber-950/30 border border-amber-500/40 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
          <div>
            <h3 className="text-xl font-bold text-white mb-1">Schedule Your 1:1 Consultation</h3>
            <p className="text-xs text-zinc-300">
              Select an open 45-minute slot on our live calendar.
            </p>
          </div>
          <Link
            to="/book"
            className="py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-zinc-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-950/50 flex-shrink-0"
          >
            <span>View Calendar</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};
