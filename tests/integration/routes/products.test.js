const request = require('supertest');
const Item = require('../../../models/Item');
const Product = require('../../../models/Product');
const Cart = require('../../../models/Cart');
const jwt = require('jsonwebtoken');
jest.mock('../../../models/Product');
jest.mock('../../../models/Item');
jest.mock('../../../models/Cart');

describe('/api/products', () => {
  let server;
  let products;
  let items;
  let product;
  let token;
  
  beforeEach(async ()=> {
    server = require('../../../index');
    products = [
      {
        name: "Saucony Kinvara 12",
        description: "A lightweight, neutral shoes. Good for daily miles with a 4 mm drop.",
        gender: "women",
        price: "$129.00",
        brand: null
      },
      {
        name: "Bandit Ankle Socks - White",
        description: "Look cool and and keep your feet happy on your next run with these socks. Perfect for road, track, or trail",
        gender: "Unisex",
        price: "$34.00",
        brand: null
      },
      {
        name: "Bandit Dad Cap",
        description: "100% cotton dad cap.",
        gender: "Unisex",
        price: "$28.00",
        brand: null
      }
    ];
    product = {
      name: "Kinvara 12",
      description: "A lightweight, neutral shoes. Good for daily miles with a 4 mm drop.",
      gender: "Women",
      price: "$129.00",
      brand: "Saucony"
    };
    items = [
      {
        item_id: 3,
        product_id: 1,
        size: "8.5 B",
        number_in_stock: 34,
        color: "blue-green"
      },
      {
        item_id: 4,
        product_id: 1,
        size: "7 N",
        number_in_stock: 23,
        color: "red"
      },
      {
        item_id: 1,
        product_id: 1,
        size: "11.5 W",
        number_in_stock: 1686,
        color: "blue-green"
      },
      {
        item_id: 2,
        product_id: 1,
        size: "10 B",
        number_in_stock: 1358,
        color: "red"
      }
    ];
    token = jwt.sign({ user_id: "123", username: "username", is_admin: true }, process.env.JWTPRIVATEKEY);
  });
  
  afterEach(async() => {
    Cart.mockReset();
    Product.mockReset();
    Item.mockReset();
    await server.close();
  });
  
  describe('GET /', () => {
    it('returns a 200 code and an array with all products', async () => {
      const getAllProductsMock = jest
      .spyOn(Product, 'getAllProducts')
      .mockImplementation(() => {
        return products
      });
      const res = await request(server).get('/api/products');
      expect(res.status).toBe(200);
      expect(getAllProductsMock).toHaveBeenCalled();
      expect(res.body.length).toEqual(3);
    });
  });
  
  describe('GET /:id', () => {
    it('returns a 200 code and an object with given product', async () => {
      const productId = '1';
      const getProductByIdMock = jest
      .spyOn(Product, 'getProductById')
      .mockImplementation(() => {
        return product
      });
      const getItemsByProductIdMock = jest
      .spyOn(Item, 'getItemsByProductId')
      .mockImplementation(() => {
        return items
      });
      const res = await request(server).get(`/api/products/${productId}`);
      expect(res.status).toBe(200);
      expect(getProductByIdMock).toHaveBeenCalledWith(productId);
      expect(getItemsByProductIdMock).toHaveBeenCalledWith(productId);
      expect(res.body.items.length).toEqual(4);
    });
    
    
    it('returns a 400 code if no products are found with given id', async () => {
      const productId = '1';
      getProductByIdMock = jest
      .spyOn(Product, 'getProductById')
      .mockImplementation(() => {
        return false
      });
      const res = await request(server).get(`/api/products/${productId}`);
      expect(res.status).toBe(400);
      expect(getProductByIdMock).toHaveBeenCalledWith(productId);
      expect(res.text).toMatch(/Product not found/);
    });
  });
  
  describe('POST /', () => {
    it('creates a new product and sends a 201 status', async () => {
      product.category = 'Shoes';
      product.price = 129;
      const createNewProductMock = jest
      .spyOn(Product.prototype, 'createNewProduct')
      .mockImplementation(() => {
        return true
      });
      const res = await request(server).post('/api/products').set('x-auth-token', token).send(product);
      expect(res.status).toBe(201);
      expect(createNewProductMock).toHaveBeenCalled();
    });
  });
  
  describe('POST /:id', () => {
    it('adds items to inventory for product id and returns 201 status', async () => {
      const { size, number_in_stock, color } = items[0];
      const item = { size, number_in_stock, color };
      const productId = '1';
      const addItemsToInventoryMock = jest
      .spyOn(Item.prototype, 'addItemsToInventory')
      .mockImplementation(() => {
        return true;
      });
      const res = await request(server).post(`/api/products/${productId}`).set('x-auth-token', token).send(item);
      expect(res.status).toBe(201);
      expect(addItemsToInventoryMock).toHaveBeenCalled();
    });
  });

  describe('POST /:id/items/add-to-cart', () => {
    it('it returns 400 if there is insuffient stock for desired quantity', async () => {
      const body = { item_id: 1, quantity: 2 };
      const productId = '1';
      const getNumberInStockMock = jest
      .spyOn(Item.prototype, 'getNumberInStock')
      .mockImplementation(() => {
        return 1;
      });
      const res = await request(server).post(`/api/products/${productId}/items/add-to-cart`).set('x-auth-token', token).send(body);
      expect(res.status).toBe(400);
      expect(res.text).toMatch(/Insuffient stock/);
    });

    it('adds the item to the cart and sends 201 status', async () => {
      const body = { item_id: 1, quantity: 2 };
      const productId = '1';
      const addItemToCartMock = jest
      .spyOn(Cart.prototype, 'addItemToCart')
      .mockImplementation(() => {
        return true;
      });
      const getNumberInStockMock = jest
      .spyOn(Item.prototype, 'getNumberInStock')
      .mockImplementation(() => {
        return 100;
      });
      const res = await request(server).post(`/api/products/${productId}/items/add-to-cart`).set('x-auth-token', token).send(body);
      expect(res.status).toBe(201);
      expect(addItemToCartMock).toHaveBeenCalled();
      expect(getNumberInStockMock).toHaveBeenCalled();
      expect(res.text).toMatch(/Added to cart/);
    });
  });

  describe('PUT /:id', () => {
    it('updates the product and returns 201 status', async () => {
      product.category = 'Shoes';
      product.price = 129;
      const productId = '1';
      const updateProductByIdMock = jest
      .spyOn(Product.prototype, 'updateProductById')
      .mockImplementation(() => {
        return true;
      });
      const res = await request(server).put(`/api/products/${productId}`).set('x-auth-token', token).send(product);
      expect(res.status).toBe(201);
      expect(updateProductByIdMock).toHaveBeenCalled();
      expect(res.text).toMatch(/Product updated/);
    });
  });

  describe('DELETE /:id', () => {
    it('deletes a product and returns 200 status', async () => {
      const productId = '1';
      const deleteProductByIdMock = jest
      .spyOn(Product, 'deleteProductById')
      .mockImplementation(() => {
        return true;
      });
      const res = await request(server).delete(`/api/products/${productId}`).set('x-auth-token', token);
      expect(res.status).toBe(200);
      expect(deleteProductByIdMock).toHaveBeenCalledWith(productId);
      expect(res.text).toMatch(/Product deleted/);
    });
  });
});