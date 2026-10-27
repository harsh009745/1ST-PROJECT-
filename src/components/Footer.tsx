import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Mail, KeyRound, Sparkles } from 'lucide-react';
import { PROFILE_CONFIG } from '../config/profileConfig';

interface FooterProps {
  onOpenSetupGuide: () => void;
  isGatewayConfigured?: boolean;
}

export const Footer: React.FC<FooterProps> = ({ onOpenSetupGuide, isGatewayConfigured = false }) => {
  return (
    <footer className="w-full py-16 px-4 sm:px-6 lg:px-8 text-center text-xs text-zinc-500 border-t border-zinc-800/80 bg-[#09090b] mt-20">
      <div className="max-w-6xl mx-auto flex flex-col items-center gap-8">
        {/* Brand Header */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-amber-200 to-amber-500 flex items-center justify-center shadow-md">
            <Sparkles className="w-3.5 h-3.5 text-zinc-950" />
          </div>
          <span className="font-extrabold text-white tracking-wider uppercase text-sm">
            VALENCE &bull; PERSONAL AESTHETICS &amp; GROOMING
          </span>
        </div>

        {/* Multi-page Navigation Sitemap */}
        <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-6 text-left max-w-4xl py-6 border-y border-zinc-900">
          <div>
            <h4 className="text-[11px] font-bold text-amber-400 font-mono uppercase tracking-wider mb-3">
              Explore
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/" className="hover:text-amber-300 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-amber-300 transition-colors">
                  The 5 Pillars
                </Link>
              </li>
              <li>
                <Link to="/method" className="hover:text-amber-300 transition-colors">
                  The 45-Min Method
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-amber-300 transition-colors">
                  About VALENCE
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-[11px] font-bold text-amber-400 font-mono uppercase tracking-wider mb-3">
              The 5 Pillars
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/pillars/hairstyle" className="hover:text-amber-300 transition-colors">
                  01. Hairstyle Geometry
                </Link>
              </li>
              <li>
                <Link to="/pillars/skincare" className="hover:text-amber-300 transition-colors">
                  02. Skincare Routine
                </Link>
              </li>
              <li>
                <Link to="/pillars/facial-hair" className="hover:text-amber-300 transition-colors">
                  03. Facial Hair &amp; Jawline
                </Link>
              </li>
              <li>
                <Link to="/pillars/style" className="hover:text-amber-300 transition-colors">
                  04. Style &amp; Silhouettes
                </Link>
              </li>
              <li>
                <Link to="/pillars/blueprint" className="hover:text-amber-300 transition-colors">
                  05. Action Blueprint
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-[11px] font-bold text-amber-400 font-mono uppercase tracking-wider mb-3">
              Consultations
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/packages/complete-45" className="hover:text-amber-300 transition-colors">
                  Comprehensive 1:1
                </Link>
              </li>
              <li>
                <Link to="/packages/hair-grooming-45" className="hover:text-amber-300 transition-colors">
                  Hair &amp; Beard Intensive
                </Link>
              </li>
              <li>
                <Link to="/packages/skincare-style-45" className="hover:text-amber-300 transition-colors">
                  Skin &amp; Style Blueprint
                </Link>
              </li>
              <li>
                <Link to="/book" className="hover:text-amber-300 font-bold transition-colors">
                  Live Calendar &amp; Slots
                </Link>
              </li>
              <li>
                <Link to="/status" className="hover:text-amber-300 transition-colors">
                  Lookup Booking Reference
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-[11px] font-bold text-amber-400 font-mono uppercase tracking-wider mb-3">
              Support &amp; Legal
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/contact" className="hover:text-amber-300 transition-colors">
                  Contact &amp; Inquiries
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-amber-300 transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/policies" className="hover:text-amber-300 transition-colors">
                  Session Policies
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-amber-300 transition-colors">
                  Terms &amp; 24h Rescheduling
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-amber-300 transition-colors">
                  Privacy &amp; Zero Recording
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Gateway connection pill */}
        <div>
          <button
            onClick={onOpenSetupGuide}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium transition-colors border ${
              isGatewayConfigured
                ? 'bg-amber-950/40 border-amber-800/40 text-amber-300 hover:bg-amber-900/40'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
            }`}
          >
            <KeyRound className="w-3 h-3 text-amber-400" />
            <span>
              {isGatewayConfigured
                ? 'Razorpay Payment Gateway Connected'
                : 'Configure Gateway API Keys'}
            </span>
          </button>
        </div>

        <p className="flex items-center gap-1 text-zinc-400">
          <span>&copy; {PROFILE_CONFIG.copyrightYear}</span>
          <span className="font-semibold text-zinc-300">{PROFILE_CONFIG.name}</span>
          <span>&bull; Private 45-Minute Video Consultations</span>
        </p>

        <p className="flex items-center gap-1.5 text-zinc-400 text-xs">
          <span>Inquiries &amp; Rescheduling:</span>
          <a
            href={`mailto:${PROFILE_CONFIG.contactEmail}`}
            className="text-amber-400 hover:underline inline-flex items-center gap-1 font-mono"
          >
            <Mail className="w-3.5 h-3.5" />
            {PROFILE_CONFIG.contactEmail}
          </a>
        </p>

        <p className="max-w-2xl text-[11px] text-zinc-600 leading-relaxed">
          Disclaimer: VALENCE provides personalized styling, haircut geometry, and grooming advice for self-improvement and confidence. This is not medical, surgical, or dermatological advice. Individual results vary.
        </p>

        <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 pt-3 border-t border-zinc-900 w-full justify-center">
          <Shield className="w-3.5 h-3.5 text-amber-400/80" />
          <span>
            Server-verified 256-bit HMAC SHA-256 signatures &bull; Idempotent Webhook Verification &bull; No sensitive credential storage
          </span>
        </div>
      </div>
    </footer>
  );
};
