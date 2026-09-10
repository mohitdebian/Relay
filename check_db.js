const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://neondb_owner:npg_rKmP4Mws9xoq@ep-falling-cell-axrlzm3b-pooler.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require',
});

async function main() {
  await client.connect();
  const res = await client.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'apis';
  `);
  console.log(res.rows);
  await client.end();
}

main().catch(console.error);
