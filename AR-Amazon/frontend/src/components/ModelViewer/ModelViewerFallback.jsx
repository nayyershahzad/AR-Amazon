import React, { useEffect, useRef } from 'react';

// This component uses Google's model-viewer web component as a fallback
// It's more robust for loading external GLB files and works better across browsers

const ModelViewerFallback = ({ modelUrl }) => {
  const viewerRef = useRef(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  useEffect(() => {
    // Load the model-viewer script if not already loaded
    if (!window.customElements.get('model-viewer')) {
      const script = document.createElement('script');
      script.type = 'module';
      script.src = 'https://ajax.googleapis.com/ajax/libs/model-viewer/3.3.0/model-viewer.min.js';
      document.head.appendChild(script);
    }
  }, []);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;

    const handleLoad = () => {
      console.log('Model loaded successfully');
      setIsLoading(false);
      setError(null);
    };

    const handleError = (event) => {
      console.error('Model loading error:', event);
      setIsLoading(false);
      setError('Failed to load model');
    };

    const handleProgress = (event) => {
      const progress = event.detail.totalProgress;
      if (progress === 1) {
        setIsLoading(false);
      }
    };

    viewer.addEventListener('load', handleLoad);
    viewer.addEventListener('error', handleError);
    viewer.addEventListener('progress', handleProgress);

    return () => {
      viewer.removeEventListener('load', handleLoad);
      viewer.removeEventListener('error', handleError);
      viewer.removeEventListener('progress', handleProgress);
    };
  }, [modelUrl]);

  const handleDownload = () => {
    window.open(modelUrl, '_blank');
  };

  return (
    <div className="relative w-full h-full min-h-[500px] bg-gray-900 rounded-lg overflow-hidden">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-500 mx-auto mb-4"></div>
            <p className="text-white text-lg">Loading 3D Model...</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-20">
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-white text-lg">{error}</p>
          </div>
        </div>
      )}

      {/* Download Button */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={handleDownload}
          className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors shadow-lg"
        >
          Download GLB
        </button>
      </div>

      {/* Model Viewer */}
      <model-viewer
        ref={viewerRef}
        src={modelUrl}
        alt="3D Model"
        auto-rotate
        camera-controls
        shadow-intensity="1"
        style={{
          width: '100%',
          height: '100%',
          minHeight: '500px',
          backgroundColor: '#1f2937'
        }}
        loading="eager"
      />

      {/* Instructions - only show when loaded */}
      {!isLoading && !error && (
        <div className="absolute bottom-4 left-4 bg-gray-800/80 backdrop-blur-sm px-4 py-2 rounded-lg">
          <p className="text-gray-300 text-sm">
            <span className="font-medium">Controls:</span> Drag to rotate • Pinch/scroll to zoom • Two-finger drag to pan
          </p>
        </div>
      )}
    </div>
  );
};

export default ModelViewerFallback;
