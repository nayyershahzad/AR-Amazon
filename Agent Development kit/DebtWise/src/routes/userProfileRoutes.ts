import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from './authRoutes';
import crypto from 'crypto';

const router = express.Router();
const prisma = new PrismaClient();

// Get user's complete financial profile
router.get('/profile', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.id;
    console.log(`📖 Loading profile for user: ${userId}`);

    const userProfile = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        incomeStreams: true,
        expenseCategories: true,
        financialGoals: true,
        debts: true
      }
    });

    console.log(`📊 Found data - Incomes: ${userProfile?.incomeStreams.length}, Expenses: ${userProfile?.expenseCategories.length}, Goals: ${userProfile?.financialGoals.length}, Debts: ${userProfile?.debts.length}`);

    if (!userProfile) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    res.json({
      user: {
        id: userProfile.id,
        name: userProfile.name,
        email: userProfile.email,
        monthlyIncome: userProfile.monthlyIncome,
        monthlyExpenses: userProfile.monthlyExpenses,
        riskTolerance: userProfile.riskTolerance,
      },
      incomeStreams: userProfile.incomeStreams,
      expenseCategories: userProfile.expenseCategories,
      financialGoals: userProfile.financialGoals,
      debts: userProfile.debts
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// Save user's financial data (smart update - only when data actually exists)
router.post('/profile', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const { 
      primaryIncome,
      additionalIncomes = [],
      expenses = [],
      goals = [],
      debts = [],
      riskTolerance,
      forceUpdate = false  // Flag to indicate intentional save
    } = req.body;

    console.log(`💾 Save request for user: ${userId}`);
    console.log(`📊 Data received - Primary Income: ${primaryIncome}, Additional: ${additionalIncomes.length}, Expenses: ${expenses.length}, Goals: ${goals.length}, Debts: ${debts.length}`);
    console.log(`🔧 Force Update: ${forceUpdate}`);

    // Only proceed with update if there's actual data or forced update
    const hasData = primaryIncome > 0 || additionalIncomes.length > 0 || 
                   expenses.length > 0 || goals.length > 0 || debts.length > 0;
    
    if (!hasData && !forceUpdate) {
      console.log('⏭️ Skipping save - no data provided and not forced');
      return res.json({ 
        success: true, 
        message: 'No data to save - preserving existing data' 
      });
    }

    // Update user's basic info only if values are provided
    const updateData: any = {};
    if (primaryIncome !== undefined) updateData.monthlyIncome = primaryIncome;
    if (expenses.length > 0) {
      updateData.monthlyExpenses = expenses.reduce((sum: number, exp: any) => sum + (exp.amount || 0), 0);
    }
    if (riskTolerance) updateData.riskTolerance = riskTolerance;

    if (Object.keys(updateData).length > 0) {
      await prisma.user.update({
        where: { id: userId },
        data: updateData
      });
    }

    // Only clear and recreate data if we have new data to insert
    if (hasData || forceUpdate) {
      console.log('🗑️ Clearing existing data to insert new data');
      // Clear existing data and insert new data
      await prisma.incomeStream.deleteMany({ where: { userId } });
      await prisma.expenseCategory.deleteMany({ where: { userId } });
      await prisma.financialGoal.deleteMany({ where: { userId } });
      await prisma.debt.deleteMany({ where: { userId } });

    // Insert primary income
    if (primaryIncome > 0) {
      await prisma.incomeStream.create({
        data: {
          userId,
          source: 'Primary Income',
          amount: primaryIncome,
          description: 'Main salary/income',
          isPrimary: true
        }
      });
    }

    // Insert additional income streams
    if (additionalIncomes.length > 0) {
      await prisma.incomeStream.createMany({
        data: additionalIncomes.map((income: any) => ({
          userId,
          source: income.source || 'Additional Income',
          amount: income.amount || 0,
          description: income.description,
          isPrimary: false
        }))
      });
    }

    // Insert expense categories
    if (expenses.length > 0) {
      await prisma.expenseCategory.createMany({
        data: expenses.map((expense: any) => ({
          userId,
          category: expense.category || 'Other',
          amount: expense.amount || 0,
          description: expense.description
        }))
      });
    }

    // Insert financial goals
    if (goals.length > 0) {
      await prisma.financialGoal.createMany({
        data: goals.map((goal: any) => ({
          userId,
          category: goal.category || 'Other',
          description: goal.description || '',
          targetAmount: goal.targetAmount,
          targetDate: goal.targetDate ? new Date(goal.targetDate) : null,
          priority: goal.priority || 'medium',
          notes: goal.notes
        }))
      });
    }

    // Insert debts
    if (debts.length > 0) {
      await prisma.debt.createMany({
        data: debts.map((debt: any) => ({
          userId,
          name: debt.name || 'Unnamed Debt',
          balance: debt.balance || 0,
          interestRate: debt.interestRate || 0,
          minimumPayment: debt.minimumPayment || 0,
          automationEnabled: false,
          rewardPoints: 0,
          spendingTriggers: [],
          motivationType: 'milestone',
          riskTolerance: 'moderate',
          preferredRewardType: 'points',
          socialSharingEnabled: false,
          shareProgress: false,
          shareMilestones: false
        }))
      });
    }
    }

    res.json({ 
      success: true, 
      message: 'Financial profile saved successfully' 
    });

  } catch (error) {
    console.error('Error saving user profile:', error);
    res.status(500).json({ error: 'Failed to save user profile' });
  }
});

// Update specific income stream
router.put('/income/:id', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { source, amount, description } = req.body;

    const incomeStream = await prisma.incomeStream.updateMany({
      where: { id, userId },
      data: { source, amount, description }
    });

    if (incomeStream.count === 0) {
      return res.status(404).json({ error: 'Income stream not found' });
    }

    res.json({ success: true, message: 'Income stream updated' });
  } catch (error) {
    console.error('Error updating income stream:', error);
    res.status(500).json({ error: 'Failed to update income stream' });
  }
});

// Update specific expense category
router.put('/expense/:id', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { category, amount, description } = req.body;

    const expense = await prisma.expenseCategory.updateMany({
      where: { id, userId },
      data: { category, amount, description }
    });

    if (expense.count === 0) {
      return res.status(404).json({ error: 'Expense category not found' });
    }

    res.json({ success: true, message: 'Expense category updated' });
  } catch (error) {
    console.error('Error updating expense category:', error);
    res.status(500).json({ error: 'Failed to update expense category' });
  }
});

// Update specific financial goal
router.put('/goal/:id', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { category, description, targetAmount, targetDate, priority, notes, completed } = req.body;

    const goal = await prisma.financialGoal.updateMany({
      where: { id, userId },
      data: { 
        category, 
        description, 
        targetAmount, 
        targetDate: targetDate ? new Date(targetDate) : undefined,
        priority, 
        notes,
        completed 
      }
    });

    if (goal.count === 0) {
      return res.status(404).json({ error: 'Financial goal not found' });
    }

    res.json({ success: true, message: 'Financial goal updated' });
  } catch (error) {
    console.error('Error updating financial goal:', error);
    res.status(500).json({ error: 'Failed to update financial goal' });
  }
});

// Generate hash of user's financial data
const generateDataHash = (userProfile: any, debts: any[]) => {
  const dataString = JSON.stringify({
    income: userProfile.primaryIncome,
    additionalIncomes: userProfile.additionalIncomes,
    expenses: userProfile.expenses,
    goals: userProfile.goals,
    debts: debts,
    riskTolerance: userProfile.riskTolerance
  });
  return crypto.createHash('sha256').update(dataString).digest('hex');
};

// Save analysis result
router.post('/analysis', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const { 
      userProfile,
      debts,
      aiAnalysis,
      strategies,
      totalInterestSaved,
      recommendedStrategy,
      monthsToPayoff
    } = req.body;

    console.log(`💾 Saving analysis result for user: ${userId}`);

    // Generate hash of input data
    const inputDataHash = generateDataHash(userProfile, debts);

    // Mark all previous analyses as not latest
    await prisma.analysisResult.updateMany({
      where: { userId },
      data: { isLatest: false }
    });

    // Save new analysis
    const analysisResult = await prisma.analysisResult.create({
      data: {
        userId,
        inputDataHash,
        aiAnalysis: aiAnalysis || {},
        strategies: strategies || {},
        totalInterestSaved: totalInterestSaved || 0,
        recommendedStrategy: recommendedStrategy || '',
        monthsToPayoff: monthsToPayoff || 0,
        isLatest: true
      }
    });

    console.log(`✅ Analysis saved with ID: ${analysisResult.id}`);

    res.json({ 
      success: true, 
      analysisId: analysisResult.id,
      message: 'Analysis saved successfully' 
    });

  } catch (error) {
    console.error('Error saving analysis:', error);
    res.status(500).json({ error: 'Failed to save analysis' });
  }
});

// Get latest analysis result
router.get('/analysis', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.id;
    console.log(`📖 Loading latest analysis for user: ${userId}`);

    const latestAnalysis = await prisma.analysisResult.findFirst({
      where: { 
        userId,
        isLatest: true 
      },
      orderBy: { createdAt: 'desc' }
    });

    if (!latestAnalysis) {
      console.log('📊 No previous analysis found');
      return res.json({ analysis: null });
    }

    console.log(`📊 Found analysis from: ${latestAnalysis.createdAt}`);

    res.json({
      analysis: {
        id: latestAnalysis.id,
        aiAnalysis: latestAnalysis.aiAnalysis,
        strategies: latestAnalysis.strategies,
        totalInterestSaved: latestAnalysis.totalInterestSaved,
        recommendedStrategy: latestAnalysis.recommendedStrategy,
        monthsToPayoff: latestAnalysis.monthsToPayoff,
        createdAt: latestAnalysis.createdAt,
        inputDataHash: latestAnalysis.inputDataHash
      }
    });

  } catch (error) {
    console.error('Error loading analysis:', error);
    res.status(500).json({ error: 'Failed to load analysis' });
  }
});

// Check if analysis is outdated based on current data
router.post('/analysis/check-outdated', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const { userProfile, debts } = req.body;

    const currentDataHash = generateDataHash(userProfile, debts);

    const latestAnalysis = await prisma.analysisResult.findFirst({
      where: { 
        userId,
        isLatest: true 
      },
      orderBy: { createdAt: 'desc' }
    });

    if (!latestAnalysis) {
      return res.json({ isOutdated: true, hasAnalysis: false });
    }

    const isOutdated = latestAnalysis.inputDataHash !== currentDataHash;

    res.json({ 
      isOutdated,
      hasAnalysis: true,
      lastAnalyzed: latestAnalysis.createdAt
    });

  } catch (error) {
    console.error('Error checking analysis status:', error);
    res.status(500).json({ error: 'Failed to check analysis status' });
  }
});

export default router;