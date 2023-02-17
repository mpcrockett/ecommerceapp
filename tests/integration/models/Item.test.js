const Product = require('../../../models/Product');
const Item = require('../../../models/Item');
const pool = require('../../../db');

describe('Item model', () => {
  let product;
    let item;

  beforeEach(async() => {
    product = new Product({
      category: "Accessories",
      name: "Merino Sport Fleece Wind Mitten",
      description: `With the right mitten, you'll never need to worry about the wind. Enter the Merino Sport Fleece Wind Mitten. It's built with soft-brushed, responsibly sourced Merino next to skin and a windproof overlay on the back of the hand...`,
      gender: "Unisex",
      price: 50.00,
      brand: "Smartwool"
    });
    await product.createNewProduct();
    item = new Item({
      product_id: product.product_id,
      size: "M",
      number_in_stock: 100,
      color: "Black"
    });
  });

  afterEach( async() => {
    await Product.deleteAllProducts();
  });

  describe('Add items to inventory method', () => {
    it('Adds the item obejct to the database', async () => {
      await item.addItemsToInventory();
      const checkItemInDb = await pool.query("SELECT number_in_stock FROM items WHERE item_id = $1",
        [item.item_id]);
      const { number_in_stock } = checkItemInDb.rows[0];
      expect(number_in_stock).toEqual(item.number_in_stock);
    });

    it('Updates the number in stock in the database if the item is already added', async () => {
      await item.addItemsToInventory();
      await item.addItemsToInventory();
      const checkItemInDb = await pool.query("SELECT number_in_stock FROM items WHERE item_id = $1",
        [item.item_id]);
      const { number_in_stock } = checkItemInDb.rows[0];
      expect(number_in_stock).toEqual(item.number_in_stock * 2);
    });
  });

  describe('Get number in stock method', () => {
    it('returns the number of an item in stock', async () => {
      await item.addItemsToInventory();
      const number_in_stock = await item.getNumberInStock();
      expect(number_in_stock).toEqual(item.number_in_stock);
    });
  });

  describe('get items by product ID static method', () => {
    it('gets an array of all items with a given product ID in the database', async () => {
      await item.addItemsToInventory();
      item.size = "L";
      await item.addItemsToInventory();
      const items = await Item.getItemsByProductId(product.product_id);
      expect(items.length).toEqual(2);
    });

    it('returns false if no items are in the database with given product ID', async () => {
      const items = await Item.getItemsByProductId(product.product_id);
      expect(items).toBeFalsy();
    });
  });

  describe('Delete items by item ID method', () => {
    it('deletes the items with a given item ID from the database', async () => {
      await item.addItemsToInventory();
      await item.deleteItemById();
      const checkDb = await pool.query("SELECT * FROM items WHERE item_id = $1", [item.item_id]);
      expect(checkDb.rows.length).toEqual(0);
    });
  });

  describe('Delete items by product ID static method', () => {
    it('deletes all items with a given product ID', async () => {
      await item.addItemsToInventory();
      item.size = 'L';
      await item.addItemsToInventory();
      await Item.deleteItemsByProductId(product.product_id);
      const checkDb = await pool.query("SELECT * FROM items WHERE product_id = $1", [product.product_id]);
      expect(checkDb.rows.length).toEqual(0);
    })
  });
});