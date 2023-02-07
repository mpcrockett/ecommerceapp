const pool = require('../db/index');
module.exports = class Address {
  constructor(addObj) {
    this.first_name = addObj.first_name;
    this.last_name = addObj.last_name;
    this.street_one = addObj.street_one;
    this.street_two = addObj.street_two;
    this.city = addObj.city;
    this.state = addObj.state;
    this.zipcode = addObj.zipcode;
  }

  async getAddressId() {
    const address = await pool.query("SELECT address_id FROM addresses WHERE street_address_1 = $1 AND street_address_2 = $2 AND city = $3 AND state = $4 AND zipcode = $5",
      [this.street_one, this.street_two, this.city, this.state, this.zipcode]
    );
    return address.rows.length === 0 ? false : address.rows[0].address_id;
  }

  async createNewAddress() {
    const address = await pool.query("INSERT INTO addresses (first_name, last_name, street_address_1, street_address_2, city, state, zipcode) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING address_id", [this.first_name, this.last_name, this.street_one, this.street_two, this.city, this.state, this.zipcode]);
    this.address_id = address.rows[0].address_id;
    return this.address_id;
  }

  static async getAddressById(address_id) {
    const address = await pool.query("SELECT first_name, last_name, street_address_1, street_address_2, city, state, zipcode FROM addresses WHERE address_id = $1", [address_id]);
    const result = address.rows[0];
    let response = result ? result : false;
    return response;
  }

  static async deleteAddressById(address_id) {
    await pool.query("DELETE FROM addresses WHERE address_id = $1", [address_id]);
    return;
  }

  static async deleteAllAddresses() {
    await pool.query("DELETE FROM addresses WHERE address_id > 0");
    return;
  }

};