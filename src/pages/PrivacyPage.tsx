import React from 'react';
import { Lock, ShieldCheck, EyeOff } from 'lucide-react';
import { PROFILE_CONFIG } from '../config/profileConfig';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="w-full py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-left animate-in fade-in">
      <div className="mb-10 text-center">
        <span className="text-amber-400 text-xs font-mono uppercase tracking-widest block mb-2">
          DATA SECURITY &bull; INTEGRITY
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
          Privacy &amp; Confidentiality Guarantee
        </h1>
        <p className="text-xs text-zinc-400">Strict 100% Confidential Client Standard</p>
      </div>

      <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-6 sm:p-10 space-y-8 text-xs text-zinc-300 leading-relaxed shadow-xl">
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-amber-400">
            <EyeOff className="w-4 h-4" />
            <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider font-mono">
              1. Zero Video Recording Policy
            </h2>
          </div>
          <p>
            We strictly enforce a zero-recording policy during our private 45-minute video consultations. Calls are neither recorded, stored, nor transcribed. We believe candid, vulnerable discussions regarding your personal grooming require complete privacy.
          </p>
        </section>

        <section className="space-y-3">
          <div className="flex items-center gap-2 text-amber-400">
            <Lock className="w-4 h-4" />
            <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider font-mono">
              2. No Public Client Photographs
            </h2>
          </div>
          <p>
            Unlike generic transformation programs, VALENCE will never use your face, photos, hairline, or discussions as promotional marketing material, case studies, or social media advertisements without explicit, signed, written consent.
          </p>
        </section>

        <section className="space-y-3">
          <div className="flex items-center gap-2 text-amber-400">
            <ShieldCheck className="w-4 h-4" />
            <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider font-mono">
              3. Payment &amp; Financial Security
            </h2>
          </div>
          <p>
            All financial transactions are handled externally via Razorpay&apos;s PCI-DSS Level 1 certified payment gateway. VALENCE never views, captures, processes, or stores your UPI PINs, bank passwords, debit/credit card numbers, or CVVs.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider font-mono">
            4. Information We Collect
          </h2>
          <p>
            We collect only the bare minimum data necessary to coordinate and confirm your appointment: your full name, email address (for calendar dispatch and written blueprints), and 10-digit Indian mobile number (for UPI receipt and SMS reminders). This data is never sold, leased, or distributed to third parties.
          </p>
        </section>

        <section className="space-y-2 pt-4 border-t border-zinc-800">
          <h3 className="text-xs font-bold text-zinc-200">Contact the Privacy Officer</h3>
          <p className="text-zinc-400">
            If you have questions regarding data retention or wish to request complete deletion of your booking records after your consultation, contact{' '}
            <a href={`mailto:${PROFILE_CONFIG.contactEmail}`} className="text-amber-400 underline">
              {PROFILE_CONFIG.contactEmail}
            </a>.
          </p>
        </section>
      </div>
    </div>
  );
};
