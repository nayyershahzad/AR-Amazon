import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { modelsAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import ModelCard from './ModelCard';

const Dashboard = () => {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      const response = await modelsAPI.getAll();
      setModels(response.data.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch models');
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this model?')) {
      return;
    }

    try {
      await modelsAPI.delete(id);
      setModels(models.filter((model) => model.id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete model');
    }
  };

  const totalCreditsUsed = models.reduce((sum, model) => sum + model.creditsUsed, 0);
  const completedModels = models.filter((m) => m.meshyStatus === 'completed').length;
  const processingModels = models.filter((m) =>
    m.meshyStatus === 'pending' || m.meshyStatus === 'processing'
  ).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading your models...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, {user?.name || user?.email}!
          </h1>
          <p className="text-gray-400">
            Manage your 3D models and create new ones from product images
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Models</p>
                <p className="text-3xl font-bold text-white">{models.length}</p>
              </div>
              <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Completed</p>
                <p className="text-3xl font-bold text-white">{completedModels}</p>
              </div>
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Processing</p>
                <p className="text-3xl font-bold text-white">{processingModels}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-600 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white animate-spin"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Quick Actions */}
        <div className="mb-8">
          <Link to="/upload" className="btn-primary inline-flex items-center">
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Create New 3D Model
          </Link>
        </div>

        {/* Models Grid */}
        {models.length === 0 ? (
          <div className="card text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
            <h3 className="text-xl font-medium text-white mb-2">No models yet</h3>
            <p className="text-gray-400 mb-6">
              Upload your first product image to get started
            </p>
            <Link to="/upload" className="btn-primary inline-flex items-center">
              Upload Image
            </Link>
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Your Models</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {models.map((model) => (
                <ModelCard key={model.id} model={model} onDelete={handleDelete} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
