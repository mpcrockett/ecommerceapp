/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
  pgm.sql("ALTER TABLE products_catagories RENAME TO products_categories");
};

