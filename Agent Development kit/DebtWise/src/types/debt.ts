export interface UserProfile {
  id: string;
  email: string;
  name: string;
  monthlyIncome: number;
  monthlyExpenses: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Debt {
  id: string;
  userId: string;
  name: string;
  balance: number;
  interestRate: number;
  minimumPayment: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentRecord {
  id: string;
  debtId: string;
  amount: number;
  date: Date;
  type: 'manual' | 'automated';
  rewardPointsEarned: number;
}

export interface DebtPsychology {
  spendingTriggers: string[];
  motivationType: 'visual' | 'social' | 'milestone' | 'competitive';
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  preferredRewardType: 'cash' | 'points' | 'achievements' | 'social_recognition';
}

export interface Milestone {
  id: string;
  debtId: string;
  type: 'balance_reduction' | 'payment_streak' | 'total_paid';
  target: number;
  current: number;
  reward: number;
  achieved: boolean;
  achievedAt?: Date;
}

export interface SocialSettings {
  enabled: boolean;
  shareProgress: boolean;
  shareMilestones: boolean;
}

export interface SmartDebt extends Debt {
  automationEnabled: boolean;
  paymentHistory: PaymentRecord[];
  psychologyProfile: DebtPsychology;
  rewardPoints: number;
  milestones: Milestone[];
  socialSharing: SocialSettings;
}

export interface Achievement {
  id: string;
  userId: string;
  type: string;
  title: string;
  description: string;
  pointsAwarded: number;
  unlockedAt: Date;
}

export interface RewardSystem {
  userId: string;
  totalPoints: number;
  cashEarned: number;
  achievements: Achievement[];
  streaks: {
    paymentStreak: number;
    learningStreak: number;
    savingsStreak: number;
  };
  level: number;
  nextLevelRequirement: number;
}

export interface PayoffStrategy {
  name: string;
  type: 'avalanche' | 'snowball' | 'custom';
  monthsToPayoff: number;
  totalInterestPaid: number;
  monthlyPayment: number;
  paymentOrder: string[];
}

export interface SmartStrategy extends PayoffStrategy {
  automationLevel: 'manual' | 'semi-auto' | 'full-auto';
  rewardPredictions: RewardProjection[];
  behavioralNudges: BehavioralNudge[];
  socialFeatures: SocialFeature[];
  educationModules: EducationModule[];
}

export interface RewardProjection {
  month: number;
  pointsEarned: number;
  cashValue: number;
  milestoneBonus: number;
}

export interface BehavioralNudge {
  id: string;
  type: 'spending_alert' | 'payment_reminder' | 'motivation' | 'education';
  trigger: string;
  message: string;
  rewardPoints: number;
  frequency: 'daily' | 'weekly' | 'monthly' | 'event-based';
}

export interface SocialFeature {
  id: string;
  type: 'challenge' | 'leaderboard' | 'peer_support';
  title: string;
  description: string;
  participants: number;
  reward: number;
}

export interface EducationModule {
  id: string;
  title: string;
  description: string;
  duration: number;
  pointsReward: number;
  prerequisiteModules: string[];
  completed: boolean;
}

export interface CreditLineOffer {
  id: string;
  provider: string;
  amount: number;
  apr: number;
  terms: string[];
  eligibilityScore: number;
  projectedSavings: number;
}