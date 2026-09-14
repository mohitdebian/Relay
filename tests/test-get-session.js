async function test() {
  const loginRes = await fetch('https://ep-falling-cell-axrlzm3b.neonauth.c-4.us-east-2.aws.neon.tech/neondb/auth/sign-in/email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Origin': 'http://localhost:3000' },
    body: JSON.stringify({ email: 'test5@example.com', password: 'password123' })
  });
  const loginData = await loginRes.json();
  const token = loginData.token;
  
  const getSessionRes = await fetch('https://ep-falling-cell-axrlzm3b.neonauth.c-4.us-east-2.aws.neon.tech/neondb/auth/get-session', {
    headers: { 'Authorization': `Bearer ${token}`, 'Origin': 'http://localhost:3000' }
  });
  console.log('get-session headers:', Object.fromEntries(getSessionRes.headers.entries()));
  const data = await getSessionRes.json();
  console.log('get-session token:', data.session.token);
}
test();
