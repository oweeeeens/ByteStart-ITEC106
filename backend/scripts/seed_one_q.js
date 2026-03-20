import 'dotenv/config';
import mysql from 'mysql2/promise';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  const db = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'compubasics'
  });

  await db.query('SET FOREIGN_KEY_CHECKS = 0');
  await db.query('TRUNCATE TABLE questions');
  await db.query('TRUNCATE TABLE quizzes');
  await db.query('SET FOREIGN_KEY_CHECKS = 1');

  // We have 6 lessons (lesson0 to lesson5) -> ids 1 to 6
  const seeds = [
    { lesson_id: 1, title: 'Introduction Quiz', q: 'What is the primary function of a computer?', opts: ['To process data and solve problems', 'To build physical objects', 'To cook food', 'To drive cars'], ans: 'A' },
    { lesson_id: 2, title: 'Input Devices Quiz', q: 'Which of the following is considered an input device?', opts: ['Monitor', 'Keyboard', 'Printer', 'Speaker'], ans: 'B' },
    { lesson_id: 3, title: 'Output Devices Quiz', q: 'What does a monitor do?', opts: ['Records your voice', 'Types letters into the computer', 'Displays text, images, and video', 'Connects to Wi-Fi'], ans: 'C' },
    { lesson_id: 4, title: 'System Unit Quiz', q: 'Which component is often called the "brain" of the computer?', opts: ['Power Supply', 'RAM', 'CPU', 'Hard Drive'], ans: 'C' },
    { lesson_id: 5, title: 'Storage Devices Quiz', q: 'Which of these is used to store files permanently even when the power is off?', opts: ['RAM', 'CPU', 'Solid-State Drive (SSD)', 'Motherboard'], ans: 'C' },
    { lesson_id: 6, title: 'Computer Safety Quiz', q: 'Why is it important to keep liquids away from your computer?', opts: ['To prevent electrical damage', 'To keep the screen shiny', 'To make it run faster', 'Computers need water to stay cool'], ans: 'A' }
  ];

  for (const s of seeds) {
    const [result] = await db.query('INSERT INTO quizzes (lesson_id, passing_score) VALUES (?, 70)', [s.lesson_id]);
    const quizId = result.insertId;
    console.log("Created quiz with ID:", quizId);

    await db.query(`
      INSERT INTO questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [quizId, s.q, s.opts[0], s.opts[1], s.opts[2], s.opts[3], s.ans]);
  }

  console.log("Database reset with 1 question per lesson!");
  process.exit(0);
}

run();
