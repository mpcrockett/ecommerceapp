const request = require('supertest');
const jwt = require('jsonwebtoken');
const validateProduct = require('../../../middleware/data-validation/products');
jest.mock('../../../middleware/data-validation/products')

describe('Authorization middleware', () => {
  let server;
  let token;

  beforeEach(async () => {
    server = require('../../../index');
    token = jwt.sign({ user_id: "123", username: "username", is_admin: true }, process.env.JWTPRIVATEKEY);
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await server.close();
  });

  describe('authorize', () => {
    it('returns 403 status if the user is not an admin', async () => {
      token = jwt.sign({ user_id: "123", username: "username", is_admin: false }, process.env.JWTPRIVATEKEY);;
      const res = await request(server).post('/api/products').set('x-auth-token', token);
      expect(res.status).toBe(403);
      expect(res.text).toMatch(/Access Denied/);
    });

    it('passes to the next middleware if user is admin', async () => {
      validateProduct.mockImplementation((req, res) => {
        return res.send('Called');
      });
      const res = await request(server).post('/api/products').set('x-auth-token', token);
      expect(validateProduct).toHaveBeenCalled();
      expect(res.text).toMatch(/Called/);
    });
  })
});