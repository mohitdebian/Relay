const http = require('http');

const req = http.request(
  {
    hostname: 'localhost',
    port: 3000,
    path: '/overview',
    method: 'GET',
    headers: {
      Cookie:
        '__Secure-neon-auth.session_token=test_token_12345; __Secure-neon-auth.local.session_data=test_data',
    },
  },
  (res) => {
    let data = '';
    res.on('data', (chunk) => (data += chunk));
    res.on('end', () => {
      console.log(`Status: ${res.statusCode}`);
      console.log(`Headers: ${JSON.stringify(res.headers)}`);
      if (res.statusCode >= 300 && res.statusCode < 400) {
        console.log('Redirect location:', res.headers.location);
      }
      console.log(`Body Length: ${data.length}`);
      if (data.length < 1000) console.log(`Body: ${data}`);
    });
  }
);

req.on('error', (e) => console.error(e));
req.end();
