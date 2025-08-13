export interface BehavioralProfile {
  userId: string;
  personalityType: 'spender' | 'saver' | 'balanced' | 'impulsive' | 'analytical';
  motivationType: 'visual' | 'social' | 'milestone' | 'competitive' | 'educational';
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  spendingTriggers: SpendingTrigger[];
  paymentPatterns: PaymentPattern[];
  engagementPreferences: EngagementPreference[];
  stressIndicators: StressIndicator[];
  successFactors: SuccessFactor[];
  lastAnalyzed: Date;
  confidenceScore: number; // 0-100, how confident we are in this profile
}

export interface SpendingTrigger {
  id: string;
  type: 'emotional' | 'temporal' | 'situational' | 'social';
  trigger: string;
  frequency: number;
  averageAmount: number;
  timePattern: string; // e.g., "weekends", "evenings", "payday"
  confidence: number;
  lastOccurrence: Date;
}

export interface PaymentPattern {
  id: string;
  type: 'consistent' | 'irregular' | 'stress-driven' | 'deadline-driven';
  frequency: 'daily' | 'weekly' | 'bi-weekly' | 'monthly';
  timing: string; // e.g., "1st of month", "after payday"
  reliability: number; // 0-100
  averageAmount: number;
  emotionalState: 'positive' | 'neutral' | 'negative';
}

export interface EngagementPreference {
  channel: 'push' | 'email' | 'sms' | 'in-app' | 'social';
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  frequency: 'daily' | 'weekly' | 'bi-weekly' | 'monthly';
  messageType: 'motivational' | 'educational' | 'reminder' | 'celebration';
  effectiveness: number; // 0-100 based on response rates
}

export interface StressIndicator {
  id: string;
  type: 'financial' | 'behavioral' | 'temporal' | 'social';
  indicator: string;
  severity: 'low' | 'medium' | 'high';
  impact: string;
  detectedAt: Date;
  resolved: boolean;
}

export interface SuccessFactor {
  id: string;
  factor: string;
  type: 'internal' | 'external' | 'social' | 'financial';
  importance: number; // 0-100
  currentLevel: number; // 0-100
  improvement: string;
}

export interface BehavioralNudge {
  id: string;
  userId: string;
  type: 'spending_prevention' | 'payment_motivation' | 'habit_formation' | 'goal_reinforcement';
  trigger: NudgeTrigger;
  content: NudgeContent;
  timing: NudgeTiming;
  personalization: NudgePersonalization;
  status: 'pending' | 'sent' | 'viewed' | 'acted_upon' | 'dismissed' | 'expired';
  effectiveness: number;
  createdAt: Date;
  sentAt?: Date;
  viewedAt?: Date;
  actedAt?: Date;
}

export interface NudgeTrigger {
  event: string;
  condition: string;
  threshold?: number;
  timeframe?: string;
}

export interface NudgeContent {
  title: string;
  message: string;
  actionText?: string;
  actionUrl?: string;
  imageUrl?: string;
  priority: 'low' | 'medium' | 'high';
  emotionalTone: 'encouraging' | 'warning' | 'celebratory' | 'educational';
}

export interface NudgeTiming {
  deliveryTime: Date;
  expiresAt: Date;
  optimalWindow: {
    start: string; // e.g., "09:00"
    end: string;   // e.g., "11:00"
  };
  timezone: string;
  daysOfWeek: number[]; // 0=Sunday, 1=Monday, etc.
}

export interface NudgePersonalization {
  userName: string;
  currentStreak: number;
  nextMilestone: string;
  personalizedAmount?: number;
  contextualData: Record<string, any>;
}

export interface BehavioralInsight {
  id: string;
  userId: string;
  type: 'spending_pattern' | 'payment_behavior' | 'motivation_trend' | 'risk_factor' | 'opportunity';
  title: string;
  description: string;
  impact: 'positive' | 'negative' | 'neutral';
  severity: 'low' | 'medium' | 'high';
  confidence: number;
  recommendations: string[];
  metrics: Record<string, number>;
  trendData: TrendDataPoint[];
  discoveredAt: Date;
  actionable: boolean;
}

export interface TrendDataPoint {
  date: Date;
  value: number;
  label: string;
}

export interface NudgeTemplate {
  id: string;
  name: string;
  type: string;
  category: 'motivation' | 'prevention' | 'education' | 'celebration';
  template: string;
  variables: string[];
  effectiveness: number;
  usageCount: number;
  targetPersonalities: string[];
  targetMotivations: string[];
}

export interface BehavioralExperiment {
  id: string;
  name: string;
  description: string;
  hypothesis: string;
  variants: ExperimentVariant[];
  targetUsers: string[];
  startDate: Date;
  endDate: Date;
  status: 'draft' | 'running' | 'completed' | 'paused';
  metrics: ExperimentMetrics;
}

export interface ExperimentVariant {
  id: string;
  name: string;
  description: string;
  nudgeTemplate: string;
  allocation: number; // percentage
  results: {
    views: number;
    clicks: number;
    conversions: number;
    engagementRate: number;
  };
}

export interface ExperimentMetrics {
  primaryMetric: string;
  secondaryMetrics: string[];
  results: Record<string, number>;
  significance: number;
  confidence: number;
}