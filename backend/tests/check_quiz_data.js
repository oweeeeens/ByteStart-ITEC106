import 'dotenv/config';
import { createPool } from './src/config/db.js';

async function run() {
  const lessonId = 2;
  const pool = await createPool();
  try {
    const [quizzes] = await pool.query('SELECT * FROM quizzes WHERE lesson_id=?', [lessonId]);
    if (!quizzes.length) {
      console.log('Quiz not found for lesson 2');
      return;
    }
    const quiz = quizzes[0];
    const [qs] = await pool.query('SELECT * FROM questions WHERE quiz_id=?', [quiz.id]);
    
    console.log('--- RAW DATABASE VALUES ---');
    console.log(JSON.stringify(qs, null, 2));

    const questions = qs.map((q) => {
      const correctIndex = ['A', 'B', 'C', 'D'].indexOf(q.correct_answer);
      const rawOptions = [q.option_a, q.option_b, q.option_c, q.option_d];
      const options = [];
      let mappedCorrect = correctIndex;
      
      rawOptions.forEach((opt, idx) => {
        const cleaned = String(opt || '').trim();
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
        raw_correct_answer: q.correct_answer
      };
    });

    console.log('\n--- API RESPONSE TO FRONTEND ---');
    console.log(JSON.stringify({ questions, passing_score: quiz.passing_score || 70 }, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

run();
