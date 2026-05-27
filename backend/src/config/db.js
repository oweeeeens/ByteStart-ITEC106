import Database from 'better-sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dbPath = path.join(__dirname, '../../bytestart.db')

let db = null

export async function createPool() {
  if (!db) {
    db = new Database(dbPath)
    db.pragma('journal_mode = WAL')
  }

  // Return a wrapper that mimics the mysql2 pool interface
  return {
    query: async (sql, params = []) => {
      try {
        // Convert MySQL syntax to SQLite where needed
        let sqliteSQL = sql
          .replace(/AUTO_INCREMENT/g, 'AUTOINCREMENT')
          .replace(/INT AUTO_INCREMENT PRIMARY KEY/g, 'INTEGER PRIMARY KEY AUTOINCREMENT')
          .replace(/ENUM\('([^']+)','([^']+)','([^']+)'\)/g, 'TEXT')
          .replace(/ENUM\('([^']+)','([^']+)'\)/g, 'TEXT')
          .replace(/TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP/g, 'DATETIME DEFAULT CURRENT_TIMESTAMP')
          .replace(/DATETIME NULL/g, 'DATETIME')
          .replace(/BOOLEAN/g, 'INTEGER')

        // Handle CREATE TABLE IF NOT EXISTS
        if (sqliteSQL.includes('CREATE TABLE')) {
          const stmt = db.prepare(sqliteSQL)
          stmt.run(...params)
          return [[], { insertId: db.lastInsertRowid }]
        }

        // Handle INSERT
        if (sqliteSQL.includes('INSERT')) {
          const stmt = db.prepare(sqliteSQL)
          const info = stmt.run(...params)
          return [[], { insertId: info.lastInsertRowid }]
        }

        // Handle UPDATE
        if (sqliteSQL.includes('UPDATE')) {
          const stmt = db.prepare(sqliteSQL)
          stmt.run(...params)
          return [[], {}]
        }

        // Handle DELETE
        if (sqliteSQL.includes('DELETE')) {
          const stmt = db.prepare(sqliteSQL)
          stmt.run(...params)
          return [[], {}]
        }

        // Handle SELECT
        const stmt = db.prepare(sqliteSQL)
        const rows = stmt.all(...params)
        return [rows, {}]
      } catch (error) {
        console.error('Database error:', error.message)
        throw error
      }
    },

    end: async () => {
      if (db) {
        db.close()
        db = null
      }
    },
  }
}
