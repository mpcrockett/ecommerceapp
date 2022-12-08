const logger = require('./logging/index');
const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();

//middleware
require('./routes')(app);

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`Now listening on port ${port}`)
});

module.exports = server;