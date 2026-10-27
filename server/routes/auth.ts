import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { DB } from '../db.js';
import { ENV } from '../config.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

const SyncUserSchema = z.object({
  uid: z.string().min(1, 'User ID is required'),
  email: z.string().email('Valid email is required'),
  displayName: z.string().optional(),
  phoneNumber: z.string().optional(),
  photoURL: z.string().optional(),
  emailVerified: z.boolean().optional(),
});

// Sync or register user profile on backend
router.post('/sync', async (req: Request, res: Response) => {
  try {
    const parsed = SyncUserSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid user payload', details: parsed.error.issues });
    }

    const { uid, email, displayName, phoneNumber, photoURL, emailVerified } = parsed.data;
    const lowerEmail = email.toLowerCase().trim();

    // Check existing role or check against designated admin list
    const existing = await DB.getUser(uid);
    const isAdmin =
      ENV.ADMIN_EMAILS.includes(lowerEmail) ||
      (existing && existing.role === 'admin');

    const role = isAdmin ? 'admin' : 'customer';

    const saved = await DB.saveUser({
      uid,
      email: lowerEmail,
      displayName: displayName || existing?.displayName || '',
      phoneNumber: phoneNumber || existing?.phoneNumber || '',
      photoURL: photoURL || existing?.photoURL || '',
      role,
      emailVerified: emailVerified ?? existing?.emailVerified ?? false,
    });

    return res.json({
      success: true,
      user: saved,
      isAdmin,
    });
  } catch (error: any) {
    console.error('Error syncing user:', error);
    return res.status(500).json({ error: 'Failed to sync user profile' });
  }
});

// Current user profile
router.get('/me', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = await DB.getUser(req.user!.uid);
    if (!user) {
      return res.status(404).json({ error: 'User not found in system' });
    }
    return res.json({
      user,
      isAdmin: user.role === 'admin',
    });
  } catch (error) {
    console.error('Error fetching user /me:', error);
    return res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// Update profile details
const UpdateProfileSchema = z.object({
  displayName: z.string().max(100).optional(),
  phoneNumber: z.string().max(20).optional(),
});

router.post('/update-profile', requireAuth, async (req: Request, res: Response) => {
  try {
    const parsed = UpdateProfileSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid data', details: parsed.error.issues });
    }

    const { displayName, phoneNumber } = parsed.data;
    const updated = await DB.saveUser({
      uid: req.user!.uid,
      email: req.user!.email,
      displayName: displayName ?? req.user!.displayName,
      phoneNumber: phoneNumber ?? req.user!.phoneNumber,
    });

    return res.json({ success: true, user: updated });
  } catch (error) {
    console.error('Error updating profile:', error);
    return res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Claim admin privilege for designated emails
router.post('/claim-admin', requireAuth, async (req: Request, res: Response) => {
  try {
    const email = req.user!.email.toLowerCase().trim();
    const isEligible = ENV.ADMIN_EMAILS.includes(email);

    if (!isEligible) {
      return res.status(403).json({
        error: `Email ${email} is not authorized in server ADMIN_EMAILS.`,
        authorizedEmails: ENV.ADMIN_EMAILS.map((e) =>
          e.replace(/(.{2})(.*)(@.*)/, '$1***$3')
        ),
      });
    }

    const updated = await DB.setUserRole(email, 'admin');
    return res.json({
      success: true,
      message: `Admin access granted to ${email}`,
      user: updated,
    });
  } catch (error) {
    console.error('Error claiming admin role:', error);
    return res.status(500).json({ error: 'Failed to claim admin status' });
  }
});

// Auth configuration information for UI helper
router.get('/config', (_req: Request, res: Response) => {
  res.json({
    hasFirebaseProjectId: Boolean(ENV.FIREBASE_PROJECT_ID),
    adminEmailsConfigured: ENV.ADMIN_EMAILS.length,
    defaultAdminEmail: ENV.ADMIN_EMAILS[0] || 'meetaryan027@gmail.com',
  });
});

export default router;
