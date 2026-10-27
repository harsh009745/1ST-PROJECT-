import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from '../config/firebase';
import { UserProfile, AuthContextType } from '../types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PREVIEW_AUTH_KEY = 'valence_preview_auth_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const syncWithBackend = async (
    fbUser: {
      uid: string;
      email: string | null;
      displayName?: string | null;
      phoneNumber?: string | null;
      emailVerified?: boolean;
      photoURL?: string | null;
    },
    token?: string
  ): Promise<UserProfile | null> => {
    try {
      const res = await fetch('/api/auth/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          uid: fbUser.uid,
          email: fbUser.email,
          displayName: fbUser.displayName || '',
          phoneNumber: fbUser.phoneNumber || '',
          photoURL: fbUser.photoURL || '',
          emailVerified: fbUser.emailVerified ?? false,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        return data.user;
      }
    } catch (err) {
      console.error('Failed syncing user with server:', err);
    }

    // Fallback if backend sync had network hiccup
    const isDefaultAdmin = (fbUser.email || '').toLowerCase() === 'meetaryan027@gmail.com';
    return {
      uid: fbUser.uid,
      email: fbUser.email || '',
      displayName: fbUser.displayName || '',
      phoneNumber: fbUser.phoneNumber || '',
      photoURL: fbUser.photoURL || '',
      role: isDefaultAdmin ? 'admin' : 'customer',
      emailVerified: fbUser.emailVerified ?? false,
    };
  };

  // Get current authorization token for API calls
  const getIdToken = async (): Promise<string | null> => {
    if (firebaseUser) {
      try {
        return await firebaseUser.getIdToken();
      } catch (err) {
        console.warn('Could not get Firebase ID token:', err);
      }
    }

    if (user) {
      return `preview-token-${encodeURIComponent(user.email)}__${user.uid}`;
    }

    return null;
  };

  // Listen to Firebase auth state or load preview auth
  useEffect(() => {
    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, async (currentFbUser) => {
        setFirebaseUser(currentFbUser);
        if (currentFbUser && currentFbUser.email) {
          try {
            const token = await currentFbUser.getIdToken();
            const syncedUser = await syncWithBackend(currentFbUser, token);
            setUser(syncedUser);
          } catch (e) {
            console.error('Error on auth state changed:', e);
          }
        } else {
          setUser(null);
        }
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      // Fallback preview mode
      try {
        const saved = localStorage.getItem(PREVIEW_AUTH_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          syncWithBackend(parsed).then((u) => {
            setUser(u);
            setLoading(false);
          });
          return;
        }
      } catch {
        // ignore
      }
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      if (isFirebaseConfigured && auth) {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        const token = await cred.user.getIdToken();
        const syncedUser = await syncWithBackend(cred.user, token);
        setUser(syncedUser);
        setFirebaseUser(cred.user);
        return { success: true };
      } else {
        // Preview fallback login
        const lowerEmail = email.toLowerCase().trim();
        const isAdmin = lowerEmail === 'meetaryan027@gmail.com' || lowerEmail.includes('admin');
        const previewUser: UserProfile = {
          uid: `preview-${Date.now()}`,
          email: lowerEmail,
          displayName: email.split('@')[0],
          phoneNumber: '+91 98765 43210',
          role: isAdmin ? 'admin' : 'customer',
          emailVerified: true,
        };
        localStorage.setItem(PREVIEW_AUTH_KEY, JSON.stringify(previewUser));
        const synced = await syncWithBackend(previewUser);
        setUser(synced);
        return { success: true };
      }
    } catch (err: any) {
      console.error('Login error:', err);
      let message = 'Unable to sign in. Please verify your email and password.';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        message = 'Invalid email or password combination. Please try again.';
      } else if (err.code === 'auth/too-many-requests') {
        message = 'Access temporarily locked due to multiple failed login attempts. Try again in a few minutes or reset your password.';
      } else if (err.code === 'auth/user-disabled') {
        message = 'This account has been disabled. Please contact support.';
      }
      return { success: false, error: message };
    }
  };

  const register = async (
    email: string,
    password: string,
    displayName: string,
    phoneNumber?: string
  ) => {
    try {
      if (isFirebaseConfigured && auth) {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(cred.user, { displayName });
        try {
          await sendEmailVerification(cred.user);
        } catch (e) {
          console.warn('Could not auto-send verification email:', e);
        }
        const token = await cred.user.getIdToken();
        const syncedUser = await syncWithBackend(
          { ...cred.user, displayName, phoneNumber },
          token
        );
        setUser(syncedUser);
        setFirebaseUser(cred.user);
        return { success: true };
      } else {
        // Preview fallback registration
        const lowerEmail = email.toLowerCase().trim();
        const isAdmin = lowerEmail === 'meetaryan027@gmail.com' || lowerEmail.includes('admin');
        const previewUser: UserProfile = {
          uid: `preview-${Date.now()}`,
          email: lowerEmail,
          displayName,
          phoneNumber: phoneNumber || '',
          role: isAdmin ? 'admin' : 'customer',
          emailVerified: true,
        };
        localStorage.setItem(PREVIEW_AUTH_KEY, JSON.stringify(previewUser));
        const synced = await syncWithBackend(previewUser);
        setUser(synced);
        return { success: true };
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      let message = 'Failed to create your account. Please try again.';
      if (err.code === 'auth/email-already-in-use') {
        message = 'An account with this email address already exists. Please sign in instead.';
      } else if (err.code === 'auth/weak-password') {
        message = 'Password should be at least 6 characters with a combination of letters and numbers.';
      } else if (err.code === 'auth/invalid-email') {
        message = 'Please provide a valid email address.';
      }
      return { success: false, error: message };
    }
  };

  const loginWithGoogle = async () => {
    try {
      if (isFirebaseConfigured && auth && googleProvider) {
        const cred = await signInWithPopup(auth, googleProvider);
        const token = await cred.user.getIdToken();
        const syncedUser = await syncWithBackend(cred.user, token);
        setUser(syncedUser);
        setFirebaseUser(cred.user);
        return { success: true };
      } else {
        // In preview sandbox when Google popup is not yet configured, provide instant Google demo login
        const email = 'meetaryan027@gmail.com'; // Default user email
        const previewUser: UserProfile = {
          uid: `preview-google-${Date.now()}`,
          email,
          displayName: 'Aryan (Admin)',
          role: 'admin',
          emailVerified: true,
          photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        };
        localStorage.setItem(PREVIEW_AUTH_KEY, JSON.stringify(previewUser));
        const synced = await syncWithBackend(previewUser);
        setUser(synced);
        return { success: true };
      }
    } catch (err: any) {
      console.error('Google sign-in error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        return { success: false, error: 'Sign-in window closed before completion.' };
      }
      return { success: false, error: err.message || 'Failed to authenticate with Google.' };
    }
  };

  const logout = async () => {
    try {
      if (isFirebaseConfigured && auth) {
        await signOut(auth);
      }
      localStorage.removeItem(PREVIEW_AUTH_KEY);
      setUser(null);
      setFirebaseUser(null);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      if (isFirebaseConfigured && auth) {
        await sendPasswordResetEmail(auth, email);
      }
      return { success: true };
    } catch (err: any) {
      console.error('Password reset error:', err);
      // To prevent account enumeration, return success true
      return { success: true };
    }
  };

  const sendVerificationEmail = async () => {
    try {
      if (isFirebaseConfigured && firebaseUser) {
        await sendEmailVerification(firebaseUser);
        return { success: true };
      }
      return { success: true };
    } catch (err: any) {
      console.error('Verification email error:', err);
      return { success: false, error: 'Failed to dispatch verification email. Please try again later.' };
    }
  };

  const updateProfileDetails = async (displayName: string, phoneNumber?: string) => {
    try {
      const token = await getIdToken();
      const res = await fetch('/api/auth/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ displayName, phoneNumber }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        return { success: false, error: errorData.error || 'Failed to update profile' };
      }

      const data = await res.json();
      setUser(data.user);

      if (firebaseUser) {
        await updateProfile(firebaseUser, { displayName });
      }

      return { success: true };
    } catch (err: any) {
      console.error('Profile update error:', err);
      return { success: false, error: 'Could not connect to server to update profile.' };
    }
  };

  const claimAdminAccess = async () => {
    try {
      const token = await getIdToken();
      const res = await fetch('/api/auth/claim-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to claim administrator access' };
      }

      setUser(data.user);
      return { success: true, message: data.message };
    } catch (err: any) {
      console.error('Claim admin error:', err);
      return { success: false, error: 'Failed to contact server to verify admin rights.' };
    }
  };

  const role = user?.role || null;
  const isAdmin = role === 'admin';

  const contextValue = useMemo(
    () => ({
      user,
      firebaseUser,
      role,
      isAdmin,
      loading,
      isFirebaseConfigured,
      login,
      register,
      loginWithGoogle,
      logout,
      resetPassword,
      sendVerificationEmail,
      updateProfileDetails,
      claimAdminAccess,
      getIdToken,
    }),
    [user, firebaseUser, role, isAdmin, loading, isFirebaseConfigured]
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
