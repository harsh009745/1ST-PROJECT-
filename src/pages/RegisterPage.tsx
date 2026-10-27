import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, User, Phone, Eye, EyeOff, Loader2, ArrowRight, ShieldCheck, Check, AlertCircle } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { register, loginWithGoogle, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/verify-email';

  React.useEffect(() => {
    if (user) {
      navigate('/account', { replace: true });
    }
  }, [user, navigate]);

  // Password strength checks
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage('Please provide your full legal name.');
      return;
    }

    if (!hasMinLength) {
      setErrorMessage('Password must contain at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Password confirmation does not match.');
      return;
    }

    if (!agreeTerms) {
      setErrorMessage('Please accept the Terms of Service and Privacy Policy to proceed.');
      return;
    }

    setLoading(true);
    const res = await register(email.trim(), password, name.trim(), phone.trim());
    setLoading(false);

    if (res.success) {
      navigate(redirectPath, { replace: true });
    } else {
      setErrorMessage(res.error || 'Failed to register. Please verify your details.');
    }
  };

  const handleGoogleSignUp = async () => {
    setGoogleLoading(true);
    setErrorMessage(null);
    const res = await loginWithGoogle();
    setGoogleLoading(false);
    if (res.success) {
      navigate(redirectPath, { replace: true });
    } else {
      setErrorMessage(res.error || 'Google sign-up could not be completed.');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg bg-zinc-900/80 border border-zinc-800 rounded-3xl p-8 sm:p-10 shadow-2xl backdrop-blur-xl relative overflow-hidden">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-400 text-[10px] uppercase font-mono tracking-widest mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Private Client Account</span>
          </div>
          <h1 className="text-3xl font-serif text-zinc-100 tracking-tight">Create Account</h1>
          <p className="text-xs text-zinc-400 mt-2">
            Register to schedule 1:1 aesthetics consultations, manage bookings, and access video rooms.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-red-950/40 border border-red-800/40 text-red-300 text-xs leading-relaxed flex items-start gap-2.5 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Google Sign Up */}
        <button
          type="button"
          onClick={handleGoogleSignUp}
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
          <span>Sign up with Google</span>
        </button>

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-zinc-800" />
          <span className="text-[10px] uppercase font-mono text-zinc-400">or with email</span>
          <div className="flex-1 h-px bg-zinc-800" />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Vikramaditya Sharma"
                className="w-full bg-zinc-950/70 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/40 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                Phone Number (Optional)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full bg-zinc-950/70 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/40 transition-colors"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
              Create Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
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

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="w-full bg-zinc-950/70 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/40 transition-colors"
              />
            </div>
          </div>

          {/* Password checklist */}
          <div className="grid grid-cols-2 gap-2 text-[11px] py-1">
            <span className={`flex items-center gap-1.5 ${hasMinLength ? 'text-emerald-400' : 'text-zinc-400'}`}>
              <Check className={`w-3.5 h-3.5 ${hasMinLength ? 'opacity-100' : 'opacity-30'}`} />
              8+ Characters
            </span>
            <span className={`flex items-center gap-1.5 ${hasUppercase ? 'text-emerald-400' : 'text-zinc-400'}`}>
              <Check className={`w-3.5 h-3.5 ${hasUppercase ? 'opacity-100' : 'opacity-30'}`} />
              Uppercase Letter
            </span>
            <span className={`flex items-center gap-1.5 ${hasNumber ? 'text-emerald-400' : 'text-zinc-400'}`}>
              <Check className={`w-3.5 h-3.5 ${hasNumber ? 'opacity-100' : 'opacity-30'}`} />
              Number Included
            </span>
            <span className={`flex items-center gap-1.5 ${passwordsMatch ? 'text-emerald-400' : 'text-zinc-400'}`}>
              <Check className={`w-3.5 h-3.5 ${passwordsMatch ? 'opacity-100' : 'opacity-30'}`} />
              Passwords Match
            </span>
          </div>

          <div className="pt-2">
            <label className="flex items-start gap-2.5 text-xs text-zinc-400 cursor-pointer select-none">
              <input
                type="checkbox"
                required
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded bg-zinc-950 border-zinc-800 text-amber-400 focus:ring-0 focus:ring-offset-0 cursor-pointer accent-amber-400 shrink-0"
              />
              <span>
                I agree to the{' '}
                <Link to="/terms" target="_blank" className="text-zinc-300 underline hover:text-amber-400">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" target="_blank" className="text-zinc-300 underline hover:text-amber-400">
                  Privacy Policy
                </Link>
                .
              </span>
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
                <span>Create Client Account</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-zinc-400">
          Already have an account?{' '}
          <Link
            to={`/login?redirect=${encodeURIComponent(redirectPath)}`}
            className="text-amber-400 hover:text-amber-300 font-medium transition-colors"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};
