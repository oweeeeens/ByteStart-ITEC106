import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.get('/', requireAuth, async (req, res) => {
  try {
    const pool = await req.poolPromise
    const [courses] = await pool.query('SELECT * FROM courses')
    res.json({ courses })
  } catch {
    res.status(500).json({ error: 'Server error' })
  }
})

router.get('/:courseId/lessons', requireAuth, async (req, res) => {
  try {
    const { courseId } = req.params
    const userId = req.user.id
    const pool = await req.poolPromise
    const [lessons] = await pool.query(
      'SELECT * FROM lessons WHERE course_id=? ORDER BY lesson_order ASC',
      [courseId],
    )
    const [prog] = await pool.query(
      'SELECT lesson_id, status FROM progress WHERE user_id=?',
      [userId],
    )
    const map = {}
    prog.forEach((p) => (map[p.lesson_id] = p.status))
    lessons.forEach((l, i) => {
      if (!map[l.id]) {
        map[l.id] = i === 0 ? 'Unlocked' : 'Locked'
      }
    })
    res.json({ lessons, status: map })
  } catch {
    res.status(500).json({ error: 'Server error' })
  }
})

export default router
