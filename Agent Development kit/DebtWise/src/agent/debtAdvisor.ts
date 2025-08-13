import { z } from 'zod';
import { flow } from './genkit.config';
import { gemini15Flash } from '@genkit-ai/googleai';
import { SmartDebt, UserProfile, PayoffStrategy } from '../types/debt';
import { generate } from '@genkit-ai/ai/model';

// Input schema for debt analysis
const DebtAnalysisInput = z.object({
  userProfile: z.object({
    monthlyIncome: z.number(),
    monthlyExpenses: z.number(),
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
    description: z.string()
  })),
  recommendations: z.array(z.string()),
  motivationalMessage: z.string(),
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
    
    // Calculate different payoff strategies
    const avalancheStrategy = calculateAvalancheStrategy(debts, availableAmount);
    const snowballStrategy = calculateSnowballStrategy(debts, availableAmount);
    
    // Generate AI-powered analysis and recommendations
    const prompt = `
    As an expert financial advisor, analyze this debt situation and provide personalized advice:
    
    User Profile:
    - Monthly Income: $${userProfile.monthlyIncome}
    - Monthly Expenses: $${userProfile.monthlyExpenses}
    - Available for debt payment: $${availableAmount}
    - Goals: ${userGoals || 'Become debt-free as efficiently as possible'}
    
    Debts:
    ${debts.map(debt => 
      `- ${debt.name}: $${debt.balance} at ${(debt.interestRate * 100).toFixed(1)}% APR (min payment: $${debt.minimumPayment})`
    ).join('\n')}
    
    Provide:
    1. A clear, encouraging analysis of their situation
    2. Specific recommendations for debt payoff
    3. Motivational message to keep them engaged
    4. Next actionable steps they should take
    
    Be supportive, realistic, and focus on psychological aspects that help with debt motivation.
    `;

    const llmResponse = await generate({
      model: gemini15Flash,
      prompt,
    });

    return {
      strategy: extractStrategy(llmResponse.text()),
      payoffStrategies: [
        avalancheStrategy,
        snowballStrategy
      ],
      recommendations: extractRecommendations(llmResponse.text()),
      motivationalMessage: extractMotivationalMessage(llmResponse.text()),
      nextSteps: extractNextSteps(llmResponse.text())
    };
  }
);

// Utility functions for strategy calculations
function calculateAvalancheStrategy(debts: any[], availableAmount: number): any {
  const sortedDebts = [...debts].sort((a, b) => b.interestRate - a.interestRate);
  const totalMinimums = debts.reduce((sum, debt) => sum + debt.minimumPayment, 0);
  const extraAmount = Math.max(0, availableAmount - totalMinimums);
  
  // Simplified calculation - in production, would be more sophisticated
  const totalDebt = debts.reduce((sum, debt) => sum + debt.balance, 0);
  const weightedRate = debts.reduce((sum, debt) => sum + (debt.balance * debt.interestRate), 0) / totalDebt;
  
  const monthsToPayoff = Math.ceil(Math.log(1 + (totalDebt * weightedRate) / availableAmount) / Math.log(1 + weightedRate));
  const totalInterestPaid = (monthsToPayoff * availableAmount) - totalDebt;
  
  return {
    name: 'Debt Avalanche',
    type: 'avalanche' as const,
    monthsToPayoff: Math.max(1, monthsToPayoff),
    totalInterestPaid: Math.max(0, totalInterestPaid),
    monthlyPayment: availableAmount,
    description: 'Pay minimums on all debts, then put extra money toward highest interest rate debt first. Saves the most money on interest.'
  };
}

function calculateSnowballStrategy(debts: any[], availableAmount: number): any {
  const sortedDebts = [...debts].sort((a, b) => a.balance - b.balance);
  const totalMinimums = debts.reduce((sum, debt) => sum + debt.minimumPayment, 0);
  const extraAmount = Math.max(0, availableAmount - totalMinimums);
  
  // Simplified calculation
  const totalDebt = debts.reduce((sum, debt) => sum + debt.balance, 0);
  const avgRate = debts.reduce((sum, debt) => sum + debt.interestRate, 0) / debts.length;
  
  const monthsToPayoff = Math.ceil(Math.log(1 + (totalDebt * avgRate) / availableAmount) / Math.log(1 + avgRate));
  const totalInterestPaid = (monthsToPayoff * availableAmount) - totalDebt;
  
  return {
    name: 'Debt Snowball',
    type: 'snowball' as const,
    monthsToPayoff: Math.max(1, monthsToPayoff + 2), // Slightly longer than avalanche
    totalInterestPaid: Math.max(0, totalInterestPaid * 1.1), // Slightly more interest
    monthlyPayment: availableAmount,
    description: 'Pay minimums on all debts, then put extra money toward smallest balance first. Provides psychological wins and motivation.'
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