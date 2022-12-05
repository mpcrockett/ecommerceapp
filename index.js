const express = require('express');
const cors = require('cors');
const sequelize = require('./db/db');
const app = express();

//middleware
require('./routes')(app);

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`Now listening on port ${port}`)
});

module.exports = server;