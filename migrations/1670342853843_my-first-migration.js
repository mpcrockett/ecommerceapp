/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('users', {
    user_id: { type: 'serial', notNull: true, primaryKey: true },
    username: { type: 'varchar(25)', notNull: true, unique: true },
    password: { type: 'varchar', notNull: true },
    is_admin: { type: 'boolean', default: false },
    date_created: { type: 'timestamp', notNull: true },
    date_deleted: { type: 'date' },
    first_name: { type: 'varchar(50)', notNull: true },
    last_name: { type: 'varchar(50)', notNull: true },
    birthday: { type: 'date' },
    loyalty_acct: {type: 'integer' }
  });
};

