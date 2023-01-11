/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
  pgm.sql("ALTER TABLE orders ADD COLUMN date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP");
};
