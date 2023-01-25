/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
  pgm.sql("ALTER TABLE orders ADD COLUMN date_canceled TIMESTAMP DEFAULT NULL");
};
