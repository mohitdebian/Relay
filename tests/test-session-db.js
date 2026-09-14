const { Pool } = require('pg');
require('dotenv').config({ path: 'apps/api/.env' });
const pool = new Pool();
pool.query('SELECT * FROM session LIMIT 1').then(res => {
  console.log('Session table exists:', res.rows);
  pool.end();
}).catch(err => {
  console.error(err);
  pool.end();
});
