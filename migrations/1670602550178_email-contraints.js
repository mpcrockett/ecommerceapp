/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
  pgm.sql("ALTER TABLE users ALTER COLUMN email SET NOT NULL");
  pgm.sql("ALTER TABLE users ADD CONSTRAINT unique_email UNIQUE (email)");
};
