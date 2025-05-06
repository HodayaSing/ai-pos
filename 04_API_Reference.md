# 4. API Reference

This document describes the available endpoints provided by the backend API located in the `api/` directory. The API server typically runs on `http://localhost:3000`.

## Base URL

All API endpoints are relative to the base URL where the API server is running. During local development, this is usually:

`http://localhost:3000`

## Endpoints

### Test Endpoint

This endpoint can be used to quickly check if the API server is running and responding.

*   **URL:** `/`
*   **Method:** `GET`
*   **Description:** Returns a simple welcome message.
*   **Success Response (200 OK):**
    ```json
    {
      "message": "Welcome to the Gen AI API"
    }
    ```

### AI Endpoints

These endpoints handle interactions related to the AI service (e.g., OpenAI).

#### Generate AI Response

*   **URL:** `/api/ai/generate`
*   **Method:** `POST`
*   **Description:** Sends a prompt to the configured AI model and returns the generated response.
*   **Request Body (JSON):**
    ```json
    {
      "prompt": "Your prompt text goes here. For example, suggest three names for a pet hamster."
    }
    ```
*   **Success Response (200 OK):**
    ```json
    {
      "success": true,
      "data": {
        "result": "Here is the AI generated response...",
        "timestamp": "2023-10-27T10:30:00.123Z" // ISO 8601 timestamp
      }
    }
    ```
*   **Error Response (e.g., 400 Bad Request, 500 Internal Server Error):**
    ```json
    {
      "success": false,
      "message": "Error generating response: Invalid API Key or other issue."
    }
    ```
    > **Note:** The exact error message might vary depending on the issue.

#### Get Available AI Models

*   **URL:** `/api/ai/models`
*   **Method:** `GET`
*   **Description:** Retrieves a list of AI models potentially available through the service (the actual implementation might depend on the AI provider).
*   **Success Response (200 OK):**
    ```json
    {
      "success": true,
      "data": [
        {
          "id": "gpt-3.5-turbo", // Example model ID
          "name": "GPT-3.5 Turbo", // Example model name
          "description": "A fast and capable model." // Example description
        }
        // ... other models might be listed here
      ]
    }
    ```
    > **Note:** The list of models returned might be static or dynamically fetched depending on the API's implementation details, which are not fully specified in the `README.md`. The `api/.env.example` file suggests `gpt-3.5-turbo` is the default (`AI_MODEL_NAME`).

## Authentication

Based on the provided `README.md` and `.env.example`, there doesn't seem to be any user authentication required to access these endpoints directly. However, the API itself needs a valid `AI_API_KEY` configured in its `.env` file to successfully communicate with the underlying AI service (like OpenAI). Requests will fail if the API key is missing or invalid on the server side.
