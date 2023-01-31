/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
  pgm.sql("ALTER TABLE orders ALTER COLUMN order_status SET DEFAULT 'processing'");
};


