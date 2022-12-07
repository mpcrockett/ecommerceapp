const { Pool } = require('pg');
require('dotenv').config();

let connection = {
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  dialect: 'postgres'
};

if (process.env.NODE_ENV == 'development') {
  connection.database = process.env.PGDATABASE_TEST;
};

const pool = new Pool(connection);

module.exports = pool;