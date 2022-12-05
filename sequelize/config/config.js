require('dotenv').config();

module.exports = {
  development: {
    username: process.env.PGUSERNAME,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE_TEST,
    host: process.env.PGHOST,
    port: process.env.PGPORT,
    dialect: 'postgres'
  },
  production: {
    username: process.env.PGUSERNAME,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
    host: process.env.PGHOST,
    port: process.env.PGPORT,
    dialect: 'postgres'
  }
};
