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
    console.log("Deleting question with ID 95...");
    const [delRes] = await pool.query("DELETE FROM questions WHERE id = 95");
    console.log(`Deleted ${delRes.affectedRows} rows.`);

  } catch (err) {
    console.error("Error during deletion:", err);
  } finally {
    await pool.end();
  }
}

run();
