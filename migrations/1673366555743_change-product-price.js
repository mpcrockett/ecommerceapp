/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
  pgm.sql("ALTER TABLE products DROP COLUMN price");
  pgm.sql("ALTER TABLE products ADD COLUMN price MONEY");
};

