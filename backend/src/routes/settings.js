import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

// GET /api/settings – load user accessibility settings
router.get('/', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id
    const pool = await req.poolPromise
    const [rows] = await pool.query(
      'SELECT settings_json FROM user_settings WHERE user_id=?',
      [userId],
    )
    if (rows.length) {
      res.json({ settings: JSON.parse(rows[0].settings_json) })
    } else {
      res.json({ settings: null })
    }
  } catch {
    res.status(500).json({ error: 'Server error' })
  }
})

// PUT /api/settings – save user accessibility settings
router.put('/', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id
    const settingsJson = JSON.stringify(req.body.settings || {})
    const pool = await req.poolPromise
    const [existing] = await pool.query(
      'SELECT id FROM user_settings WHERE user_id=?',
      [userId],
    )
    if (existing.length) {
      await pool.query(
        'UPDATE user_settings SET settings_json=? WHERE user_id=?',
        [settingsJson, userId],
      )
    } else {
      await pool.query(
        'INSERT INTO user_settings (user_id, settings_json) VALUES (?, ?)',
        [userId, settingsJson],
      )
    }
    res.json({ ok: true })
  } catch {
    res.status(500).json({ error: 'Server error' })
  }
})

export default router
