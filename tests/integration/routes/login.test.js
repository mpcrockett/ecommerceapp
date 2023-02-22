const request = require('supertest');
const User = require('../../../models/User');
jest.mock('../../../models/User');

describe('/api/login', () => {
  let server;
  let body

  beforeEach(async () => {
    server = require('../../../index');
    body = {
      username: 'username',
      password: 'Password12!@'
    };
  });

  afterEach(async () => {
    User.mockReset();
    await server.close();
  });

  describe('POST /', () => {
    it('returns 401 if username or password is not valid', async () => {
      const validateUserPasswordMock = jest
      .spyOn(User.prototype, 'validateUserPassword')
      .mockImplementation(() => {
        return false;
      });
      const res = await request(server).post('/api/login').send(body);
      expect(res.status).toBe(401);
      expect(validateUserPasswordMock).toHaveBeenCalled();
      expect(res.text).toMatch(/Invalid username or password/);
    });

    it('returns a JWT and 200 status if username and password are valid', async () => {
      const token = '123';
      const validateUserPasswordMock = jest
      .spyOn(User.prototype, 'validateUserPassword')
      .mockImplementation(() => {
        return true;
      });
      const getUserIdByUsernameMock = jest
      .spyOn(User.prototype, 'getUserIdByUsername')
      .mockImplementation(() => {
        return '1';
      });
      const generateUserAccessTokenMock = jest
      .spyOn(User.prototype, 'generateUserAccessToken')
      .mockImplementation(() => {
        return token;
      });
      const res = await request(server).post('/api/login').send(body);
      expect(res.status).toBe(200);
      expect(res.header['x-auth-token']).toMatch(token);
      expect(validateUserPasswordMock).toHaveBeenCalled();
      expect(getUserIdByUsernameMock).toHaveBeenCalled();
      expect(generateUserAccessTokenMock).toHaveBeenCalled();
    });
  });
});