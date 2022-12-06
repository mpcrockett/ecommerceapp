/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
  pgm.sql("ALTER TABLE products ADD CONSTRAINT products_catagory_id FOREIGN KEY (catagory_id) REFERENCES catagories(catagory_id)");
};

exports.down = pgm => {
  pgm.sql("ALTER TABLE products DROP CONSTRAINT products_catagory_id");
};
