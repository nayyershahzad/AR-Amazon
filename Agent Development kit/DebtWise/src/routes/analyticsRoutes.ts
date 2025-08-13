import express from 'express';
import { AnalyticsService } from '../services/analyticsService';

const router = express.Router();

// Get comprehensive analytics
router.get('/comprehensive/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { period = 'monthly' } = req.query;
    
    const analytics = await AnalyticsService.generateComprehensiveAnalytics(userId, period as string);
    
    res.json({
      success: true,
      data: analytics
    });
  } catch (error: any) {
    console.error('Failed to generate comprehensive analytics:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get dashboard widgets
router.get('/dashboard/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const widgets = await AnalyticsService.getDashboardWidgets(userId);
    
    res.json({
      success: true,
      data: widgets
    });
  } catch (error: any) {
    console.error('Failed to get dashboard widgets:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Create demo analytics
router.post('/demo/create', async (req, res) => {
  try {
    const userId = 'demo_user_123';
    const analytics = await AnalyticsService.createDemoAnalytics(userId);
    const widgets = await AnalyticsService.getDashboardWidgets(userId);
    
    res.json({
      success: true,
      data: {
        analytics,
        widgets
      },
      message: 'Demo analytics created successfully'
    });
  } catch (error: any) {
    console.error('Failed to create demo analytics:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get financial metrics only
router.get('/financial/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const analytics = await AnalyticsService.generateComprehensiveAnalytics(userId);
    
    res.json({
      success: true,
      data: {
        financialMetrics: analytics.financialMetrics,
        debtAnalytics: analytics.debtAnalytics
      }
    });
  } catch (error: any) {
    console.error('Failed to get financial analytics:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get predictions and insights
router.get('/predictions/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const analytics = await AnalyticsService.generateComprehensiveAnalytics(userId);
    
    res.json({
      success: true,
      data: {
        predictions: analytics.predictions,
        riskAssessment: analytics.riskAssessment,
        recommendations: analytics.recommendations
      }
    });
  } catch (error: any) {
    console.error('Failed to get predictions:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get comparative analysis
router.get('/comparison/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const analytics = await AnalyticsService.generateComprehensiveAnalytics(userId);
    
    res.json({
      success: true,
      data: {
        comparativeAnalysis: analytics.comparativeAnalysis,
        goalTracking: analytics.goalTracking
      }
    });
  } catch (error: any) {
    console.error('Failed to get comparative analysis:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get system performance metrics
router.get('/performance/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const analytics = await AnalyticsService.generateComprehensiveAnalytics(userId);
    
    res.json({
      success: true,
      data: {
        rewardAnalytics: analytics.rewardAnalytics,
        automationAnalytics: analytics.automationAnalytics,
        behavioralAnalytics: analytics.behavioralAnalytics,
        educationAnalytics: analytics.educationAnalytics,
        socialAnalytics: analytics.socialAnalytics
      }
    });
  } catch (error: any) {
    console.error('Failed to get performance analytics:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Generate specific reports
router.post('/reports/generate', async (req, res) => {
  try {
    const { userId, reportType, period, filters } = req.body;
    
    if (!userId || !reportType) {
      return res.status(400).json({
        success: false,
        error: 'User ID and report type are required'
      });
    }
    
    const analytics = await AnalyticsService.generateComprehensiveAnalytics(userId, period);
    
    let reportData;
    
    switch (reportType) {
      case 'debt_summary':
        reportData = {
          financialMetrics: analytics.financialMetrics,
          debtAnalytics: analytics.debtAnalytics,
          predictions: analytics.predictions
        };
        break;
      case 'performance_review':
        reportData = {
          rewardAnalytics: analytics.rewardAnalytics,
          automationAnalytics: analytics.automationAnalytics,
          behavioralAnalytics: analytics.behavioralAnalytics,
          goalTracking: analytics.goalTracking
        };
        break;
      case 'risk_assessment':
        reportData = {
          riskAssessment: analytics.riskAssessment,
          recommendations: analytics.recommendations,
          predictions: analytics.predictions
        };
        break;
      case 'progress_report':
        reportData = {
          financialMetrics: analytics.financialMetrics,
          goalTracking: analytics.goalTracking,
          comparativeAnalysis: analytics.comparativeAnalysis
        };
        break;
      default:
        reportData = analytics;
    }
    
    res.json({
      success: true,
      data: {
        reportType,
        period,
        generatedAt: new Date(),
        data: reportData
      },
      message: `${reportType} report generated successfully`
    });
  } catch (error: any) {
    console.error('Failed to generate report:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Export analytics data
router.get('/export/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { format = 'json', period = 'all_time' } = req.query;
    
    const analytics = await AnalyticsService.generateComprehensiveAnalytics(userId, period as string);
    
    if (format === 'csv') {
      // Convert to CSV format (simplified)
      const csvData = this.convertToCSV(analytics);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=debtwise-analytics-${userId}-${Date.now()}.csv`);
      res.send(csvData);
    } else {
      // JSON format
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=debtwise-analytics-${userId}-${Date.now()}.json`);
      res.json({
        exportedAt: new Date(),
        userId,
        period,
        data: analytics
      });
    }
  } catch (error: any) {
    console.error('Failed to export analytics:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

function convertToCSV(analytics: any): string {
  // Simplified CSV conversion for key metrics
  const headers = [
    'Metric',
    'Value',
    'Period',
    'Generated_Date'
  ];
  
  const rows = [
    ['Total_Debt_Paid', analytics.financialMetrics.totalDebtPaid, analytics.period, analytics.generatedAt],
    ['Debt_Reduction_Percentage', analytics.financialMetrics.debtReductionPercentage, analytics.period, analytics.generatedAt],
    ['Interest_Saved', analytics.financialMetrics.interestSaved, analytics.period, analytics.generatedAt],
    ['Current_Level', analytics.rewardAnalytics.currentLevel, analytics.period, analytics.generatedAt],
    ['Total_Points', analytics.rewardAnalytics.totalPointsEarned, analytics.period, analytics.generatedAt],
    ['Current_Streak', analytics.rewardAnalytics.streakAnalysis.currentStreak, analytics.period, analytics.generatedAt]
  ];
  
  return [headers, ...rows].map(row => row.join(',')).join('\n');
}

export default router;