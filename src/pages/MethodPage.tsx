import React from 'react';
import { Link } from 'react-router-dom';
import {
  Clock,
  Video,
  FileText,
  Lightbulb,
  CheckCircle2,
  Calendar,
  Camera,
  Sun,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';

export const MethodPage: React.FC = () => {
  const timeline = [
    {
      time: '00:00 – 00:10',
      title: 'Intake Review & Facial Geometry',
      desc: 'We examine your bone structure, jawline angle, temple width, and hairline growth whorls with live front and profile webcam angles.',
    },
    {
      time: '00:10 – 00:25',
      title: 'Hairstyle & Facial Hair Framing',
      desc: 'Determining exact haircut lengths, taper heights, styling products (clay vs. cream), and stubble neckline demarcation.',
    },
    {
      time: '00:25 – 00:35',
      title: 'Skincare Actives & Hygiene Routine',
      desc: 'Live audit of your existing cleanser, moisturizers, SPF, and active acids (retinoids, BHA). We formulate an evidence-based morning/evening protocol.',
    },
    {
      time: '00:35 – 00:45',
      title: 'Wardrobe Silhouettes & Action Blueprint',
      desc: 'Collar styles, clothing proportions, summary of primary action items, and live answering of your remaining grooming questions.',
    },
  ];

  const prepItems = [
    {
      icon: <Sun className="w-5 h-5 text-amber-400" />,
      title: 'Frontal or Natural Lighting',
      desc: 'Sit facing a window or place a light source in front of your face. Avoid backlighting which obscures skin texture and facial framing.',
    },
    {
      icon: <Camera className="w-5 h-5 text-amber-400" />,
      title: 'Eye-Level Webcam',
      desc: 'Position your laptop or smartphone camera at eye level so facial proportions are not distorted by steep upward angles.',
    },
    {
      icon: <FileText className="w-5 h-5 text-amber-400" />,
      title: 'Skincare Bottle List',
      desc: 'Have the names or bottles of your daily skincare and hair styling products nearby so we can inspect active ingredients directly.',
    },
    {
      icon: <Clock className="w-5 h-5 text-amber-400" />,
      title: 'Join 2 Minutes Early',
      desc: 'Every session starts promptly on the hour and ends at exactly 45 minutes to respect subsequent client bookings.',
    },
  ];

  return (
    <div className="w-full py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto animate-in fade-in">
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/40 border border-amber-800/40 text-amber-300 text-xs font-mono uppercase mb-3">
          <Clock className="w-3.5 h-3.5" />
          <span>METHODOLOGY &bull; EXACTLY 45 MINUTES</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
          The 45-Minute Consultation Method
        </h1>
        <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
          How our private 1-on-1 video consultations are structured to deliver maximum clarity, actionable routines, and zero wasted time.
        </p>
      </div>

      {/* Breakdown Timeline */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-6 sm:p-10 mb-16 shadow-2xl">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
          Call Structure: Minute-by-Minute Breakdown
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400 mb-8">
          Every session follows a strict professional sequence so no key aesthetic pillar is overlooked.
        </p>

        <div className="space-y-6">
          {timeline.map((item, idx) => (
            <div
              key={idx}
              className="flex flex-col sm:flex-row items-start gap-4 p-5 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 hover:border-amber-500/30 transition-colors"
            >
              <span className="font-mono text-xs font-bold text-amber-400 bg-amber-950/60 border border-amber-800/40 px-3 py-1.5 rounded-lg flex-shrink-0">
                {item.time}
              </span>
              <div>
                <h3 className="text-base font-bold text-white mb-1">{item.title}</h3>
                <p className="text-xs text-zinc-300 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Video Call Setup Guide */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-6 sm:p-10 mb-16 shadow-2xl">
        <div className="flex items-center gap-2 mb-2">
          <Lightbulb className="w-5 h-5 text-amber-400" />
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            Pre-Call Lighting &amp; Camera Preparation
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-zinc-400 mb-8">
          To ensure accurate evaluation of your skin texture, hairline framing, and jawline angles, follow these quick technical tips.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {prepItems.map((p, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-zinc-950/60 border border-zinc-800 space-y-2"
            >
              <div className="p-2.5 rounded-xl bg-zinc-900 w-fit">{p.icon}</div>
              <h3 className="text-sm font-bold text-white">{p.title}</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Deliverable Blueprint Overview */}
      <div className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-amber-950/30 border border-amber-500/40 rounded-3xl p-8 sm:p-10 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-8 shadow-2xl">
        <div className="space-y-3 max-w-xl">
          <span className="text-amber-400 text-xs font-mono uppercase tracking-widest block">
            POST-CALL DELIVERABLE
          </span>
          <h3 className="text-2xl font-bold text-white">
            Your Written Consultation Blueprint PDF
          </h3>
          <p className="text-xs text-zinc-300 leading-relaxed">
            Within 24 hours of your video call, you receive a tailored written blueprint summarizing your exact barber references, styling products, daily morning/night skincare regimen, and 30-day checklist.
          </p>
          <div className="flex flex-wrap gap-3 text-xs text-zinc-300 pt-1">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" /> High-res haircut references
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" /> Active skincare formulation guide
            </span>
          </div>
        </div>

        <Link
          to="/book"
          className="py-4 px-8 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:brightness-105 active:scale-95 text-zinc-950 font-bold text-sm shadow-xl shadow-amber-950/50 flex items-center gap-2 flex-shrink-0 cursor-pointer"
        >
          <Calendar className="w-4 h-4" />
          <span>Book 45-Min Session</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
