
# E-Commerce Server

This is a sample server using a RESTful API for an e-commerce platform build with Node.js and Express. It connects to a PostgresSQL database and uses  pg-node-migrate migrations to configure the user's database. The API documentation is provided by Swagger UI.


## Environment Variables

To run this project, you will need to set up a PostgreSQL database and add the following environment variables to your .env file

`STATUS`

`PORT`

`NODE_ENV`

`PGUSER` This is the user for your PG database

`PGHOST` The host for your database

`PGHOST` Database port

`PGDATABASE` The name of your database

`PGDATABASE_TEST` Database name for testing

`PGPASSWORD` Password for your database

`DATABASE_URL` the url for connecting to your database

`JWTPRIVATEKEY` Your custom private key



## Getting Started

Fork the repository from Github

Clone the repository to your local machine

Once you have your local development environment set up and have added your own .env file, run:

```bash
npm run migrate up
```

This will set up your database as needed for the models to work correctly.

Then, run:

```bash
npm run dev
```

to begin development of your server to suit your needs.
## API Reference

API reference can be viewed at '/api-docs'


## Running Tests

To run tests, run the command:

```bash
  npm run test
```

Please note: sample test data was added during the migration set up of the database. Depending on your custom configurations, data may need to be edited and/or tests may need to be customized to suit your code.
