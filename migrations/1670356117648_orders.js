/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
  pgm.createTable('orders', {
    order_id: { type: 'serial', notNull: true, primaryKey: true },
    user_id: { type: 'integer', notNull: true },
    address_id: { type: 'integer', notNull: true },
    item_id: { type: 'integer', notNull: true },
    shipping_method: { type: 'varchar(25)'},
    completed: { type: 'boolean', default: false },
    free_shipping: { type: 'boolean', default: false }
  });
};
