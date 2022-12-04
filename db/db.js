const { Pool } = require('pg');
require('dotenv').config();

let pool = new Pool({
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  database: process.env.DATABASE
});

if (process.env.NODE_ENV = 'development') {
  pool.database = process.env.DATABASE_TEST;
  console.log(process.env.PGDATABASE_TEST);
};

module.exports = pool;