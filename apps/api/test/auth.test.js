import { describe, it, expect } from 'vitest';
import { hashPassword, comparePassword } from '../src/lib/password.js';
import {
  generateAccessToken,
  verifyAccessToken,
  generateRefreshToken,
  hashRefreshToken,
} from '../src/lib/tokens.js';

describe('Auth Unit Tests', () => {
  describe('Password hashing', () => {
    it('rejects passwords shorter than 12 characters', async () => {
      await expect(hashPassword('short123')).rejects.toThrow('at least 12 characters');
    });

    it('hashes and validates a password (cost 12)', async () => {
      const plain = 'StrongPassphrase!2026';
      const hash = await hashPassword(plain);

      expect(hash).toBeDefined();
      expect(hash.startsWith('$2a$12$') || hash.startsWith('$2b$12$')).toBe(true);

      const isMatch = await comparePassword(plain, hash);
      expect(isMatch).toBe(true);

      const isWrong = await comparePassword('WrongPassword!2026', hash);
      expect(isWrong).toBe(false);
    });
  });

  describe('JWT Access Token', () => {
    it('generates a valid JWT with sub and role claims', () => {
      const user = { id: '123e4567-e89b-12d3-a456-426614174000', role: 'admin' };
      const token = generateAccessToken(user);

      expect(typeof token).toBe('string');
      const payload = verifyAccessToken(token);
      expect(payload.sub).toBe(user.id);
      expect(payload.role).toBe('admin');
    });

    it('fails verification on invalid token', () => {
      expect(() => verifyAccessToken('invalid.token.signature')).toThrow();
    });
  });

  describe('Refresh Token', () => {
    it('generates random 48-byte base64url refresh tokens', () => {
      const token1 = generateRefreshToken();
      const token2 = generateRefreshToken();

      expect(token1).not.toBe(token2);
      expect(token1.length).toBeGreaterThanOrEqual(48);
    });

    it('deterministically hashes refresh token with pepper', () => {
      const token = 'sample_refresh_token_string';
      const hash1 = hashRefreshToken(token);
      const hash2 = hashRefreshToken(token);

      expect(hash1).toBe(hash2);
      expect(hash1.length).toBe(64); // sha256 hex length
    });
  });
});

