import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

async function run() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    console.log("--- Quiz Question Counts ---");
    const [counts] = await pool.query("SELECT quiz_id, COUNT(*) as count FROM questions WHERE quiz_id BETWEEN 2 AND 7 GROUP BY quiz_id");
    counts.forEach(row => {
      console.log(`Quiz ID ${row.quiz_id}: ${row.count} questions`);
    });

    console.log("\n--- Quiz 2 Questions (Intro to Computers) ---");
    const [q2] = await pool.query("SELECT id, question_text FROM questions WHERE quiz_id = 2 ORDER BY id ASC");
    q2.forEach(q => console.log(`ID ${q.id}: ${q.question_text}`));

    console.log("\n--- Quiz 3 Questions (Input Devices) ---");
    const [q3] = await pool.query("SELECT id, question_text FROM questions WHERE quiz_id = 3 ORDER BY id ASC");
    q3.forEach(q => console.log(`ID ${q.id}: ${q.question_text}`));

    const allFive = counts.every(c => c.count === 5) && counts.length === 6;
    console.log(`\nStatus: ${allFive ? "ALL QUIZZES SYNCED (5 questions each)" : "SYNC ERROR: Counts do not match expected values"}`);

  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

run();
