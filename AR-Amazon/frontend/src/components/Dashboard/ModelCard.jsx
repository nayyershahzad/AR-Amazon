import React from 'react';
import { Link } from 'react-router-dom';

const ModelCard = ({ model, onDelete }) => {
  const getStatusBadge = (status) => {
    const badges = {
      completed: {
        color: 'bg-green-500/10 text-green-500',
        text: 'Completed'
      },
      processing: {
        color: 'bg-yellow-500/10 text-yellow-500',
        text: 'Processing'
      },
      pending: {
        color: 'bg-blue-500/10 text-blue-500',
        text: 'Pending'
      },
      failed: {
        color: 'bg-red-500/10 text-red-500',
        text: 'Failed'
      }
    };

    const badge = badges[status] || badges.pending;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.color}`}
      >
        {badge.text}
      </span>
    );
  };

  const handleDownload = (e) => {
    e.preventDefault();
    if (model.modelUrl) {
      window.open(model.modelUrl, '_blank');
    }
  };

  const handleDelete = (e) => {
    e.preventDefault();
    onDelete(model.id);
  };

  return (
    <Link to={`/model/${model.id}`} className="block">
      <div className="card hover:border-primary-600 transition-colors cursor-pointer">
        {/* Thumbnail */}
        <div className="mb-4 aspect-square bg-gray-700 rounded-lg overflow-hidden">
          {model.thumbnailUrl ? (
            <img
              src={model.thumbnailUrl}
              alt={model.productName || 'Model'}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg
                className="w-16 h-16 text-gray-500"
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
          )}
        </div>

        {/* Content */}
        <div className="space-y-3">
          <div>
            <h3 className="text-lg font-semibold text-white truncate">
              {model.productName || 'Untitled Model'}
            </h3>
            <p className="text-sm text-gray-400">
              {new Date(model.createdAt).toLocaleDateString()}
            </p>
          </div>

          {/* Status */}
          <div>{getStatusBadge(model.meshyStatus)}</div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-700">
            {model.meshyStatus === 'completed' && model.modelUrl ? (
              <button
                onClick={handleDownload}
                className="text-primary-500 hover:text-primary-400 text-sm font-medium"
              >
                Download
              </button>
            ) : (
              <span className="text-gray-500 text-sm">
                {model.meshyStatus === 'processing' && 'Generating...'}
                {model.meshyStatus === 'pending' && 'In queue...'}
                {model.meshyStatus === 'failed' && 'Generation failed'}
              </span>
            )}

            <button
              onClick={handleDelete}
              className="text-red-500 hover:text-red-400 text-sm font-medium"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ModelCard;
