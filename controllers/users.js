require('dotenv').config();
const User = require('../models/User');
const Order = require('../models/Order');
const Address = require('../models/Address');


module.exports = {
  async getUserById(req, res) {
    const user = new User(req.user);
    const response = await user.getUserById();
    if(!response) return res.status(404).send('User not found.');
    return res.status(200).send(response);
  },
  async createNewUser(req, res) {
    const user = new User(req.user);
    const usernameTaken = await user.getUserIdByUsername();
    if(usernameTaken) return res.status(400).send("This username is taken.");

    const emailRegistered = await user.getUserIdByEmail();
    if(emailRegistered) return res.status(400).send("This email address is already registered.");
  
    await user.createNewUser();
    const token = await user.generateUserAccessToken();

    res.header('x-auth-token', token).status(201).send("User created.");
  },
  async updateUser(req, res) {
    const updateUser = { ...req.updatedUser, ...req.user };
    const user = new User(updateUser);
    await user.updateUserById();
  
    res.status(200).send("User updated.");
  },
  async changeUserPassword(req, res) {
    const new_password = req.new_password;
    const password = req.current_password;
    const { username } = req.user;
  
    const user = new User({ username, password, new_password });
    const validPassword = await user.validateUserPassword();

    if(!validPassword) return res.status(400).send("Password incorrect.");

    await user.updateUserPassword();

    res.status(200).send("Password updated.");
  },
  async getUserOrders(req, res) {
    const { user_id } = req.user;
    const response = await User.getUserOrdersById(user_id);
    if(!response) return res.status(404).send("No orders found.");
    return res.status(200).send(response);
  },
  async getUserOrder(req, res) {
    const { user_id } = req.user;
    const order_id = req.params.id;
    const order = new Order({order_id, user_id});
    const response = await order.getOrderByOrderId();
    if(!response) return res.status(404).send("Order not found.");
    const address = await Address.getAddressById(response.address_id);
    response.address = address;
    res.status(200).send(response);   
  },
  async cancelUserOrder(req, res) {
    const order_id = req.params.id;
    const order_status = await Order.getOrderStatusById(order_id);
    if(order_status !== "processing") return res.status(403).send("Cannot cancel order.");

    const orderCanceled = await Order.cancelOrderById(order_id);
    if (!orderCanceled) return res.status(500).send("Something went wrong");

    res.status(200).send("Order canceled.")
  },
  async deleteUserById(req, res) {
    const user_id = req.params.id;
    await User.deleteUserById(user_id);
    res.status(200).send("User deleted.")
  }
};
