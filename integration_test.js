const axios = require('axios');
const mysql = require('mysql2/promise');

async function runTest() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      database: 'compubasics'
    });

    console.log('--- Step 1: Current question count for lesson 0 (quiz_id 2) ---');
    const [initialRows] = await connection.execute('SELECT COUNT(*) as count FROM questions WHERE quiz_id = 2');
    console.log('Initial count:', initialRows[0].count);

    console.log('\n--- Step 2: Get admin token ---');
    const loginRes = await axios.post('http://localhost:5000/api/admin/login', {
      username: 'admin',
      password: 'password'
    });
    const token = loginRes.data.token;
    const config = { headers: { Authorization: 'Bearer ' + token } };
    console.log('Token obtained');

    console.log('\n--- Step 3: Add test question ---');
    const addRes = await axios.post('http://localhost:5000/api/admin/lessons/0/questions', {
      question: 'Final Test Q',
      options: ['A', 'B', 'C', 'D'],
      correct_answer: 'D'
    }, config);
    const questionId = addRes.data.id;
    console.log('Added question ID:', questionId);

    console.log('\n--- Step 4: Verify in database ---');
    const [dbVerify] = await connection.execute('SELECT * FROM questions WHERE id = ?', [questionId]);
    console.log('DB record:', dbVerify[0]);

    console.log('\n--- Step 5: Admin API verification ---');
    const adminGet = await axios.get('http://localhost:5000/api/admin/lessons/0/questions', config);
    const adminQ = adminGet.data.find(q => q.id === questionId);
    console.log('Admin API found question:', adminQ ? 'YES' : 'NO', 'Correct Answer:', adminQ ? adminQ.correct_answer : 'N/A');

    console.log('\n--- Step 6: User API verification ---');
    const userGet = await axios.get('http://localhost:5000/api/quiz/0');
    const userQ = userGet.data.find(q => q.id === questionId);
    console.log('User API found question:', userQ ? 'YES' : 'NO', 'Correct Index:', userQ ? userQ.correct_index : 'N/A');

    console.log('\n--- Step 7: Update question to A ---');
    await axios.put('http://localhost:5000/api/admin/questions/' + questionId, {
      question: 'Final Test Q',
      options: ['A', 'B', 'C', 'D'],
      correct_answer: 'A'
    }, config);
    console.log('Update sent');

    console.log('\n--- Step 8: Admin API verify update ---');
    const adminGet2 = await axios.get('http://localhost:5000/api/admin/lessons/0/questions', config);
    const adminQ2 = adminGet2.data.find(q => q.id === questionId);
    console.log('Admin API updated answer:', adminQ2 ? adminQ2.correct_answer : 'N/A');

    console.log('\n--- Step 9: User API verify update ---');
    const userGet2 = await axios.get('http://localhost:5000/api/quiz/0');
    const userQ2 = userGet2.data.find(q => q.id === questionId);
    console.log('User API updated index:', userQ2 ? userQ2.correct_index : 'N/A');

    console.log('\n--- Step 10: Delete question ---');
    await axios.delete('http://localhost:5000/api/admin/questions/' + questionId, config);
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
