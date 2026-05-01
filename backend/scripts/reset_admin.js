import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { createPool } from '../src/config/db.js'

async function run() {
  const pool = await createPool()
  try {
    const email = 'admin@compubasics.local'
    const password = 'Admin123!' // Compliant with: 8+ chars, Upper, Lower, Number
    const hash = await bcrypt.hash(password, 10)
    
    console.log(`Resetting admin user (ID: 1) to email: ${email}...`)
    
    await pool.query(
      'UPDATE users SET email=?, password_hash=?, role=? WHERE id=?',
      [email, hash, 'admin', 1]
    )
    
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
