import React, { Suspense, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, Grid } from '@react-three/drei';
import * as THREE from 'three';

// Error Boundary for Three.js
class ModelErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Model loading error:', error, errorInfo);
    if (this.props.onError) {
      this.props.onError(error);
    }
  }

  render() {
    if (this.state.hasError) {
      return null;
    }
    return this.props.children;
  }
}

// Model component
function Model({ url, autoRotate }) {
  const modelRef = useRef();

  // Use useGLTF with proper error handling
  const { scene } = useGLTF(url, true, true, (loader) => {
    loader.manager.onError = (url) => {
      console.error('Failed to load:', url);
    };
  });

  // Center and scale the model
  React.useEffect(() => {
    if (scene) {
      const box = new THREE.Box3().setFromObject(scene);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());

      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 2 / maxDim;

      scene.scale.setScalar(scale);
      scene.position.sub(center.multiplyScalar(scale));
    }
  }, [scene]);

  useFrame(() => {
    if (autoRotate && modelRef.current) {
      modelRef.current.rotation.y += 0.005;
    }
  });

  if (!scene) return null;

  return <primitive ref={modelRef} object={scene} />;
}

// Loading component
function Loader() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-500 mx-auto mb-4"></div>
        <p className="text-white">Loading 3D Model...</p>
      </div>
    </div>
  );
}

const ThreeViewer = ({ modelUrl }) => {
  const [autoRotate, setAutoRotate] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [error, setError] = useState(null);
  const controlsRef = useRef();

  const handleModelError = (err) => {
    console.error('3D Model Error:', err);
    setError('Failed to load 3D model. The file may be corrupted or incompatible.');
  };

  const handleScreenshot = () => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const link = document.createElement('a');
      link.download = 'model-screenshot.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  };

  const handleResetCamera = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  // Show error if model failed to load
  if (error) {
    return (
      <div className="relative w-full h-full min-h-[500px] bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center">
        <div className="text-center p-8">
          <svg className="mx-auto h-16 w-16 text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-xl font-medium text-white mb-2">Failed to Load 3D Model</h3>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[500px] bg-gray-900 rounded-lg overflow-hidden">
      {/* Controls */}
      <div className="absolute top-4 right-4 z-10 space-y-2">
        <button
          onClick={() => setAutoRotate(!autoRotate)}
          className={`block w-full px-4 py-2 rounded-lg font-medium transition-colors ${
            autoRotate
              ? 'bg-primary-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          {autoRotate ? 'Stop Rotation' : 'Auto Rotate'}
        </button>
        <button
          onClick={() => setShowGrid(!showGrid)}
          className={`block w-full px-4 py-2 rounded-lg font-medium transition-colors ${
            showGrid
              ? 'bg-primary-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          {showGrid ? 'Hide Grid' : 'Show Grid'}
        </button>
        <button
          onClick={handleResetCamera}
          className="block w-full px-4 py-2 bg-gray-700 text-gray-300 hover:bg-gray-600 rounded-lg font-medium transition-colors"
        >
          Reset Camera
        </button>
        <button
          onClick={handleScreenshot}
          className="block w-full px-4 py-2 bg-gray-700 text-gray-300 hover:bg-gray-600 rounded-lg font-medium transition-colors"
        >
          Screenshot
        </button>
      </div>

      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 1, 5], fov: 50 }}
        gl={{ preserveDrawingBuffer: true }}
      >
        <Suspense fallback={null}>
          {/* Lighting */}
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <directionalLight position={[-10, -10, -5]} intensity={0.3} />

          {/* Environment */}
          <Environment preset="sunset" />

          {/* Grid */}
          {showGrid && (
            <Grid
              args={[10, 10]}
              cellSize={0.5}
              cellThickness={0.5}
              cellColor="#6b7280"
              sectionSize={2}
              sectionThickness={1}
              sectionColor="#9ca3af"
              fadeDistance={25}
              fadeStrength={1}
              followCamera={false}
            />
          )}

          {/* Model */}
          <ModelErrorBoundary onError={handleModelError}>
            <Model url={modelUrl} autoRotate={autoRotate} />
          </ModelErrorBoundary>

          {/* Controls */}
          <OrbitControls
            ref={controlsRef}
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={1}
            maxDistance={20}
          />
        </Suspense>
      </Canvas>

      {/* Loading Overlay */}
      <Suspense fallback={<Loader />}></Suspense>

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 bg-gray-800/80 backdrop-blur-sm px-4 py-2 rounded-lg">
        <p className="text-gray-300 text-sm">
          <span className="font-medium">Controls:</span> Left click to rotate • Right click to pan • Scroll to zoom
        </p>
      </div>
    </div>
  );
};

export default ThreeViewer;
