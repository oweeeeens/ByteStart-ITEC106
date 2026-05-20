const mysql = require('mysql2/promise');

async function run() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'bytestart'
  });

  try {
    const [rows] = await connection.execute(
      'SELECT question_text, option_a, option_b, option_c, option_d, correct_answer FROM questions WHERE quiz_id = 2 LIMIT 1'
    );

    if (rows.length > 0) {
      const q = rows[0];
      const correctMap = { 'A': 0, 'B': 1, 'C': 2, 'D': 3 };
      console.log(JSON.stringify({
        question_text: q.question_text,
        option_a: q.option_a,
        option_b: q.option_b,
        option_c: q.option_c,
        option_d: q.option_d,
        correct_answer: q.correct_answer,
        correct_index: correctMap[q.correct_answer]
      }, null, 2));
    } else {
      console.log('No questions found for quiz_id 2');
    }
  } catch (err) {
    console.error(err);
  } finally {
    await connection.end();
  }
}

run();
