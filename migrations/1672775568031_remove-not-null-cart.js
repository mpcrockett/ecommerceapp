/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
  pgm.sql("DROP TRIGGER IF EXISTS create_cart ON users");
};
