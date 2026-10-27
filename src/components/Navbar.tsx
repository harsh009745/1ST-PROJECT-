import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  Menu,
  X,
  Calendar,
  KeyRound,
  Search,
  User,
  Shield,
  LogOut,
  LogIn,
} from 'lucide-react';

interface NavbarProps {
  onOpenSetupGuide: () => void;
  isGatewayConfigured?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSetupGuide,
  isGatewayConfigured = false,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const { user, isAdmin, logout } = useAuth();

  const handleSignOut = async () => {
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    await logout();
    navigate('/');
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: '5 Pillars', path: '/services' },
    { name: 'The 45-Min Method', path: '/method' },
    { name: 'Book 1:1 Call', path: '/book' },
    { name: 'Lookup', path: '/status' },
  ];

  return (
    <nav className="sticky top-0 z-40 w-full backdrop-blur-md bg-[#09090b]/90 border-b border-zinc-800/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link
            to="/"
            className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-amber-400 rounded-lg p-1"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 flex items-center justify-center shadow-md shadow-amber-950/40 group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4 text-zinc-950" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-base font-bold tracking-wider text-zinc-100 uppercase font-sans">
                VALENCE
              </span>
              <span className="text-[10px] tracking-widest text-amber-300 uppercase font-mono">
                Men&apos;s Aesthetics &bull; 45 Min
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-5 text-xs font-medium text-zinc-300">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `transition-colors py-1 px-2 rounded-md ${
                    isActive
                      ? 'text-amber-300 font-bold bg-amber-950/40 border border-amber-800/40'
                      : 'text-zinc-300 hover:text-amber-300 hover:bg-zinc-900/60'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}

            {user && (
              <NavLink
                to="/my-bookings"
                className={({ isActive }) =>
                  `transition-colors py-1 px-2 rounded-md ${
                    isActive
                      ? 'text-amber-300 font-bold bg-amber-950/40 border border-amber-800/40'
                      : 'text-zinc-300 hover:text-amber-300 hover:bg-zinc-900/60'
                  }`
                }
              >
                My Bookings
              </NavLink>
            )}

            {user && isAdmin && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `transition-colors py-1 px-2.5 rounded-md flex items-center gap-1.5 ${
                    isActive
                      ? 'text-amber-300 font-bold bg-amber-400/20 border border-amber-400/40'
                      : 'text-amber-400/90 hover:text-amber-300 hover:bg-amber-400/10 border border-amber-400/20'
                  }`
                }
              >
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                <span>Admin Console</span>
              </NavLink>
            )}
          </div>

          {/* Desktop Action Controls */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={onOpenSetupGuide}
              title="Razorpay Gateway Status & Keys"
              className={`py-1.5 px-2.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 ${
                isGatewayConfigured
                  ? 'bg-amber-950/30 border-amber-800/40 text-amber-300 hover:bg-amber-900/30'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden xl:inline">
                {isGatewayConfigured ? 'Gateway Active' : 'API Keys'}
              </span>
            </button>

            {user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="py-1.5 px-3 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-200 text-xs font-medium flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center font-mono text-xs font-bold">
                    {(user.displayName || user.email)[0].toUpperCase()}
                  </div>
                  <span className="max-w-[100px] truncate">
                    {user.displayName || user.email.split('@')[0]}
                  </span>
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-2xl p-1.5 shadow-2xl backdrop-blur-xl z-50 text-xs">
                    <div className="px-3 py-2 border-b border-zinc-800 mb-1">
                      <p className="font-medium text-zinc-200 truncate">
                        {user.displayName || 'Client'}
                      </p>
                      <p className="text-[10px] text-zinc-400 font-mono truncate">{user.email}</p>
                    </div>

                    <Link
                      to="/account"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-zinc-300 hover:text-amber-300 hover:bg-zinc-800 rounded-lg transition-colors"
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>Account Settings</span>
                    </Link>

                    <Link
                      to="/my-bookings"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-zinc-300 hover:text-amber-300 hover:bg-zinc-800 rounded-lg transition-colors"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>My Consultations</span>
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-amber-400 hover:bg-zinc-800 rounded-lg transition-colors"
                      >
                        <Shield className="w-3.5 h-3.5" />
                        <span>Admin Console</span>
                      </Link>
                    )}

                    <div className="h-px bg-zinc-800 my-1" />

                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="w-full text-left flex items-center gap-2 px-3 py-2 text-red-400 hover:bg-red-950/30 rounded-lg transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="py-2 px-3.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 font-medium text-xs border border-zinc-700/80 transition-colors flex items-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5 text-amber-400" />
                <span>Sign In</span>
              </Link>
            )}

            <Link
              to="/book"
              className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:brightness-105 active:scale-95 text-zinc-950 font-bold text-xs transition-all shadow-md shadow-amber-950/50 flex items-center gap-1.5 cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Book 45-Min Call</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => navigate('/status')}
              title="Lookup Appointment"
              className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white"
            >
              <Search className="w-4 h-4 text-amber-400" />
            </button>

            <button
              onClick={onOpenSetupGuide}
              className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
              aria-label="Gateway status"
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-zinc-800 space-y-2 animate-in fade-in slide-in-from-top-2">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `block w-full text-left px-3.5 py-2.5 text-sm rounded-xl transition-colors ${
                    isActive
                      ? 'text-amber-300 font-bold bg-amber-950/40 border border-amber-800/40'
                      : 'text-zinc-300 hover:text-amber-300 hover:bg-zinc-900/60'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}

            {user ? (
              <>
                <NavLink
                  to="/my-bookings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-left px-3.5 py-2.5 text-sm rounded-xl text-zinc-300 hover:text-amber-300 hover:bg-zinc-900/60 transition-colors"
                >
                  My Consultations
                </NavLink>

                <NavLink
                  to="/account"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-left px-3.5 py-2.5 text-sm rounded-xl text-zinc-300 hover:text-amber-300 hover:bg-zinc-900/60 transition-colors"
                >
                  Account Profile ({user.email})
                </NavLink>

                {isAdmin && (
                  <NavLink
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full text-left px-3.5 py-2.5 text-sm rounded-xl text-amber-400 bg-amber-400/10 border border-amber-400/20"
                  >
                    Admin Console
                  </NavLink>
                )}

                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full text-left px-3.5 py-2.5 text-sm rounded-xl text-red-400 hover:bg-red-950/30 transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <NavLink
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-left px-3.5 py-2.5 text-sm rounded-xl text-amber-300 bg-zinc-900 border border-zinc-800"
              >
                Sign In / Register
              </NavLink>
            )}

            <div className="pt-2">
              <Link
                to="/book"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-zinc-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-950/40"
              >
                <Calendar className="w-4 h-4" />
                <span>Book 45-Min Consultation</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
