import { Steps } from 'nextra/components'

# API Documentation

This document provides details about the API endpoints available in the AI-POS backend.

## Base URL

All API endpoints are relative to the base URL, typically `http://localhost:PORT/api`, where `PORT` is the port the backend server is running on (e.g., 3001).

## AI Service Endpoints

Base path: `/api/ai`

These endpoints provide functionalities powered by AI models (primarily OpenAI).

---

### Generate Text Response

*   **Endpoint:** `POST /generate`
*   **Description:** Generates a text response from an AI model based on a given prompt.
*   **Request Body:**
    ```json
    {
      "prompt": "string (required)",
      "model": "string (optional, default: 'gpt-3.5-turbo')"
    }
    ```
*   **Success Response (200 OK):**
    ```json
    {
      "success": true,
      "data": {
        "result": "Generated text response",
        "model": "model_used",
        "usage": { /* OpenAI usage stats */ },
        "timestamp": "ISO 8601 timestamp"
      }
    }
    ```
*   **Error Responses:**
    *   `400 Bad Request`: Missing `prompt`.
    *   `500 Internal Server Error`: OpenAI API key not configured or other server error.

---

### Get Available AI Models

*   **Endpoint:** `GET /models`
*   **Description:** Retrieves a list of available GPT models from the configured AI provider (OpenAI).
*   **Request Body:** None
*   **Success Response (200 OK):**
    ```json
    {
      "success": true,
      "data": [
        {
          "id": "model-id",
          "name": "MODEL NAME",
          "description": "Model description"
        },
        // ... other models
      ]
    }
    ```
*   **Error Responses:**
    *   `500 Internal Server Error`: OpenAI API key not configured or failed to fetch models.

---

### Modify Product Details

*   **Endpoint:** `POST /modify-product`
*   **Description:** Modifies product details (name, description, price) based on given instructions using an AI model.
*   **Request Body:**
    ```json
    {
      "product": {
        "name": "string (required)",
        "description": "string (required)",
        "price": "number (required)"
      },
      "instructions": "string (required)",
      "model": "string (optional, default: 'gpt-4o-mini')"
    }
    ```
*   **Success Response (200 OK):**
    ```json
    {
      "success": true,
      "data": {
        "original": { /* original product data */ },
        "updated": {
          "name": "updated name",
          "description": "updated description",
          "price": "updated price (number)"
        },
        "model": "model_used",
        "usage": { /* OpenAI usage stats */ },
        "timestamp": "ISO 8601 timestamp"
      }
    }
    ```
*   **Error Responses:**
    *   `400 Bad Request`: Missing `product` or `instructions`, or invalid product structure.
    *   `500 Internal Server Error`: OpenAI API key not configured, AI response parsing error, or other server error.

---

### Generate Dish Image

*   **Endpoint:** `POST /generate-dish-image`
*   **Description:** Generates an image for a dish using DALL-E 3 based on its name, description, and category. Downloads and saves the image locally.
*   **Request Body:**
    ```json
    {
      "name": "string (required)",
      "description": "string (optional)",
      "category": "string (optional)",
      "imageWidth": "number (optional, default: 512)",
      "imageHeight": "number (optional, default: 512)",
      "imageQuality": "number (optional, default: 80)"
    }
    ```
*   **Success Response (200 OK):**
    ```json
    {
      "success": true,
      "data": {
        "imageUrl": "/uploads/generated_image_filename.jpg", // Local path
        "originalUrl": "OpenAI temporary URL", // For reference
        "prompt": "Prompt used for generation",
        "timestamp": "ISO 8601 timestamp",
        "warning": "string (optional, if local save failed)" // e.g., 'Failed to save image locally...'
      }
    }
    ```
*   **Error Responses:**
    *   `400 Bad Request`: Missing `name`.
    *   `500 Internal Server Error`: OpenAI API key not configured, image generation failed, image download/save failed, or other server error.

---

### Translate Text

*   **Endpoint:** `POST /translate`
*   **Description:** Translates text between English ('en') and Hebrew ('he') using an AI model.
*   **Request Body:**
    ```json
    {
      "text": "string (required)",
      "targetLanguage": "'en' | 'he' (required)"
    }
    ```
*   **Success Response (200 OK):**
    ```json
    {
      "success": true,
      "translatedText": "Translated text",
      "sourceLanguage": "'en' | 'he'",
      "targetLanguage": "'en' | 'he'"
    }
    ```
*   **Error Responses:**
    *   `400 Bad Request`: Missing `text` or invalid `targetLanguage`.
    *   `500 Internal Server Error`: OpenAI API key not configured or translation error.

---

### Generate Product Translations

*   **Endpoint:** `POST /generate-product-translations`
*   **Description:** Generates translations (name, description) for all products from the source language to the target language (default: 'he'). Creates or updates translations in the database.
*   **Request Body:**
    ```json
    {
      "targetLanguage": "'en' | 'he' (optional, default: 'he')"
    }
    ```
*   **Success Response (200 OK):**
    ```json
    {
      "success": true,
      "total": "number (total products processed)",
      "translated": "number (successfully translated)",
      "failed": "number (failed translations)",
      "details": [
        {
          "id": "product_id",
          "product_key": "product_key",
          "original": { "name": "...", "description": "..." },
          "translated": { "name": "...", "description": "..." },
          "success": true
        },
        {
          "id": "product_id",
          "product_key": "product_key",
          "error": "Error message",
          "success": false
        }
        // ... other products
      ]
    }
    ```
*   **Error Responses:**
    *   `400 Bad Request`: Invalid `targetLanguage`.
    *   `404 Not Found`: No products found in the source language.
    *   `500 Internal Server Error`: OpenAI API key not configured or other server error during processing.

---

### Recognize Products in Image

*   **Endpoint:** `POST /recognize-products`
*   **Description:** Analyzes an image using an AI vision model (GPT-4o) to identify items and returns a list of recognized products with confidence scores.
*   **Request Body:**
    ```json
    {
      "imageData": "string (required, base64 encoded image data or data URL)"
    }
    ```
*   **Success Response (200 OK):**
    ```json
    {
      "success": true,
      "data": {
        "products": [
          {
            "name": "Recognized item name",
            "confidence": "number (0-1)"
          }
          // ... other items
        ],
        "rawResponse": "string (optional, included if parsing fails)"
      }
    }
    ```
*   **Error Responses:**
    *   `400 Bad Request`: Missing `imageData`.
    *   `500 Internal Server Error`: OpenAI API key not configured, AI analysis error, or response parsing error.

---

### Get Recipe Recommendations

*   **Endpoint:** `POST /recipe-recommendations`
*   **Description:** Suggests recipes based on a list of provided product/ingredient names using an AI model.
*   **Request Body:**
    ```json
    {
      "products": [
        { "name": "string" },
        // ... other products/ingredients
      ]
    }
    ```
*   **Success Response (200 OK):**
    ```json
    {
      "success": true,
      "data": {
        "recipes": [
          {
            "name": "Recipe Name",
            "description": "Recipe description",
            "ingredients": ["Ingredient 1", "Ingredient 2", ...],
            "instructions": ["Step 1", "Step 2", ...]
          }
          // ... other recipes
        ]
      }
    }
    ```
*   **Error Responses:**
    *   `400 Bad Request`: Missing or empty `products` array.
    *   `500 Internal Server Error`: OpenAI API key not configured, AI generation error, or response parsing error.

---

## Product Service Endpoints

Base path: `/api/products`

These endpoints manage product data, including CRUD operations and handling multiple languages/translations.

---

### Get All Products

*   **Endpoint:** `GET /`
*   **Description:** Retrieves a list of all products, optionally filtered by language.
*   **Query Parameters:**
    *   `language` (string, optional, default: 'en'): Filters products by the specified language code (e.g., 'en', 'he').
*   **Success Response (200 OK):**
    ```json
    {
      "success": true,
      "data": [
        {
          "id": 1,
          "product_key": "unique-key-1",
          "language": "en",
          "name": "Product Name",
          "description": "Product Description",
          "category": "Category Name",
          "price": 10.99,
          "image": "/uploads/image.jpg"
        },
        // ... other products
      ]
    }
    ```
*   **Error Responses:**
    *   `500 Internal Server Error`: Failed to fetch products.

---

### Get Products by Category

*   **Endpoint:** `GET /category/:category`
*   **Description:** Retrieves products belonging to a specific category, optionally filtered by language.
*   **Path Parameters:**
    *   `category` (string, required): The category name to filter by.
*   **Query Parameters:**
    *   `language` (string, optional, default: 'en'): Filters products by language.
*   **Success Response (200 OK):** (Same format as Get All Products)
*   **Error Responses:**
    *   `400 Bad Request`: Missing `category`.
    *   `500 Internal Server Error`: Failed to fetch products.

---

### Get Products by Language

*   **Endpoint:** `GET /language/:language`
*   **Description:** Retrieves all products for a specific language.
*   **Path Parameters:**
    *   `language` (string, required): The language code (e.g., 'en', 'he').
*   **Success Response (200 OK):** (Same format as Get All Products)
*   **Error Responses:**
    *   `400 Bad Request`: Missing `language`.
    *   `500 Internal Server Error`: Failed to fetch products.

---

### Get Product Translations

*   **Endpoint:** `GET /translations/:productKey`
*   **Description:** Retrieves all available translations (different language versions) for a specific product identified by its `product_key`.
*   **Path Parameters:**
    *   `productKey` (string, required): The unique key identifying the product group.
*   **Success Response (200 OK):**
    ```json
    {
      "success": true,
      "data": {
        "locales": {
          "en": {
            "id": 1,
            "product_key": "unique-key-1",
            "name": "Product Name EN",
            "description": "Description EN",
            "category": "Category",
            "price": 10.99,
            "image": "/uploads/image.jpg"
          },
          "he": {
            "id": 2,
            "product_key": "unique-key-1",
            "name": "שם מוצר עב",
            "description": "תיאור עב",
            "category": "קטגוריה",
            "price": 10.99,
            "image": "/uploads/image.jpg"
          }
          // ... other languages if available
        }
      }
    }
    ```
*   **Error Responses:**
    *   `400 Bad Request`: Missing `productKey`.
    *   `500 Internal Server Error`: Failed to fetch translations.

---

### Get Product by Key and Language

*   **Endpoint:** `GET /key/:productKey/:language`
*   **Description:** Retrieves a specific product version using its unique `product_key` and `language`.
*   **Path Parameters:**
    *   `productKey` (string, required): The unique key identifying the product group.
    *   `language` (string, required): The language code (e.g., 'en', 'he').
*   **Success Response (200 OK):**
    ```json
    {
      "success": true,
      "data": {
        "id": 1,
        "product_key": "unique-key-1",
        "language": "en",
        "name": "Product Name",
        // ... other fields
      }
    }
    ```
*   **Error Responses:**
    *   `400 Bad Request`: Missing `productKey` or `language`.
    *   `404 Not Found`: Product with the specified key and language not found.
    *   `500 Internal Server Error`: Failed to fetch product.

---

### Get Product by ID

*   **Endpoint:** `GET /:id`
*   **Description:** Retrieves a specific product by its unique database ID. Note: This ID is specific to a language version. Use `GET /key/:productKey/:language` for language-independent retrieval.
*   **Path Parameters:**
    *   `id` (number, required): The unique database ID of the product record.
*   **Success Response (200 OK):** (Same format as Get Product by Key and Language)
*   **Error Responses:**
    *   `400 Bad Request`: Invalid or missing `id`.
    *   `404 Not Found`: Product with the specified ID not found.
    *   `500 Internal Server Error`: Failed to fetch product.

---

### Create Product

*   **Endpoint:** `POST /`
*   **Description:** Creates a new product entry. Handles optional image upload. If `product_key` is not provided, it's generated from the name. If `language` is not provided, it defaults to 'en'.
*   **Request Body:** `multipart/form-data`
    *   `name` (string, required)
    *   `category` (string, required)
    *   `price` (number, required, positive)
    *   `description` (string, optional)
    *   `product_key` (string, optional)
    *   `language` (string, optional, default: 'en')
    *   `image` (file, optional): Image file to upload.
*   **Success Response (201 Created):**
    ```json
    {
      "success": true,
      "data": { /* The newly created product object */ }
    }
    ```
*   **Error Responses:**
    *   `400 Bad Request`: Missing required fields (name, category, price) or invalid price.
    *   `409 Conflict`: A product with the same `product_key` and `language` already exists.
    *   `500 Internal Server Error`: Failed to create product or handle upload.

---

### Update Product by Key and Language

*   **Endpoint:** `PUT /key/:productKey/:language`
*   **Description:** Updates an existing product identified by its `product_key` and `language`. Handles optional image upload. Cannot change `product_key` or `language` via this endpoint.
*   **Path Parameters:**
    *   `productKey` (string, required)
    *   `language` (string, required)
*   **Request Body:** `multipart/form-data` (or `application/json` if no image)
    *   `name` (string, optional)
    *   `category` (string, optional)
    *   `price` (number, optional, positive)
    *   `description` (string, optional)
    *   `image` (file, optional): New image file to upload (replaces existing).
*   **Success Response (200 OK):**
    ```json
    {
      "success": true,
      "data": { /* The updated product object */ }
    }
    ```
*   **Error Responses:**
    *   `400 Bad Request`: Missing `productKey` or `language`, or invalid price.
    *   `404 Not Found`: Product not found.
    *   `500 Internal Server Error`: Failed to update product or handle upload.

---

### Update Product by ID

*   **Endpoint:** `PUT /:id`
*   **Description:** Updates an existing product identified by its unique database ID. Handles optional image upload. Use with caution, as ID is language-specific. Prefer updating by key and language.
*   **Path Parameters:**
    *   `id` (number, required)
*   **Request Body:** `multipart/form-data` (or `application/json` if no image)
    *   (Same fields as Update Product by Key and Language)
*   **Success Response (200 OK):** (Same format as Update Product by Key and Language)
*   **Error Responses:**
    *   `400 Bad Request`: Invalid or missing `id`, or invalid price.
    *   `404 Not Found`: Product not found.
    *   `500 Internal Server Error`: Failed to update product or handle upload.

---

### Delete Product by Key and Language

*   **Endpoint:** `DELETE /key/:productKey/:language`
*   **Description:** Deletes a specific language version of a product.
*   **Path Parameters:**
    *   `productKey` (string, required)
    *   `language` (string, required)
*   **Success Response (200 OK):**
    ```json
    {
      "success": true,
      "message": "Product deleted successfully"
    }
    ```
*   **Error Responses:**
    *   `400 Bad Request`: Missing `productKey` or `language`.
    *   `404 Not Found`: Product not found.
    *   `500 Internal Server Error`: Failed to delete product.

---

### Delete All Product Translations

*   **Endpoint:** `DELETE /translations/:productKey`
*   **Description:** Deletes all language versions (translations) of a product associated with the given `product_key`.
*   **Path Parameters:**
    *   `productKey` (string, required)
*   **Success Response (200 OK):**
    ```json
    {
      "success": true,
      "message": "All product translations deleted successfully"
    }
    ```
*   **Error Responses:**
    *   `400 Bad Request`: Missing `productKey`.
    *   `404 Not Found`: No products found for the given key.
    *   `500 Internal Server Error`: Failed to delete translations.

---

### Delete Product by ID

*   **Endpoint:** `DELETE /:id`
*   **Description:** Deletes a specific product record by its unique database ID. Use with caution, as ID is language-specific. Prefer deleting by key and language or deleting all translations.
*   **Path Parameters:**
    *   `id` (number, required)
*   **Success Response (200 OK):** (Same format as Delete Product by Key and Language)
*   **Error Responses:**
    *   `400 Bad Request`: Invalid or missing `id`.
    *   `404 Not Found`: Product not found.
    *   `500 Internal Server Error`: Failed to delete product.
