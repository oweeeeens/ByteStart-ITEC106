const mysql = require("mysql2/promise");
require("dotenv").config();

async function run() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    console.log("Connected to database.");
    
    const [columns] = await connection.query("DESCRIBE questions");
    const hasExplanation = columns.some(col => col.Field === "explanation");
    
    if (hasExplanation) {
      console.log("Column 'explanation' already exists.");
    } else {
      console.log("Column 'explanation' does not exist. Adding it...");
      await connection.query("ALTER TABLE questions ADD COLUMN explanation TEXT AFTER correct_answer");
      console.log("Column 'explanation' added successfully.");
    }

    const [verifyColumns] = await connection.query("DESCRIBE questions");
    const columnAdded = verifyColumns.some(col => col.Field === "explanation");
    console.log("Verification: explanation column exists:", columnAdded);

    console.log("Running test query...");
    const [rows] = await connection.query("SELECT * FROM questions LIMIT 1");
    console.log("Test query successful. Found", rows.length, "row(s).");

    await connection.end();
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

run();
