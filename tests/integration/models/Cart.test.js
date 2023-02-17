const pool = require('../../../db');
const Cart = require('../../../models/Cart');
const User = require('../../../models/User');

describe('Cart Model', () => {

  describe('Add item to cart method', () => {
    let user;
    let cart;
    let token;

    beforeEach( async () => {
      user = new User({
        username: 'user',
        password: '12345!!AAbb',
        email: 'sally@smith.com',
        first_name: 'Sally',
        last_name: 'Smith'
      });
      await user.createNewUser();
      token = await user.generateUserAccessToken();
      cart = new Cart({
        user_id: user.user_id,
        items: [{ item_id: 1, quantity: 1}]
      });
    });

    afterEach( async() => {
      await cart.deleteAllCartItems();
      await User.deleteAllUsers();
    });

    it('adds an item to the users cart', async () => {
      await cart.addItemToCart();
      const getQuantity = await pool.query("SELECT quantity FROM cart WHERE user_id = $1 AND item_id = $2",
        [user.user_id, cart.items[0].item_id]
      );
      const { quantity } = getQuantity.rows[0];
      expect(quantity).toEqual(1);
    });

    it('increases the quantity of item in cart if item is already added', async () => {
      await cart.addItemToCart();
      cart.items[0].quantity = 2;
      await cart.addItemToCart();
      const getQuantity = await pool.query("SELECT quantity FROM cart WHERE user_id = $1 AND item_id = $2",
      [user.user_id, cart.items[0].item_id]
      );
      const { quantity } = getQuantity.rows[0];
      expect(quantity).toEqual(3);
    })
  });

  describe('Get cart by user ID method', () => {
    let user;
    let cart;

    beforeEach( async () => {
      user = new User({
        username: 'user',
        password: '12345!!AAbb',
        email: 'sally@smith.com',
        first_name: 'Sally',
        last_name: 'Smith'
      });
      await user.createNewUser();
      cart = new Cart({
        user_id: user.user_id,
        items: [{ item_id: 1, quantity: 1}]
      });
      await cart.addItemToCart();
    });

    afterEach( async() => {
      await cart.deleteAllCartItems();
      await User.deleteAllUsers();
    });

    it('gets the users cart', async () => {
      const userCart = await cart.getCartByUserId();
      expect(userCart.items[0].item_id).toEqual(cart.items[0].item_id);
      expect(Object.keys(userCart)).toEqual(expect.arrayContaining(['user_id', 'items', 'cart_total', 'free_shipping']));
    });

    it('returns the total of items added to cart on carts > $75', async () => {
      const userCart = await cart.getCartByUserId();
      const getPrice = await pool.query("SELECT price::numeric FROM products JOIN items ON products.product_id = items.product_id WHERE item_id = $1",
        [cart.items[0].item_id]);
      const { price } = getPrice.rows[0];
      const cartTotal = price * cart.items[0].quantity;
      expect(userCart.order_total).toEqual(cartTotal);
    });

    it('returns the total of items added to cart on carts < $75 plus 10.99', async () => {
      const newItem = {item_id: 5, quantity: 1};
      cart.items = [newItem];
      await cart.addItemToCart(); // price is $28
      cart.items = [{ item_id: 1, quantity: 0}];
      await cart.updateCartItems();
      const userCart = await cart.getCartByUserId();
      const getPrice = await pool.query("SELECT price::numeric FROM products JOIN items ON products.product_id = items.product_id WHERE item_id = $1",
        [newItem.item_id]);
      const { price } = getPrice.rows[0];
      const cartTotal = price * newItem.quantity;
      expect(userCart.order_total).toEqual(cartTotal + 10.99);
    });
  });

  describe('Update cart method', () => {
    let user;
    let cart;
    let token;

    beforeEach( async () => {
      user = new User({
        username: 'user',
        password: '12345!!AAbb',
        email: 'sally@smith.com',
        first_name: 'Sally',
        last_name: 'Smith'
      });
      await user.createNewUser();
      token = await user.generateUserAccessToken();
      cart = new Cart({
        user_id: user.user_id,
        items: [{ item_id: 1, quantity: 1}]
      });
      await cart.addItemToCart();
      cart.items = [{item_id: 2, quantity: 2}];
      await cart.addItemToCart();
    });

    afterEach( async() => {
      await cart.deleteAllCartItems();
      await User.deleteAllUsers();
    });

    it('updates the quantity of items in a users cart', async () => {
      cart.items = [{ item_id: 1, quantity: 2}, {item_id: 2, quantity: 3}];
      await cart.updateCartItems();
      const checkDb1 = await pool.query('SELECT quantity FROM cart WHERE user_id = $1 AND item_id = $2', [cart.user_id, cart.items[0].item_id]);
      const checkDb2 = await pool.query('SELECT quantity FROM cart WHERE user_id = $1 AND item_id = $2', [cart.user_id, cart.items[1].item_id]);
      expect(checkDb1.rows[0].quantity).toEqual(2);
      expect(checkDb2.rows[0].quantity).toEqual(3);
    });
  });

  describe('Delete all cart items method', () => {
    let user;
    let cart;

    beforeEach( async () => {
      user = new User({
        username: 'user',
        password: '12345!!AAbb',
        email: 'sally@smith.com',
        first_name: 'Sally',
        last_name: 'Smith'
      });
      await user.createNewUser();
      cart = new Cart({
        user_id: user.user_id,
        items: [{ item_id: 1, quantity: 1}]
      });
      await cart.addItemToCart();
    });

    afterEach( async() => {
      await cart.deleteAllCartItems();
      await User.deleteAllUsers();
    });

    it('clears the users cart', async () => {
      await cart.deleteAllCartItems();
      const checkCart = await cart.getCartByUserId();
      expect(checkCart).toBeFalsy();
    });
  });
});
