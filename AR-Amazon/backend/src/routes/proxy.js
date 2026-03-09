import express from 'express';
import axios from 'axios';

const router = express.Router();

// @route   GET /api/proxy/glb
// @desc    Proxy GLB file from Meshy CDN to avoid CORS issues
// @access  Public (but URL is only known to authenticated users)
router.get('/glb', async (req, res) => {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({
        success: false,
        message: 'URL parameter is required'
      });
    }

    // Fetch the GLB file from Meshy CDN
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      headers: {
        'Accept': 'application/octet-stream'
      }
    });

    // Set appropriate headers for GLB file
    res.set({
      'Content-Type': 'model/gltf-binary',
      'Content-Length': response.data.length,
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=31536000'
    });

    res.send(Buffer.from(response.data));
  } catch (error) {
    console.error('Proxy error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch GLB file'
    });
  }
});

export default router;
