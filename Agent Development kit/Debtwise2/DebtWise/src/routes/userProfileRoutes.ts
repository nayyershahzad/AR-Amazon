import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from './authRoutes';
import crypto from 'crypto';
import { ProjectionService } from '../services/projectionService';

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
    console.log('💰 Current debt balances:', userProfile?.debts.map(d => ({ name: d.name, balance: d.balance })));

    if (!userProfile) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    return res.json({
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
    return res.status(500).json({ error: 'Failed to fetch user profile' });
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

    return res.json({ 
      success: true, 
      message: 'Financial profile saved successfully' 
    });

  } catch (error) {
    console.error('Error saving user profile:', error);
    return res.status(500).json({ error: 'Failed to save user profile' });
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

    return res.json({ success: true, message: 'Income stream updated' });
  } catch (error) {
    console.error('Error updating income stream:', error);
    return res.status(500).json({ error: 'Failed to update income stream' });
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

    return res.json({ success: true, message: 'Expense category updated' });
  } catch (error) {
    console.error('Error updating expense category:', error);
    return res.status(500).json({ error: 'Failed to update expense category' });
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

    return res.json({ success: true, message: 'Financial goal updated' });
  } catch (error) {
    console.error('Error updating financial goal:', error);
    return res.status(500).json({ error: 'Failed to update financial goal' });
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

    return res.json({
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
    return res.status(500).json({ error: 'Failed to load analysis' });
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

    return res.json({ 
      isOutdated,
      hasAnalysis: true,
      lastAnalyzed: latestAnalysis.createdAt
    });

  } catch (error) {
    console.error('Error checking analysis status:', error);
    return res.status(500).json({ error: 'Failed to check analysis status' });
  }
});

// Combined dashboard data endpoint - optimized for performance
router.get('/dashboard', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.id;
    console.log(`🚀 Loading optimized dashboard data for user: ${userId}`);

    // Single query to get all user data with optimized includes
    const userData = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        incomeStreams: {
          select: { id: true, source: true, amount: true, description: true, isPrimary: true }
        },
        expenseCategories: {
          select: { id: true, category: true, amount: true, description: true }
        },
        financialGoals: {
          select: { id: true, category: true, description: true, targetAmount: true, targetDate: true, priority: true, notes: true, completed: true }
        },
        debts: {
          select: { id: true, name: true, balance: true, originalBalance: true, interestRate: true, minimumPayment: true, automationEnabled: true, rewardPoints: true }
        },
        analysisResults: {
          where: { isLatest: true },
          select: { id: true, aiAnalysis: true, strategies: true, totalInterestSaved: true, recommendedStrategy: true, monthsToPayoff: true, createdAt: true, inputDataHash: true },
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    if (!userData) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    // Get strategy progress and upcoming payments in parallel
    const [strategyProgress, upcomingPayments, recentPayments] = await Promise.all([
      // Strategy progress
      prisma.strategyProgress.findUnique({
        where: { userId },
        select: {
          strategyType: true,
          originalTotalDebt: true,
          currentTotalDebt: true,
          originalMonthsToPayoff: true,
          currentMonthsRemaining: true,
          totalPaid: true,
          totalInterestPaid: true,
          totalInterestSaved: true,
          onTrack: true,
          completedPayments: true,
          missedPayments: true,
          extraPayments: true,
          skippedPayments: true,
          lastPaymentDate: true,
          nextPaymentDue: true
        }
      }),
      
      // Upcoming payments (next 3 months)
      prisma.plannedPayment.findMany({
        where: {
          userId,
          dueDate: {
            gte: new Date(),
            lte: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 3 months
          },
          status: 'pending',
          actualPaymentId: null
        },
        select: {
          id: true,
          monthNumber: true,
          dueDate: true,
          plannedAmount: true,
          debtName: true,
          remainingBalance: true,
          isPriority: true
        },
        orderBy: { dueDate: 'asc' },
        take: 10 // Limit to next 10 payments for performance
      }),

      // Recent payments (last 30 days)
      prisma.paymentRecord.findMany({
        where: {
          debt: { userId },
          date: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days
          }
        },
        select: {
          id: true,
          amount: true,
          date: true,
          type: true,
          status: true,
          notes: true,
          rewardPointsEarned: true,
          debt: {
            select: { name: true }
          }
        },
        orderBy: { date: 'desc' },
        take: 20 // Limit to 20 most recent
      })
    ]);

    // Calculate summary stats
    const totalDebt = userData.debts.reduce((sum, debt) => sum + debt.balance, 0);
    const totalIncome = userData.incomeStreams.reduce((sum, income) => sum + income.amount, 0);
    const totalExpenses = userData.expenseCategories.reduce((sum, expense) => sum + expense.amount, 0);
    
    const response = {
      profile: {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        monthlyIncome: userData.monthlyIncome,
        monthlyExpenses: userData.monthlyExpenses,
        selectedStrategy: userData.selectedStrategy,
        strategyStartDate: userData.strategyStartDate,
        incomeStreams: userData.incomeStreams,
        expenseCategories: userData.expenseCategories,
        financialGoals: userData.financialGoals,
        debts: userData.debts
      },
      analysis: userData.analysisResults[0] || null,
      strategyProgress: strategyProgress,
      upcomingPayments: upcomingPayments,
      recentPayments: recentPayments.map(payment => ({
        ...payment,
        debtName: payment.debt.name
      })),
      summary: {
        totalDebt: totalDebt,
        totalIncome: totalIncome,
        totalExpenses: totalExpenses,
        availableForDebt: totalIncome - totalExpenses,
        debtCount: userData.debts.length,
        completedGoals: userData.financialGoals.filter(g => g.completed).length,
        totalGoals: userData.financialGoals.length
      }
    };

    console.log(`✅ Dashboard data loaded - ${userData.debts.length} debts, ${upcomingPayments.length} upcoming payments`);
    
    return res.json(response);

  } catch (error) {
    console.error('Error loading dashboard data:', error);
    return res.status(500).json({ error: 'Failed to load dashboard data' });
  }
});

// Get current payment projections (6-month breakdown)
router.get('/projections', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.id;
    console.log(`📊 Loading current projections for user: ${userId}`);

    const projections = await ProjectionService.getProjections(userId);
    
    return res.json({
      success: true,
      projections
    });

  } catch (error) {
    console.error('Error loading projections:', error);
    return res.status(500).json({ error: 'Failed to load payment projections' });
  }
});

export default router;