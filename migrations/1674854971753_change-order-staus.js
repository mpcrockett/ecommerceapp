/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
  pgm.sql("ALTER TABLE orders DROP COLUMN processing, DROP COLUMN shipped, DROP COLUMN completed");
  pgm.sql("CREATE TYPE statuses AS ENUM ('processing', 'canceled', 'shipped', 'completed')");
  pgm.sql("ALTER TABLE orders ADD COLUMN order_status STATUSES");
};

