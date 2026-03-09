import express from 'express';
import prisma from '../config/database.js';
import { protect } from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import meshyService from '../services/meshyService.js';
import imageQualityAnalyzer from '../services/imageQualityAnalyzer.js';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// All routes are protected
router.use(protect);

// Custom multer middleware to handle both 'image' and 'images' fields
const uploadMiddleware = (req, res, next) => {
  // Create a dynamic upload handler
  const multiUpload = upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'images', maxCount: 10 }
  ]);

  multiUpload(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || 'File upload error'
      });
    }
    next();
  });
};

// @route   POST /api/models/check-quality
// @desc    Check image quality before generation
// @access  Private
router.post('/check-quality', uploadMiddleware, async (req, res) => {
  try {
    // Support both single 'image' and multiple 'images' uploads
    let files = [];
    if (req.files) {
      if (req.files.image) {
        files = req.files.image;
      } else if (req.files.images) {
        files = req.files.images;
      }
    }

    if (files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please upload at least one image'
      });
    }

    // Analyze all uploaded images
    const analysisResults = await Promise.all(
      files.map(async (file) => {
        try {
          const analysis = await imageQualityAnalyzer.analyzeImage(file.path);
          return {
            filename: file.originalname,
            ...analysis
          };
        } catch (error) {
          console.error(`Failed to analyze ${file.originalname}:`, error);
          return {
            filename: file.originalname,
            passed: false,
            qualityScore: 0,
            error: 'Analysis failed'
          };
        }
      })
    );

    // Clean up uploaded files (analysis doesn't save them)
    files.forEach(file => {
      try {
        fs.unlinkSync(file.path);
      } catch (err) {
        console.error('Error deleting file:', err);
      }
    });

    // Determine if all images passed
    const allPassed = analysisResults.every(r => r.passed);
    const avgScore = analysisResults.reduce((sum, r) => sum + r.qualityScore, 0) / analysisResults.length;

    res.json({
      success: true,
      passed: allPassed,
      averageScore: Math.round(avgScore),
      results: analysisResults,
      recommendation: allPassed
        ? 'All images passed quality checks. Proceed with 3D generation.'
        : 'Some images have quality issues. Please fix the issues and re-upload for best results.'
    });

  } catch (error) {
    console.error('Quality check error:', error);

    // Clean up files on error
    if (req.files) {
      if (Array.isArray(req.files)) {
        req.files.forEach(file => {
          try {
            fs.unlinkSync(file.path);
          } catch (err) {
            console.error('Error deleting file:', err);
          }
        });
      } else {
        Object.keys(req.files).forEach(fieldName => {
          req.files[fieldName].forEach(file => {
            try {
              fs.unlinkSync(file.path);
            } catch (err) {
              console.error('Error deleting file:', err);
            }
          });
        });
      }
    }

    res.status(500).json({
      success: false,
      message: 'Failed to analyze image quality'
    });
  }
});

// @route   GET /api/models
// @desc    Get all user's models
// @access  Private
router.get('/', async (req, res) => {
  try {
    const models = await prisma.model3D.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      count: models.length,
      data: models
    });
  } catch (error) {
    console.error('Get models error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching models'
    });
  }
});

// @route   GET /api/models/:id
// @desc    Get single model
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const model = await prisma.model3D.findUnique({
      where: { id: req.params.id }
    });

    if (!model) {
      return res.status(404).json({
        success: false,
        message: 'Model not found'
      });
    }

    // Check ownership
    if (model.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this model'
      });
    }

    res.json({
      success: true,
      data: model
    });
  } catch (error) {
    console.error('Get model error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching model'
    });
  }
});

// @route   POST /api/models/create
// @desc    Upload image(s) and create 3D model
// @access  Private
router.post('/create', uploadMiddleware, async (req, res) => {
  try {
    // Support both single 'image' and multiple 'images' uploads
    let files = [];
    if (req.files) {
      if (req.files.image) {
        files = req.files.image;
      } else if (req.files.images) {
        files = req.files.images;
      }
    }

    if (files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please upload at least one image'
      });
    }

    const { productName, multiImage } = req.body;
    const isMultiImage = multiImage === 'true';

    let selectedImagePath;
    let qualityCheckPassed = true;
    let qualityWarnings = [];

    if (isMultiImage && files.length > 1) {
      // Multi-image mode: select the best quality image
      console.log(`🎨 Multi-image mode: ${files.length} images uploaded`);

      // Analyze all images for quality
      const qualityResults = await Promise.all(
        files.map(async (file) => {
          try {
            const analysis = await imageQualityAnalyzer.analyzeImage(file.path);
            return { file, analysis };
          } catch (error) {
            console.error(`Quality check failed for ${file.filename}:`, error);
            return { file, analysis: { qualityScore: 0, passed: false } };
          }
        })
      );

      // Select best quality image (not just largest)
      const bestImage = qualityResults.reduce((prev, current) => {
        return (current.analysis.qualityScore > prev.analysis.qualityScore) ? current : prev;
      });

      selectedImagePath = bestImage.file.path;
      qualityCheckPassed = bestImage.analysis.passed;
      qualityWarnings = bestImage.analysis.warnings || [];

      console.log(`✓ Selected best quality image: ${bestImage.file.filename} (Quality: ${bestImage.analysis.qualityScore}/100)`);

      // Delete other images to save space
      files.forEach(file => {
        if (file.path !== selectedImagePath) {
          try {
            fs.unlinkSync(file.path);
          } catch (err) {
            console.error('Error deleting extra file:', err);
          }
        }
      });
    } else {
      // Single image mode - check quality
      selectedImagePath = files[0].path;

      console.log('🔍 Checking image quality...');
      const qualityAnalysis = await imageQualityAnalyzer.analyzeImage(selectedImagePath);
      qualityCheckPassed = qualityAnalysis.passed;
      qualityWarnings = qualityAnalysis.warnings || [];

      console.log(`Quality score: ${qualityAnalysis.qualityScore}/100`);

      // Reject if critical issues found
      if (!qualityCheckPassed) {
        // Delete the uploaded file
        try {
          fs.unlinkSync(selectedImagePath);
        } catch (err) {
          console.error('Error deleting file:', err);
        }

        return res.status(400).json({
          success: false,
          message: 'Image quality is too poor for 3D generation',
          qualityAnalysis: {
            score: qualityAnalysis.qualityScore,
            issues: qualityAnalysis.issues,
            recommendation: qualityAnalysis.recommendation
          }
        });
      }

      if (qualityWarnings.length > 0) {
        console.log(`⚠️ Quality warnings:`, qualityWarnings.map(w => w.type).join(', '));
      }
    }

    // Create Meshy task with enhanced parameters
    const taskId = await meshyService.createImageTo3DTask(selectedImagePath);

    // Save to database
    const model = await prisma.model3D.create({
      data: {
        userId: req.user.id,
        productName: productName || null,
        originalImageUrl: selectedImagePath,
        meshyTaskId: taskId,
        meshyStatus: 'processing'
      }
    });

    // Start background polling (non-blocking)
    pollTaskStatus(model.id, taskId);

    res.status(201).json({
      success: true,
      data: model,
      message: isMultiImage
        ? `3D model generation started using ${files.length} images (enhanced quality mode)`
        : '3D model generation started (enhanced quality mode)'
    });
  } catch (error) {
    console.error('Create model error:', error);

    // Delete uploaded files if exist
    if (req.files) {
      // Handle both formats: array or object with fields
      if (Array.isArray(req.files)) {
        req.files.forEach(file => {
          try {
            fs.unlinkSync(file.path);
          } catch (err) {
            console.error('Error deleting file:', err);
          }
        });
      } else {
        // Handle fields format
        Object.keys(req.files).forEach(fieldName => {
          req.files[fieldName].forEach(file => {
            try {
              fs.unlinkSync(file.path);
            } catch (err) {
              console.error('Error deleting file:', err);
            }
          });
        });
      }
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Server error while creating model'
    });
  }
});

// @route   GET /api/models/:id/status
// @desc    Check model generation status
// @access  Private
router.get('/:id/status', async (req, res) => {
  try {
    const model = await prisma.model3D.findUnique({
      where: { id: req.params.id }
    });

    if (!model) {
      return res.status(404).json({
        success: false,
        message: 'Model not found'
      });
    }

    // Check ownership
    if (model.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this model'
      });
    }

    // If already completed or failed, return current status
    if (model.meshyStatus === 'completed' || model.meshyStatus === 'failed') {
      return res.json({
        success: true,
        data: model
      });
    }

    // Check Meshy status
    try {
      const meshyStatus = await meshyService.checkTaskStatus(model.meshyTaskId);

      let updatedModel = model;

      if (meshyStatus.status === 'SUCCEEDED') {
        // Download GLB file locally
        const localPath = await meshyService.downloadGLBFile(
          meshyStatus.model_urls?.glb,
          model.id
        );

        updatedModel = await prisma.model3D.update({
          where: { id: model.id },
          data: {
            meshyStatus: 'completed',
            modelUrl: localPath,
            thumbnailUrl: meshyStatus.thumbnail_url
          }
        });
      } else if (meshyStatus.status === 'FAILED') {
        updatedModel = await prisma.model3D.update({
          where: { id: model.id },
          data: {
            meshyStatus: 'failed',
            errorMessage: 'Generation failed'
          }
        });
      }

      res.json({
        success: true,
        data: updatedModel
      });
    } catch (error) {
      res.json({
        success: true,
        data: model
      });
    }
  } catch (error) {
    console.error('Check status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while checking status'
    });
  }
});

// @route   DELETE /api/models/:id
// @desc    Delete model
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const model = await prisma.model3D.findUnique({
      where: { id: req.params.id }
    });

    if (!model) {
      return res.status(404).json({
        success: false,
        message: 'Model not found'
      });
    }

    // Check ownership
    if (model.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this model'
      });
    }

    // Delete local image file if exists
    if (model.originalImageUrl && fs.existsSync(model.originalImageUrl)) {
      try {
        fs.unlinkSync(model.originalImageUrl);
      } catch (err) {
        console.error('Error deleting file:', err);
      }
    }

    // Delete from database
    await prisma.model3D.delete({
      where: { id: req.params.id }
    });

    res.json({
      success: true,
      message: 'Model deleted successfully'
    });
  } catch (error) {
    console.error('Delete model error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting model'
    });
  }
});

// Background polling function
async function pollTaskStatus(modelId, taskId) {
  const maxAttempts = 60; // 5 minutes max (60 * 5 seconds)
  let attempts = 0;

  const poll = async () => {
    try {
      attempts++;

      const model = await prisma.model3D.findUnique({
        where: { id: modelId }
      });

      if (!model || model.meshyStatus === 'completed' || model.meshyStatus === 'failed') {
        return;
      }

      const status = await meshyService.checkTaskStatus(taskId);

      if (status.status === 'SUCCEEDED') {
        // Download GLB file locally
        const localPath = await meshyService.downloadGLBFile(
          status.model_urls?.glb,
          modelId
        );

        await prisma.model3D.update({
          where: { id: modelId },
          data: {
            meshyStatus: 'completed',
            modelUrl: localPath,
            thumbnailUrl: status.thumbnail_url
          }
        });
      } else if (status.status === 'FAILED') {
        await prisma.model3D.update({
          where: { id: modelId },
          data: {
            meshyStatus: 'failed',
            errorMessage: 'Generation failed'
          }
        });
      } else if (attempts < maxAttempts) {
        // Continue polling
        setTimeout(poll, 5000);
      } else {
        // Timeout
        await prisma.model3D.update({
          where: { id: modelId },
          data: {
            meshyStatus: 'failed',
            errorMessage: 'Generation timeout'
          }
        });
      }
    } catch (error) {
      console.error('Polling error:', error);
      if (attempts < maxAttempts) {
        setTimeout(poll, 5000);
      }
    }
  };

  // Start polling after 5 seconds
  setTimeout(poll, 5000);
}

export default router;
