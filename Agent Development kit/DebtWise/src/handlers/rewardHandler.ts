import { Request, Response } from 'express';
import { RewardSystemService } from '../services/rewardSystem';

export class RewardHandler {

  /**
   * Award points to user for an action
   */
  async awardPoints(req: Request, res: Response) {
    try {
      const { userId, actionType, actionData } = req.body;

      if (!userId || !actionType) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: userId and actionType'
        });
      }

      const result = await RewardSystemService.awardPoints(userId, actionType, actionData || {});

      // In real app, would emit socket event for real-time updates
      // io.to(userId).emit('reward_earned', result);

      res.json({
        success: true,
        data: result
      });

    } catch (error: any) {
      console.error('Error awarding points:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to award points',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Get user's reward summary
   */
  async getRewardSummary(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'Missing userId parameter'
        });
      }

      // Get actual user reward data (now persisted)
      const currentRewards = await RewardSystemService.getUserRewardSystem(userId);
      
      const rewardSummary = {
        ...currentRewards,
        pointsToNextLevel: currentRewards.nextLevelRequirement - (currentRewards.totalPoints % currentRewards.nextLevelRequirement),
        weeklyChallenge: RewardSystemService.generateWeeklyChallenge({}, {}),
        recentActivity: [
          {
            date: new Date(),
            action: 'payment',
            pointsEarned: 15,
            description: 'Extra payment on Credit Card'
          },
          {
            date: new Date(Date.now() - 86400000),
            action: 'learning',
            pointsEarned: 5,
            description: 'Completed "Debt Avalanche Strategy" module'
          }
        ]
      };

      res.json({
        success: true,
        data: rewardSummary
      });

    } catch (error: any) {
      console.error('Error getting reward summary:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get reward summary',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Get leaderboard data
   */
  async getLeaderboard(req: Request, res: Response) {
    try {
      const { timeframe } = req.query;
      const validTimeframes = ['week', 'month', 'all'];
      const selectedTimeframe = validTimeframes.includes(timeframe as string) 
        ? timeframe as 'week' | 'month' | 'all' 
        : 'month';

      const leaderboard = await RewardSystemService.getLeaderboard(selectedTimeframe);

      res.json({
        success: true,
        data: {
          timeframe: selectedTimeframe,
          leaders: leaderboard
        }
      });

    } catch (error: any) {
      console.error('Error getting leaderboard:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get leaderboard'
      });
    }
  }

  /**
   * Simulate different reward actions for testing
   */
  async simulateRewardAction(req: Request, res: Response) {
    try {
      const { actionType } = req.body;
      const userId = 'test_user_123';

      // Get current user data to make simulations more realistic
      const currentRewards = await RewardSystemService.getUserRewardSystem(userId);
      const simulationCount = (currentRewards.totalPoints / 10) + 1; // Rough estimate of actions taken
      
      const actionData = {
        payment: {
          amount: Math.floor(Math.random() * 300) + 100, // $100-$400
          isExtraPayment: Math.random() > 0.3, // 70% chance of extra payment
          paymentCount: Math.floor(simulationCount / 2) + 1
        },
        learning: {
          moduleId: 'debt_strategies_101',
          moduleName: 'Understanding Debt Strategies',
          completionTime: Math.floor(Math.random() * 30) + 10 // 10-40 minutes
        },
        milestone: {
          milestoneType: ['first_payment', 'halfway_point', 'debt_payoff'][Math.floor(Math.random() * 3)],
          debtReduced: Math.floor(Math.random() * 5000) + 1000
        },
        streak: {
          streakLength: Math.floor(Math.random() * 15) + 1,
          streakType: ['payment', 'learning', 'savings'][Math.floor(Math.random() * 3)]
        }
      };

      const result = await RewardSystemService.awardPoints(
        userId, 
        actionType, 
        actionData[actionType as keyof typeof actionData] || {}
      );

      res.json({
        success: true,
        message: `Simulated ${actionType} action`,
        data: result
      });

    } catch (error: any) {
      console.error('Error simulating reward action:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to simulate reward action'
      });
    }
  }

  /**
   * Get available challenges for user
   */
  async getChallenges(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      const challenges = [
        RewardSystemService.generateWeeklyChallenge({}, {}),
        {
          id: 'monthly_goal',
          title: 'Monthly Debt Destroyer',
          description: 'Pay off $1000 in debt this month',
          target: 1000,
          reward: 200,
          type: 'debt_reduction',
          difficulty: 'hard' as const,
          timeframe: 'month',
          progress: 650,
          daysLeft: 12
        }
      ];

      res.json({
        success: true,
        data: {
          activeChallenges: challenges,
          completedThisWeek: 1,
          totalRewardsEarned: 175
        }
      });

    } catch (error: any) {
      console.error('Error getting challenges:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get challenges'
      });
    }
  }
}