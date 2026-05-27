const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./database.sqlite");

db.serialize(() => {
    console.log("--- Question Counts per Quiz ---");
    db.all("SELECT quiz_id, COUNT(*) as count FROM questions WHERE quiz_id BETWEEN 2 AND 7 GROUP BY quiz_id", (err, rows) => {
        if (err) throw err;
        console.table(rows);

        console.log("\n--- Quiz ID 3 (Input Devices) Questions ---");
        db.all("SELECT id, question_text, correct_answer FROM questions WHERE quiz_id = 3", (err, questions) => {
            if (err) throw err;
            questions.forEach(q => {
                console.log(`ID: ${q.id} | ${q.question_text} | Ans: ${q.correct_answer}`);
            });
            console.log(`\nAdmin API Return Length: ${questions.length}`);
            db.close();
        });
    });
});
