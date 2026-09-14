const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL || 'postgresql://mohit:password@localhost:5432/relay' }); // wait, I don't know the DB url. Let me read apps/api/src/db.ts
