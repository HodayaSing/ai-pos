import knex from 'knex';
import { dbConfig } from './config';

// Initialize knex with the database configuration
export const db = knex(dbConfig);

// Initialize the database by creating tables if they don't exist
export const initializeDatabase = async () => {
  // Check if the products table exists
  const hasProductsTable = await db.schema.hasTable('products');
  
  // Create products table if it doesn't exist
  if (!hasProductsTable) {
    await db.schema.createTable('products', (table) => {
      table.increments('id').primary();
      table.string('name').notNullable();
      table.string('description');
      table.string('category').notNullable();
      table.decimal('price', 10, 2).notNullable();
      table.string('image');
      table.timestamps(true, true);
    });
    
    console.log('Products table created successfully');
  }
  
  return {
    hasProductsTable
  };
};

// Close the database connection
export const closeDatabase = async () => {
  await db.destroy();
};
