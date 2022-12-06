const { Pool } = require('pg');
require('dotenv').config();

let pool = new Pool({
    host: process.env.PGHOST,
    port: process.env.PGPORT,
    username: process.env.PGUSERNAME,
    password: process.env.PGPASSWORD,
    databse: process.env.PGDATABASE,
    dialect: 'postgres'
});

if (process.env.NODE_ENV = 'development') {
  pool.database = process.env.DATABASE_TEST;
  console.log(process.env.PGDATABASE_TEST);
};

module.exports = pool;