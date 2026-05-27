import "dotenv/config";
import { createPool } from "./src/config/db.js";

async function getQuestion() {
    const pool = await createPool();
    try {
        const [rows] = await pool.query(`
            SELECT id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation 
            FROM questions 
            WHERE quiz_id = 2 
            ORDER BY id ASC 
            LIMIT 1
        `);
        if (rows.length > 0) {
            console.log(JSON.stringify(rows[0], null, 2));
        } else {
            console.log("No questions found for quiz_id 2.");
        }
    } catch (err) {
        console.error("Error:", err.message);
    } finally {
        await pool.end();
    }
}

getQuestion();
