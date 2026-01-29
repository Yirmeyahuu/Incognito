import rateLimit from 'express-rate-limit';
import { env } from '../config/env';

/**
 * General API rate limiter
 */
export const apiLimiter = rateLimit({
  windowMs: env.rateLimit.windowMs,
  max: env.rateLimit.maxRequests,
  message: {
    error: 'Too Many Requests',
    message: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Stricter rate limiter for message sending (prevents spam)
 */
export const messageLimiter = rateLimit({
  windowMs: 60000, // 1 minute
  max: 5, // 5 messages per minute
  message: {
    error: 'Too Many Requests',
    message: 'Too many messages sent. Please wait before sending another.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});