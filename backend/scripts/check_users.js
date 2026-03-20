import 'dotenv/config'
import { createPool } from '../src/config/db.js'

async function run() {
  const pool = await createPool()
  try {
    console.log('Fetching users...')
    const [users] = await pool.query('SELECT id, username, role, full_name FROM users')
    console.table(users)
  } catch (e) {
    console.error('Error:', e)
  } finally {
    await pool.end()
  }
}

run()
