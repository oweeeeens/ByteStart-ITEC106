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
    const [counts] = await pool.query("SELECT quiz_id, COUNT(*) as count FROM questions GROUP BY quiz_id");
    console.log("\nFinal verification:");
    counts.forEach(row => {
      console.log(`Quiz ID ${row.quiz_id}: ${row.count} questions`);
    });
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

run();
