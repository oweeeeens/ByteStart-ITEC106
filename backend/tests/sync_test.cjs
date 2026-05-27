const mysql = require("mysql2/promise");
const http = require("http");
const jwt = require("jsonwebtoken");
require("dotenv").config();

function apiRequest(method, path, body, token) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(body);
        const options = {
            hostname: 'localhost',
            port: process.env.PORT || 4000,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data ? Buffer.byteLength(data) : 0,
                'Authorization': `Bearer ${token}`
            }
        };

        const req = http.request(options, (res) => {
            let resData = '';
            res.on('data', (chunk) => resData += chunk);
            res.on('end', () => {
                let parsed;
                try { parsed = resData ? JSON.parse(resData) : null; } catch(e) { parsed = resData; }
                resolve({ status: res.statusCode, data: parsed });
            });
        });

        req.on('error', (e) => reject(e));
        if (data) req.write(data);
        req.end();
    });
}

async function run() {
    const config = {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT
    };

    let pool;
    try {
        pool = mysql.createPool(config);
        const [users] = await pool.query("SELECT * FROM users WHERE role='admin' LIMIT 1");
        if (users.length === 0) throw new Error("No admin user found");
        const admin = users[0];
        const token = jwt.sign(
            { id: admin.id, email: admin.email, role: admin.role },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );
        console.log("Admin token generated.");

        const timestamp = new Date().toISOString();
        const questionText = `Admin Sync Test - ${timestamp}`;
        const startTime = Date.now();

        console.log("Adding question via API...");
        const apiResponse = await apiRequest('POST', '/api/questions', {
            question_text: questionText,
            category: "General",
            difficulty: "Easy",
            options: JSON.stringify(["Option A", "Option B", "Option C", "Option D"]),
            correct_answer: "Option A"
        }, token);
        const apiAddEnd = Date.now();
        console.log(`API response status: ${apiResponse.status}`);

        const [dbRows] = await pool.query("SELECT * FROM questions WHERE question_text = ?", [questionText]);
        const dbQueryEnd = Date.now();
        const inDB = dbRows.length > 0;
        console.log(`Found in DB: ${inDB}`);

        const apiListResponse = await apiRequest('GET', '/api/questions', null, token);
        const apiQueryEnd = Date.now();
        const inApiList = Array.isArray(apiListResponse.data) && apiListResponse.data.some(q => q.question_text === questionText);
        console.log(`Found in API list: ${inApiList}`);

        console.log("\n--- Performance Metrics ---");
        console.log(`API Add duration: ${apiAddEnd - startTime}ms`);
        console.log(`DB Verification lag: ${dbQueryEnd - apiAddEnd}ms`);
        console.log(`API Verification lag: ${apiQueryEnd - dbQueryEnd}ms`);
        console.log(`Total cycle: ${apiQueryEnd - startTime}ms`);

    } catch (err) {
        console.error("Error:", err.message);
    } finally {
        if (pool) await pool.end();
    }
}
run();
