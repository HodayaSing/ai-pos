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
      table.string('product_key').notNullable();
      table.string('language').notNullable().defaultTo('en');
      table.string('name').notNullable();
      table.string('description');
      table.string('category').notNullable();
      table.decimal('price', 10, 2).notNullable();
      table.string('image');
      table.timestamps(true, true);
      
      // Add a unique constraint on product_key and language
      table.unique(['product_key', 'language']);
    });
    
    console.log('Products table created successfully');
  } else {
    try {
      // Check if the product_key and language columns exist
      const hasProductKeyColumn = await db.schema.hasColumn('products', 'product_key');
      const hasLanguageColumn = await db.schema.hasColumn('products', 'language');
      
      // SQLite has limited ALTER TABLE support, so we need to be careful
      
      // Add product_key column if it doesn't exist
      if (!hasProductKeyColumn) {
        console.log('Adding product_key column to products table...');
        
        // In SQLite, we can only add a column, not set it as NOT NULL in the same statement
        await db.schema.alterTable('products', (table) => {
          table.string('product_key').defaultTo('');
        });
        
        // Set product_key to match id for existing records
        const products = await db('products').select('id');
        
        // Update each product individually to ensure it works
        for (const product of products) {
          await db('products')
            .where('id', product.id)
            .update({ product_key: String(product.id) });
        }
        
        console.log('Updated product_key values for existing records');
      }
      
      // Add language column if it doesn't exist
      if (!hasLanguageColumn) {
        console.log('Adding language column to products table...');
        
        await db.schema.alterTable('products', (table) => {
          table.string('language').defaultTo('en');
        });
        
        // Set language to 'en' for all existing records
        await db('products').update({ language: 'en' });
        
        console.log('Set language to "en" for all existing records');
      }
      
      // For SQLite, we can't easily add a unique constraint to an existing table
      // We would need to recreate the table, which is complex
      // For now, we'll handle uniqueness in the application logic
      
      console.log('Database migration for product localization completed');
    } catch (error) {
      console.error('Error during database migration:', error);
      throw error;
    }
  }
  
  return {
    hasProductsTable
  };
};

// Close the database connection
export const closeDatabase = async () => {
  await db.destroy();
};
