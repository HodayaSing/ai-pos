import path from 'path';

// Database configuration for knex
export const dbConfig = {
  client: 'sqlite3',
  connection: {
    filename: path.resolve(__dirname, '../../data/products.sqlite')
  },
  useNullAsDefault: true,
  pool: {
    afterCreate: (conn: any, cb: any) => {
      // Enable foreign keys in SQLite
      conn.run('PRAGMA foreign_keys = ON', cb);
      // Use WAL mode for better concurrency
      conn.run('PRAGMA journal_mode = WAL', cb);
    }
  }
};
