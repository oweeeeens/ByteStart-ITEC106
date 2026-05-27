const mysql = require('mysql2');
require('dotenv').config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

connection.connect(err => {
  if (err) {
    console.error('Error connecting to MySQL: ' + err.stack);
    process.exit(1);
  }
  
  console.log("--- Question Counts per Quiz ---");
  connection.query("SELECT quiz_id, COUNT(*) as count FROM questions WHERE quiz_id BETWEEN 2 AND 7 GROUP BY quiz_id", (err, rows) => {
    if (err) throw err;
    console.table(rows);

    console.log("\n--- Quiz ID 3 (Input Devices) Questions ---");
    connection.query("SELECT id, question_text, correct_answer FROM questions WHERE quiz_id = 3", (err, questions) => {
      if (err) throw err;
      questions.forEach(q => {
        console.log(`ID: ${q.id} | ${q.question_text} | Ans: ${q.correct_answer}`);
      });
      console.log(`\nAdmin API Return Length: ${questions.length}`);
      connection.end();
    });
  });
});
