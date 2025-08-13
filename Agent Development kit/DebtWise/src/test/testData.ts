import { SmartDebt, UserProfile, DebtPsychology } from '../types/debt';

export const mockUserProfile: UserProfile = {
  id: 'user_123',
  email: 'test@example.com',
  name: 'Test User',
  monthlyIncome: 5000,
  monthlyExpenses: 3500,
  createdAt: new Date(),
  updatedAt: new Date()
};

export const mockDebtPsychology: DebtPsychology = {
  spendingTriggers: ['stress', 'social_events'],
  motivationType: 'milestone',
  riskTolerance: 'moderate',
  preferredRewardType: 'cash'
};

export const mockDebts: SmartDebt[] = [
  {
    id: 'debt_1',
    userId: 'user_123',
    name: 'Credit Card 1',
    balance: 5000,
    interestRate: 0.18,
    minimumPayment: 150,
    automationEnabled: false,
    paymentHistory: [],
    psychologyProfile: mockDebtPsychology,
    rewardPoints: 0,
    milestones: [],
    socialSharing: {
      enabled: false,
      shareProgress: false,
      shareMilestones: true
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'debt_2',
    userId: 'user_123',
    name: 'Credit Card 2',
    balance: 3200,
    interestRate: 0.22,
    minimumPayment: 96,
    automationEnabled: true,
    paymentHistory: [],
    psychologyProfile: mockDebtPsychology,
    rewardPoints: 45,
    milestones: [],
    socialSharing: {
      enabled: true,
      shareProgress: true,
      shareMilestones: true
    },
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export const mockBankAccount = {
  id: 'acc_123',
  name: 'Test Checking Account',
  type: 'depository',
  balance: 2500,
  accountNumber: '****1234',
  routingNumber: '123456789'
};

export const mockTransactions = [
  {
    id: 'txn_1',
    amount: -3000,
    description: 'Salary Deposit',
    date: '2024-01-15',
    category: 'income'
  },
  {
    id: 'txn_2',
    amount: 150,
    description: 'Credit Card Payment',
    date: '2024-01-10',
    category: 'payment'
  }
];