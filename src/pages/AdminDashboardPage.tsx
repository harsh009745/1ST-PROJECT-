import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Shield,
  TrendingUp,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Users,
  Search,
  Filter,
  RefreshCw,
  Edit2,
  ExternalLink,
  Video,
  Key,
  X,
  Loader2,
  Save,
  Sparkles,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

interface AdminStats {
  totalBookings: number;
  confirmedBookings: number;
  pendingBookings: number;
  cancelledBookings: number;
  totalRevenueINR: number;
  totalUsers: number;
  upcomingConsultations: number;
}

interface AdminBooking {
  bookingReference: string;
  serviceId: string;
  serviceName: string;
  durationMinutes: number;
  date: string;
  timeSlot: string;
  amountINR: number;
  currency: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    goalsNotes?: string;
  };
  status: 'AWAITING_PAYMENT' | 'PAYMENT_PENDING' | 'PAYMENT_CONFIRMED' | 'FAILED' | 'CANCELLED';
  meetingUrl?: string;
  meetingInstructions?: string;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  createdAt: string;
}

interface AdminUser {
  uid: string;
  email: string;
  displayName?: string;
  phoneNumber?: string;
  role: 'customer' | 'admin';
  emailVerified: boolean;
  createdAt: string;
}

export const AdminDashboardPage: React.FC = () => {
  const { getIdToken, user } = useAuth();
  const [activeTab, setActiveTab] = useState<'bookings' | 'users' | 'config'>('bookings');

  // Stats & Data
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Edit Modal State
  const [editingBooking, setEditingBooking] = useState<AdminBooking | null>(null);
  const [newMeetingUrl, setNewMeetingUrl] = useState('');
  const [newStatus, setNewStatus] = useState<AdminBooking['status']>('PAYMENT_CONFIRMED');
  const [newInstructions, setNewInstructions] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);
  const [editMessage, setEditMessage] = useState<string | null>(null);

  const loadData = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const token = await getIdToken();
      const headers = {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      const [resStats, resBookings, resUsers] = await Promise.all([
        fetch('/api/admin/overview', { headers }),
        fetch(`/api/admin/bookings?status=${statusFilter}&search=${encodeURIComponent(searchQuery)}`, {
          headers,
        }),
        fetch('/api/admin/users', { headers }),
      ]);

      if (!resStats.ok || !resBookings.ok) {
        throw new Error('Failed to load administrator records. Verify privileges.');
      }

      const statsData = await resStats.json();
      const bookingsData = await resBookings.json();
      const usersData = resUsers.ok ? await resUsers.json() : { users: [] };

      setStats(statsData.stats);
      setBookings(bookingsData.bookings || []);
      setUsers(usersData.users || []);
    } catch (err: any) {
      console.error('Error loading admin console:', err);
      setError(err.message || 'Administrator data could not be fetched.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData(true);
  };

  const openEditModal = (booking: AdminBooking) => {
    setEditingBooking(booking);
    setNewMeetingUrl(booking.meetingUrl || '');
    setNewStatus(booking.status);
    setNewInstructions(booking.meetingInstructions || '');
    setEditMessage(null);
  };

  const handleSaveBookingEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBooking) return;

    setSavingEdit(true);
    setEditMessage(null);

    try {
      const token = await getIdToken();
      const res = await fetch(`/api/admin/bookings/${editingBooking.bookingReference}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          meetingUrl: newMeetingUrl.trim(),
          status: newStatus,
          meetingInstructions: newInstructions.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update booking');
      }

      setEditMessage('Booking updated successfully.');
      setSavingEdit(false);
      setTimeout(() => {
        setEditingBooking(null);
        loadData(true);
      }, 700);
    } catch (err: any) {
      setSavingEdit(false);
      setEditMessage(err.message || 'Error saving changes');
    }
  };

  const handleToggleUserRole = async (targetEmail: string, currentRole: 'customer' | 'admin') => {
    const nextRole = currentRole === 'admin' ? 'customer' : 'admin';
    try {
      const token = await getIdToken();
      const res = await fetch(`/api/admin/users/${encodeURIComponent(targetEmail)}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ role: nextRole }),
      });

      if (res.ok) {
        loadData(true);
      }
    } catch (err) {
      console.error('Failed toggling role:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono uppercase tracking-wider mb-2">
            <Link to="/" className="hover:text-zinc-200">
              VALENCE
            </Link>
            <span>/</span>
            <span className="text-amber-400">Admin Console</span>
          </div>
          <h1 className="text-3xl font-serif text-zinc-100 tracking-tight flex items-center gap-3">
            <span>Consultation Operations</span>
            <span className="text-xs uppercase font-mono tracking-widest px-2.5 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-400">
              Restricted
            </span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Logged in as <span className="text-zinc-200 font-mono">{user?.email}</span> • Real-time slot management, client bookings, and video meeting credentials.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => loadData(true)}
            disabled={refreshing}
            className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-zinc-100 hover:border-zinc-700 transition-colors cursor-pointer"
            title="Refresh All Records"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          <Link
            to="/book"
            className="py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-700 transition-colors flex items-center gap-1.5"
          >
            <span>Live Booking View</span>
            <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
          </Link>
        </div>
      </div>

      {/* KPI Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 backdrop-blur-xl">
            <div className="flex items-center justify-between text-zinc-400 mb-2">
              <span className="text-[11px] font-mono uppercase tracking-wider">Total Revenue</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-serif text-zinc-100 font-semibold">
              ₹{stats.totalRevenueINR.toLocaleString('en-IN')}
            </div>
            <span className="text-[10px] text-emerald-400/90 font-mono mt-1 block">
              {stats.confirmedBookings} confirmed bookings
            </span>
          </div>

          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 backdrop-blur-xl">
            <div className="flex items-center justify-between text-zinc-400 mb-2">
              <span className="text-[11px] font-mono uppercase tracking-wider">Upcoming Sessions</span>
              <Calendar className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-serif text-amber-300 font-semibold">
              {stats.upcomingConsultations}
            </div>
            <span className="text-[10px] text-zinc-400 font-mono mt-1 block">
              45-minute video slots
            </span>
          </div>

          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 backdrop-blur-xl">
            <div className="flex items-center justify-between text-zinc-400 mb-2">
              <span className="text-[11px] font-mono uppercase tracking-wider">Pending / Locks</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-serif text-zinc-200 font-semibold">
              {stats.pendingBookings}
            </div>
            <span className="text-[10px] text-zinc-400 font-mono mt-1 block">
              15-minute slot reservations
            </span>
          </div>

          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 backdrop-blur-xl">
            <div className="flex items-center justify-between text-zinc-400 mb-2">
              <span className="text-[11px] font-mono uppercase tracking-wider">Registered Accounts</span>
              <Users className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-serif text-zinc-200 font-semibold">
              {stats.totalUsers}
            </div>
            <span className="text-[10px] text-zinc-400 font-mono mt-1 block">
              Clients & administrators
            </span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-800 mb-6">
        <button
          onClick={() => setActiveTab('bookings')}
          className={`py-3 px-4 text-xs font-mono uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeTab === 'bookings'
              ? 'border-amber-400 text-amber-400 font-medium'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Consultations ({bookings.length})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`py-3 px-4 text-xs font-mono uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeTab === 'users'
              ? 'border-amber-400 text-amber-400 font-medium'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Accounts & Roles ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('config')}
          className={`py-3 px-4 text-xs font-mono uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeTab === 'config'
              ? 'border-amber-400 text-amber-400 font-medium'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Auth & Deployment Setup
        </button>
      </div>

      {/* TAB 1: Bookings Table */}
      {activeTab === 'bookings' && (
        <div className="space-y-4">
          {/* Search & Filter Toolbar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-zinc-900/80 border border-zinc-800 p-4 rounded-2xl backdrop-blur-xl">
            <form onSubmit={handleSearchSubmit} className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by client name, email, phone, or CONSULT- ref..."
                className="w-full bg-zinc-950/70 border border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-xs text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-amber-400/50"
              />
            </form>

            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-zinc-950/70 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-amber-400/50 cursor-pointer"
              >
                <option value="ALL">All Statuses</option>
                <option value="PAYMENT_CONFIRMED">Confirmed Only</option>
                <option value="AWAITING_PAYMENT">Awaiting Payment</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Bookings Table */}
          {loading ? (
            <div className="py-20 text-center">
              <Loader2 className="w-6 h-6 text-amber-400 animate-spin mx-auto mb-2" />
              <p className="text-xs uppercase font-mono tracking-widest text-zinc-400">
                Fetching Bookings...
              </p>
            </div>
          ) : bookings.length === 0 ? (
            <div className="py-16 text-center bg-zinc-900/40 border border-zinc-800 rounded-2xl">
              <Calendar className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
              <p className="text-sm text-zinc-300 font-medium">No bookings match your filter criteria.</p>
            </div>
          ) : (
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl overflow-hidden backdrop-blur-xl shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-800 bg-zinc-950/40 text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                      <th className="py-3 px-4">Ref / Created</th>
                      <th className="py-3 px-4">Client</th>
                      <th className="py-3 px-4">Consultation</th>
                      <th className="py-3 px-4">Date & Slot (45m)</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Meeting URL</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60 text-xs">
                    {bookings.map((b) => (
                      <tr key={b.bookingReference} className="hover:bg-zinc-800/30 transition-colors">
                        <td className="py-3.5 px-4 font-mono text-[11px]">
                          <span className="text-zinc-200 font-medium block">{b.bookingReference}</span>
                          <span className="text-zinc-400 text-[10px]">
                            {new Date(b.createdAt).toLocaleDateString()}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="text-zinc-200 font-medium block">{b.customer.name}</span>
                          <span className="text-zinc-400 text-[11px] font-mono block">{b.customer.email}</span>
                          <span className="text-zinc-400 text-[10px] font-mono">{b.customer.phone}</span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="text-zinc-200 block font-medium">{b.serviceName}</span>
                          <span className="text-amber-400/90 font-mono text-[11px]">₹{b.amountINR}</span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="text-zinc-200 block font-medium">{b.date}</span>
                          <span className="text-zinc-400 text-[11px]">{b.timeSlot}</span>
                        </td>

                        <td className="py-3.5 px-4">
                          {b.status === 'PAYMENT_CONFIRMED' && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded-full">
                              <CheckCircle2 className="w-3 h-3" />
                              CONFIRMED
                            </span>
                          )}
                          {b.status === 'AWAITING_PAYMENT' && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-mono text-amber-400 bg-amber-950/40 border border-amber-800/40 px-2 py-0.5 rounded-full">
                              <Clock className="w-3 h-3" />
                              RESERVED
                            </span>
                          )}
                          {(b.status === 'CANCELLED' || b.status === 'FAILED') && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-mono text-zinc-400 bg-zinc-800 border border-zinc-700 px-2 py-0.5 rounded-full">
                              CANCELLED
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 max-w-[180px]">
                          {b.meetingUrl ? (
                            <a
                              href={b.meetingUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-amber-400 hover:text-amber-300 font-mono text-[11px] truncate flex items-center gap-1"
                              title={b.meetingUrl}
                            >
                              <Video className="w-3 h-3 shrink-0" />
                              <span className="truncate">Open Room</span>
                            </a>
                          ) : (
                            <span className="text-zinc-400 italic text-[11px]">Default status room</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => openEditModal(b)}
                            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 inline-flex items-center gap-1 text-[11px] cursor-pointer"
                            title="Edit meeting link and status"
                          >
                            <Edit2 className="w-3 h-3 text-amber-400" />
                            <span>Manage</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Users & Roles */}
      {activeTab === 'users' && (
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl overflow-hidden backdrop-blur-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-serif text-zinc-100 font-medium">Registered User Profiles</h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Manage roles and access control. Admin users can access this dashboard and update sessions.
              </p>
            </div>
            <span className="text-xs font-mono text-zinc-400">{users.length} Total Users</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Email Status</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-xs">
                {users.map((u) => (
                  <tr key={u.uid} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="py-3 px-4">
                      <span className="text-zinc-200 font-medium block">
                        {u.displayName || 'No Name'}
                      </span>
                      <span className="text-zinc-400 text-[11px] font-mono">{u.email}</span>
                    </td>
                    <td className="py-3 px-4 font-mono text-zinc-300">
                      {u.phoneNumber || '—'}
                    </td>
                    <td className="py-3 px-4">
                      {u.emailVerified ? (
                        <span className="text-emerald-400 text-[10px] font-mono flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Verified
                        </span>
                      ) : (
                        <span className="text-amber-400 text-[10px] font-mono">Unverified</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                          u.role === 'admin'
                            ? 'bg-amber-400/15 border-amber-400/30 text-amber-400'
                            : 'bg-zinc-800 border-zinc-700 text-zinc-300'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {u.email.toLowerCase() !== user?.email.toLowerCase() ? (
                        <button
                          onClick={() => handleToggleUserRole(u.email, u.role)}
                          className="py-1 px-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] border border-zinc-700 cursor-pointer"
                        >
                          {u.role === 'admin' ? 'Demote to Customer' : 'Make Admin'}
                        </button>
                      ) : (
                        <span className="text-[10px] font-mono text-zinc-400">Current Session</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Configuration & First-Admin Guide */}
      {activeTab === 'config' && (
        <div className="space-y-6">
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-400 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-serif text-zinc-100 font-medium">
                  Authentication & Role Configuration
                </h3>
                <p className="text-xs text-zinc-400">
                  Firebase Authentication setup guide and admin whitelist documentation.
                </p>
              </div>
            </div>

            <div className="space-y-4 text-xs text-zinc-300 leading-relaxed">
              <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800">
                <h4 className="font-semibold text-amber-400 mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Whitelisted First-Admin Email
                </h4>
                <p className="text-zinc-400 mb-2">
                  The backend authoritatively assigns the <code className="text-amber-300 font-mono">admin</code> role to users registering or logging in with the primary administrator email:
                </p>
                <div className="bg-zinc-900 p-2.5 rounded-xl font-mono text-xs text-zinc-200 border border-zinc-800">
                  meetaryan027@gmail.com
                </div>
                <p className="text-[11px] text-zinc-400 mt-2">
                  You can specify additional admin emails by updating <code className="text-zinc-200 font-mono">ADMIN_EMAILS</code> in your environment variables.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800">
                <h4 className="font-semibold text-zinc-200 mb-1">
                  Connecting Production Firebase Project
                </h4>
                <p className="text-zinc-400 mb-3">
                  To connect your real Firebase project for persistent authentication across devices:
                </p>
                <ol className="list-decimal pl-5 space-y-2 text-zinc-400 text-[11px]">
                  <li>
                    Open your <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" className="text-amber-400 underline">Firebase Console</a>, create a project, and enable <strong>Authentication</strong> (Email/Password & Google Sign-In).
                  </li>
                  <li>
                    Copy your Web App credentials into environment variables:
                    <pre className="mt-2 p-3 bg-zinc-900 rounded-xl font-mono text-zinc-300 overflow-x-auto">
{`VITE_FIREBASE_API_KEY="AIzaSy..."
VITE_FIREBASE_AUTH_DOMAIN="your-app.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="your-project-id"
VITE_FIREBASE_STORAGE_BUCKET="your-app.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="123456789"
VITE_FIREBASE_APP_ID="1:123:web:abc"`}
                    </pre>
                  </li>
                  <li>
                    For server-side token verification with Firebase Admin, generate a Service Account Key in Firebase Settings &gt; Service Accounts and set <code className="text-zinc-200">FIREBASE_CLIENT_EMAIL</code> and <code className="text-zinc-200">FIREBASE_PRIVATE_KEY</code>.
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Booking Modal */}
      {editingBooking && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-lg p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setEditingBooking(null)}
              className="absolute top-5 right-5 p-2 text-zinc-400 hover:text-zinc-200 rounded-xl bg-zinc-800/60"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-xl font-serif text-zinc-100 font-medium mb-1">
              Manage Consultation
            </h3>
            <p className="text-xs text-zinc-400 mb-6 font-mono">
              Ref: {editingBooking.bookingReference} • Client: {editingBooking.customer.name}
            </p>

            {editMessage && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 text-xs">
                {editMessage}
              </div>
            )}

            <form onSubmit={handleSaveBookingEdit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                  Appointment Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as AdminBooking['status'])}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-amber-400"
                >
                  <option value="PAYMENT_CONFIRMED">PAYMENT_CONFIRMED (Active / Scheduled)</option>
                  <option value="AWAITING_PAYMENT">AWAITING_PAYMENT (Temporary Lock)</option>
                  <option value="CANCELLED">CANCELLED (Slot Released)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                  Custom Video Room Link (Google Meet / Zoom)
                </label>
                <input
                  type="url"
                  value={newMeetingUrl}
                  onChange={(e) => setNewMeetingUrl(e.target.value)}
                  placeholder="https://meet.google.com/abc-defg-hij"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-amber-400"
                />
                <span className="text-[10px] text-zinc-400 mt-1 block">
                  When populated, clients can directly click "Join Video Room" from their booking dashboard.
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                  Private Session Notes / Instructions
                </label>
                <textarea
                  rows={3}
                  value={newInstructions}
                  onChange={(e) => setNewInstructions(e.target.value)}
                  placeholder="e.g. Please join from a well-lit room with clean hair and no styling product applied."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingBooking(null)}
                  className="py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-mono uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-zinc-950 font-semibold text-xs tracking-wider uppercase hover:brightness-110 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {savingEdit ? (
                    <Loader2 className="w-4 h-4 animate-spin text-zinc-950" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>Save Appointment</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
