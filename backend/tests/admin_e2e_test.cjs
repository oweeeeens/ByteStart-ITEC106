const mysql = require('mysql2/promise');
const http = require('http');
const jwt = require('jsonwebtoken');
require('dotenv').config();

async function run() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  try {
    const [users] = await connection.execute('SELECT * FROM users WHERE role = ? LIMIT 1', ['admin']);
    if (users.length === 0) throw new Error('No admin user found');
    const admin = users[0];

    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: 'admin' },
      process.env.JWT_SECRET || 'changeme',
      { expiresIn: '1h' }
    );

    const postData = JSON.stringify({
      question_text: 'What is 2+2?',
      option_a: '3',
      option_b: '4',
      option_c: '5',
      option_d: '6',
      correct_answer: 'B'
    });

    const putOptions = {
      hostname: 'localhost',
      port: process.env.PORT || 4000,
      path: '/api/admin/lessons/0/questions',
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token,
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const putReq = () => new Promise((resolve, reject) => {
      const req = http.request(putOptions, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(data));
      });
      req.on('error', reject);
      req.write(postData);
      req.end();
    });

    await putReq();

    const getOptions = {
      hostname: 'localhost',
      port: process.env.PORT || 4000,
      path: '/api/admin/lessons/0/questions',
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + token
      }
    };

    const getReq = () => new Promise((resolve, reject) => {
      const req = http.request(getOptions, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(data));
      });
      req.on('error', reject);
      req.end();
    });

    const getResponse = await getReq();
    const questions = JSON.parse(getResponse);
    
    const count = Array.isArray(questions) ? questions.length : (questions.questions ? questions.questions.length : 0);
    const firstQuestion = Array.isArray(questions) ? questions[0] : (questions.questions ? questions.questions[0] : null);
    const firstAnswer = firstQuestion ? firstQuestion.correct_answer : 'N/A';

    console.log('Test Complete: ' + count + ' questions, first has correct_answer=' + firstAnswer);
  } catch (err) {
    console.error(err);
  } finally {
    await connection.end();
  }
}

run();
