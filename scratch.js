const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL_UNPOOLED });
pool.query(`
  SELECT * FROM apis WHERE workspace_id IN (4, 6, 10);
`, (err, res) => {
  if (err) console.error(err);
  else {
    console.log("APIs in orphaned workspaces:");
    console.table(res.rows);
  }
  pool.end();
});
