const { Pool } = require('pg');
require('dotenv').config();

let config = {
  connectionTimeoutMillis: 6000,
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  dialect: 'postgres'
};

if (process.env.NODE_ENV == 'development' || process.env.NODE_ENV === "test") {
  config.database = process.env.PGDATABASE_TEST;
};

const pool = new Pool(config);

module.exports = pool;