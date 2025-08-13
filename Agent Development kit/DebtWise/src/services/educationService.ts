import { 
  EducationModule, 
  Lesson, 
  Quiz, 
  QuizAttempt, 
  UserEducationProfile,
  StudySession,
  EducationAnalytics,
  Achievement,
  Badge,
  Certificate,
  LearningRecommendation
} from '../types/education';

export class EducationService {
  private static educationModules: Map<string, EducationModule> = new Map();
  private static userProfiles: Map<string, UserEducationProfile> = new Map();
  private static studySessions: Map<string, StudySession[]> = new Map();
  private static quizAttempts: Map<string, QuizAttempt[]> = new Map();

  static {
    // Initialize with demo education modules
    this.initializeModules();
  }

  private static initializeModules() {
    const modules: EducationModule[] = [
      {
        id: 'debt_basics_101',
        title: 'Debt Management Fundamentals',
        description: 'Learn the basics of debt, interest rates, and payment strategies',
        category: 'debt_basics',
        difficulty: 'beginner',
        estimatedTime: 45,
        prerequisites: [],
        lessons: [
          {
            id: 'lesson_debt_types',
            moduleId: 'debt_basics_101',
            title: 'Types of Debt',
            content: {
              type: 'text',
              content: 'Understanding different types of debt is crucial for effective management...',
              keyPoints: [
                'Credit card debt typically has the highest interest rates',
                'Student loans often have favorable repayment terms',
                'Mortgage debt is generally considered "good debt"',
                'Personal loans can consolidate high-interest debt'
              ],
              examples: [
                {
                  id: 'example_cc_debt',
                  title: 'Credit Card Interest Calculation',
                  scenario: 'Sarah has $5,000 in credit card debt at 22% APR',
                  calculation: [
                    {
                      step: 1,
                      description: 'Calculate monthly interest rate',
                      formula: 'Annual Rate / 12',
                      values: { annualRate: 0.22, months: 12 },
                      result: 0.0183
                    },
                    {
                      step: 2,
                      description: 'Calculate monthly interest charge',
                      formula: 'Balance × Monthly Rate',
                      values: { balance: 5000, monthlyRate: 0.0183 },
                      result: 91.67
                    }
                  ],
                  outcome: 'Sarah pays $91.67 in interest each month',
                  lessonLearned: 'High-interest debt compounds quickly without payments'
                }
              ],
              resources: [
                {
                  title: 'Federal Reserve Guide to Credit',
                  url: 'https://federalreserve.gov/creditguide',
                  type: 'article',
                  provider: 'Federal Reserve',
                  description: 'Official guide to understanding credit and debt'
                }
              ]
            },
            interactiveElements: [
              {
                id: 'quiz_debt_types',
                type: 'quiz_question',
                title: 'Debt Type Classification',
                description: 'Classify these debts as good or bad debt',
                configuration: {
                  items: [
                    { debt: 'Mortgage', type: 'good' },
                    { debt: 'Credit Card', type: 'bad' },
                    { debt: 'Student Loan', type: 'good' },
                    { debt: 'Payday Loan', type: 'bad' }
                  ]
                },
                points: 20
              }
            ],
            estimatedTime: 15,
            order: 1,
            isCompleted: false,
            userProgress: {
              timeSpent: 0,
              interactionsCompleted: [],
              notesCount: 0,
              bookmarked: false
            }
          }
        ],
        quiz: {
          id: 'quiz_debt_basics',
          moduleId: 'debt_basics_101',
          questions: [
            {
              id: 'q1',
              type: 'multiple_choice',
              question: 'Which debt should you typically pay off first?',
              options: [
                'Mortgage (3.5% APR)',
                'Credit Card (22% APR)',
                'Student Loan (5% APR)',
                'Car Loan (4% APR)'
              ],
              correctAnswer: 1,
              explanation: 'Credit cards typically have the highest interest rates, making them the priority for payoff.',
              points: 10,
              difficulty: 'easy',
              tags: ['debt_prioritization', 'interest_rates']
            },
            {
              id: 'q2',
              type: 'calculation',
              question: 'If you have $10,000 debt at 18% APR and pay $200/month, how much interest do you pay in the first month?',
              correctAnswer: 150,
              explanation: 'Monthly interest = $10,000 × (18% ÷ 12) = $150',
              points: 15,
              difficulty: 'medium',
              tags: ['interest_calculation', 'monthly_payments']
            }
          ],
          passingScore: 70,
          timeLimit: 15,
          attempts: [],
          maxAttempts: 3
        },
        rewards: {
          points: 100,
          badges: [
            {
              id: 'debt_basics_badge',
              name: 'Debt Fundamentals Scholar',
              description: 'Mastered the basics of debt management',
              icon: '🎓',
              rarity: 'common'
            }
          ],
          certificates: [
            {
              id: 'debt_basics_cert',
              name: 'Debt Management Fundamentals Certificate',
              description: 'Completed comprehensive debt basics course',
              issuer: 'DebtWise Academy'
            }
          ],
          unlocks: ['budgeting_101']
        },
        completionRate: 0,
        averageRating: 4.7,
        isLocked: false,
        tags: ['beginner', 'debt', 'fundamentals'],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-12-01')
      },
      {
        id: 'budgeting_101',
        title: 'Smart Budgeting Strategies',
        description: 'Master the art of budgeting to accelerate debt payoff',
        category: 'budgeting',
        difficulty: 'beginner',
        estimatedTime: 60,
        prerequisites: ['debt_basics_101'],
        lessons: [
          {
            id: 'lesson_budget_methods',
            moduleId: 'budgeting_101',
            title: '50/30/20 Rule and Zero-Based Budgeting',
            content: {
              type: 'interactive',
              content: 'Learn popular budgeting methods and find what works for you...',
              keyPoints: [
                '50/30/20: 50% needs, 30% wants, 20% savings/debt',
                'Zero-based budgeting assigns every dollar a purpose',
                'Envelope method helps control spending categories',
                'Pay yourself first prioritizes savings and debt payments'
              ],
              examples: [
                {
                  id: 'example_50_30_20',
                  title: '50/30/20 Budget Example',
                  scenario: 'Monthly income of $4,000',
                  outcome: '$2,000 needs, $1,200 wants, $800 savings/debt',
                  lessonLearned: 'Simple percentage-based budgeting provides clear guidelines'
                }
              ],
              resources: []
            },
            interactiveElements: [
              {
                id: 'budget_calculator',
                type: 'calculator',
                title: 'Personal Budget Calculator',
                description: 'Calculate your ideal budget allocation',
                configuration: {
                  inputs: ['monthly_income', 'fixed_expenses', 'debt_payments'],
                  outputs: ['available_discretionary', 'recommended_savings']
                },
                points: 25
              }
            ],
            estimatedTime: 20,
            order: 1,
            isCompleted: false,
            userProgress: {
              timeSpent: 0,
              interactionsCompleted: [],
              notesCount: 0,
              bookmarked: false
            }
          }
        ],
        quiz: {
          id: 'quiz_budgeting',
          moduleId: 'budgeting_101',
          questions: [
            {
              id: 'q1',
              type: 'scenario',
              question: 'You earn $3,000/month and want to use the 50/30/20 rule. How much should you allocate to debt payments?',
              correctAnswer: 600,
              explanation: '20% of $3,000 = $600 for savings and debt payments',
              points: 15,
              difficulty: 'medium',
              tags: ['50_30_20_rule', 'debt_allocation']
            }
          ],
          passingScore: 70,
          attempts: [],
          maxAttempts: 3
        },
        rewards: {
          points: 150,
          badges: [
            {
              id: 'budgeting_master_badge',
              name: 'Budget Master',
              description: 'Mastered budgeting strategies and techniques',
              icon: '💰',
              rarity: 'rare'
            }
          ],
          certificates: [],
          unlocks: ['investment_basics', 'emergency_fund_101']
        },
        completionRate: 0,
        averageRating: 4.8,
        isLocked: true,
        unlockCriteria: {
          requiredModules: ['debt_basics_101'],
          requiredPoints: 100,
          requiredLevel: 2
        },
        tags: ['budgeting', 'money_management'],
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-12-01')
      },
      {
        id: 'investment_basics',
        title: 'Investment Fundamentals',
        description: 'Learn the basics of investing while managing debt',
        category: 'investment',
        difficulty: 'intermediate',
        estimatedTime: 90,
        prerequisites: ['debt_basics_101', 'budgeting_101'],
        lessons: [
          {
            id: 'lesson_investment_types',
            moduleId: 'investment_basics',
            title: 'Types of Investments',
            content: {
              type: 'text',
              content: 'Understanding investment options and risk levels...',
              keyPoints: [
                'Stocks represent ownership in companies',
                'Bonds are loans to governments or corporations',
                'Index funds provide instant diversification',
                'Real estate can generate passive income'
              ],
              examples: [],
              resources: []
            },
            interactiveElements: [],
            estimatedTime: 30,
            order: 1,
            isCompleted: false,
            userProgress: {
              timeSpent: 0,
              interactionsCompleted: [],
              notesCount: 0,
              bookmarked: false
            }
          }
        ],
        quiz: {
          id: 'quiz_investment',
          moduleId: 'investment_basics',
          questions: [],
          passingScore: 75,
          attempts: [],
          maxAttempts: 3
        },
        rewards: {
          points: 200,
          badges: [
            {
              id: 'investor_badge',
              name: 'Future Investor',
              description: 'Understanding investment fundamentals',
              icon: '📈',
              rarity: 'epic'
            }
          ],
          certificates: [],
          unlocks: []
        },
        completionRate: 0,
        averageRating: 4.6,
        isLocked: true,
        unlockCriteria: {
          requiredModules: ['debt_basics_101', 'budgeting_101'],
          requiredPoints: 250,
          requiredLevel: 3
        },
        tags: ['investment', 'advanced'],
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date('2024-12-01')
      }
    ];

    modules.forEach(module => {
      this.educationModules.set(module.id, module);
    });
  }

  static async getUserEducationProfile(userId: string): Promise<UserEducationProfile> {
    let profile = this.userProfiles.get(userId);
    
    if (!profile) {
      profile = {
        userId,
        currentLevel: 1,
        totalPoints: 0,
        completedModules: [],
        inProgressModules: [],
        badges: [],
        certificates: [],
        learningStreak: 0,
        preferredLearningStyle: 'visual',
        weeklyGoal: 180, // 3 hours per week
        dailyGoal: 30,   // 30 minutes per day
        achievements: [],
        personalizedPath: {
          id: 'beginner_path',
          name: 'Debt Freedom Journey',
          description: 'A comprehensive path from debt basics to financial freedom',
          recommendedModules: ['debt_basics_101', 'budgeting_101', 'emergency_fund_101'],
          estimatedDuration: 30,
          difficulty: 'beginner',
          personalizedFor: ['debt_management', 'budgeting']
        },
        createdAt: new Date(),
        lastActiveAt: new Date()
      };
      
      this.userProfiles.set(userId, profile);
    }
    
    return profile;
  }

  static async getAvailableModules(userId: string): Promise<EducationModule[]> {
    const profile = await this.getUserEducationProfile(userId);
    const modules = Array.from(this.educationModules.values());
    
    // Update unlock status based on user progress
    return modules.map(module => {
      const isUnlocked = this.checkModuleUnlocked(module, profile);
      return { ...module, isLocked: !isUnlocked };
    });
  }

  private static checkModuleUnlocked(module: EducationModule, profile: UserEducationProfile): boolean {
    if (!module.unlockCriteria) return true;
    
    const { requiredModules, requiredPoints, requiredLevel } = module.unlockCriteria;
    
    // Check required modules
    if (requiredModules && !requiredModules.every(modId => profile.completedModules.includes(modId))) {
      return false;
    }
    
    // Check required points
    if (requiredPoints && profile.totalPoints < requiredPoints) {
      return false;
    }
    
    // Check required level
    if (requiredLevel && profile.currentLevel < requiredLevel) {
      return false;
    }
    
    return true;
  }

  static async startLesson(userId: string, lessonId: string): Promise<StudySession> {
    const session: StudySession = {
      id: `session_${Date.now()}`,
      userId,
      lessonId,
      startedAt: new Date(),
      duration: 0,
      activitiesCompleted: [],
      pointsEarned: 0,
      focusScore: 100,
      notes: []
    };
    
    const userSessions = this.studySessions.get(userId) || [];
    userSessions.push(session);
    this.studySessions.set(userId, userSessions);
    
    // Update user profile
    const profile = await this.getUserEducationProfile(userId);
    profile.lastActiveAt = new Date();
    
    return session;
  }

  static async completeLesson(userId: string, lessonId: string, timeSpent: number): Promise<{
    pointsEarned: number;
    achievements: Achievement[];
    levelUp?: boolean;
  }> {
    const profile = await this.getUserEducationProfile(userId);
    const lesson = this.findLessonById(lessonId);
    
    if (!lesson) {
      throw new Error('Lesson not found');
    }
    
    // Calculate points based on completion and time
    const basePoints = 25;
    const timeBonus = Math.min(timeSpent / (lesson.estimatedTime * 60) * 10, 15);
    const totalPoints = Math.round(basePoints + timeBonus);
    
    // Update lesson progress
    lesson.isCompleted = true;
    lesson.completedAt = new Date();
    lesson.userProgress.timeSpent = timeSpent;
    
    // Update user profile
    profile.totalPoints += totalPoints;
    profile.lastActiveAt = new Date();
    
    // Check for achievements
    const achievements = await this.checkAchievements(userId, 'lesson_completion', {
      lessonId,
      timeSpent,
      totalLessons: profile.completedModules.length
    });
    
    // Check for level up
    const levelUp = this.checkLevelUp(profile);
    
    return {
      pointsEarned: totalPoints,
      achievements,
      levelUp
    };
  }

  private static findLessonById(lessonId: string): Lesson | null {
    for (const module of this.educationModules.values()) {
      const lesson = module.lessons.find(l => l.id === lessonId);
      if (lesson) return lesson;
    }
    return null;
  }

  static async takeQuiz(userId: string, quizId: string, answers: Record<string, any>): Promise<QuizAttempt> {
    const quiz = this.findQuizById(quizId);
    if (!quiz) {
      throw new Error('Quiz not found');
    }
    
    const attempt: QuizAttempt = {
      id: `attempt_${Date.now()}`,
      userId,
      startedAt: new Date(),
      completedAt: new Date(),
      score: 0,
      totalPossible: 0,
      answers: [],
      passed: false,
      timeSpent: 120 // 2 minutes default
    };
    
    // Grade the quiz
    for (const question of quiz.questions) {
      const userAnswer = answers[question.id];
      const isCorrect = this.gradeQuestion(question, userAnswer);
      const pointsEarned = isCorrect ? question.points : 0;
      
      attempt.answers.push({
        questionId: question.id,
        userAnswer,
        isCorrect,
        pointsEarned,
        timeSpent: 30 // 30 seconds per question average
      });
      
      attempt.score += pointsEarned;
      attempt.totalPossible += question.points;
    }
    
    attempt.passed = (attempt.score / attempt.totalPossible) * 100 >= quiz.passingScore;
    
    // Store attempt
    const userAttempts = this.quizAttempts.get(userId) || [];
    userAttempts.push(attempt);
    this.quizAttempts.set(userId, userAttempts);
    
    // Update user profile if passed
    if (attempt.passed) {
      const profile = await this.getUserEducationProfile(userId);
      profile.totalPoints += attempt.score;
      
      // Mark module as completed if this was the final quiz
      const module = Array.from(this.educationModules.values()).find(m => m.quiz.id === quizId);
      if (module && !profile.completedModules.includes(module.id)) {
        profile.completedModules.push(module.id);
        
        // Award module completion rewards
        profile.totalPoints += module.rewards.points;
        profile.badges.push(...module.rewards.badges);
        profile.certificates.push(...module.rewards.certificates);
      }
    }
    
    return attempt;
  }

  private static findQuizById(quizId: string): Quiz | null {
    for (const module of this.educationModules.values()) {
      if (module.quiz.id === quizId) return module.quiz;
    }
    return null;
  }

  private static gradeQuestion(question: any, userAnswer: any): boolean {
    switch (question.type) {
      case 'multiple_choice':
        return question.correctAnswer === userAnswer;
      case 'true_false':
        return question.correctAnswer === userAnswer;
      case 'calculation':
        return Math.abs(question.correctAnswer - parseFloat(userAnswer)) < 0.01;
      default:
        return false;
    }
  }

  private static async checkAchievements(userId: string, eventType: string, eventData: any): Promise<Achievement[]> {
    const achievements: Achievement[] = [];
    const profile = await this.getUserEducationProfile(userId);
    
    // First lesson completion
    if (eventType === 'lesson_completion' && profile.completedModules.length === 0) {
      achievements.push({
        id: `achievement_first_lesson_${Date.now()}`,
        name: 'Learning Journey Begins',
        description: 'Completed your first lesson',
        icon: '🎯',
        type: 'module_completion',
        earnedAt: new Date(),
        points: 50,
        rarity: 'common'
      });
    }
    
    // Learning streak achievements
    if (eventType === 'daily_activity') {
      const streakDays = profile.learningStreak;
      if (streakDays === 7) {
        achievements.push({
          id: `achievement_week_streak_${Date.now()}`,
          name: 'Week Warrior',
          description: 'Maintained a 7-day learning streak',
          icon: '🔥',
          type: 'streak',
          earnedAt: new Date(),
          points: 100,
          rarity: 'rare'
        });
      }
    }
    
    // Add achievements to profile
    profile.achievements.push(...achievements);
    
    return achievements;
  }

  private static checkLevelUp(profile: UserEducationProfile): boolean {
    const pointsForNextLevel = profile.currentLevel * 300;
    if (profile.totalPoints >= pointsForNextLevel) {
      profile.currentLevel += 1;
      return true;
    }
    return false;
  }

  static async getEducationAnalytics(userId: string): Promise<EducationAnalytics> {
    const profile = await this.getUserEducationProfile(userId);
    const userSessions = this.studySessions.get(userId) || [];
    const userAttempts = this.quizAttempts.get(userId) || [];
    
    const totalTimeSpent = userSessions.reduce((sum, session) => sum + session.duration, 0);
    const avgQuizScore = userAttempts.length > 0 
      ? userAttempts.reduce((sum, attempt) => sum + (attempt.score / attempt.totalPossible * 100), 0) / userAttempts.length
      : 0;
    
    return {
      userId,
      period: 'all_time',
      metrics: {
        totalTimeSpent: Math.round(totalTimeSpent / 60), // convert to minutes
        modulesCompleted: profile.completedModules.length,
        lessonsCompleted: userSessions.filter(s => s.lessonId).length,
        quizzesCompleted: userAttempts.length,
        averageQuizScore: Math.round(avgQuizScore),
        streakDays: profile.learningStreak,
        pointsEarned: profile.totalPoints,
        badgesEarned: profile.badges.length,
        learningVelocity: profile.completedModules.length / Math.max(1, this.getWeeksSinceStart(profile.createdAt)),
        focusScore: userSessions.length > 0 
          ? Math.round(userSessions.reduce((sum, s) => sum + s.focusScore, 0) / userSessions.length)
          : 100,
        retentionRate: 85, // Simulated
        preferredLearningTime: 'evening',
        strongestTopics: ['debt_management', 'budgeting'],
        improvementAreas: ['investment', 'tax_planning']
      },
      trends: [],
      recommendations: await this.generateLearningRecommendations(userId)
    };
  }

  private static getWeeksSinceStart(startDate: Date): number {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
  }

  private static async generateLearningRecommendations(userId: string): Promise<LearningRecommendation[]> {
    const profile = await this.getUserEducationProfile(userId);
    const recommendations: LearningRecommendation[] = [];
    
    // Next module recommendation
    const availableModules = await this.getAvailableModules(userId);
    const unlockedModules = availableModules.filter(m => !m.isLocked && !profile.completedModules.includes(m.id));
    
    if (unlockedModules.length > 0) {
      const nextModule = unlockedModules[0];
      recommendations.push({
        type: 'next_module',
        title: 'Continue Your Learning Journey',
        description: `Ready to tackle "${nextModule.title}"? This ${nextModule.difficulty} level module builds on what you've learned.`,
        action: `Start ${nextModule.title}`,
        priority: 'high',
        moduleId: nextModule.id,
        estimatedImpact: 'High skill development and +' + nextModule.rewards.points + ' points'
      });
    }
    
    // Study consistency recommendation
    if (profile.learningStreak < 3) {
      recommendations.push({
        type: 'take_break',
        title: 'Build a Learning Habit',
        description: 'Consistency is key to mastery. Try studying for just 15 minutes daily.',
        action: 'Set Daily Reminder',
        priority: 'medium',
        estimatedImpact: 'Improved retention and steady progress'
      });
    }
    
    return recommendations;
  }

  static async createDemoProfile(userId: string): Promise<{
    profile: UserEducationProfile;
    analytics: EducationAnalytics;
    availableModules: EducationModule[];
  }> {
    // Create demo profile with some progress
    const profile: UserEducationProfile = {
      userId,
      currentLevel: 2,
      totalPoints: 175,
      completedModules: ['debt_basics_101'],
      inProgressModules: ['budgeting_101'],
      badges: [
        {
          id: 'debt_basics_badge',
          name: 'Debt Fundamentals Scholar',
          description: 'Mastered the basics of debt management',
          icon: '🎓',
          rarity: 'common',
          earnedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
        }
      ],
      certificates: [
        {
          id: 'debt_basics_cert',
          name: 'Debt Management Fundamentals Certificate',
          description: 'Completed comprehensive debt basics course',
          issuer: 'DebtWise Academy'
        }
      ],
      learningStreak: 5,
      preferredLearningStyle: 'visual',
      weeklyGoal: 180,
      dailyGoal: 30,
      achievements: [
        {
          id: 'first_lesson_achievement',
          name: 'Learning Journey Begins',
          description: 'Completed your first lesson',
          icon: '🎯',
          type: 'module_completion',
          earnedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
          points: 50,
          rarity: 'common'
        }
      ],
      personalizedPath: {
        id: 'beginner_path',
        name: 'Debt Freedom Journey',
        description: 'A comprehensive path from debt basics to financial freedom',
        recommendedModules: ['debt_basics_101', 'budgeting_101', 'emergency_fund_101'],
        estimatedDuration: 30,
        difficulty: 'beginner',
        personalizedFor: ['debt_management', 'budgeting']
      },
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
      lastActiveAt: new Date()
    };
    
    this.userProfiles.set(userId, profile);
    
    // Create some demo study sessions
    const sessions: StudySession[] = [
      {
        id: 'session_1',
        userId,
        moduleId: 'debt_basics_101',
        lessonId: 'lesson_debt_types',
        startedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        endedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 25 * 60 * 1000),
        duration: 1500, // 25 minutes
        activitiesCompleted: [
          {
            type: 'lesson_read',
            itemId: 'lesson_debt_types',
            duration: 900,
            completed: true
          },
          {
            type: 'quiz_taken',
            itemId: 'quiz_debt_types',
            duration: 600,
            completed: true,
            score: 85
          }
        ],
        pointsEarned: 45,
        focusScore: 92,
        notes: [
          {
            id: 'note_1',
            content: 'Credit cards have highest interest rates - prioritize these for payoff',
            moduleId: 'debt_basics_101',
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            tags: ['interest_rates', 'prioritization'],
            isHighlighted: true
          }
        ]
      }
    ];
    
    this.studySessions.set(userId, sessions);
    
    const availableModules = await this.getAvailableModules(userId);
    const analytics = await this.getEducationAnalytics(userId);
    
    return {
      profile,
      analytics,
      availableModules
    };
  }
}