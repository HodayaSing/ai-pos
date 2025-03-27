// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

// Server configuration
export const config = {
  server: {
    port: process.env.PORT || 3001
  },
  cors: {
    allowedOrigins: [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      'http://localhost:5176',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174',
      'http://127.0.0.1:5175',
      'http://127.0.0.1:5176'
    ]
  },
  ai: {
    apiKey: process.env.AI_API_KEY || ''
  }
};
