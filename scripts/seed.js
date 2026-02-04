const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const pool = require('../src/config/database');

async function seedAdmin() {
  try {
    const { rows } = await pool.query(
      'SELECT id FROM admins WHERE username = $1',
      ['admin']
    );

    if (rows.length > 0) {
      console.log('Admin user already exists. Skipping seed.');
      await pool.end();
      return;
    }

    const id = uuidv4();
    const plainPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    await pool.query(
      'INSERT INTO admins (id, username, password) VALUES ($1, $2, $3)',
      [id, 'admin', hashedPassword]
    );

    console.log('Admin user created successfully.');
    console.log(`  Username: admin`);
    console.log(`  Password: ${plainPassword}`);

    await pool.end();
  } catch (err) {
    console.error('Seed failed:', err.message);
    await pool.end();
    process.exit(1);
  }
}

seedAdmin();
