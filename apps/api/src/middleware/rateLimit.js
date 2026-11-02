import rateLimit from 'express-rate-limit';

export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const email = req.body && req.body.email ? String(req.body.email).toLowerCase().trim() : '';
    return `${req.ip}_${email}`;
  },
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many login attempts. Please try again after 15 minutes.',
    });
  },
});

