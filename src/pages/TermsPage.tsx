import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Clock, Calendar, Mail } from 'lucide-react';
import { PROFILE_CONFIG } from '../config/profileConfig';

export const TermsPage: React.FC = () => {
  return (
    <div className="w-full py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-left animate-in fade-in">
      <div className="mb-10 text-center">
        <span className="text-amber-400 text-xs font-mono uppercase tracking-widest block mb-2">
          LEGAL &bull; POLICIES
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
          Terms of Service &amp; Booking Policy
        </h1>
        <p className="text-xs text-zinc-400">Last updated: October 2026</p>
      </div>

      <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-6 sm:p-10 space-y-8 text-xs text-zinc-300 leading-relaxed shadow-xl">
        <section className="space-y-3">
          <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider font-mono">
            1. Consultation Duration &amp; Scope
          </h2>
          <p>
            All video consultations conducted by VALENCE run for exactly forty-five (45) minutes. Consultations begin promptly at the scheduled start time. To protect the schedules of subsequent clients, consultations will conclude precisely 45 minutes from the scheduled start time, regardless of whether a client joins late.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider font-mono">
            2. Rescheduling Policy
          </h2>
          <p>
            Clients may reschedule their scheduled consultation free of charge up to twenty-four (24) hours prior to the booked appointment time. Rescheduling requests must be sent via email to{' '}
            <a href={`mailto:${PROFILE_CONFIG.contactEmail}`} className="text-amber-400 underline">
              {PROFILE_CONFIG.contactEmail}
            </a>{' '}
            along with the unique booking reference. Rescheduling requests received within 24 hours of the scheduled time are not guaranteed and may be subject to forfeiture.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider font-mono">
            3. Cancellation &amp; Refund Policy
          </h2>
          <p>
            Because appointment slots are strictly reserved and withheld from other clients, cancellations made within 24 hours of the scheduled session or client no-shows are non-refundable. If a cancellation is requested more than 24 hours in advance, a full refund or rescheduling credit will be issued.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider font-mono">
            4. Non-Medical &amp; Non-Clinical Disclaimer
          </h2>
          <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-800/40 text-amber-200">
            VALENCE provides personal grooming, cosmetic hairstyle geometry, facial hair trimming, and clothing presentation advice. VALENCE does NOT provide medical diagnosis, dermatological prescriptions, orthodontic advice, surgical evaluations, or psychological counseling. No permanent changes to underlying bone or skeletal structure are promised.
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider font-mono">
            5. Client Code of Conduct
          </h2>
          <p>
            Clients are expected to maintain professional and respectful conduct during video consultations. We reserve the right to immediately terminate any session involving harassment, inappropriate behavior, or abusive language without refund.
          </p>
        </section>
      </div>
    </div>
  );
};
