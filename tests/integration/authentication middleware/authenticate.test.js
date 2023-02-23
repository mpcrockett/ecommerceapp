const request = require('supertest');
const jwt = require('jsonwebtoken');
const users = require('../../../controllers/users');
jest.mock('../../../controllers/users');

describe('Authentication middleware', () => {
  let server;
  let token;

  beforeEach(async () => {
    server = require('../../../index');
    token = jwt.sign({ user_id: "123", username: "username", is_admin: true }, process.env.JWTPRIVATEKEY);
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await server.close()
  });

  describe('authenticate', () => {
    it('returns a 401 status if no JWT token is provided', async () => {
      const res = await request(server).get('/api/users/account');
      expect(res.status).toBe(401);
      expect(res.text).toMatch(/Access denied/);
    });

    it('returns a 400 status if the token is invalid', async () => {
      const res = await request(server).get('/api/users/account').set('x-auth-token', '12345');
      expect(res.status).toBe(400);
      expect(res.text).toMatch(/Invalid token/);
    });

    it('passes the decoded user object to the next middleware if JWT valid', async () => {
      const getUserByIdMock = jest
      .spyOn(users, 'getUserById')
      .mockImplementation((req, res) => {
        return res.send(req.user);
      });
      const res = await request(server).get('/api/users/account').set('x-auth-token', token);
      expect(getUserByIdMock).toHaveBeenCalled();
      expect(Object.keys(JSON.parse(res.text))).toContain('user_id');
    });
  });
});