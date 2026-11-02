import express from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { pool } from '../db.js';
import { comparePassword } from '../lib/password.js';
import {
  generateAccessToken,
  generateRefreshToken,
  hashRefreshToken,
} from '../lib/tokens.js';
import { validate } from '../middleware/validate.js';
import { loginRateLimiter } from '../middleware/rateLimit.js';
import { config } from '../config.js';
import { logger } from '../lib/logger.js';

export const authRouter = express.Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const DUMMY_HASH = '$2a$12$e80yq9gQz06eL70j1.qHk.KkQe7p6L8m6N7o8P9q0R1s2T3u4V5w6'; // constant timing dummy

function getCookieOptions() {
  const isProd = config.env === 'production';
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    path: '/api/auth',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  };
}

// POST /api/auth/login
authRouter.post('/login', loginRateLimiter, validate(loginSchema), async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const userRes = await pool.query(
      'SELECT id, email, password_hash, role FROM admin_users WHERE email = $1',
      [email.toLowerCase().trim()]
    );

    const user = userRes.rows[0];

    // Mitigate timing difference between user exists vs user does not exist
    if (!user) {
      await bcrypt.compare(password, DUMMY_HASH);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isValid = await comparePassword(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const accessToken = generateAccessToken(user);
    const rawRefreshToken = generateRefreshToken();
    const tokenHash = hashRefreshToken(rawRefreshToken);

    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    await pool.query(
      `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
       VALUES ($1, $2, $3)`,
      [user.id, tokenHash, expiresAt]
    );

    res.cookie('refreshToken', rawRefreshToken, getCookieOptions());

    res.json({
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/refresh
authRouter.post('/refresh', async (req, res, next) => {
  const rawRefreshToken = req.cookies?.refreshToken;
  if (!rawRefreshToken) {
    return res.status(401).json({ error: 'Refresh token missing' });
  }

  try {
    const tokenHash = hashRefreshToken(rawRefreshToken);
    const tokenRes = await pool.query(
      `SELECT id, user_id, expires_at, revoked_at
       FROM refresh_tokens
       WHERE token_hash = $1`,
      [tokenHash]
    );

    const record = tokenRes.rows[0];
    if (!record) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    // Reuse detection: if presented token is already revoked, revoke all tokens for this user
    if (record.revoked_at) {
      logger.warn({ userId: record.user_id }, 'Revoked refresh token reuse detected! Revoking all sessions.');
      await pool.query(
        'UPDATE refresh_tokens SET revoked_at = NOW() WHERE user_id = $1',
        [record.user_id]
      );
      res.clearCookie('refreshToken', getCookieOptions());
      return res.status(401).json({ error: 'Refresh token revoked. Please log in again.' });
    }

    if (new Date(record.expires_at) < new Date()) {
      return res.status(401).json({ error: 'Refresh token expired' });
    }

    // Revoke old token
    await pool.query(
      'UPDATE refresh_tokens SET revoked_at = NOW() WHERE id = $1',
      [record.id]
    );

    // Fetch user
    const userRes = await pool.query(
      'SELECT id, email, role FROM admin_users WHERE id = $1',
      [record.user_id]
    );
    const user = userRes.rows[0];
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Issue new tokens (rotation)
    const newAccessToken = generateAccessToken(user);
    const newRawRefreshToken = generateRefreshToken();
    const newTokenHash = hashRefreshToken(newRawRefreshToken);
    const newExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await pool.query(
      `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
       VALUES ($1, $2, $3)`,
      [user.id, newTokenHash, newExpiresAt]
    );

    res.cookie('refreshToken', newRawRefreshToken, getCookieOptions());

    res.json({
      accessToken: newAccessToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/logout
authRouter.post('/logout', async (req, res, next) => {
  const rawRefreshToken = req.cookies?.refreshToken;
  try {
    if (rawRefreshToken) {
      const tokenHash = hashRefreshToken(rawRefreshToken);
      await pool.query(
        'UPDATE refresh_tokens SET revoked_at = NOW() WHERE token_hash = $1',
        [tokenHash]
      );
    }

    res.clearCookie('refreshToken', getCookieOptions());
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

