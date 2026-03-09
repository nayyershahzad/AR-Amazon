import sharp from 'sharp';
import fs from 'fs';

/**
 * Image Quality Analyzer Service
 * Analyzes uploaded images for common quality issues before sending to Meshy API
 * Prevents wasted credits on poor quality images
 */
class ImageQualityAnalyzer {
  constructor() {
    // Thresholds for quality checks
    this.thresholds = {
      minWidth: 1024,           // Minimum width in pixels
      minHeight: 1024,          // Minimum height in pixels
      minBlurScore: 100,        // Laplacian variance threshold (lower = more blur)
      minBrightness: 30,        // Too dark threshold
      maxBrightness: 225,       // Too bright threshold
      minContrast: 40,          // Minimum contrast score
      minSaturation: 15,        // Too desaturated (grayscale-ish)
      backgroundSimilarity: 20  // Threshold for white-on-white detection
    };
  }

  /**
   * Analyze image quality and return detailed report
   * @param {string} imagePath - Path to image file
   * @returns {Promise<Object>} Quality analysis report
   */
  async analyzeImage(imagePath) {
    try {
      const image = sharp(imagePath);
      const metadata = await image.metadata();
      const stats = await image.stats();

      // Run all quality checks
      const [blurScore, contrastScore, backgroundIssue] = await Promise.all([
        this.checkBlur(image),
        this.checkContrast(image, metadata),
        this.checkBackground(image, stats)
      ]);

      const brightness = this.calculateBrightness(stats);
      const saturation = this.calculateSaturation(stats);

      // Generate quality report
      const issues = [];
      const warnings = [];

      // Resolution check
      if (metadata.width < this.thresholds.minWidth || metadata.height < this.thresholds.minHeight) {
        issues.push({
          type: 'LOW_RESOLUTION',
          severity: 'critical',
          message: `Image resolution is ${metadata.width}x${metadata.height}. Minimum recommended: ${this.thresholds.minWidth}x${this.thresholds.minHeight}`,
          suggestion: 'Use higher resolution image (1920x1080 or better)'
        });
      }

      // Blur check
      if (blurScore < this.thresholds.minBlurScore) {
        issues.push({
          type: 'BLURRY_IMAGE',
          severity: 'critical',
          message: `Image appears blurry (score: ${blurScore.toFixed(1)})`,
          suggestion: 'Use tripod or ensure camera is stable. Check focus.'
        });
      } else if (blurScore < this.thresholds.minBlurScore * 1.5) {
        warnings.push({
          type: 'SLIGHT_BLUR',
          severity: 'warning',
          message: `Image is slightly soft (score: ${blurScore.toFixed(1)})`,
          suggestion: 'Consider retaking with better focus for best results'
        });
      }

      // Brightness check
      if (brightness < this.thresholds.minBrightness) {
        issues.push({
          type: 'TOO_DARK',
          severity: 'critical',
          message: `Image is too dark (brightness: ${brightness.toFixed(1)})`,
          suggestion: 'Add more lighting or increase exposure'
        });
      } else if (brightness > this.thresholds.maxBrightness) {
        issues.push({
          type: 'TOO_BRIGHT',
          severity: 'critical',
          message: `Image is overexposed (brightness: ${brightness.toFixed(1)})`,
          suggestion: 'Reduce lighting or decrease exposure'
        });
      }

      // Contrast check
      if (contrastScore < this.thresholds.minContrast) {
        warnings.push({
          type: 'LOW_CONTRAST',
          severity: 'warning',
          message: `Low contrast detected (score: ${contrastScore.toFixed(1)})`,
          suggestion: 'Use contrasting background (dark for light products, light for dark products)'
        });
      }

      // Saturation check (potential grayscale or very desaturated)
      if (saturation < this.thresholds.minSaturation) {
        warnings.push({
          type: 'LOW_SATURATION',
          severity: 'warning',
          message: `Image appears desaturated (score: ${saturation.toFixed(1)})`,
          suggestion: 'Check white balance or use more colorful lighting'
        });
      }

      // Background similarity check (white-on-white, etc)
      if (backgroundIssue) {
        issues.push({
          type: 'UNIFORM_BACKGROUND',
          severity: 'critical',
          message: 'Product and background appear very similar in color',
          suggestion: 'Use contrasting background color for better geometry detection'
        });
      }

      // Calculate overall quality score (0-100)
      const qualityScore = this.calculateOverallScore({
        blur: blurScore,
        brightness,
        contrast: contrastScore,
        saturation,
        resolution: Math.min(metadata.width, metadata.height),
        backgroundIssue
      });

      // Determine if image should be accepted
      const shouldAccept = issues.length === 0;
      const recommendation = this.getRecommendation(qualityScore, shouldAccept);

      return {
        passed: shouldAccept,
        qualityScore: Math.round(qualityScore),
        metadata: {
          width: metadata.width,
          height: metadata.height,
          format: metadata.format,
          fileSize: fs.statSync(imagePath).size,
          hasAlpha: metadata.hasAlpha
        },
        metrics: {
          blur: {
            score: Math.round(blurScore),
            passed: blurScore >= this.thresholds.minBlurScore
          },
          brightness: {
            score: Math.round(brightness),
            passed: brightness >= this.thresholds.minBrightness && brightness <= this.thresholds.maxBrightness
          },
          contrast: {
            score: Math.round(contrastScore),
            passed: contrastScore >= this.thresholds.minContrast
          },
          saturation: {
            score: Math.round(saturation),
            passed: saturation >= this.thresholds.minSaturation
          },
          resolution: {
            passed: metadata.width >= this.thresholds.minWidth && metadata.height >= this.thresholds.minHeight
          }
        },
        issues,
        warnings,
        recommendation
      };

    } catch (error) {
      console.error('Image quality analysis failed:', error);
      throw new Error('Failed to analyze image quality');
    }
  }

  /**
   * Check image blur using Laplacian variance
   * @param {Sharp} image - Sharp image instance
   * @returns {Promise<number>} Blur score (higher = sharper)
   */
  async checkBlur(image) {
    try {
      // Convert to grayscale and apply Laplacian edge detection
      const { data, info } = await image
        .clone()
        .greyscale()
        .resize(512, 512, { fit: 'inside' }) // Resize for faster processing
        .convolve({
          width: 3,
          height: 3,
          kernel: [0, 1, 0, 1, -4, 1, 0, 1, 0] // Laplacian kernel
        })
        .raw()
        .toBuffer({ resolveWithObject: true });

      // Calculate variance (measure of sharpness)
      const pixels = new Uint8Array(data);
      const mean = pixels.reduce((sum, val) => sum + val, 0) / pixels.length;
      const variance = pixels.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / pixels.length;

      return variance;
    } catch (error) {
      console.warn('Blur detection failed:', error.message);
      return 100; // Default to passing if check fails
    }
  }

  /**
   * Check image contrast
   * @param {Sharp} image - Sharp image instance
   * @param {Object} metadata - Image metadata
   * @returns {Promise<number>} Contrast score (0-255)
   */
  async checkContrast(image, metadata) {
    try {
      const { data } = await image
        .clone()
        .greyscale()
        .resize(512, 512, { fit: 'inside' })
        .raw()
        .toBuffer();

      const pixels = new Uint8Array(data);
      const min = Math.min(...pixels);
      const max = Math.max(...pixels);

      return max - min; // Contrast range
    } catch (error) {
      console.warn('Contrast check failed:', error.message);
      return 100; // Default to passing
    }
  }

  /**
   * Check for uniform background (e.g., white product on white background)
   * @param {Sharp} image - Sharp image instance
   * @param {Object} stats - Image statistics
   * @returns {Promise<boolean>} True if background is too similar to subject
   */
  async checkBackground(image, stats) {
    try {
      // Check if image has very little variation (uniform color)
      const channelVariance = stats.channels.map(ch => ch.stdev);
      const avgStdev = channelVariance.reduce((a, b) => a + b, 0) / channelVariance.length;

      // If standard deviation is very low, colors are too uniform
      return avgStdev < this.thresholds.backgroundSimilarity;
    } catch (error) {
      console.warn('Background check failed:', error.message);
      return false; // Default to no issue
    }
  }

  /**
   * Calculate brightness from stats
   * @param {Object} stats - Image statistics
   * @returns {number} Brightness score (0-255)
   */
  calculateBrightness(stats) {
    return stats.channels.reduce((sum, ch) => sum + ch.mean, 0) / stats.channels.length;
  }

  /**
   * Calculate saturation from stats
   * @param {Object} stats - Image statistics
   * @returns {number} Saturation score
   */
  calculateSaturation(stats) {
    if (stats.channels.length < 3) return 0; // Grayscale

    const [r, g, b] = stats.channels.map(ch => ch.mean);
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const chroma = max - min;

    return chroma;
  }

  /**
   * Calculate overall quality score (0-100)
   * @param {Object} metrics - Individual metric scores
   * @returns {number} Overall quality score
   */
  calculateOverallScore(metrics) {
    const weights = {
      blur: 0.30,        // 30% - Most important
      resolution: 0.25,  // 25% - Very important
      brightness: 0.20,  // 20% - Important
      contrast: 0.15,    // 15% - Moderate
      saturation: 0.10   // 10% - Least critical
    };

    // Normalize each metric to 0-100 scale
    const normalized = {
      blur: Math.min((metrics.blur / 200) * 100, 100),
      resolution: Math.min((metrics.resolution / 1920) * 100, 100),
      brightness: 100 - Math.abs(127 - metrics.brightness) / 127 * 100,
      contrast: Math.min((metrics.contrast / 100) * 100, 100),
      saturation: Math.min((metrics.saturation / 50) * 100, 100)
    };

    // Apply penalty for background issues
    const backgroundPenalty = metrics.backgroundIssue ? 20 : 0;

    const score = Object.keys(weights).reduce((sum, key) => {
      return sum + (normalized[key] * weights[key]);
    }, 0);

    return Math.max(0, score - backgroundPenalty);
  }

  /**
   * Get recommendation based on quality score
   * @param {number} score - Quality score
   * @param {boolean} passed - Whether image passed critical checks
   * @returns {string} Recommendation
   */
  getRecommendation(score, passed) {
    if (!passed) {
      return 'REJECT - Image quality is too poor. Please fix critical issues and re-upload.';
    } else if (score >= 85) {
      return 'EXCELLENT - Image quality is great for 3D generation!';
    } else if (score >= 70) {
      return 'GOOD - Image quality is acceptable. Consider improvements for best results.';
    } else if (score >= 50) {
      return 'FAIR - Image will work but may have quality issues. Recommended to improve.';
    } else {
      return 'POOR - Proceed with caution. Quality may not be optimal.';
    }
  }
}

export default new ImageQualityAnalyzer();
