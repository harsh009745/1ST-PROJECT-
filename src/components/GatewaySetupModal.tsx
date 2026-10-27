import React, { useState } from 'react';
import { X, KeyRound, Check, Copy, ExternalLink, ShieldCheck } from 'lucide-react';

interface GatewaySetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GatewaySetupModal: React.FC<GatewaySetupModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const envSnippet = `RAZORPAY_KEY_ID="rzp_test_YOUR_KEY_ID"
RAZORPAY_KEY_SECRET="YOUR_RAZORPAY_KEY_SECRET"
RAZORPAY_WEBHOOK_SECRET="YOUR_RAZORPAY_WEBHOOK_SECRET"`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(envSnippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
    >
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800 bg-zinc-950/70">
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-sm text-white">Razorpay Gateway Integration Setup</h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close setup guide"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs text-zinc-300 leading-relaxed text-left">
          <div className="p-3.5 bg-amber-950/30 border border-amber-800/40 rounded-2xl text-amber-300 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-400" />
            <div>
              <strong className="block font-semibold mb-0.5">Test Mode Active &amp; Supported</strong>
              Razorpay provides free test credentials with zero documentation needed. Test the full 45-minute booking flow with real Razorpay modals and mock UPI without actual funds.
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-white text-sm">Step 1: Obtain Razorpay Test Keys</h4>
            <ol className="list-decimal pl-4 space-y-1.5 text-zinc-400">
              <li>
                Log into your{' '}
                <a
                  href="https://dashboard.razorpay.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-400 underline inline-flex items-center gap-0.5 font-medium"
                >
                  Razorpay Dashboard <ExternalLink className="w-3 h-3 inline" />
                </a>
              </li>
              <li>Toggle the environment switch to <strong>Test Mode</strong> in the top header.</li>
              <li>Navigate to <strong>Account &amp; Settings &gt; API Keys</strong>.</li>
              <li>Generate or copy your <code>Key ID</code> and <code>Key Secret</code>.</li>
            </ol>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-white text-sm">Step 2: Add Keys to Secrets or .env</h4>
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 font-semibold"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied to Clipboard' : 'Copy Template'}</span>
              </button>
            </div>
            <pre className="p-3.5 bg-zinc-950 border border-zinc-800 rounded-xl text-amber-300 font-mono text-[11px] overflow-x-auto">
              {envSnippet}
            </pre>
            <p className="text-[11px] text-zinc-500">
              In Google AI Studio, add these variables in the Secrets panel, or store them in your local <code>.env</code> file.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-white text-sm">Step 3: Test Payment Information</h4>
            <div className="p-3.5 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-1.5 text-[11px]">
              <div>
                <span className="text-zinc-500">Virtual UPI VPA:</span>{' '}
                <code className="text-amber-400 font-mono">success@razorpay</code>
              </div>
              <div>
                <span className="text-zinc-500">Flow:</span> Select UPI in Checkout modal &gt; Type any 10-digit number &gt; Authorize simulation.
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950 flex justify-end">
          <button
            onClick={onClose}
            className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-zinc-950 font-bold text-xs shadow-md"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};
