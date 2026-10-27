import React from 'react';
import { TrustSection } from '../components/TrustSection';
import { Mail, Clock, ShieldCheck, Calendar, Lock } from 'lucide-react';
import { PROFILE_CONFIG } from '../config/profileConfig';

export const PoliciesPage: React.FC = () => {
  return (
    <div className="w-full py-16 animate-in fade-in">
      <div className="text-center max-w-3xl mx-auto px-4 mb-4">
        <span className="text-amber-400 text-xs font-mono uppercase tracking-widest block mb-2">
          CLIENT COMMITMENT &bull; TRANSPARENCY
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
          Session Policies &amp; FAQ
        </h1>
        <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
          Clear, ethical terms designed to guarantee professional standards, punctuality, and client confidentiality.
        </p>
      </div>

      <TrustSection />

      {/* Direct Contact Support Box */}
      <div className="max-w-3xl mx-auto px-4 mt-12">
        <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 text-center space-y-3">
          <h3 className="text-lg font-bold text-white">Have a Specific Inquiry?</h3>
          <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
            Need to reschedule an existing appointment or inquire about custom group / enterprise sessions?
          </p>
          <div>
            <a
              href={`mailto:${PROFILE_CONFIG.contactEmail}?subject=Consultation%20Policy%20Inquiry`}
              className="inline-flex items-center gap-2 py-3 px-6 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold border border-zinc-700 transition-colors"
            >
              <Mail className="w-4 h-4 text-amber-400" />
              <span>Email {PROFILE_CONFIG.contactEmail}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
