async function test() {
  const loginRes = await fetch('http://localhost:3000/api/auth/sign-in/email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Origin': 'http://localhost:3000' },
    body: JSON.stringify({ email: 'test5@example.com', password: 'password123' })
  });
  const loginData = await loginRes.json();
  const cookies = loginRes.headers.getSetCookie();
  
  const getSessionRes = await fetch('http://localhost:3000/api/auth/get-session', {
    headers: { 'Cookie': cookies.join('; '), 'Origin': 'http://localhost:3000' }
  });
  const data = await getSessionRes.json();
  console.log('get-session response:', JSON.stringify(data, null, 2));
}
test();
