import { AutomationSettings, ScheduledPayment, PaymentOptimization, AutomationPlan, CashFlowAnalysis } from '../types/automation';
import { SmartDebt } from '../types/debt';
import { RewardSystemService } from './rewardSystem';

export class AutomationService {
  // In-memory storage for demo (in real app, use database)
  private static automationSettings: Map<string, AutomationSettings> = new Map();
  private static scheduledPayments: Map<string, ScheduledPayment[]> = new Map();

  /**
   * Create or update automation settings for a user
   */
  static async setupAutomation(userId: string, settings: Partial<AutomationSettings>): Promise<AutomationSettings> {
    const defaultSettings: AutomationSettings = {
      id: `automation_${userId}_${Date.now()}`,
      userId,
      enabled: true,
      automationLevel: 'semi-auto',
      maxMonthlyPayment: 1000,
      minBufferAmount: 500,
      paymentStrategy: 'avalanche',
      paymentTiming: 'optimal',
      notifications: {
        paymentReminders: true,
        paymentConfirmations: true,
        lowBalanceAlerts: true,
        optimizationSuggestions: true,
        weeklyReports: true,
        email: true,
        push: true,
        sms: false
      },
      riskTolerance: 'moderate',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const automationConfig = { ...defaultSettings, ...settings };
    this.automationSettings.set(userId, automationConfig);

    // Award points for setting up automation
    await RewardSystemService.awardPoints(userId, 'automation_setup', {
      automationLevel: automationConfig.automationLevel
    });

    return automationConfig;
  }

  /**
   * Analyze cash flow patterns to determine safe payment amounts
   */
  static async analyzeCashFlow(userId: string, bankData?: any): Promise<CashFlowAnalysis> {
    // In a real app, this would integrate with banking APIs
    // For demo, we'll simulate realistic cash flow analysis
    
    const mockAnalysis: CashFlowAnalysis = {
      userId,
      monthlyIncome: 5000,
      monthlyExpenses: 3200,
      averageBalance: 2800,
      balanceHistory: this.generateMockBalanceHistory(),
      spendingPatterns: this.generateMockSpendingPatterns(),
      incomeStability: 'stable',
      expenseVariability: 0.15, // 15% variation
      safePaymentAmount: 1200, // Conservative amount
      optimalPaymentAmount: 1500, // Optimal amount considering patterns
      riskFactors: []
    };

    // Assess risk factors
    if (mockAnalysis.averageBalance < mockAnalysis.monthlyExpenses) {
      mockAnalysis.riskFactors.push('Low cash reserves');
    }
    if (mockAnalysis.expenseVariability > 0.2) {
      mockAnalysis.riskFactors.push('High spending variability');
    }

    return mockAnalysis;
  }

  /**
   * Generate optimized payment plan for user's debts
   */
  static async generatePaymentPlan(
    userId: string,
    debts: SmartDebt[],
    availableAmount: number,
    strategy: 'avalanche' | 'snowball' | 'custom' = 'avalanche'
  ): Promise<AutomationPlan> {
    const cashFlow = await this.analyzeCashFlow(userId);
    const safeAmount = Math.min(availableAmount, cashFlow.safePaymentAmount);
    
    // Calculate optimized payments based on strategy
    const optimizedPayments = this.calculateOptimizedPayments(debts, safeAmount, strategy);
    
    // Determine optimal scheduling dates
    const scheduledDates = this.calculateOptimalPaymentDates(cashFlow);
    
    // Project outcomes
    const projectedOutcomes = this.projectOutcomes(debts, optimizedPayments);
    
    // Assess risks
    const riskAssessment = this.assessAutomationRisk(cashFlow, safeAmount, debts);

    const plan: AutomationPlan = {
      userId,
      totalMonthlyPayment: safeAmount,
      optimizedPayments,
      scheduledDates,
      projectedOutcomes,
      riskAssessment,
      requiresConfirmation: riskAssessment.level === 'high' || safeAmount > availableAmount * 0.8
    };

    return plan;
  }

  /**
   * Schedule payments based on automation plan
   */
  static async schedulePayments(userId: string, plan: AutomationPlan): Promise<ScheduledPayment[]> {
    const payments: ScheduledPayment[] = [];
    const currentDate = new Date();

    for (const optimization of plan.optimizedPayments) {
      // Find the next optimal payment date
      const nextPaymentDate = this.findNextPaymentDate(plan.scheduledDates, currentDate);
      
      const payment: ScheduledPayment = {
        id: `payment_${userId}_${optimization.debtId}_${Date.now()}`,
        userId,
        debtId: optimization.debtId,
        amount: optimization.suggestedAmount,
        scheduledDate: nextPaymentDate,
        status: 'scheduled',
        paymentType: optimization.suggestedAmount > optimization.minimumPayment ? 'strategic' : 'minimum',
        automationTriggered: true,
        expectedInterestSavings: optimization.potentialInterestSavings,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      payments.push(payment);
    }

    // Store scheduled payments
    this.scheduledPayments.set(userId, payments);

    return payments;
  }

  /**
   * Execute a scheduled payment
   */
  static async executePayment(paymentId: string): Promise<{
    success: boolean;
    payment?: ScheduledPayment;
    rewardResult?: any;
    error?: string;
  }> {
    // Find the payment across all users
    let targetPayment: ScheduledPayment | undefined;
    let userId: string = '';

    for (const [uid, payments] of this.scheduledPayments.entries()) {
      const payment = payments.find(p => p.id === paymentId);
      if (payment) {
        targetPayment = payment;
        userId = uid;
        break;
      }
    }

    if (!targetPayment) {
      return { success: false, error: 'Payment not found' };
    }

    try {
      // Simulate payment execution
      const executionSuccess = Math.random() > 0.05; // 95% success rate

      if (executionSuccess) {
        targetPayment.status = 'executed';
        targetPayment.executionDate = new Date();

        // Award points for automated payment
        const rewardResult = await RewardSystemService.awardPoints(userId, 'payment', {
          amount: targetPayment.amount,
          isExtraPayment: targetPayment.paymentType === 'strategic',
          isAutomated: true
        });

        targetPayment.rewardPointsEarned = rewardResult.pointsEarned;

        return { 
          success: true, 
          payment: targetPayment, 
          rewardResult 
        };
      } else {
        targetPayment.status = 'failed';
        targetPayment.failureReason = 'Insufficient funds';
        return { 
          success: false, 
          payment: targetPayment, 
          error: 'Payment failed due to insufficient funds' 
        };
      }
    } catch (error: any) {
      targetPayment.status = 'failed';
      targetPayment.failureReason = error.message;
      return { 
        success: false, 
        payment: targetPayment, 
        error: error.message 
      };
    }
  }

  /**
   * Get automation status and upcoming payments for user
   */
  static async getAutomationStatus(userId: string): Promise<{
    settings: AutomationSettings | null;
    upcomingPayments: ScheduledPayment[];
    recentPayments: ScheduledPayment[];
    monthlyStats: {
      paymentsScheduled: number;
      paymentsExecuted: number;
      totalAmount: number;
      interestSaved: number;
      rewardPointsEarned: number;
    };
  }> {
    const settings = this.automationSettings.get(userId) || null;
    const allPayments = this.scheduledPayments.get(userId) || [];
    
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const upcomingPayments = allPayments.filter(p => 
      p.scheduledDate > now && p.status === 'scheduled'
    );
    
    const recentPayments = allPayments
      .filter(p => p.executionDate && p.executionDate >= monthStart)
      .sort((a, b) => (b.executionDate?.getTime() || 0) - (a.executionDate?.getTime() || 0));

    const monthlyStats = {
      paymentsScheduled: allPayments.filter(p => p.scheduledDate >= monthStart).length,
      paymentsExecuted: allPayments.filter(p => p.status === 'executed' && p.executionDate && p.executionDate >= monthStart).length,
      totalAmount: allPayments
        .filter(p => p.status === 'executed' && p.executionDate && p.executionDate >= monthStart)
        .reduce((sum, p) => sum + p.amount, 0),
      interestSaved: allPayments
        .filter(p => p.status === 'executed' && p.executionDate && p.executionDate >= monthStart)
        .reduce((sum, p) => sum + p.expectedInterestSavings, 0),
      rewardPointsEarned: allPayments
        .filter(p => p.status === 'executed' && p.executionDate && p.executionDate >= monthStart)
        .reduce((sum, p) => sum + (p.rewardPointsEarned || 0), 0)
    };

    return {
      settings,
      upcomingPayments,
      recentPayments,
      monthlyStats
    };
  }

  // Private helper methods

  private static calculateOptimizedPayments(
    debts: SmartDebt[],
    availableAmount: number,
    strategy: 'avalanche' | 'snowball' | 'custom'
  ): PaymentOptimization[] {
    const totalMinimums = debts.reduce((sum, debt) => sum + debt.minimumPayment, 0);
    const extraAmount = Math.max(0, availableAmount - totalMinimums);

    let sortedDebts: SmartDebt[];
    
    switch (strategy) {
      case 'avalanche':
        sortedDebts = [...debts].sort((a, b) => b.interestRate - a.interestRate);
        break;
      case 'snowball':
        sortedDebts = [...debts].sort((a, b) => a.balance - b.balance);
        break;
      default:
        sortedDebts = [...debts];
    }

    const optimizations: PaymentOptimization[] = [];
    let remainingExtra = extraAmount;

    sortedDebts.forEach((debt, index) => {
      const extraForThisDebt = index === 0 ? remainingExtra : 0; // Give all extra to highest priority
      const suggestedAmount = debt.minimumPayment + extraForThisDebt;
      
      // Calculate interest savings
      const monthlyInterestRate = debt.interestRate / 12;
      const interestSavings = extraForThisDebt * monthlyInterestRate;
      
      // Calculate payoff acceleration (simplified)
      const payoffAcceleration = extraForThisDebt > 0 ? 
        Math.max(1, Math.floor(extraForThisDebt / debt.minimumPayment)) : 0;

      optimizations.push({
        debtId: debt.id,
        currentBalance: debt.balance,
        suggestedAmount,
        minimumPayment: debt.minimumPayment,
        interestRate: debt.interestRate,
        priority: index + 1,
        reasoning: this.getPaymentReasoning(strategy, debt, extraForThisDebt > 0),
        potentialInterestSavings: interestSavings,
        payoffAcceleration
      });

      if (extraForThisDebt > 0) {
        remainingExtra = 0;
      }
    });

    return optimizations;
  }

  private static getPaymentReasoning(strategy: string, debt: SmartDebt, hasExtra: boolean): string {
    if (strategy === 'avalanche') {
      return hasExtra ? 
        `Highest interest rate (${(debt.interestRate * 100).toFixed(1)}%) - maximum interest savings` :
        'Minimum payment to avoid fees';
    } else if (strategy === 'snowball') {
      return hasExtra ? 
        `Smallest balance ($${debt.balance.toLocaleString()}) - quick psychological win` :
        'Minimum payment to avoid fees';
    }
    return 'Balanced approach based on your preferences';
  }

  private static calculateOptimalPaymentDates(cashFlow: CashFlowAnalysis): Date[] {
    // Determine optimal payment dates based on income patterns
    // For demo, we'll use 5th and 20th of each month
    const dates: Date[] = [];
    const currentDate = new Date();
    
    for (let month = 0; month < 12; month++) {
      const date1 = new Date(currentDate.getFullYear(), currentDate.getMonth() + month, 5);
      const date2 = new Date(currentDate.getFullYear(), currentDate.getMonth() + month, 20);
      dates.push(date1, date2);
    }

    return dates;
  }

  private static findNextPaymentDate(scheduledDates: Date[], currentDate: Date): Date {
    const futureDate = scheduledDates.find(date => date > currentDate);
    return futureDate || scheduledDates[0];
  }

  private static projectOutcomes(debts: SmartDebt[], optimizations: PaymentOptimization[]) {
    const totalDebt = debts.reduce((sum, debt) => sum + debt.balance, 0);
    const totalMonthlyPayment = optimizations.reduce((sum, opt) => sum + opt.suggestedAmount, 0);
    const weightedInterestRate = debts.reduce((sum, debt) => sum + (debt.balance * debt.interestRate), 0) / totalDebt;
    
    // Simplified calculation for months to debt free
    const monthsToDebtFree = Math.ceil(
      Math.log(1 + (totalDebt * weightedInterestRate) / totalMonthlyPayment) / 
      Math.log(1 + weightedInterestRate)
    );

    const totalInterestSaved = optimizations.reduce((sum, opt) => sum + opt.potentialInterestSavings, 0) * monthsToDebtFree;
    const rewardPointsEarned = monthsToDebtFree * 20; // Estimate based on monthly payments
    const cashRewardsEarned = rewardPointsEarned * 0.05;

    return {
      monthsToDebtFree: Math.max(1, monthsToDebtFree),
      totalInterestSaved,
      rewardPointsEarned,
      cashRewardsEarned
    };
  }

  private static assessAutomationRisk(cashFlow: CashFlowAnalysis, paymentAmount: number, debts: SmartDebt[]) {
    const riskFactors: string[] = [];
    let riskLevel: 'low' | 'medium' | 'high' = 'low';

    // Check payment to income ratio
    const paymentRatio = paymentAmount / cashFlow.monthlyIncome;
    if (paymentRatio > 0.4) {
      riskFactors.push('High payment to income ratio');
      riskLevel = 'high';
    } else if (paymentRatio > 0.25) {
      riskFactors.push('Moderate payment to income ratio');
      riskLevel = riskLevel === 'high' ? 'high' : 'medium';
    }

    // Check cash reserves
    if (cashFlow.averageBalance < cashFlow.monthlyExpenses) {
      riskFactors.push('Low cash reserves');
      riskLevel = 'high';
    }

    // Check spending variability
    if (cashFlow.expenseVariability > 0.25) {
      riskFactors.push('High spending variability');
      riskLevel = riskLevel === 'high' ? 'high' : 'medium';
    }

    const recommendations: string[] = [];
    if (riskLevel === 'high') {
      recommendations.push('Consider reducing automation level or payment amount');
      recommendations.push('Build emergency fund before aggressive debt payoff');
    } else if (riskLevel === 'medium') {
      recommendations.push('Monitor account balance closely');
      recommendations.push('Consider semi-automatic payments for better control');
    } else {
      recommendations.push('Automation looks safe based on your financial patterns');
    }

    return { level: riskLevel, factors: riskFactors, recommendations };
  }

  private static generateMockBalanceHistory() {
    const history = [];
    const currentDate = new Date();
    
    for (let i = 30; i >= 0; i--) {
      const date = new Date(currentDate.getTime() - (i * 24 * 60 * 60 * 1000));
      const baseBalance = 2800;
      const variation = Math.sin(i / 7) * 500 + (Math.random() - 0.5) * 300; // Weekly pattern + random
      
      history.push({
        date,
        balance: baseBalance + variation,
        accountType: 'checking' as const
      });
    }
    
    return history;
  }

  private static generateMockSpendingPatterns() {
    return [
      {
        category: 'Groceries',
        averageAmount: 150,
        frequency: 'weekly' as const,
        timing: ['Sunday'],
        variability: 0.2
      },
      {
        category: 'Rent/Mortgage',
        averageAmount: 1200,
        frequency: 'monthly' as const,
        timing: ['1st'],
        variability: 0.0
      },
      {
        category: 'Utilities',
        averageAmount: 200,
        frequency: 'monthly' as const,
        timing: ['15th'],
        variability: 0.15
      }
    ];
  }
}