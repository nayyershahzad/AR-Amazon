import { 
  ComprehensiveAnalytics, 
  FinancialMetrics, 
  DebtAnalytics,
  RewardAnalytics,
  PredictiveInsights,
  GoalTracking,
  RiskAssessment,
  AnalyticsRecommendation,
  ComparativeAnalysis,
  DashboardWidget
} from '../types/analytics';

import { RewardSystemService } from './rewardSystem';
import { AutomationService } from './automationService';
import { BehavioralAnalysisService } from './behavioralService';
import { EducationService } from './educationService';
import { SocialService } from './socialService';

export class AnalyticsService {
  private static analyticsCache: Map<string, ComprehensiveAnalytics> = new Map();
  private static dashboardLayouts: Map<string, DashboardWidget[]> = new Map();

  static async generateComprehensiveAnalytics(
    userId: string, 
    period: string = 'monthly'
  ): Promise<ComprehensiveAnalytics> {
    const endDate = new Date();
    const startDate = this.calculateStartDate(endDate, period);
    
    // Gather data from all services
    const [
      rewardData,
      educationData,
      socialData
    ] = await Promise.all([
      this.safeServiceCall(() => RewardSystemService.getUserRewards(userId)),
      this.safeServiceCall(() => EducationService.getEducationAnalytics(userId)),
      this.safeServiceCall(() => SocialService.getSocialAnalytics(userId))
    ]);

    const analytics: ComprehensiveAnalytics = {
      userId,
      period: period as any,
      generatedAt: new Date(),
      dataRange: {
        startDate,
        endDate,
        totalDays: Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
      },
      
      financialMetrics: this.generateFinancialMetrics(userId),
      debtAnalytics: this.generateDebtAnalytics(userId),
      rewardAnalytics: this.generateRewardAnalytics(rewardData),
      automationAnalytics: this.generateAutomationAnalytics(userId),
      behavioralAnalytics: this.generateBehavioralAnalytics(userId),
      educationAnalytics: this.transformEducationAnalytics(educationData),
      socialAnalytics: this.transformSocialAnalytics(socialData),
      predictions: this.generatePredictiveInsights(userId),
      goalTracking: this.generateGoalTracking(userId),
      riskAssessment: this.generateRiskAssessment(userId),
      recommendations: this.generateRecommendations(userId),
      comparativeAnalysis: this.generateComparativeAnalysis(userId)
    };

    // Cache the analytics
    this.analyticsCache.set(userId, analytics);
    
    return analytics;
  }

  private static async safeServiceCall<T>(serviceCall: () => Promise<T>): Promise<T | null> {
    try {
      return await serviceCall();
    } catch (error) {
      console.warn('Service call failed:', error);
      return null;
    }
  }

  private static calculateStartDate(endDate: Date, period: string): Date {
    const start = new Date(endDate);
    
    switch (period) {
      case 'weekly':
        start.setDate(start.getDate() - 7);
        break;
      case 'monthly':
        start.setMonth(start.getMonth() - 1);
        break;
      case 'quarterly':
        start.setMonth(start.getMonth() - 3);
        break;
      case 'yearly':
        start.setFullYear(start.getFullYear() - 1);
        break;
      default:
        start.setMonth(start.getMonth() - 1);
    }
    
    return start;
  }

  private static generateFinancialMetrics(userId: string): FinancialMetrics {
    // Simulate comprehensive financial metrics
    const totalDebtStart = 50000;
    const totalDebtCurrent = 41500;
    const totalDebtPaid = totalDebtStart - totalDebtCurrent;
    
    return {
      totalDebtStart,
      totalDebtCurrent,
      totalDebtPaid,
      debtReductionPercentage: (totalDebtPaid / totalDebtStart) * 100,
      monthlyDebtReduction: 2400,
      averagePaymentAmount: 850,
      totalPaymentsMade: 24,
      interestSaved: 3450,
      projectedInterestSavings: 12800,
      cashFlowImprovement: 680,
      netWorthChange: 8500,
      debtToIncomeRatio: 0.28,
      emergencyFundProgress: 2800
    };
  }

  private static generateDebtAnalytics(userId: string): DebtAnalytics {
    return {
      debtBreakdown: [
        {
          debtId: 'cc_001',
          debtType: 'Credit Card',
          originalBalance: 15000,
          currentBalance: 6500,
          paidAmount: 8500,
          reductionPercentage: 56.7,
          interestRate: 0.22,
          minimumPayment: 300,
          averagePayment: 450,
          payoffProgress: 0.567,
          projectedPayoffDate: new Date(Date.now() + 14 * 30 * 24 * 60 * 60 * 1000),
          interestSavedToDate: 1250,
          riskLevel: 'medium'
        },
        {
          debtId: 'loan_001',
          debtType: 'Personal Loan',
          originalBalance: 25000,
          currentBalance: 22000,
          paidAmount: 3000,
          reductionPercentage: 12.0,
          interestRate: 0.085,
          minimumPayment: 420,
          averagePayment: 500,
          payoffProgress: 0.12,
          projectedPayoffDate: new Date(Date.now() + 44 * 30 * 24 * 60 * 60 * 1000),
          interestSavedToDate: 340,
          riskLevel: 'low'
        }
      ],
      payoffStrategy: {
        currentStrategy: 'avalanche',
        strategyEffectiveness: 87,
        projectedPayoffDate: new Date(Date.now() + 32 * 30 * 24 * 60 * 60 * 1000),
        actualVsProjected: 0.85
      },
      paymentHistory: {
        totalPayments: 24,
        onTimePayments: 22,
        latePayments: 2,
        missedPayments: 0,
        onTimeRate: 91.7,
        averagePaymentTiming: -2.3,
        paymentConsistency: 0.89,
        largestPayment: 1200,
        smallestPayment: 350,
        paymentTrends: {
          trend: 'improving',
          trendStrength: 0.75,
          seasonality: false,
          cyclicalPattern: false,
          dataPoints: [],
          forecast: []
        }
      },
      debtUtilization: {
        creditUtilizationRatio: 0.28,
        utilizationTrend: 'improving',
        utilizationHistory: [],
        creditScoreImpact: 35,
        optimalUtilization: 0.1
      },
      consolidationOpportunities: [
        {
          id: 'consol_001',
          description: 'Consolidate credit cards into personal loan',
          debtsToConsolidate: ['cc_001'],
          potentialSavings: 4200,
          newInterestRate: 0.12,
          newMonthlyPayment: 380,
          payoffAcceleration: 8,
          riskLevel: 'low',
          requirements: ['Good credit score', 'Stable income verification']
        }
      ]
    };
  }

  private static generateRewardAnalytics(rewardData: any): RewardAnalytics {
    return {
      totalPointsEarned: rewardData?.totalPoints || 2450,
      currentPoints: rewardData?.totalPoints || 2450,
      pointsRedeemed: 500,
      cashRewardsEarned: rewardData?.cashEarned || 122.50,
      currentLevel: rewardData?.level || 3,
      levelsGained: 2,
      badgesEarned: 8,
      achievementsUnlocked: 12,
      motivationScore: 0.85,
      rewardEffectiveness: 0.78,
      pointsPerDollarPaid: 0.29,
      streakAnalysis: {
        currentStreak: 15,
        longestStreak: 22,
        streakBreaks: 2,
        averageStreakLength: 12.4,
        streakImpactOnPayments: 0.32,
        streakMotivationScore: 0.88
      },
      milestoneProgress: [
        {
          milestoneId: 'milestone_10k',
          title: 'Pay off $10,000',
          targetValue: 10000,
          currentValue: 8500,
          progressPercentage: 85,
          projectedCompletionDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
          difficulty: 'medium'
        },
        {
          milestoneId: 'milestone_level_5',
          title: 'Reach Level 5',
          targetValue: 5,
          currentValue: 3,
          progressPercentage: 60,
          projectedCompletionDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
          difficulty: 'easy'
        }
      ]
    };
  }

  private static generateAutomationAnalytics(userId: string): any {
    return {
      automationEnabled: true,
      automationEffectiveness: 0.92,
      scheduledPayments: 24,
      executedPayments: 22,
      failedPayments: 2,
      automationReliability: 0.917,
      timesSaved: 8.5,
      paymentOptimizationScore: 0.87,
      automatedSavings: 1250,
      manualInterventions: 3,
      automationROI: 4.2
    };
  }

  private static generateBehavioralAnalytics(userId: string): any {
    return {
      personalityType: 'balanced',
      behaviorConsistency: 0.82,
      spendingTriggerFrequency: 0.15,
      nudgeEffectiveness: 0.74,
      behaviorChangeScore: 0.68,
      impulseControlImprovement: 0.45,
      financialHabitsScore: 0.78,
      stressIndicators: 0.12,
      positiveHabitsFormed: 5,
      behavioralRiskScore: 0.23
    };
  }

  private static transformEducationAnalytics(educationData: any): any {
    if (!educationData) {
      return {
        modulesCompleted: 2,
        lessonsCompleted: 8,
        quizzesTaken: 6,
        averageQuizScore: 87.5,
        timeSpentLearning: 12.5,
        knowledgeRetentionScore: 0.82,
        learningVelocity: 1.8,
        educationImpactScore: 0.75,
        certificatesEarned: 1,
        skillsAcquired: ['budgeting', 'debt_management', 'financial_planning']
      };
    }

    return {
      modulesCompleted: educationData.metrics.modulesCompleted,
      lessonsCompleted: educationData.metrics.lessonsCompleted,
      quizzesTaken: educationData.metrics.quizzesCompleted,
      averageQuizScore: educationData.metrics.averageQuizScore,
      timeSpentLearning: educationData.metrics.totalTimeSpent / 60,
      knowledgeRetentionScore: 0.82,
      learningVelocity: educationData.metrics.learningVelocity,
      educationImpactScore: 0.75,
      certificatesEarned: 1,
      skillsAcquired: ['budgeting', 'debt_management', 'financial_planning']
    };
  }

  private static transformSocialAnalytics(socialData: any): any {
    if (!socialData) {
      return {
        communityEngagement: 0.68,
        helpfulnessScore: 0.75,
        socialInfluence: 0.45,
        groupParticipation: 0.82,
        challengesCompleted: 3,
        supportProvided: 15,
        socialMotivationImpact: 0.72,
        networkSize: 45,
        reputationScore: 0.78
      };
    }

    return {
      communityEngagement: socialData.engagement.responseRate,
      helpfulnessScore: socialData.support.supportScore / 100,
      socialInfluence: socialData.influence.influenceScore / 100,
      groupParticipation: 0.82,
      challengesCompleted: 3,
      supportProvided: socialData.support.supportRequestsHelped,
      socialMotivationImpact: 0.72,
      networkSize: socialData.influence.followers + socialData.influence.following,
      reputationScore: 0.78
    };
  }

  private static generatePredictiveInsights(userId: string): PredictiveInsights {
    const debtFreeDate = new Date(Date.now() + 28 * 30 * 24 * 60 * 60 * 1000);
    
    return {
      debtFreeDate,
      debtFreeDateConfidence: 0.78,
      projectedTotalInterest: 8450,
      cashFlowProjections: this.generateCashFlowProjections(),
      riskEvents: [
        {
          id: 'risk_job_loss',
          type: 'income_loss',
          probability: 0.12,
          impact: 0.85,
          potentialCost: 15000,
          mitigationStrategies: [
            'Build emergency fund to 6 months expenses',
            'Develop additional income streams',
            'Update resume and maintain professional network'
          ],
          timeframe: 'next_12_months'
        }
      ],
      opportunityWindows: [
        {
          id: 'opp_refinance',
          type: 'refinance',
          opportunity: 'Refinance personal loan at lower rate',
          potentialSaving: 2400,
          effort: 'medium',
          timeframe: 'next_3_months',
          requirements: ['Credit score above 720', 'Income verification']
        }
      ],
      scenarioAnalysis: [
        {
          scenarioName: 'Aggressive Payoff',
          description: 'Increase monthly payments by $300',
          variables: { monthlyPaymentIncrease: 300 },
          projectedOutcome: {
            debtFreeDate: new Date(Date.now() + 18 * 30 * 24 * 60 * 60 * 1000),
            totalInterestPaid: 6200,
            totalSavings: 2250,
            monthlyPaymentChange: 300
          },
          probability: 0.65,
          recommendation: 'Consider if cash flow allows'
        }
      ],
      behaviorPredictions: [
        {
          behavior: 'Payment consistency will improve',
          likelihood: 0.82,
          impact: 'positive',
          interventionSuggestions: [
            'Continue current automation settings',
            'Set up payment reminders 2 days early'
          ],
          confidenceLevel: 0.75
        }
      ]
    };
  }

  private static generateCashFlowProjections(): any[] {
    const projections = [];
    const startDate = new Date();
    
    for (let i = 0; i < 12; i++) {
      const projectionDate = new Date(startDate);
      projectionDate.setMonth(projectionDate.getMonth() + i);
      
      projections.push({
        month: projectionDate,
        projectedIncome: 5500 + (Math.random() - 0.5) * 500,
        projectedExpenses: 3200 + (Math.random() - 0.5) * 300,
        projectedDebtPayment: 850 - (i * 15),
        projectedSavings: 400 + (i * 25),
        netCashFlow: 1050 + (i * 40),
        confidence: 0.85 - (i * 0.02)
      });
    }
    
    return projections;
  }

  private static generateGoalTracking(userId: string): GoalTracking {
    return {
      primaryGoals: [
        {
          id: 'goal_debt_free',
          title: 'Become Debt Free',
          description: 'Pay off all consumer debt',
          type: 'debt_reduction',
          targetValue: 50000,
          currentValue: 8500,
          progressPercentage: 17,
          targetDate: new Date(Date.now() + 28 * 30 * 24 * 60 * 60 * 1000),
          priority: 'high',
          status: 'in_progress',
          milestones: [
            {
              id: 'milestone_first_cc',
              title: 'Pay off first credit card',
              targetValue: 15000,
              completed: false,
              reward: '500 bonus points'
            }
          ],
          createdDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
          lastUpdated: new Date()
        }
      ],
      secondaryGoals: [
        {
          id: 'goal_emergency_fund',
          title: 'Build Emergency Fund',
          description: 'Save $10,000 for emergencies',
          type: 'savings',
          targetValue: 10000,
          currentValue: 2800,
          progressPercentage: 28,
          targetDate: new Date(Date.now() + 12 * 30 * 24 * 60 * 60 * 1000),
          priority: 'medium',
          status: 'in_progress',
          milestones: [],
          createdDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
          lastUpdated: new Date()
        }
      ],
      completedGoals: [
        {
          id: 'goal_budget_setup',
          title: 'Set Up Budget',
          description: 'Create and implement monthly budget',
          type: 'behavioral',
          targetValue: 1,
          currentValue: 1,
          progressPercentage: 100,
          targetDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          priority: 'high',
          status: 'completed',
          milestones: [],
          createdDate: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000),
          lastUpdated: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      ],
      goalAchievementRate: 0.75,
      averageGoalCompletionTime: 85,
      goalMotivationImpact: 0.82
    };
  }

  private static generateRiskAssessment(userId: string): RiskAssessment {
    return {
      overallRiskScore: 35,
      riskLevel: 'medium',
      riskFactors: [
        {
          id: 'risk_single_income',
          category: 'financial',
          risk: 'Dependence on single income source',
          severity: 0.7,
          probability: 0.15,
          impact: 'Could significantly impact debt payments',
          mitigated: false
        },
        {
          id: 'risk_spending_triggers',
          category: 'behavioral',
          risk: 'Weekend spending impulses',
          severity: 0.4,
          probability: 0.65,
          impact: 'May slow down debt payoff progress',
          mitigated: true
        }
      ],
      mitigationStrategies: [
        {
          id: 'strategy_emergency_fund',
          riskFactorId: 'risk_single_income',
          strategy: 'Build 6-month emergency fund',
          effectiveness: 0.85,
          cost: 0,
          timeToImplement: '6-12 months',
          priority: 'high'
        }
      ],
      riskTrends: [
        {
          riskFactorId: 'risk_spending_triggers',
          trend: 'improving',
          trendData: [],
          projectedDirection: 'better'
        }
      ],
      emergencyRecommendations: [
        'Prioritize building emergency fund alongside debt payments',
        'Consider income diversification strategies',
        'Review and adjust budget monthly for unexpected expenses'
      ]
    };
  }

  private static generateRecommendations(userId: string): AnalyticsRecommendation[] {
    return [
      {
        id: 'rec_payment_increase',
        category: 'debt',
        type: 'short_term',
        priority: 'high',
        title: 'Increase Monthly Payments',
        description: 'You could accelerate debt payoff by increasing payments by $200/month',
        expectedBenefit: 'Pay off debt 8 months earlier, save $2,400 in interest',
        effort: 'medium',
        timeline: '1-2 weeks to implement',
        successProbability: 0.85,
        potentialSaving: 2400,
        steps: [
          'Review current budget for available funds',
          'Update automatic payment amounts',
          'Monitor first month to ensure sustainability'
        ],
        metrics: ['Monthly payment amount', 'Debt reduction rate', 'Cash flow impact']
      },
      {
        id: 'rec_consolidation',
        category: 'debt',
        type: 'immediate',
        priority: 'medium',
        title: 'Consider Debt Consolidation',
        description: 'Consolidating credit cards could reduce interest rates',
        expectedBenefit: 'Lower monthly payments, simplified management',
        effort: 'high',
        timeline: '2-4 weeks',
        successProbability: 0.70,
        potentialSaving: 4200,
        steps: [
          'Check credit score and history',
          'Research consolidation loan options',
          'Compare rates and terms',
          'Apply for best option'
        ],
        metrics: ['Interest rate reduction', 'Monthly payment change', 'Total interest saved']
      },
      {
        id: 'rec_social_engagement',
        category: 'social',
        type: 'immediate',
        priority: 'medium',
        title: 'Increase Community Participation',
        description: 'Join more challenges to boost motivation and accountability',
        expectedBenefit: 'Higher motivation, better payment consistency',
        effort: 'low',
        timeline: 'Immediate',
        successProbability: 0.90,
        potentialSaving: 0,
        steps: [
          'Join debt payoff challenge',
          'Share weekly progress updates',
          'Engage with community posts daily'
        ],
        metrics: ['Community engagement score', 'Payment consistency', 'Motivation levels']
      }
    ];
  }

  private static generateComparativeAnalysis(userId: string): ComparativeAnalysis {
    return {
      peerComparison: {
        userRank: 23,
        totalUsers: 150,
        percentile: 85,
        metrics: {
          debtReduction: { user: 17, peer: 12, percentile: 78 },
          paymentConsistency: { user: 92, peer: 76, percentile: 88 },
          timeToDebtFree: { user: 28, peer: 36, percentile: 72 },
          interestSavings: { user: 3450, peer: 2100, percentile: 82 }
        }
      },
      industryBenchmarks: {
        averageDebtAmount: 32000,
        averagePayoffTime: 42,
        averageInterestRate: 0.18,
        successRate: 0.68,
        commonChallenges: [
          'Inconsistent payments',
          'Lack of emergency fund',
          'Impulse spending',
          'High interest rates'
        ],
        bestPractices: [
          'Automate payments',
          'Use debt avalanche method',
          'Build small emergency fund first',
          'Track progress visually'
        ]
      },
      historicalComparison: {
        performanceImprovement: 0.34,
        consistencyImprovement: 0.28,
        efficiencyGains: 0.41,
        milestoneAcceleration: 0.22,
        trendAnalysis: {
          trend: 'improving',
          trendStrength: 0.78,
          seasonality: false,
          cyclicalPattern: false,
          dataPoints: [],
          forecast: []
        }
      },
      goalVsActual: {
        goalAchievementRate: 0.85,
        averageVariance: 0.12,
        consistentOverPerformance: true,
        consistentUnderPerformance: false,
        adjustmentRecommendations: [
          'Consider setting more ambitious goals',
          'Maintain current momentum',
          'Add stretch goals for extra motivation'
        ]
      }
    };
  }

  static async getDashboardWidgets(userId: string): Promise<DashboardWidget[]> {
    let widgets = this.dashboardLayouts.get(userId);
    
    if (!widgets) {
      widgets = this.createDefaultDashboard();
      this.dashboardLayouts.set(userId, widgets);
    }
    
    return widgets;
  }

  private static createDefaultDashboard(): DashboardWidget[] {
    return [
      {
        id: 'debt_overview',
        title: 'Debt Overview',
        type: 'metric',
        size: 'large',
        data: {
          totalDebt: 41500,
          debtPaid: 8500,
          progressPercentage: 17,
          projectedPayoffDate: '2027-06-15'
        },
        config: {
          refreshRate: 3600000, // 1 hour
          interactive: true,
          exportable: true
        },
        position: { row: 1, column: 1, width: 6, height: 4 },
        isVisible: true,
        lastUpdated: new Date()
      },
      {
        id: 'payment_trends',
        title: 'Payment Trends',
        type: 'chart',
        size: 'large',
        data: {
          chartType: 'line',
          timeframe: '6months',
          data: []
        },
        config: {
          refreshRate: 86400000, // 24 hours
          interactive: true,
          exportable: true
        },
        position: { row: 1, column: 7, width: 6, height: 4 },
        isVisible: true,
        lastUpdated: new Date()
      },
      {
        id: 'goals_progress',
        title: 'Goals Progress',
        type: 'progress',
        size: 'medium',
        data: {
          goals: [
            { title: 'Debt Free', progress: 17, target: '2027-06-15' },
            { title: 'Emergency Fund', progress: 28, target: '2026-03-15' }
          ]
        },
        config: {
          refreshRate: 3600000,
          interactive: false
        },
        position: { row: 5, column: 1, width: 4, height: 3 },
        isVisible: true,
        lastUpdated: new Date()
      },
      {
        id: 'recommendations',
        title: 'Smart Recommendations',
        type: 'recommendation',
        size: 'medium',
        data: {
          recommendations: []
        },
        config: {
          refreshRate: 86400000,
          interactive: true
        },
        position: { row: 5, column: 5, width: 4, height: 3 },
        isVisible: true,
        lastUpdated: new Date()
      },
      {
        id: 'risk_alerts',
        title: 'Risk Monitoring',
        type: 'alert',
        size: 'medium',
        data: {
          riskLevel: 'medium',
          alerts: []
        },
        config: {
          refreshRate: 3600000,
          alertThreshold: 0.7
        },
        position: { row: 5, column: 9, width: 4, height: 3 },
        isVisible: true,
        lastUpdated: new Date()
      }
    ];
  }

  static async createDemoAnalytics(userId: string): Promise<ComprehensiveAnalytics> {
    const analytics = await this.generateComprehensiveAnalytics(userId, 'monthly');
    
    // Enhanced demo data
    analytics.financialMetrics.totalDebtPaid = 12500;
    analytics.financialMetrics.debtReductionPercentage = 25;
    analytics.financialMetrics.interestSaved = 4200;
    
    analytics.rewardAnalytics.totalPointsEarned = 3450;
    analytics.rewardAnalytics.currentLevel = 4;
    analytics.rewardAnalytics.streakAnalysis.currentStreak = 18;
    
    analytics.predictions.debtFreeDateConfidence = 0.82;
    
    return analytics;
  }
}