const { Client } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

class Database {
  constructor() {}

  async dbQuery(statement, ...parameters) {
    const client = new Client({
      user: process.env.PSQL_ADMIN_USER,
      host: process.env.PSQL_HOST,
      database: process.env.PSQL_DATABASE,
      password: process.env.PSQL_ADMIN_PASSWORD,
      port: process.env.PSQL_PORT,
      connectionTimeoutMillis: 5000,
      query_timeout: 5000,
    });

    let result;
    try {
      await client.connect();
      this.logQuery(statement, parameters);
      result = await client.query(statement, parameters || []);
    } catch (err) {
      console.error('Database query failed: ', err);
      throw err;
    } finally {
      if (client) {
        try {
          await client.end();
        } catch (endErr) {
          console.error('Failed to close database connection: ', endErr);
        }
      }
    }
    return result;
  }

  async addTask(title, description, status, due) {
    if (this.argsAreNullOrUndefined(title, status, due)) {
      throw new Error('task fields cannot be undefined or null');
    }
    const query = 'INSERT INTO cases (title, description, status, due)'
      + ' VALUES ($1, $2, $3, $4) RETURNING *';
    const result = await this.dbQuery(query, title, description, status, due);
    return result;
  }

  async getTask(id) {
    if (this.argsAreNullOrUndefined(id)) {
      throw new Error('Task ID cannot be undefined or null');
    }
    const query = 'SELECT * FROM cases WHERE id = $1';
    const result = await this.dbQuery(query, id);
    return result;
  }

  async getAllTasks() {
    const query = 'SELECT * FROM cases';
    const result = await this.dbQuery(query);
    return result;
  }

  async updateTask(id, title, description, status, due) {
    if (this.argsAreNullOrUndefined(id, title, description, status, due)) {
      throw new Error('No argument can cannot be undefined or null');
    }

    const query = 'UPDATE cases SET title = $1,'
      + 'description = $2,'
      + 'status = $3,'
      + 'due = $4 '
      + 'WHERE id = $5 RETURNING *';

    const result = await this.dbQuery(
      query,
      title,
      description,
      status,
      due,
      id,
    );

    return result;
  }

  async deleteTask(id) {
    if (this.argsAreNullOrUndefined(id)) {
      throw new Error('Task ID cannot be undefined or null');
    }
    const query = 'DELETE FROM cases WHERE id = $1';
    const result = await this.dbQuery(query, id);
    return result;
  }

  argsAreNullOrUndefined(...args) {
    return (
      args.filter((arg) => arg === undefined || arg === null).length > 0
    );
  }

  logQuery(statement, parameters) {
    const timeStamp = new Date();
    const formattedTimeStamp = timeStamp.toString().substring(4, 24);
    console.log(formattedTimeStamp, statement, parameters);
  }
}

module.exports = Database;
