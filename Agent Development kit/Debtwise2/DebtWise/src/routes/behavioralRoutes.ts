import express from 'express';
import { BehavioralAnalysisService } from '../services/behavioralService';

const router = express.Router();

// Get user's behavioral profile
router.get('/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const profile = await BehavioralAnalysisService.getBehavioralProfile(userId);
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        error: 'Behavioral profile not found'
      });
    }

    return res.json({
      success: true,
      data: profile
    });
  } catch (error: any) {
    console.error('Failed to get behavioral profile:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get user's behavioral insights
router.get('/insights/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const insights = await BehavioralAnalysisService.getUserInsights(userId);
    
    res.json({
      success: true,
      data: insights
    });
  } catch (error: any) {
    console.error('Failed to get behavioral insights:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get pending nudges for user
router.get('/nudges/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const nudges = await BehavioralAnalysisService.getPendingNudges(userId);
    
    res.json({
      success: true,
      data: nudges
    });
  } catch (error: any) {
    console.error('Failed to get nudges:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Generate a new personalized nudge
router.post('/nudges/:userId/generate', async (req, res) => {
  try {
    const { userId } = req.params;
    const { triggerEvent } = req.body;
    
    const nudge = await BehavioralAnalysisService.generatePersonalizedNudge(userId, triggerEvent || 'manual_trigger');
    
    if (!nudge) {
      return res.status(400).json({
        success: false,
        error: 'Could not generate nudge for user'
      });
    }

    return res.json({
      success: true,
      data: nudge
    });
  } catch (error: any) {
    console.error('Failed to generate nudge:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Mark nudge as viewed
router.post('/nudges/:nudgeId/viewed', async (req, res) => {
  try {
    const { nudgeId } = req.params;
    await BehavioralAnalysisService.markNudgeViewed(nudgeId);
    
    res.json({
      success: true,
      message: 'Nudge marked as viewed'
    });
  } catch (error: any) {
    console.error('Failed to mark nudge as viewed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Mark nudge as acted upon
router.post('/nudges/:nudgeId/acted', async (req, res) => {
  try {
    const { nudgeId } = req.params;
    await BehavioralAnalysisService.markNudgeActedUpon(nudgeId);
    
    res.json({
      success: true,
      message: 'Nudge marked as acted upon'
    });
  } catch (error: any) {
    console.error('Failed to mark nudge as acted upon:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// AI-powered behavioral analysis using Google Gen AI
router.post('/analyze', async (req, res) => {
  try {
    const { financialData, simulatorData, userId } = req.body;
    
    if (!financialData) {
      return res.status(400).json({
        success: false,
        error: 'Financial data is required for behavioral analysis'
      });
    }

    // Use Google Gen AI to analyze financial behavior patterns
    const analysis = await BehavioralAnalysisService.analyzeWithAI(userId, financialData, simulatorData);
    
    return res.json({
      success: true,
      data: analysis,
      message: 'AI behavioral analysis completed successfully'
    });
  } catch (error: any) {
    console.error('Failed to perform AI behavioral analysis:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Create demo behavioral profile
router.post('/demo/create', async (req, res) => {
  try {
    const userId = 'demo_user_123';
    const profile = await BehavioralAnalysisService.createDemoProfile(userId);
    const insights = await BehavioralAnalysisService.getUserInsights(userId);
    
    // Generate some demo nudges
    const nudges = await Promise.all([
      BehavioralAnalysisService.generatePersonalizedNudge(userId, 'weekend_spending_detected'),
      BehavioralAnalysisService.generatePersonalizedNudge(userId, 'payment_due_soon'),
      BehavioralAnalysisService.generatePersonalizedNudge(userId, 'milestone_achieved')
    ]);

    res.json({
      success: true,
      data: {
        profile,
        insights,
        nudges: nudges.filter(n => n !== null)
      },
      message: 'Demo behavioral analysis created successfully'
    });
  } catch (error: any) {
    console.error('Failed to create demo behavioral analysis:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Simulate behavioral trigger
router.post('/demo/trigger', async (req, res) => {
  try {
    const { triggerType, userId = 'demo_user_123' } = req.body;
    
    const triggerEvents = {
      spending_alert: 'high_spending_detected',
      payment_reminder: 'payment_due_tomorrow',
      milestone_celebration: 'debt_milestone_reached',
      streak_maintenance: 'payment_streak_risk',
      social_comparison: 'peer_comparison_available'
    };

    const eventType = triggerEvents[triggerType as keyof typeof triggerEvents] || 'general_motivation';
    const nudge = await BehavioralAnalysisService.generatePersonalizedNudge(userId, eventType);
    
    res.json({
      success: true,
      data: {
        trigger: triggerType,
        eventType,
        nudge
      },
      message: `Behavioral trigger "${triggerType}" processed successfully`
    });
  } catch (error: any) {
    console.error('Failed to process behavioral trigger:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;