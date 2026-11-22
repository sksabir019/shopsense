import type { RequestHandler } from 'express';

const WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS = 5;

interface RateLimitWindow {
  count: number;
  resetAt: number;
}

export function createEnquiryRateLimiter(
  windowMs = WINDOW_MS,
  maxRequests = MAX_REQUESTS
): RequestHandler {
  const requestsByIp = new Map<string, RateLimitWindow>();
  const cleanup = setInterval(() => {
    const now = Date.now();
    for (const [ip, entry] of requestsByIp) {
      if (entry.resetAt <= now) requestsByIp.delete(ip);
    }
  }, windowMs);
  cleanup.unref();

  return (req, res, next) => {
    const now = Date.now();
    const clientIp = typeof req.ip === 'string' ? req.ip : 'unknown';
    let entry = requestsByIp.get(clientIp);
    if (!entry || entry.resetAt <= now) {
      entry = { count: 0, resetAt: now + windowMs };
      requestsByIp.set(clientIp, entry);
    }

    if (entry.count >= maxRequests) {
      res.setHeader('Retry-After', String(Math.ceil((entry.resetAt - now) / 1000)));
      res.status(429).json({
        error: {
          code: 'ENQUIRY_RATE_LIMITED',
          message: 'Too many enquiries. Please try again later.'
        }
      });
      return;
    }

    entry.count += 1;
    next();
  };
}
