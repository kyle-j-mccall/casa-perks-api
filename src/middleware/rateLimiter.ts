import rateLimit from 'express-rate-limit';

/**
 * General API rate limiter — 100 requests per 15 minutes per IP.
 * Protects against brute-force and scraping.
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true, // Return rate limit info in RateLimit-* headers
  legacyHeaders: false,
  message: {
    error: 'Too many requests. Please try again after 15 minutes.',
  },
});

/**
 * Stricter limiter for the redemption endpoint —
 * prevents a resident from spamming redemptions (5 per minute).
 */
export const redemptionLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many redemption attempts. Please slow down.',
  },
});
