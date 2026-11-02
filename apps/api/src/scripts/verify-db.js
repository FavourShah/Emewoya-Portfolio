import { pool } from '../db.js';
import { logger } from '../lib/logger.js';

async function verifyDatabase() {
  if (!process.env.DATABASE_URL) {
    logger.error('DATABASE_URL is not set. Please set it in .env before running verification.');
    process.exit(1);
  }

  const tables = [
    'site_settings',
    'roles',
    'map_nodes',
    'journey_steps',
    'cert_groups',
    'certifications',
    'projects',
    'project_media',
    'tech_tags',
    'linkedin_posts',
    'admin_users',
    'refresh_tokens',
  ];

  logger.info('Querying row counts from database tables...');
  console.log('\n--- Database Table Counts ---');

  for (const table of tables) {
    try {
      const res = await pool.query(`SELECT count(*)::int AS count FROM ${table}`);
      console.log(`• ${table.padEnd(16)} : ${res.rows[0].count} rows`);
    } catch (err) {
      console.log(`• ${table.padEnd(16)} : ERROR (${err.message})`);
    }
  }

  console.log('-----------------------------\n');
  await pool.end();
}

verifyDatabase().catch(() => process.exit(1));

