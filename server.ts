import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import checkoutRouter from './server/routes/checkout.js';
import webhookRouter from './server/routes/webhooks.js';
import authRouter from './server/routes/auth.js';
import userRouter from './server/routes/user.js';
import adminRouter from './server/routes/admin.js';
import { authenticateToken } from './server/middleware/auth.js';
import { ENV } from './server/config.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProd = process.env.NODE_ENV === 'production';
const PORT = ENV.PORT || 3000;

async function startServer() {
  const app = express();

  // Middleware to capture rawBody for cryptographic signature verification
  app.use(
    express.json({
      verify: (req: any, _res, buf) => {
        req.rawBody = buf;
      },
    })
  );

  // Authenticate bearer token on all API routes if present
  app.use(authenticateToken);

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'online',
      timestamp: new Date().toISOString(),
      gatewayConfigured: ENV.IS_CONFIGURED,
      firebaseConfigured: Boolean(ENV.FIREBASE_PROJECT_ID),
      adminEmails: ENV.ADMIN_EMAILS,
    });
  });

  // Mount API routers
  app.use('/api/auth', authRouter);
  app.use('/api/user', userRouter);
  app.use('/api/admin', adminRouter);
  app.use('/api/checkout', checkoutRouter);
  app.use('/api/webhooks', webhookRouter);

  // Dev server or static files
  if (!isProd) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true, port: Number(PORT), host: '0.0.0.0' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`🚀 VALENCE Consultation & Auth Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
