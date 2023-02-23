const request = require('supertest');
const users = require('../../../controllers/users');
const jwt = require('jsonwebtoken');
jest.mock('../../../controllers/users'); 

describe('User validation middleware', () => {
  let server;
  let user;
  let token;
  
  beforeEach(async () => {
    server = require('../../../index');
    user = {
      username: 'username',
      password: 'passwoRD12!@',
      first_name: 'First name',
      last_name: 'Last name',
      email: 'email@email.com',
      birthday: '2000-01-01'
    };
    token = jwt.sign({ user_id: "123", username: "username", is_admin: true }, process.env.JWTPRIVATEKEY);
  });
  
  afterEach(async () => {
    jest.clearAllMocks();
    await server.close();
  })
  describe('validateNewUser', () => {
    it('returns a 400 code if the user input is invalid', async () => {
      user.username = '';
      const res = await request(server).post('/api/users/register').send(user);
      expect(res.status).toBe(400);
    });
    
    it('passes the user object in the req to the next middleware', async () => {
      const createNewUserMock = jest
      .spyOn(users, 'createNewUser')
      .mockImplementation((req, res) => {
        return res.send(req.user);
      });
      const res = await request(server).post('/api/users/register').send(user);
      expect(createNewUserMock).toHaveBeenCalled();
      expect(res.text).toEqual(JSON.stringify(user));
    });
  });

  describe('validateUserUpdates', () => {
    it('returns a 400 code if the user update input is invalid', async () => {
      let { first_name, last_name, birthday } = user;
      birthday = '01/01/00';
      const updates = { first_name, last_name, birthday };
      const res = await request(server).put('/api/users/account').set('x-auth-token', token).send(updates);
      expect(res.status).toBe(400);
      expect(res.text).toMatch(/"birthday" must be in YYYY-MM-DD format/);
    });
    
    it('passes the user update object in the req to the next middleware', async () => {
      let { first_name, last_name, birthday } = user;
      const updates = { first_name, last_name, birthday };
      const updateUserMock = jest
      .spyOn(users, 'updateUser')
      .mockImplementation((req, res) => {
        return res.send(req.updatedUser);
      });
      const res = await request(server).put('/api/users/account').set('x-auth-token', token).send(updates);
      expect(updateUserMock).toHaveBeenCalled();
      expect(res.text).toEqual(JSON.stringify(updates));
    });
  });

  describe('validatePassword', () => {
    let body;

    beforeEach(() => {
      body = {
        current_password: user.password,
        password_one: 'pASSword12!@',
        password_two: 'pASSword12!@'
      };
    });

    it('returns a 400 code if the password entries do not match', async () => {
      body.password_two = 'PAssword12!@';
      const res = await request(server).put('/api/users/account/password').set('x-auth-token', token).send(body);
      expect(res.status).toBe(400);
      expect(res.text).toMatch(/New password entries do not match/);
    });

    it('returns a 400 code if new password entry is invalid', async () => {
      body.password_one = 'password';
      body.password_two = 'password';
      const res = await request(server).put('/api/users/account/password').set('x-auth-token', token).send(body);
      expect(res.status).toBe(400);
      expect(res.text).toMatch(/"password" should contain at least 2 special character/);
    });
    
    it('passes the current and new passwords to the next middleware', async () => {
      const changeUserPasswordMock = jest
      .spyOn(users, 'changeUserPassword')
      .mockImplementation((req, res) => {
        return res.send(req.current_password);
      });
      const res = await request(server).put('/api/users/account/password').set('x-auth-token', token).send(body);
      expect(changeUserPasswordMock).toHaveBeenCalled();
      expect(res.text).toMatch(/passwoRD12!@/);
    });
  });
});
