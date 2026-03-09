import React, { useState, useRef, useEffect } from 'react';

const CameraCapture = ({ onCapture, onClose, multiImageMode = false }) => {
  const [stream, setStream] = useState(null);
  const [capturedImages, setCapturedImages] = useState([]);
  const [currentAngle, setCurrentAngle] = useState(0);
  const [cameraError, setCameraError] = useState('');
  const [isCapturing, setIsCapturing] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const angles = [
    { name: 'Front', degrees: 0, icon: '⬆️' },
    { name: 'Front-Right', degrees: 45, icon: '↗️' },
    { name: 'Right', degrees: 90, icon: '➡️' },
    { name: 'Back-Right', degrees: 135, icon: '↘️' },
    { name: 'Back', degrees: 180, icon: '⬇️' },
    { name: 'Back-Left', degrees: 225, icon: '↙️' },
    { name: 'Left', degrees: 270, icon: '⬅️' },
    { name: 'Front-Left', degrees: 315, icon: '↖️' }
  ];

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Camera access error:', error);
      setCameraError('Could not access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsCapturing(true);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    // Set canvas size to video size
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw current video frame to canvas
    context.drawImage(video, 0, 0);

    // Add angle overlay
    if (multiImageMode) {
      context.fillStyle = 'rgba(0, 0, 0, 0.7)';
      context.fillRect(10, 10, 200, 60);
      context.fillStyle = 'white';
      context.font = '24px Arial';
      context.fillText(`${angles[currentAngle].name} (${currentAngle + 1}/8)`, 20, 45);
    }

    // Convert canvas to blob
    canvas.toBlob((blob) => {
      const file = new File([blob], `photo-${currentAngle + 1}.jpg`, { type: 'image/jpeg' });
      const imageUrl = URL.createObjectURL(blob);

      if (multiImageMode) {
        setCapturedImages(prev => [...prev, { file, url: imageUrl, angle: currentAngle }]);

        // Move to next angle
        if (currentAngle < angles.length - 1) {
          setCurrentAngle(currentAngle + 1);
        }
      } else {
        // Single image mode - return immediately
        onCapture([file]);
        stopCamera();
      }

      setIsCapturing(false);
    }, 'image/jpeg', 0.95);
  };

  const removeImage = (index) => {
    setCapturedImages(prev => {
      const updated = prev.filter((_, i) => i !== index);
      // Adjust current angle if needed
      if (updated.length < currentAngle) {
        setCurrentAngle(updated.length);
      }
      return updated;
    });
  };

  const handleDone = () => {
    if (capturedImages.length === 0) {
      alert('Please capture at least one photo');
      return;
    }

    const files = capturedImages.map(img => img.file);
    onCapture(files);
    stopCamera();
  };

  if (cameraError) {
    return (
      <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
        <div className="bg-gray-800 rounded-lg p-8 max-w-md">
          <h3 className="text-xl font-bold text-red-400 mb-4">Camera Error</h3>
          <p className="text-gray-300 mb-6">{cameraError}</p>
          <button onClick={onClose} className="btn-primary w-full">
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="bg-gray-900/95 p-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white">
            {multiImageMode ? `Capture ${angles[currentAngle].name} View` : 'Capture Photo'}
          </h3>
          {multiImageMode && (
            <p className="text-sm text-gray-400">
              {capturedImages.length} of 8 photos captured
            </p>
          )}
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">
          ✕
        </button>
      </div>

      {/* Video Preview */}
      <div className="flex-1 relative bg-black">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-full object-contain"
        />

        {/* Angle Guidance Overlay */}
        {multiImageMode && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="bg-black/50 backdrop-blur-sm rounded-full w-64 h-64 flex items-center justify-center border-4 border-primary-500/50">
              <div className="text-center">
                <div className="text-6xl mb-2">{angles[currentAngle].icon}</div>
                <div className="text-white text-xl font-bold">{angles[currentAngle].name}</div>
                <div className="text-gray-300 text-sm mt-1">Rotate {angles[currentAngle].degrees}°</div>
              </div>
            </div>
          </div>
        )}

        {/* Center Guide */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div className="w-80 h-80 border-2 border-dashed border-white/30 rounded-lg"></div>
        </div>

        {/* Hidden canvas for capture */}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Captured Images Preview */}
      {multiImageMode && capturedImages.length > 0 && (
        <div className="bg-gray-900/95 p-4">
          <div className="flex space-x-2 overflow-x-auto">
            {capturedImages.map((img, index) => (
              <div key={index} className="relative flex-shrink-0">
                <img
                  src={img.url}
                  alt={`Captured ${index + 1}`}
                  className="w-20 h-20 object-cover rounded border-2 border-green-500"
                />
                <button
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                >
                  ✕
                </button>
                <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs text-center">
                  {angles[img.angle].name}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="bg-gray-900/95 p-6">
        <div className="max-w-2xl mx-auto">
          {multiImageMode ? (
            <div className="flex space-x-3">
              <button
                onClick={capturePhoto}
                disabled={isCapturing}
                className="flex-1 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-600 text-white font-bold py-4 rounded-lg transition-colors"
              >
                {isCapturing ? 'Capturing...' : `Capture ${angles[currentAngle].name}`}
              </button>
              {capturedImages.length >= 8 && (
                <button
                  onClick={handleDone}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-lg"
                >
                  Done ({capturedImages.length} photos)
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={capturePhoto}
              disabled={isCapturing}
              className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-gray-600 text-white font-bold py-4 rounded-lg transition-colors"
            >
              {isCapturing ? 'Capturing...' : 'Capture Photo'}
            </button>
          )}

          {/* Instructions */}
          <div className="mt-4 text-center text-sm text-gray-400">
            {multiImageMode ? (
              <>
                <p>Position product in the center circle</p>
                <p>Rotate to the indicated angle and capture</p>
                <p>Capture all 8 angles for best results</p>
              </>
            ) : (
              <p>Position product in the center and tap capture</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CameraCapture;
