const { Client } = require('pg');
const fs = require('fs');

const envFile = fs.readFileSync('/home/mohit/projects/relay/apps/api/.env', 'utf8');
let dbUrl = '';
for (const line of envFile.split('\n')) {
  if (line.startsWith('DATABASE_URL=')) {
    dbUrl = line.split('DATABASE_URL=')[1].replace(/"/g, '').trim();
    break;
  }
}

const url = new URL(dbUrl);
const client = new Client({
  user: url.username,
  password: url.password,
  host: url.hostname,
  port: url.port || 5432,
  database: url.pathname.slice(1),
  ssl: { rejectUnauthorized: false }
});

async function check() {
  await client.connect();
  try {
    const res = await client.query("SELECT name, slug, shared_secret FROM apis WHERE slug = 'tetsing-real-backend'");
    console.log('RESULT:', res.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

check();
