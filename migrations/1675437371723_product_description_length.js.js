/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
  pgm.sql("ALTER TABLE products ALTER COLUMN description SET DATA TYPE VARCHAR(250)");
};
