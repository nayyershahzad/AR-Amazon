import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { modelsAPI } from '../../services/api';
import ModelViewerFallback from '../ModelViewer/ModelViewerFallback';

const ProcessingStatus = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [model, setModel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    fetchModelStatus();
    const interval = setInterval(fetchModelStatus, 5000);

    return () => clearInterval(interval);
  }, [id]);

  const fetchModelStatus = async () => {
    try {
      const response = await modelsAPI.checkStatus(id);
      const modelData = response.data.data;

      setModel(modelData);
      setLoading(false);

      // Update progress based on status
      if (modelData.meshyStatus === 'pending') {
        setProgress(10);
      } else if (modelData.meshyStatus === 'processing') {
        setProgress(Math.min(progress + 5, 90));
      } else if (modelData.meshyStatus === 'completed') {
        setProgress(100);
      } else if (modelData.meshyStatus === 'failed') {
        setError(modelData.errorMessage || 'Model generation failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch model status');
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (model?.modelUrl) {
      const downloadUrl = model.modelUrl.startsWith('http')
        ? model.modelUrl
        : `http://localhost:5000${model.modelUrl}`;
      window.open(downloadUrl, '_blank');
    }
  };

  // Get the full model URL for the viewer
  const getModelUrl = () => {
    if (!model?.modelUrl) return null;
    return model.modelUrl.startsWith('http')
      ? model.modelUrl
      : `http://localhost:5000${model.modelUrl}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-red-500/10 border border-red-500 text-red-500 px-6 py-4 rounded-lg">
            <h3 className="text-lg font-medium mb-2">Error</h3>
            <p>{error}</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="mt-4 btn-primary"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-primary-500 hover:text-primary-400 mb-4 flex items-center"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-white mb-2">
            {model?.productName || 'Untitled Model'}
          </h1>
          <p className="text-gray-400">
            Created {new Date(model?.createdAt).toLocaleDateString()}
          </p>
        </div>

        {/* Status Card */}
        {model?.meshyStatus !== 'completed' && (
          <div className="card mb-8">
            <h2 className="text-xl font-bold text-white mb-4">Generation Status</h2>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-400 mb-2">
                <span>
                  {model?.meshyStatus === 'pending' && 'Initializing...'}
                  {model?.meshyStatus === 'processing' && 'Processing...'}
                </span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-gray-300">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-500"></div>
              <span>
                This usually takes 30-120 seconds. You can leave this page and check back later.
              </span>
            </div>
          </div>
        )}

        {/* 3D Viewer */}
        {model?.meshyStatus === 'completed' && model?.modelUrl && (
          <div className="space-y-6">
            <div className="card">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">3D Model Preview</h2>
                <button onClick={handleDownload} className="btn-primary">
                  Download .GLB File
                </button>
              </div>
              <ModelViewerFallback modelUrl={getModelUrl()} />
            </div>

            {/* Model Details */}
            <div className="card">
              <h3 className="text-lg font-bold text-white mb-4">Model Details</h3>
              <dl className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-gray-400">Status</dt>
                  <dd className="text-white font-medium">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-500">
                      Completed
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-400">Credits Used</dt>
                  <dd className="text-white font-medium">{model.creditsUsed}</dd>
                </div>
                <div>
                  <dt className="text-gray-400">Created</dt>
                  <dd className="text-white font-medium">
                    {new Date(model.createdAt).toLocaleString()}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-400">Model ID</dt>
                  <dd className="text-white font-mono text-xs">{model.id}</dd>
                </div>
              </dl>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProcessingStatus;
