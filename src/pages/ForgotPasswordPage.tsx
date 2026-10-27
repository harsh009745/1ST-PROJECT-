import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { KeyRound, Mail, ArrowLeft, Loader2, CheckCircle2, ShieldCheck } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMessage('Please provide your registered email address.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    await resetPassword(email.trim());
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md bg-zinc-900/80 border border-zinc-800 rounded-3xl p-8 sm:p-10 shadow-2xl backdrop-blur-xl relative overflow-hidden">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-amber-400/10 border border-amber-400/20 text-amber-400 flex items-center justify-center mx-auto mb-4">
            <KeyRound className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-serif text-zinc-100 tracking-tight">Reset Password</h1>
          <p className="text-xs text-zinc-400 mt-2">
            Enter your account email to receive a secure password recovery link.
          </p>
        </div>

        {submitted ? (
          <div className="space-y-6 text-center animate-in fade-in duration-300">
            <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 text-xs leading-relaxed text-left flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
              <div>
                <p className="font-semibold text-emerald-200 mb-1">Check Your Inbox</p>
                <p>
                  If an account exists with{' '}
                  <span className="font-mono text-zinc-200">{email}</span>, we have dispatched a link to securely reset your credentials.
                </p>
              </div>
            </div>

            <p className="text-[11px] text-zinc-400">
              Did not receive the email? Check your spam/junk folder or try again in a few minutes.
            </p>

            <Link
              to="/login"
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-zinc-950 font-semibold text-xs tracking-wider uppercase hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-400/15 block"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Sign In</span>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMessage && (
              <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/40 text-red-300 text-xs leading-relaxed">
                {errorMessage}
              </div>
            )}

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                Registered Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full bg-zinc-950/70 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/40 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-zinc-950 font-semibold text-xs tracking-wider uppercase hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-400/15 cursor-pointer disabled:opacity-50 mt-4"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin text-zinc-950" />
              ) : (
                <span>Dispatch Reset Link</span>
              )}
            </button>

            <div className="pt-4 text-center">
              <Link
                to="/login"
                className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors inline-flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Sign In</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
