/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
  pgm.sql("ALTER TABLE products ADD COLUMN gender VARCHAR(15)");
  pgm.sql("ALTER TABLE items ALTER COLUMN size TYPE VARCHAR(10)");
};
