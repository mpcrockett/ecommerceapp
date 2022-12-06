/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
  pgm.createTable('items', {
    item_id: { type: 'serial', notNull: true, primaryKey: true },
    product_id: { type: 'integer', notNull: true },
    size: { type: 'varchar(4)'},
    number_in_stock: { type: 'integer'},
  });
};
