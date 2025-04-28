Note: You do not need to start the server before executing the API endpoint unit tests. The npm library 'supertest' spins up the server.

To run the API unit tests that assert on responses from the database:
- Run `npm install` if you haven't done so yet.

- Run `npm run test:endpoints` in the terminal within the root of this project.

To run the unit tests that test API endpoint validation:

- Run `npm run test:endpoints_validation` in the terminal within the root of this project.

To run the utility function unit tests:

- Run `npm run test:utils` in the terminal within the root of this project.

To run all of the unit tests in this project:

- Run `npm test` in the terminal within the root of this project.

Please follow these steps to set up the database for this API to run locally:

1. Create an environment file in the root of this repository, called '.env' and populate it with the following properties (Please see the sample .example-env file in root):

- PSQL_ADMIN_USER (The username you use to authenticate into PostgreSQL).
- PSQL_ADMIN_DATABASE (the admin database on your PSQL server from where you can create other databases).
- PSQL_HOST (The hostname/IP address where the PostgreSQL server will run on your machine).
- PSQL_DATABASE (The name of the database that will store application data - call it 'case_management')
  that the unit tests will run against.)
- PSQL_ADMIN_PASSWORD (The password for PSQL_USER)
- PSQL_PORT (The port number PostgreSQL is listening on. The default is 5432)
- SESSION_SECRET (this will be your session secret key)

2. Create the database using this command in your terminal: ‘createdb case_management’

3. Navigate to the root directory of this repo, in the terminal, and run this command to
   execute the database schema: `psql -d case_management -f schema.sql`

4. Navigate to the 'config' directory in this repo, in the terminal, and run this command to seed
   the database with case data : `psql -d case_management -f seed-data.sql`

To run the application:

1. Please ensure you are using at least Node version 18.x.y
2. Run `npm install` if you haven't done so yet.
3. Run the command `npm run dev` to run it in dev mode or run the command `npm start` to run it in
  production mode. Make sure to run the command in the root of this project.

API Documentation:
You can find the API Swagger documentation at `/api-docs` e.g. `http://localhost:3000/api-docs/`
