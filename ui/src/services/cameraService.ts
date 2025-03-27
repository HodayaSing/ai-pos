/**
 * Service for camera operations
 */

/**
 * Starts the camera stream and attaches it to a video element
 * @param videoElement - The video element to attach the stream to
 * @returns A promise that resolves to the media stream or rejects with an error
 */
export const startCamera = async (videoElement: HTMLVideoElement): Promise<MediaStream> => {
  try {
    // Check if mediaDevices is supported
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('Camera API is not supported in this browser');
    }

    console.log('Requesting camera access...');
    
    const constraints = {
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: 'environment' // Use the back camera if available
      }
    };
    
    // Request camera access
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    console.log('Camera access granted:', stream);
    
    // Attach stream to video element
    videoElement.srcObject = stream;
    
    // Make sure video starts playing
    videoElement.onloadedmetadata = () => {
      console.log('Video metadata loaded, playing video');
      videoElement.play().catch(e => console.error('Error playing video:', e));
    };
    
    return stream;
  } catch (error) {
    console.error('Error starting camera:', error);
    throw new Error('Could not start camera. Please make sure you have granted camera permissions.');
  }
};

/**
 * Stops the camera stream
 * @param stream - The media stream to stop
 */
export const stopCamera = (stream: MediaStream): void => {
  stream.getTracks().forEach(track => track.stop());
};

/**
 * Captures an image from the video stream
 * @param videoElement - The video element containing the stream
 * @returns The captured image as a base64 data URL
 */
export const captureImage = (videoElement: HTMLVideoElement): string | null => {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Could not get canvas context');
    }
    
    // Draw the current video frame to the canvas
    context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    
    // Convert the canvas to a data URL (base64 encoded image)
    return canvas.toDataURL('image/jpeg', 0.9);
  } catch (error) {
    console.error('Error capturing image:', error);
    return null;
  }
};
