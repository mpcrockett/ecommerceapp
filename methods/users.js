const pool = require('../db/index');

const getAllUsers = async () => {
  try {
    const { rows } = await pool.query("SELECT * FROM users");
    return rows;
  } catch (err) {
    console.log(err);
  }
};

module.exports = getAllUsers;