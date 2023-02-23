const request = require('supertest');
const jwt = require('jsonwebtoken');
const products = require('../../../controllers/products');
jest.mock('../../../controllers/products');

describe('Item validation middleware', () => {
  let server;
  let token;
  let item;
  let product_id;
  
  beforeEach(async () => {
    server = require('../../../index');
    token = jwt.sign({ user_id: "123", username: "username", is_admin: true }, process.env.JWTPRIVATEKEY);
    product_id = "1";
    item = {
      size: "11.5 W",
      number_in_stock: 1000,
      color: "black"
    };
  });
  
  afterEach(async() => {
    jest.clearAllMocks();
    await server.close();
  });
  
  describe('validateItem', () => {
    it('returns a 400 status if the item input is invalid', async () => {
      item.size = '';
      const res = await request(server).post(`/api/products/${product_id}`).set('x-auth-token', token).send(item);
      expect(res.status).toBe(400);
    });
    
    it('sends the item object in the req to the next middleware', async () => {
      const addItemsToInventoryMock = jest
      .spyOn(products, 'addItemsToInventory')
      .mockImplementation((req, res) => {
        return res.send(req.item)
      });
      const res = await request(server).post(`/api/products/${product_id}`).set('x-auth-token', token).send(item);
      expect(addItemsToInventoryMock).toHaveBeenCalled();
      expect(Object.keys(JSON.parse(res.text))).toContain('product_id');
    });
  });
});