/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
  pgm.createTable('cart', {
    cart_id: { type: 'serial', notNull: true, primaryKey: true },
    items: { type: 'int[]'}
  });
};

