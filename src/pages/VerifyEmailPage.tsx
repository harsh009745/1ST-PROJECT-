import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MailCheck, RefreshCw, Send, ArrowRight, ShieldAlert, CheckCircle2 } from 'lucide-react';

export const VerifyEmailPage: React.FC = () => {
  const { user, sendVerificationEmail, firebaseUser } = useAuth();
  const [cooldown, setCooldown] = useState(0);
  const [sentMessage, setSentMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let timer: any;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleResend = async () => {
    if (cooldown > 0) return;
    setErrorMessage(null);
    setSentMessage(null);

    const res = await sendVerificationEmail();
    if (res.success) {
      setSentMessage('A fresh verification link has been dispatched to your email address.');
      setCooldown(60);
    } else {
      setErrorMessage(res.error || 'Failed to dispatch verification email. Try again shortly.');
    }
  };

  const handleCheckStatus = async () => {
    setChecking(true);
    setErrorMessage(null);
    try {
      if (firebaseUser) {
        await firebaseUser.reload();
        if (firebaseUser.emailVerified) {
          navigate('/account', { replace: true });
          return;
        }
      }
      setSentMessage('Status refreshed. If you already clicked the link in your email, please reload or proceed.');
    } catch (err: any) {
      setErrorMessage('Could not refresh verification status right now.');
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md bg-zinc-900/80 border border-zinc-800 rounded-3xl p-8 sm:p-10 shadow-2xl backdrop-blur-xl text-center relative overflow-hidden">
        <div className="w-16 h-16 rounded-2xl bg-amber-400/10 border border-amber-400/20 text-amber-400 flex items-center justify-center mx-auto mb-6">
          <MailCheck className="w-8 h-8" />
        </div>

        <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 bg-amber-400/10 border border-amber-400/20 px-3 py-1 rounded-full">
          Email Verification
        </span>

        <h1 className="text-2xl font-serif text-zinc-100 tracking-tight mt-4 mb-2">
          Verify Your Inbox
        </h1>

        <p className="text-xs text-zinc-400 leading-relaxed mb-6">
          We sent a verification link to{' '}
          <span className="text-zinc-200 font-medium font-mono">
            {user?.email || 'your registered email'}
          </span>
          . Please verify to ensure you receive calendar invites and private consultation room credentials.
        </p>

        {sentMessage && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 text-xs flex items-center gap-2 text-left">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{sentMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-red-950/40 border border-red-800/40 text-red-300 text-xs text-left">
            {errorMessage}
          </div>
        )}

        <div className="space-y-3">
          <button
            type="button"
            onClick={handleCheckStatus}
            disabled={checking}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-zinc-950 font-semibold text-xs tracking-wider uppercase hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-400/15 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin' : ''}`} />
            <span>I've Verified (Check Status)</span>
          </button>

          <button
            type="button"
            onClick={handleResend}
            disabled={cooldown > 0}
            className="w-full py-3 px-4 rounded-xl bg-zinc-800/80 hover:bg-zinc-800 text-zinc-200 font-medium text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2 border border-zinc-700/60 cursor-pointer disabled:opacity-40"
          >
            <Send className="w-3.5 h-3.5 text-zinc-400" />
            <span>{cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Verification Email'}</span>
          </button>

          <Link
            to="/account"
            className="w-full py-2.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors flex items-center justify-center gap-1.5 block pt-2"
          >
            <span>Proceed to Account Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
