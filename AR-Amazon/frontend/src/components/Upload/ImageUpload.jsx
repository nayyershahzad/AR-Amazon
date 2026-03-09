import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { modelsAPI } from '../../services/api';
import ImageQualityCheck from './ImageQualityCheck';
import CameraCapture from './CameraCapture';

const ImageUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]); // Multiple images support
  const [preview, setPreview] = useState(null);
  const [previews, setPreviews] = useState([]); // Multiple previews
  const [productName, setProductName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [multiImageMode, setMultiImageMode] = useState(false); // Toggle for multi-image
  const [qualityAnalysis, setQualityAnalysis] = useState(null); // Quality check results
  const [showCamera, setShowCamera] = useState(false); // Camera capture modal

  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      setError('Only JPG and PNG files are allowed');
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10485760) {
      setError('File size must be less than 10MB');
      return;
    }

    setError('');

    if (multiImageMode) {
      // Add to multiple files array (max 8 images)
      if (selectedFiles.length >= 8) {
        setError('Maximum 8 images allowed');
        return;
      }

      setSelectedFiles(prev => [...prev, file]);

      // Create preview for multi-image
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    } else {
      // Single file mode
      setSelectedFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (index) => {
    if (multiImageMode) {
      setSelectedFiles(prev => prev.filter((_, i) => i !== index));
      setPreviews(prev => prev.filter((_, i) => i !== index));
    } else {
      setSelectedFile(null);
      setPreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (multiImageMode) {
      if (selectedFiles.length === 0) {
        setError('Please select at least one image');
        return;
      }
    } else {
      if (!selectedFile) {
        setError('Please select an image');
        return;
      }
    }

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();

      if (multiImageMode) {
        // For multi-image mode, send all images
        // Backend will select the best one or composite them
        selectedFiles.forEach((file) => {
          formData.append('images', file);
        });
        formData.append('multiImage', 'true');
      } else {
        formData.append('image', selectedFile);
      }

      formData.append('productName', productName);

      const response = await modelsAPI.create(formData);

      if (response.data.success) {
        navigate(`/model/${response.data.data.id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleCameraCapture = (files) => {
    setShowCamera(false);

    if (multiImageMode) {
      // Handle multiple captured files
      setSelectedFiles(files);
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setPreviews(newPreviews);
    } else {
      // Handle single captured file
      setSelectedFile(files[0]);
      setPreview(URL.createObjectURL(files[0]));
    }
  };

  const checkQuality = async () => {
    setUploading(true);
    setError('');

    try {
      const formData = new FormData();

      if (multiImageMode) {
        selectedFiles.forEach((file) => {
          formData.append('images', file);
        });
      } else {
        formData.append('image', selectedFile);
      }

      const response = await modelsAPI.checkQuality(formData);

      if (response.data.success) {
        if (multiImageMode && response.data.results) {
          // Show analysis for best image selected
          const bestResult = response.data.results.reduce((prev, curr) =>
            curr.qualityScore > prev.qualityScore ? curr : prev
          );
          setQualityAnalysis(bestResult);
        } else {
          setQualityAnalysis(response.data.results[0]);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to analyze image quality');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Upload Product Image</h1>
          <p className="text-gray-400">
            Upload a product image to generate a 3D model for AR visualization
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Upload Mode Toggle */}
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Upload Mode
                </label>
                <p className="text-xs text-gray-400">
                  {multiImageMode
                    ? 'Upload 8+ images from different angles for best quality'
                    : 'Upload a single high-quality image'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setMultiImageMode(!multiImageMode);
                  setSelectedFile(null);
                  setSelectedFiles([]);
                  setPreview(null);
                  setPreviews([]);
                  setError('');
                }}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  multiImageMode ? 'bg-primary-500' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    multiImageMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Product Name Input */}
          <div className="card">
            <label htmlFor="productName" className="block text-sm font-medium text-gray-300 mb-2">
              Product Name (Optional)
            </label>
            <input
              type="text"
              id="productName"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="input-field"
              placeholder="Enter product name..."
            />
          </div>

          {/* File Upload Area */}
          <div className="card">
            <div
              className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive
                  ? 'border-primary-500 bg-primary-500/10'
                  : 'border-gray-600 hover:border-gray-500'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/jpeg,image/jpg,image/png"
                onChange={handleChange}
                multiple={multiImageMode}
              />

              {multiImageMode && previews.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {previews.map((prev, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={prev}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                        <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                          {index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-gray-400">
                    {selectedFiles.length} of 8 images uploaded
                  </p>
                  {selectedFiles.length < 8 && (
                    <button
                      type="button"
                      onClick={handleButtonClick}
                      className="btn-secondary"
                    >
                      Add More Images
                    </button>
                  )}
                </div>
              ) : preview ? (
                <div className="space-y-4">
                  <img
                    src={preview}
                    alt="Preview"
                    className="max-h-96 mx-auto rounded-lg"
                  />
                  <div className="text-gray-300">
                    <p className="font-medium">{selectedFile.name}</p>
                    <p className="text-sm text-gray-400">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeImage(0)}
                    className="btn-secondary"
                  >
                    Remove Image
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div>
                    <button
                      type="button"
                      onClick={handleButtonClick}
                      className="btn-primary"
                    >
                      Choose Image
                    </button>
                    <p className="mt-2 text-sm text-gray-400">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG or JPG up to 10MB</p>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          {(selectedFile || selectedFiles.length > 0) && (
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="btn-secondary"
                disabled={uploading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={uploading}
              >
                {uploading ? 'Generating 3D Model...' : 'Generate 3D Model'}
              </button>
            </div>
          )}
        </form>

        {/* Info Box */}
        <div className="mt-8 card">
          <h3 className="text-lg font-medium text-white mb-3">
            {multiImageMode ? '📸 Multi-Image Mode Tips:' : '✨ Tips for Best Results:'}
          </h3>

          {multiImageMode ? (
            <div className="space-y-4">
              <div className="bg-primary-500/10 border border-primary-500/30 rounded-lg p-4">
                <h4 className="text-primary-400 font-medium mb-2">Recommended Angles (8+ photos):</h4>
                <ul className="text-gray-300 space-y-1 text-sm list-disc list-inside">
                  <li><strong>Front view</strong> - straight on at product level</li>
                  <li><strong>Back view</strong> - opposite side</li>
                  <li><strong>Left & Right sides</strong> - 90° from front</li>
                  <li><strong>Four 45° angles</strong> - between each cardinal direction</li>
                  <li><strong>Top view</strong> - directly above (if possible)</li>
                  <li><strong>Bottom view</strong> - if product allows</li>
                </ul>
              </div>
              <ul className="text-gray-400 space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span><strong>Same lighting</strong> for all photos - consistent shadows and color temperature</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span><strong>Clean background</strong> - white or solid color preferred</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span><strong>Same distance</strong> - keep product at similar size in all photos</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span><strong>High resolution</strong> - at least 1080p per image</span>
                </li>
              </ul>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Critical Warning */}
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                <h4 className="text-red-400 font-medium mb-2 flex items-center">
                  <span className="text-xl mr-2">⚠️</span>
                  Critical: Avoid White-on-White!
                </h4>
                <p className="text-gray-300 text-sm mb-2">
                  <strong>Bad:</strong> White product on white background/table (AI cannot detect edges)
                </p>
                <p className="text-gray-300 text-sm">
                  <strong>Good:</strong> Use contrasting background (dark gray, black, or colored)
                </p>
              </div>

              {/* Best Practices */}
              <ul className="text-gray-400 space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="mr-2">🎨</span>
                  <span><strong>Contrasting background</strong> - dark for light products, light for dark products</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">💡</span>
                  <span><strong>Good lighting</strong> with visible shadows (helps AI understand 3D shape)</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">📏</span>
                  <span><strong>Product fills 60-80% of frame</strong> - not too far, not too close</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">🔍</span>
                  <span><strong>Sharp focus</strong> - no blur, clear edges (use tripod if possible)</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">📐</span>
                  <span><strong>45° angle view</strong> - shows front and one side for depth</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">⏱</span>
                  <span>Processing takes 90-180 seconds (we enhance your image automatically)</span>
                </li>
              </ul>

              {/* Color accuracy notice */}
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                <p className="text-yellow-200 text-xs">
                  <strong>Note:</strong> Single images provide 70-85% color accuracy.
                  For 90-95% accuracy, enable Multi-Image Mode and upload 8+ angles.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageUpload;
