import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { createPool } from './config/db.js'
import authRouter from './routes/auth.js'
import coursesRouter from './routes/courses.js'
import quizRouter from './routes/quiz.js'
import progressRouter from './routes/progress.js'
import settingsRouter from './routes/settings.js'
import historyRouter from './routes/history.js'
import adminRouter from './routes/admin.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const frontendDist = join(__dirname, '../../frontend/dist')

const app = express()
app.use(cors())
app.use(express.json())
app.use(express.static(frontendDist))

const poolPromise = createPool()
app.use((req, res, next) => {
  req.poolPromise = poolPromise
  next()
})

app.get('/api/health', (req, res) => {
  res.json({ ok: true })
})

app.use('/api/auth', authRouter)
app.use('/api/courses', coursesRouter)
app.use('/api/quiz', quizRouter)
app.use('/api/progress', progressRouter)
app.use('/api/settings', settingsRouter)
app.use('/api/history', historyRouter)
app.use('/api/admin', adminRouter)

app.get('*', (req, res) => {
  res.sendFile(join(frontendDist, 'index.html'))
})

const port = process.env.PORT || 4000
app.listen(port, () => {
  console.log(`ByteStart API listening on http://localhost:${port}`)
})
