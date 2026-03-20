import 'dotenv/config'
import { createPool } from '../src/config/db.js'

async function run() {
  const pool = await createPool()
  try {
    console.log('Cleaning up Data Structure courses...')
    // Delete the placeholder courses
    await pool.query('DELETE FROM courses WHERE title LIKE "%DATA STRUCTURE%"')
    
    console.log('Adding History of Computers...')
    await pool.query('INSERT INTO courses (title, description) VALUES (?, ?)', [
      'HISTORY OF COMPUTERS',
      'Learn about the evolution of computing from the abacus to modern smartphones. Perfect for Grade 6.'
    ])
    
    console.log('Adding Basic Hardware Components...')
    await pool.query('INSERT INTO courses (title, description) VALUES (?, ?)', [
      'BASIC HARDWARE COMPONENTS',
      'Discover what is inside your computer. CPU, RAM, Hard Drives, and more explained simply.'
    ])
    
    console.log('Database content refined successfully ✓')
  } catch (e) {
    console.error('Error during cleanup:', e)
  } finally {
    await pool.end()
  }
}

run()
