Note: You do not need to start the server before executing the API endpoint unit tests. The npm library 'supertest' spins up the server.

To run the API unit tests that assert on responses from the database:
1) create an environment file called .env in the root of this repository and populate it with the following properties:
  - PSQL_ADMIN_USER (The username of a user on your postgreSQL server with admin privileges. This is usually 'postgres').
  - PSQL_ADMIN_PASSWORD (The password for the PSQL_ADMIN_USER user on your PostgreSQL server)
  - PSQL_ADMIN_DATABASE (The root database  on your PostgreSQL server. This is usually postgres)
  - NODE_ENV (set it to 'dev'. If you run the unit tests then it will be set to 'test' whilst the tests are executed - and then
    it will be set to 'dev' again once they're done running).
2) Run `npm run test:endpoints` in the terminal within the root of this project.

To run the unit tests that test API endpoint validation:
1) Run `npm test:endpoint_validation` in the terminal within the root of this project.


To run the utility function unit tests:
1) Run `npm run test:utils` in the terminal within the root of this project.

To run all of the unit tests in this project:
1) Run `npm test` in the terminal within the root of this project.




Please follow these steps to set up the database for this API to run locally:

1. Create an environment file in the root of this repository, called '.env' and populate it with the following properties:
  - PSQL_ADMIN_USER (The username you use to authenticate into PostgreSQL).
  - PSQL_HOST (The hostname/IP address where the PostgreSQL server will run on your machine).
  - PSQL_DATABASE (The name of the database your app will connect to in order to create the database 
      that the unit tests will run against.)
  - PSQL_ADMIN_PASSWORD (The password for PSQL_USER)
  - PSQL_PORT (The port number PostgreSQL is listening on. The default is 5432)
  - SESSION_SECRET (this will be your session secret key)

2. Create the database using this command in your terminal: ‘createdb case_management’

3. Navigate to the 'config' directory in this repo, in the terminal, and run this command to
execute the database schema: `psql -d case_management -f schema.sql`

4. Navigate to the 'config' directory in this repo, in the terminal, and run this command to seed
the database with case data : `psql -d case_management -f seed-data.sql`



To run the server:

1) Please ensure you are using at least Node version 18.x.y
2) Run the command `npm run dev` to run it in dev mode or run the command `npm run` to run it in 
  production mode. Make sure to run the command in the root of this project.

API Documentation:
You can find the API Swagger documentation at `/api-docs` e.g. `http://localhost:3000/api-docs/`


Trade offs and design decisions:
1) The `tests/unit/endpoints.test.js` executes the API endpoint unit tests that assert on the correct responses from the database, and spins up and the deletes a PostgreSQL database that the server will interact with as the unit tests are executed. 
I decided against mocking a database in order to ensure that the database queries are properly tested by the unit tests.
This is because there are no separate integration tests in this project.

2) The endpoint unit tests that require a database connection are in one file: `tests/unit/endpoint.test.js`. Whereas the unit tests that test the API validation are saved in the file `endpoints.test.js`. 
This ensures both seperation of concerns and means that a test database won't be unnecessarily spun up and torn down when unit tests that assert on validation (and so don't assert on data served by the PostgreSQL server) are executed. This makes sense from a performance perspective.

The utility function unit tests are in a file called `util_functions.test.js`.
This is to ensure seperation of concerns because these unit tests are not testing the API endpoints. 

3) The test database is spun up and then torn down between each API unit test in `tests/unit/endpoint.test.js`to ensure data integrity and to ensure that data isn't persisted across the execution of different unit tests. 
The downsides of doing this - namely the overhead of setting up and tearing down a database for every test, the complexity involved when it comes to coding the set up and teardown logic, and the resource usage entailed - are minimal given the size of the project and the number of users who may interact with it.

4) This project uses CommonJS instead of ES Modules. This is because using ES modules entails dealing 
with dependency issues when running unit tests via Jest. 
With a small project like this the trade off in performance is negligible (e.g. ES6 Modules allows you to import part of a module whereas CommonJS doesn't).

5) The database queries are executed individually rather than as part of a query 'pool'. 
The NPM `pg` library can pool queries but that seems to be a case of overengineering, given the size of this project and the number of users who may interact with it.

6) This backend uses the persistence model as the basis of designing the server's interactions with the database. 
This is to implement a 'separation of concerns' between the server logic and the SQL code.

7) When the tasks are updated, the backend will update every field in the database record with the data passed to it from the front end. This is a simpler approach because the frontend doesn't need to track which fields have been changed and the backend can just replace the entire record with new data via a PUT request. 
This approach will result in some unnecessary data transmision and a performance cost as the database changes every field of the record instead of just the fields that have changed, but this trade off makes sense given the small number of users who will use this application. The fact that multiple users might overwrite each other's changes if they're editing the same records simultaneously is also not a concern, given the small number of users who will use this application and the fact that they likely won't do so concurrently. This also means that it makes sense to refrain from introducing concurrency control at the database level.
