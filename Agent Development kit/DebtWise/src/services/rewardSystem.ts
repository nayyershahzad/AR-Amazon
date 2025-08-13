import { RewardSystem, Achievement, BehavioralNudge } from '../types/debt';

export class RewardSystemService {
  
  // Base point values for different actions
  private static readonly POINT_VALUES = {
    payment: 10,           // 10 points per payment made
    learning: 5,           // 5 points per education module completed
    milestone: 50,         // 50 points for reaching debt milestones
    streak: 25,            // 25 points for maintaining streaks
    social: 15,            // 15 points for social engagement
    automation_setup: 100, // 100 points for setting up automation
  };

  // Cash conversion rate: 1 point = $0.05
  private static readonly CASH_CONVERSION_RATE = 0.05;

  /**
   * Calculate points earned for a specific action
   */
  static calculatePointsForAction(
    actionType: keyof typeof RewardSystemService.POINT_VALUES,
    actionData: any
  ): number {
    const basePoints = this.POINT_VALUES[actionType];
    let multiplier = 1;

    // Apply multipliers based on action data
    switch (actionType) {
      case 'payment':
        // Bonus points for payments above minimum
        if (actionData.isExtraPayment) {
          multiplier = 1.5;
        }
        // Bonus for large payments
        if (actionData.amount > 500) {
          multiplier *= 1.2;
        }
        break;
      
      case 'streak':
        // More points for longer streaks
        const streakLength = actionData.streakLength || 1;
        multiplier = Math.min(streakLength / 4, 3); // Max 3x multiplier
        break;
      
      case 'milestone':
        // Different milestone types have different rewards
        switch (actionData.milestoneType) {
          case 'first_payment':
            multiplier = 2;
            break;
          case 'debt_payoff':
            multiplier = 3;
            break;
          case 'halfway_point':
            multiplier = 1.5;
            break;
          default:
            multiplier = 1;
        }
        break;
    }

    return Math.round(basePoints * multiplier);
  }

  /**
   * Award points to user and update their reward system
   */
  static async awardPoints(
    userId: string,
    actionType: keyof typeof RewardSystemService.POINT_VALUES,
    actionData: any
  ): Promise<{
    pointsEarned: number;
    totalPoints: number;
    cashEarned: number;
    newAchievements: Achievement[];
    levelUp: boolean;
    motivationalMessage: string;
  }> {
    const pointsEarned = this.calculatePointsForAction(actionType, actionData);
    
    // In a real app, this would fetch from database
    const currentRewards = await this.getUserRewardSystem(userId);
    
    const newTotalPoints = currentRewards.totalPoints + pointsEarned;
    const newCashEarned = newTotalPoints * this.CASH_CONVERSION_RATE;
    
    // Check for new achievements
    const newAchievements = this.checkForNewAchievements(
      currentRewards, 
      actionType, 
      actionData, 
      newTotalPoints
    );
    
    // Check for level up
    const currentLevel = this.calculateLevel(currentRewards.totalPoints);
    const newLevel = this.calculateLevel(newTotalPoints);
    const levelUp = newLevel > currentLevel;
    
    // Generate motivational message
    const motivationalMessage = this.generateMotivationalMessage(
      actionType, 
      pointsEarned, 
      newAchievements, 
      levelUp
    );
    
    // Update user's reward system (in real app, save to database)
    await this.updateUserRewardSystem(userId, {
      totalPoints: newTotalPoints,
      cashEarned: newCashEarned,
      achievements: [...currentRewards.achievements, ...newAchievements],
      level: newLevel,
      nextLevelRequirement: this.getNextLevelRequirement(newLevel)
    });

    return {
      pointsEarned,
      totalPoints: newTotalPoints,
      cashEarned: newCashEarned,
      newAchievements,
      levelUp,
      motivationalMessage
    };
  }

  /**
   * Calculate user level based on total points
   */
  private static calculateLevel(totalPoints: number): number {
    // Level progression: 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 4500, 5500...
    let level = 1;
    let pointsNeeded = 100;
    let currentThreshold = 0;
    
    while (totalPoints >= currentThreshold + pointsNeeded) {
      currentThreshold += pointsNeeded;
      level++;
      pointsNeeded += 200; // Each level requires 200 more points than the previous
    }
    
    return level;
  }

  /**
   * Get points needed for next level
   */
  private static getNextLevelRequirement(currentLevel: number): number {
    const baseRequirement = 100;
    return baseRequirement + (currentLevel * 200);
  }

  /**
   * Check for new achievements based on action and current progress
   */
  private static checkForNewAchievements(
    currentRewards: RewardSystem,
    actionType: string,
    actionData: any,
    newTotalPoints: number
  ): Achievement[] {
    const achievements: Achievement[] = [];
    const now = new Date();

    // Payment-based achievements
    if (actionType === 'payment') {
      const paymentCount = actionData.paymentCount || 1;
      
      if (paymentCount === 1) {
        achievements.push({
          id: `achievement_first_payment_${Date.now()}`,
          userId: currentRewards.userId,
          type: 'first_payment',
          title: '🎯 First Payment Champion',
          description: 'Made your first debt payment - you\'re on your way!',
          pointsAwarded: 50,
          unlockedAt: now
        });
      }
      
      if (paymentCount === 10) {
        achievements.push({
          id: `achievement_payment_streak_${Date.now()}`,
          userId: currentRewards.userId,
          type: 'payment_consistency',
          title: '🔥 Payment Warrior',
          description: 'Made 10 payments - consistency is key to success!',
          pointsAwarded: 100,
          unlockedAt: now
        });
      }
    }

    // Points-based achievements
    if (newTotalPoints >= 500 && currentRewards.totalPoints < 500) {
      achievements.push({
        id: `achievement_500_points_${Date.now()}`,
        userId: currentRewards.userId,
        type: 'points_milestone',
        title: '🌟 Point Collector',
        description: 'Earned 500 points - you\'re building great financial habits!',
        pointsAwarded: 25,
        unlockedAt: now
      });
    }

    if (newTotalPoints >= 1000 && currentRewards.totalPoints < 1000) {
      achievements.push({
        id: `achievement_1000_points_${Date.now()}`,
        userId: currentRewards.userId,
        type: 'points_milestone',
        title: '🏆 Financial Superstar',
        description: 'Earned 1000 points - you\'re a debt-busting champion!',
        pointsAwarded: 50,
        unlockedAt: now
      });
    }

    return achievements;
  }

  /**
   * Generate motivational message based on action and rewards
   */
  private static generateMotivationalMessage(
    actionType: string,
    pointsEarned: number,
    newAchievements: Achievement[],
    levelUp: boolean
  ): string {
    const messages = [];

    // Action-specific messages
    switch (actionType) {
      case 'payment':
        messages.push(`🎉 Great job! You earned ${pointsEarned} points for making a payment.`);
        break;
      case 'learning':
        messages.push(`🧠 Nice! You earned ${pointsEarned} points for completing an education module.`);
        break;
      case 'milestone':
        messages.push(`🎯 Awesome! You hit a milestone and earned ${pointsEarned} points.`);
        break;
      default:
        messages.push(`✨ You earned ${pointsEarned} points! Keep up the great work.`);
    }

    // Achievement messages
    if (newAchievements.length > 0) {
      messages.push(`🏅 New achievement unlocked: ${newAchievements[0].title}`);
    }

    // Level up message
    if (levelUp) {
      messages.push(`🚀 Level Up! You've reached a new level in your debt freedom journey!`);
    }

    return messages.join(' ');
  }

  // In-memory storage for demo purposes (in real app, use database)
  private static userRewards: Map<string, RewardSystem> = new Map();

  /**
   * Get user's current reward system (mock implementation with persistence)
   */
  static async getUserRewardSystem(userId: string): Promise<RewardSystem> {
    // Get existing user data or create new
    if (!this.userRewards.has(userId)) {
      this.userRewards.set(userId, {
        userId,
        totalPoints: 0,
        cashEarned: 0,
        achievements: [],
        streaks: {
          paymentStreak: 0,
          learningStreak: 0,
          savingsStreak: 0
        },
        level: 1,
        nextLevelRequirement: 100
      });
    }
    
    return this.userRewards.get(userId)!;
  }

  /**
   * Update user's reward system (mock implementation with persistence)
   */
  private static async updateUserRewardSystem(
    userId: string, 
    updates: Partial<RewardSystem>
  ): Promise<void> {
    const current = await this.getUserRewardSystem(userId);
    const updated = { ...current, ...updates };
    this.userRewards.set(userId, updated);
    console.log(`Updated reward system for user ${userId}:`, updates);
  }

  /**
   * Get leaderboard data for social features
   */
  static async getLeaderboard(timeframe: 'week' | 'month' | 'all' = 'month'): Promise<{
    userId: string;
    name: string;
    points: number;
    level: number;
    rank: number;
  }[]> {
    // Mock leaderboard data
    return [
      { userId: 'user1', name: 'Sarah M.', points: 1250, level: 5, rank: 1 },
      { userId: 'user2', name: 'Mike D.', points: 980, level: 4, rank: 2 },
      { userId: 'user3', name: 'Lisa K.', points: 750, level: 3, rank: 3 },
      { userId: 'user4', name: 'John S.', points: 650, level: 3, rank: 4 },
      { userId: 'user5', name: 'Emma R.', points: 520, level: 2, rank: 5 }
    ];
  }

  /**
   * Generate personalized weekly challenges
   */
  static generateWeeklyChallenge(userProfile: any, rewardHistory: any): {
    id: string;
    title: string;
    description: string;
    target: number;
    reward: number;
    type: string;
    difficulty: 'easy' | 'medium' | 'hard';
  } {
    const challenges = [
      {
        id: 'extra_payment_challenge',
        title: 'Extra Payment Hero',
        description: 'Make one extra payment above your minimum this week',
        target: 1,
        reward: 75,
        type: 'payment',
        difficulty: 'easy' as const
      },
      {
        id: 'education_streak',
        title: 'Learning Streak Master',
        description: 'Complete 3 education modules this week',
        target: 3,
        reward: 100,
        type: 'learning',
        difficulty: 'medium' as const
      },
      {
        id: 'savings_goal',
        title: 'Savings Champion',
        description: 'Save $200 more than usual this week',
        target: 200,
        reward: 125,
        type: 'savings',
        difficulty: 'hard' as const
      }
    ];

    // Select challenge based on user's psychology profile and history
    // For now, return a random challenge
    return challenges[Math.floor(Math.random() * challenges.length)];
  }
}