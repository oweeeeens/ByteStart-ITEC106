import 'dotenv/config'
import { createPool } from './config/db.js'

async function main() {
  const pool = await createPool()
  await pool.query(`
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  guardian_name VARCHAR(100) NOT NULL,
  age INT NULL,
  grade_level VARCHAR(20) NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'student',
  failed_login_attempts INT NOT NULL DEFAULT 0,
  locked_until DATETIME NULL
);
`)
  await pool.query(`
CREATE TABLE IF NOT EXISTS courses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  description TEXT
);
`)
  await pool.query(`
CREATE TABLE IF NOT EXISTS lessons (
  id INT AUTO_INCREMENT PRIMARY KEY,
  course_id INT NOT NULL,
  title VARCHAR(100) NOT NULL,
  content TEXT,
  lesson_order INT NOT NULL,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);
`)
  await pool.query(`
CREATE TABLE IF NOT EXISTS quizzes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  lesson_id INT NOT NULL,
  passing_score INT NOT NULL DEFAULT 70,
  FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
);
`)
  await pool.query(`
CREATE TABLE IF NOT EXISTS questions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  quiz_id INT NOT NULL,
  question_text TEXT NOT NULL,
  image_path TEXT,
  option_a VARCHAR(255) NOT NULL,
  option_b VARCHAR(255) NOT NULL,
  option_c VARCHAR(255) NOT NULL,
  option_d VARCHAR(255) NOT NULL,
  correct_answer ENUM('A','B','C','D') NOT NULL,
  FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
);
`)
  await pool.query(`
CREATE TABLE IF NOT EXISTS progress (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  lesson_id INT NOT NULL,
  score INT NOT NULL DEFAULT 0,
  status ENUM('Locked','Unlocked','Completed') NOT NULL DEFAULT 'Locked',
  UNIQUE KEY u_user_lesson (user_id, lesson_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
);
`)
  await pool.query(`
CREATE TABLE IF NOT EXISTS user_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  settings_json TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
`)
  await pool.query(`
CREATE TABLE IF NOT EXISTS quiz_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  lesson_id VARCHAR(50) NOT NULL,
  title VARCHAR(200) NOT NULL,
  score INT NOT NULL,
  passed BOOLEAN NOT NULL DEFAULT FALSE,
  attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
`)

  const [courses] = await pool.query('SELECT id FROM courses')
  let courseId
  if (!courses.length) {
    const [r] = await pool.query(
      'INSERT INTO courses (title, description) VALUES (?, ?)',
      ['Computer Hardware Basics', 'Introductory hardware course for Grade 6'],
    )
    courseId = r.insertId
  } else {
    courseId = courses[0].id
  }

  const lessonsData = [
    { title: 'Input Devices', content: 'Simple explanation', order: 1 },
    { title: 'Output Devices', content: 'Simple explanation', order: 2 },
    { title: 'System Unit', content: 'Simple explanation', order: 3 },
    { title: 'Storage Devices', content: 'Simple explanation', order: 4 },
    { title: 'Hardware Safety', content: 'Simple explanation', order: 5 },
  ]

  const [existingLessons] = await pool.query(
    'SELECT id,title FROM lessons WHERE course_id=?',
    [courseId],
  )
  if (!existingLessons.length) {
    for (const l of lessonsData) {
      await pool.query(
        'INSERT INTO lessons (course_id, title, content, lesson_order) VALUES (?, ?, ?, ?)',
        [courseId, l.title, l.content, l.order],
      )
    }
  }

  const [allLessons] = await pool.query(
    'SELECT * FROM lessons WHERE course_id=? ORDER BY lesson_order ASC',
    [courseId],
  )
  for (const l of allLessons) {
    const [qz] = await pool.query('SELECT id FROM quizzes WHERE lesson_id=?', [l.id])
    if (!qz.length) {
      const [qr] = await pool.query('INSERT INTO quizzes (lesson_id) VALUES (?)', [l.id])
      const quizId = qr.insertId
      const samples = sampleQuestionsForTitle(l.title)
      for (const s of samples) {
        await pool.query(
          'INSERT INTO questions (quiz_id, question_text, image_path, option_a, option_b, option_c, option_d, correct_answer) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [quizId, s.text, s.image, s.a, s.b, s.c, s.d, s.correct],
        )
      }
    }
  }

  console.log('Database seeded')
  await pool.end()
}

function sampleQuestionsForTitle(title) {
  if (title === 'Input Devices') {
    return [
      {
        text: 'What part is shown?',
        image: 'https://upload.wikimedia.org/wikipedia/commons/0/0d/Computer_keyboard.jpg',
        a: 'Keyboard',
        b: 'Monitor',
        c: 'Mouse',
        d: 'Printer',
        correct: 'A',
      },
    ]
  }
  if (title === 'Output Devices') {
    return [
      {
        text: 'Which device shows pictures and text?',
        image: 'https://upload.wikimedia.org/wikipedia/commons/9/9c/LCD_TFT_Monitor.jpg',
        a: 'Keyboard',
        b: 'Monitor',
        c: 'Mouse',
        d: 'Microphone',
        correct: 'B',
      },
    ]
  }
  return [
    {
      text: 'Identify the hardware item',
      image: 'https://upload.wikimedia.org/wikipedia/commons/5/5e/Harddrive.jpg',
      a: 'Hard Drive',
      b: 'CPU',
      c: 'Speaker',
      d: 'Projector',
      correct: 'A',
    },
  ]
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
