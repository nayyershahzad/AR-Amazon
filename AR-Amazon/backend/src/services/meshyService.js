import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class MeshyService {
  constructor() {
    this.apiKey = process.env.MESHY_API_KEY;
    this.apiUrl = process.env.MESHY_API_URL || 'https://api.meshy.ai';
    this.axiosInstance = axios.create({
      baseURL: this.apiUrl,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Remove background from image (simple threshold-based)
   * For better results, users should photograph on white/clean backgrounds
   * @param {Buffer} imageBuffer - Image buffer
   * @param {Object} metadata - Image metadata
   * @returns {Promise<Buffer>} - Processed image buffer
   */
  async removeSimpleBackground(imageBuffer, metadata) {
    try {
      // Simple background removal: threshold-based approach
      // Works best when background is significantly different from product

      // Convert to raw pixel data
      const { data, info } = await sharp(imageBuffer)
        .raw()
        .toBuffer({ resolveWithObject: true });

      // Create alpha channel based on brightness
      // Assumes background is lighter than product
      const pixels = new Uint8Array(data);
      const pixelsWithAlpha = new Uint8ClampedArray(info.width * info.height * 4);

      for (let i = 0; i < pixels.length; i += 3) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];

        // Calculate brightness
        const brightness = (r + g + b) / 3;

        // Copy RGB
        pixelsWithAlpha[i * 4 / 3] = r;
        pixelsWithAlpha[i * 4 / 3 + 1] = g;
        pixelsWithAlpha[i * 4 / 3 + 2] = b;

        // Set alpha: transparent if very light (background), opaque otherwise
        if (brightness > 240) {
          // Very light = likely background
          pixelsWithAlpha[i * 4 / 3 + 3] = 0;
        } else if (brightness > 220) {
          // Light = semi-transparent
          pixelsWithAlpha[i * 4 / 3 + 3] = 128;
        } else {
          // Dark = product, keep opaque
          pixelsWithAlpha[i * 4 / 3 + 3] = 255;
        }
      }

      // Convert back to image
      return await sharp(pixelsWithAlpha, {
        raw: {
          width: info.width,
          height: info.height,
          channels: 4
        }
      })
        .png()
        .toBuffer();

    } catch (error) {
      console.warn('Background removal failed, using original:', error.message);
      return imageBuffer;
    }
  }

  /**
   * Upload image file to Meshy and create 3D generation task
   * @param {string} imagePath - Path to the image file
   * @param {boolean} removeBackground - Whether to attempt background removal
   * @returns {Promise<string>} - Task ID
   */
  async createImageTo3DTask(imagePath, removeBackground = false) {
    // Check if we should use mock mode (when Meshy free plan is exceeded)
    const USE_MOCK_MODE = process.env.USE_MOCK_3D === 'true';

    if (USE_MOCK_MODE) {
      console.log('🔄 MOCK MODE: Creating fake 3D generation task for:', imagePath);
      // Return a mock task ID
      return 'mock-task-' + Date.now();
    }

    try {
      // Pre-process image to enhance colors, isolate product, and improve geometry
      const enhancedImagePath = imagePath.replace(/(\.\w+)$/, '-enhanced.png');
      const mimeType = 'image/png'; // Use PNG to support transparency

      console.log('🎨 Pre-processing image for product isolation and enhancement...');

      // Step 1: Load image and get metadata
      const image = sharp(imagePath);
      const metadata = await image.metadata();

      console.log(`📐 Original image: ${metadata.width}x${metadata.height}, ${metadata.format}`);

      // Step 2: Enhanced pre-processing pipeline
      await image
        // Normalize colors and increase contrast
        .normalize()

        // Increase saturation to preserve colors
        .modulate({
          saturation: 1.3,   // 30% more saturation to counteract AI washing
          brightness: 1.1,   // 10% brighter for better visibility
          lightness: -2      // Slight darkening to preserve detail
        })

        // Sharpen edges for better geometry detection
        .sharpen({
          sigma: 2.0,        // Stronger sharpening for clear boundaries
          m1: 1.5,           // Edge multiplier
          m2: 0.7            // Flat area multiplier
        })

        // Remove noise
        .median(2)

        // Enhance contrast
        .linear(1.2, -(128 * 1.2) + 128) // Increase contrast by 20%

        // Add white background with padding (helps AI understand product boundaries)
        .extend({
          top: 50,
          bottom: 50,
          left: 50,
          right: 50,
          background: { r: 255, g: 255, b: 255, alpha: 1 }
        })

        // Convert to PNG with transparency support
        .png({
          quality: 100,
          compressionLevel: 6
        })
        .toFile(enhancedImagePath);

      console.log('✓ Image enhanced:');
      console.log('  - Color saturation +30%');
      console.log('  - Contrast enhanced +20%');
      console.log('  - Edges sharpened for geometry');
      console.log('  - White background padding added');
      console.log('  - Noise removed');

      // Convert enhanced image to base64 for direct upload
      const imageBuffer = fs.readFileSync(enhancedImagePath);
      const base64Image = imageBuffer.toString('base64');
      const imageUrl = `data:${mimeType};base64,${base64Image}`;

      // Clean up enhanced image
      try {
        fs.unlinkSync(enhancedImagePath);
      } catch (err) {
        console.warn('Could not delete enhanced image:', err.message);
      }

      // Create 3D generation task using Meshy AI v1 API
      // Endpoint: POST /openapi/v1/image-to-3d
      // Documentation: https://docs.meshy.ai/en/api/image-to-3d

      // IMPORTANT: Use meshy-5 for better color accuracy and quality
      // meshy-4 and older models tend to lose colors
      const requestPayload = {
        image_url: imageUrl,

        // Use meshy-5 for latest quality improvements
        ai_model: 'meshy-5',

        // Enable PBR textures for realistic materials
        enable_pbr: true,

        // Quad topology for better organic shapes
        topology: 'quad',

        // Higher polycount for more detail (max: 100000)
        target_polycount: 60000,

        // Enable texturing (required for color preservation)
        should_texture: true
      };

      console.log('🎨 Meshy API Request:', JSON.stringify({
        ...requestPayload,
        image_url: `data:${mimeType};base64,[${Math.round(imageBuffer.length / 1024)}KB]`,
      }, null, 2));

      const taskResponse = await this.axiosInstance.post('/openapi/v1/image-to-3d', requestPayload);

      console.log('✅ Meshy task created:', taskResponse.data.result);
      return taskResponse.data.result; // This is the task ID
    } catch (error) {
      console.error('Error creating Meshy task:', error.response?.data || error.message);

      // If it's a free plan limit error, suggest enabling mock mode
      if (error.response?.data?.message?.includes('NoMorePendingTasks')) {
        throw new Error('Meshy free plan limit reached. Upgrade at https://www.meshy.ai/settings/subscription or enable mock mode by setting USE_MOCK_3D=true in .env');
      }

      throw new Error(error.response?.data?.message || 'Failed to create 3D generation task');
    }
  }

  /**
   * Check the status of a 3D generation task
   * @param {string} taskId - Task ID from Meshy
   * @returns {Promise<Object>} - Task status and details
   */
  async checkTaskStatus(taskId) {
    // Check if this is a mock task
    if (taskId.startsWith('mock-task-')) {
      console.log('🔄 MOCK MODE: Returning completed status for mock task');
      // Return a mock completed status with a sample 3D model
      return {
        status: 'SUCCEEDED',
        model_urls: {
          glb: 'https://models.readyplayer.me/64bfa2a0b2e3f1b5c8a9d0e1.glb', // Sample GLB model
          fbx: 'https://models.readyplayer.me/64bfa2a0b2e3f1b5c8a9d0e1.fbx'
        },
        thumbnail_url: 'https://via.placeholder.com/400x400.png?text=Mock+3D+Model'
      };
    }

    try {
      const response = await this.axiosInstance.get(`/openapi/v1/image-to-3d/${taskId}`);
      return response.data;
    } catch (error) {
      console.error('Error checking Meshy task status:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to check task status');
    }
  }

  /**
   * Poll for task completion with retry logic
   * @param {string} taskId - Task ID from Meshy
   * @param {number} maxAttempts - Maximum number of polling attempts (default: 60)
   * @param {number} interval - Interval between polls in ms (default: 5000)
   * @returns {Promise<Object>} - Completed task details
   */
  async pollTaskCompletion(taskId, maxAttempts = 60, interval = 5000) {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const status = await this.checkTaskStatus(taskId);

      if (status.status === 'SUCCEEDED') {
        return status;
      } else if (status.status === 'FAILED') {
        throw new Error('3D generation task failed');
      }

      // Wait before next poll
      await new Promise(resolve => setTimeout(resolve, interval));
    }

    throw new Error('Task timeout: 3D generation took too long');
  }

  /**
   * Download GLB file from Meshy CDN and save locally
   * @param {string} glbUrl - URL to GLB file from Meshy
   * @param {string} modelId - Model ID for filename
   * @returns {Promise<string>} - Local file path
   */
  async downloadGLBFile(glbUrl, modelId) {
    try {
      const modelsDir = path.join(__dirname, '../../models');
      const filename = `${modelId}.glb`;
      const filepath = path.join(modelsDir, filename);

      // Download the file
      const response = await axios.get(glbUrl, {
        responseType: 'arraybuffer'
      });

      // Save to disk
      fs.writeFileSync(filepath, Buffer.from(response.data));

      console.log(`✅ Downloaded GLB file: ${filename}`);
      return `/models/${filename}`;
    } catch (error) {
      console.error('Error downloading GLB file:', error.message);
      throw new Error('Failed to download GLB file');
    }
  }
}

export default new MeshyService();
