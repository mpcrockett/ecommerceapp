/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
  pgm.sql("ALTER TABLE users ADD address_id INTEGER");
};
