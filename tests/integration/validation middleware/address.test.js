const request = require('supertest');
const jwt = require('jsonwebtoken');
const cart = require('../../../controllers/cart');
jest.mock('../../../controllers/cart');

describe('Address validation middleware', () => {
  let server;
  let address;
  let token;

  beforeEach(async() => {
    server = require('../../../index');
    address = {
      first_name: 'First',
      last_name: 'Last',
      street_one: '123 Main St',
      street_two: 'Apt A',
      city: 'City',
      state: 'ST',
      zipcode: '12345'
    }
    token = jwt.sign({ user_id: "123", username: "username", is_admin: true }, process.env.JWTPRIVATEKEY);
  });

  afterEach( async () => {
    jest.clearAllMocks();
    await server.close();
  });

  describe('validateAddress', () => {
    it('returns 400 status if address is invalid', async () => {
      address.first_name = '';
      const res = await request(server).post('/api/cart/order').set('x-auth-token', token).send(address);
      expect(res.text).toMatch(/"first_name" is not allowed to be empty/);
      expect(res.status).toBe(400);
    })
    
    it('sends the address object in req to next middleware', async () => {
      const placeNewOrderMock = jest
      .spyOn(cart, 'placeNewOrder')
      .mockImplementation((req, res) => {
        return res.send(req.address);
      });
      const res = await request(server).post('/api/cart/order').set('x-auth-token', token).send(address);
      expect(placeNewOrderMock).toHaveBeenCalled();
      expect(Object.keys(JSON.parse(res.text))).toContain('first_name');
    });
  });
})