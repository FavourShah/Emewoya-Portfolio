import pg from 'pg';
import { config } from './config.js';
import { logger } from './lib/logger.js';

const { Pool } = pg;

const isProduction = config.env === 'production';
const hasSsl = config.databaseUrl && (config.databaseUrl.includes('supabase') || isProduction);

export const pool = new Pool({
  connectionString: config.databaseUrl,
  ssl: hasSsl ? { rejectUnauthorized: false } : undefined,
});

pool.on('error', (err) => {
  logger.error(err, 'Unexpected error on idle PostgreSQL client');
});

/**
 * Execute a parameterized SQL query
 * @param {string} text - SQL query string with parameter placeholders ($1, $2, etc.)
 * @param {Array} [params] - Query parameters
 * @returns {Promise<pg.QueryResult>}
 */
export async function query(text, params = []) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    logger.debug({ text, duration, rows: res.rowCount }, 'Executed query');
    return res;
  } catch (error) {
    logger.error({ text, error: error.message }, 'Database query error');
    throw error;
  }
}

