/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
  pgm.sql("ALTER TABLE addresses ADD COLUMN first_name VARCHAR(50)");
  pgm.sql("ALTER TABLE addresses ADD COLUMN last_name VARCHAR(50)");
};
