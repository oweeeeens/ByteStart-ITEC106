import fetch from 'node-fetch';

async function runTest() {
  const baseUrl = 'http://localhost:4000/api';
  
  try {
    // 1. Get admin token
    console.log('Logging in as admin...');
    const loginRes = await fetch(\/auth/login, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@admin.com',
        password: 'admin'
      })
    });
    
    const loginData = await loginRes.json();
    if (!loginRes.ok) {
      console.error('Login failed:', loginData);
      return;
    }
    
    const token = loginData.token;
    console.log('Login successful.');

    // 2. Call GET /admin/lessons/0/questions
    console.log('Fetching lesson 0 questions...');
    const questionsRes = await fetch(\/admin/lessons/0/questions, {
      headers: { 
        'Authorization': Bearer \,
        'Content-Type': 'application/json'
      }
    });

    const questions = await questionsRes.json();
    if (!questionsRes.ok) {
      console.error('Fetch questions failed:', questions);
      return;
    }

    // 3. Log the exact JSON response
    console.log('--- START RESPONSE ---');
    console.log(JSON.stringify(questions, null, 2));
    console.log('--- END RESPONSE ---');

    // 4. Show specifically how options and correct_answer are formatted
    if (questions.length > 0) {
      const q = questions[0];
      console.log('\nSample Question Analysis:');
      console.log('ID:', q.id);
      console.log('Text:', q.question_text);
      console.log('Options:', {
        A: q.option_a,
        B: q.option_b,
        C: q.option_c,
        D: q.option_d
      });
      console.log('Correct Answer:', q.correct_answer);
    } else {
      console.log('No questions found for lesson 0.');
    }

  } catch (error) {
    console.error('Test script error:', error.message);
  }
}

runTest();
