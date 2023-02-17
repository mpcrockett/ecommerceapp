const pool = require('../../../db/index');
const Product = require('../../../models/Product');

describe('Product Model', () => {
  let product;

  beforeEach( async () => {
    product = new Product ({
      category: "Shoes",
      name: "Nike Fly Knit",
      description: `Once you take a few strides in the Nike Alphafly 2, 
        you’ll never look at your favorite pair of old racing shoes the same way again...`,
      gender: "Women",
      price: 278,
      brand: "Nike"
    });
  });

  afterEach( async () => {
    await Product.deleteAllProducts();
  });

  describe('Create new product method', () => {
    it("adds a new product to the database", async () => {
      const id = await product.createNewProduct();
      expect(id).not.toBeNull();
    });
  });

  describe('Update product method', () => {
    it("updates the product in the database", async () => {
      await product.createNewProduct();
      product.gender = "Men";
      await product.updateProductById();
      const checkProduct = await pool.query("SELECT gender FROM products WHERE product_id = $1", [product.product_id]);
      expect(checkProduct.rows[0].gender).toEqual("Men");
    })
  });

  describe("Get all products static method", () => {
    it('returns an array of all the products', async () => {
      await product.createNewProduct();
      product.gender = 'Men';
      await product.createNewProduct();
      const products = await Product.getAllProducts();
      expect(products.length).toBeGreaterThan(1);
    });
  });

  describe("Get product by ID method", () => {
    it("returns the product information of a given product_id", async () => {
      await product.createNewProduct();
      const productInfo = await Product.getProductById(product.product_id);
      expect(productInfo.name).toBe("Nike Fly Knit");
      expect(productInfo.gender).toBe("Women");
    });

    it("returns a negative boolean if no product is found with given id", async () => {
      await product.createNewProduct();
      const productId = product.product_id;
      await Product.deleteProductById(productId);
      const check = await Product.getProductById(productId);
      expect(check).toBeFalsy();
    });
  });

  describe("Delete product by ID static method", () => {
    it("deletes a product from the database by id", async () => {
      await product.createNewProduct();
      const productId = product.product_id;
      await Product.deleteProductById(productId);
      const checkDB = await pool.query("SELECT * FROM products WHERE product_id = $1", [productId]);
      expect(checkDB.rows.length).toEqual(0);
    });
  });
});