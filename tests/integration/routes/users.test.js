const request = require('supertest');
const User = require('../../../models/User');
const Order = require('../../../models/Order');
const jwt = require('jsonwebtoken');
require('dotenv').config();
jest.mock('../../../models/User');
jest.mock('../../../models/Order');

describe('/api/users', () => {
  let server;
  let user;
  let token;

  beforeEach( async () => {
    server = require('../../../index');
    user = ({
      username: 'user',
      password: 'passWORD12!@',
      email: 'email@password.com',
      first_name: 'First Name',
      last_name: 'Last Name'
    });
    token = jwt.sign({ user_id: user.user_id, username: user.username, is_admin: false }, process.env.JWTPRIVATEKEY);
  });

  afterEach( async () => {
    User.mockClear();
    Order.mockClear();
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
      

    it('should return 404 if no orders are found for this user', async () => {
      Order.mockImplementation(() => {
        return {
          getOrderByOrderId: () => {
            return false;
          },
        };
      });
      const res = await request(server).get('/api/users/account/orders/1').set('x-auth-token', token);
      expect(res.status).toBe(404);
      expect(res.text).toMatch(/Order not found/);
    });
  });

  describe('POST /register', () => {
    it('returns a 400 status if the username is taken', async () => {
      User.mockImplementation(() => {
        return {
          getUserIdByUsername: () => {
            user_id = "userId";
            return user_id;
          },
        }
      });
      const res = await request(server).post('/api/users/register').send(user);
      expect(res.status).toEqual(400);     
    });
   
    it('returns a 400 status if the email address is already registered', async () => {
      User.mockImplementation(() => {
        return {
          getUserIdByUsername: () => {
            return false;
          },
          getUserIdByEmail: () => {
            user_id = "userId";
            return user_id;
          },
        }
      });
      const res = await request(server).post('/api/users/register').send(user);
      expect(res.status).toEqual(400);
    });
    
    it('returns a JWT token and a 201 status if the operation is successful', async () => {
      User.mockImplementation(() => {
        return {
          getUserIdByUsername: () => {
            return false;
          },
          getUserIdByEmail: () => {
            return false;
          },
          createNewUser: () => {
            return "userId";
          },
          generateUserAccessToken: () => {
            return token;
          }
        }
      });
      const res = await request(server).post('/api/users/register').send(user);
      expect(res.status).toBe(201);
      expect(Object.keys(res.headers)).toContain('x-auth-token');
    });
  });

  describe('PUT /account', () => {
    it('returns a 200 status when the user is updated', async () => {
      User.mockImplementation(() => {
        return {
          updateUserById: () => {
            return;
          },
        }
      });
      user.first_name = 'Bob';
      user.birthday = '2000-11-15';
      const { first_name, last_name, birthday } = user;
      const res = await request(server).put('/api/users/account').set('x-auth-token', token).send({ first_name, last_name, birthday});
      expect(res.status).toBe(200);
    });
  });

  describe('PUT /account/password', () => {
    it('returns a 400 status if the current password is incorrect', async () => {
      User.mockImplementation(() => {
        return {
          validateUserPassword: () => {
            return false;
          },
        }
      });
      const body = {
        current_password: 'passWORD',
        password_one: 'PassWORD12!@',
        password_two: 'PassWORD12!@'
      };
      const res = await request(server).put('/api/users/account/password').set('x-auth-token', token).send(body);
      expect(res.status).toBe(400);
    });

    it('returns a 200 message if the password is updated', async () => {
      User.mockImplementation(() => {
        return {
          validateUserPassword: () => {
            return true;
          },
          updateUserPassword: () => {
            return true;
          },
        }
      });
      const body = {
        current_password: 'passWORD12!@',
        password_one: 'PassWORD12!@',
        password_two: 'PassWORD12!@'
      };
      const res = await request(server).put('/api/users/account/password').set('x-auth-token', token).send(body);
      expect(res.status).toBe(200);
    });
  });

  describe('DELETE /account/orders/:id', () => {
    it('returns a 403 status if the order has already shipped', async () => {
      Order.getOrderStatusById.mockImplementation(() => {
        return 'shipped';
      });

      const res = await request(server).delete('/api/users/account/orders/1').set('x-auth-token', token);
      expect(res.status).toBe(403);
    });

    it('returns a 500 error if the order cancellation has an error', async () => {
      Order.getOrderStatusById.mockImplementation(() => {
        return 'processing';
      });
      Order.cancelOrderById.mockImplementation(() => {
        return false;
      });
      const res = await request(server).delete('/api/users/account/orders/1').set('x-auth-token', token);
      expect(res.status).toBe(500);
    });

    it('returns a 200 status if the order is cancelled', async () => {
      Order.getOrderStatusById.mockImplementation(() => {
        return 'processing';
      });
      Order.cancelOrderById.mockImplementation(() => {
        return true;
      });
      const res = await request(server).delete('/api/users/account/orders/1').set('x-auth-token', token);
      expect(res.status).toBe(200);
    });

  });

  describe('DELETE /:id', () => {
    it('deletes a user and returns a 200 status', async () => {
      User.deleteUserById.mockImplementation(() => {
        return;
      });
      token = jwt.sign({ user_id: user.user_id, username: user.username, is_admin: true }, process.env.JWTPRIVATEKEY);
      const res = await request(server).delete('/api/users/1').set('x-auth-token', token);
      expect(res.status).toBe(200);
    })
  });
});
