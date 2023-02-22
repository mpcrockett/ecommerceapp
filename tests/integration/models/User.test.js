
const pool = require("../../../db");
const User = require("../../../models/User");
const jwt = require('jsonwebtoken'); 
const bcrypt = require('bcrypt');
const Order = require("../../../models/Order");
const Address = require("../../../models/Address");
require('dotenv').config();

describe("User Model", () => {
  let user;

  beforeEach(async () => {
    user = {
      username: "user",
      password: "12345aaAA!!",
      first_name: "Sally",
      last_name: "Smith",
      email: "sally@smith.com"
    };
  });

  afterEach(async () => {
    await Order.deleteAllOrders();
    await User.deleteAllUsers();
    return;
  })

  afterAll(async () => {
    await User.deleteAllUsers();
    return;
  });

  describe("New user method", () => {
    it("creates a new user with the given input and return the user_id", async () => {
      const newUser = new User(user);
      await newUser.createNewUser();
      const findUserId = await pool.query("SELECT user_id FROM users WHERE username = $1", ['user']);
      expect(findUserId.rows[0].user_id).toEqual(newUser.user_id);
    });

    it("hashes and salts the password", async () => {
      const newUser = new User(user);
      await newUser.createNewUser();
      const encryptedPassword = await pool.query("SELECT password FROM users WHERE user_id = $1", [newUser.user_id]);
      const checkEncryption = await bcrypt.compare(user.password, encryptedPassword.rows[0].password);
      expect(checkEncryption).toBeTruthy();
    });
  });

  describe("Update user method", () => {
    it("updates the user in the database with new input", async () => {
      const newUser = new User(user);
      await newUser.createNewUser();
      user.first_name = "Sarah";
      user.user_id = newUser.user_id;
      const updateUser = new User(user);
      await updateUser.updateUserById();
      const firstName = await pool.query("SELECT first_name FROM users WHERE user_id = $1", [user.user_id]);
      expect(firstName.rows[0].first_name).toEqual("Sarah");
    });
  });

  describe("User Access token method", () => {
    it("generates a valid JWT token with user_id, username, is_admin for the user", async () => {
      const newUser = new User(user);
      await newUser.createNewUser();
      const token = await newUser.generateUserAccessToken();
      const decoded = jwt.verify(token, process.env.JWTPRIVATEKEY);
      expect(Object.keys(decoded)).toEqual(expect.arrayContaining(['user_id', 'username', 'is_admin']));
      expect(decoded.username).toEqual(newUser.username);
    })
  });

  describe("Get User By Id method", () => {
    it("returns an object with the user's account information", async () => {
      const newUser = new User(user);
      await newUser.createNewUser();
      const userInfo = await newUser.getUserById();
      expect(Object.keys(userInfo)).toEqual(expect.arrayContaining(['username', 'first_name', 'last_name', 'email', 'birthday', 'loyalty_acct']));
      expect(userInfo.username).toEqual(user.username);
    });
  });

  describe("Get user_id from username method", () => {
    it("returns the user_id associated with a username if the username is registered", async () => {
      const newUser = new User(user);
      await newUser.createNewUser();
      const { user_id } = newUser;
      const checkId = new User({ username: user.username });
      const getId = await checkId.getUserIdByUsername();
      expect(user_id).toEqual(getId);
    });

    it("Returns a false boolean if the username is not registered", async () => {
      const checkId = new User({ username: user.username });
      const getId = await checkId.getUserIdByUsername();
      expect(getId).toBeFalsy();
    });
  });

  describe("Get user_id from email method", () => {
    it("returns the user_id associated with the email address provided if registered", async () => {
      const newUser = new User(user);
      await newUser.createNewUser();
      const { user_id } = newUser;
      const checkEmail = new User({ email: user.email });
      const getId = await checkEmail.getUserIdByEmail();
      expect(user_id).toEqual(getId);
    });

    it("returns a false boolean if the email address is not registered", async () => {
      const checkEmail = new User({ email: user.email });
      const getId = await checkEmail.getUserIdByEmail();
      expect(getId).toBeFalsy(); 
    });
  });

  describe("Validate user password method", () => {
    it("Validates password against the encrypted password and returns true if they match", async () =>{
      const newUser = new User(user);
      await newUser.createNewUser();
      const passwordUser = new User({ username: user.username, password: user.password });
      const validate = await passwordUser.validateUserPassword();
      expect(validate).toBeTruthy();
    });

    it("Validates password against the encrypted password and returns false if they do not match", async () => {
      const newUser = new User(user);
      await newUser.createNewUser();
      const passwordUser = new User({ username: user.username, password: "12345bbBB##" });
      const validate = await passwordUser.validateUserPassword();
      expect(validate).toBeFalsy();
    });
  });

  describe("Update user password method", () => {
    it("Salts and hashes, updates the password for the user in the database", async () => {
      const newUser = new User(user);
      await newUser.createNewUser();
      const passwordUser = new User({ username: user.username, new_password: "12345bbBB##" });
      await passwordUser.updateUserPassword();
      const dbPassword = await pool.query("SELECT password FROM users WHERE user_id = $1", [newUser.user_id]);
      const checkPassword = await bcrypt.compare("12345bbBB##", dbPassword.rows[0].password);
      expect(checkPassword).toBeTruthy();
    });
  });

  describe("Get user orders static method", () => {
    it("gets the orders associated with a user_id from the database", async () => {
      const newUser = new User(user);
      await newUser.createNewUser();
      const { user_id } = newUser;
      const address = new Address({
        first_name: 'Sally',
        last_name: 'Smith',
        street_one: '123 Main St',
        street_two: 'Apt A',
        city: 'City',
        state: 'ST',
        zipcode: '12345'
      });
      await address.createNewAddress();
      const order = {
        address_id: address.address_id,
        free_shipping: true,
        order_total: 100
      };
      await pool.query("INSERT INTO orders (user_id, address_id, free_shipping, order_total) VALUES ($1, $2, $3, $4)",
        [user_id, order.address_id, order.free_shipping, order.order_total]
      );
      const userOrders = await User.getUserOrdersById(user_id);
      expect(Object.keys(userOrders[0])).toEqual(expect.arrayContaining(['order_id', 'order_total', 'free_shipping', 'order_status']));
    });

    it("returns a false boolean if no orders are found associated with the given user_id", async () => {
      const newUser = new User(user);
      await newUser.createNewUser();
      const { user_id } = newUser;
      const userOrders = await User.getUserOrdersById(user_id);
      expect(userOrders).toBeFalsy();
    });
  });

  describe("Delete user by id static method", () => {
    it("Deletes a user from the database with the given user_id", async () => {
      const newUser = new User(user);
      await newUser.createNewUser();
      const { user_id } = newUser;
      await User.deleteUserById(user_id);
      const checkUser = new User({email: user.email});
      const checkedUser = await checkUser.getUserIdByEmail();
      expect(checkedUser).toBeFalsy();
    });
  });
});

