# Product Localization Implementation

## Overview

This document outlines the implementation of product localization in the SQLite database for the POS system. The implementation allows saving translations for products with the same product key but different language values.

## Database Schema Changes

The `products` table has been modified to include:

- **product_key**: A unique identifier shared across all translations of the same product
- **language**: A field to store the language code (e.g., 'en', 'he')

The updated table schema:

```
products
├── id (primary key, auto-increment)
├── product_key (string, not null) - Links translations of the same product
├── language (string, not null, default 'en')
├── name (string, not null)
├── description (string, nullable)
├── category (string, not null)
├── price (decimal, not null)
├── image (string, nullable)
├── created_at (timestamp)
└── updated_at (timestamp)
```

For new tables, a unique constraint is added on the combination of `product_key` and `language` to prevent duplicate translations.

## Migration Strategy

For existing data:
- A `product_key` column is added, defaulting to the string representation of the product's ID
- A `language` column is added, defaulting to 'en' (English)

## API Endpoints

### New Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/products?language=en` | Get all products in a specific language (query parameter) |
| GET | `/products/language/:language` | Get all products in a specific language |
| GET | `/products/translations/:productKey` | Get all translations for a product |
| GET | `/products/key/:productKey/:language` | Get a specific translation |
| PUT | `/products/key/:productKey/:language` | Update a specific translation |
| DELETE | `/products/key/:productKey/:language` | Delete a specific translation |
| DELETE | `/products/translations/:productKey` | Delete all translations of a product |

### Modified Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/products/category/:category` | Now accepts an optional `language` query parameter |
| POST | `/products` | Now handles `product_key` and `language` fields |

## Model Changes

The Product interface has been updated to include:

```typescript
export interface Product {
  id?: number;
  product_key: string;
  language: string;
  name: string;
  description?: string;
  category: string;
  price: number;
  image?: string;
  created_at?: Date;
  updated_at?: Date;
}
```

New methods added to the product model:

- `getProductByKeyAndLanguage(product_key, language)`: Get a product by its key and language
- `getProductTranslations(product_key)`: Get all translations for a product
- `getProductsByLanguage(language)`: Get all products in a specific language
- `updateProductByKeyAndLanguage(product_key, language, product)`: Update a product by key and language
- `deleteProductByKeyAndLanguage(product_key, language)`: Delete a product by key and language
- `deleteProductTranslations(product_key)`: Delete all translations of a product

## Usage Examples

### Creating a product with translations

```javascript
// Create an English product
const englishProduct = {
  name: "Soap",
  description: "Cleansing bar soap",
  category: "Bathroom",
  price: 5.99,
  language: "en"
};

// The product_key will be automatically generated if not provided
const createdProduct = await createProduct(englishProduct);

// Create a Hebrew translation
const hebrewProduct = {
  product_key: createdProduct.product_key, // Use the same product_key
  name: "סבון",
  description: "סבון מוצק לניקוי",
  category: "חדר אמבטיה",
  price: 5.99,
  language: "he"
};

await createProduct(hebrewProduct);
```

### Retrieving products by language

```javascript
// Get all English products (default)
const englishProducts = await getAllProducts();

// Get all Hebrew products
const hebrewProducts = await getAllProducts("he");

// Get all translations for a specific product
const allTranslations = await getProductTranslations("product_key_123");

// Get the Hebrew version of a specific product
const hebrewVersion = await getProductByKeyAndLanguage("product_key_123", "he");
```

## Default Behavior

- When language is not specified, the system defaults to 'en' (English)
- When creating a product without a product_key, a UUID is automatically generated
- When creating a product without a language, it defaults to 'en'

## Implementation Files

The following files were modified:

1. `api/src/db/index.ts` - Database schema and migration logic
2. `api/src/models/productModel.ts` - Product model and methods
3. `api/src/controllers/productController.ts` - API controllers
4. `api/src/routes/productRoutes.ts` - API routes
