/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
  pgm.sql("CREATE TABLE products_catagories (product_id INTEGER, catagory_id INTEGER, PRIMARY KEY(product_id, catagory_id))");
};

exports.down = pgm => {
  pgm.sql("DROP TABLE products_catagories");
};
