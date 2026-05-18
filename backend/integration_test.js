const http = require('http');
const mysql = require('mysql2/promise');

async function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const parsed = body ? JSON.parse(body) : {};
          if (res.statusCode >= 400) reject({ response: { data: parsed }, message: 'Status ' + res.statusCode });
          else resolve({ data: parsed });
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function runTest() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      database: 'compubasics'
    });

    console.log('--- Step 1: Current question count for lesson 0 ---');
    const [initialRows] = await connection.execute('SELECT COUNT(*) as count FROM questions WHERE quiz_id = 2');
    console.log('Initial count:', initialRows[0].count);

    console.log('\n--- Step 2: Get admin token ---');
    const loginRes = await request({
      hostname: 'localhost', port: 5000, path: '/api/admin/login', method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { username: 'admin', password: 'password' });
    const token = loginRes.data.token;
    const authHeaders = { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' };
    console.log('Token obtained');

    console.log('\n--- Step 3: Add test question ---');
    const addRes = await request({
      hostname: 'localhost', port: 5000, path: '/api/admin/lessons/0/questions', method: 'POST',
      headers: authHeaders
    }, { question: 'Final Test Q', options: ['A', 'B', 'C', 'D'], correct_answer: 'D' });
    const questionId = addRes.data.id;
    console.log('Added question ID:', questionId);

    console.log('\n--- Step 4: Verify in database ---');
    const [dbVerify] = await connection.execute('SELECT * FROM questions WHERE id = ?', [questionId]);
    console.log('DB record:', dbVerify[0]);

    console.log('\n--- Step 5: Admin API verification ---');
    const adminGet = await request({
      hostname: 'localhost', port: 5000, path: '/api/admin/lessons/0/questions', method: 'GET',
      headers: authHeaders
    });
    const adminQ = adminGet.data.find(q => q.id === questionId);
    console.log('Admin API found question:', adminQ ? 'YES' : 'NO', 'Correct Answer:', adminQ ? adminQ.correct_answer : 'N/A');

    console.log('\n--- Step 6: User API verification ---');
    const userGet = await request({
      hostname: 'localhost', port: 5000, path: '/api/quiz/0', method: 'GET'
    });
    const userQ = userGet.data.find(q => q.id === questionId);
    console.log('User API found question:', userQ ? 'YES' : 'NO', 'Correct Index:', userQ ? userQ.correct_index : 'N/A');

    console.log('\n--- Step 7: Update question to A ---');
    await request({
      hostname: 'localhost', port: 5000, path: '/api/admin/questions/' + questionId, method: 'PUT',
      headers: authHeaders
    }, { question: 'Final Test Q', options: ['A', 'B', 'C', 'D'], correct_answer: 'A' });
    console.log('Update sent');

    console.log('\n--- Step 8: Admin API verify update ---');
    const adminGet2 = await request({
      hostname: 'localhost', port: 5000, path: '/api/admin/lessons/0/questions', method: 'GET',
      headers: authHeaders
    });
    const adminQ2 = adminGet2.data.find(q => q.id === questionId);
    console.log('Admin API updated answer:', adminQ2 ? adminQ2.correct_answer : 'N/A');

    console.log('\n--- Step 9: User API verify update ---');
    const userGet2 = await request({
      hostname: 'localhost', port: 5000, path: '/api/quiz/0', method: 'GET'
    });
    const userQ2 = userGet2.data.find(q => q.id === questionId);
    console.log('User API updated index:', userQ2 ? userQ2.correct_index : 'N/A');

    console.log('\n--- Step 10: Delete question ---');
    await request({
      hostname: 'localhost', port: 5000, path: '/api/admin/questions/' + questionId, method: 'DELETE',
      headers: authHeaders
    });
    const [finalVerify] = await connection.execute('SELECT * FROM questions WHERE id = ?', [questionId]);
    console.log('Question deleted. DB search returned:', finalVerify.length);

    if (adminQ2 && adminQ2.correct_answer === 'A' && userQ2 && userQ2.correct_index === 0) {
        console.log('\nSUCCESS');
    } else {
        console.log('\nFAILURE');
    }

  } catch (err) {
    console.error('ERROR:', err.response ? err.response.data : err.message);
    console.log('\nFAILURE');
  } finally {
    if (connection) await connection.end();
  }
}

runTest();
