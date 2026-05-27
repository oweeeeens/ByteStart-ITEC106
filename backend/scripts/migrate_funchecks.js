import 'dotenv/config'
import { createPool } from '../src/config/db.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Read the lessons.js file and use regex to extract the lessons data since we can't easily import a React file in a Node script if it contains JSX or specific frontend imports, though lessons.js seems to be pure JS.
// Actually, we can just import it dynamically if it is pure JS. Let's try importing it.
import { lessons } from '../../frontend/src/data/lessons.js'

async function migrate() {
  const pool = await createPool()
  try {
    console.log('Adding paragraph_after column to questions table if not exists...')
    // Try to add the column, catch error if it already exists
    try {
      await pool.query('ALTER TABLE questions ADD COLUMN paragraph_after INT DEFAULT 0')
      console.log('✓ Added paragraph_after column')
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') {
        console.log('✓ paragraph_after column already exists')
      } else {
        throw e
      }
    }

    console.log('Migrating static quizzes to database...')
    
    // Fetch existing lessons from db
    const [dbLessons] = await pool.query('SELECT * FROM lessons')
    
    for (const lesson of lessons) {
      if (!lesson.funChecks || lesson.funChecks.length === 0) continue;
      
      const dbLesson = dbLessons.find(l => l.title === lesson.title)
      if (!dbLesson) {
        console.log(`Skipping lesson "${lesson.title}" - not found in DB`)
        continue
      }
      
      // Check if quiz exists for this lesson
      let [quizzes] = await pool.query('SELECT * FROM quizzes WHERE lesson_id = ?', [dbLesson.id])
      let quizId;
      if (quizzes.length === 0) {
        // Create quiz
        const [result] = await pool.query('INSERT INTO quizzes (lesson_id, passing_score) VALUES (?, 70)', [dbLesson.id])
        quizId = result.insertId
        console.log(`Created new quiz for lesson "${lesson.title}" (ID: ${quizId})`)
      } else {
        quizId = quizzes[0].id
        console.log(`Found existing quiz for lesson "${lesson.title}" (ID: ${quizId})`)
      }
      
      // Get existing questions for this quiz to avoid duplicates
      const [existingQuestions] = await pool.query('SELECT * FROM questions WHERE quiz_id = ?', [quizId])
      
      for (const check of lesson.funChecks) {
        // Simple duplicate check by string matching
        const isDuplicate = existingQuestions.some(eq => eq.question_text === check.question)
        if (isDuplicate) {
          console.log(`  Skipping existing question: "${check.question}"`)
          continue
        }
        
        // option mapping
        const option_a = check.options[0] || ''
        const option_b = check.options[1] || ''
        const option_c = check.options[2] || ''
        const option_d = check.options[3] || ''
        const correctLetter = ['A', 'B', 'C', 'D'][check.correctAnswer] || 'A'
        const paragraph_after = check.after || 0
        
        await pool.query(
          `INSERT INTO questions 
          (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, paragraph_after)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [quizId, check.question, option_a, option_b, option_c, option_d, correctLetter, paragraph_after]
        )
        console.log(`  ✓ Inserted question: "${check.question}" (after paragraph ${paragraph_after})`)
      }
    }
    
    console.log('Migration completed successfully.')
  } catch (err) {
    console.error('Migration failed:', err)
  } finally {
    await pool.end()
  }
}

migrate()
