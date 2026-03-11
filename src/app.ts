import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';

import { apiLimiter } from './middleware/rateLimiter';
import { authenticate } from './middleware/auth';

import residentsRouter from './routes/residents';
import giftCardsRouter from './routes/giftCards';
import redemptionsRouter from './routes/redemptions';

const app = express();

// ── Global middleware ──────────────────────────────────────────────────────────

app.use(
  cors({
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
    methods: ['GET', 'POST'],
  })
);

app.use(express.json());

// Apply rate limiting to all /api routes
app.use('/api', apiLimiter);

// Apply authentication to all /api routes
app.use('/api', authenticate);

// ── Routes ─────────────────────────────────────────────────────────────────────

// Health check — public, no auth required
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/residents', residentsRouter);
app.use('/api/residents', redemptionsRouter); // POST /:id/redeem
app.use('/api/gift-cards', giftCardsRouter);

// ── 404 catch-all ──────────────────────────────────────────────────────────────

app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found.' });
});

// ── Global error handler ───────────────────────────────────────────────────────

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error.' });
});

export default app;
