const request = require('supertest');
const Order = require('../../../models/Order');
const Cart = require('../../../models/Cart');
const Address = require('../../../models/Address');
const jwt = require('jsonwebtoken');
require('dotenv').config();
jest.mock('../../../models/User');
jest.mock('../../../models/Order');
jest.mock('../../../models/Cart');
jest.mock('../../../models/Address');

describe('/api/cart', () => {
  let server;
  let token;
  let user;
  let getAddressIdMock;
  let createAddressMock;
  let createNewOrderMock;

  beforeEach(async() => {
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
    // getAddressIdMock?.mockClear();
    // getAddressIdMock = null;
    // createAddressMock?.mockClear();
    // createAddressMock = null;
    // createNewOrderMock?.mockClear();
    // createNewOrderMock = null;
    Address.mockReset();
    Order.mockReset();
    Cart.mockReset();
    await server.close();
  });
  
  describe('GET /', () => {
    it('gets a users cart and returns a 200 status', async() => {
      Cart.mockImplementation(() => {
        return {
          getCartByUserId: () => {
            return {
              user_id: 4733,
              items: [
                {
                  item_id: 5,
                  product_id: 4,
                  name: "Bandit Dad Cap",
                  size: "one size",
                  quantity: 1
                },
                {
                  item_id: 4,
                  product_id: 1,
                  name: "Saucony Kinvara 12",
                  size: "7 N",
                  quantity: 1
                }
              ],
              free_shipping: true,
              order_total: 157
            }
          }
        }
      });
      const res = await request(server).get('/api/cart').set('x-auth-token', token);
      expect(res.status).toBe(200);
      expect(Object.keys(res.body)).toContain('items');
    });
    
    it('returns a 200 status if the cart is empty', async() => {
      Cart.mockImplementation(() => {
        return {
          getCartByUserId: () => {
            return false;
          }
        }
      });
      const res = await request(server).get('/api/cart').set('x-auth-token', token);
      expect(res.status).toBe(200);
      expect(res.text).toMatch(/Cart is empty/);
    });
    
  });
  
  describe('PUT /update', () => {
    it('updates the quantity of items in the cart and returns 200 status', async() => {
      Cart.mockImplementation(() => {
        return {
          updateCartItems: () => {
            return true;
          }
        }
      });
      const res = await request(server).put('/api/cart/update').set('x-auth-token', token);
      expect(res.status).toBe(200);
      expect(res.text).toMatch(/Cart updated/);
    });
    
    it('returns 500 if there is an error updating the cart in the database', async() => {
      Cart.mockImplementation(() => {
        return {
          updateCartItems: () => {
            return false;
          }
        }
      });
      const res = await request(server).put('/api/cart/update').set('x-auth-token', token);
      expect(res.status).toBe(500);
      expect(res.text).toMatch(/omething went wrong/);
    });
  });
  
  describe('DELETE /', () => {
    it('returns a 200 status when all items are removed from the cart', async() => {
      Cart.mockImplementation(() => {
        return {
          deleteAllCartItems: () => {
            return
          }
        }
      });
      const res = await request(server).delete('/api/cart').set('x-auth-token', token);
      expect(res.status).toBe(200);
      expect(res.text).toMatch(/All items removed/);
    });
  });
  
  describe('POST /order', () => {
    it('calls a method to get the address id if it exists', async() => {
      getAddressIdMock = jest
      .spyOn(Address.prototype, 'getAddressId')
      .mockImplementation(() => {
        return true;
      });
      createAddressMock = jest
      .spyOn(Address.prototype, 'createNewAddress')
      .mockImplementation(() => {
        return true;
      });
      Order.mockImplementation(() => {
        return {
          createNewOrder: () => {
            return true;
          }
        }
      });
      Cart.mockImplementation(() => {
        return {
          getCartByUserId: () => {
            return {
              items: [],
              order_total: 200,
              free_shipping: true
            }
          }
        }
      });
      const address = {
        first_name: 'Sally',
        last_name: 'Smith',
        street_one: '123 Main Street',
        street_two: 'Apt 1A',
        city: 'City',
        state: 'ST',
        zipcode: '12345',
      };
      const res = await request(server).post('/api/cart/order').set('x-auth-token', token).send(address);
      expect(res.status).toBe(201);
      expect(getAddressIdMock).toHaveBeenCalled();
      expect(createAddressMock).not.toHaveBeenCalled();
    });
    
    it('calls a method to create a new address if the address doesnt exist', async() => {
      getAddressIdMock = jest
      .spyOn(Address.prototype, 'getAddressId')
      .mockImplementationOnce(() => {
        return false;
      });
      createAddressMock = jest
      .spyOn(Address.prototype, 'createNewAddress')
      .mockImplementationOnce(() => {
        return true;
      });
      Order.mockImplementation(() => {
        return {
          createNewOrder: () => {
            return true;
          }
        }
      });
      Cart.mockImplementation(() => {
        return {
          getCartByUserId: () => {
            return {
              items: [],
              order_total: 200,
              free_shipping: true
            }
          }
        }
      });
      const address = {
        first_name: 'Sally',
        last_name: 'Smith',
        street_one: '123 Main Street',
        street_two: 'Apt 1A',
        city: 'City',
        state: 'ST',
        zipcode: '12345',
      };
      const res = await request(server).post('/api/cart/order').set('x-auth-token', token).send(address);
      expect(res.status).toBe(201);
      expect(getAddressIdMock).toHaveBeenCalled();
      expect(createAddressMock).toHaveBeenCalled();
    });
    
    it('calls a method to create a new address if the address doesnt exist too', async() => {
      getAddressIdMock = jest
      .spyOn(Address.prototype, 'getAddressId')
      .mockImplementationOnce(() => {
        return false;
      });
      createAddressMock = jest
      .spyOn(Address.prototype, 'createNewAddress')
      .mockImplementationOnce(() => {
        return true;
      });
      Order.mockImplementation(() => {
        return {
          createNewOrder: () => {
            return true;
          }
        }
      });
      Cart.mockImplementation(() => {
        return {
          getCartByUserId: () => {
            return {
              items: [],
              order_total: 200,
              free_shipping: true
            }
          }
        }
      });
      const address = {
        first_name: 'Sally',
        last_name: 'Smith',
        street_one: '123 Main Street',
        street_two: 'Apt 1A',
        city: 'City',
        state: 'ST',
        zipcode: '12345',
      };
      const res = await request(server).post('/api/cart/order').set('x-auth-token', token).send(address);
      expect(res.status).toBe(201);
      expect(getAddressIdMock).toHaveBeenCalled();
      expect(createAddressMock).toHaveBeenCalled();
    });
    
    it('calls a method to create a new order', async() => {
      Address.mockImplementation(() => {
        return {
          getAddressId: () => true
        }
      });
      createNewOrderMock = jest
      .spyOn(Order.prototype, 'createNewOrder')
      .mockImplementationOnce(() => true);
      Cart.mockImplementation(() => {
        return {
          getCartByUserId: () => {
            return {
              items: [],
              order_total: 200,
              free_shipping: true
            }
          }
        }
      });
      const address = {
        first_name: 'Sally',
        last_name: 'Smith',
        street_one: '123 Main Street',
        street_two: 'Apt 1A',
        city: 'City',
        state: 'ST',
        zipcode: '12345',
      };
      const res = await request(server).post('/api/cart/order').set('x-auth-token', token).send(address);
      expect(res.status).toBe(201);
      expect(createNewOrderMock).toHaveBeenCalled();
    });
    
    it('returns 500 status if error creating a new order', async () => {
      Address.mockImplementation(() => {
        return {
          getAddressId: () => true
        }
      });
      createNewOrderMock = jest
      .spyOn(Order.prototype, 'createNewOrder')
      .mockImplementationOnce(() => {
        return false;
      });
      Cart.mockImplementation(() => {
        return {
          getCartByUserId: () => {
            return {
              items: [],
              order_total: 200,
              free_shipping: true
            }
          }
        }
      });
      const address = {
        first_name: 'Sally',
        last_name: 'Smith',
        street_one: '123 Main Street',
        street_two: 'Apt 1A',
        city: 'City',
        state: 'ST',
        zipcode: '12345',
      };
      const res = await request(server).post('/api/cart/order').set('x-auth-token', token).send(address);
      expect(res.status).toBe(500);
      expect(createNewOrderMock).toHaveBeenCalled();
    });
    
    
    
  })
  
});