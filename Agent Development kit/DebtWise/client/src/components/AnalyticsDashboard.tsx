import React, { useState } from 'react';
import styles from './AnalyticsDashboard.module.css';

interface ComprehensiveAnalytics {
  userId: string;
  period: string;
  generatedAt: string;
  dataRange: {
    startDate: string;
    endDate: string;
    totalDays: number;
  };
  financialMetrics: {
    totalDebtStart: number;
    totalDebtCurrent: number;
    totalDebtPaid: number;
    debtReductionPercentage: number;
    monthlyDebtReduction: number;
    averagePaymentAmount: number;
    totalPaymentsMade: number;
    interestSaved: number;
    projectedInterestSavings: number;
    cashFlowImprovement: number;
    netWorthChange: number;
    debtToIncomeRatio: number;
    emergencyFundProgress: number;
  };
  rewardAnalytics: {
    totalPointsEarned: number;
    currentPoints: number;
    pointsRedeemed: number;
    cashRewardsEarned: number;
    currentLevel: number;
    levelsGained: number;
    badgesEarned: number;
    achievementsUnlocked: number;
    motivationScore: number;
    rewardEffectiveness: number;
    pointsPerDollarPaid: number;
    streakAnalysis: {
      currentStreak: number;
      longestStreak: number;
      streakBreaks: number;
      averageStreakLength: number;
      streakImpactOnPayments: number;
      streakMotivationScore: number;
    };
  };
  automationAnalytics: {
    automationEnabled: boolean;
    automationEffectiveness: number;
    scheduledPayments: number;
    executedPayments: number;
    failedPayments: number;
    automationReliability: number;
    timesSaved: number;
    paymentOptimizationScore: number;
    automatedSavings: number;
    manualInterventions: number;
    automationROI: number;
  };
  behavioralAnalytics: {
    personalityType: string;
    behaviorConsistency: number;
    spendingTriggerFrequency: number;
    nudgeEffectiveness: number;
    behaviorChangeScore: number;
    impulseControlImprovement: number;
    financialHabitsScore: number;
    stressIndicators: number;
    positiveHabitsFormed: number;
    behavioralRiskScore: number;
  };
  educationAnalytics: {
    modulesCompleted: number;
    lessonsCompleted: number;
    quizzesTaken: number;
    averageQuizScore: number;
    timeSpentLearning: number;
    knowledgeRetentionScore: number;
    learningVelocity: number;
    educationImpactScore: number;
    certificatesEarned: number;
    skillsAcquired: string[];
  };
  socialAnalytics: {
    communityEngagement: number;
    helpfulnessScore: number;
    socialInfluence: number;
    groupParticipation: number;
    challengesCompleted: number;
    supportProvided: number;
    socialMotivationImpact: number;
    networkSize: number;
    reputationScore: number;
  };
  predictions: {
    debtFreeDate: string;
    debtFreeDateConfidence: number;
    projectedTotalInterest: number;
    riskEvents: Array<{
      id: string;
      type: string;
      probability: number;
      impact: number;
      potentialCost: number;
      mitigationStrategies: string[];
      timeframe: string;
    }>;
    opportunityWindows: Array<{
      id: string;
      type: string;
      opportunity: string;
      potentialSaving: number;
      effort: string;
      timeframe: string;
      requirements: string[];
    }>;
  };
  riskAssessment: {
    overallRiskScore: number;
    riskLevel: string;
    riskFactors: Array<{
      id: string;
      category: string;
      risk: string;
      severity: number;
      probability: number;
      impact: string;
      mitigated: boolean;
    }>;
    emergencyRecommendations: string[];
  };
  recommendations: Array<{
    id: string;
    category: string;
    type: string;
    priority: string;
    title: string;
    description: string;
    expectedBenefit: string;
    effort: string;
    timeline: string;
    successProbability: number;
    potentialSaving: number;
    steps: string[];
  }>;
  comparativeAnalysis: {
    peerComparison: {
      userRank: number;
      totalUsers: number;
      percentile: number;
      metrics: {
        debtReduction: { user: number; peer: number; percentile: number };
        paymentConsistency: { user: number; peer: number; percentile: number };
        timeToDebtFree: { user: number; peer: number; percentile: number };
        interestSavings: { user: number; peer: number; percentile: number };
      };
    };
    industryBenchmarks: {
      averageDebtAmount: number;
      averagePayoffTime: number;
      averageInterestRate: number;
      successRate: number;
      commonChallenges: string[];
      bestPractices: string[];
    };
  };
}

const AnalyticsDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<ComprehensiveAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'financial' | 'performance' | 'predictions' | 'comparison'>('overview');
  const [message, setMessage] = useState('');

  const createDemoAnalytics = async () => {
    setLoading(true);
    setMessage('');
    try {
      const response = await fetch('http://localhost:3001/api/analytics/demo/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data.data.analytics);
        setMessage('✨ Analytics dashboard generated with comprehensive insights!');
      }
    } catch (error) {
      setMessage('❌ Failed to generate analytics dashboard');
      console.error('Analytics creation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: 'json' | 'csv') => {
    try {
      const response = await fetch(`http://localhost:3001/api/analytics/export/demo_user_123?format=${format}`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `debtwise-analytics-${Date.now()}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        setMessage(`✅ Analytics exported successfully as ${format.toUpperCase()}`);
      }
    } catch (error) {
      setMessage(`❌ Failed to export analytics`);
      console.error('Export failed:', error);
    }
  };

  const handleRefresh = () => {
    createDemoAnalytics();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${Math.round(value)}%`;
  };


  if (loading && !analytics) {
    return (
      <div className={styles.analyticsContainer}>
        <div className={styles.loadingSpinner}>
          <div>🔄 Generating comprehensive analytics...</div>
          <div>Please wait while we analyze your financial data</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.analyticsContainer}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          📈 Analytics Dashboard
        </h1>
        <p className={styles.subtitle}>
          Comprehensive insights into your debt payoff journey and financial progress
        </p>
        <div className={styles.headerActions}>
          <button className={styles.refreshButton} onClick={handleRefresh}>
            🔄 Refresh Data
          </button>
          <button className={styles.exportButton} onClick={() => handleExport('json')}>
            📄 Export JSON
          </button>
          <button className={styles.exportButton} onClick={() => handleExport('csv')}>
            📊 Export CSV
          </button>
        </div>
      </div>

      {!analytics && (
        <div className={styles.tabContainer}>
          <div className={styles.tabContent}>
            <div className="setup-section">
              <h2 className={styles.sectionTitle}>🚀 Advanced Analytics Engine</h2>
              <p style={{ fontSize: '18px', color: '#64748b', marginBottom: '32px', lineHeight: '1.6' }}>
                Get comprehensive insights across all aspects of your debt-free journey with predictive analytics, 
                risk assessment, peer comparisons, and personalized recommendations powered by advanced data analysis.
              </p>
              <button 
                onClick={createDemoAnalytics} 
                disabled={loading}
                className={styles.refreshButton}
                style={{ fontSize: '16px', padding: '16px 32px' }}
              >
                {loading ? '🔄 Analyzing...' : '📊 Generate Analytics Dashboard'}
              </button>
            </div>
          </div>
        </div>
      )}

      {message && (
        <div className={styles.alertCard}>
          <div className={styles.alertTitle}>Status Update</div>
          <div className={styles.alertDescription}>
            {message}
            <button 
              onClick={() => setMessage('')} 
              style={{ 
                float: 'right', 
                background: 'none', 
                border: 'none', 
                fontSize: '20px', 
                cursor: 'pointer',
                color: '#dc2626'
              }}
            >
              ×
            </button>
          </div>
        </div>
      )}

      {analytics && (
        <div className={styles.tabContainer}>
          <div className={styles.tabHeader}>
            <button
              className={`${styles.tabButton} ${activeTab === 'overview' ? styles.active : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              🏠 Overview
            </button>
            <button
              className={`${styles.tabButton} ${activeTab === 'financial' ? styles.active : ''}`}
              onClick={() => setActiveTab('financial')}
            >
              💰 Financial
            </button>
            <button
              className={`${styles.tabButton} ${activeTab === 'performance' ? styles.active : ''}`}
              onClick={() => setActiveTab('performance')}
            >
              ⚡ Performance
            </button>
            <button
              className={`${styles.tabButton} ${activeTab === 'predictions' ? styles.active : ''}`}
              onClick={() => setActiveTab('predictions')}
            >
              🔮 Predictions
            </button>
            <button
              className={`${styles.tabButton} ${activeTab === 'comparison' ? styles.active : ''}`}
              onClick={() => setActiveTab('comparison')}
            >
              📈 Comparison
            </button>
          </div>

          <div className={styles.tabContent}>
            {activeTab === 'overview' && (
              <div>
                <h2 className={styles.sectionTitle}>📊 Key Performance Metrics</h2>
                <div className={styles.metricsGrid}>
                  <div className={styles.metricCard}>
                    <div className={styles.metricLabel}>💰 Total Debt Paid</div>
                    <div className={styles.metricValue}>
                      {formatCurrency(analytics.financialMetrics.totalDebtPaid)}
                    </div>
                    <div className={`${styles.metricChange} ${styles.positive}`}>
                      {formatPercentage(analytics.financialMetrics.debtReductionPercentage)} reduction
                    </div>
                  </div>
                  
                  <div className={styles.metricCard}>
                    <div className={styles.metricLabel}>🏆 Current Level</div>
                    <div className={styles.metricValue}>
                      Level {analytics.rewardAnalytics.currentLevel}
                    </div>
                    <div className={`${styles.metricChange} ${styles.positive}`}>
                      {analytics.rewardAnalytics.totalPointsEarned.toLocaleString()} points earned
                    </div>
                  </div>
                  
                  <div className={styles.metricCard}>
                    <div className={styles.metricLabel}>🤖 Automation Efficiency</div>
                    <div className={styles.metricValue}>
                      {formatPercentage(analytics.automationAnalytics.automationEffectiveness)}
                    </div>
                    <div className={`${styles.metricChange} ${styles.positive}`}>
                      {analytics.automationAnalytics.timesSaved}h saved
                    </div>
                  </div>
                  
                  <div className={styles.metricCard}>
                    <div className={styles.metricLabel}>🎯 Debt-Free Prediction</div>
                    <div className={styles.metricValue}>
                      {new Date(analytics.predictions.debtFreeDate).toLocaleDateString('en-US', { 
                        month: 'short', 
                        year: 'numeric' 
                      })}
                    </div>
                    <div className={`${styles.metricChange} ${styles.positive}`}>
                      {formatPercentage(analytics.predictions.debtFreeDateConfidence)} confidence
                    </div>
                  </div>
                </div>

                <h2 className={styles.sectionTitle}>🚀 System Performance Overview</h2>
                <div className={styles.comparisonGrid}>
                  <div className={styles.comparisonCard}>
                    <div className={styles.comparisonTitle}>💎 Reward System</div>
                    <div className={styles.comparisonMetric}>
                      <span className={styles.comparisonLabel}>Motivation Score</span>
                      <span className={styles.comparisonValue}>
                        {formatPercentage(analytics.rewardAnalytics.motivationScore)}
                      </span>
                    </div>
                    <div className={styles.comparisonMetric}>
                      <span className={styles.comparisonLabel}>Current Streak</span>
                      <span className={styles.comparisonValue}>
                        {analytics.rewardAnalytics.streakAnalysis.currentStreak} days
                      </span>
                    </div>
                  </div>
                  
                  <div className={styles.comparisonCard}>
                    <div className={styles.comparisonTitle}>🧠 Behavioral Analysis</div>
                    <div className={styles.comparisonMetric}>
                      <span className={styles.comparisonLabel}>Behavior Consistency</span>
                      <span className={styles.comparisonValue}>
                        {formatPercentage(analytics.behavioralAnalytics.behaviorConsistency)}
                      </span>
                    </div>
                    <div className={styles.comparisonMetric}>
                      <span className={styles.comparisonLabel}>Habits Formed</span>
                      <span className={styles.comparisonValue}>
                        {analytics.behavioralAnalytics.positiveHabitsFormed}
                      </span>
                    </div>
                  </div>
                  
                  <div className={styles.comparisonCard}>
                    <div className={styles.comparisonTitle}>🎓 Education Progress</div>
                    <div className={styles.comparisonMetric}>
                      <span className={styles.comparisonLabel}>Modules Completed</span>
                      <span className={styles.comparisonValue}>
                        {analytics.educationAnalytics.modulesCompleted}
                      </span>
                    </div>
                    <div className={styles.comparisonMetric}>
                      <span className={styles.comparisonLabel}>Quiz Average</span>
                      <span className={styles.comparisonValue}>
                        {analytics.educationAnalytics.averageQuizScore}%
                      </span>
                    </div>
                  </div>
                  
                  <div className={styles.comparisonCard}>
                    <div className={styles.comparisonTitle}>🌟 Social Engagement</div>
                    <div className={styles.comparisonMetric}>
                      <span className={styles.comparisonLabel}>Community Score</span>
                      <span className={styles.comparisonValue}>
                        {formatPercentage(analytics.socialAnalytics.communityEngagement)}
                      </span>
                    </div>
                    <div className={styles.comparisonMetric}>
                      <span className={styles.comparisonLabel}>Network Size</span>
                      <span className={styles.comparisonValue}>
                        {analytics.socialAnalytics.networkSize}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'financial' && (
              <div>
                <h2 className={styles.sectionTitle}>💰 Financial Health Dashboard</h2>
                <div className={styles.metricsGrid}>
                  <div className={styles.metricCard}>
                    <div className={styles.metricLabel}>📊 Debt Overview</div>
                    <div className={styles.metricValue}>
                      {formatCurrency(analytics.financialMetrics.totalDebtCurrent)}
                    </div>
                    <div className={`${styles.metricChange} ${styles.positive}`}>
                      {formatCurrency(analytics.financialMetrics.totalDebtPaid)} paid off
                    </div>
                  </div>
                  
                  <div className={styles.metricCard}>
                    <div className={styles.metricLabel}>💸 Interest Saved</div>
                    <div className={styles.metricValue}>
                      {formatCurrency(analytics.financialMetrics.interestSaved)}
                    </div>
                    <div className={`${styles.metricChange} ${styles.positive}`}>
                      {formatCurrency(analytics.financialMetrics.projectedInterestSavings)} projected
                    </div>
                  </div>
                  
                  <div className={styles.metricCard}>
                    <div className={styles.metricLabel}>📈 Cash Flow Improvement</div>
                    <div className={styles.metricValue}>
                      {formatCurrency(analytics.financialMetrics.cashFlowImprovement)}/mo
                    </div>
                    <div className={`${styles.metricChange} ${styles.positive}`}>
                      Monthly improvement
                    </div>
                  </div>
                  
                  <div className={styles.metricCard}>
                    <div className={styles.metricLabel}>💳 Debt-to-Income Ratio</div>
                    <div className={styles.metricValue}>
                      {formatPercentage(analytics.financialMetrics.debtToIncomeRatio * 100)}
                    </div>
                    <div className={`${styles.metricChange} ${styles.positive}`}>
                      Improving trend
                    </div>
                  </div>
                </div>

                <div className={styles.chartContainer}>
                  <div className={styles.chartTitle}>📈 Payment History & Trends</div>
                  <div className={styles.chartPlaceholder}>
                    Payment trend visualization would appear here
                    <br />
                    Total Payments: {analytics.financialMetrics.totalPaymentsMade}
                    <br />
                    Average Payment: {formatCurrency(analytics.financialMetrics.averagePaymentAmount)}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'performance' && (
              <div>
                <h2 className={styles.sectionTitle}>⚡ System Performance Metrics</h2>
                <div className={styles.comparisonGrid}>
                  <div className={styles.comparisonCard}>
                    <div className={styles.comparisonTitle}>🏆 Reward System Performance</div>
                    <div className={styles.comparisonMetric}>
                      <span className={styles.comparisonLabel}>Total Points Earned</span>
                      <span className={styles.comparisonValue}>
                        {analytics.rewardAnalytics.totalPointsEarned.toLocaleString()}
                      </span>
                    </div>
                    <div className={styles.comparisonMetric}>
                      <span className={styles.comparisonLabel}>Cash Rewards</span>
                      <span className={styles.comparisonValue}>
                        {formatCurrency(analytics.rewardAnalytics.cashRewardsEarned)}
                      </span>
                    </div>
                    <div className={styles.comparisonMetric}>
                      <span className={styles.comparisonLabel}>Badges Earned</span>
                      <span className={styles.comparisonValue}>
                        {analytics.rewardAnalytics.badgesEarned}
                      </span>
                    </div>
                    <div className={styles.comparisonMetric}>
                      <span className={styles.comparisonLabel}>Effectiveness Score</span>
                      <span className={styles.comparisonValue}>
                        {formatPercentage(analytics.rewardAnalytics.rewardEffectiveness)}
                      </span>
                    </div>
                  </div>
                  
                  <div className={styles.comparisonCard}>
                    <div className={styles.comparisonTitle}>🤖 Automation Performance</div>
                    <div className={styles.comparisonMetric}>
                      <span className={styles.comparisonLabel}>Success Rate</span>
                      <span className={styles.comparisonValue}>
                        {formatPercentage(analytics.automationAnalytics.automationReliability)}
                      </span>
                    </div>
                    <div className={styles.comparisonMetric}>
                      <span className={styles.comparisonLabel}>Time Saved</span>
                      <span className={styles.comparisonValue}>
                        {analytics.automationAnalytics.timesSaved}h
                      </span>
                    </div>
                    <div className={styles.comparisonMetric}>
                      <span className={styles.comparisonLabel}>Automated Savings</span>
                      <span className={styles.comparisonValue}>
                        {formatCurrency(analytics.automationAnalytics.automatedSavings)}
                      </span>
                    </div>
                    <div className={styles.comparisonMetric}>
                      <span className={styles.comparisonLabel}>ROI</span>
                      <span className={styles.comparisonValue}>
                        {analytics.automationAnalytics.automationROI.toFixed(1)}x
                      </span>
                    </div>
                  </div>
                  
                  <div className={styles.comparisonCard}>
                    <div className={styles.comparisonTitle}>🧠 Behavioral Insights</div>
                    <div className={styles.comparisonMetric}>
                      <span className={styles.comparisonLabel}>Behavior Change Score</span>
                      <span className={styles.comparisonValue}>
                        {formatPercentage(analytics.behavioralAnalytics.behaviorChangeScore)}
                      </span>
                    </div>
                    <div className={styles.comparisonMetric}>
                      <span className={styles.comparisonLabel}>Impulse Control</span>
                      <span className={styles.comparisonValue}>
                        +{formatPercentage(analytics.behavioralAnalytics.impulseControlImprovement)}
                      </span>
                    </div>
                    <div className={styles.comparisonMetric}>
                      <span className={styles.comparisonLabel}>Financial Habits</span>
                      <span className={styles.comparisonValue}>
                        {formatPercentage(analytics.behavioralAnalytics.financialHabitsScore)}
                      </span>
                    </div>
                  </div>
                  
                  <div className={styles.comparisonCard}>
                    <div className={styles.comparisonTitle}>🎓 Learning Analytics</div>
                    <div className={styles.comparisonMetric}>
                      <span className={styles.comparisonLabel}>Learning Time</span>
                      <span className={styles.comparisonValue}>
                        {analytics.educationAnalytics.timeSpentLearning}h
                      </span>
                    </div>
                    <div className={styles.comparisonMetric}>
                      <span className={styles.comparisonLabel}>Knowledge Retention</span>
                      <span className={styles.comparisonValue}>
                        {formatPercentage(analytics.educationAnalytics.knowledgeRetentionScore)}
                      </span>
                    </div>
                    <div className={styles.comparisonMetric}>
                      <span className={styles.comparisonLabel}>Skills Acquired</span>
                      <span className={styles.comparisonValue}>
                        {analytics.educationAnalytics.skillsAcquired.length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'predictions' && (
              <div>
                <h2 className={styles.sectionTitle}>🔮 Predictive Insights & Risk Assessment</h2>
                
                <div className={styles.metricsGrid}>
                  <div className={styles.metricCard}>
                    <div className={styles.metricLabel}>🎯 Debt-Free Prediction</div>
                    <div className={styles.metricValue}>
                      {new Date(analytics.predictions.debtFreeDate).toLocaleDateString('en-US', {
                        month: 'long',
                        year: 'numeric'
                      })}
                    </div>
                    <div className={`${styles.metricChange} ${styles.positive}`}>
                      {formatPercentage(analytics.predictions.debtFreeDateConfidence)} confidence
                    </div>
                  </div>
                  
                  <div className={styles.metricCard}>
                    <div className={styles.metricLabel}>⚠️ Risk Level</div>
                    <div className={styles.metricValue} style={{ 
                      color: analytics.riskAssessment.riskLevel === 'low' ? '#10b981' : 
                            analytics.riskAssessment.riskLevel === 'medium' ? '#f59e0b' : '#ef4444' 
                    }}>
                      {analytics.riskAssessment.riskLevel.toUpperCase()}
                    </div>
                    <div className={`${styles.metricChange} ${styles.neutral}`}>
                      Risk Score: {analytics.riskAssessment.overallRiskScore}/100
                    </div>
                  </div>
                  
                  <div className={styles.metricCard}>
                    <div className={styles.metricLabel}>💰 Total Interest Projected</div>
                    <div className={styles.metricValue}>
                      {formatCurrency(analytics.predictions.projectedTotalInterest)}
                    </div>
                    <div className={`${styles.metricChange} ${styles.positive}`}>
                      Optimized projection
                    </div>
                  </div>
                </div>

                <h3 className={styles.sectionSubtitle}>🚨 Risk Factors</h3>
                <div className={styles.recommendationList}>
                  {analytics.riskAssessment.riskFactors.map((risk, index) => (
                    <div key={index} className={styles.recommendationCard}>
                      <div className={styles.recommendationTitle}>
                        {risk.category.toUpperCase()}: {risk.risk}
                      </div>
                      <div className={styles.recommendationDescription}>
                        Impact: {risk.impact}
                      </div>
                      <div className={styles.recommendationMeta}>
                        <span>Severity: {formatPercentage(risk.severity)}</span>
                        <span>Probability: {formatPercentage(risk.probability)}</span>
                        <span className={risk.mitigated ? styles.positive : styles.negative}>
                          {risk.mitigated ? '✅ Mitigated' : '⚠️ Active'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <h3 className={styles.sectionSubtitle}>🎯 Opportunity Windows</h3>
                <div className={styles.recommendationList}>
                  {analytics.predictions.opportunityWindows.map((opportunity, index) => (
                    <div key={index} className={styles.recommendationCard}>
                      <div className={styles.recommendationTitle}>
                        {opportunity.opportunity}
                      </div>
                      <div className={styles.recommendationDescription}>
                        Potential Savings: {formatCurrency(opportunity.potentialSaving)}
                      </div>
                      <div className={styles.recommendationMeta}>
                        <span>Effort: {opportunity.effort}</span>
                        <span>Timeline: {opportunity.timeframe}</span>
                        <span>Type: {opportunity.type}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'comparison' && (
              <div>
                <h2 className={styles.sectionTitle}>📈 Comparative Analysis</h2>
                
                <div className={styles.metricsGrid}>
                  <div className={styles.metricCard}>
                    <div className={styles.metricLabel}>🏅 Peer Ranking</div>
                    <div className={styles.metricValue}>
                      #{analytics.comparativeAnalysis.peerComparison.userRank}
                    </div>
                    <div className={`${styles.metricChange} ${styles.positive}`}>
                      Top {formatPercentage(analytics.comparativeAnalysis.peerComparison.percentile / 100)}
                    </div>
                  </div>
                  
                  <div className={styles.metricCard}>
                    <div className={styles.metricLabel}>📊 vs Industry Average</div>
                    <div className={styles.metricValue}>
                      {analytics.comparativeAnalysis.peerComparison.metrics.debtReduction.user}%
                    </div>
                    <div className={`${styles.metricChange} ${styles.positive}`}>
                      vs {analytics.comparativeAnalysis.peerComparison.metrics.debtReduction.peer}% avg
                    </div>
                  </div>
                  
                  <div className={styles.metricCard}>
                    <div className={styles.metricLabel}>⏱️ Time to Debt-Free</div>
                    <div className={styles.metricValue}>
                      {analytics.comparativeAnalysis.peerComparison.metrics.timeToDebtFree.user}mo
                    </div>
                    <div className={`${styles.metricChange} ${styles.positive}`}>
                      vs {analytics.comparativeAnalysis.peerComparison.metrics.timeToDebtFree.peer}mo avg
                    </div>
                  </div>
                  
                  <div className={styles.metricCard}>
                    <div className={styles.metricLabel}>💰 Interest Savings</div>
                    <div className={styles.metricValue}>
                      {formatCurrency(analytics.comparativeAnalysis.peerComparison.metrics.interestSavings.user)}
                    </div>
                    <div className={`${styles.metricChange} ${styles.positive}`}>
                      vs {formatCurrency(analytics.comparativeAnalysis.peerComparison.metrics.interestSavings.peer)} avg
                    </div>
                  </div>
                </div>

                <h3 className={styles.sectionSubtitle}>📊 Industry Benchmarks</h3>
                <div className={styles.comparisonGrid}>
                  <div className={styles.comparisonCard}>
                    <div className={styles.comparisonTitle}>📈 Market Comparison</div>
                    <div className={styles.comparisonMetric}>
                      <span className={styles.comparisonLabel}>Average Debt Amount</span>
                      <span className={styles.comparisonValue}>
                        {formatCurrency(analytics.comparativeAnalysis.industryBenchmarks.averageDebtAmount)}
                      </span>
                    </div>
                    <div className={styles.comparisonMetric}>
                      <span className={styles.comparisonLabel}>Average Payoff Time</span>
                      <span className={styles.comparisonValue}>
                        {analytics.comparativeAnalysis.industryBenchmarks.averagePayoffTime} months
                      </span>
                    </div>
                    <div className={styles.comparisonMetric}>
                      <span className={styles.comparisonLabel}>Success Rate</span>
                      <span className={styles.comparisonValue}>
                        {formatPercentage(analytics.comparativeAnalysis.industryBenchmarks.successRate)}
                      </span>
                    </div>
                  </div>
                </div>

                <h3 className={styles.sectionSubtitle}>💡 Best Practices</h3>
                <div className={styles.recommendationList}>
                  {analytics.comparativeAnalysis.industryBenchmarks.bestPractices.map((practice, index) => (
                    <div key={index} className={styles.recommendationCard}>
                      <div className={styles.recommendationDescription}>
                        ✅ {practice}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard;