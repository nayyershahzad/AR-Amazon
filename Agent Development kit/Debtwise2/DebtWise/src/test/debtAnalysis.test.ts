import { DebtHandler } from '../handlers/debtHandler';
import { mockUserProfile, mockDebts } from './testData';

describe('DebtHandler', () => {
  let debtHandler: DebtHandler;

  beforeEach(() => {
    debtHandler = new DebtHandler();
  });

  describe('calculatePayoffProjection', () => {
    it('should calculate basic payoff projection', () => {
      const testDebts = [
        { name: 'Credit Card', balance: 1000, interestRate: 0.18, minimumPayment: 50 }
      ];
      const monthlyPayment = 200;
      
      // Access the private method for testing via type assertion
      const projection = (debtHandler as any).calculateSimpleProjection(
        testDebts, 
        monthlyPayment, 
        'avalanche'
      );

      expect(projection).toHaveProperty('monthsToPayoff');
      expect(projection).toHaveProperty('totalInterestPaid');
      expect(projection).toHaveProperty('payoffDate');
      expect(projection.monthsToPayoff).toBeGreaterThan(0);
      expect(projection.totalInterestPaid).toBeGreaterThanOrEqual(0);
    });

    it('should handle zero extra payment scenario', () => {
      const testDebts = [
        { name: 'Credit Card', balance: 1000, interestRate: 0.18, minimumPayment: 50 }
      ];
      const monthlyPayment = 50; // Only minimum payment
      
      const projection = (debtHandler as any).calculateSimpleProjection(
        testDebts, 
        monthlyPayment, 
        'avalanche'
      );

      expect(projection.monthsToPayoff).toBeGreaterThan(12); // Should take longer with minimum payments
    });
  });
});

describe('Debt Calculation Utilities', () => {
  it('should calculate total debt correctly', () => {
    const totalDebt = mockDebts.reduce((sum, debt) => sum + debt.balance, 0);
    expect(totalDebt).toBe(8200); // 5000 + 3200
  });

  it('should calculate total minimum payments', () => {
    const totalMinimums = mockDebts.reduce((sum, debt) => sum + debt.minimumPayment, 0);
    expect(totalMinimums).toBe(246); // 150 + 96
  });

  it('should calculate available amount for debt payment', () => {
    const availableAmount = mockUserProfile.monthlyIncome - mockUserProfile.monthlyExpenses;
    expect(availableAmount).toBe(1500); // 5000 - 3500
  });
});