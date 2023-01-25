require('dotenv').config();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const pool = require('../../db/index');

const login = async (req, res) => {
  const { username, password } = req.body;

  const user = await pool.query("SELECT password, user_id, is_admin FROM users WHERE username = $1", [username]);
  const userPassword = user.rows[0].password;
  if(user.rows.length > 0 ) {
    const validPassword = await bcrypt.compare(password, userPassword);
    if(validPassword) {
      const userId = user.rows[0].user_id;
      const isAdmin = user.rows[0].is_admin;
      const token = jwt.sign({ id: userId, username: username, admin: isAdmin }, process.env.JWTPRIVATEKEY);
      return res.header('x-auth-token', token).status(200).send(username);
    } 
    return res.status(401).send("Invalid username or password.");
  };

  return res.status(401).send("Invalid username or password.");
};

module.exports = { login };