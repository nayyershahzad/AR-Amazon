export interface AutomationSettings {
  id: string;
  userId: string;
  enabled: boolean;
  automationLevel: 'manual' | 'semi-auto' | 'full-auto';
  maxMonthlyPayment: number;
  minBufferAmount: number; // Minimum to keep in checking account
  paymentStrategy: 'avalanche' | 'snowball' | 'custom';
  paymentTiming: 'optimal' | 'fixed' | 'flexible';
  notifications: NotificationSettings;
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationSettings {
  paymentReminders: boolean;
  paymentConfirmations: boolean;
  lowBalanceAlerts: boolean;
  optimizationSuggestions: boolean;
  weeklyReports: boolean;
  email: boolean;
  push: boolean;
  sms: boolean;
}

export interface ScheduledPayment {
  id: string;
  userId: string;
  debtId: string;
  amount: number;
  scheduledDate: Date;
  executionDate?: Date;
  status: 'pending' | 'scheduled' | 'executed' | 'failed' | 'cancelled';
  paymentType: 'minimum' | 'extra' | 'strategic';
  automationTriggered: boolean;
  expectedInterestSavings: number;
  rewardPointsEarned?: number;
  failureReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentOptimization {
  debtId: string;
  currentBalance: number;
  suggestedAmount: number;
  minimumPayment: number;
  interestRate: number;
  priority: number;
  reasoning: string;
  potentialInterestSavings: number;
  payoffAcceleration: number; // months saved
}

export interface AutomationPlan {
  userId: string;
  totalMonthlyPayment: number;
  optimizedPayments: PaymentOptimization[];
  scheduledDates: Date[];
  projectedOutcomes: {
    monthsToDebtFree: number;
    totalInterestSaved: number;
    rewardPointsEarned: number;
    cashRewardsEarned: number;
  };
  riskAssessment: {
    level: 'low' | 'medium' | 'high';
    factors: string[];
    recommendations: string[];
  };
  requiresConfirmation: boolean;
}

export interface CashFlowAnalysis {
  userId: string;
  monthlyIncome: number;
  monthlyExpenses: number;
  averageBalance: number;
  balanceHistory: BalanceSnapshot[];
  spendingPatterns: SpendingPattern[];
  incomeStability: 'stable' | 'variable' | 'irregular';
  expenseVariability: number;
  safePaymentAmount: number;
  optimalPaymentAmount: number;
  riskFactors: string[];
}

export interface BalanceSnapshot {
  date: Date;
  balance: number;
  accountType: 'checking' | 'savings' | 'credit';
}

export interface SpendingPattern {
  category: string;
  averageAmount: number;
  frequency: 'daily' | 'weekly' | 'monthly' | 'irregular';
  timing: string[]; // e.g., ['1st', '15th'] for monthly
  variability: number;
}

export interface AutomationRule {
  id: string;
  userId: string;
  name: string;
  condition: string;
  action: string;
  priority: number;
  enabled: boolean;
  lastTriggered?: Date;
  triggerCount: number;
}