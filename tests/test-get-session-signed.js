async function test() {
  const loginRes = await fetch('https://ep-falling-cell-axrlzm3b.neonauth.c-4.us-east-2.aws.neon.tech/neondb/auth/sign-in/email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Origin': 'http://localhost:3000' },
    body: JSON.stringify({ email: 'test5@example.com', password: 'password123' })
  });
  
  const cookieHeader = loginRes.headers.get('set-cookie');
  const match = cookieHeader.match(/__Secure-neon-auth\.session_token=([^;]+)/);
  const signedCookie = match[1];
  
  console.log('Signed cookie:', signedCookie);
  
  const getSessionRes = await fetch('https://ep-falling-cell-axrlzm3b.neonauth.c-4.us-east-2.aws.neon.tech/neondb/auth/get-session', {
    headers: { 'Cookie': `__Secure-neon-auth.session_token=${signedCookie}`, 'Origin': 'http://localhost:3000' }
  });
  const data = await getSessionRes.json();
  console.log('get-session response:', data);
}
test();
