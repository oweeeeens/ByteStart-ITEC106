import "dotenv/config";
import { createPool } from "./src/config/db.js";

async function inspectDb() {
    const pool = await createPool();
    try {
        console.log("--- Summary Counts ---");
        const [quizCount] = await pool.query("SELECT COUNT(*) as count FROM quizzes");
        const [questionCount] = await pool.query("SELECT COUNT(*) as count FROM questions");
        console.log(`Total Quizzes: ${quizCount[0].count}`);
        console.log(`Total Questions: ${questionCount[0].count}`);

        console.log("\n--- Questions for lesson_id = 2 (Intro to Computers) ---");
        const [lessonQuestions] = await pool.query(
            "SELECT quiz_id, question_text, correct_answer, explanation FROM questions WHERE lesson_id = '2'"
        );
        console.table(lessonQuestions);

        console.log("\n--- Questions Count per Quiz ---");
        const [countsPerQuiz] = await pool.query(
            "SELECT quiz_id, COUNT(*) as question_count FROM questions GROUP BY quiz_id"
        );
        console.table(countsPerQuiz);
    } catch (err) {
        console.error("Error inspecting database:", err.message);
    } finally {
        await pool.end();
    }
}

inspectDb();
