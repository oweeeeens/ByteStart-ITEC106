import 'dotenv/config'
import { createPool } from '../src/config/db.js'

async function run() {
  const pool = await createPool()
  try {
    console.log('--- MIGRATION: ADD paragraph_after COLUMN ---')
    try {
      await pool.query('ALTER TABLE questions ADD COLUMN paragraph_after INT DEFAULT 0')
      console.log('✓ Added paragraph_after column to questions table')
    } catch (e) {
      if (e.code === 'ER_DUP_COLUMN_NAME') {
        console.log('! paragraph_after column already exists')
      } else {
        throw e
      }
    }

    console.log('\n--- SYNCING LESSON TITLES ---')
    const lessonMapping = [
      { slug: 'lesson0', title: 'General Introduction to Computers' },
      { slug: 'lesson1', title: 'Input Devices' },
      { slug: 'lesson2', title: 'Output Devices' },
      { slug: 'lesson3', title: 'System Unit' },
      { slug: 'lesson4', title: 'Storage Devices' },
      { slug: 'lesson5', title: 'Computer Safety and Care' },
    ]

    for (const l of lessonMapping) {
      // We assume lesson0 -> id 1, lesson1 -> id 2, etc. (since we only have 6 lessons)
      // Or we can try to find by similarity.
      // Actually, let's just make sure we have 6 lessons with these titles.
      const id = parseInt(l.slug.replace('lesson', '')) + 1
      console.log(`Updating Lesson ID ${id} to: ${l.title}`)
      await pool.query('UPDATE lessons SET title=? WHERE id=?', [l.title, id])
    }

    console.log('\n✓ Migration complete!')
  } catch (e) {
    console.error('Error during migration:', e)
  } finally {
    await pool.end()
  }
}

run()
