/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
  pgm.sql("ALTER TABLE products RENAME COLUMN catagory_id TO category_id");
};

