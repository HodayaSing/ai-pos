import React, { useRef, useState, useEffect } from 'react';
import { startCamera, stopCamera, captureImage } from '../services/cameraService';

interface CameraViewProps {
  onCapture: (imageData: string) => void;
  isProcessing: boolean;
}

/**
 * Component for displaying camera feed and capturing images
 */
export const CameraView: React.FC<CameraViewProps> = ({ onCapture, isProcessing }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Start camera when component mounts
  useEffect(() => {
    const initCamera = async () => {
      if (videoRef.current) {
        try {
          console.log('Initializing camera...');
          setError('Requesting camera access...');
          
          const mediaStream = await startCamera(videoRef.current);
          
          console.log('Camera initialized successfully');
          setStream(mediaStream);
          setIsCameraActive(true);
          setError(null);
          
          // Add event listener to detect when video is playing
          videoRef.current.onplaying = () => {
            console.log('Video is now playing');
            setIsCameraActive(true);
          };
          
        } catch (err: any) {
          console.error('Camera error:', err);
          setError(`Could not start camera: ${err.message || 'Unknown error'}. Please make sure you have granted camera permissions.`);
          setIsCameraActive(false);
        }
      }
    };

    initCamera();

    // Clean up when component unmounts
    return () => {
      console.log('Cleaning up camera resources');
      if (stream) {
        stopCamera(stream);
        setIsCameraActive(false);
      }
    };
  }, []);

  // Handle capture button click
  const handleCapture = () => {
    if (videoRef.current && isCameraActive) {
      const imageData = captureImage(videoRef.current);
      if (imageData) {
        onCapture(imageData);
      } else {
        setError('Failed to capture image. Please try again.');
      }
    } else {
      setError('Camera is not active. Please refresh the page and grant camera permissions.');
    }
  };

  return (
    <div className="flex flex-col items-center">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 w-full" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      <div className="relative w-full max-w-2xl overflow-hidden rounded-lg shadow-lg bg-black">
        {/* Camera feed */}
        <video 
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-auto"
        />
        
        {/* Overlay when processing */}
        {isProcessing && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
          </div>
        )}
        
        {/* Overlay when camera is not active */}
        {!isCameraActive && !isProcessing && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-70 p-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="text-white text-center">
              Camera access is required. Please allow camera access in your browser settings and refresh the page.
            </p>
          </div>
        )}
      </div>
      
      <button
        onClick={handleCapture}
        disabled={!isCameraActive || isProcessing}
        className={`mt-4 px-6 py-2 rounded-md text-white font-medium ${
          !isCameraActive || isProcessing
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-orange-500 hover:bg-orange-600'
        }`}
      >
        {isProcessing ? 'Processing...' : 'Capture Image'}
      </button>
      
      <p className="mt-2 text-sm text-gray-600">
        Position the food items clearly in the camera view before capturing.
      </p>
    </div>
  );
};
