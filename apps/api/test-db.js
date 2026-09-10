require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
  const result = await pool.query('SELECT a.name, a.workspace_id, wm.user_id, u.email, wm.role FROM apis a JOIN workspace_members wm ON a.workspace_id = wm.workspace_id JOIN users u ON wm.user_id = u.id');
  console.log(result.rows);
  const result2 = await pool.query('SELECT id, status, invited_user_id, workspace_id FROM workspace_invitations');
  console.log('Invitations:', result2.rows);
  const result3 = await pool.query('SELECT * FROM workspace_members JOIN users u ON u.id = user_id');
  console.log('Members:', result3.rows);
  process.exit(0);
}
run();
