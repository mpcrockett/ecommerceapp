const Address = require("../../../models/Address");
const pool = require("../../../db");

describe("Address Model", () => {
  let address;
  beforeEach( async () => {
    address = new Address({
      first_name: "Sally",
      last_name: "Smith",
      street_one: "123 Main Street",
      street_two: "Apt 1",
      city: "City",
      state: "CT",
      zipcode: "12345"
    });
  });

  afterEach( async () => {
    await Address.deleteAddressById(address.address_id);
  });

  describe("Create new address method", () => {
    it("creates a new address and returns address_id", async () => {
      await address.createNewAddress();
      const { address_id } = address;
      const getFromDB = await pool.query("SELECT * FROM addresses WHERE address_id = $1",
        [address_id]);
      expect(getFromDB.rows[0].first_name).toEqual(address.first_name);
    });
  });

  describe("Get Address ID method", () => {
    it("it returns the address_id based on the other fields", async () => {
      await address.createNewAddress();
      const address2 = new Address({street_one: "123 Main Street",
        street_two: "Apt 1",
        city: "City",
        state: "CT",
        zipcode: "12345"
      });
      const address_id = await address2.getAddressId();
      expect(address_id).toEqual(address.address_id);
    });

    it("returns a false boolean if no address_id is found for given address", async () => {
      const address = new Address({street_one: "123 Main Street",
        street_two: "Apt 1",
        city: "City",
        state: "CT",
        zipcode: "12345"
      });
      const address_id = await address.getAddressId();
      expect(address_id).toBeFalsy();
    });
  });

  describe("Get the address by ID static method", () => {
    it("returns the address associated with a given id", async () => {
      await address.createNewAddress();
      const addressInfo = await Address.getAddressById(address.address_id);
      expect(Object.keys(addressInfo)).toEqual(expect.arrayContaining(['first_name', 'last_name', 'street_address_1', 'street_address_2', 'city', 'state', 'zipcode']));
    });

    it("returns a false boolean if no address is found with given id", async () => {
      const addressInfo = await Address.getAddressById(45);
      expect(addressInfo).toBeFalsy();
    });
  });

  describe("Delete address by ID static method", () => {
    it('deletes the address from the database with the given id', async () => {
      await address.createNewAddress();
      const id = address.address_id;
      await Address.deleteAddressById(id);
      const search = await Address.getAddressById(id);
      expect(search).toBeFalsy();
    });
  });

  describe('Delete all addresses static method', () => {
    it('deletes all addresses', async () => {
      await address.createNewAddress();
      address.city = 'City2';
      await address.createNewAddress();
      await Address.deleteAllAddresses();
      const checkDb = await pool.query("SELECT * FROM addresses");
      expect(checkDb.rows.length).toEqual(0);
    })
  });
});