import { z } from 'zod';
import { flow } from './genkit.config';
import { gemini15Flash } from '@genkit-ai/googleai';
import { SmartDebt, UserProfile, PayoffStrategy } from '../types/debt';
import { generate } from '@genkit-ai/ai';

// Input schema for debt analysis
const DebtAnalysisInput = z.object({
  userProfile: z.object({
    primaryIncome: z.number(),
    totalIncome: z.number(),
    totalExpenses: z.number(),
    additionalIncomes: z.array(z.object({
      source: z.string(),
      amount: z.number(),
      description: z.string().optional()
    })),
    expenses: z.array(z.object({
      category: z.string(),
      amount: z.number(),
      description: z.string().optional()
    })),
    goals: z.array(z.object({
      category: z.string(),
      description: z.string(),
      targetAmount: z.number().optional(),
      targetDate: z.string().optional(),
      priority: z.enum(['low', 'medium', 'high']),
      notes: z.string().optional()
    })).optional(),
    riskTolerance: z.enum(['conservative', 'moderate', 'aggressive']).optional()
  }),
  debts: z.array(z.object({
    name: z.string(),
    balance: z.number(),
    interestRate: z.number(),
    minimumPayment: z.number()
  })),
  availableAmount: z.number(),
  userGoals: z.string().optional()
});

// Output schema for debt analysis
const DebtAnalysisOutput = z.object({
  strategy: z.string(),
  payoffStrategies: z.array(z.object({
    name: z.string(),
    type: z.enum(['avalanche', 'snowball', 'custom']),
    monthsToPayoff: z.number(),
    totalInterestPaid: z.number(),
    monthlyPayment: z.number(),
    description: z.string(),
    paymentSchedule: z.array(z.object({
      month: z.number(),
      debts: z.array(z.object({
        name: z.string(),
        payment: z.number(),
        remainingBalance: z.number(),
        interestPaid: z.number()
      })),
      totalPayment: z.number()
    })).optional()
  })),
  recommendations: z.array(z.string()),
  motivationalMessage: z.string(),
  goalAnalysis: z.string().optional(),
  expenseAnalysis: z.string().optional(),
  nextSteps: z.array(z.string())
});

export const debtAnalysisFlow = flow(
  {
    name: 'debtAnalysis',
    inputSchema: DebtAnalysisInput,
    outputSchema: DebtAnalysisOutput,
  },
  async (input) => {
    const { userProfile, debts, availableAmount, userGoals } = input;
    
    // Calculate different payoff strategies with payment schedules
    const avalancheStrategy = calculateAvalancheStrategy(debts, availableAmount);
    const snowballStrategy = calculateSnowballStrategy(debts, availableAmount);
    
    // Generate AI-powered analysis and recommendations
    const expenseBreakdown = userProfile.expenses
      .map(exp => `- ${exp.category}: $${exp.amount}${exp.description ? ' (' + exp.description + ')' : ''}`)
      .join('\n');
    
    const incomeBreakdown = [
      `- Primary Income: $${userProfile.primaryIncome}`,
      ...userProfile.additionalIncomes.map(inc => 
        `- ${inc.source}: $${inc.amount}${inc.description ? ' (' + inc.description + ')' : ''}`
      )
    ].join('\n');

    const goalsBreakdown = userProfile.goals && userProfile.goals.length > 0 
      ? userProfile.goals.map(goal => 
          `- ${goal.category}: ${goal.description}${goal.targetAmount ? ' ($' + goal.targetAmount + ')' : ''}${goal.targetDate ? ' by ' + goal.targetDate : ''} [${goal.priority} priority]`
        ).join('\n')
      : 'No specific financial goals set';

    const prompt = `
    As a financial advisor, provide a structured debt payoff strategy for:
    
    FINANCES:
    - Monthly Income: $${userProfile.totalIncome}
    - Monthly Expenses: $${userProfile.totalExpenses}
    - Available for debt: $${availableAmount}
    
    DEBTS:
    ${debts.map(debt => 
      `- ${debt.name}: $${debt.balance} at ${(debt.interestRate * 100).toFixed(1)}%`
    ).join('\n')}
    
    GOALS: ${(userProfile.goals && userProfile.goals.length > 0) ? userProfile.goals.map(g => g.category).join(', ') : 'None set'}
    
    Provide a well-formatted strategy recommendation with clear sections. Structure your response as:
    
    🎯 RECOMMENDED APPROACH:
    [Choose between Debt Avalanche or Snowball and explain why]
    
    ⏰ ESTIMATED TIMELINE:
    [Provide realistic timeline for debt freedom]
    
    💡 KEY ACTION STEPS:
    • [First key action]
    • [Second key action]
    • [Third key action]
    
    Keep each section concise but informative.
    `;

    const llmResponse = await generate({
      model: gemini15Flash,
      prompt,
    });

    // Generate goal and expense analysis using the same helper functions as fallback
    const goalAnalysis = generateGoalAnalysis(userProfile.goals || [], availableAmount, debts);
    const expenseAnalysis = generateExpenseAnalysis(userProfile.expenses || [], userProfile.totalIncome);

    return {
      strategy: extractStrategy(llmResponse.text()),
      payoffStrategies: [
        avalancheStrategy,
        snowballStrategy
      ],
      recommendations: extractRecommendations(llmResponse.text()),
      motivationalMessage: extractMotivationalMessage(llmResponse.text()),
      goalAnalysis,
      expenseAnalysis,
      nextSteps: extractNextSteps(llmResponse.text())
    };
  }
);

// Utility functions for strategy calculations
// Calculate baseline scenario (minimum payments only)
function calculateMinimumPaymentBaseline(debts: any[]): { monthsToPayoff: number, totalInterestPaid: number } {
  let totalMonths = 0;
  let totalInterest = 0;
  
  debts.forEach(debt => {
    const monthlyRate = debt.interestRate / 12;
    const balance = debt.balance;
    const minPayment = debt.minimumPayment;
    
    if (minPayment <= balance * monthlyRate) {
      // Payment doesn't cover interest - debt will never be paid off
      totalMonths = 999; // Represents "never paid off"
      totalInterest += balance * 10; // Approximate penalty
      return;
    }
    
    // Calculate payoff time for this debt with minimum payments
    const months = Math.ceil(-Math.log(1 - (balance * monthlyRate) / minPayment) / Math.log(1 + monthlyRate));
    const totalPaid = months * minPayment;
    const interest = totalPaid - balance;
    
    totalMonths = Math.max(totalMonths, months);
    totalInterest += interest;
  });
  
  return {
    monthsToPayoff: totalMonths,
    totalInterestPaid: Math.max(0, totalInterest)
  };
}

function calculateAvalancheStrategy(debts: any[], availableAmount: number): any {
  const baseline = calculateMinimumPaymentBaseline(debts);
  const sortedDebts = [...debts].sort((a, b) => b.interestRate - a.interestRate);
  const totalMinimums = debts.reduce((sum, debt) => sum + debt.minimumPayment, 0);
  const extraAmount = Math.max(0, availableAmount - totalMinimums);
  
  // Enhanced calculation with proper debt avalanche simulation
  const totalDebt = debts.reduce((sum, debt) => sum + debt.balance, 0);
  const fullPaymentSchedule = calculateFullPaymentSchedule(debts, availableAmount, 'avalanche');
  const paymentSchedule = fullPaymentSchedule.slice(0, 6); // For display only
  
  // Calculate actual totals from full payment schedule
  let monthsToPayoff = 0;
  let totalInterestPaid = 0;
  
  if (fullPaymentSchedule.length > 0) {
    monthsToPayoff = fullPaymentSchedule.length;
    fullPaymentSchedule.forEach(month => {
      month.debts.forEach((debt: any) => {
        totalInterestPaid += debt.interestPaid || 0;
      });
    });
  } else {
    // Fallback calculation if payment schedule is empty
    const weightedRate = debts.reduce((sum, debt) => sum + (debt.balance * debt.interestRate), 0) / totalDebt;
    monthsToPayoff = Math.ceil(Math.log(1 + (totalDebt * weightedRate) / availableAmount) / Math.log(1 + weightedRate));
    totalInterestPaid = (monthsToPayoff * availableAmount) - totalDebt;
  }
  
  const interestSaved = baseline.totalInterestPaid - totalInterestPaid;
  const savingsPercentage = baseline.totalInterestPaid > 0 ? (interestSaved / baseline.totalInterestPaid) * 100 : 0;
  
  return {
    name: 'Debt Avalanche',
    type: 'avalanche' as const,
    monthsToPayoff: Math.max(1, monthsToPayoff),
    totalInterestPaid: Math.max(0, totalInterestPaid),
    interestSaved: Math.max(0, interestSaved),
    savingsPercentage: Math.max(0, savingsPercentage),
    monthlyPayment: availableAmount,
    description: `Pay minimums on all debts, then put extra money toward highest interest rate debt first. Saves ${savingsPercentage.toFixed(1)}% on interest payments.`,
    paymentSchedule: paymentSchedule.slice(0, 6),
    baseline
  };
}

function calculateSnowballStrategy(debts: any[], availableAmount: number): any {
  const sortedDebts = [...debts].sort((a, b) => a.balance - b.balance);
  const totalMinimums = debts.reduce((sum, debt) => sum + debt.minimumPayment, 0);
  const extraAmount = Math.max(0, availableAmount - totalMinimums);
  
  // Enhanced calculation with proper debt snowball simulation
  const totalDebt = debts.reduce((sum, debt) => sum + debt.balance, 0);
  const fullPaymentSchedule = calculateFullPaymentSchedule(debts, availableAmount, 'snowball');
  const paymentSchedule = fullPaymentSchedule.slice(0, 6); // For display only
  
  let monthsToPayoff = 0;
  let totalInterestPaid = 0;
  
  if (fullPaymentSchedule.length > 0) {
    monthsToPayoff = fullPaymentSchedule.length;
    fullPaymentSchedule.forEach(month => {
      month.debts.forEach((debt: any) => {
        totalInterestPaid += debt.interestPaid || 0;
      });
    });
  } else {
    // Fallback calculation if payment schedule is empty
    const avgRate = debts.reduce((sum, debt) => sum + debt.interestRate, 0) / debts.length;
    monthsToPayoff = Math.ceil(Math.log(1 + (totalDebt * avgRate) / availableAmount) / Math.log(1 + avgRate));
    totalInterestPaid = (monthsToPayoff * availableAmount) - totalDebt;
  }
  
  const baseline = calculateMinimumPaymentBaseline(debts);
  
  const interestSaved = baseline.totalInterestPaid - totalInterestPaid;
  const savingsPercentage = baseline.totalInterestPaid > 0 ? (interestSaved / baseline.totalInterestPaid) * 100 : 0;
  
  return {
    name: 'Debt Snowball',
    type: 'snowball' as const,
    monthsToPayoff: Math.max(1, monthsToPayoff),
    totalInterestPaid: Math.max(0, totalInterestPaid),
    interestSaved: Math.max(0, interestSaved),
    savingsPercentage: Math.max(0, savingsPercentage),
    monthlyPayment: availableAmount,
    description: `Pay minimums on all debts, then put extra money toward smallest balance first. Saves ${savingsPercentage.toFixed(1)}% on interest with psychological momentum.`,
    paymentSchedule: paymentSchedule,
    baseline
  };
}

// Text extraction helpers (would be more sophisticated with proper NLP)
function extractStrategy(text: string): string {
  const lines = text.split('\n');
  const strategyLine = lines.find(line => line.toLowerCase().includes('strategy') || line.toLowerCase().includes('approach'));
  return strategyLine?.replace(/^\d+\.\s*/, '').trim() || 'Focus on consistent payments and building good financial habits.';
}

function extractRecommendations(text: string): string[] {
  const lines = text.split('\n').filter(line => line.trim());
  const recommendations = lines
    .filter(line => line.includes('recommend') || line.match(/^\d+\./))
    .map(line => line.replace(/^\d+\.\s*/, '').trim())
    .filter(line => line.length > 10);
  
  return recommendations.length > 0 ? recommendations.slice(0, 5) : [
    'Make payments above the minimum when possible',
    'Consider consolidating high-interest debt',
    'Track your progress to stay motivated'
  ];
}

function extractMotivationalMessage(text: string): string {
  const motivationalKeywords = ['motivated', 'achieve', 'success', 'freedom', 'progress'];
  const lines = text.split('\n');
  const motivationalLine = lines.find(line => 
    motivationalKeywords.some(keyword => line.toLowerCase().includes(keyword))
  );
  
  return motivationalLine?.trim() || 'You\'re taking the right steps toward financial freedom! Every payment brings you closer to your goal.';
}

function extractNextSteps(text: string): string[] {
  const lines = text.split('\n');
  const stepLines = lines
    .filter(line => line.toLowerCase().includes('step') || line.toLowerCase().includes('next') || line.match(/^\d+\./))
    .map(line => line.replace(/^\d+\.\s*/, '').trim())
    .filter(line => line.length > 5);
    
  return stepLines.length > 0 ? stepLines.slice(0, 4) : [
    'Set up automatic payments for minimum amounts',
    'Allocate extra funds to your chosen strategy',
    'Track your progress monthly',
    'Celebrate small wins along the way'
  ];
}

// Goal and expense analysis helper functions
function generateGoalAnalysis(goals: any[], availableAmount: number, debts: any[]) {
  if (!goals || goals.length === 0) {
    return `📋 GOAL ACHIEVEMENT ANALYSIS:\n\n• No specific financial goals set. Consider adding goals to create a more targeted financial plan.`;
  }

  let analysis = `📋 GOAL ACHIEVEMENT ANALYSIS:\n\n`;
  
  // Calculate debt payoff timeline first
  const totalDebt = debts.reduce((sum, debt) => sum + debt.balance, 0);
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

function generateExpenseAnalysis(expenses: any[], totalIncome: number) {
  if (!expenses || expenses.length === 0) {
    return `💸 EXPENSE ANALYSIS:\n\n• No expense data available for analysis.`;
  }

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  let analysis = `💸 EXPENSE ANALYSIS:\n\n`;

  // Calculate expense percentages and identify outliers
  const expensesByCategory = expenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {});

  // Standard expense ratios (as percentage of income)
  const normalRanges: Record<string, { min: number; max: number; name: string }> = {
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

  Object.entries(expensesByCategory).forEach(([category, amount]: [string, unknown]) => {
    const amountNum = amount as number;
    const percentage = (amountNum / totalIncome) * 100;
    const normal = normalRanges[category];
    
    if (normal) {
      analysis += `• ${normal.name}: $${amountNum.toLocaleString()} (${percentage.toFixed(1)}% of income)\n`;
      
      if (percentage > normal.max) {
        outliers.push(`${category}: ${percentage.toFixed(1)}% (${(percentage - normal.max).toFixed(1)}% above normal)`);
        
        if (category === 'Housing' && percentage > 40) {
          recommendations.push(`🏠 Housing costs are ${percentage.toFixed(1)}% of income - consider downsizing or house hacking`);
        } else if (category === 'Recreation' && percentage > 15) {
          recommendations.push(`🎯 Entertainment expenses are high - easy area to cut $${(amountNum * 0.3).toLocaleString()}/month`);
        } else if (category === 'Transportation' && percentage > 25) {
          recommendations.push(`🚗 Transportation costs are elevated - explore carpooling, public transit, or vehicle efficiency`);
        } else if (category === 'Grocery' && percentage > 20) {
          recommendations.push(`🛒 Food expenses are above average - meal planning could save $${(amountNum * 0.2).toLocaleString()}/month`);
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

// Calculate full payment schedule until all debts are paid off
function calculateFullPaymentSchedule(debts: any[], totalPayment: number, strategy: string) {
  // Create working copies of debts
  let workingDebts = debts.map(debt => ({
    ...debt,
    remainingBalance: debt.balance
  }));
  
  const schedule = [];
  const totalMinPayments = debts.reduce((sum, debt) => sum + debt.minimumPayment, 0);
  const extraPayment = Math.max(0, totalPayment - totalMinPayments);
  
  let month = 1;
  const maxMonths = 600; // Safety limit to prevent infinite loops
  
  while (workingDebts.length > 0 && month <= maxMonths) {
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
        
        // Add extra payment to the priority debt (first debt after sorting)
        if (remainingExtra > 0 && debt === workingDebts[0]) {
          const extraForThisDebt = Math.min(remainingExtra, debt.remainingBalance + monthlyInterest - debt.minimumPayment);
          payment += extraForThisDebt;
          remainingExtra -= extraForThisDebt;
        }
        
        // Don't pay more than what's owed
        payment = Math.min(payment, debt.remainingBalance + monthlyInterest);
        
        // Update remaining balance
        debt.remainingBalance = Math.max(0, debt.remainingBalance + monthlyInterest - payment);
        
        (monthData.debts as any[]).push({
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
    
    month++;
  }
  
  return schedule;
}

function calculatePaymentSchedule(debts: any[], totalPayment: number, strategy: string) {
  // Create working copies of debts
  let workingDebts = debts.map(debt => ({
    ...debt,
    remainingBalance: debt.balance
  }));
  
  const schedule = [];
  const totalMinPayments = debts.reduce((sum, debt) => sum + debt.minimumPayment, 0);
  const extraPayment = Math.max(0, totalPayment - totalMinPayments);
  
  for (let month = 1; month <= 6 && workingDebts.length > 0; month++) {
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
        
        (monthData.debts as any[]).push({
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