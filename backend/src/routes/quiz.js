import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.get('/:lessonId', requireAuth, async (req, res) => {
  try {
    const { lessonId } = req.params
    const pool = await req.poolPromise
    const [quizzes] = await pool.query('SELECT * FROM quizzes WHERE lesson_id=?', [lessonId])
    if (!quizzes.length) return res.json({ questions: [], passing_score: 70 })
    const quiz = quizzes[0]
    const [qs] = await pool.query('SELECT * FROM questions WHERE quiz_id=?', [quiz.id])
    const questions = qs.map((q) => ({
      id: q.id,
      question_text: q.question_text,
      image_path: q.image_path,
      options: [q.option_a, q.option_b, q.option_c, q.option_d],
      correct_index: ['A', 'B', 'C', 'D'].indexOf(q.correct_answer),
      paragraph_after: q.paragraph_after || 0,
    }))
    res.json({ questions, passing_score: quiz.passing_score || 70 })
  } catch {
    res.status(500).json({ error: 'Server error' })
  }
})

router.post('/:lessonId/submit', requireAuth, async (req, res) => {
  try {
    const { lessonId } = req.params
    const answers = req.body.answers || []
    const userId = req.user.id
    const pool = await req.poolPromise
    const [quizzes] = await pool.query('SELECT * FROM quizzes WHERE lesson_id=?', [lessonId])
    if (!quizzes.length) return res.status(400).json({ error: 'Quiz not found' })
    const quiz = quizzes[0]
    const [qs] = await pool.query('SELECT * FROM questions WHERE quiz_id=?', [quiz.id])
    let correct = 0
    qs.forEach((q, i) => {
      const idx = ['A', 'B', 'C', 'D'].indexOf(q.correct_answer)
      if (answers[i] === idx) correct++
    })
    const score = Math.round((correct / (qs.length || 1)) * 100)
    const status = score >= (quiz.passing_score || 70) ? 'Completed' : 'Unlocked'
    const [existing] = await pool.query(
      'SELECT id FROM progress WHERE user_id=? AND lesson_id=?',
      [userId, lessonId],
    )
    if (existing.length) {
      await pool.query('UPDATE progress SET score=?, status=? WHERE id=?', [
        score,
        status,
        existing[0].id,
      ])
    } else {
      await pool.query(
        'INSERT INTO progress (user_id, lesson_id, score, status) VALUES (?, ?, ?, ?)',
        [userId, lessonId, score, status],
      )
    }
    if (status === 'Completed') {
      const [[lesson]] = await pool.query('SELECT * FROM lessons WHERE id=?', [lessonId])
      if (lesson) {
        const [next] = await pool.query(
          'SELECT * FROM lessons WHERE course_id=? AND lesson_order=?',
          [lesson.course_id, lesson.lesson_order + 1],
        )
        if (next.length) {
          const nextId = next[0].id
          const [ex2] = await pool.query(
            'SELECT id FROM progress WHERE user_id=? AND lesson_id=?',
            [userId, nextId],
          )
          if (ex2.length) {
            await pool.query('UPDATE progress SET status=? WHERE id=?', ['Unlocked', ex2[0].id])
          } else {
            await pool.query(
              'INSERT INTO progress (user_id, lesson_id, score, status) VALUES (?, ?, ?, ?)',
              [userId, nextId, 0, 'Unlocked'],
            )
          }
        }
      }
    }
    res.json({ score, status })
  } catch {
    res.status(500).json({ error: 'Server error' })
  }
})

export default router
