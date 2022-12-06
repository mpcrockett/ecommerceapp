/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
  pgm.createTable('catagories', {
    catagory_id: { type: 'serial', notNull: true, primaryKey: true },
    name: { type: 'varchar(25)'}
  });
};

