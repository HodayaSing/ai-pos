import express from 'express';
import cors from 'cors';
import { config } from './config';
import aiRoutes from './routes/aiRoutes';

// Initialize express app
const app = express();
const port = config.server.port;

// Middleware
app.use(express.json());
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl requests)
    if (!origin) return callback(null, true);
    
    // Check if the origin is in the allowed list
    if (config.cors.allowedOrigins.indexOf(origin) === -1) {
      const msg = `The CORS policy for this site does not allow access from the specified origin: ${origin}`;
      return callback(new Error(msg), false);
    }
    
    return callback(null, true);
  },
  credentials: true
}));

// Basic route for testing
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the Gen AI API',
    status: 'running'
  });
});

// Mount API routes
app.use('/api/ai', aiRoutes);

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
