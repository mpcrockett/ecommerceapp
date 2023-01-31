require('dotenv').config();
const logger = require('../logging/index');
const User = require('../models/User');
const Order = require('../models/Order');


const getUserById = async (req, res) => {
  const{ user_id } = req.user;
  const response = await User.getUserById(user_id);
  if(response.length === 0) return res.status(404).send('User not found.');
  return res.status(200).send(response);
};

const createNewUser = async (req, res) => {
  const { username, email } = req.user;

  let user = await User.getUserIdByUsername(username);
  if(user.length > 0) return res.status(400).send("This username is taken.");

  user = await User.getUserIdByEmail(email);
  if(user.length > 0) return res.status(400).send("This email address is already registered.");
  
  const user_id = await User.createNewUser(req.user);
  const token = await User.generateUserAccessToken({user_id, username});

  res.header('x-auth-token', token).status(201).send("User created.");
};

const updateUser = async (req, res) => {
  const updatedUser = { ...req.updatedUser, ...req.user };

  await User.updateUserById(updatedUser);
  
  res.status(200).send("User updated.");
};

const changeUserPassword = async (req, res) => {
  const { current_password, password_one } = req.body;
  const { username } = req.user;
  
  const validPassword = await User.validateUserPassword(username, current_password);

  if(!validPassword) return res.status(400).send("Password incorrect.");

  await User.updateUserPassword(username, password_one );

  res.status(200).send("Password updated.");
};

const getUserOrders = async (req, res) => {
  const { user_id } = req.user;
  const response = await User.getUserOrders(user_id);
  if(!response) return res.status(404).send("No orders found.");
  return res.status(200).send(response);
};

const cancelUserOrder = async (req, res) => {
  const order_id = req.params.id;
  const order_status = await Order.getOrderStatusById(order_id);
  if(order_status !== "processing") return res.status(403).send("Cannot cancel order.");

  const orderCanceled = await Order.cancelOrderById(order_id);
  if (!orderCanceled) return res.status(500).send("Something went wrong");

  res.status(200).send("Order canceled.")
};

module.exports = { getUserById , createNewUser, getUserOrders, cancelUserOrder, updateUser, changeUserPassword };