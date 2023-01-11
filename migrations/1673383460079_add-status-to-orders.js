/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
  pgm.sql("ALTER TABLE orders ADD COLUMN shipped BOOLEAN DEFAULT false");
  pgm.sql("ALTER TABLE orders ADD COLUMN processing BOOLEAN DEFAULT true");
};
