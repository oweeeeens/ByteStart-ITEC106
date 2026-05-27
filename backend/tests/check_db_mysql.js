import "dotenv/config";
import { createPool } from "./src/config/db.js";

async function checkDb() {
    const pool = await createPool();
    try {
        console.log("--- Questions Table Schema ---");
        const [columns] = await pool.query("DESCRIBE questions");
        console.table(columns);

        console.log("\n--- Sample Question From lesson0 ---");
        const [rows] = await pool.query("SELECT * FROM questions WHERE lesson_id = ? LIMIT 1", ["lesson0"]);
        console.log(JSON.stringify(rows[0], null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

checkDb();
