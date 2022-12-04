-- Initial Build-out

CREATE DATABASE running_store;

CREATE TABLE users (
  user_id SERIAL PRIMARY KEY,
  cart_id INTEGER REFERENCES cart(id),
  username VARCHAR(25) UNIQUE,
  password VARCHAR,
  date_created DATE
);

CREATE TABLE customers (
  customer_id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(user_id) UNIQUE,
  address_id INTEGER REFERENCES addresses(address_id),
  first_name VARCHAR(50),
  middle_name VARCHAR(50),
  last_name VARCHAR(50),
  birthday DATE,
  loyalty_customer BOOLEAN
);
 
CREATE TABLE addresses (
  address_id SERIAL PRIMARY KEY,
  street_address_1 VARCHAR(50),
  street_address_2 VARCHAR(50),
  city VARCHAR(50),
  state VARCHAR(2),
  zipcode VARCHAR(9)
);

CREATE TABLE cart (
  cart_id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(user_id) UNIQUE,
  expires_on DATE
);

CREATE TABLE orders (
  order_id SERIAL PRIMARY KEY,
  customer_id INTEGER REFERENCES customers(customer_id),
  address_id INTEGER REFERENCES addresses(address_id),
  shipping_method VARCHAR(25),
  completed BOOLEAN,
  free_shipping BOOLEAN
);

CREATE TABLE items (
  item_id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(product_id),
  size VARCHAR(4),
  number_in_stock INTEGER
);

CREATE TABLE products (
  product_id SERIAL PRIMARY KEY,
  name VARCHAR(50),
  description VARCHAR(250)
);

CREATE TABLE catagories (
  catagory_id SERIAL PRIMARY KEY,
  name VARCHAR(25)
);

CREATE TABLE products_catagories (
  product_id INTEGER REFERENCES products(product_id),
  catagory_id INTEGER REFERENCES catagories(catagory_id)
);