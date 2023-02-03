const request = require('supertest');
const { updateUser } = require('../../controllers/users');
const Address = require('../../models/Address');
const Cart = require('../../models/Cart');
const Order = require('../../models/Order');
const User = require('../../models/User');

let server;

describe('/api/users/account', () => {
  describe('GET /account', () => {
    let user;
    let token;

    beforeEach(async () => {
      server = require('../../index');
      user = new User({
        username: "user",
        password: "!12345!aaB",
        first_name: "Bob",
        last_name: "Smith",
        email: "bob@smith.com"
      });
      user.is_admin = true;
      await user.createNewUser();
    });

    const exec = () => {
      return request(server)
        .get('/api/users/account')
        .set('x-auth-token', token)
    };

    afterEach(async () => {
      await User.deleteUserById(user.user_id);
      await server.close();
    });

    afterAll(async () => {
      await server.close();
    })

    it('should return a 401 code if no token is provided', async () => {
      token = '';
      const res = await exec();
      expect(res.status).toBe(401);
    });

    it('should return a 400 code if token is invalid', async () => {
      token = "1234567890";
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it('should return a 404 code if user is not found', async () => {
      const prevId = user.user_id;
      user.user_id = "123";
      token = await user.generateUserAccessToken();
      const res = await exec();
      await User.deleteUserById(prevId);
      expect(res.status).toBe(404);
    });

    it('should return the user profile', async () => {
      token = await user.generateUserAccessToken();
      const res = await exec();
      expect(res.status).toBe(200);
      expect(Object.keys(res.body)).toEqual(expect.arrayContaining(['username', 'first_name', 'last_name', 'email', 'birthday', 'loyalty_acct']));
    });
  });

  // describe('GET /account/orders', () => {
  //   describe('GET /account/orders', () => {
  //     let user = new User({
  //       username: "user",
  //       password: "!12345!aaB",
  //       first_name: "Bob",
  //       last_name: "Smith",
  //       email: "bob@smith.com"
  //     });
  //     let address = {
  //       first_name: "Bob",
  //       last_name: "Smith",
  //       street_one: "123 Main St",
  //       city: "City",
  //       state: "CT",
  //       zipcode: "12345"
  //     };
  //     let cart = {
  //       user_id: '',
  //       items: [{item_id: 1, quantity: 1}]
  //     };
  //     let token;
    
  //     beforeEach(async () => {
  //       server = require('../../index');
  //       await user.createNewUser();
  //       const cart1 = new Cart(cart);
  //       cart1.user_id = user.user_id;
  //       await cart1.addItemToCart();
  //       token = await user.generateUserAccessToken();
  //     });

  //     afterEach(async () => {
  //       await User.deleteUserById(user.user_id);
  //       await server.close();
  //     });

  //     afterAll(async () => {
  //       await User.deleteAllUsers();
  //     });

  //     const exec = () => {
  //       return request(server)
  //         .get('/api/users/account/orders')
  //         .set('x-auth-token', token)
  //     };

  //     it('should return the users orders', async () => {
  //       const order = new Order(address);
  //       await order.createNewOrder();
  //       cart.user_id = user.user_id;
  //       cart.items = [{ item_id: 2, quantity: 2}];
  //       const cart2 = new Cart(cart);
  //       await cart2.addItemToCart();
  //       const order2 = new Order(address);
  //       await order2.createNewOrder();
  //       const res = await exec();
  //       expect(res.status).toBe(200);
  //       console.log(res);
  //     });
  //   });
  // });
});
