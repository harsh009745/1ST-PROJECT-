export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  phoneNumber?: string;
  photoURL?: string;
  role: 'customer' | 'admin';
  emailVerified: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthContextType {
  user: UserProfile | null;
  firebaseUser: any | null;
  role: 'customer' | 'admin' | null;
  isAdmin: boolean;
  loading: boolean;
  isFirebaseConfigured: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (
    email: string,
    password: string,
    displayName: string,
    phoneNumber?: string
  ) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  sendVerificationEmail: () => Promise<{ success: boolean; error?: string }>;
  updateProfileDetails: (
    displayName: string,
    phoneNumber?: string
  ) => Promise<{ success: boolean; error?: string }>;
  claimAdminAccess: () => Promise<{ success: boolean; message?: string; error?: string }>;
  getIdToken: () => Promise<string | null>;
}
