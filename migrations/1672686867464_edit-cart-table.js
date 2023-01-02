/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
  pgm.sql("DROP TABLE cart");
  pgm.sql(`CREATE TABLE cart (
    user_id INTEGER REFERENCES users(user_id),
    item_id INTEGER REFERENCES items(item_id),
    quantity INTEGER,
    PRIMARY KEY (user_id, item_id)
    )`);
};