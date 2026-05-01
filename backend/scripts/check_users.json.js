import 'dotenv/config'
import { createPool } from '../src/config/db.js'

async function run() {
  const pool = await createPool()
  try {
    const [users] = await pool.query('SELECT id, email, role, full_name, password_hash FROM users')
    console.log(JSON.stringify(users, null, 2))
  } catch (e) {
    console.error('Error:', e)
  } finally {
    await pool.end()
  }
}

run()
