import React from 'react';

const ImageQualityCheck = ({ analysis, onRetry, onProceed }) => {
  if (!analysis) return null;

  const getScoreColor = (score) => {
    if (score >= 85) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    if (score >= 50) return 'text-orange-400';
    return 'text-red-400';
  };

  const getScoreLabel = (score) => {
    if (score >= 85) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Fair';
    return 'Poor';
  };

  const getSeverityBadge = (severity) => {
    const colors = {
      critical: 'bg-red-500/20 text-red-400 border-red-500/50',
      warning: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
    };

    return colors[severity] || colors.warning;
  };

  return (
    <div className="card space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-white">Image Quality Analysis</h3>
        <div className="flex items-center space-x-2">
          <span className={`text-2xl font-bold ${getScoreColor(analysis.qualityScore)}`}>
            {analysis.qualityScore}/100
          </span>
          <span className="text-gray-400 text-sm">
            {getScoreLabel(analysis.qualityScore)}
          </span>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {Object.entries(analysis.metrics).map(([key, metric]) => (
          <div key={key} className="bg-gray-800/50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-400 capitalize">
                {key === 'blur' ? 'Sharpness' : key}
              </span>
              {metric.passed ? (
                <span className="text-green-400 text-xl">✓</span>
              ) : (
                <span className="text-red-400 text-xl">✗</span>
              )}
            </div>
            {metric.score !== undefined && (
              <span className={`text-lg font-medium ${metric.passed ? 'text-green-400' : 'text-red-400'}`}>
                {metric.score}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Issues */}
      {analysis.issues && analysis.issues.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-red-400 flex items-center">
            <span className="mr-2">🚫</span>
            Critical Issues ({analysis.issues.length})
          </h4>
          {analysis.issues.map((issue, index) => (
            <div key={index} className={`p-3 rounded-lg border ${getSeverityBadge(issue.severity)}`}>
              <div className="flex items-start">
                <span className="font-medium mr-2">{issue.type.replace(/_/g, ' ')}:</span>
                <span className="flex-1">{issue.message}</span>
              </div>
              {issue.suggestion && (
                <div className="mt-2 text-sm opacity-80">
                  💡 {issue.suggestion}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Warnings */}
      {analysis.warnings && analysis.warnings.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-yellow-400 flex items-center">
            <span className="mr-2">⚠️</span>
            Warnings ({analysis.warnings.length})
          </h4>
          {analysis.warnings.map((warning, index) => (
            <div key={index} className={`p-3 rounded-lg border ${getSeverityBadge(warning.severity)}`}>
              <div className="flex items-start">
                <span className="font-medium mr-2">{warning.type.replace(/_/g, ' ')}:</span>
                <span className="flex-1">{warning.message}</span>
              </div>
              {warning.suggestion && (
                <div className="mt-2 text-sm opacity-80">
                  💡 {warning.suggestion}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Recommendation */}
      <div className={`p-4 rounded-lg ${analysis.passed ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
        <p className={`font-medium ${analysis.passed ? 'text-green-400' : 'text-red-400'}`}>
          {analysis.recommendation}
        </p>
      </div>

      {/* Image Metadata */}
      {analysis.metadata && (
        <details className="text-sm">
          <summary className="text-gray-400 cursor-pointer hover:text-gray-300">
            Technical Details
          </summary>
          <div className="mt-2 grid grid-cols-2 gap-2 text-gray-400">
            <div>Resolution: {analysis.metadata.width}x{analysis.metadata.height}</div>
            <div>Format: {analysis.metadata.format?.toUpperCase()}</div>
            <div>Size: {(analysis.metadata.fileSize / 1024 / 1024).toFixed(2)} MB</div>
            <div>Alpha: {analysis.metadata.hasAlpha ? 'Yes' : 'No'}</div>
          </div>
        </details>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-3 pt-2">
        <button
          onClick={onRetry}
          className="flex-1 btn-secondary"
        >
          Upload Different Image
        </button>
        {analysis.passed && (
          <button
            onClick={onProceed}
            className="flex-1 btn-primary"
          >
            Proceed with Generation
          </button>
        )}
      </div>
    </div>
  );
};

export default ImageQualityCheck;
