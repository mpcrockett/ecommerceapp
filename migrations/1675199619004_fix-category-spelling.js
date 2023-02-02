/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
  pgm.sql("ALTER TABLE catagories RENAME TO categories");
  pgm.sql("ALTER TABLE categories RENAME COLUMN catagory_id TO category_id");
};
