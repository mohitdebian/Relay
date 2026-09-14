async function test() {
  const loginRes = await fetch('https://ep-falling-cell-axrlzm3b.neonauth.c-4.us-east-2.aws.neon.tech/neondb/auth/sign-in/email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Origin': 'http://localhost:3000' },
    body: JSON.stringify({ email: 'test5@example.com', password: 'password123' })
  });
  console.log('Login status:', loginRes.status);
  console.log('Login headers:', Object.fromEntries(loginRes.headers.entries()));
}
test();
