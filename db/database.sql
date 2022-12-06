-- Initial Build-out

CREATE TABLE user (
  user_id SERIAL PRIMARY KEY,
  address_id INTEGER,
  username VARCHAR(20) UNIQUE NOT NULL,
  password VARCHAR(50) NOT NULL,
  is_admin BOOLEAN DEFAULT ,
  date_created DATE,
  first_name VARCHAR(25),
  last_name VARCHAR(25),
  birthday DATE,
  loyalty_acct INTEGER
);

CREATE TABLE addresses (
  address_id SERIAL PRIMARY KEY,
  street_address_1 VARCHAR(50),
  street_address_2 VARCHAR(50),
  city VARCHAR(25),
  state VARCHAR(2),
  zipcode VARCHAR(9)
);

CREATE TABLE orders (
  order_id INTEGER PRIMARY KEY,
  user_id INTEGER,
  address_id INTEGER,
  item_id INTEGER,
  shipping_method VARCHAR,
  completed boolean,
  free_shipping boolean
);

CREATE TABLE items (
  item_id INTEGER PRIMARY KEY,
  product_id INTEGER,
  size VARCHAR(4),
  number_in_stock INTEGER
);

CREATE TABLE cart (
  cart_id SERIAL PRIMARY KEY,
  user_id INTEGER,
  items INTEGER[] 
);

CREATE TABLE products (
  product_id INTEGER PRIMARY KEY,
  catagory_id INTEGER,
  description VARCHAR(250)
);

CREATE TABLE catagories (
  catagory_id SERIAL PRIMARY KEY,
  name VARCHAR(25)
);

CREATE TABLE orders_items (
  order_id INTEGER,
  item_id INTEGER
);

CREATE TABLE products_catagories (
  product_id INTEGER,
  catagory_id INTEGER
);

ALTER TABLE addresses ADD FOREIGN KEY (address_id) REFERENCES user (address_id);

ALTER TABLE orders ADD FOREIGN KEY (user_id) REFERENCES user (user_id);

ALTER TABLE cart ADD FOREIGN KEY (user_id) REFERENCES user (user_id);

CREATE TABLE items_cart (
  items_item_id integer,
  cart_items int[],
  PRIMARY KEY (items_item_id, cart_items)
);

ALTER TABLE items_cart ADD FOREIGN KEY (items_item_id) REFERENCES items (item_id);

ALTER TABLE items_cart ADD FOREIGN KEY (cart_items) REFERENCES cart (items);

ALTER TABLE items ADD FOREIGN KEY (product_id) REFERENCES products (product_id);

ALTER TABLE products_catagories ADD FOREIGN KEY (product_id) REFERENCES products (product_id);

ALTER TABLE products_catagories ADD FOREIGN KEY (catagory_id) REFERENCES catagories (catagory_id);

ALTER TABLE orders_items ADD FOREIGN KEY (item_id) REFERENCES items (item_id);

ALTER TABLE orders_items ADD FOREIGN KEY (order_id) REFERENCES orders (order_id);
