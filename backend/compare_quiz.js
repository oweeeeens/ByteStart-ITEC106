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
    // 1. Queries the database directly
    const [qs] = await pool.query("SELECT * FROM questions WHERE quiz_id=?", [quiz_id]);
    
    console.log("--- RAW DATABASE QUESTIONS ---");
    console.log(`Count: ${qs.length}`);
    qs.forEach(q => {
      console.log(`ID: ${q.id}, Text: ${q.question_text}`);
    });

    // 2. Simulates what the quiz API endpoint would return
    const apiQuestions = qs.map((q) => {
      const correctIndex = ["A", "B", "C", "D"].indexOf(q.correct_answer);
      const rawOptions = [q.option_a, q.option_b, q.option_c, q.option_d];
      const options = [];
      let mappedCorrect = correctIndex;

      rawOptions.forEach((opt, idx) => {
        const cleaned = String(opt || "").trim();
        if (cleaned) {
          options.push(cleaned);
        } else if (idx < correctIndex) {
          mappedCorrect -= 1;
        }
      });

      if (mappedCorrect < 0 || mappedCorrect >= options.length) {
        mappedCorrect = 0;
      }

      return {
        id: q.id,
        question_text: q.question_text,
        options,
        correct_index: mappedCorrect,
      };
    });

    console.log("\n--- API RESPONSE QUESTIONS ---");
    console.log(`Count: ${apiQuestions.length}`);
    apiQuestions.forEach(q => {
      console.log(`ID: ${q.id}, Text: ${q.question_text}, Options Count: ${q.options.length}`);
    });

    // 3. Compare: database count vs API response count
    console.log("\n--- COMPARISON ---");
    console.log(`Database count: ${qs.length}`);
    console.log(`API response count: ${apiQuestions.length}`);
    console.log(`Difference: ${qs.length - apiQuestions.length}`);

  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

run();
