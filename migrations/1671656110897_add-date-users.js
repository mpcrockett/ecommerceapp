/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
  pgm.sql('ALTER TABLE users ALTER COLUMN date_created SET DEFAULT CURRENT_TIMESTAMP');
};

