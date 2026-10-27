import React, { useState } from 'react';
import { Share2, Check, User, ShieldCheck, MapPin, Edit3, X } from 'lucide-react';
import { PROFILE_CONFIG } from '../config/profileConfig';

interface ProfileHeaderProps {
  customName?: string;
  customHandle?: string;
  customBio?: string;
  customAvatar?: string;
  onUpdateProfile?: (profile: { name: string; handle: string; bio: string; avatarUrl: string }) => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  customName = PROFILE_CONFIG.name,
  customHandle = PROFILE_CONFIG.handle,
  customBio = PROFILE_CONFIG.bio,
  customAvatar = PROFILE_CONFIG.avatarUrl,
  onUpdateProfile,
}) => {
  const [copied, setCopied] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Form states
  const [name, setName] = useState(customName);
  const [handle, setHandle] = useState(customHandle);
  const [bio, setBio] = useState(customBio);
  const [avatar, setAvatar] = useState(customAvatar);

  const handleShare = async () => {
    const shareData = {
      title: `${name} | Official Bio & Booking`,
      text: bio,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // User dismissed share dialog
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2200);
      } catch {
        // clipboard access restricted
      }
    }
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateProfile) {
      onUpdateProfile({ name, handle, bio, avatarUrl: avatar });
    }
    setImgError(false);
    setIsEditing(false);
  };

  return (
    <header className="flex flex-col items-center text-center px-4 pt-10 pb-4 relative w-full">
      {/* Top action buttons */}
      <div className="absolute right-4 top-6 flex items-center gap-2">
        <button
          onClick={() => setIsEditing(true)}
          aria-label="Edit Profile Details"
          title="Customize Profile info"
          className="p-2.5 rounded-full bg-zinc-900/80 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
        >
          <Edit3 className="w-4 h-4" />
        </button>

        <button
          onClick={handleShare}
          aria-label="Share profile link"
          title="Share profile"
          className="p-2.5 rounded-full bg-zinc-900/80 border border-zinc-800 text-zinc-300 hover:text-emerald-400 hover:border-emerald-500/40 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Share feedback toast banner */}
      {copied && (
        <div className="absolute top-16 right-4 bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 text-xs px-3 py-1.5 rounded-lg shadow-lg animate-in fade-in z-20 flex items-center gap-1.5">
          <Check className="w-3.5 h-3.5" />
          <span>Profile link copied to clipboard!</span>
        </div>
      )}

      {/* Avatar Container */}
      <div className="relative mb-3 group">
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 border-emerald-500/60 p-1 bg-gradient-to-b from-zinc-800 to-zinc-950 shadow-xl shadow-emerald-950/40">
          {!imgError && avatar ? (
            <img
              src={avatar}
              alt={name}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover rounded-full transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-zinc-400 rounded-full">
              <User className="w-12 h-12 text-zinc-500" />
            </div>
          )}
        </div>
        <div
          title="Verified Creator & Payment Gateway Active"
          className="absolute -bottom-1 right-1 bg-emerald-500 text-zinc-950 p-1 rounded-full border-2 border-zinc-950 shadow-md"
        >
          <ShieldCheck className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Profile info */}
      <div className="flex items-center gap-1.5 justify-center mb-1">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">{name}</h1>
      </div>

      <div className="flex items-center justify-center gap-2 mb-2">
        <span className="text-xs sm:text-sm font-medium text-emerald-400 bg-emerald-950/50 px-2.5 py-0.5 rounded-full border border-emerald-800/40">
          {handle}
        </span>
        <span className="text-[11px] text-zinc-400 flex items-center gap-1">
          <MapPin className="w-3 h-3 text-zinc-500" />
          {PROFILE_CONFIG.location}
        </span>
      </div>

      <p className="max-w-md text-xs sm:text-sm text-zinc-300 leading-relaxed font-normal px-2">
        {bio}
      </p>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-5 text-left shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-4">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-semibold text-white">Customize Profile Info</h3>
              </div>
              <button
                onClick={() => setIsEditing(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1 font-medium">Display Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-medium">Username / Handle</label>
                <input
                  type="text"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-medium">Short Bio</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-medium">Avatar Image URL (or Unsplash)</label>
                <input
                  type="url"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 py-2 px-3 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-3 rounded-lg bg-emerald-500 text-zinc-950 font-semibold hover:bg-emerald-400 transition-colors"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};
