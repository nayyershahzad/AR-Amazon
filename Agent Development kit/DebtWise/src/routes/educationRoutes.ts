import express from 'express';
import { EducationService } from '../services/educationService';

const router = express.Router();

// Get user's education profile
router.get('/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const profile = await EducationService.getUserEducationProfile(userId);
    
    res.json({
      success: true,
      data: profile
    });
  } catch (error: any) {
    console.error('Failed to get education profile:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get available education modules
router.get('/modules/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const modules = await EducationService.getAvailableModules(userId);
    
    res.json({
      success: true,
      data: modules
    });
  } catch (error: any) {
    console.error('Failed to get education modules:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get education analytics
router.get('/analytics/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const analytics = await EducationService.getEducationAnalytics(userId);
    
    res.json({
      success: true,
      data: analytics
    });
  } catch (error: any) {
    console.error('Failed to get education analytics:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Start a lesson
router.post('/lessons/:lessonId/start', async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }
    
    const session = await EducationService.startLesson(userId, lessonId);
    
    res.json({
      success: true,
      data: session
    });
  } catch (error: any) {
    console.error('Failed to start lesson:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Complete a lesson
router.post('/lessons/:lessonId/complete', async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { userId, timeSpent } = req.body;
    
    if (!userId || typeof timeSpent !== 'number') {
      return res.status(400).json({
        success: false,
        error: 'User ID and timeSpent are required'
      });
    }
    
    const result = await EducationService.completeLesson(userId, lessonId, timeSpent);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    console.error('Failed to complete lesson:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Take a quiz
router.post('/quizzes/:quizId/take', async (req, res) => {
  try {
    const { quizId } = req.params;
    const { userId, answers } = req.body;
    
    if (!userId || !answers) {
      return res.status(400).json({
        success: false,
        error: 'User ID and answers are required'
      });
    }
    
    const attempt = await EducationService.takeQuiz(userId, quizId, answers);
    
    res.json({
      success: true,
      data: attempt
    });
  } catch (error: any) {
    console.error('Failed to take quiz:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Create demo education profile
router.post('/demo/create', async (req, res) => {
  try {
    const userId = 'demo_user_123';
    const demoData = await EducationService.createDemoProfile(userId);
    
    res.json({
      success: true,
      data: demoData,
      message: 'Demo education profile created successfully'
    });
  } catch (error: any) {
    console.error('Failed to create demo education profile:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Simulate lesson completion
router.post('/demo/complete-lesson', async (req, res) => {
  try {
    const { lessonId = 'lesson_debt_types', timeSpent = 1800 } = req.body; // 30 minutes default
    const userId = 'demo_user_123';
    
    const result = await EducationService.completeLesson(userId, lessonId, timeSpent);
    const updatedProfile = await EducationService.getUserEducationProfile(userId);
    
    res.json({
      success: true,
      data: {
        completion: result,
        profile: updatedProfile
      },
      message: `Lesson completed! Earned ${result.pointsEarned} points${result.levelUp ? ' and leveled up!' : ''}`
    });
  } catch (error: any) {
    console.error('Failed to complete demo lesson:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Simulate quiz completion
router.post('/demo/take-quiz', async (req, res) => {
  try {
    const { quizId = 'quiz_debt_basics', score = 85 } = req.body;
    const userId = 'demo_user_123';
    
    // Generate mock answers based on desired score
    const answers = {
      'q1': 1, // Credit Card (22% APR) - correct
      'q2': score > 70 ? 150 : 100 // Interest calculation - correct if good score
    };
    
    const attempt = await EducationService.takeQuiz(userId, quizId, answers);
    const updatedProfile = await EducationService.getUserEducationProfile(userId);
    
    res.json({
      success: true,
      data: {
        attempt,
        profile: updatedProfile
      },
      message: `Quiz ${attempt.passed ? 'passed' : 'failed'}! Score: ${Math.round(attempt.score / attempt.totalPossible * 100)}%`
    });
  } catch (error: any) {
    console.error('Failed to take demo quiz:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Simulate study session
router.post('/demo/study-session', async (req, res) => {
  try {
    const { lessonId = 'lesson_budget_methods', duration = 25 } = req.body;
    const userId = 'demo_user_123';
    
    // Start and immediately complete a study session
    const session = await EducationService.startLesson(userId, lessonId);
    
    // Simulate session completion with various activities
    session.endedAt = new Date();
    session.duration = duration * 60; // Convert to seconds
    session.activitiesCompleted = [
      {
        type: 'lesson_read',
        itemId: lessonId,
        duration: duration * 45, // 75% reading
        completed: true
      },
      {
        type: 'interactive_completed',
        itemId: 'budget_calculator',
        duration: duration * 15, // 25% interactive
        completed: true,
        score: 90
      }
    ];
    session.pointsEarned = 35;
    session.focusScore = Math.floor(Math.random() * 20) + 80; // 80-100 focus score
    
    const profile = await EducationService.getUserEducationProfile(userId);
    profile.totalPoints += session.pointsEarned;
    profile.learningStreak += 1;
    
    res.json({
      success: true,
      data: {
        session,
        profile
      },
      message: `Study session completed! ${duration} minutes of focused learning earned ${session.pointsEarned} points.`
    });
  } catch (error: any) {
    console.error('Failed to complete demo study session:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;