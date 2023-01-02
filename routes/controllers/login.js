require('dotenv').config();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const pool = require('../../db/index');
const { id } = require('../middleware/data-validation/userSchema');

const login = async (req, res) => {
  const { username, password } = req.body;

  let user = await pool.query("SELECT password, user_id FROM users WHERE username = $1", [username]);

  if(user.rows.length > 0 ) {
    const validPassword = await bcrypt.compare(password, user.rows[0].password);
    if(validPassword) {
      const token = jwt.sign({ id: user.rows[0].user_id, username: username }, process.env.JWTPRIVATEKEY);
      return res.send(token);
    } 
  };

  return res.status(401).send("Invalid username or password.");
};

module.exports = { login };