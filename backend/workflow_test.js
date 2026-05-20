const axios = require('axios');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const mysql = require('mysql2/promise');

async function run() {
  const log = (msg) => console.log([\] \);

  // 1. Get admin token (simulating login/fetch from DB)
  log('Starting workflow test...');
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'bytestart'
  });

  const [rows] = await connection.query('SELECT * FROM users WHERE role=\"admin\" LIMIT 1');
  if (rows.length === 0) {
    console.error('No admin user found');
    process.exit(1);
  }
  const admin = rows[0];
  const token = jwt.sign(
    { id: admin.id, email: admin.email, role: 'admin' },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
  log('Admin token generated.');

  const api = axios.create({
    baseURL: 'http://localhost:4000',
    headers: { 'Authorization': \Bearer \\ }
  });

  try {
    // 2. POST /admin/lessons/0/questions
    log('Step 2: POST /admin/lessons/0/questions');
    const postRes = await api.post('/admin/lessons/0/questions', {
      question_text: \"Step Test Q1\",
      option_a: \"Option A1\",
      option_b: \"Option B1\",
      option_c: \"Option C1\",
      option_d: \"Option D1\",
      correct_answer: \"B\",
      explanation: \"This is a test\"
    });
    
    // 3. Parse ID
    const questionId = postRes.data.id || (postRes.data.data && postRes.data.data.id);
    log(\Step 3: Received Question ID: \\);

    // 4. GET /admin/lessons/0/questions
    log('Step 4: GET /admin/lessons/0/questions');
    const getRes1 = await api.get('/admin/lessons/0/questions');
    
    // 5. Log stats
    const questions1 = getRes1.data.questions || getRes1.data;
    log(\Step 5: Questions returned: \\);
    if (Array.isArray(questions1) && questions1.length > 0) {
       const createdQ = questions1.find(q => q.id == questionId) || questions1[0];
       log(\First/Created question correct_answer: \\);
    }

    // 6. PUT /admin/questions/{id}
    log(\Step 6: PUT /admin/questions/\ (setting to C)\);
    await api.put(\/admin/questions/\\, {
      question_text: \"Step Test Q1\",
      option_a: \"Option A1\",
      option_b: \"Option B1\",
      option_c: \"Option C1\",
      option_d: \"Option D1\",
      correct_answer: \"C\",
      explanation: \"This is a test updated\"
    });

    // 7. GET /admin/lessons/0/questions
    log('Step 7: GET /admin/lessons/0/questions (Verify Update)');
    const getRes2 = await api.get('/admin/lessons/0/questions');

    // 8. Log update result
    const questions2 = getRes2.data.questions || getRes2.data;
    const updatedQ = Array.isArray(questions2) ? questions2.find(q => q.id == questionId) : null;
    log(\Step 8: Updated correct_answer: \\);

    // 9. GET /quiz/0
    log('Step 9: GET /quiz/0 (User API)');
    const userQuizRes = await api.get('/quiz/0');
    
    // 10. Log final data
    const userQuestions = userQuizRes.data.questions || userQuizRes.data;
    const userQ = Array.isArray(userQuestions) ? userQuestions.find(q => q.id == questionId) : null;
    log(\Step 10: User API correct_answer: \\);

  } catch (error) {
    console.error('API Error:', error.response ? error.response.data : error.message);
  } finally {
    await connection.end();
  }
}

run();
