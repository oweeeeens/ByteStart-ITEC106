const db = require('./src/config/db');
const jwt = require('jsonwebtoken');
require('dotenv').config();

async function run() {
  try {
    const pool = await db.createPool();
    const [rows] = await pool.query('SELECT * FROM users WHERE role=\'admin\' LIMIT 1');
    if (rows.length === 0) {
      console.log('No admin found');
      return;
    }
    const admin = rows[0];
    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: 'admin' },
      process.env.JWT_SECRET || 'changeme',
      { expiresIn: '1h' }
    );
    console.log('TOKEN=' + token);
  } catch (e) {
    console.error(e);
  } finally {
    process.exit();
  }
}
run();
