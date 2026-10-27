import React, { useState } from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, ArrowRight, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAdmin = false,
}) => {
  const { user, loading, isAdmin, claimAdminAccess } = useAuth();
  const location = useLocation();
  const [claiming, setClaiming] = useState<boolean>(false);
  const [claimMessage, setClaimMessage] = useState<string | null>(null);
  const [claimError, setClaimError] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 rounded-full border border-amber-400/20 bg-amber-400/5 flex items-center justify-center mb-4">
          <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
        </div>
        <p className="text-xs uppercase tracking-widest text-zinc-400">Verifying Credentials</p>
      </div>
    );
  }

  // Not signed in
  if (!user) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  // Requires admin, but current user is only a customer
  if (requireAdmin && !isAdmin) {
    const handleClaim = async () => {
      setClaiming(true);
      setClaimError(null);
      setClaimMessage(null);
      const res = await claimAdminAccess();
      setClaiming(false);
      if (res.success) {
        setClaimMessage('Success! Administrator access has been verified for your account.');
      } else {
        setClaimError(res.error || 'Your current email is not listed in the server ADMIN_EMAILS.');
      }
    };

    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-lg bg-zinc-900/90 border border-zinc-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto mb-6">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <span className="text-[10px] font-mono uppercase tracking-widest text-red-400/90 bg-red-950/40 border border-red-800/30 px-3 py-1 rounded-full">
            Restricted Zone • 403 Forbidden
          </span>

          <h1 className="text-2xl font-serif text-zinc-100 tracking-tight mt-4 mb-2">
            Administrator Access Required
          </h1>

          <p className="text-sm text-zinc-400 leading-relaxed mb-6">
            You are signed in as <span className="text-zinc-200 font-mono">{user.email}</span>, which currently has standard client permissions. This dashboard is restricted to designated VALENCE practitioners and managers.
          </p>

          {claimMessage && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 text-xs flex items-center gap-2 text-left">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{claimMessage}</span>
            </div>
          )}

          {claimError && (
            <div className="mb-6 p-4 rounded-xl bg-red-950/40 border border-red-800/40 text-red-300 text-xs text-left">
              {claimError}
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={handleClaim}
              disabled={claiming}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-zinc-950 font-medium text-xs tracking-wider uppercase hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-400/10 cursor-pointer disabled:opacity-50"
            >
              {claiming ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              <span>Claim Admin Privileges (Whitelisted Emails)</span>
            </button>

            <Link
              to="/my-bookings"
              className="w-full py-3 px-4 rounded-xl bg-zinc-800/80 hover:bg-zinc-800 text-zinc-200 font-medium text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2 border border-zinc-700/60 block"
            >
              <span>Return to Client Bookings</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
