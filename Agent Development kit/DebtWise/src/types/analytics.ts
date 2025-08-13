export interface ComprehensiveAnalytics {
  userId: string;
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'all_time';
  generatedAt: Date;
  dataRange: {
    startDate: Date;
    endDate: Date;
    totalDays: number;
  };
  
  // Core Financial Metrics
  financialMetrics: FinancialMetrics;
  
  // Debt Management Analytics
  debtAnalytics: DebtAnalytics;
  
  // Reward System Analytics
  rewardAnalytics: RewardAnalytics;
  
  // Automation Performance
  automationAnalytics: AutomationAnalytics;
  
  // Behavioral Insights
  behavioralAnalytics: BehavioralAnalytics;
  
  // Education Progress
  educationAnalytics: EducationAnalytics;
  
  // Social Engagement
  socialAnalytics: SocialAnalytics;
  
  // Predictive Insights
  predictions: PredictiveInsights;
  
  // Goal Tracking
  goalTracking: GoalTracking;
  
  // Risk Assessment
  riskAssessment: RiskAssessment;
  
  // Recommendations
  recommendations: AnalyticsRecommendation[];
  
  // Comparative Analysis
  comparativeAnalysis: ComparativeAnalysis;
}

export interface FinancialMetrics {
  totalDebtStart: number;
  totalDebtCurrent: number;
  totalDebtPaid: number;
  debtReductionPercentage: number;
  monthlyDebtReduction: number;
  averagePaymentAmount: number;
  totalPaymentsMade: number;
  interestSaved: number;
  projectedInterestSavings: number;
  cashFlowImprovement: number;
  netWorthChange: number;
  debtToIncomeRatio: number;
  emergencyFundProgress: number;
}

export interface DebtAnalytics {
  debtBreakdown: DebtBreakdownAnalysis[];
  payoffStrategy: {
    currentStrategy: 'avalanche' | 'snowball' | 'custom';
    strategyEffectiveness: number;
    projectedPayoffDate: Date;
    actualVsProjected: number;
  };
  paymentHistory: PaymentHistoryAnalysis;
  debtUtilization: DebtUtilizationAnalysis;
  consolidationOpportunities: ConsolidationOpportunity[];
}

export interface DebtBreakdownAnalysis {
  debtId: string;
  debtType: string;
  originalBalance: number;
  currentBalance: number;
  paidAmount: number;
  reductionPercentage: number;
  interestRate: number;
  minimumPayment: number;
  averagePayment: number;
  payoffProgress: number;
  projectedPayoffDate: Date;
  interestSavedToDate: number;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface PaymentHistoryAnalysis {
  totalPayments: number;
  onTimePayments: number;
  latePayments: number;
  missedPayments: number;
  onTimeRate: number;
  averagePaymentTiming: number; // days early/late
  paymentConsistency: number;
  largestPayment: number;
  smallestPayment: number;
  paymentTrends: TrendAnalysis;
}

export interface DebtUtilizationAnalysis {
  creditUtilizationRatio: number;
  utilizationTrend: 'improving' | 'stable' | 'worsening';
  utilizationHistory: UtilizationDataPoint[];
  creditScoreImpact: number;
  optimalUtilization: number;
}

export interface ConsolidationOpportunity {
  id: string;
  description: string;
  debtsToConsolidate: string[];
  potentialSavings: number;
  newInterestRate: number;
  newMonthlyPayment: number;
  payoffAcceleration: number;
  riskLevel: 'low' | 'medium' | 'high';
  requirements: string[];
}

export interface RewardAnalytics {
  totalPointsEarned: number;
  currentPoints: number;
  pointsRedeemed: number;
  cashRewardsEarned: number;
  currentLevel: number;
  levelsGained: number;
  badgesEarned: number;
  achievementsUnlocked: number;
  motivationScore: number;
  rewardEffectiveness: number;
  pointsPerDollarPaid: number;
  streakAnalysis: StreakAnalysis;
  milestoneProgress: MilestoneProgress[];
}

export interface StreakAnalysis {
  currentStreak: number;
  longestStreak: number;
  streakBreaks: number;
  averageStreakLength: number;
  streakImpactOnPayments: number;
  streakMotivationScore: number;
}

export interface MilestoneProgress {
  milestoneId: string;
  title: string;
  targetValue: number;
  currentValue: number;
  progressPercentage: number;
  projectedCompletionDate: Date;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface AutomationAnalytics {
  automationEnabled: boolean;
  automationEffectiveness: number;
  scheduledPayments: number;
  executedPayments: number;
  failedPayments: number;
  automationReliability: number;
  timesSaved: number; // hours
  paymentOptimizationScore: number;
  automatedSavings: number;
  manualInterventions: number;
  automationROI: number;
}

export interface BehavioralAnalytics {
  personalityType: string;
  behaviorConsistency: number;
  spendingTriggerFrequency: number;
  nudgeEffectiveness: number;
  behaviorChangeScore: number;
  impulseControlImprovement: number;
  financialHabitsScore: number;
  stressIndicators: number;
  positiveHabitsFormed: number;
  behavioralRiskScore: number;
}

export interface EducationAnalytics {
  modulesCompleted: number;
  lessonsCompleted: number;
  quizzesTaken: number;
  averageQuizScore: number;
  timeSpentLearning: number; // hours
  knowledgeRetentionScore: number;
  learningVelocity: number;
  educationImpactScore: number;
  certificatesEarned: number;
  skillsAcquired: string[];
}

export interface SocialAnalytics {
  communityEngagement: number;
  helpfulnessScore: number;
  socialInfluence: number;
  groupParticipation: number;
  challengesCompleted: number;
  supportProvided: number;
  socialMotivationImpact: number;
  networkSize: number;
  reputationScore: number;
}

export interface PredictiveInsights {
  debtFreeDate: Date;
  debtFreeDateConfidence: number;
  projectedTotalInterest: number;
  cashFlowProjections: CashFlowProjection[];
  riskEvents: RiskEvent[];
  opportunityWindows: OpportunityWindow[];
  scenarioAnalysis: ScenarioAnalysis[];
  behaviorPredictions: BehaviorPrediction[];
}

export interface CashFlowProjection {
  month: Date;
  projectedIncome: number;
  projectedExpenses: number;
  projectedDebtPayment: number;
  projectedSavings: number;
  netCashFlow: number;
  confidence: number;
}

export interface RiskEvent {
  id: string;
  type: 'income_loss' | 'expense_spike' | 'rate_increase' | 'market_volatility' | 'health_emergency';
  probability: number;
  impact: number;
  potentialCost: number;
  mitigationStrategies: string[];
  timeframe: string;
}

export interface OpportunityWindow {
  id: string;
  type: 'refinance' | 'extra_payment' | 'consolidation' | 'investment' | 'income_boost';
  opportunity: string;
  potentialSaving: number;
  effort: 'low' | 'medium' | 'high';
  timeframe: string;
  requirements: string[];
}

export interface ScenarioAnalysis {
  scenarioName: string;
  description: string;
  variables: Record<string, number>;
  projectedOutcome: {
    debtFreeDate: Date;
    totalInterestPaid: number;
    totalSavings: number;
    monthlyPaymentChange: number;
  };
  probability: number;
  recommendation: string;
}

export interface BehaviorPrediction {
  behavior: string;
  likelihood: number;
  impact: 'positive' | 'negative' | 'neutral';
  interventionSuggestions: string[];
  confidenceLevel: number;
}

export interface GoalTracking {
  primaryGoals: Goal[];
  secondaryGoals: Goal[];
  completedGoals: Goal[];
  goalAchievementRate: number;
  averageGoalCompletionTime: number;
  goalMotivationImpact: number;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  type: 'debt_reduction' | 'savings' | 'education' | 'behavioral' | 'social';
  targetValue: number;
  currentValue: number;
  progressPercentage: number;
  targetDate: Date;
  priority: 'low' | 'medium' | 'high';
  status: 'not_started' | 'in_progress' | 'completed' | 'paused' | 'cancelled';
  milestones: GoalMilestone[];
  createdDate: Date;
  lastUpdated: Date;
}

export interface GoalMilestone {
  id: string;
  title: string;
  targetValue: number;
  completed: boolean;
  completedDate?: Date;
  reward?: string;
}

export interface RiskAssessment {
  overallRiskScore: number;
  riskLevel: 'very_low' | 'low' | 'medium' | 'high' | 'very_high';
  riskFactors: RiskFactor[];
  mitigationStrategies: MitigationStrategy[];
  riskTrends: RiskTrend[];
  emergencyRecommendations: string[];
}

export interface RiskFactor {
  id: string;
  category: 'financial' | 'behavioral' | 'market' | 'personal' | 'technical';
  risk: string;
  severity: number;
  probability: number;
  impact: string;
  mitigated: boolean;
}

export interface MitigationStrategy {
  id: string;
  riskFactorId: string;
  strategy: string;
  effectiveness: number;
  cost: number;
  timeToImplement: string;
  priority: 'low' | 'medium' | 'high';
}

export interface RiskTrend {
  riskFactorId: string;
  trend: 'improving' | 'stable' | 'worsening';
  trendData: TrendDataPoint[];
  projectedDirection: 'better' | 'same' | 'worse';
}

export interface AnalyticsRecommendation {
  id: string;
  category: 'debt' | 'savings' | 'automation' | 'behavior' | 'education' | 'social';
  type: 'immediate' | 'short_term' | 'long_term';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  expectedBenefit: string;
  effort: 'low' | 'medium' | 'high';
  timeline: string;
  successProbability: number;
  potentialSaving: number;
  steps: string[];
  metrics: string[];
}

export interface ComparativeAnalysis {
  peerComparison: PeerComparison;
  industryBenchmarks: IndustryBenchmarks;
  historicalComparison: HistoricalComparison;
  goalVsActual: GoalVsActualAnalysis;
}

export interface PeerComparison {
  userRank: number;
  totalUsers: number;
  percentile: number;
  metrics: {
    debtReduction: { user: number; peer: number; percentile: number };
    paymentConsistency: { user: number; peer: number; percentile: number };
    timeToDebtFree: { user: number; peer: number; percentile: number };
    interestSavings: { user: number; peer: number; percentile: number };
  };
}

export interface IndustryBenchmarks {
  averageDebtAmount: number;
  averagePayoffTime: number;
  averageInterestRate: number;
  successRate: number;
  commonChallenges: string[];
  bestPractices: string[];
}

export interface HistoricalComparison {
  performanceImprovement: number;
  consistencyImprovement: number;
  efficiencyGains: number;
  milestoneAcceleration: number;
  trendAnalysis: TrendAnalysis;
}

export interface GoalVsActualAnalysis {
  goalAchievementRate: number;
  averageVariance: number;
  consistentOverPerformance: boolean;
  consistentUnderPerformance: boolean;
  adjustmentRecommendations: string[];
}

export interface TrendAnalysis {
  trend: 'improving' | 'stable' | 'declining';
  trendStrength: number;
  seasonality: boolean;
  cyclicalPattern: boolean;
  dataPoints: TrendDataPoint[];
  forecast: ForecastPoint[];
}

export interface TrendDataPoint {
  date: Date;
  value: number;
  label: string;
  metadata?: Record<string, any>;
}

export interface ForecastPoint {
  date: Date;
  value: number;
  confidence: number;
  upperBound: number;
  lowerBound: number;
}

export interface UtilizationDataPoint {
  date: Date;
  utilizationRatio: number;
  creditLimit: number;
  balanceUsed: number;
}

export interface DashboardWidget {
  id: string;
  title: string;
  type: 'metric' | 'chart' | 'table' | 'progress' | 'alert' | 'recommendation';
  size: 'small' | 'medium' | 'large' | 'full';
  data: any;
  config: {
    refreshRate?: number;
    interactive?: boolean;
    exportable?: boolean;
    alertThreshold?: number;
    displayFormat?: string;
  };
  position: {
    row: number;
    column: number;
    width: number;
    height: number;
  };
  isVisible: boolean;
  lastUpdated: Date;
}

export interface AnalyticsFilter {
  dateRange: {
    start: Date;
    end: Date;
    preset?: 'last_week' | 'last_month' | 'last_quarter' | 'last_year' | 'ytd' | 'all_time';
  };
  categories: string[];
  metrics: string[];
  comparison: {
    enabled: boolean;
    type: 'period' | 'peer' | 'goal';
    baseline?: Date;
  };
  aggregation: 'daily' | 'weekly' | 'monthly' | 'quarterly';
}