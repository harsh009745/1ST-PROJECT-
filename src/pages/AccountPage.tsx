import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  User,
  Mail,
  Phone,
  Shield,
  Calendar,
  LogOut,
  CheckCircle2,
  AlertTriangle,
  Edit3,
  Loader2,
  Sparkles,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

export const AccountPage: React.FC = () => {
  const { user, isAdmin, logout, updateProfileDetails, sendVerificationEmail } = useAuth();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [phone, setPhone] = useState(user?.phoneNumber || '');
  const [updating, setUpdating] = useState(false);
  const [updateFeedback, setUpdateFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [resendingEmail, setResendingEmail] = useState(false);
  const [emailNotice, setEmailNotice] = useState<string | null>(null);

  const handleSignOut = async () => {
    await logout();
    navigate('/');
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setUpdateFeedback(null);

    const res = await updateProfileDetails(displayName.trim(), phone.trim());
    setUpdating(false);

    if (res.success) {
      setUpdateFeedback({ type: 'success', text: 'Profile successfully updated.' });
      setIsEditing(false);
    } else {
      setUpdateFeedback({ type: 'error', text: res.error || 'Failed to update profile.' });
    }
  };

  const handleResendVerification = async () => {
    setResendingEmail(true);
    setEmailNotice(null);
    const res = await sendVerificationEmail();
    setResendingEmail(false);
    if (res.success) {
      setEmailNotice('Verification link sent. Please check your inbox.');
    } else {
      setEmailNotice(res.error || 'Could not dispatch verification email.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      {/* Top Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono uppercase tracking-wider mb-8">
        <Link to="/" className="hover:text-zinc-200">
          Home
        </Link>
        <span>/</span>
        <span className="text-amber-400">Client Profile</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Profile Card */}
        <div className="md:col-span-1 bg-zinc-900/80 border border-zinc-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl h-fit">
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400/20 via-zinc-800 to-zinc-900 border-2 border-amber-400/30 flex items-center justify-center text-2xl font-serif text-amber-300 shadow-xl overflow-hidden">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || 'User'} className="w-full h-full object-cover" />
                ) : (
                  <span>{(user?.displayName || user?.email || 'U')[0].toUpperCase()}</span>
                )}
              </div>
              {isAdmin && (
                <div className="absolute -bottom-1 -right-1 bg-amber-400 text-zinc-950 p-1 rounded-full shadow" title="Platform Administrator">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
              )}
            </div>

            <h2 className="text-xl font-serif text-zinc-100 font-medium">
              {user?.displayName || 'Valued Client'}
            </h2>
            <p className="text-xs text-zinc-400 font-mono mt-0.5 break-all">{user?.email}</p>

            {/* Role Badge */}
            <div className="mt-3 flex items-center gap-2">
              <span
                className={`text-[10px] uppercase font-mono tracking-widest px-3 py-1 rounded-full border ${
                  isAdmin
                    ? 'bg-amber-400/15 border-amber-400/30 text-amber-400'
                    : 'bg-zinc-800/80 border-zinc-700/60 text-zinc-300'
                }`}
              >
                {isAdmin ? 'Administrator' : 'Private Client'}
              </span>

              {user?.emailVerified ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/30 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3" />
                  Verified
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={resendingEmail}
                  className="inline-flex items-center gap-1 text-[10px] font-mono text-amber-400 bg-amber-950/40 border border-amber-800/30 px-2 py-0.5 rounded-full hover:bg-amber-900/40 cursor-pointer"
                  title="Click to send verification link"
                >
                  <AlertTriangle className="w-3 h-3" />
                  {resendingEmail ? 'Sending...' : 'Unverified'}
                </button>
              )}
            </div>

            {emailNotice && (
              <p className="text-[11px] text-amber-300/90 mt-2 bg-amber-950/20 p-2 rounded-lg border border-amber-800/20">
                {emailNotice}
              </p>
            )}

            <div className="w-full h-px bg-zinc-800/80 my-6" />

            {/* Navigation Shortcuts */}
            <div className="w-full space-y-2">
              <Link
                to="/my-bookings"
                className="w-full py-2.5 px-4 rounded-xl bg-zinc-800/60 hover:bg-zinc-800 text-zinc-200 text-xs font-medium flex items-center justify-between border border-zinc-700/40 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-400" />
                  <span>My Consultations</span>
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
              </Link>

              {isAdmin && (
                <Link
                  to="/admin"
                  className="w-full py-2.5 px-4 rounded-xl bg-amber-400/10 hover:bg-amber-400/15 text-amber-300 text-xs font-medium flex items-center justify-between border border-amber-400/20 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-amber-400" />
                    <span>Admin Dashboard</span>
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                </Link>
              )}

              <Link
                to="/book"
                className="w-full py-2.5 px-4 rounded-xl bg-zinc-800/60 hover:bg-zinc-800 text-zinc-200 text-xs font-medium flex items-center justify-between border border-zinc-700/40 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Schedule Session</span>
                </span>
                <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
              </Link>

              <button
                type="button"
                onClick={handleSignOut}
                className="w-full py-2.5 px-4 rounded-xl bg-red-950/20 hover:bg-red-950/40 text-red-400 text-xs font-medium flex items-center justify-between border border-red-900/30 transition-colors cursor-pointer mt-4"
              >
                <span className="flex items-center gap-2">
                  <LogOut className="w-4 h-4 text-red-400" />
                  <span>Sign Out</span>
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Account Details & Editing */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-serif text-zinc-100 font-medium">Personal Details</h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Keep your consultation contact info and phone number current.
                </p>
              </div>

              {!isEditing && (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="py-1.5 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs flex items-center gap-1.5 border border-zinc-700 transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Edit Profile</span>
                </button>
              )}
            </div>

            {updateFeedback && (
              <div
                className={`mb-6 p-4 rounded-xl text-xs flex items-center gap-2 ${
                  updateFeedback.type === 'success'
                    ? 'bg-emerald-950/40 border border-emerald-800/40 text-emerald-300'
                    : 'bg-red-950/40 border border-red-800/40 text-red-300'
                }`}
              >
                {updateFeedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                )}
                <span>{updateFeedback.text}</span>
              </div>
            )}

            {isEditing ? (
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                    Full Legal Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full bg-zinc-950/70 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-amber-400/60"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                    Phone Number (WhatsApp for Meeting Reminders)
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
                      className="w-full bg-zinc-950/70 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-amber-400/60"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-3">
                  <button
                    type="submit"
                    disabled={updating}
                    className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-zinc-950 font-semibold text-xs tracking-wider uppercase hover:brightness-110 active:scale-[0.99] transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {updating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Save Changes</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setDisplayName(user?.displayName || '');
                      setPhone(user?.phoneNumber || '');
                    }}
                    className="py-2.5 px-4 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-medium hover:bg-zinc-700 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-zinc-950/50 border border-zinc-800/80">
                  <span className="text-[10px] font-mono uppercase text-zinc-400 block mb-1">
                    Display Name
                  </span>
                  <p className="text-sm text-zinc-200 font-medium">
                    {user?.displayName || 'Not specified'}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-950/50 border border-zinc-800/80">
                  <span className="text-[10px] font-mono uppercase text-zinc-400 block mb-1">
                    Primary Email
                  </span>
                  <p className="text-sm text-zinc-200 font-mono truncate">{user?.email}</p>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-950/50 border border-zinc-800/80">
                  <span className="text-[10px] font-mono uppercase text-zinc-400 block mb-1">
                    Phone / Contact
                  </span>
                  <p className="text-sm text-zinc-200 font-mono">
                    {user?.phoneNumber || 'No phone registered'}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-950/50 border border-zinc-800/80">
                  <span className="text-[10px] font-mono uppercase text-zinc-400 block mb-1">
                    Account Status
                  </span>
                  <p className="text-sm text-emerald-400 font-medium flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Active & Authenticated
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Quick link to upcoming consultations banner */}
          <div className="bg-gradient-to-r from-amber-400/10 via-amber-400/5 to-transparent border border-amber-400/20 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-medium">
                1:1 Looksmaxxing Video Room
              </span>
              <h4 className="text-lg font-serif text-zinc-100 font-medium mt-1">
                Your 45-Minute Consultation Schedule
              </h4>
              <p className="text-xs text-zinc-400 mt-1 max-w-md">
                View your confirmed appointment times, access your dedicated video room link, or reschedule in advance.
              </p>
            </div>
            <Link
              to="/my-bookings"
              className="py-3 px-5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-zinc-950 font-semibold text-xs tracking-wider uppercase hover:brightness-110 active:scale-[0.99] transition-all flex items-center gap-2 whitespace-nowrap shadow-lg shadow-amber-400/10"
            >
              <span>View My Bookings</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
