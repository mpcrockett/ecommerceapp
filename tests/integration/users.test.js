const request = require('supertest');
const sequelize = require('../../db/db');

let server;

describe('/api/users', () => {

  describe('GET /', () => {
    beforeEach(() => {
      server = require('../../index');
    });

    afterEach(async () => {
      await server.close();
    });

    it('should return a 200 code', async () => {
      const res = await request(server).get('/api/users');
      expect(res.status).toBe(200);
    });
  });

});