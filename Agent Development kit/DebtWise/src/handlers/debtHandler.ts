import { Request, Response } from 'express';
// Temporarily disabled AI imports while fixing Genkit integration
// import { runFlow } from '@genkit-ai/flow';
// import { debtAnalysisFlow } from '../agent/debtAdvisor';

export class DebtHandler {
  
  async analyzeDebts(req: Request, res: Response) {
    try {
      const { userProfile, debts, userGoals } = req.body;
      
      // Validate input
      if (!userProfile || !debts || !Array.isArray(debts)) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: userProfile and debts array'
        });
      }

      // Calculate available amount for debt payment
      const availableAmount = Math.max(0, userProfile.monthlyIncome - userProfile.monthlyExpenses);
      
      if (availableAmount <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Income must be greater than expenses to create a debt payoff plan'
        });
      }

      // Temporarily using fallback calculation while AI integration is being fixed
      console.log('Using fallback calculation for debt analysis');
      const result = this.createFallbackAnalysis(debts, availableAmount);
      
      // TODO: Re-enable AI analysis once Genkit issues are resolved
      // try {
      //   result = await runFlow(debtAnalysisFlow, {
      //     userProfile,
      //     debts,
      //     availableAmount,
      //     userGoals: userGoals || ''
      //   });
      // } catch (error: any) {
      //   console.log('AI analysis failed, using fallback calculation:', error.message);
      //   result = this.createFallbackAnalysis(debts, availableAmount);
      // }

      res.json({
        success: true,
        data: {
          strategy: result.strategy,
          payoffStrategies: result.payoffStrategies,
          recommendations: result.recommendations,
          motivationalMessage: result.motivationalMessage,
          nextSteps: result.nextSteps,
          availableAmount,
          totalDebt: debts.reduce((sum: number, debt: any) => sum + debt.balance, 0),
          minimumPayments: debts.reduce((sum: number, debt: any) => sum + debt.minimumPayment, 0)
        }
      });
      
    } catch (error: any) {
      console.error('Error in debt analysis:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to analyze debts',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  async getTestData(req: Request, res: Response) {
    try {
      // Provide sample data for testing
      const sampleData = {
        userProfile: {
          monthlyIncome: 5000,
          monthlyExpenses: 3500,
          riskTolerance: 'moderate'
        },
        debts: [
          {
            name: 'Credit Card 1',
            balance: 5000,
            interestRate: 0.18,
            minimumPayment: 150
          },
          {
            name: 'Credit Card 2',
            balance: 3200,
            interestRate: 0.22,
            minimumPayment: 96
          },
          {
            name: 'Personal Loan',
            balance: 8000,
            interestRate: 0.12,
            minimumPayment: 200
          }
        ],
        userGoals: 'I want to be debt-free as quickly as possible while maintaining my current lifestyle.'
      };

      res.json({
        success: true,
        data: sampleData,
        message: 'Sample debt data for testing purposes'
      });
    } catch (error) {
      console.error('Error getting test data:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get test data'
      });
    }
  }

  async calculatePayoffProjection(req: Request, res: Response) {
    try {
      const { debts, monthlyPayment, strategy = 'avalanche' } = req.body;

      if (!debts || !monthlyPayment) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: debts and monthlyPayment'
        });
      }

      // Simple projection calculation
      const projection = this.calculateSimpleProjection(debts, monthlyPayment, strategy);

      res.json({
        success: true,
        data: projection
      });
    } catch (error) {
      console.error('Error calculating projection:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to calculate payoff projection'
      });
    }
  }

  private createFallbackAnalysis(debts: any[], availableAmount: number) {
    const totalDebt = debts.reduce((sum: number, debt: any) => sum + debt.balance, 0);
    const avalancheStrategy = this.calculateSimpleProjection(debts, availableAmount, 'avalanche');
    const snowballStrategy = this.calculateSimpleProjection(debts, availableAmount, 'snowball');
    
    return {
      strategy: `Based on your financial situation with $${availableAmount} available monthly, I recommend focusing on the debt avalanche method to minimize interest costs. You're in a good position to tackle your $${totalDebt.toLocaleString()} debt systematically.`,
      payoffStrategies: [
        {
          name: 'Debt Avalanche',
          type: 'avalanche',
          monthsToPayoff: avalancheStrategy.monthsToPayoff,
          totalInterestPaid: avalancheStrategy.totalInterestPaid,
          monthlyPayment: availableAmount,
          description: 'Pay minimums on all debts, then put extra money toward highest interest rate debt first. Saves the most money on interest.'
        },
        {
          name: 'Debt Snowball',
          type: 'snowball',
          monthsToPayoff: snowballStrategy.monthsToPayoff,
          totalInterestPaid: snowballStrategy.totalInterestPaid,
          monthlyPayment: availableAmount,
          description: 'Pay minimums on all debts, then put extra money toward smallest balance first. Provides psychological wins and motivation.'
        }
      ],
      recommendations: [
        'Set up automatic payments for minimum amounts to avoid late fees',
        'Allocate your extra $' + (availableAmount - debts.reduce((sum: number, debt: any) => sum + debt.minimumPayment, 0)) + ' to your chosen strategy',
        'Consider increasing your monthly payment when possible',
        'Track your progress monthly to stay motivated'
      ],
      motivationalMessage: `You're taking control of your financial future! With $${availableAmount} available each month, you have the power to become debt-free. Every payment brings you closer to financial freedom.`,
      nextSteps: [
        'Choose between avalanche (save more money) or snowball (quick wins) method',
        'Set up automatic minimum payments on all debts',
        'Allocate extra funds to your target debt',
        'Review and adjust your strategy quarterly'
      ]
    };
  }

  private calculateSimpleProjection(debts: any[], monthlyPayment: number, strategy: string) {
    const totalDebt = debts.reduce((sum, debt) => sum + debt.balance, 0);
    const totalMinPayments = debts.reduce((sum, debt) => sum + debt.minimumPayment, 0);
    const extraPayment = Math.max(0, monthlyPayment - totalMinPayments);
    
    // Simplified calculation for demo purposes
    const avgInterestRate = debts.reduce((sum, debt) => sum + debt.interestRate, 0) / debts.length;
    const monthsToPayoff = Math.ceil(
      Math.log(1 + (totalDebt * avgInterestRate) / monthlyPayment) / 
      Math.log(1 + avgInterestRate)
    );
    
    const totalInterestPaid = (monthsToPayoff * monthlyPayment) - totalDebt;
    
    return {
      monthsToPayoff: Math.max(1, monthsToPayoff),
      totalInterestPaid: Math.max(0, totalInterestPaid),
      payoffDate: new Date(Date.now() + monthsToPayoff * 30 * 24 * 60 * 60 * 1000),
      monthlySavings: extraPayment,
      strategy
    };
  }
}