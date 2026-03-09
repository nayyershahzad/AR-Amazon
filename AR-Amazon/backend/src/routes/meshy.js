import express from 'express';
import { protect } from '../middleware/auth.js';
import meshyService from '../services/meshyService.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// @route   GET /api/meshy/status/:taskId
// @desc    Check Meshy task status directly
// @access  Private
router.get('/status/:taskId', async (req, res) => {
  try {
    const status = await meshyService.checkTaskStatus(req.params.taskId);

    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('Meshy status error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to check Meshy status'
    });
  }
});

export default router;
