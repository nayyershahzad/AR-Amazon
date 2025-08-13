import { 
  UserSocialProfile, 
  DebtPayoffGroup, 
  GroupChallenge, 
  CommunityPost, 
  MentorshipProgram,
  SocialLeaderboard,
  SocialNotification,
  SocialAnalytics,
  SocialAchievement,
  LeaderboardEntry,
  ChallengeParticipant,
  GroupMember
} from '../types/social';

export class SocialService {
  private static socialProfiles: Map<string, UserSocialProfile> = new Map();
  private static groups: Map<string, DebtPayoffGroup> = new Map();
  private static challenges: Map<string, GroupChallenge> = new Map();
  private static posts: Map<string, CommunityPost> = new Map();
  private static leaderboards: Map<string, SocialLeaderboard> = new Map();
  private static notifications: Map<string, SocialNotification[]> = new Map();
  private static mentorshipPrograms: Map<string, MentorshipProgram> = new Map();

  static {
    // Initialize with demo data
    this.initializeDemoData();
  }

  private static initializeDemoData() {
    // Create demo social profiles
    const demoProfiles: UserSocialProfile[] = [
      {
        userId: 'demo_user_123',
        displayName: 'Alex Johnson',
        avatar: '👨‍💼',
        bio: 'Paying off $50k in student loans and credit card debt. Sharing my journey and tips!',
        privacySettings: {
          profileVisibility: 'public',
          shareDebtProgress: true,
          sharePaymentActivity: true,
          shareEducationProgress: true,
          allowFriendRequests: true,
          allowMessages: true,
          showInLeaderboards: true,
          shareAchievements: true,
          allowGroupInvites: true
        },
        socialStats: {
          totalConnections: 45,
          groupsJoined: 3,
          challengesCompleted: 8,
          helpfulVotes: 127,
          postsCreated: 23,
          commentsPosted: 89,
          likesReceived: 245,
          sharesReceived: 34,
          mentorshipSessions: 12
        },
        joinedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 days ago
        lastActiveAt: new Date(),
        achievements: [],
        friends: ['user_456', 'user_789', 'user_101'],
        following: ['mentor_001', 'expert_002'],
        followers: ['user_201', 'user_202', 'user_203'],
        blockedUsers: [],
        reputation: 1250,
        verificationLevel: 'email'
      },
      {
        userId: 'user_456',
        displayName: 'Sarah Chen',
        avatar: '👩‍🎓',
        bio: 'Debt-free journey champion! Paid off $75k in 18 months. Here to help others!',
        privacySettings: {
          profileVisibility: 'public',
          shareDebtProgress: true,
          sharePaymentActivity: false,
          shareEducationProgress: true,
          allowFriendRequests: true,
          allowMessages: true,
          showInLeaderboards: true,
          shareAchievements: true,
          allowGroupInvites: true
        },
        socialStats: {
          totalConnections: 123,
          groupsJoined: 5,
          challengesCompleted: 15,
          helpfulVotes: 456,
          postsCreated: 67,
          commentsPosted: 234,
          likesReceived: 789,
          sharesReceived: 123,
          mentorshipSessions: 45
        },
        joinedAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000), // 180 days ago
        lastActiveAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        achievements: [],
        friends: ['demo_user_123', 'user_789'],
        following: ['mentor_001'],
        followers: ['demo_user_123', 'user_101', 'user_201'],
        blockedUsers: [],
        reputation: 3450,
        verificationLevel: 'verified'
      },
      {
        userId: 'mentor_001',
        displayName: 'Dr. Michael Roberts',
        avatar: '👨‍🏫',
        bio: 'Financial advisor with 15+ years experience. Helping people achieve debt freedom.',
        privacySettings: {
          profileVisibility: 'public',
          shareDebtProgress: false,
          sharePaymentActivity: false,
          shareEducationProgress: true,
          allowFriendRequests: true,
          allowMessages: true,
          showInLeaderboards: false,
          shareAchievements: true,
          allowGroupInvites: false
        },
        socialStats: {
          totalConnections: 567,
          groupsJoined: 2,
          challengesCompleted: 3,
          helpfulVotes: 1234,
          postsCreated: 145,
          commentsPosted: 567,
          likesReceived: 2345,
          sharesReceived: 456,
          mentorshipSessions: 234
        },
        joinedAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), // 1 year ago
        lastActiveAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        achievements: [],
        friends: [],
        following: [],
        followers: ['demo_user_123', 'user_456', 'user_789'],
        blockedUsers: [],
        reputation: 8750,
        verificationLevel: 'verified'
      }
    ];

    demoProfiles.forEach(profile => {
      this.socialProfiles.set(profile.userId, profile);
    });

    // Create demo groups
    const demoGroups: DebtPayoffGroup[] = [
      {
        id: 'group_debt_busters',
        name: 'Debt Busters United',
        description: 'A supportive community for aggressive debt payoff strategies. We celebrate every victory, no matter how small!',
        category: 'support',
        privacy: 'public',
        memberCount: 234,
        maxMembers: 500,
        createdBy: 'user_456',
        moderators: ['user_456', 'mentor_001'],
        members: [
          {
            userId: 'demo_user_123',
            displayName: 'Alex Johnson',
            avatar: '👨‍💼',
            role: 'member',
            joinedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            contributionScore: 85,
            lastActiveAt: new Date(),
            permissions: ['post', 'comment', 'vote'],
            memberStats: {
              postsCreated: 5,
              commentsPosted: 23,
              likesGiven: 45,
              helpfulResponses: 12,
              challengesCompleted: 2,
              milestonesCelebrated: 8
            }
          },
          {
            userId: 'user_456',
            displayName: 'Sarah Chen',
            avatar: '👩‍🎓',
            role: 'moderator',
            joinedAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000),
            contributionScore: 98,
            lastActiveAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
            permissions: ['post', 'comment', 'vote', 'moderate', 'pin'],
            memberStats: {
              postsCreated: 34,
              commentsPosted: 145,
              likesGiven: 289,
              helpfulResponses: 67,
              challengesCompleted: 8,
              milestonesCelebrated: 45
            }
          }
        ],
        rules: [
          'Be respectful and supportive of all members',
          'No spam or self-promotion without approval',
          'Share your wins and challenges openly',
          'Keep financial advice general - not personalized advice',
          'Celebrate others\' milestones with genuine enthusiasm'
        ],
        tags: ['debt-payoff', 'support', 'motivation', 'community'],
        createdAt: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
        isActive: true,
        groupStats: {
          totalDebtPaidOff: 2340000, // $2.34M
          averageMonthlyProgress: 15.7, // 15.7% monthly reduction
          activeChallenges: 2,
          completedChallenges: 12,
          totalMilestones: 456,
          engagementScore: 92,
          successRate: 78
        },
        currentChallenge: {
          id: 'challenge_debt_destroyer_march',
          groupId: 'group_debt_busters',
          title: 'March Debt Destroyer Challenge',
          description: 'Pay off as much debt as possible in March! Extra points for consistency and helping others.',
          type: 'debt_reduction',
          startDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
          status: 'active',
          participants: [
            {
              userId: 'demo_user_123',
              displayName: 'Alex Johnson',
              avatar: '👨‍💼',
              joinedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
              status: 'active',
              progress: { debtReduction: 2400, paymentsCount: 8, streakDays: 12 },
              score: 2400,
              rank: 1,
              achievements: ['consistency_master', 'helper_badge']
            },
            {
              userId: 'user_456',
              displayName: 'Sarah Chen',
              avatar: '👩‍🎓',
              joinedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
              status: 'active',
              progress: { debtReduction: 1800, paymentsCount: 12, streakDays: 14 },
              score: 2200,
              rank: 2,
              achievements: ['streak_champion']
            }
          ],
          rules: [
            {
              id: 'rule_1',
              title: 'Debt Reduction Points',
              description: '1 point per dollar of debt paid off',
              type: 'scoring',
              parameters: { pointsPerDollar: 1 },
              pointValue: 1
            },
            {
              id: 'rule_2',
              title: 'Consistency Bonus',
              description: 'Bonus points for making payments on consecutive days',
              type: 'bonus',
              parameters: { bonusPerDay: 50 },
              pointValue: 50
            },
            {
              id: 'rule_3',
              title: 'Helper Bonus',
              description: 'Bonus points for helping other members',
              type: 'bonus',
              parameters: { bonusPerHelpfulComment: 25 },
              pointValue: 25
            }
          ],
          rewards: [
            {
              id: 'reward_winner',
              type: 'badge',
              title: 'March Debt Destroyer Champion',
              description: 'Winner of the March Debt Destroyer Challenge',
              value: { badgeId: 'march_destroyer_champion', points: 500 },
              criteria: 'winner'
            },
            {
              id: 'reward_top3',
              type: 'points',
              title: 'Top 3 Finisher Bonus',
              description: 'Extra points for top 3 finishers',
              value: 250,
              criteria: 'top_3'
            }
          ],
          leaderboard: [
            {
              rank: 1,
              userId: 'demo_user_123',
              displayName: 'Alex Johnson',
              avatar: '👨‍💼',
              score: 2400,
              progress: { debtReduction: 2400, paymentsCount: 8, streakDays: 12 },
              achievements: ['consistency_master', 'helper_badge'],
              trend: 'up'
            },
            {
              rank: 2,
              userId: 'user_456',
              displayName: 'Sarah Chen',
              avatar: '👩‍🎓',
              score: 2200,
              progress: { debtReduction: 1800, paymentsCount: 12, streakDays: 14 },
              achievements: ['streak_champion'],
              trend: 'same'
            }
          ],
          progress: {
            totalParticipants: 45,
            activeParticipants: 42,
            completedParticipants: 0,
            averageScore: 1250,
            topScore: 2400,
            milestones: [
              {
                id: 'milestone_1000',
                title: 'Group $10,000 Milestone',
                description: 'Group has collectively paid off $10,000',
                targetValue: 10000,
                currentValue: 12400,
                achievedBy: ['demo_user_123', 'user_456'],
                achievedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
                celebrationMessage: '🎉 Amazing! We\'ve smashed through our first milestone!'
              }
            ],
            timeline: [
              {
                timestamp: new Date(),
                userId: 'demo_user_123',
                displayName: 'Alex Johnson',
                action: 'Made a $500 payment towards credit card debt',
                details: { amount: 500, debtType: 'credit_card' },
                pointsAwarded: 500
              }
            ]
          },
          createdBy: 'user_456',
          prizePot: 1000
        }
      },
      {
        id: 'group_budgeting_masters',
        name: 'Budgeting Masters',
        description: 'Learn and master budgeting techniques together. Share tips, templates, and success stories!',
        category: 'education',
        privacy: 'public',
        memberCount: 156,
        maxMembers: 300,
        createdBy: 'mentor_001',
        moderators: ['mentor_001'],
        members: [],
        rules: [
          'Share practical budgeting tips and resources',
          'Post budget templates and tools for others to use',
          'Ask questions and help others with budgeting challenges',
          'Celebrate budgeting wins and milestones'
        ],
        tags: ['budgeting', 'education', 'tools', 'templates'],
        createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        isActive: true,
        groupStats: {
          totalDebtPaidOff: 890000,
          averageMonthlyProgress: 12.3,
          activeChallenges: 1,
          completedChallenges: 6,
          totalMilestones: 234,
          engagementScore: 87,
          successRate: 84
        }
      }
    ];

    demoGroups.forEach(group => {
      this.groups.set(group.id, group);
    });

    // Create demo leaderboards
    const demoLeaderboards: SocialLeaderboard[] = [
      {
        id: 'leaderboard_debt_reduction',
        title: 'Debt Reduction Champions',
        description: 'Top performers in debt payoff this month',
        type: 'debt_reduction',
        timeframe: 'monthly',
        entries: [
          {
            rank: 1,
            userId: 'demo_user_123',
            displayName: 'Alex Johnson',
            avatar: '👨‍💼',
            score: 8500,
            previousRank: 3,
            trend: 'up',
            trendChange: 2,
            badges: ['debt_destroyer', 'consistency_champion'],
            achievements: ['march_milestone', 'payment_streak'],
            streak: 15,
            additionalStats: { totalPaid: 8500, paymentsCount: 12 }
          },
          {
            rank: 2,
            userId: 'user_456',
            displayName: 'Sarah Chen',
            avatar: '👩‍🎓',
            score: 7200,
            previousRank: 1,
            trend: 'down',
            trendChange: -1,
            badges: ['debt_free_champion', 'mentor_badge'],
            achievements: ['helper_extraordinaire'],
            streak: 8,
            additionalStats: { totalPaid: 7200, paymentsCount: 18 }
          },
          {
            rank: 3,
            userId: 'user_789',
            displayName: 'Mike Thompson',
            avatar: '👨‍🔧',
            score: 6800,
            previousRank: 2,
            trend: 'down',
            trendChange: -1,
            badges: ['steady_progress'],
            achievements: ['first_thousand'],
            streak: 22,
            additionalStats: { totalPaid: 6800, paymentsCount: 9 }
          }
        ],
        lastUpdated: new Date(),
        nextUpdate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        totalParticipants: 1247,
        averageScore: 3250,
        prizes: [
          {
            rankRange: '1',
            title: 'Champion\'s Crown',
            description: 'Special champion badge and 1000 bonus points',
            type: 'badge',
            value: { badgeId: 'monthly_champion', points: 1000 }
          },
          {
            rankRange: '2-5',
            title: 'Top Performer Recognition',
            description: '500 bonus points and featured profile',
            type: 'points',
            value: 500
          }
        ]
      },
      {
        id: 'leaderboard_community_helper',
        title: 'Community Helper Heroes',
        description: 'Most helpful community members this week',
        type: 'community_engagement',
        timeframe: 'weekly',
        entries: [
          {
            rank: 1,
            userId: 'user_456',
            displayName: 'Sarah Chen',
            avatar: '👩‍🎓',
            score: 245,
            previousRank: 1,
            trend: 'same',
            trendChange: 0,
            badges: ['helper_champion', 'mentor_badge'],
            achievements: ['weekly_helper'],
            streak: 4,
            additionalStats: { helpfulVotes: 245, responsesGiven: 67 }
          },
          {
            rank: 2,
            userId: 'mentor_001',
            displayName: 'Dr. Michael Roberts',
            avatar: '👨‍🏫',
            score: 198,
            previousRank: 2,
            trend: 'same',
            trendChange: 0,
            badges: ['expert_mentor', 'verified_advisor'],
            achievements: ['knowledge_sharer'],
            streak: 12,
            additionalStats: { helpfulVotes: 198, responsesGiven: 45 }
          },
          {
            rank: 3,
            userId: 'demo_user_123',
            displayName: 'Alex Johnson',
            avatar: '👨‍💼',
            score: 127,
            previousRank: 4,
            trend: 'up',
            trendChange: 1,
            badges: ['rising_helper'],
            achievements: ['first_helpful_response'],
            streak: 2,
            additionalStats: { helpfulVotes: 127, responsesGiven: 34 }
          }
        ],
        lastUpdated: new Date(),
        nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        totalParticipants: 578,
        averageScore: 45,
        prizes: []
      }
    ];

    demoLeaderboards.forEach(leaderboard => {
      this.leaderboards.set(leaderboard.id, leaderboard);
    });

    // Create demo posts
    const demoPosts: CommunityPost[] = [
      {
        id: 'post_milestone_victory',
        authorId: 'demo_user_123',
        authorName: 'Alex Johnson',
        authorAvatar: '👨‍💼',
        content: '🎉 HUGE MILESTONE ALERT! Just paid off my first credit card completely! $8,500 down, $41,500 to go. The avalanche method is really working! Thanks to everyone in this community for the support and motivation. Next target: the high-interest personal loan. Who else is crushing their debt goals this month? 💪',
        type: 'milestone',
        tags: ['milestone', 'credit-card', 'avalanche-method', 'victory'],
        attachments: [
          {
            id: 'chart_debt_progress',
            type: 'chart',
            url: '/charts/debt_progress_alex.png',
            title: 'My Debt Progress Chart',
            description: 'Visual representation of debt payoff progress',
            metadata: { chartType: 'progress', totalDebt: 50000, paidOff: 8500 }
          }
        ],
        privacy: 'public',
        likes: [
          { userId: 'user_456', displayName: 'Sarah Chen', type: 'celebrate', createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) },
          { userId: 'mentor_001', displayName: 'Dr. Michael Roberts', type: 'support', createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000) },
          { userId: 'user_789', displayName: 'Mike Thompson', type: 'like', createdAt: new Date(Date.now() - 30 * 60 * 1000) }
        ],
        comments: [
          {
            id: 'comment_1',
            authorId: 'user_456',
            authorName: 'Sarah Chen',
            authorAvatar: '👩‍🎓',
            content: 'This is AMAZING Alex! 🎉 I remember when I paid off my first card - such an incredible feeling. Keep up the momentum, you\'ve got this! The avalanche method worked perfectly for me too.',
            likes: [
              { userId: 'demo_user_123', displayName: 'Alex Johnson', type: 'helpful', createdAt: new Date(Date.now() - 30 * 60 * 1000) }
            ],
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
            updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
            isEdited: false,
            moderationStatus: 'approved'
          },
          {
            id: 'comment_2',
            authorId: 'mentor_001',
            authorName: 'Dr. Michael Roberts',
            authorAvatar: '👨‍🏫',
            content: 'Congratulations on this significant milestone! Your disciplined approach is paying off. Consider celebrating this win while staying focused on the next goal. What\'s your plan for the extra cash flow from this paid-off card?',
            likes: [
              { userId: 'demo_user_123', displayName: 'Alex Johnson', type: 'helpful', createdAt: new Date(Date.now() - 15 * 60 * 1000) }
            ],
            createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
            updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
            isEdited: false,
            moderationStatus: 'approved'
          }
        ],
        shares: [
          { userId: 'user_456', displayName: 'Sarah Chen', platform: 'internal', sharedAt: new Date(Date.now() - 1 * 60 * 60 * 1000) }
        ],
        views: 234,
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
        isPinned: false,
        isEdited: false,
        moderationStatus: 'approved'
      },
      {
        id: 'post_question_budgeting',
        authorId: 'user_101',
        authorName: 'Emma Wilson',
        authorAvatar: '👩‍💻',
        content: 'Need some advice from the budgeting experts here! I\'ve been trying to stick to a 50/30/20 budget but I keep overspending on the "wants" category. How do you all handle impulse purchases and stick to your budget? Any tips or tools that have worked for you? 🤔',
        type: 'question',
        tags: ['budgeting', 'advice', '50-30-20', 'impulse-spending'],
        attachments: [],
        privacy: 'public',
        likes: [
          { userId: 'mentor_001', displayName: 'Dr. Michael Roberts', type: 'helpful', createdAt: new Date(Date.now() - 30 * 60 * 1000) }
        ],
        comments: [
          {
            id: 'comment_budget_tip',
            authorId: 'user_456',
            authorName: 'Sarah Chen',
            authorAvatar: '👩‍🎓',
            content: 'I used to have the same problem! What helped me was the 24-hour rule - wait 24 hours before buying anything non-essential. Also, I switched to cash for my "wants" category. When the cash is gone, I\'m done for the month! 💡',
            likes: [
              { userId: 'user_101', displayName: 'Emma Wilson', type: 'helpful', createdAt: new Date(Date.now() - 15 * 60 * 1000) }
            ],
            createdAt: new Date(Date.now() - 45 * 60 * 1000),
            updatedAt: new Date(Date.now() - 45 * 60 * 1000),
            isEdited: false,
            moderationStatus: 'approved'
          }
        ],
        shares: [],
        views: 89,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        isPinned: false,
        isEdited: false,
        moderationStatus: 'approved'
      }
    ];

    demoPosts.forEach(post => {
      this.posts.set(post.id, post);
    });
  }

  static async getUserSocialProfile(userId: string): Promise<UserSocialProfile> {
    let profile = this.socialProfiles.get(userId);
    
    if (!profile) {
      // Create default profile for new users
      profile = {
        userId,
        displayName: 'DebtWise User',
        avatar: '👤',
        bio: 'On my journey to financial freedom!',
        privacySettings: {
          profileVisibility: 'public',
          shareDebtProgress: true,
          sharePaymentActivity: false,
          shareEducationProgress: true,
          allowFriendRequests: true,
          allowMessages: true,
          showInLeaderboards: true,
          shareAchievements: true,
          allowGroupInvites: true
        },
        socialStats: {
          totalConnections: 0,
          groupsJoined: 0,
          challengesCompleted: 0,
          helpfulVotes: 0,
          postsCreated: 0,
          commentsPosted: 0,
          likesReceived: 0,
          sharesReceived: 0,
          mentorshipSessions: 0
        },
        joinedAt: new Date(),
        lastActiveAt: new Date(),
        achievements: [],
        friends: [],
        following: [],
        followers: [],
        blockedUsers: [],
        reputation: 100,
        verificationLevel: 'none'
      };
      
      this.socialProfiles.set(userId, profile);
    }
    
    return profile;
  }

  static async getAvailableGroups(userId: string, category?: string): Promise<DebtPayoffGroup[]> {
    let groups = Array.from(this.groups.values());
    
    // Filter by category if specified
    if (category) {
      groups = groups.filter(group => group.category === category);
    }
    
    // Filter out private groups user doesn't have access to
    const profile = await this.getUserSocialProfile(userId);
    groups = groups.filter(group => {
      if (group.privacy === 'public') return true;
      if (group.privacy === 'private') return group.members.some(member => member.userId === userId);
      return false; // invite_only groups would need special logic
    });
    
    return groups.sort((a, b) => b.memberCount - a.memberCount);
  }

  static async joinGroup(userId: string, groupId: string): Promise<{ success: boolean; message: string }> {
    const group = this.groups.get(groupId);
    const profile = await this.getUserSocialProfile(userId);
    
    if (!group) {
      return { success: false, message: 'Group not found' };
    }
    
    if (group.members.some(member => member.userId === userId)) {
      return { success: false, message: 'Already a member of this group' };
    }
    
    if (group.maxMembers && group.memberCount >= group.maxMembers) {
      return { success: false, message: 'Group is full' };
    }
    
    // Add user to group
    const newMember: GroupMember = {
      userId,
      displayName: profile.displayName,
      avatar: profile.avatar,
      role: 'member',
      joinedAt: new Date(),
      contributionScore: 0,
      lastActiveAt: new Date(),
      permissions: ['post', 'comment', 'vote'],
      memberStats: {
        postsCreated: 0,
        commentsPosted: 0,
        likesGiven: 0,
        helpfulResponses: 0,
        challengesCompleted: 0,
        milestonesCelebrated: 0
      }
    };
    
    group.members.push(newMember);
    group.memberCount++;
    group.updatedAt = new Date();
    
    // Update user's social stats
    profile.socialStats.groupsJoined++;
    
    return { success: true, message: `Successfully joined ${group.name}!` };
  }

  static async getGroupDetails(groupId: string): Promise<DebtPayoffGroup | null> {
    return this.groups.get(groupId) || null;
  }

  static async getLeaderboards(type?: string): Promise<SocialLeaderboard[]> {
    let leaderboards = Array.from(this.leaderboards.values());
    
    if (type) {
      leaderboards = leaderboards.filter(lb => lb.type === type);
    }
    
    return leaderboards.sort((a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime());
  }

  static async getCommunityPosts(filters?: {
    type?: string;
    groupId?: string;
    authorId?: string;
    tags?: string[];
    limit?: number;
  }): Promise<CommunityPost[]> {
    let posts = Array.from(this.posts.values());
    
    if (filters) {
      if (filters.type) {
        posts = posts.filter(post => post.type === filters.type);
      }
      if (filters.groupId) {
        posts = posts.filter(post => post.groupId === filters.groupId);
      }
      if (filters.authorId) {
        posts = posts.filter(post => post.authorId === filters.authorId);
      }
      if (filters.tags && filters.tags.length > 0) {
        posts = posts.filter(post => 
          post.tags.some(tag => filters.tags!.includes(tag))
        );
      }
    }
    
    // Sort by creation date (newest first)
    posts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    if (filters?.limit) {
      posts = posts.slice(0, filters.limit);
    }
    
    return posts;
  }

  static async createPost(userId: string, postData: {
    content: string;
    type: string;
    tags: string[];
    groupId?: string;
    attachments?: any[];
  }): Promise<CommunityPost> {
    const profile = await this.getUserSocialProfile(userId);
    
    const post: CommunityPost = {
      id: `post_${Date.now()}`,
      authorId: userId,
      authorName: profile.displayName,
      authorAvatar: profile.avatar,
      content: postData.content,
      type: postData.type as any,
      tags: postData.tags,
      attachments: postData.attachments || [],
      privacy: 'public',
      groupId: postData.groupId,
      likes: [],
      comments: [],
      shares: [],
      views: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      isPinned: false,
      isEdited: false,
      moderationStatus: 'approved'
    };
    
    this.posts.set(post.id, post);
    
    // Update user's social stats
    profile.socialStats.postsCreated++;
    
    return post;
  }

  static async likePost(userId: string, postId: string, reactionType: string = 'like'): Promise<boolean> {
    const post = this.posts.get(postId);
    const profile = await this.getUserSocialProfile(userId);
    
    if (!post) return false;
    
    // Remove existing like from this user
    post.likes = post.likes.filter(like => like.userId !== userId);
    
    // Add new like
    post.likes.push({
      userId,
      displayName: profile.displayName,
      type: reactionType as any,
      createdAt: new Date()
    });
    
    return true;
  }

  static async addComment(userId: string, postId: string, content: string): Promise<boolean> {
    const post = this.posts.get(postId);
    const profile = await this.getUserSocialProfile(userId);
    
    if (!post) return false;
    
    const comment = {
      id: `comment_${Date.now()}`,
      authorId: userId,
      authorName: profile.displayName,
      authorAvatar: profile.avatar,
      content,
      likes: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      isEdited: false,
      moderationStatus: 'approved' as const
    };
    
    post.comments.push(comment);
    
    // Update user's social stats
    profile.socialStats.commentsPosted++;
    
    return true;
  }

  static async getSocialAnalytics(userId: string): Promise<SocialAnalytics> {
    const profile = await this.getUserSocialProfile(userId);
    
    return {
      userId,
      period: 'all_time',
      engagement: {
        postsCreated: profile.socialStats.postsCreated,
        commentsPosted: profile.socialStats.commentsPosted,
        likesGiven: 156, // Simulated
        likesReceived: profile.socialStats.likesReceived,
        sharesGiven: 23, // Simulated
        sharesReceived: profile.socialStats.sharesReceived,
        viewsGenerated: 4567, // Simulated
        timeSpentInCommunity: 12500, // minutes, simulated
        responseRate: 0.75, // Simulated
        activeHours: ['9:00-11:00', '19:00-22:00']
      },
      influence: {
        followers: profile.followers.length,
        following: profile.following.length,
        menteesCount: 0, // Simulated
        helpfulVotes: profile.socialStats.helpfulVotes,
        postReach: 2340, // Simulated
        engagementRate: 0.12, // Simulated
        influenceScore: Math.round(profile.reputation / 10),
        topPosts: ['post_milestone_victory']
      },
      support: {
        supportRequestsHelped: 34, // Simulated
        supportRequestsMade: 8, // Simulated
        mentorshipSessions: profile.socialStats.mentorshipSessions,
        groupContributions: 67, // Simulated
        challengeSupport: 23, // Simulated
        encouragementGiven: 145, // Simulated
        supportScore: 85 // Simulated
      },
      growth: {
        newConnections: 12, // Simulated for this month
        groupsJoined: profile.socialStats.groupsJoined,
        challengesParticipated: 5, // Simulated
        skillsLearned: 8, // Simulated
        milestonesAchieved: 15, // Simulated
        progressRate: 0.23, // Simulated
        consistencyScore: 78 // Simulated
      },
      achievements: {
        totalAchievements: profile.achievements.length,
        recentAchievements: 3, // Simulated for this month
        rareBadges: 2, // Simulated
        socialAchievements: 5, // Simulated
        leaderboardAppearances: 8, // Simulated
        recognitionReceived: 23 // Simulated
      },
      trends: [], // Would contain historical data
      recommendations: [
        {
          type: 'join_group',
          title: 'Join a Budgeting Group',
          description: 'Based on your interests, you might enjoy our Budgeting Masters group',
          action: 'Join Budgeting Masters',
          priority: 'medium',
          targetId: 'group_budgeting_masters',
          estimatedImpact: 'Connect with like-minded budgeters and learn new strategies',
          timeCommitment: '15-30 minutes daily'
        },
        {
          type: 'share_milestone',
          title: 'Share Your Progress',
          description: 'Your recent debt payoff milestone deserves celebration!',
          action: 'Create Milestone Post',
          priority: 'high',
          estimatedImpact: 'Inspire others and receive community support',
          timeCommitment: '5-10 minutes'
        }
      ]
    };
  }

  static async createDemoSocialProfile(userId: string): Promise<{
    profile: UserSocialProfile;
    groups: DebtPayoffGroup[];
    leaderboards: SocialLeaderboard[];
    posts: CommunityPost[];
    analytics: SocialAnalytics;
  }> {
    // Get existing demo profile or create enhanced one
    const profile = this.socialProfiles.get(userId) || await this.getUserSocialProfile(userId);
    
    // Update with demo data
    profile.displayName = 'Alex Johnson';
    profile.avatar = '👨‍💼';
    profile.bio = 'Paying off $50k in student loans and credit card debt. Sharing my journey and tips!';
    profile.socialStats.totalConnections = 45;
    profile.socialStats.groupsJoined = 3;
    profile.socialStats.challengesCompleted = 8;
    profile.socialStats.helpfulVotes = 127;
    profile.socialStats.postsCreated = 23;
    profile.socialStats.likesReceived = 245;
    profile.reputation = 1250;
    profile.verificationLevel = 'email';
    
    // Add some achievements
    profile.achievements = [
      {
        id: 'social_welcome',
        type: 'social_milestone',
        title: 'Welcome to the Community!',
        description: 'Joined DebtWise social community',
        icon: '👋',
        earnedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        rarity: 'common',
        pointsAwarded: 50,
        sharable: true
      },
      {
        id: 'first_post',
        type: 'social_milestone',
        title: 'First Post Champion',
        description: 'Created your first community post',
        icon: '📝',
        earnedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
        rarity: 'common',
        pointsAwarded: 25,
        sharable: true
      },
      {
        id: 'helpful_member',
        type: 'community_helper',
        title: 'Helpful Community Member',
        description: 'Received 100+ helpful votes from other members',
        icon: '🤝',
        earnedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        rarity: 'rare',
        pointsAwarded: 200,
        sharable: true
      }
    ];
    
    this.socialProfiles.set(userId, profile);
    
    const groups = await this.getAvailableGroups(userId);
    const leaderboards = await this.getLeaderboards();
    const posts = await this.getCommunityPosts({ limit: 10 });
    const analytics = await this.getSocialAnalytics(userId);
    
    return {
      profile,
      groups,
      leaderboards,
      posts,
      analytics
    };
  }

  static async simulateSocialActivity(userId: string, activityType: string): Promise<{
    success: boolean;
    message: string;
    data?: any;
  }> {
    const profile = await this.getUserSocialProfile(userId);
    
    switch (activityType) {
      case 'create_milestone_post':
        const post = await this.createPost(userId, {
          content: '🎉 Just paid off another $1,200 this month! Feeling so motivated by all the support from this amazing community. Only $3,800 left on this credit card! Who else is crushing their goals this month? 💪 #DebtFreeJourney #Motivation',
          type: 'milestone',
          tags: ['milestone', 'motivation', 'credit-card', 'debt-free-journey'],
          attachments: []
        });
        
        return {
          success: true,
          message: 'Milestone post created! Your achievement is now inspiring others in the community.',
          data: { post }
        };
      
      case 'join_group':
        const result = await this.joinGroup(userId, 'group_budgeting_masters');
        return {
          success: result.success,
          message: result.message,
          data: { groupId: 'group_budgeting_masters' }
        };
      
      case 'help_community_member':
        // Simulate helping by adding a helpful comment
        const helpPost = Array.from(this.posts.values()).find(p => p.type === 'question');
        if (helpPost) {
          await this.addComment(userId, helpPost.id, 'I had the same challenge! What worked for me was setting up automatic transfers to a separate savings account right after payday. Start small - even $25/week adds up quickly. You\'ve got this! 💪');
          profile.socialStats.helpfulVotes += 15; // Simulate receiving helpful votes
          profile.socialStats.commentsPosted++;
        }
        
        return {
          success: true,
          message: 'You helped a community member! Your advice earned 15 helpful votes.',
          data: { helpfulVotesEarned: 15 }
        };
      
      case 'like_posts':
        // Simulate liking several posts
        const postsToLike = Array.from(this.posts.values()).slice(0, 3);
        for (const post of postsToLike) {
          await this.likePost(userId, post.id, 'celebrate');
        }
        
        return {
          success: true,
          message: 'You celebrated 3 community milestones! Spread the positivity! 🎉',
          data: { postsLiked: 3 }
        };
      
      case 'share_tip':
        const tipPost = await this.createPost(userId, {
          content: '💡 Pro tip: Use the envelope method digitally! I create separate savings accounts for each budget category and auto-transfer money there on payday. Makes it impossible to overspend and super easy to track. Anyone else using digital envelopes? What apps do you recommend?',
          type: 'tip',
          tags: ['budgeting-tip', 'envelope-method', 'digital-tools', 'advice'],
          attachments: []
        });
        
        return {
          success: true,
          message: 'Great tip shared! Your budgeting advice will help many community members.',
          data: { post: tipPost }
        };
      
      default:
        return {
          success: false,
          message: 'Unknown activity type'
        };
    }
  }
}