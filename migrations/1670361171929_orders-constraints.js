/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
  pgm.sql("ALTER TABLE orders ADD CONSTRAINT orders_user_id_foreign_key FOREIGN KEY (user_id) REFERENCES users(user_id)");
  pgm.sql("ALTER TABLE orders ADD CONSTRAINT orders_address_id_foreign_key FOREIGN KEY (address_id) REFERENCES addresses(address_id)");
};

exports.down = pgm => {
  pgm.sql("ALTER TABLE orders DROP CONSTRAINT orders_user_id_foreign_key");
  pgm.sql("ALTER TABLE orders DROP CONSTRAINT orders_address_id_foreign_key");
};
