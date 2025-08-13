import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Mock external services for testing
jest.mock('../services/flinkIntegration', () => ({
  FlinkBankingService: jest.fn().mockImplementation(() => ({
    connectBankAccount: jest.fn().mockResolvedValue({
      success: true,
      linkToken: 'mock_link_token_123'
    }),
    getAccountData: jest.fn().mockResolvedValue({
      accounts: [
        {
          id: 'acc_123',
          name: 'Test Checking',
          type: 'depository',
          balance: 5000
        }
      ],
      transactions: []
    })
  }))
}));

jest.mock('stripe', () => ({
  Stripe: jest.fn().mockImplementation(() => ({
    customers: {
      create: jest.fn().mockResolvedValue({ id: 'cus_test123' })
    },
    paymentIntents: {
      create: jest.fn().mockResolvedValue({ id: 'pi_test123' })
    }
  }))
}));

// Global test utilities
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};