const pool = require('../db/index');
const logger = require('../logging/index');

getUserByUsername = async (req, res) => {
  const { username } = req.params;
  const { rows } = await pool.query("SELECT first_name, last_name, email, birthday, loyalty_acct FROM users WHERE username = $1", [username]);
  if(rows.length === 0) return res.status(404).send('User not found.');
  return res.json(rows).status(200);
};

module.exports = getUserByUsername;