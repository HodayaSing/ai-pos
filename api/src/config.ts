import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Configuration settings for the API
export const config = {
  // Server configuration
  server: {
    port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
  },
  
  // CORS configuration
  cors: {
    // Add allowed origins for CORS
    allowedOrigins: ['http://localhost:5173'], // Default Vite dev server port
  },
  
  // AI service configuration (placeholder for future implementation)
  ai: {
    // Add AI service configuration here
    modelName: process.env.AI_MODEL_NAME || 'default-model',
    apiKey: process.env.AI_API_KEY || '',
  }
};
