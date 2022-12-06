/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
  pgm.sql("CREATE TABLE orders_items (order_id INTEGER, item_id INTEGER, PRIMARY KEY(order_id, item_id))");
};

exports.down = pgm => {
  pgm.sql("DROP TABLE orders_items")
};
