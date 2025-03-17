// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

// Server configuration
export const config = {
  server: {
    port: process.env.PORT || 3000
  },
  cors: {
    allowedOrigins: [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:5174',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174'
    ]
  },
  ai: {
    apiKey: process.env.AI_API_KEY || ''
  }
};
