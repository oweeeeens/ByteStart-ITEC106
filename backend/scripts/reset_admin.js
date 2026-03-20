import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { createPool } from '../src/config/db.js'

async function run() {
  const pool = await createPool()
  try {
    const username = 'admin'
    const password = 'Admin123!' // Compliant with: 8+ chars, Upper, Lower, Number
    const hash = await bcrypt.hash(password, 10)
    
    console.log(`Resetting admin user (ID: 1) to username: ${username}...`)
    
    await pool.query(
      'UPDATE users SET username=?, password_hash=?, role=? WHERE id=?',
      [username, hash, 'admin', 1]
    )
    
    console.log('Admin credentials updated successfully! ✓')
    console.log('User: admin')
    console.log('Pass: Admin123!')
  } catch (e) {
    console.error('Error resetting credentials:', e)
  } finally {
    await pool.end()
  }
}

run()
