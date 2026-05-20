import 'dotenv/config'
import mysql from 'mysql2/promise'

async function main() {
  try {
    const pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'bytestart',
      port: Number(process.env.DB_PORT || 3306),
    })
    const conn = await pool.getConnection()
    const [rows] = await conn.query('DESCRIBE users')
    console.log('Users table schema:')
    console.table(rows)
    conn.release()
    pool.end()
  } catch (e) {
    console.error('Error:', e.message)
    process.exit(1)
  }
}
main()
