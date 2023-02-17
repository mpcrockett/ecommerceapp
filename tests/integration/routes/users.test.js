const request = require('supertest');
const User = require('../../../models/User');
const Order = require('../../../models/Order');
const users = require('../../../controllers/users');
const jwt = require('jsonwebtoken');
require('dotenv').config();
jest.mock('../../../models/User');
jest.mock('../../../models/Order');

describe('/api/users', () => {
  let server;
  let user;
  let token;

  beforeEach(async () => {
    server = require('../../../index');
    user = ({
      username: 'user',
      password: 'passWORD12!@',
      email: 'email@password.com',
      first_name: 'First Name',
      last_name: 'Last Name'
    });
    token = jwt.sign({ user_id: user.user_id, username: user.username, is_admin: false }, process.env.JWTPRIVATEKEY);
    User.mockClear();
  });

  afterEach(async() => {
    await server.close();
  });

  describe('GET /account', () => {
    it('should return a user account', async () => {
      User.mockImplementation(() => {
        return {
          getUserById: () => {
            return {
                username: 'user',
                first_name: 'First Name',
                last_name: 'Last Name',
                email: 'email@password.com',
                birthday: null,
                loyalty_acct: null
            };
          },
        }
      });
      const res = await request(server).get('/api/users/account').set('x-auth-token', token);
      expect(res.status).toBe(200);
      expect(Object.keys(res.body)).toContain('email');
    });

    it('should return 404 if user is not found', async () => {
      User.mockImplementation(() => {
        return {
          getUserById: () => {
            return false;
          },
        }
      });
      const res = await request(server).get('/api/users/account').set('x-auth-token', token);
      expect(res.status).toBe(404);
      expect(User).toHaveBeenCalled();
    });
  });

  describe('GET /account/orders', () => {
    it('should return a users orders', async () => {
      User.getUserOrdersById.mockImplementation(() => {
        return [{
          order_id: 'orderID', 
          order_total: "order total", 
          free_shipping: "free shipping",
          order_status: "order status"
        }]
      });
      
      const res = await request(server).get('/api/users/account/orders').set('x-auth-token', token);
      expect(res.status).toBe(200);
      expect(Object.keys(res.body[0])).toContain('order_id');
    });

    it('should return 404 if no orders are found for this user', async () => {
      User.getUserOrdersById.mockImplementation(() => {
        return false;
      });
      
      const res = await request(server).get('/api/users/account/orders').set('x-auth-token', token);
      expect(res.status).toBe(404);
    });
  });

  describe('GET /account/orders/:id', () => {
    it('should return a users order with details by order ID', async () => {
      Order.mockImplementation(() => {
        return {
          getOrderByOrderId: () => {
            return [{
              order_id: 1,
              user_id: 1,
              address_id: 1,
              items: [
                {
                  name: "Saucony Kinvara 12",
                  brand: null,
                  price: "$129.00",
                  gender: "women",
                  size: "10 B",
                  color: "red",
                  quantity: 2
                }
              ],
              free_shipping: true,
              order_status: "processing",
              order_total: "$258.00",
              address: {
                first_name: "First Name",
                last_name: "Last Name",
                street_address_1: "123 Main St",
                street_address_2: "Apt A",
                city: "City",
                state: "ST",
                zipcode: "12345"
              }
            }]
          },
        };
      });
      const res = await request(server).get('/api/users/account/orders/1').set('x-auth-token', token);
      expect(res.status).toBe(200);
      expect(Object.keys(res.body[0])).toContain('order_id');
    });
      

    // it('should return 404 if no orders are found for this user', async () => {
    //   User.getUserOrdersById.mockImplementation(() => {
    //     return false;
    //   });
      
    //   const res = await request(server).get('/api/users/account/orders').set('x-auth-token', token);
    //   expect(res.status).toBe(404);
    // });
  });
});