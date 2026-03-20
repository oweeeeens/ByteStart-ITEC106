import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const router = Router()

// Breached/weak passwords blocklist (server-side enforcement)
const BLOCKED_PASSWORDS = new Set([
  'password', 'password1', 'password123', '123456', '1234567', '12345678',
  '123456789', '1234567890', 'qwerty', 'qwerty123', 'abc123', 'monkey',
  'master', 'dragon', 'login', 'princess', 'football', 'shadow', 'sunshine',
  'trustno1', 'iloveyou', 'batman', 'access', 'hello', 'charlie', 'donald',
  '654321', 'letmein', 'welcome', 'admin', 'passw0rd', 'p@ssword', 'pass123',
  '111111', '000000', 'baseball', 'michael', 'jordan', 'superman', 'hunter',
  'thomas', 'ranger', 'buster', 'soccer', 'harley', 'daniel', 'robert',
  'computer', 'compubasics', 'grade6', 'student', 'school', 'teacher',
])

router.post('/register', async (req, res) => {
  const { full_name, guardian_name, age, grade_level, username, password } = req.body
  if (!full_name || !guardian_name || !username || !password) {
    return res.status(400).json({ error: 'Missing fields' })
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters.' })
  }
  if (BLOCKED_PASSWORDS.has(password.toLowerCase())) {
    return res.status(400).json({ error: 'This password was found in data breaches. Please choose a stronger, unique password.' })
  }
  if (!/[A-Z]/.test(password)) {
    return res.status(400).json({ error: 'Password must include at least one uppercase letter (A-Z).' })
  }
  if (!/[a-z]/.test(password)) {
    return res.status(400).json({ error: 'Password must include at least one lowercase letter (a-z).' })
  }
  if (!/[0-9]/.test(password)) {
    return res.status(400).json({ error: 'Password must include at least one number (0-9).' })
  }
  try {
    const pool = await req.poolPromise
    const [existing] = await pool.query('SELECT id FROM users WHERE username=?', [username])
    if (existing.length) return res.status(409).json({ error: 'Username taken' })
    const hash = await bcrypt.hash(password, 10)
    const [result] = await pool.query(
      'INSERT INTO users (full_name, guardian_name, age, grade_level, username, password_hash, role) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [full_name, guardian_name, age || null, grade_level || null, username, hash, 'student'],
    )
    const userId = result.insertId
    const token = jwt.sign({ id: userId, username, role: 'student' }, process.env.JWT_SECRET || 'changeme', {
      expiresIn: '7d',
    })
    res.json({ token, user: { id: userId, full_name, guardian_name, username, age, grade_level, role: 'student' } })
  } catch (e) {
    const msg = e && e.code === 'ECONNREFUSED' ? 'Database unavailable' : 'Server error'
    const status = msg === 'Database unavailable' ? 503 : 500
    res.status(status).json({ error: msg })
  }
})

router.post('/login', async (req, res) => {
  const { username, password } = req.body
  if (!username || !password) return res.status(400).json({ error: 'Missing fields' })
  try {
    const pool = await req.poolPromise
    const [rows] = await pool.query('SELECT * FROM users WHERE username=?', [username])
    if (!rows.length) return res.status(401).json({ error: 'Invalid credentials' })
    const user = rows[0]
    const ok = await bcrypt.compare(password, user.password_hash)
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' })
    const token = jwt.sign({ id: user.id, username, role: user.role }, process.env.JWT_SECRET || 'changeme', {
      expiresIn: '7d',
    })
    res.json({
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        username: user.username,
        age: user.age,
        grade_level: user.grade_level,
        role: user.role,
      },
    })
  } catch (e) {
    const msg = e && e.code === 'ECONNREFUSED' ? 'Database unavailable' : 'Server error'
    const status = msg === 'Database unavailable' ? 503 : 500
    res.status(status).json({ error: msg })
  }
})

// Check if username is available
router.get('/check-username/:username', async (req, res) => {
  const { username } = req.params
  if (!username || username.trim().length < 3) {
    return res.json({ available: false, reason: 'Username must be at least 3 characters.' })
  }
  try {
    const pool = await req.poolPromise
    const [rows] = await pool.query('SELECT id FROM users WHERE username=?', [username.trim()])
    res.json({ available: rows.length === 0 })
  } catch {
    res.json({ available: true }) // fail-open so form isn't blocked
  }
})

// Reset password using guardian_name as identity verification
router.post('/forgot-password', async (req, res) => {
  const { username, guardian_name, new_password } = req.body
  if (!username || !guardian_name || !new_password) {
    return res.status(400).json({ error: 'Missing fields' })
  }
  if (new_password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters.' })
  }
  if (BLOCKED_PASSWORDS.has(new_password.toLowerCase())) {
    return res.status(400).json({ error: 'This password was found in data breaches. Please choose a stronger, unique password.' })
  }
  if (!/[A-Z]/.test(new_password)) {
    return res.status(400).json({ error: 'Password must include at least one uppercase letter (A-Z).' })
  }
  if (!/[a-z]/.test(new_password)) {
    return res.status(400).json({ error: 'Password must include at least one lowercase letter (a-z).' })
  }
  if (!/[0-9]/.test(new_password)) {
    return res.status(400).json({ error: 'Password must include at least one number (0-9).' })
  }
  try {
    const pool = await req.poolPromise
    // Step 1: Check if user exists
    const [rows] = await pool.query(
      'SELECT id, guardian_name FROM users WHERE username=?',
      [username]
    )

    if (!rows.length) {
      return res.status(400).json({ error: 'Account not found with that information.' })
    }

    const user = rows[0]

    // Step 2: Verify guardian name (case-insensitive, whitespace-tolerant)
    const dbGuardianName = user.guardian_name ? user.guardian_name.trim().toLowerCase() : ''
    const providedGuardianName = guardian_name.trim().toLowerCase()

    if (!dbGuardianName || dbGuardianName !== providedGuardianName) {
      return res.status(400).json({ error: 'Guardian Name does not match our records.' })
    }

    // Update password
    const hash = await bcrypt.hash(new_password, 10)
    await pool.query('UPDATE users SET password_hash=? WHERE id=?', [hash, user.id])

    res.json({ message: 'Password updated successfully. You can now log in.' })
  } catch (e) {
    const msg = e && e.code === 'ECONNREFUSED' ? 'Database unavailable' : 'Server error'
    const status = msg === 'Database unavailable' ? 503 : 500
    res.status(status).json({ error: msg })
  }
})

export default router
