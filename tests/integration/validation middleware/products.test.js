const request = require('supertest');
const jwt = require('jsonwebtoken');
const products = require('../../../controllers/products');
jest.mock('../../../controllers/products');

describe('Product validation middleware', () => {
  let server;
  let token;
  let product;
  
  beforeEach(async () => {
    server = require('../../../index');
    token = jwt.sign({ user_id: "123", username: "username", is_admin: true }, process.env.JWTPRIVATEKEY);
    product = {
      category: "Shoes",
      name: "Kinvara 13",
      description: "Everyday trainers for road or track.",
      gender: "Women", 
      price: 129, 
      brand: "Saucony"
    };
  });
  
  afterEach(async() => {
    jest.clearAllMocks();
    await server.close();
  });
  
  describe('validateProduct', () => {
    it('returns a 400 status if the product input is invalid', async () => {
      product.category = '';
      const res = await request(server).post('/api/products').set('x-auth-token', token).send(product);
      expect(res.status).toBe(400);
    });

    it('sends the product object in the req to the next middleware', async () => {
      const createNewProductMock = jest
      .spyOn(products, 'createNewProduct')
      .mockImplementation((req, res) => {
        return res.send(req.product)
      });
      const res = await request(server).post('/api/products').set('x-auth-token', token).send(product);
      expect(createNewProductMock).toHaveBeenCalled();
      expect(res.text).toEqual(JSON.stringify(product));
    });
  });
});