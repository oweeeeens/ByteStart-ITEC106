import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { createPool } from '../src/config/db.js'

async function run() {
  const pool = await createPool()
  try {
    const email = 'admin@compubasics.local'
    const password = 'Admin123!' // Compliant with: 8+ chars, Upper, Lower, Number
    const hash = await bcrypt.hash(password, 10)

    const [existing] = await pool.query('SELECT id FROM users WHERE email=? LIMIT 1', [email])
    if (existing.length) {
      const adminId = existing[0].id
      console.log(`Resetting admin user (ID: ${adminId}) to email: ${email}...`)
      await pool.query(
        'UPDATE users SET password_hash=?, role=? WHERE id=?',
        [hash, 'admin', adminId]
      )
    } else {
      console.log(`Creating admin user with email: ${email}...`)
      await pool.query(
        'INSERT INTO users (full_name, guardian_name, age, grade_level, email, password_hash, role) VALUES (?, ?, ?, ?, ?, ?, ?)',
        ['System Admin', 'System', null, null, email, hash, 'admin']
      )
    }

    console.log('Admin credentials updated successfully! ✓')
    console.log('User: admin@compubasics.local')
    console.log('Pass: Admin123!')
  } catch (e) {
    console.error('Error resetting credentials:', e)
  } finally {
    await pool.end()
  }
}

run()
