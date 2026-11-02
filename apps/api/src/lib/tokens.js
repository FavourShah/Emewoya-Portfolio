import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { config } from '../config.js';

const ACCESS_TOKEN_EXPIRY = '15m';

/**
 * Generate a JWT access token (HS256, 15 minutes)
 * @param {{ id: string, role: string }} user
 * @returns {string}
 */
export function generateAccessToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      role: user.role,
    },
    config.jwtAccessSecret,
    {
      algorithm: 'HS256',
      expiresIn: ACCESS_TOKEN_EXPIRY,
    }
  );
}

/**
 * Verify a JWT access token
 * @param {string} token
 * @returns {object} payload
 */
export function verifyAccessToken(token) {
  return jwt.verify(token, config.jwtAccessSecret, { algorithms: ['HS256'] });
}

/**
 * Generate a secure random 48-byte base64url refresh token
 * @returns {string}
 */
export function generateRefreshToken() {
  return crypto.randomBytes(48).toString('base64url');
}

/**
 * Hash a refresh token using SHA-256 and the pepper
 * @param {string} token
 * @returns {string}
 */
export function hashRefreshToken(token) {
  return crypto
    .createHash('sha256')
    .update(token + config.refreshTokenPepper)
    .digest('hex');
}

