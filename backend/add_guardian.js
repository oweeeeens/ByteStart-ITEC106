import 'dotenv/config'
import mysql from 'mysql2/promise'

async function main() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'bytestart',
    port: Number(process.env.DB_PORT || 3306),
  })
  try {
    const conn = await pool.getConnection()
    await conn.query(`
      ALTER TABLE users 
      ADD COLUMN guardian_name VARCHAR(100) NOT NULL DEFAULT '' 
      AFTER full_name
    `)
    console.log('✓ guardian_name column added successfully')
    conn.release()
  } catch (e) {
    if (e.code === 'ER_DUP_FIELDNAME') {
      console.log('✓ guardian_name column already exists')
    } else {
      console.error('✗ Error:', e.message)
    }
  } finally {
    await pool.end()
  }
}
main()
