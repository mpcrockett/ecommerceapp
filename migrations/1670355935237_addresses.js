/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => { 
  pgm.createTable('addresses', {
    address_id: { type: 'serial', notNull: true, primaryKey: true },
    street_address_1: { type: 'varchar(25)', notNull: true },
    street_address_2: { type: 'varchar(25)', notNull: true },
    city: { type: 'varchar(50)', notNull: true },
    state: { type: 'varchar(2)', notNull: true },
    zipcode : { type: 'varchar(9)', notNull: true }
  });
};
