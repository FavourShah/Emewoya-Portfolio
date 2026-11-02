import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

/**
 * Hash a plain password using bcrypt (cost 12)
 * @param {string} password
 * @returns {Promise<string>}
 */
export async function hashPassword(password) {
  if (!password || typeof password !== 'string' || password.length < 12) {
    throw new Error('Password must be at least 12 characters long');
  }
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compare plain password against hash
 * @param {string} password
 * @param {string} hash
 * @returns {Promise<boolean>}
 */
export async function comparePassword(password, hash) {
  if (!password || !hash) return false;
  return bcrypt.compare(password, hash);
}

