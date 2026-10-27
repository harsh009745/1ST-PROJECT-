import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, Eye, EyeOff, Loader2, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { login, loginWithGoogle, user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get('redirect') || (isAdmin ? '/admin' : '/account');

  // If already logged in, redirect immediately
  React.useEffect(() => {
    if (user) {
      navigate(redirectPath, { replace: true });
    }
  }, [user, navigate, redirectPath]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMessage('Please enter both your email and password.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    const res = await login(email.trim(), password);
    setLoading(false);

    if (res.success) {
      navigate(redirectPath, { replace: true });
    } else {
      setErrorMessage(res.error || 'Authentication failed. Please check your credentials.');
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setErrorMessage(null);
    const res = await loginWithGoogle();
    setGoogleLoading(false);
    if (res.success) {
      navigate(redirectPath, { replace: true });
    } else {
      setErrorMessage(res.error || 'Google sign-in could not be completed.');
    }
  };

  const fillQuickCredentials = (roleType: 'customer' | 'admin') => {
    if (roleType === 'admin') {
      setEmail('meetaryan027@gmail.com');
      setPassword('AdminPass123!');
    } else {
      setEmail('client@example.com');
      setPassword('ClientPass123!');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md bg-zinc-900/80 border border-zinc-800 rounded-3xl p-8 sm:p-10 shadow-2xl backdrop-blur-xl relative overflow-hidden">
        {/* Ambient subtle glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-400 text-[10px] uppercase font-mono tracking-widest mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Encrypted Session</span>
          </div>
          <h1 className="text-3xl font-serif text-zinc-100 tracking-tight">Sign In</h1>
          <p className="text-xs text-zinc-400 mt-2">
            Access your consultation blueprints, booking schedule, and meeting room.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-red-950/40 border border-red-800/40 text-red-300 text-xs leading-relaxed animate-in fade-in duration-200">
            {errorMessage}
          </div>
        )}

        {/* Google Sign In */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={googleLoading || loading}
          className="w-full py-3 px-4 rounded-xl bg-zinc-800/80 hover:bg-zinc-800 text-zinc-200 font-medium text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-3 border border-zinc-700/60 mb-6 cursor-pointer disabled:opacity-50"
        >
          {googleLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
          ) : (
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          )}
          <span>Continue with Google</span>
        </button>

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-zinc-800" />
          <span className="text-[10px] uppercase font-mono text-zinc-400">or sign in with email</span>
          <div className="flex-1 h-px bg-zinc-800" />
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
              Email Address
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

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-[11px] text-amber-400/80 hover:text-amber-300 transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-zinc-950/70 border border-zinc-800 rounded-xl pl-10 pr-10 py-2.5 text-sm text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/40 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-zinc-400 select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded bg-zinc-950 border-zinc-800 text-amber-400 focus:ring-0 focus:ring-offset-0 cursor-pointer accent-amber-400"
              />
              <span>Remember this session</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading || googleLoading}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-zinc-950 font-semibold text-xs tracking-wider uppercase hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-400/15 cursor-pointer disabled:opacity-50 mt-4"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin text-zinc-950" />
            ) : (
              <>
                <span>Sign In to VALENCE</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Quick Test Demo Helpers */}
        <div className="mt-6 pt-6 border-t border-zinc-800/80">
          <p className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 text-center mb-2.5">
            Quick Preview Credentials
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => fillQuickCredentials('customer')}
              className="py-1.5 px-2 rounded-lg bg-zinc-950/60 hover:bg-zinc-800 border border-zinc-800 text-[11px] text-zinc-300 transition-colors"
            >
              Fill Client Demo
            </button>
            <button
              type="button"
              onClick={() => fillQuickCredentials('admin')}
              className="py-1.5 px-2 rounded-lg bg-zinc-950/60 hover:bg-zinc-800 border border-amber-400/20 text-[11px] text-amber-400 transition-colors flex items-center justify-center gap-1"
            >
              <Sparkles className="w-3 h-3" />
              <span>Fill Admin Demo</span>
            </button>
          </div>
        </div>

        {/* Link to Register */}
        <div className="mt-8 text-center text-xs text-zinc-400">
          New to VALENCE Aesthetics?{' '}
          <Link
            to={`/register?redirect=${encodeURIComponent(redirectPath)}`}
            className="text-amber-400 hover:text-amber-300 font-medium transition-colors"
          >
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
};
