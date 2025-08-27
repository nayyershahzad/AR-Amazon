import { Request, Response } from 'express';
import { runFlow } from '@genkit-ai/flow';
import { debtAnalysisFlow } from '../agent/debtAdvisor';

export class DebtHandler {
  
  async analyzeDebts(req: Request, res: Response): Promise<Response | void> {
    try {
      const { userProfile, debts, userGoals } = req.body;
      
      // Validate input
      if (!userProfile || !debts || !Array.isArray(debts)) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: userProfile and debts array'
        });
      }

      // Validate required userProfile fields
      if (typeof userProfile.totalIncome !== 'number' || typeof userProfile.totalExpenses !== 'number') {
        return res.status(400).json({
          success: false,
          error: 'Invalid userProfile: totalIncome and totalExpenses must be numbers',
          received: {
            totalIncome: userProfile.totalIncome,
            totalExpenses: userProfile.totalExpenses
          }
        });
      }

      // Validate debts have minimum payment info
      const invalidDebts = debts.filter(debt => 
        typeof debt.balance !== 'number' || 
        typeof debt.interestRate !== 'number' || 
        typeof debt.minimumPayment !== 'number' ||
        debt.balance <= 0
      );

      if (invalidDebts.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Invalid debt data: all debts must have valid balance, interestRate, and minimumPayment',
          invalidDebts
        });
      }

      // Calculate available amount for debt payment from the new structure
      const availableAmount = Math.max(0, userProfile.totalIncome - userProfile.totalExpenses);
      
      console.log('Income/Expense Analysis:', {
        totalIncome: userProfile.totalIncome,
        totalExpenses: userProfile.totalExpenses,
        availableAmount,
        primaryIncome: userProfile.primaryIncome,
        additionalIncomes: userProfile.additionalIncomes,
        expenses: userProfile.expenses,
        goals: userProfile.goals
      });
      
      // Check if user has sufficient income for debt payoff
      if (availableAmount <= 0) {
        return res.status(400).json({
          success: false,
          error: `Unable to create debt payoff analysis: Your expenses ($${userProfile.totalExpenses.toLocaleString()}) exceed your income ($${userProfile.totalIncome.toLocaleString()}). You need to either increase income or reduce expenses before starting debt payoff analysis.`,
          suggestion: 'Consider reviewing your expenses and finding areas to cut, or explore additional income opportunities.',
          availableAmount
        });
      }

      // Temporarily use fallback analysis to test payment schedules
      console.log('Using fallback analysis with payment schedules for testing');
      const result = this.createFallbackAnalysis(debts, availableAmount, userProfile);
      
      // TODO: Re-enable AI analysis after confirming payment schedules work
      // The fallback now includes comprehensive payment schedule calculations

      res.json({
        success: true,
        data: {
          strategy: result.strategy,
          payoffStrategies: result.payoffStrategies,
          recommendations: result.recommendations,
          motivationalMessage: result.motivationalMessage,
          goalAnalysis: result.goalAnalysis,
          expenseAnalysis: result.expenseAnalysis,
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


  async calculatePayoffProjection(req: Request, res: Response): Promise<Response | void> {
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

  private createFallbackAnalysis(debts: any[], availableAmount: number, userProfile: any) {
    const expenseAnalysis = this.analyzeExpenses(userProfile.expenses);
    const incomeAnalysis = this.analyzeIncome(userProfile.primaryIncome, userProfile.additionalIncomes);
    const goalAnalysis = this.analyzeGoals(userProfile.goals || []);
    const totalDebt = debts.reduce((sum: number, debt: any) => sum + debt.balance, 0);
    const avalancheStrategy = this.calculateSimpleProjection(debts, availableAmount, 'avalanche');
    const snowballStrategy = this.calculateSimpleProjection(debts, availableAmount, 'snowball');
    
    const strategy = this.generateDynamicStrategy(debts, availableAmount, totalDebt, goalAnalysis);
    
    return {
      strategy,
      goalAnalysis: this.generateGoalAchievementAnalysis(userProfile.goals || [], availableAmount, totalDebt, debts),
      expenseAnalysis: this.generateExpenseAnalysis(userProfile.expenses || [], userProfile.totalIncome),
      payoffStrategies: [
        {
          name: 'Debt Avalanche',
          type: 'avalanche',
          monthsToPayoff: avalancheStrategy.monthsToPayoff,
          totalInterestPaid: avalancheStrategy.totalInterestPaid,
          monthlyPayment: availableAmount,
          paymentSchedule: avalancheStrategy.paymentSchedule,
          description: 'Pay minimums on all debts, then put extra money toward highest interest rate debt first. Saves the most money on interest.'
        },
        {
          name: 'Debt Snowball',
          type: 'snowball',
          monthsToPayoff: snowballStrategy.monthsToPayoff,
          totalInterestPaid: snowballStrategy.totalInterestPaid,
          monthlyPayment: availableAmount,
          paymentSchedule: snowballStrategy.paymentSchedule,
          description: 'Pay minimums on all debts, then put extra money toward smallest balance first. Provides psychological wins and motivation.'
        }
      ],
      recommendations: [
        'Set up automatic payments for minimum amounts to avoid late fees',
        'Allocate your extra $' + (availableAmount - debts.reduce((sum: number, debt: any) => sum + debt.minimumPayment, 0)) + ' to your chosen strategy',
        ...expenseAnalysis.recommendations,
        ...incomeAnalysis.recommendations,
        ...goalAnalysis.recommendations,
        'Track your progress monthly to stay motivated'
      ],
      motivationalMessage: `You're taking control of your financial future! With $${availableAmount} available each month, you have the power to become debt-free. Every payment brings you closer to financial freedom.`,
      nextSteps: this.generateCleanNextSteps(debts, availableAmount, userProfile.goals || [])
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
    
    // Calculate 6-month payment breakdown
    const paymentSchedule = this.calculatePaymentSchedule(debts, monthlyPayment, strategy);
    console.log(`Payment schedule for ${strategy} strategy:`, JSON.stringify(paymentSchedule.slice(0, 2), null, 2));
    
    return {
      monthsToPayoff: Math.max(1, monthsToPayoff),
      totalInterestPaid: Math.max(0, totalInterestPaid),
      payoffDate: new Date(Date.now() + monthsToPayoff * 30 * 24 * 60 * 60 * 1000),
      monthlySavings: extraPayment,
      strategy,
      paymentSchedule: paymentSchedule.slice(0, 6) // First 6 months
    };
  }

  private calculatePaymentSchedule(debts: any[], totalPayment: number, strategy: string) {
    // Create working copies of debts
    let workingDebts = debts.map(debt => ({
      ...debt,
      remainingBalance: debt.balance
    }));
    
    const schedule = [];
    const totalMinPayments = debts.reduce((sum, debt) => sum + debt.minimumPayment, 0);
    const extraPayment = Math.max(0, totalPayment - totalMinPayments);
    
    for (let month = 1; month <= 6; month++) {
      const monthData = {
        month,
        debts: [],
        totalPayment: 0
      };
      
      // Sort debts according to strategy
      if (strategy === 'avalanche') {
        workingDebts.sort((a, b) => b.interestRate - a.interestRate);
      } else if (strategy === 'snowball') {
        workingDebts.sort((a, b) => a.remainingBalance - b.remainingBalance);
      }
      
      let remainingExtra = extraPayment;
      
      workingDebts.forEach(debt => {
        if (debt.remainingBalance > 0) {
          // Calculate interest for this month
          const monthlyInterest = (debt.remainingBalance * debt.interestRate) / 12;
          let payment = debt.minimumPayment;
          
          // Add extra payment to the priority debt
          if (remainingExtra > 0 && (strategy === 'avalanche' ? debt === workingDebts[0] : debt === workingDebts.find(d => d.remainingBalance > 0))) {
            const extraForThisDebt = Math.min(remainingExtra, debt.remainingBalance + monthlyInterest - debt.minimumPayment);
            payment += extraForThisDebt;
            remainingExtra -= extraForThisDebt;
          }
          
          // Don't pay more than what's owed
          payment = Math.min(payment, debt.remainingBalance + monthlyInterest);
          
          // Update remaining balance
          debt.remainingBalance = Math.max(0, debt.remainingBalance + monthlyInterest - payment);
          
          (monthData.debts as any).push({
            name: debt.name,
            payment: Math.round(payment),
            remainingBalance: Math.round(debt.remainingBalance),
            interestPaid: Math.round(monthlyInterest)
          });
          
          monthData.totalPayment += payment;
        }
      });
      
      // Remove paid-off debts
      workingDebts = workingDebts.filter(debt => debt.remainingBalance > 0);
      
      schedule.push({
        ...monthData,
        totalPayment: Math.round(monthData.totalPayment)
      });
      
      // If all debts are paid off, break
      if (workingDebts.length === 0) break;
    }
    
    return schedule;
  }

  private analyzeExpenses(expenses: any[]) {
    if (!expenses || expenses.length === 0) {
      return {
        analysis: 'No expense data available for analysis',
        recommendations: ['Add expense details to get personalized recommendations']
      };
    }

    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const expensesByCategory = expenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    }, {});

    const expenseEntries = Object.entries(expensesByCategory);
    if (expenseEntries.length === 0) {
      return {
        analysis: 'No valid expense categories found',
        recommendations: ['Review and categorize your expenses for better analysis']
      };
    }

    const highestCategory = expenseEntries.sort((a: any, b: any) => b[1] - a[1])[0];

    const recommendations = [];
    
    // Analyze expense patterns and provide recommendations
    if (expensesByCategory.Recreation > totalExpenses * 0.15) {
      recommendations.push('Consider reducing recreation expenses by 10-15% to accelerate debt payoff');
    }
    
    if (expensesByCategory.Shopping > totalExpenses * 0.10) {
      recommendations.push('Review shopping expenses - look for subscription services you can pause');
    }
    
    if (expensesByCategory.Grocery > totalExpenses * 0.20) {
      recommendations.push('Consider meal planning and bulk buying to reduce grocery costs');
    }

    return {
      analysis: `Your highest expense category is ${highestCategory[0]} at $${highestCategory[1]}`,
      recommendations: recommendations.slice(0, 2) // Limit to 2 recommendations
    };
  }

  private analyzeIncome(primaryIncome: number, additionalIncomes: any[]) {
    const totalAdditional = additionalIncomes.reduce((sum, inc) => sum + inc.amount, 0);
    const incomeRatio = totalAdditional / (primaryIncome + totalAdditional);
    
    const recommendations = [];
    
    if (incomeRatio < 0.1 && additionalIncomes.length === 0) {
      recommendations.push('Consider exploring side income opportunities like freelancing or selling unused items');
    }
    
    if (additionalIncomes.length > 0) {
      recommendations.push(`Great job diversifying income! Your additional streams add $${totalAdditional} monthly`);
    }
    
    return {
      analysis: `Income diversification: ${(incomeRatio * 100).toFixed(1)}% from additional sources`,
      recommendations: recommendations.slice(0, 2)
    };
  }

  private analyzeGoals(goals: any[]) {
    const recommendations = [];
    const highPriorityGoals = goals.filter(goal => goal.priority === 'high');
    const educationGoals = goals.filter(goal => goal.category === 'Education');
    const homeGoals = goals.filter(goal => goal.category === 'Home Buying');
    const retirementGoals = goals.filter(goal => goal.category === 'Retirement');
    
    if (goals.length === 0) {
      recommendations.push('Consider setting specific financial goals to help guide your debt payoff strategy');
    }
    
    if (highPriorityGoals.length > 0) {
      recommendations.push(`Focus on your high-priority goals: ${highPriorityGoals.map(g => g.category).join(', ')}`);
    }
    
    if (educationGoals.length > 0) {
      recommendations.push('Education goals detected - consider skills that could increase your income potential');
    }
    
    if (homeGoals.length > 0) {
      recommendations.push('Home buying goal - prioritize debt reduction to improve your debt-to-income ratio for mortgage approval');
    }
    
    if (retirementGoals.length > 0) {
      recommendations.push('Balance debt payoff with retirement savings - consider employer 401k matching');
    }
    
    // Goal-specific expense cutting recommendations
    goals.forEach(goal => {
      if (goal.category === 'Emergency Fund' && goal.priority === 'high') {
        recommendations.push('Emergency fund priority: reduce discretionary spending by 15-20% to build this safety net');
      }
      if (goal.category === 'Travel' && goal.targetAmount > 5000) {
        recommendations.push('Large travel goal: consider reducing recreation expenses and exploring travel rewards credit cards');
      }
    });
    
    return {
      analysis: `Goals analysis: ${goals.length} goals set (${highPriorityGoals.length} high priority)`,
      recommendations: recommendations.slice(0, 3)
    };
  }

  private generateDynamicStrategy(debts: any[], availableAmount: number, totalDebt: number, goalAnalysis: any) {
    const highestInterestDebt = debts.reduce((max, debt) => debt.interestRate > max.interestRate ? debt : max, debts[0]);
    const totalMinimums = debts.reduce((sum, debt) => sum + debt.minimumPayment, 0);
    const extraPayment = availableAmount - totalMinimums;
    
    let strategy = `With $${availableAmount.toLocaleString()} available monthly for debt payments, here's your personalized strategy:\n\n`;
    
    // Debt-specific analysis
    strategy += `📊 DEBT PORTFOLIO ANALYSIS:\n`;
    strategy += `• Total debt: $${totalDebt.toLocaleString()} across ${debts.length} accounts\n`;
    strategy += `• Highest interest debt: ${highestInterestDebt.name} at ${(highestInterestDebt.interestRate * 100).toFixed(1)}%\n`;
    strategy += `• Minimum payments: $${totalMinimums.toLocaleString()}\n`;
    strategy += `• Extra payment power: $${extraPayment.toLocaleString()}\n\n`;
    
    // Strategy recommendation
    if (extraPayment > 500) {
      strategy += `💪 RECOMMENDED APPROACH: Debt Avalanche\nWith $${extraPayment.toLocaleString()} extra monthly, attack the ${(highestInterestDebt.interestRate * 100).toFixed(1)}% interest debt first to save maximum money.`;
    } else if (extraPayment > 100) {
      strategy += `⚡ RECOMMENDED APPROACH: Modified Snowball\nWith $${extraPayment.toLocaleString()} extra monthly, consider paying off smaller balances first for quick psychological wins.`;
    } else {
      strategy += `🎯 FOCUS STRATEGY: Increase Available Funds\nWith only $${extraPayment.toLocaleString()} extra monthly, prioritize increasing income or reducing expenses to accelerate payoff.`;
    }
    
    return strategy;
  }

  private generateGoalAchievementAnalysis(goals: any[], availableAmount: number, totalDebt: number, debts: any[]) {
    if (!goals || goals.length === 0) {
      return `📋 GOAL ACHIEVEMENT ANALYSIS:\n\n• No specific financial goals set. Consider adding goals to create a more targeted financial plan.`;
    }

    let analysis = `📋 GOAL ACHIEVEMENT ANALYSIS:\n\n`;
    
    // Calculate debt payoff timeline first
    const avgInterestRate = debts.reduce((sum, debt) => sum + debt.interestRate, 0) / debts.length;
    const debtPayoffMonths = Math.ceil(Math.log(1 + (totalDebt * avgInterestRate) / availableAmount) / Math.log(1 + avgInterestRate));
    const debtFreeDate = new Date();
    debtFreeDate.setMonth(debtFreeDate.getMonth() + debtPayoffMonths);

    analysis += `🗓️ DEBT PAYOFF TIMELINE: Approximately ${debtPayoffMonths} months (${debtFreeDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })})\n\n`;

    goals.forEach((goal, index) => {
      if (goal.targetAmount && goal.targetDate) {
        const targetDate = new Date(goal.targetDate);
        const today = new Date();
        const monthsToGoal = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 30));
        const monthlyRequired = Math.ceil(goal.targetAmount / Math.max(1, monthsToGoal));
        
        analysis += `${index + 1}. ${goal.category}: ${goal.description}\n`;
        analysis += `   💰 Target: $${goal.targetAmount.toLocaleString()} by ${targetDate.toLocaleDateString()}\n`;
        analysis += `   📅 Timeline: ${monthsToGoal} months (${monthlyRequired > 0 ? `$${monthlyRequired.toLocaleString()}/month needed` : 'Past due!'})\n`;
        
        // Feasibility analysis
        if (monthsToGoal <= 0) {
          analysis += `   ❌ CRITICAL: Goal date has passed! Need to revise timeline.\n`;
        } else if (monthlyRequired > availableAmount * 0.8) {
          analysis += `   ⚠️ CHALLENGING: Requires $${monthlyRequired.toLocaleString()}/month (${((monthlyRequired/availableAmount)*100).toFixed(0)}% of available funds)\n`;
          analysis += `   💡 Suggestion: Consider extending timeline or reducing goal amount\n`;
        } else if (monthsToGoal > debtPayoffMonths) {
          analysis += `   ✅ ACHIEVABLE: Can pursue after debt freedom in ${debtPayoffMonths} months\n`;
          analysis += `   📈 Post-debt monthly available: ~$${(availableAmount + debts.reduce((sum, d) => sum + d.minimumPayment, 0)).toLocaleString()}\n`;
        } else {
          analysis += `   ⚠️ TIMELINE CONFLICT: Goal date (${monthsToGoal} months) vs debt payoff (${debtPayoffMonths} months)\n`;
          analysis += `   💭 Consider: Balance ${((monthlyRequired/availableAmount)*100).toFixed(0)}% goal savings with debt payments\n`;
        }
        analysis += `\n`;
      }
    });

    return analysis;
  }

  private generateExpenseAnalysis(expenses: any[], totalIncome: number) {
    if (!expenses || expenses.length === 0) {
      return `💸 EXPENSE ANALYSIS:\n• No expense data available for analysis.`;
    }

    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    let analysis = `💸 EXPENSE ANALYSIS:\n\n`;

    // Calculate expense percentages and identify outliers
    const expensesByCategory = expenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    }, {});

    // Standard expense ratios (as percentage of income)
    const normalRanges = {
      'Housing': { min: 25, max: 35, name: 'Housing (Rent/Mortgage)' },
      'Transportation': { min: 10, max: 20, name: 'Transportation' },
      'Grocery': { min: 10, max: 15, name: 'Food & Groceries' },
      'Utilities': { min: 5, max: 10, name: 'Utilities' },
      'Recreation': { min: 5, max: 10, name: 'Entertainment & Recreation' },
      'Health': { min: 5, max: 10, name: 'Healthcare' },
      'Shopping': { min: 5, max: 10, name: 'Shopping & Personal' },
      'Insurance': { min: 5, max: 8, name: 'Insurance' }
    };

    const outliers: string[] = [];
    const recommendations: string[] = [];

    Object.entries(expensesByCategory).forEach(([category, amount]) => {
      const percentage = ((amount as number) / totalIncome) * 100;
      const normal = normalRanges[category as keyof typeof normalRanges];
      
      if (normal) {
        analysis += `• ${normal.name}: $${(amount as number).toLocaleString()} (${percentage.toFixed(1)}% of income)\n`;
        
        if (percentage > normal.max) {
          outliers.push(`${category}: ${percentage.toFixed(1)}% (${(percentage - normal.max).toFixed(1)}% above normal)`);
          
          if (category === 'Housing' && percentage > 40) {
            recommendations.push(`🏠 Housing costs are ${percentage.toFixed(1)}% of income - consider downsizing or house hacking`);
          } else if (category === 'Recreation' && percentage > 15) {
            recommendations.push(`🎯 Entertainment expenses are high - easy area to cut $${((amount as number) * 0.3).toLocaleString()}/month`);
          } else if (category === 'Transportation' && percentage > 25) {
            recommendations.push(`🚗 Transportation costs are elevated - explore carpooling, public transit, or vehicle efficiency`);
          } else if (category === 'Grocery' && percentage > 20) {
            recommendations.push(`🛒 Food expenses are above average - meal planning could save $${((amount as number) * 0.2).toLocaleString()}/month`);
          }
        } else if (percentage < normal.min && category === 'Health') {
          recommendations.push(`🏥 Healthcare spending seems low - ensure you're not neglecting preventive care`);
        }
      }
    });

    if (outliers.length > 0) {
      analysis += `\n🚨 EXPENSE OUTLIERS:\n`;
      outliers.forEach(outlier => analysis += `• ${outlier}\n`);
    }

    if (recommendations.length > 0) {
      analysis += `\n💡 EXPENSE OPTIMIZATION:\n`;
      recommendations.forEach(rec => analysis += `${rec}\n`);
    }

    // Overall expense health
    const expenseRatio = (totalExpenses / totalIncome) * 100;
    analysis += `\n📊 OVERALL EXPENSE RATIO: ${expenseRatio.toFixed(1)}% of income\n`;
    
    if (expenseRatio > 80) {
      analysis += `⚠️ CAUTION: Very high expense ratio leaves little room for savings or emergencies\n`;
    } else if (expenseRatio > 70) {
      analysis += `📈 MODERATE: Some room for optimization and debt acceleration\n`;
    } else {
      analysis += `✅ HEALTHY: Good expense management with room for aggressive debt payoff\n`;
    }

    return analysis;
  }

  private generateCleanNextSteps(debts: any[], availableAmount: number, goals: any[]) {
    const steps = [];
    const totalMinimums = debts.reduce((sum, debt) => sum + debt.minimumPayment, 0);
    const extraPayment = availableAmount - totalMinimums;
    
    // Core debt strategy step
    if (extraPayment > 500) {
      steps.push('Implement Debt Avalanche: Pay minimums + extra $' + extraPayment.toLocaleString() + ' to highest interest debt');
    } else if (extraPayment > 100) {
      steps.push('Try Debt Snowball: Pay minimums + extra $' + extraPayment.toLocaleString() + ' to smallest balance');
    } else {
      steps.push('Focus on increasing available funds through expense reduction or income growth');
    }
    
    // Automation step
    steps.push('Set up automatic minimum payments on all debt accounts');
    
    // Goal-specific step
    if (goals.length > 0) {
      const highPriorityGoals = goals.filter(g => g.priority === 'high');
      if (highPriorityGoals.length > 0) {
        steps.push(`Prioritize high-priority goals: ${highPriorityGoals.map(g => g.category).join(', ')}`);
      } else {
        steps.push('Review goal timelines and consider debt-free timeline for better planning');
      }
    }
    
    // Monitoring step
    steps.push('Review progress monthly and adjust strategy as needed');
    
    return steps;
  }
}