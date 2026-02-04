const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = require('../src/config/database');

const migrationsDir = path.join(__dirname, '..', 'migrations');

async function runMigrations() {
  const client = await pool.connect();

  try {
    // Create a tracking table so migrations only run once
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const { rows } = await client.query('SELECT name FROM migrations');
    const executed = rows.map((r) => r.name);

    const files = fs.readdirSync(migrationsDir)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    for (const file of files) {
      if (executed.includes(file)) {
        console.log(`  [SKIP] ${file} — already executed`);
        continue;
      }

      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');

      await client.query('BEGIN');
      await client.query(sql);
      await client.query('INSERT INTO migrations (name) VALUES ($1)', [file]);
      await client.query('COMMIT');

      console.log(`  [RUN]  ${file}`);
    }

    console.log('Migrations complete.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations();
