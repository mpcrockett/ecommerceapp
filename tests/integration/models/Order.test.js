const pool = require("../../../db");
const Address = require("../../../models/Address");
const Cart = require("../../../models/Cart");
const Order = require("../../../models/Order");
const User = require("../../../models/User");


describe('Order model', () => {
  let address;
  let items;
  let user;
  let order;

  beforeEach(async () => {
    user = new User({
      username: 'user',
      password: '12345!!aaBB',
      email: 'sally@smith.com',
      first_name: 'Sally',
      last_name: 'Smith',
    });
    await user.createNewUser();
    items = [
      { item_id: 1, quantity: 1 },
      { item_id: 2, quantity: 2 }
    ];
    address = new Address({
      first_name: 'Sally',
      last_name: 'Smith',
      street_one: '123 Main St',
      street_two: 'Apt A',
      city: 'City',
      state: 'ST',
      zipcode: '12345'
    });
    await address.createNewAddress();
    order = new Order({
      user_id: user.user_id,
      address_id: address.address_id,
      items
    });
  });

  afterEach( async () => {
    await Order.deleteAllOrders();
    await Address.deleteAllAddresses();
    await User.deleteAllUsers();
    jest.restoreAllMocks();
  });

  describe('Create new order method', () => {
    it('creates a new order with the given input and returns the order_id', async () => {
      await order.createNewOrder();
      const checkDb = await pool.query("SELECT order_id FROM orders WHERE user_id = $1", [user.user_id]);
      expect(order.order_id).toEqual(checkDb.rows[0].order_id);
    });

    it('decreases the stock number of the items ordered', async () => {
      const getBeforeItem1 = await pool.query("SELECT number_in_stock FROM items WHERE item_id = $1", [items[0].item_id]);
      const beforeItem1 = getBeforeItem1.rows[0].number_in_stock;
      const getBeforeItem2 = await pool.query("SELECT number_in_stock FROM items WHERE item_id = $1", [items[1].item_id]);
      const beforeItem2 = getBeforeItem2.rows[0].number_in_stock;
      await order.createNewOrder();
      const getAfterItem1 = await pool.query("SELECT number_in_stock FROM items WHERE item_id = $1", [items[0].item_id]);
      const afterItem1 = getAfterItem1.rows[0].number_in_stock;
      const getAfterItem2 = await pool.query("SELECT number_in_stock FROM items WHERE item_id = $1", [items[1].item_id]);
      const afterItem2 = getAfterItem2.rows[0].number_in_stock;
      expect(afterItem1).toEqual(beforeItem1 - items[0].quantity);
      expect(afterItem2).toEqual(beforeItem2 - items[1].quantity);
    });

    it('adds an entry to orders-items table in database for each item', async () => {
      await order.createNewOrder();
      const checkDb = await pool.query('SELECT item_id FROM orders_items WHERE order_id = $1', [order.order_id]);
      expect(checkDb.rows.length).toEqual(2);
    });

    it('clears the users cart', async () => {
      const cart = new Cart({ items: [items[0]], user_id: user.user_id });
      await cart.addItemToCart();
      cart.items = [items[1]];
      await cart.addItemToCart();
      await order.createNewOrder();
      const checkDb = await pool.query('SELECT * FROM cart WHERE user_id = $1', [user.user_id]);
      expect(checkDb.rows.length).toEqual(0);
    });

    it('returns false if an error occurs', async () => {
      const cart = new Cart({ items: [items[0]], user_id: user.user_id });
      await cart.addItemToCart();
      cart.items = [items[1]];
      await cart.addItemToCart();
      order.user_id = 'Melissa';
      const newOrder = await order.createNewOrder();
      expect(newOrder).toBeFalsy();
    });
  });

  describe('Get order by order ID method', () => {
    it('gets the order object by the order_id', async () => {
      await order.createNewOrder();
      const result = await order.getOrderByOrderId();
      expect(Object.keys(result.items[0])).toEqual(expect.arrayContaining(
      ['name', 'brand', 'price', 'gender', 'size', 'color', 'quantity']));
    });
  });

  describe('Get order status by order ID static method', () => {
    it('gets the order status', async () => {
      await order.createNewOrder();
      const status = await Order.getOrderStatusById(order.order_id);
      expect(status).toMatch(/processing/);
    });
  });

  describe('Cancel order by order ID static method', () => {
    it('sets the order status to canceled', async () => {
      await order.createNewOrder();
      await Order.cancelOrderById(order.order_id);
      const checkDb = await pool.query('SELECT order_status FROM orders WHERE order_id = $1', [order.order_id]);
      expect(checkDb.rows[0].order_status).toMatch(/canceled/);
    });

    it('inserts a timestamp into the database when the order is canceled', async () =>{
      await order.createNewOrder();
      await Order.cancelOrderById(order.order_id);
      const checkDb = await pool.query('SELECT date_canceled FROM orders WHERE order_id = $1', [order.order_id]);
      expect(checkDb.rows[0].date_canceled).not.toBeNull();
    });

    it('returns the ordered items to stock', async () => {
      await order.createNewOrder();
      const getBeforeItem1 = await pool.query("SELECT number_in_stock FROM items WHERE item_id = $1", [items[0].item_id]);
      const beforeItem1 = getBeforeItem1.rows[0].number_in_stock;
      const getBeforeItem2 = await pool.query("SELECT number_in_stock FROM items WHERE item_id = $1", [items[1].item_id]);
      const beforeItem2 = getBeforeItem2.rows[0].number_in_stock;
      await Order.cancelOrderById(order.order_id);
      const getAfterItem1 = await pool.query("SELECT number_in_stock FROM items WHERE item_id = $1", [items[0].item_id]);
      const afterItem1 = getAfterItem1.rows[0].number_in_stock;
      const getAfterItem2 = await pool.query("SELECT number_in_stock FROM items WHERE item_id = $1", [items[1].item_id]);
      const afterItem2 = getAfterItem2.rows[0].number_in_stock;
      expect(afterItem1).toEqual(beforeItem1 + items[0].quantity);
      expect(afterItem2).toEqual(beforeItem2 + items[1].quantity);
    });

    it('returns false if an error occurs', async () => {
      await order.createNewOrder();
      order.order_id = 'Melissa';
      const cancelOrder = await Order.cancelOrderById(order.order_id);
      expect(cancelOrder).toBeFalsy();
    });
  });

  describe('Delete all orders static method', () => {
    it('deletes all orders from the database', async () => {
      await order.createNewOrder();
      await Order.deleteAllOrders();
      const checkDb = await pool.query("SELECT * FROM orders");
      expect(checkDb.rows.length).toEqual(0);
    });
  });
});