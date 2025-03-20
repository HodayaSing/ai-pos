import multer from 'multer';
import path from 'path';
import fs from 'fs';
import https from 'https';
import http from 'http';
import sharp from 'sharp';

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Create a unique filename with original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `product-${uniqueSuffix}${ext}`);
  }
});

// File filter to accept only images
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'));
  }
};

// Create multer upload instance
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  }
});

// Get the path for storing in the database and accessing from frontend
export const getImagePath = (filename: string): string => {
  // By default, use the full URL for better frontend compatibility
  const serverUrl = process.env.SERVER_URL || 'http://localhost:3000';
  return `${serverUrl}/uploads/${filename}`;
};

/**
 * Download an image from a URL, resize it, and save it to the uploads directory
 * @param imageUrl URL of the image to download
 * @param options Optional configuration for image processing
 * @returns Promise with the relative path to the saved image
 */
export const downloadImageFromUrl = (
  imageUrl: string, 
  options: { width?: number; height?: number; quality?: number } = {}
): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Set default resize options if not provided
    const width = options.width || 512;  // Default to 512px width
    const height = options.height || 512; // Default to 512px height
    const quality = options.quality || 80; // Default to 80% quality
    
    // Create a unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = '.jpg'; // Use jpg for better compression
    const filename = `ai-dish-${uniqueSuffix}${ext}`;
    const filePath = path.join(uploadsDir, filename);
    
    // Create a temporary path for the downloaded image before processing
    const tempFilePath = path.join(uploadsDir, `temp-${uniqueSuffix}${ext}`);
    
    // Create a write stream to save the temporary file
    const fileStream = fs.createWriteStream(tempFilePath);
    
    // Determine if we should use http or https based on the URL
    const requestLib = imageUrl.startsWith('https') ? https : http;
    
    // Make the request to download the image
    const request = requestLib.get(imageUrl, (response) => {
      // Check if the response is successful
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download image: ${response.statusCode}`));
        return;
      }
      
      // Pipe the response to the temporary file
      response.pipe(fileStream);
      
      // Handle completion of the download
      fileStream.on('finish', async () => {
        fileStream.close();
        
        try {
          // Resize the image using Sharp
          await sharp(tempFilePath)
            .resize(width, height, {
              fit: 'cover',
              position: 'center'
            })
            .jpeg({ quality }) // Use JPEG format with specified quality
            .toFile(filePath);
          
          // Delete the temporary file
          fs.unlink(tempFilePath, () => {});
          
          // Always use the full URL for AI-generated images
          const serverUrl = process.env.SERVER_URL || 'http://localhost:3000';
          resolve(`${serverUrl}/uploads/${filename}`);
        } catch (err) {
          // Clean up files if processing fails
          fs.unlink(tempFilePath, () => {});
          fs.unlink(filePath, () => {});
          reject(err);
        }
      });
    });
    
    // Handle request errors
    request.on('error', (err) => {
      // Clean up the file if it was created
      fs.unlink(tempFilePath, () => {});
      reject(err);
    });
    
    // Handle file stream errors
    fileStream.on('error', (err) => {
      // Clean up the file if it was created
      fs.unlink(tempFilePath, () => {});
      reject(err);
    });
  });
};
