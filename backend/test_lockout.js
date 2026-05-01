import 'dotenv/config'
import fetch from 'node-fetch'

const BASE_URL = 'http://localhost:4000/api'
const testEmail = 'test@example.com'

async function registerUser() {
  console.log('📝 Registering test user...')
  try {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: 'Test User',
        guardian_name: 'Test Guardian',
        age: 12,
        grade_level: '6',
        email: testEmail,
        password: 'TestPass123'
      })
    })
    const data = await res.json()
    if (res.ok) {
      console.log('✓ User registered:', testEmail)
      return true
    } else {
      console.log('✗ Registration failed:', data.error)
      return false
    }
  } catch (e) {
    console.error('Error registering:', e.message)
    return false
  }
}

async function testLockout() {
  console.log('\n🔒 Testing lockout system (10 failed attempts)...')
  
  for (let i = 1; i <= 12; i++) {
    try {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testEmail,
          password: 'WrongPass123'
        })
      })
      const data = await res.json()
      
      if (res.status === 423) {
        console.log(`✓ Attempt ${i}: Account LOCKED (${data.retry_after_seconds}s until unlock)`)
      } else if (res.status === 401) {
        console.log(`✗ Attempt ${i}: Invalid credentials (attempts: ${i})`)
      } else {
        console.log(`? Attempt ${i}: Status ${res.status}`)
      }
    } catch (e) {
      console.error(`Error on attempt ${i}:`, e.message)
    }
    await new Promise(r => setTimeout(r, 100))
  }
}

async function testCorrectPassword() {
  console.log('\n✓ Testing correct password after lockout expires...')
  await new Promise(r => setTimeout(r, 61000)) // Wait 61 seconds for lockout to expire
  
  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'TestPass123'
      })
    })
    const data = await res.json()
    
    if (res.ok && data.token) {
      console.log('✓ Login successful after lockout expired')
    } else {
      console.log('✗ Login failed:', data.error)
    }
  } catch (e) {
    console.error('Error:', e.message)
  }
}

async function main() {
  const registered = await registerUser()
  if (registered) {
    await testLockout()
    // Uncomment to test after lockout expires
    // await testCorrectPassword()
  }
  process.exit(0)
}

main()
