import React from 'react';
import { useParams, Link, Navigate, useNavigate } from 'react-router-dom';
import {
  Clock,
  CheckCircle2,
  Calendar,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Video,
  FileText,
} from 'lucide-react';
import { ServiceItem } from '../types';

interface PackageDetailPageProps {
  services: ServiceItem[];
}

export const PackageDetailPage: React.FC<PackageDetailPageProps> = ({ services }) => {
  const { packageId } = useParams<{ packageId: string }>();
  const navigate = useNavigate();

  const selectedPkg = services.find((s) => s.id === packageId);

  if (!selectedPkg) {
    return <Navigate to="/services" replace />;
  }

  return (
    <div className="w-full py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto animate-in fade-in">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-zinc-500 mb-8">
        <Link to="/" className="hover:text-amber-400 transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/services" className="hover:text-amber-400 transition-colors">
          Packages
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-zinc-200 font-semibold">{selectedPkg.name}</span>
      </nav>

      {/* Package Header Card */}
      <div className="bg-gradient-to-b from-zinc-900 via-zinc-900 to-amber-950/20 border border-amber-500/50 rounded-3xl p-6 sm:p-10 shadow-2xl mb-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-800/60 text-amber-300 text-xs font-mono font-bold mb-2">
              <Clock className="w-3.5 h-3.5" />
              <span>STRICTLY 45 MINUTES</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              {selectedPkg.name}
            </h1>
          </div>

          <div className="text-left sm:text-right flex-shrink-0">
            <span className="text-3xl sm:text-4xl font-black text-amber-400 font-mono">
              ₹{selectedPkg.basePriceINR.toLocaleString('en-IN')}
            </span>
            <span className="block text-xs text-zinc-400 font-mono">INR &bull; All-Inclusive</span>
          </div>
        </div>

        <p className="text-sm sm:text-base text-zinc-300 leading-relaxed my-6">
          {selectedPkg.fullDescription || selectedPkg.description}
        </p>

        {/* Action Button */}
        <div className="pt-2">
          <button
            onClick={() => navigate(`/book?service=${selectedPkg.id}`)}
            className="w-full sm:w-auto py-4 px-8 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:brightness-105 active:scale-95 text-zinc-950 font-bold text-sm shadow-xl shadow-amber-950/50 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Calendar className="w-4 h-4" />
            <span>Select Date &amp; Book This 45-Min Session</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* What is Included */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-6 sm:p-10 mb-10 shadow-xl space-y-6">
        <h2 className="text-xl font-bold text-white">What is Included in This 45-Min Consultation</h2>
        <div className="space-y-3">
          {selectedPkg.features.map((feat, idx) => (
            <div key={idx} className="flex items-start gap-3 p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800/80 text-xs text-zinc-200">
              <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <span className="leading-relaxed font-medium">{feat}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Post-Call Deliverables */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-6 sm:p-10 mb-10 shadow-xl space-y-4">
        <div className="flex items-center gap-2 text-amber-400">
          <FileText className="w-5 h-5" />
          <h2 className="text-xl font-bold text-white">Post-Call Deliverables</h2>
        </div>
        <p className="text-xs text-zinc-300 leading-relaxed">
          Within 24 hours after your video consultation, you will receive a clean, organized PDF summarizing everything discussed:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-xs text-zinc-400">
          <li>Custom haircut reference photos &amp; barber instructions</li>
          <li>Morning and evening skincare ingredient routine</li>
          <li>Beard neckline and cheek contour demarcations</li>
          <li>Direct product links without sponsor bias</li>
          <li>30-day prioritized action checklist</li>
        </ul>
      </div>

      {/* Other Packages */}
      <div className="pt-6 border-t border-zinc-800">
        <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-4">
          Other Consultation Tiers
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {services
            .filter((s) => s.id !== selectedPkg.id)
            .map((other) => (
              <Link
                key={other.id}
                to={`/packages/${other.id}`}
                className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-amber-500/40 transition-colors flex justify-between items-center"
              >
                <div>
                  <h4 className="text-sm font-bold text-white">{other.name}</h4>
                  <span className="text-xs text-zinc-500">45 minutes</span>
                </div>
                <span className="font-bold text-amber-400 font-mono text-xs">
                  ₹{other.basePriceINR.toLocaleString('en-IN')}
                </span>
              </Link>
            ))}
        </div>
      </div>
    </div>
  );
};
