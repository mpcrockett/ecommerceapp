/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
  pgm.sql("ALTER TABLE users ADD CONSTRAINT users_address_id_foreign_key FOREIGN KEY (address_id) REFERENCES addresses(address_id)")
};

exports.down = pgm => {
  pgm.sql("ALTER TABLE users DROP CONSTRAINT users_address_id_foreign_key")
};
