async function test() {
  const res = await fetch('http://localhost:3000/api/auth/sign-up/email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'test5@example.com', password: 'password123', name: 'Test User' })
  });
  console.log('Signup Status:', res.status);
  console.log('Signup Headers:', res.headers);
  console.log('Signup Body:', await res.text());
}
test();
