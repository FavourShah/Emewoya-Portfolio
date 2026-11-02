import readline from 'readline';
import { pool } from '../db.js';
import { hashPassword } from '../lib/password.js';
import { logger } from '../lib/logger.js';

function ask(query, hidden = false) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    if (!hidden) {
      rl.question(query, (ans) => {
        rl.close();
        resolve(ans.trim());
      });
    } else {
      process.stdout.write(query);
      let input = '';
      const onData = (char) => {
        char = char.toString();
        switch (char) {
          case '\n':
          case '\r':
          case '\u0004':
            process.stdin.removeListener('data', onData);
            break;
          case '\u0003':
            process.exit();
            break;
          default:
            input += char;
            break;
        }
      };
      process.stdin.on('data', onData);
      rl.on('close', () => {
        process.stdout.write('\n');
        resolve(input.trim());
      });
      rl.question('', () => {
        rl.close();
      });
    }
  });
}

async function createAdmin() {
  if (!process.env.DATABASE_URL) {
    logger.error('DATABASE_URL is not set. Please set it in .env before running create-admin.');
    process.exit(1);
  }

  let email = process.argv[2];
  let password = process.argv[3];

  if (!email) {
    email = await ask('Enter admin email: ');
  }

  if (!email || !email.includes('@')) {
    console.error('Error: A valid email address is required.');
    process.exit(1);
  }

  if (!password) {
    password = await ask('Enter admin password (min 12 characters): ');
  }

  if (!password || password.length < 12) {
    console.error('Error: Password must be at least 12 characters long.');
    process.exit(1);
  }

  try {
    const passwordHash = await hashPassword(password);
    const res = await pool.query(
      `INSERT INTO admin_users (email, password_hash, role)
       VALUES ($1, $2, 'admin')
       ON CONFLICT (email) DO UPDATE SET
         password_hash = EXCLUDED.password_hash,
         role = 'admin'
       RETURNING id, email, role, created_at`,
      [email.toLowerCase().trim(), passwordHash]
    );

    const user = res.rows[0];
    console.log(`\n✓ Admin user created successfully!`);
    console.log(`  ID:    ${user.id}`);
    console.log(`  Email: ${user.email}`);
    console.log(`  Role:  ${user.role}\n`);
  } catch (error) {
    console.error('Failed to create admin user:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

createAdmin();

