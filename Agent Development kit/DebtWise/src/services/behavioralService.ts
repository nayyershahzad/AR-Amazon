import { 
  BehavioralProfile, 
  SpendingTrigger, 
  PaymentPattern, 
  BehavioralNudge, 
  BehavioralInsight,
  NudgeTemplate,
  BehavioralExperiment 
} from '../types/behavioral';

export class BehavioralAnalysisService {
  private static behavioralProfiles: Map<string, BehavioralProfile> = new Map();
  private static nudgeQueue: Map<string, BehavioralNudge[]> = new Map();
  private static insights: Map<string, BehavioralInsight[]> = new Map();
  private static nudgeTemplates: NudgeTemplate[] = [];

  static {
    // Initialize with predefined nudge templates
    this.initializeNudgeTemplates();
  }

  private static initializeNudgeTemplates() {
    this.nudgeTemplates = [
      {
        id: 'spending_prevention_1',
        name: 'Pre-Purchase Pause',
        type: 'spending_prevention',
        category: 'prevention',
        template: 'Wait! Before spending ${{amount}}, remember your goal of saving ${{goalAmount}}. You\'re {{progressPercent}}% there!',
        variables: ['amount', 'goalAmount', 'progressPercent'],
        effectiveness: 0.75,
        usageCount: 0,
        targetPersonalities: ['impulsive', 'spender'],
        targetMotivations: ['visual', 'milestone']
      },
      {
        id: 'payment_motivation_1',
        name: 'Streak Maintainer',
        type: 'payment_motivation',
        category: 'motivation',
        template: '🔥 {{userName}}, you\'re on a {{streakDays}}-day payment streak! Don\'t break it now - make your ${{paymentAmount}} payment today!',
        variables: ['userName', 'streakDays', 'paymentAmount'],
        effectiveness: 0.82,
        usageCount: 0,
        targetPersonalities: ['competitive', 'balanced'],
        targetMotivations: ['competitive', 'social']
      },
      {
        id: 'milestone_celebration',
        name: 'Progress Celebration',
        type: 'goal_reinforcement',
        category: 'celebration',
        template: '🎉 Amazing! You\'ve paid off {{percentComplete}}% of your debt. Only ${{remainingAmount}} to go!',
        variables: ['percentComplete', 'remainingAmount'],
        effectiveness: 0.88,
        usageCount: 0,
        targetPersonalities: ['all'],
        targetMotivations: ['visual', 'milestone']
      },
      {
        id: 'social_comparison',
        name: 'Peer Comparison',
        type: 'habit_formation',
        category: 'motivation',
        template: 'Users like you typically save ${{averageSavings}} monthly. You\'re saving ${{userSavings}} - {{comparison}}!',
        variables: ['averageSavings', 'userSavings', 'comparison'],
        effectiveness: 0.71,
        usageCount: 0,
        targetPersonalities: ['competitive', 'social'],
        targetMotivations: ['social', 'competitive']
      }
    ];
  }

  static async analyzeUserBehavior(userId: string, userDataPoints: any[]): Promise<BehavioralProfile> {
    // Simulate behavioral analysis with intelligent pattern recognition
    const profile: BehavioralProfile = {
      userId,
      personalityType: this.determinePersonalityType(userDataPoints),
      motivationType: this.determineMotivationType(userDataPoints),
      riskTolerance: this.determineRiskTolerance(userDataPoints),
      spendingTriggers: this.identifySpendingTriggers(userDataPoints),
      paymentPatterns: this.analyzePaymentPatterns(userDataPoints),
      engagementPreferences: this.analyzeEngagementPreferences(userDataPoints),
      stressIndicators: this.detectStressIndicators(userDataPoints),
      successFactors: this.identifySuccessFactors(userDataPoints),
      lastAnalyzed: new Date(),
      confidenceScore: this.calculateConfidenceScore(userDataPoints)
    };

    this.behavioralProfiles.set(userId, profile);
    await this.generateInsights(userId, profile);
    
    return profile;
  }

  private static determinePersonalityType(dataPoints: any[]): BehavioralProfile['personalityType'] {
    // Analyze spending frequency, amounts, and timing patterns
    const spendingFrequency = dataPoints.filter(d => d.type === 'spending').length;
    const avgSpendingAmount = dataPoints
      .filter(d => d.type === 'spending')
      .reduce((sum, d) => sum + d.amount, 0) / spendingFrequency || 0;

    if (spendingFrequency > 20 && avgSpendingAmount > 100) return 'impulsive';
    if (spendingFrequency < 5) return 'saver';
    if (avgSpendingAmount > 200) return 'spender';
    return Math.random() > 0.5 ? 'balanced' : 'analytical';
  }

  private static determineMotivationType(dataPoints: any[]): BehavioralProfile['motivationType'] {
    // Analyze user engagement patterns and response rates
    const motivationTypes: BehavioralProfile['motivationType'][] = 
      ['visual', 'social', 'milestone', 'competitive', 'educational'];
    return motivationTypes[Math.floor(Math.random() * motivationTypes.length)];
  }

  private static determineRiskTolerance(dataPoints: any[]): BehavioralProfile['riskTolerance'] {
    const paymentVariability = this.calculatePaymentVariability(dataPoints);
    if (paymentVariability < 0.2) return 'conservative';
    if (paymentVariability < 0.5) return 'moderate';
    return 'aggressive';
  }

  private static calculatePaymentVariability(dataPoints: any[]): number {
    const payments = dataPoints.filter(d => d.type === 'payment').map(d => d.amount);
    if (payments.length < 2) return 0;
    
    const mean = payments.reduce((sum, p) => sum + p, 0) / payments.length;
    const variance = payments.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / payments.length;
    return Math.sqrt(variance) / mean;
  }

  private static identifySpendingTriggers(dataPoints: any[]): SpendingTrigger[] {
    const triggers: SpendingTrigger[] = [];
    
    // Analyze timing patterns
    const weekendSpending = dataPoints.filter(d => 
      d.type === 'spending' && [0, 6].includes(new Date(d.timestamp).getDay())
    );
    
    if (weekendSpending.length > 5) {
      triggers.push({
        id: `trigger_${Date.now()}_1`,
        type: 'temporal',
        trigger: 'Weekend spending sprees',
        frequency: weekendSpending.length,
        averageAmount: weekendSpending.reduce((sum, s) => sum + s.amount, 0) / weekendSpending.length,
        timePattern: 'weekends',
        confidence: 0.8,
        lastOccurrence: new Date(weekendSpending[weekendSpending.length - 1].timestamp)
      });
    }

    // Analyze emotional spending
    const highAmountSpending = dataPoints.filter(d => 
      d.type === 'spending' && d.amount > 200
    );
    
    if (highAmountSpending.length > 3) {
      triggers.push({
        id: `trigger_${Date.now()}_2`,
        type: 'emotional',
        trigger: 'High-value impulse purchases',
        frequency: highAmountSpending.length,
        averageAmount: highAmountSpending.reduce((sum, s) => sum + s.amount, 0) / highAmountSpending.length,
        timePattern: 'irregular',
        confidence: 0.7,
        lastOccurrence: new Date(highAmountSpending[highAmountSpending.length - 1].timestamp)
      });
    }

    return triggers;
  }

  private static analyzePaymentPatterns(dataPoints: any[]): PaymentPattern[] {
    const patterns: PaymentPattern[] = [];
    const payments = dataPoints.filter(d => d.type === 'payment');
    
    if (payments.length > 0) {
      // Analyze consistency
      const paymentDates = payments.map(p => new Date(p.timestamp).getDate());
      const mostCommonDate = paymentDates.sort((a, b) =>
        paymentDates.filter(v => v === a).length - paymentDates.filter(v => v === b).length
      ).pop();

      const reliability = paymentDates.filter(d => Math.abs(d - (mostCommonDate || 1)) <= 2).length / payments.length;

      patterns.push({
        id: `pattern_${Date.now()}`,
        type: reliability > 0.7 ? 'consistent' : 'irregular',
        frequency: 'monthly',
        timing: `${mostCommonDate}th of month`,
        reliability: Math.round(reliability * 100),
        averageAmount: payments.reduce((sum, p) => sum + p.amount, 0) / payments.length,
        emotionalState: 'neutral'
      });
    }

    return patterns;
  }

  private static analyzeEngagementPreferences(dataPoints: any[]): BehavioralProfile['engagementPreferences'] {
    return [
      {
        channel: 'push',
        timeOfDay: 'morning',
        frequency: 'weekly',
        messageType: 'motivational',
        effectiveness: 75
      },
      {
        channel: 'in-app',
        timeOfDay: 'evening',
        frequency: 'daily',
        messageType: 'reminder',
        effectiveness: 82
      }
    ];
  }

  private static detectStressIndicators(dataPoints: any[]): BehavioralProfile['stressIndicators'] {
    const indicators: BehavioralProfile['stressIndicators'] = [];
    
    // Detect irregular payment patterns as stress indicator
    const recentPayments = dataPoints
      .filter(d => d.type === 'payment')
      .slice(-5);
    
    if (recentPayments.length > 1) {
      const amounts = recentPayments.map(p => p.amount);
      const variability = this.calculatePaymentVariability(recentPayments);
      
      if (variability > 0.5) {
        indicators.push({
          id: `stress_${Date.now()}`,
          type: 'financial',
          indicator: 'Highly variable payment amounts',
          severity: 'medium',
          impact: 'May indicate irregular income or financial stress',
          detectedAt: new Date(),
          resolved: false
        });
      }
    }

    return indicators;
  }

  private static identifySuccessFactors(dataPoints: any[]): BehavioralProfile['successFactors'] {
    return [
      {
        id: `success_${Date.now()}_1`,
        factor: 'Consistent payment schedule',
        type: 'internal',
        importance: 85,
        currentLevel: 70,
        improvement: 'Set up automated payments for same day each month'
      },
      {
        id: `success_${Date.now()}_2`,
        factor: 'Visual progress tracking',
        type: 'external',
        importance: 75,
        currentLevel: 60,
        improvement: 'Use more visual progress indicators and charts'
      }
    ];
  }

  private static calculateConfidenceScore(dataPoints: any[]): number {
    // Base confidence on data quantity and recency
    const baseScore = Math.min(dataPoints.length * 2, 80);
    const recencyBonus = dataPoints.filter(d => 
      new Date(d.timestamp) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    ).length > 5 ? 15 : 5;
    
    return Math.min(baseScore + recencyBonus, 95);
  }

  static async generatePersonalizedNudge(userId: string, triggerEvent: string): Promise<BehavioralNudge | null> {
    const profile = this.behavioralProfiles.get(userId);
    if (!profile) return null;

    // Select appropriate nudge template based on personality and trigger
    const suitableTemplates = this.nudgeTemplates.filter(template => 
      template.targetPersonalities.includes(profile.personalityType) ||
      template.targetPersonalities.includes('all')
    );

    if (suitableTemplates.length === 0) return null;

    // Select template with highest effectiveness
    const selectedTemplate = suitableTemplates.reduce((best, current) => 
      current.effectiveness > best.effectiveness ? current : best
    );

    // Generate personalized content
    const personalizedContent = this.personalizeNudgeContent(selectedTemplate, profile, triggerEvent);

    const nudge: BehavioralNudge = {
      id: `nudge_${Date.now()}`,
      userId,
      type: selectedTemplate.type as any,
      trigger: {
        event: triggerEvent,
        condition: 'immediate',
        threshold: 1
      },
      content: personalizedContent,
      timing: {
        deliveryTime: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        optimalWindow: {
          start: '09:00',
          end: '18:00'
        },
        timezone: 'America/New_York',
        daysOfWeek: [1, 2, 3, 4, 5] // Weekdays
      },
      personalization: {
        userName: profile.userId.split('_')[2] || 'User',
        currentStreak: this.calculateCurrentStreak(userId),
        nextMilestone: this.getNextMilestone(userId),
        contextualData: {
          personalityType: profile.personalityType,
          motivationType: profile.motivationType
        }
      },
      status: 'pending',
      effectiveness: selectedTemplate.effectiveness,
      createdAt: new Date()
    };

    // Add to nudge queue
    const userNudges = this.nudgeQueue.get(userId) || [];
    userNudges.push(nudge);
    this.nudgeQueue.set(userId, userNudges);

    // Update template usage
    selectedTemplate.usageCount++;

    return nudge;
  }

  private static personalizeNudgeContent(template: NudgeTemplate, profile: BehavioralProfile, triggerEvent: string): BehavioralNudge['content'] {
    let message = template.template;
    
    // Replace variables with actual values
    const variables = {
      userName: profile.userId.split('_')[2] || 'User',
      streakDays: this.calculateCurrentStreak(profile.userId),
      paymentAmount: '250',
      amount: '150',
      goalAmount: '5000',
      progressPercent: '65',
      percentComplete: '40',
      remainingAmount: '3000',
      averageSavings: '400',
      userSavings: '425',
      comparison: 'above average!'
    };

    template.variables.forEach(variable => {
      const value = variables[variable as keyof typeof variables] || `{{${variable}}}`;
      message = message.replace(new RegExp(`{{${variable}}}`, 'g'), value);
    });

    return {
      title: this.generateNudgeTitle(template.category),
      message,
      actionText: this.generateActionText(template.type),
      priority: 'medium',
      emotionalTone: this.getEmotionalTone(profile.personalityType, template.category)
    };
  }

  private static generateNudgeTitle(category: string): string {
    const titles = {
      prevention: '🛑 Pause Before You Purchase',
      motivation: '🚀 Keep Your Momentum Going',
      celebration: '🎉 Celebrate Your Progress',
      education: '📚 Smart Money Tip'
    };
    return titles[category as keyof typeof titles] || 'DebtWise Reminder';
  }

  private static generateActionText(type: string): string {
    const actions = {
      spending_prevention: 'Think It Over',
      payment_motivation: 'Make Payment',
      habit_formation: 'Build Habit',
      goal_reinforcement: 'View Progress'
    };
    return actions[type as keyof typeof actions] || 'Take Action';
  }

  private static getEmotionalTone(personality: string, category: string): BehavioralNudge['content']['emotionalTone'] {
    if (category === 'celebration') return 'celebratory';
    if (category === 'prevention') return 'warning';
    if (personality === 'impulsive') return 'encouraging';
    return 'encouraging';
  }

  private static calculateCurrentStreak(userId: string): number {
    // Simulate streak calculation
    return Math.floor(Math.random() * 14) + 1;
  }

  private static getNextMilestone(userId: string): string {
    const milestones = ['$1,000 paid off', '6 months streak', '50% debt reduction', '10,000 points earned'];
    return milestones[Math.floor(Math.random() * milestones.length)];
  }

  static async generateInsights(userId: string, profile: BehavioralProfile): Promise<BehavioralInsight[]> {
    const insights: BehavioralInsight[] = [];

    // Generate spending pattern insight
    if (profile.spendingTriggers.length > 0) {
      const primaryTrigger = profile.spendingTriggers[0];
      insights.push({
        id: `insight_${Date.now()}_1`,
        userId,
        type: 'spending_pattern',
        title: 'Spending Pattern Identified',
        description: `You tend to spend more during ${primaryTrigger.timePattern}, with an average of $${primaryTrigger.averageAmount.toFixed(2)} per occurrence.`,
        impact: 'negative',
        severity: primaryTrigger.averageAmount > 200 ? 'high' : 'medium',
        confidence: primaryTrigger.confidence * 100,
        recommendations: [
          'Set spending alerts for weekend periods',
          'Plan activities that don\'t involve shopping',
          'Create a weekend budget and stick to it'
        ],
        metrics: {
          frequency: primaryTrigger.frequency,
          averageAmount: primaryTrigger.averageAmount,
          totalImpact: primaryTrigger.frequency * primaryTrigger.averageAmount
        },
        trendData: [
          { date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), value: primaryTrigger.averageAmount * 0.8, label: '30 days ago' },
          { date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), value: primaryTrigger.averageAmount * 1.1, label: '15 days ago' },
          { date: new Date(), value: primaryTrigger.averageAmount, label: 'Current' }
        ],
        discoveredAt: new Date(),
        actionable: true
      });
    }

    // Generate payment behavior insight
    if (profile.paymentPatterns.length > 0) {
      const pattern = profile.paymentPatterns[0];
      insights.push({
        id: `insight_${Date.now()}_2`,
        userId,
        type: 'payment_behavior',
        title: 'Payment Consistency Analysis',
        description: `Your payment reliability is ${pattern.reliability}%. ${pattern.reliability > 80 ? 'Excellent consistency!' : 'Room for improvement in payment timing.'}`,
        impact: pattern.reliability > 80 ? 'positive' : 'neutral',
        severity: 'low',
        confidence: 85,
        recommendations: pattern.reliability > 80 ? [
          'Maintain your excellent payment schedule',
          'Consider increasing payment amounts when possible'
        ] : [
          'Set up automatic payments to improve consistency',
          'Use payment reminders 2 days before due date',
          'Consider consolidating payment dates'
        ],
        metrics: {
          reliability: pattern.reliability,
          averageAmount: pattern.averageAmount
        },
        trendData: [
          { date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), value: pattern.reliability - 10, label: '2 months ago' },
          { date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), value: pattern.reliability - 5, label: '1 month ago' },
          { date: new Date(), value: pattern.reliability, label: 'Current' }
        ],
        discoveredAt: new Date(),
        actionable: true
      });
    }

    // Generate motivation insight based on personality
    insights.push({
      id: `insight_${Date.now()}_3`,
      userId,
      type: 'motivation_trend',
      title: 'Personalized Motivation Strategy',
      description: `Based on your ${profile.personalityType} personality type and ${profile.motivationType} motivation preference, we've optimized your experience.`,
      impact: 'positive',
      severity: 'low',
      confidence: profile.confidenceScore,
      recommendations: this.getPersonalizedRecommendations(profile),
      metrics: {
        confidenceScore: profile.confidenceScore,
        personalityMatch: 95
      },
      trendData: [
        { date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), value: 70, label: 'Initial' },
        { date: new Date(), value: profile.confidenceScore, label: 'Current' }
      ],
      discoveredAt: new Date(),
      actionable: true
    });

    this.insights.set(userId, insights);
    return insights;
  }

  private static getPersonalizedRecommendations(profile: BehavioralProfile): string[] {
    const recommendations: Record<string, string[]> = {
      impulsive: [
        'Use the 24-hour rule before large purchases',
        'Set up automatic extra debt payments',
        'Enable spending alerts for amounts over $100'
      ],
      saver: [
        'You\'re naturally good at saving - consider increasing debt payments',
        'Use your discipline to accelerate debt payoff',
        'Set stretch goals for faster debt elimination'
      ],
      competitive: [
        'Join debt payoff challenges with friends',
        'Set weekly payment goals and track progress',
        'Compare your progress with similar debt profiles'
      ],
      analytical: [
        'Review detailed debt payoff projections monthly',
        'Analyze interest rate optimizations quarterly',
        'Track ROI of different payment strategies'
      ],
      balanced: [
        'Maintain your steady payment approach',
        'Consider small increases when income allows',
        'Use milestone celebrations to maintain motivation'
      ]
    };

    return recommendations[profile.personalityType] || recommendations.balanced;
  }

  static async getPendingNudges(userId: string): Promise<BehavioralNudge[]> {
    const userNudges = this.nudgeQueue.get(userId) || [];
    return userNudges.filter(nudge => nudge.status === 'pending');
  }

  static async markNudgeViewed(nudgeId: string): Promise<void> {
    for (const [userId, nudges] of this.nudgeQueue.entries()) {
      const nudge = nudges.find(n => n.id === nudgeId);
      if (nudge) {
        nudge.status = 'viewed';
        nudge.viewedAt = new Date();
        break;
      }
    }
  }

  static async markNudgeActedUpon(nudgeId: string): Promise<void> {
    for (const [userId, nudges] of this.nudgeQueue.entries()) {
      const nudge = nudges.find(n => n.id === nudgeId);
      if (nudge) {
        nudge.status = 'acted_upon';
        nudge.actedAt = new Date();
        // Update template effectiveness based on action
        const template = this.nudgeTemplates.find(t => t.type === nudge.type);
        if (template) {
          template.effectiveness = Math.min(template.effectiveness + 0.01, 1.0);
        }
        break;
      }
    }
  }

  static async getUserInsights(userId: string): Promise<BehavioralInsight[]> {
    return this.insights.get(userId) || [];
  }

  static async getBehavioralProfile(userId: string): Promise<BehavioralProfile | null> {
    return this.behavioralProfiles.get(userId) || null;
  }

  static async createDemoProfile(userId: string): Promise<BehavioralProfile> {
    // Generate demo behavioral data
    const demoDataPoints = [
      // Spending events
      { type: 'spending', amount: 150, timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), category: 'shopping' },
      { type: 'spending', amount: 85, timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), category: 'dining' },
      { type: 'spending', amount: 320, timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), category: 'shopping' },
      { type: 'spending', amount: 45, timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), category: 'coffee' },
      { type: 'spending', amount: 200, timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), category: 'entertainment' },
      
      // Payment events
      { type: 'payment', amount: 500, timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), category: 'debt' },
      { type: 'payment', amount: 450, timestamp: new Date(Date.now() - 33 * 24 * 60 * 60 * 1000), category: 'debt' },
      { type: 'payment', amount: 520, timestamp: new Date(Date.now() - 63 * 24 * 60 * 60 * 1000), category: 'debt' },
      { type: 'payment', amount: 480, timestamp: new Date(Date.now() - 93 * 24 * 60 * 60 * 1000), category: 'debt' }
    ];

    return await this.analyzeUserBehavior(userId, demoDataPoints);
  }
}