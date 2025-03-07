# Gen AI API

A minimal Node.js/Express/TypeScript API for the UI project. This API provides endpoints for generating AI responses.

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=3000
   NODE_ENV=development
   ```

## Development

Run the development server:
```
npm run dev
```

The server will be available at http://localhost:3000.

## Build

Build the project for production:
```
npm run build
```

## Production

Start the production server:
```
npm start
```

## API Endpoints

### Test Endpoint
- `GET /` - Returns a welcome message

### AI Endpoints
- `POST /api/ai/generate` - Generate AI response based on prompt
  - Request body: `{ "prompt": "Your prompt here" }`
  - Response: `{ "success": true, "data": { "result": "AI response", "timestamp": "ISO date" } }`

- `GET /api/ai/models` - Get available AI models
  - Response: `{ "success": true, "data": [{ "id": "model-id", "name": "Model Name", "description": "Description" }] }`
