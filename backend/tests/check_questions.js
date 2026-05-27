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
    const quiz_id = 2;
    const [qs] = await pool.query("SELECT * FROM questions WHERE quiz_id=? ORDER BY id ASC", [quiz_id]);
    
    console.log(`Total questions for quiz_id ${quiz_id}: ${qs.length}`);
    qs.forEach((q, index) => {
      console.log(`\n--- Question ${index + 1} ---`);
      console.log(`ID: ${q.id}`);
      console.log(`Text: ${q.question_text}`);
      console.log(`Options: A) ${q.option_a}, B) ${q.option_b}, C) ${q.option_c}, D) ${q.option_d}`);
      console.log(`Correct Answer: ${q.correct_answer}`);
      if (index === 5) {
          console.log(">>> THIS IS THE 6TH QUESTION <<<");
      }
    });

  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

run();
