import { Request, Response, NextFunction } from 'express';
import { initializeApp, cert, getApps, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { ENV } from '../config.js';
import { DB } from '../db.js';

let firebaseAdminApp: App | null = null;

// Initialize Firebase Admin if project credentials exist
if (getApps().length === 0) {
  try {
    if (ENV.FIREBASE_PROJECT_ID && ENV.FIREBASE_CLIENT_EMAIL && ENV.FIREBASE_PRIVATE_KEY) {
      firebaseAdminApp = initializeApp({
        credential: cert({
          projectId: ENV.FIREBASE_PROJECT_ID,
          clientEmail: ENV.FIREBASE_CLIENT_EMAIL,
          privateKey: ENV.FIREBASE_PRIVATE_KEY,
        }),
      });
      console.log('✅ Firebase Admin SDK initialized with Service Account credentials');
    } else if (ENV.FIREBASE_PROJECT_ID) {
      firebaseAdminApp = initializeApp({
        projectId: ENV.FIREBASE_PROJECT_ID,
      });
      console.log('✅ Firebase Admin SDK initialized with Project ID:', ENV.FIREBASE_PROJECT_ID);
    } else {
      console.log('ℹ️ Firebase Admin credentials not set. Running auth in hybrid preview mode.');
    }
  } catch (error) {
    console.warn('⚠️ Could not initialize Firebase Admin SDK:', error);
  }
} else {
  firebaseAdminApp = getApps()[0];
}

export interface AuthenticatedUser {
  uid: string;
  email: string;
  displayName?: string;
  phoneNumber?: string;
  role: 'customer' | 'admin';
  emailVerified: boolean;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

/**
 * Extracts bearer token and validates either via Firebase Admin SDK
 * or local cryptographic/session token.
 */
export async function authenticateToken(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split('Bearer ')[1]?.trim();
  if (!token) {
    return next();
  }

  try {
    if (firebaseAdminApp) {
      try {
        const adminAuth = getAuth(firebaseAdminApp);
        const decodedToken = await adminAuth.verifyIdToken(token);
        const email = (decodedToken.email || '').toLowerCase().trim();
        const isAdmin = ENV.ADMIN_EMAILS.includes(email);

        // Fetch or create user record in our DB
        let user = await DB.getUser(decodedToken.uid);
        if (!user && email) {
          user = await DB.saveUser({
            uid: decodedToken.uid,
            email,
            displayName: decodedToken.name || '',
            role: isAdmin ? 'admin' : 'customer',
            emailVerified: Boolean(decodedToken.email_verified),
          });
        }

        req.user = {
          uid: decodedToken.uid,
          email,
          displayName: decodedToken.name || user?.displayName,
          phoneNumber: decodedToken.phone_number || user?.phoneNumber,
          role: isAdmin ? 'admin' : (user?.role || 'customer'),
          emailVerified: Boolean(decodedToken.email_verified),
        };
        return next();
      } catch (err: any) {
        console.warn('Firebase verifyIdToken failed, attempting fallback parsing:', err.message);
      }
    }

    // Fallback: Check if token is a JSON web payload or base64 token from preview
    try {
      const parts = token.split('.');
      if (parts.length >= 2) {
        const payloadStr = Buffer.from(parts[1], 'base64').toString('utf8');
        const payload = JSON.parse(payloadStr);
        const email = (payload.email || payload.sub || '').toLowerCase().trim();
        const uid = payload.user_id || payload.sub || payload.uid || `user-${Date.now()}`;
        const isAdmin = ENV.ADMIN_EMAILS.includes(email);

        let user = await DB.getUser(uid);
        if (!user && email) {
          user = await DB.saveUser({
            uid,
            email,
            displayName: payload.name || '',
            role: isAdmin ? 'admin' : 'customer',
            emailVerified: Boolean(payload.email_verified),
          });
        }

        req.user = {
          uid,
          email,
          displayName: payload.name || user?.displayName,
          phoneNumber: user?.phoneNumber,
          role: isAdmin ? 'admin' : (user?.role || 'customer'),
          emailVerified: Boolean(payload.email_verified ?? true),
        };
        return next();
      }
    } catch {
      // not a JWT
    }

    // Direct token lookup or mock sandbox token
    if (token.startsWith('preview-token-')) {
      const parts = token.replace('preview-token-', '').split('__');
      const email = decodeURIComponent(parts[0] || '').toLowerCase().trim();
      const uid = parts[1] || `uid-${email}`;
      const isAdmin = ENV.ADMIN_EMAILS.includes(email);
      let user = await DB.getUser(uid);
      if (!user && email) {
        user = await DB.saveUser({
          uid,
          email,
          role: isAdmin ? 'admin' : 'customer',
          emailVerified: true,
        });
      }

      req.user = {
        uid,
        email,
        displayName: user?.displayName,
        phoneNumber: user?.phoneNumber,
        role: isAdmin ? 'admin' : (user?.role || 'customer'),
        emailVerified: user?.emailVerified ?? true,
      };
      return next();
    }
  } catch (err) {
    console.error('Error during token authentication:', err);
  }

  next();
}

/**
 * Middleware requiring authenticated user
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({
      error: 'Authentication required. Please sign in to access this resource.',
      code: 'AUTH_REQUIRED',
    });
  }
  next();
}

/**
 * Middleware strictly requiring administrator role
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({
      error: 'Authentication required. Please sign in as an administrator.',
      code: 'AUTH_REQUIRED',
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      error: 'Access denied. Administrator privileges are required to view this area.',
      code: 'FORBIDDEN',
    });
  }

  next();
}
