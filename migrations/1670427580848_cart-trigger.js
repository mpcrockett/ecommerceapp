/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
  pgm.sql("ALTER TABLE cart ADD user_id INTEGER REFERENCES users(user_id)");
  pgm.sql("CREATE OR REPLACE FUNCTION create_cart_function() RETURNS TRIGGER AS $BODY$ BEGIN INSERT INTO cart(user_id) VALUES (new.user_id); RETURN NEW; END; $BODY$ language plpgsql");
  pgm.sql("CREATE TRIGGER create_cart AFTER INSERT ON users FOR EACH ROW EXECUTE PROCEDURE create_cart_function()");
};

exports.down = pgm => {
  pgm.sql("ALTER TABLE cart DROP COLUMN user_id");
  pgm.sql("DROP FUNCTION create_cart_function()");
  pgm.sql("DROP TRIGGER create_cart");
};
