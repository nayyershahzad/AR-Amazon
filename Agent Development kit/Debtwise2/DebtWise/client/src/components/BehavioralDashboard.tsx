import React, { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import './BehavioralDashboard.css';

interface BehavioralProfile {
  userId: string;
  personalityType: 'spender' | 'saver' | 'balanced' | 'impulsive' | 'analytical';
  motivationType: 'visual' | 'social' | 'milestone' | 'competitive' | 'educational';
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  spendingTriggers: SpendingTrigger[];
  paymentPatterns: PaymentPattern[];
  engagementPreferences: EngagementPreference[];
  stressIndicators: StressIndicator[];
  successFactors: SuccessFactor[];
  lastAnalyzed: string;
  confidenceScore: number;
}

interface SpendingTrigger {
  id: string;
  type: 'emotional' | 'temporal' | 'situational' | 'social';
  trigger: string;
  frequency: number;
  averageAmount: number;
  timePattern: string;
  confidence: number;
  lastOccurrence: string;
}

interface PaymentPattern {
  id: string;
  type: 'consistent' | 'irregular' | 'stress-driven' | 'deadline-driven';
  frequency: string;
  timing: string;
  reliability: number;
  averageAmount: number;
  emotionalState: 'positive' | 'neutral' | 'negative';
}

interface EngagementPreference {
  channel: 'push' | 'email' | 'sms' | 'in-app' | 'social';
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  frequency: string;
  messageType: 'motivational' | 'educational' | 'reminder' | 'celebration';
  effectiveness: number;
}

interface StressIndicator {
  id: string;
  type: 'financial' | 'behavioral' | 'temporal' | 'social';
  indicator: string;
  severity: 'low' | 'medium' | 'high';
  impact: string;
  detectedAt: string;
  resolved: boolean;
}

interface SuccessFactor {
  id: string;
  factor: string;
  type: 'internal' | 'external' | 'social' | 'financial';
  importance: number;
  currentLevel: number;
  improvement: string;
}

interface BehavioralNudge {
  id: string;
  userId: string;
  type: 'spending_prevention' | 'payment_motivation' | 'habit_formation' | 'goal_reinforcement';
  content: {
    title: string;
    message: string;
    actionText?: string;
    priority: 'low' | 'medium' | 'high';
    emotionalTone: 'encouraging' | 'warning' | 'celebratory' | 'educational';
  };
  status: 'pending' | 'sent' | 'viewed' | 'acted_upon' | 'dismissed' | 'expired';
  effectiveness: number;
  createdAt: string;
}

interface BehavioralInsight {
  id: string;
  userId: string;
  type: 'spending_pattern' | 'payment_behavior' | 'motivation_trend' | 'risk_factor' | 'opportunity';
  title: string;
  description: string;
  impact: 'positive' | 'negative' | 'neutral';
  severity: 'low' | 'medium' | 'high';
  confidence: number;
  recommendations: string[];
  metrics: Record<string, number>;
  actionable: boolean;
  discoveredAt: string;
}

interface BehavioralDashboardData {
  profile: BehavioralProfile | null;
  insights: BehavioralInsight[];
  nudges: BehavioralNudge[];
}

interface UserFinancialData {
  totalIncome?: number;
  totalExpenses?: number;
  availableForDebt?: number;
  expenses?: Array<{category: string, amount: number}>;
  debts?: Array<{name: string, balance: number, interestRate: number}>;
  goals?: Array<{category: string, targetAmount: number, priority: string}>;
  selectedStrategy?: string;
  payoffMonths?: number;
  totalInterestSaved?: number;
}

interface PaymentSimulatorData {
  currentMonth?: number;
  totalDebt?: number;
  totalPrincipalPaid?: number;
  totalInterestPaid?: number;
  paymentHistory?: Array<{
    month: number;
    debtName: string;
    payment: number;
    action: 'normal' | 'skip' | 'advance';
  }>;
  delinquencyData?: {
    hasDelinquent: boolean;
    totalPastDue: number;
    worstStatus: number; // days past due
    accountsDelinquent: number;
  };
}

interface BehavioralDashboardProps {
  userFinancialData?: UserFinancialData;
  simulatorData?: PaymentSimulatorData;
}

const BehavioralDashboard: React.FC<BehavioralDashboardProps> = ({ userFinancialData, simulatorData }) => {
  const { apiCall, isAuthenticated, user } = useAuth();
  const [dashboardData, setDashboardData] = useState<BehavioralDashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    if (isAuthenticated) {
      loadBehavioralData();
      loadUserFinancialData();
    }
  }, [isAuthenticated]);

  const [loadedFinancialData, setLoadedFinancialData] = useState<UserFinancialData | null>(null);
  const [loadedSimulatorData, setLoadedSimulatorData] = useState<PaymentSimulatorData | null>(null);

  // Update profile when financial data changes (from other tabs)
  useEffect(() => {
    const currentFinancialData = userFinancialData || loadedFinancialData;
    const currentSimulatorData = simulatorData || loadedSimulatorData;
    
    if (currentFinancialData) {
      console.log('🔄 Behavioral profile updating due to data changes');
      // The profile components will re-render automatically with new data
    }
  }, [userFinancialData, loadedFinancialData, simulatorData, loadedSimulatorData]);

  // Load user's financial data from debt analysis
  const loadUserFinancialData = async () => {
    try {
      // First try to load from localStorage (saved by DebtAnalyzer)
      const localData = localStorage.getItem('debtWiseData');
      if (localData) {
        const parsed = JSON.parse(localData);
        setLoadedFinancialData({
          totalIncome: (parsed.primaryIncome || 0) + (parsed.additionalIncomes?.reduce((sum: number, inc: any) => sum + (inc.amount || 0), 0) || 0),
          totalExpenses: parsed.expenses?.reduce((sum: number, exp: any) => sum + (exp.amount || 0), 0) || 0,
          availableForDebt: parsed.primaryIncome - (parsed.expenses?.reduce((sum: number, exp: any) => sum + (exp.amount || 0), 0) || 0),
          expenses: parsed.expenses || [],
          debts: parsed.debts || [],
          goals: parsed.goals || []
        });
      }

      // Try to load analysis results
      if (isAuthenticated) {
        const analysisData = await apiCall('/api/user/analysis');
        if (analysisData && analysisData.userProfile) {
          setLoadedFinancialData({
            totalIncome: analysisData.userProfile.totalIncome,
            totalExpenses: analysisData.userProfile.totalExpenses,
            availableForDebt: analysisData.userProfile.totalIncome - analysisData.userProfile.totalExpenses,
            expenses: analysisData.userProfile.expenses || [],
            debts: analysisData.debts || [],
            goals: analysisData.userProfile.goals || [],
            selectedStrategy: analysisData.recommendedStrategy,
            payoffMonths: analysisData.monthsToPayoff,
            totalInterestSaved: analysisData.totalInterestSaved
          });
        }
      }

      // Load simulator data from localStorage
      const simulatorState = localStorage.getItem('paymentSimulatorState');
      console.log('💾 Raw localStorage paymentSimulatorState:', simulatorState);
      if (simulatorState) {
        const simState = JSON.parse(simulatorState);
        setLoadedSimulatorData({
          currentMonth: simState.currentMonth,
          totalDebt: simState.debts?.reduce((sum: number, debt: any) => sum + debt.balance, 0),
          totalPrincipalPaid: simState.totalPrincipalPaid,
          totalInterestPaid: simState.totalInterestPaid,
          paymentHistory: simState.paymentHistory,
          delinquencyData: {
            hasDelinquent: simState.debts?.some((debt: any) => debt.daysPastDue > 0) || false,
            totalPastDue: simState.debts?.reduce((sum: number, debt: any) => sum + (debt.pastDueAmount || 0), 0) || 0,
            worstStatus: Math.max(...(simState.debts?.map((debt: any) => debt.daysPastDue || 0) || [0])),
            accountsDelinquent: simState.debts?.filter((debt: any) => debt.daysPastDue > 0)?.length || 0
          }
        });
      }
    } catch (error) {
      console.error('Failed to load user financial data:', error);
    }
  };

  const loadBehavioralData = async () => {
    if (!isAuthenticated || !user?.id) return;
    
    setLoading(true);
    try {
      const response = await apiCall(`/api/behavioral/profile/${user.id}`);
      
      if (response.success) {
        const [insightsRes, nudgesRes] = await Promise.all([
          apiCall(`/api/behavioral/insights/${user.id}`),
          apiCall(`/api/behavioral/nudges/${user.id}`)
        ]);
        
        setDashboardData({
          profile: response.data,
          insights: insightsRes.success ? insightsRes.data : [],
          nudges: nudgesRes.success ? nudgesRes.data : []
        });
      }
    } catch (error) {
      console.error('Failed to load behavioral data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Comprehensive behavioral analysis using real financial and payment data
  const analyzeFinancialBehavior = (data: UserFinancialData) => {
    if (!data.totalIncome || !data.totalExpenses) return null;
    
    const expenseRatio = (data.totalExpenses / data.totalIncome * 100).toFixed(1);
    const availableAmount = data.availableForDebt || 0;
    
    // Calculate top expense category
    const topExpenseCategory = data.expenses?.reduce((max, exp) => 
      exp.amount > max.amount ? exp : max
    ) || { category: 'Unknown', amount: 0 };
    
    // Calculate income diversification
    const incomeStability = data.totalIncome >= 4000 ? 85 : data.totalIncome >= 2000 ? 70 : 55;
    
    // Calculate debt management score
    const totalDebt = data.debts?.reduce((sum, debt) => sum + debt.balance, 0) || 0;
    const paymentPowerScore = availableAmount > 1000 ? 'Strong' : availableAmount > 500 ? 'Good' : 'Limited';
    
    // Goal analysis
    const goalsCount = data.goals?.length || 0;
    const highPriorityGoals = data.goals?.filter(g => g.priority === 'high').length || 0;
    
    // Debt-to-income ratio for risk assessment
    const debtToIncomeRatio = totalDebt / (data.totalIncome * 12); // Annual DTI
    
    // Interest rate analysis for strategy preference
    const avgInterestRate = data.debts?.length ? 
      data.debts.reduce((sum, debt) => sum + debt.interestRate, 0) / data.debts.length : 0;
    const hasHighInterestDebt = data.debts?.some(debt => debt.interestRate > 0.20) || false;
    
    return {
      expenseRatio,
      topExpenseCategory: topExpenseCategory.category,
      incomeStability,
      availableAmount,
      paymentPowerScore,
      goalsCount,
      highPriorityGoals,
      totalDebt,
      debtToIncomeRatio,
      avgInterestRate,
      hasHighInterestDebt
    };
  };

  // Comprehensive personality assessment based on financial and payment patterns
  const assessPersonalityType = (financialData: UserFinancialData, simulatorData?: PaymentSimulatorData | null) => {
    if (!financialData.totalIncome || !financialData.totalExpenses) return { type: 'unknown', confidence: 0, reasoning: 'Insufficient data' };
    
    const expenseRatio = financialData.totalExpenses / financialData.totalIncome;
    const availableAmount = financialData.availableForDebt || 0;
    const totalDebt = financialData.debts?.reduce((sum, debt) => sum + debt.balance, 0) || 0;
    const debtToIncomeRatio = totalDebt / (financialData.totalIncome * 12);
    
    // Payment behavior analysis from simulator
    let paymentConsistency = 100;
    let consecutiveSkips = 0;
    let totalSkips = 0;
    
    console.log('🚨 DEBUG: Behavioral Analysis Data Check');
    console.log('simulatorData:', simulatorData);
    console.log('paymentHistory:', simulatorData?.paymentHistory);
    console.log('paymentHistory length:', simulatorData?.paymentHistory?.length);
    
    if (simulatorData?.paymentHistory && simulatorData.paymentHistory.length > 0) {
      totalSkips = simulatorData.paymentHistory.filter(p => p.action === 'skip').length;
      paymentConsistency = ((simulatorData.paymentHistory.length - totalSkips) / simulatorData.paymentHistory.length) * 100;
      
      // Detect consecutive skipped payments
      let currentStreak = 0;
      let maxConsecutiveSkips = 0;
      for (const payment of simulatorData.paymentHistory) {
        if (payment.action === 'skip') {
          currentStreak++;
          maxConsecutiveSkips = Math.max(maxConsecutiveSkips, currentStreak);
        } else {
          currentStreak = 0;
        }
      }
      consecutiveSkips = maxConsecutiveSkips;
      
      console.log(`🔍 Payment Analysis: ${totalSkips} total skips, ${consecutiveSkips} max consecutive, ${paymentConsistency.toFixed(1)}% consistency`);
    }
    const extraPayments = simulatorData?.paymentHistory?.filter(p => p.action === 'advance').length || 0;
    const hasDelinquency = simulatorData?.delinquencyData?.hasDelinquent || false;
    const totalPastDue = simulatorData?.delinquencyData?.totalPastDue || 0;
    const accountsDelinquent = simulatorData?.delinquencyData?.accountsDelinquent || 0;
    
    // Strategy preference from debt analysis
    const selectedStrategy = financialData.selectedStrategy;
    const hasHighInterestDebt = financialData.debts?.some(debt => debt.interestRate > 0.20) || false;
    
    let personality = 'balanced';
    let confidence = 50;
    let reasoning = '';
    
    // Determine personality - CHECK WORST BEHAVIORS FIRST!
    // 1. CRITICAL: Check for consecutive missed payments first!
    if (consecutiveSkips >= 3) {
      personality = 'impulsive';
      confidence = 95;
      reasoning = `CRITICAL: ${consecutiveSkips} consecutive missed payments indicates severe financial management issues.`;
    } else if (expenseRatio < 0.6 && availableAmount > 1000 && paymentConsistency > 80 && totalSkips === 0) {
      personality = 'saver';
      confidence = 85;
      reasoning = `Low expense ratio (${(expenseRatio * 100).toFixed(1)}%), strong payment power ($${availableAmount.toLocaleString()}), and consistent payments (${paymentConsistency.toFixed(0)}%)`;
    } else if (totalSkips >= 2 || paymentConsistency < 75 || (hasDelinquency && accountsDelinquent > 0)) {
      personality = 'impulsive';
      confidence = 80;
      reasoning = `HIGH RISK: ${totalSkips} missed payments (${paymentConsistency.toFixed(0)}% consistency)${hasDelinquency ? `, ${accountsDelinquent} delinquent accounts` : ''}. Shows poor financial discipline.`;
    } else if (expenseRatio > 0.85 || paymentConsistency < 60) {
      personality = 'spender';
      confidence = 75;
      reasoning = `MODERATE RISK: ${expenseRatio > 0.85 ? `High expenses (${(expenseRatio * 100).toFixed(1)}%)` : `Poor payment consistency (${paymentConsistency.toFixed(0)}%)`}. Spending exceeds management capability.`;
    } else if (extraPayments > 0 && hasHighInterestDebt) {
      personality = 'analytical';
      confidence = 75;
      reasoning = `Strategic approach: ${extraPayments} extra payments, systematic debt management with focus on high-interest debt`;
    } else if (paymentConsistency >= 80 && totalSkips <= 1 && expenseRatio < 0.80) {
      personality = 'balanced';
      confidence = 70;
      reasoning = `SOLID: Good payment consistency (${paymentConsistency.toFixed(0)}%) with manageable expenses (${(expenseRatio * 100).toFixed(1)}%). Steady financial approach.`;
    } else if (paymentConsistency < 80 && simulatorData?.paymentHistory && simulatorData.paymentHistory.length > 3) {
      personality = 'impulsive';
      confidence = 65;
      reasoning = `Inconsistent payment behavior (${paymentConsistency.toFixed(0)}% consistency) with ${simulatorData.paymentHistory.filter(p => p.action === 'skip').length} missed payments`;
    }
    
    return { type: personality, confidence, reasoning };
  };





  if (loading && !dashboardData) {
    return <div className="behavioral-loading">Analyzing behavioral patterns...</div>;
  }

  return (
    <div className="behavioral-dashboard">
      <h2>🧠 Behavioral Analysis & Smart Nudges</h2>
      
      {message && (
        <div className="behavioral-message">
          <p>{message}</p>
          <button onClick={() => setMessage('')} className="close-message">×</button>
        </div>
      )}

      {/* Welcome Message */}
      {!(userFinancialData || loadedFinancialData) && (
        <div style={{
          background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)',
          padding: '30px',
          borderRadius: '16px',
          marginBottom: '30px',
          textAlign: 'center',
          border: '2px dashed #dee2e6'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🧠</div>
          <h3 style={{
            margin: '0 0 12px 0',
            color: '#495057',
            fontSize: '1.3rem'
          }}>
            Behavioral Analysis Ready
          </h3>
          <p style={{
            margin: 0,
            color: '#6c757d',
            fontSize: '0.95rem',
            lineHeight: '1.5'
          }}>
            Complete a debt analysis first in the "📊 Debt Analysis" tab to unlock your personalized financial behavioral insights, badges, and strategic recommendations.
          </p>
        </div>
      )}

          {/* BEHAVIORAL BADGES SECTION */}
          {(userFinancialData || loadedFinancialData) && (() => {
            const currentFinancialData = userFinancialData || loadedFinancialData;
            const currentSimulatorData = simulatorData || loadedSimulatorData;
            if (!currentFinancialData) return null;
            
            const personalityAssessment = assessPersonalityType(currentFinancialData, currentSimulatorData);
            const analysis = analyzeFinancialBehavior(currentFinancialData);
            if (!analysis) return null;
            
            // Badge interface
            interface Badge {
              id: string;
              title: string;
              subtitle: string;
              avatar: string;
              background: string;
              score?: number;
              confidence?: number;
              description: string;
            }
            
            // Calculate badge data
            const badges: Badge[] = [];
            
            // Personality Badge with Avatar
            const personalityAvatars = {
              spender: '🛍️',
              saver: '🏦',
              balanced: '⚖️',
              impulsive: '⚡',
              analytical: '🧮'
            };
            
            const personalityColors = {
              spender: 'linear-gradient(135deg, #ff6b6b, #ee5a52)',
              saver: 'linear-gradient(135deg, #51cf66, #37b24d)',
              balanced: 'linear-gradient(135deg, #339af0, #228be6)',
              impulsive: 'linear-gradient(135deg, #ffd43b, #fab005)',
              analytical: 'linear-gradient(135deg, #9775fa, #7c3aed)'
            };
            
            badges.push({
              id: 'personality',
              title: personalityAssessment.type.charAt(0).toUpperCase() + personalityAssessment.type.slice(1),
              subtitle: 'Financial Personality',
              avatar: personalityAvatars[personalityAssessment.type as keyof typeof personalityAvatars] || '👤',
              background: personalityColors[personalityAssessment.type as keyof typeof personalityColors] || personalityColors.balanced,
              confidence: personalityAssessment.confidence,
              description: personalityAssessment.reasoning
            });
            
            // Payment Consistency Badge
            if (currentSimulatorData?.paymentHistory) {
              const totalPayments = currentSimulatorData.paymentHistory.length;
              const skippedPayments = currentSimulatorData.paymentHistory.filter(p => p.action === 'skip').length;
              const consistencyRate = totalPayments > 0 ? ((totalPayments - skippedPayments) / totalPayments) * 100 : 100;
              
              let consistencyBadge = {
                id: 'consistency',
                title: 'Payment Master',
                subtitle: 'Consistency Champion',
                avatar: '🎯',
                background: 'linear-gradient(135deg, #51cf66, #37b24d)',
                score: Math.round(consistencyRate),
                description: 'Exceptional payment discipline'
              };
              
              if (consistencyRate < 70) {
                consistencyBadge = {
                  ...consistencyBadge,
                  title: 'Payment Warrior',
                  subtitle: 'Building Discipline',
                  avatar: '⚔️',
                  background: 'linear-gradient(135deg, #ffd43b, #fab005)',
                  description: 'Working on payment consistency'
                };
              } else if (consistencyRate < 90) {
                consistencyBadge = {
                  ...consistencyBadge,
                  title: 'Payment Pro',
                  subtitle: 'Strong Discipline',
                  avatar: '🛡️',
                  background: 'linear-gradient(135deg, #339af0, #228be6)',
                  description: 'Good payment habits forming'
                };
              }
              
              badges.push(consistencyBadge);
            }
            
            // Financial Control Badge
            const expenseRatio = parseFloat(analysis.expenseRatio);
            let controlBadge = {
              id: 'control',
              title: 'Budget Guardian',
              subtitle: 'Expense Control',
              avatar: '🏰',
              background: 'linear-gradient(135deg, #51cf66, #37b24d)',
              score: Math.max(0, 100 - expenseRatio),
              description: 'Excellent spending discipline'
            };
            
            if (expenseRatio > 85) {
              controlBadge = {
                ...controlBadge,
                title: 'Budget Fighter',
                subtitle: 'Expense Challenge',
                avatar: '🥊',
                background: 'linear-gradient(135deg, #ff6b6b, #ee5a52)',
                description: 'Working on spending control'
              };
            } else if (expenseRatio > 75) {
              controlBadge = {
                ...controlBadge,
                title: 'Budget Scout',
                subtitle: 'Expense Awareness',
                avatar: '🧭',
                background: 'linear-gradient(135deg, #ffd43b, #fab005)',
                description: 'Developing spending discipline'
              };
            }
            
            badges.push(controlBadge);
            
            // Debt Strategy Badge
            const debtToIncomeRatio = analysis.debtToIncomeRatio;
            let debtBadge = {
              id: 'debt-strategy',
              title: 'Debt Destroyer',
              subtitle: 'Strategic Payoff',
              avatar: '🗡️',
              background: 'linear-gradient(135deg, #9775fa, #7c3aed)',
              score: Math.max(0, Math.round((1 - debtToIncomeRatio) * 100)),
              description: 'Effective debt management strategy'
            };
            
            if (debtToIncomeRatio > 0.5) {
              debtBadge = {
                ...debtBadge,
                title: 'Debt Challenger',
                subtitle: 'Heavy Burden',
                avatar: '⛰️',
                background: 'linear-gradient(135deg, #ff6b6b, #ee5a52)',
                description: 'High debt load requires focus'
              };
            } else if (debtToIncomeRatio > 0.36) {
              debtBadge = {
                ...debtBadge,
                title: 'Debt Climber',
                subtitle: 'Making Progress',
                avatar: '🧗',
                background: 'linear-gradient(135deg, #ffd43b, #fab005)',
                description: 'Above average debt, manageable'
              };
            }
            
            badges.push(debtBadge);
            
            return (
              <div className="behavioral-badges-section" style={{
                background: '#fff',
                padding: '25px',
                borderRadius: '16px',
                marginBottom: '30px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
              }}>
                <div style={{ 
                  textAlign: 'center',
                  marginBottom: '25px'
                }}>
                  <h3 style={{
                    margin: '0 0 8px 0',
                    color: '#2d3748',
                    fontSize: '1.5rem',
                    fontWeight: '700'
                  }}>
                    🏅 Your Financial Behavioral Badges
                  </h3>
                  <p style={{
                    margin: 0,
                    color: '#6c757d',
                    fontSize: '0.95rem'
                  }}>
                    Achievement badges reflecting your unique financial personality and behaviors
                  </p>
                </div>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '20px'
                }}>
                  {badges.map((badge) => (
                    <div key={badge.id} style={{
                      background: badge.background,
                      borderRadius: '16px',
                      padding: '24px',
                      color: 'white',
                      position: 'relative',
                      overflow: 'hidden',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                      transform: 'translateY(0)',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = 'translateY(-5px)';
                      e.currentTarget.style.boxShadow = '0 12px 35px rgba(0,0,0,0.2)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
                    }}>
                      {/* Decorative background pattern */}
                      <div style={{
                        position: 'absolute',
                        top: '-50px',
                        right: '-50px',
                        width: '120px',
                        height: '120px',
                        background: 'rgba(255,255,255,0.1)',
                        borderRadius: '50%',
                        transform: 'rotate(45deg)'
                      }}></div>
                      <div style={{
                        position: 'absolute',
                        bottom: '-30px',
                        left: '-30px',
                        width: '80px',
                        height: '80px',
                        background: 'rgba(255,255,255,0.08)',
                        borderRadius: '50%'
                      }}></div>
                      
                      {/* Badge content */}
                      <div style={{ position: 'relative', zIndex: 2 }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          marginBottom: '16px'
                        }}>
                          <div style={{
                            fontSize: '2.5rem',
                            marginRight: '16px',
                            background: 'rgba(255,255,255,0.2)',
                            borderRadius: '12px',
                            padding: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minWidth: '64px',
                            minHeight: '64px'
                          }}>
                            {badge.avatar}
                          </div>
                          <div>
                            <h4 style={{
                              margin: '0 0 4px 0',
                              fontSize: '1.25rem',
                              fontWeight: '700',
                              textShadow: '0 2px 4px rgba(0,0,0,0.2)'
                            }}>
                              {badge.title}
                            </h4>
                            <p style={{
                              margin: 0,
                              fontSize: '0.9rem',
                              opacity: 0.9,
                              fontWeight: '500'
                            }}>
                              {badge.subtitle}
                            </p>
                          </div>
                        </div>
                        
                        {badge.score !== undefined && (
                          <div style={{
                            background: 'rgba(255,255,255,0.2)',
                            borderRadius: '10px',
                            padding: '12px',
                            marginBottom: '12px',
                            textAlign: 'center'
                          }}>
                            <div style={{
                              fontSize: '2rem',
                              fontWeight: '800',
                              marginBottom: '4px'
                            }}>
                              {badge.score}%
                            </div>
                            <div style={{
                              fontSize: '0.8rem',
                              opacity: 0.9
                            }}>
                              Achievement Score
                            </div>
                          </div>
                        )}
                        
                        {badge.confidence && (
                          <div style={{
                            background: 'rgba(255,255,255,0.2)',
                            borderRadius: '10px',
                            padding: '12px',
                            marginBottom: '12px',
                            textAlign: 'center'
                          }}>
                            <div style={{
                              fontSize: '2rem',
                              fontWeight: '800',
                              marginBottom: '4px'
                            }}>
                              {badge.confidence}%
                            </div>
                            <div style={{
                              fontSize: '0.8rem',
                              opacity: 0.9
                            }}>
                              Confidence Level
                            </div>
                          </div>
                        )}
                        
                        <p style={{
                          margin: 0,
                          fontSize: '0.9rem',
                          lineHeight: '1.4',
                          opacity: 0.95
                        }}>
                          {badge.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div style={{
                  marginTop: '25px',
                  textAlign: 'center',
                  padding: '20px',
                  background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)',
                  borderRadius: '12px',
                  border: '2px dashed #dee2e6'
                }}>
                  <div style={{ fontSize: '2rem', marginBottom: '12px' }}>🎖️</div>
                  <h4 style={{
                    margin: '0 0 8px 0',
                    color: '#495057',
                    fontSize: '1.1rem'
                  }}>
                    Keep Building Your Financial Profile
                  </h4>
                  <p style={{
                    margin: 0,
                    color: '#6c757d',
                    fontSize: '0.9rem'
                  }}>
                    Use the Payment Simulator to unlock more achievement badges and improve your financial behavioral score
                  </p>
                </div>
              </div>
            );
          })()}

          {/* DELINQUENCY IMPACT ANALYSIS SECTION */}
          {(simulatorData?.delinquencyData?.hasDelinquent || loadedSimulatorData?.delinquencyData?.hasDelinquent) && (
            <div className="delinquency-consequences-section" style={{
              background: '#fff',
              padding: '30px',
              borderRadius: '20px',
              marginBottom: '30px',
              boxShadow: '0 6px 30px rgba(255, 107, 107, 0.1)',
              border: '2px solid #fed7d7',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Decorative warning pattern */}
              <div style={{
                position: 'absolute',
                top: '-20px',
                right: '-20px',
                width: '80px',
                height: '80px',
                background: 'linear-gradient(45deg, #ff6b6b, #ff5252)',
                borderRadius: '50%',
                opacity: 0.1,
                transform: 'rotate(45deg)'
              }}></div>
              <div style={{
                position: 'absolute',
                bottom: '-30px',
                left: '-30px',
                width: '100px',
                height: '100px',
                background: 'linear-gradient(45deg, #ff6b6b, #ff5252)',
                borderRadius: '50%',
                opacity: 0.05
              }}></div>
              <div style={{ position: 'relative', zIndex: 2 }}>
                <div style={{ textAlign: 'center', marginBottom: '25px' }}>
                  <h3 style={{
                    margin: '0 0 8px 0',
                    color: '#c53030',
                    fontSize: '1.6rem',
                    fontWeight: '700'
                  }}>
                    🚨 Delinquency Impact Analysis
                  </h3>
                  <p style={{
                    margin: 0,
                    color: '#e53e3e',
                    fontSize: '0.95rem',
                    fontWeight: '500'
                  }}>
                    Critical financial situation requiring immediate attention
                  </p>
                </div>
              </div>
              <div className="delinquency-alert">
                <div className="alert-header">
                  <span className="alert-icon">⚠️</span>
                  <h4>Accounts Currently Delinquent</h4>
                </div>
                
                {(() => {
                  const delinquencyInfo = simulatorData?.delinquencyData || loadedSimulatorData?.delinquencyData;
                  if (!delinquencyInfo) return null;
                  
                  const worstStatus = delinquencyInfo.worstStatus || 0;
                  const totalPastDue = delinquencyInfo.totalPastDue || 0;
                  const accountsDelinquent = delinquencyInfo.accountsDelinquent || 0;
                  
                  return (
                    <div className="delinquency-details">
                      <div className="delinquency-stats" style={{
                        background: 'linear-gradient(135deg, #fff5f5 0%, #fed7d7 100%)',
                        border: '2px solid #fc8181',
                        borderRadius: '12px',
                        padding: '20px',
                        marginTop: '15px'
                      }}>
                        <div className="stat-item" style={{marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                          <span style={{color: '#2d3748', fontWeight: '500', fontSize: '14px'}}>Accounts Delinquent:</span>
                          <span style={{color: '#c53030', fontWeight: '700', fontSize: '18px', fontFamily: 'monospace'}}>{accountsDelinquent}</span>
                        </div>
                        <div className="stat-item" style={{marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                          <span style={{color: '#2d3748', fontWeight: '500', fontSize: '14px'}}>Total Past Due:</span>
                          <span style={{color: '#c53030', fontWeight: '700', fontSize: '18px', fontFamily: 'monospace'}}>${totalPastDue.toLocaleString()}</span>
                        </div>
                        <div className="stat-item" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                          <span style={{color: '#2d3748', fontWeight: '500', fontSize: '14px'}}>Worst Status:</span>
                          <span style={{color: '#c53030', fontWeight: '700', fontSize: '16px', fontFamily: 'monospace'}}>{worstStatus} days past due</span>
                        </div>
                      </div>
                      
                      <div className="consequences-grid">
                        <div className="consequence-card credit-impact">
                          <div className="consequence-icon">📉</div>
                          <h5>Credit Score Impact</h5>
                          <div className="impact-level">
                            {worstStatus >= 90 ? (
                              <span className="severe">Severe Damage (-100 to -150 points)</span>
                            ) : worstStatus >= 60 ? (
                              <span className="major">Major Damage (-50 to -100 points)</span>
                            ) : worstStatus >= 30 ? (
                              <span className="moderate">Moderate Damage (-20 to -50 points)</span>
                            ) : (
                              <span className="minor">Minor Impact (-5 to -20 points)</span>
                            )}
                          </div>
                          <p className="consequence-desc">
                            {worstStatus >= 90 
                              ? "Accounts 90+ days past due cause severe, long-lasting credit damage. Recovery can take 2-3 years."
                              : worstStatus >= 60
                              ? "60+ days delinquency significantly impacts creditworthiness and future loan eligibility."
                              : "Early delinquency is reported to credit bureaus, beginning negative impact on your score."}
                          </p>
                        </div>
                        
                        <div className="consequence-card financial-impact">
                          <div className="consequence-icon">💰</div>
                          <h5>Financial Consequences</h5>
                          <div className="financial-costs">
                            <div className="cost-item">
                              <span>Late Fees:</span>
                              <span>${(accountsDelinquent * 35).toLocaleString()} per month</span>
                            </div>
                            <div className="cost-item">
                              <span>Higher Interest:</span>
                              <span>Up to 29.99% penalty APR</span>
                            </div>
                            <div className="cost-item">
                              <span>Collection Costs:</span>
                              <span>{worstStatus >= 120 ? 'Likely' : worstStatus >= 90 ? 'Possible' : 'Unlikely'}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="consequence-card future-impact">
                          <div className="consequence-icon">🔮</div>
                          <h5>Future Access Impact</h5>
                          <div className="access-impacts">
                            <div className="impact-item">
                              <span>New Credit Cards:</span>
                              <span className={worstStatus >= 60 ? 'blocked' : worstStatus >= 30 ? 'limited' : 'available'}>  
                                {worstStatus >= 60 ? 'Likely Denied' : worstStatus >= 30 ? 'Higher Rates Only' : 'Standard Rates'}
                              </span>
                            </div>
                            <div className="impact-item">
                              <span>Home Loans:</span>
                              <span className={worstStatus >= 90 ? 'blocked' : worstStatus >= 60 ? 'limited' : 'available'}>
                                {worstStatus >= 90 ? 'Major Obstacle' : worstStatus >= 60 ? 'Higher Rates/Down Payment' : 'Standard Terms'}
                              </span>
                            </div>
                            <div className="impact-item">
                              <span>Employment:</span>
                              <span className={worstStatus >= 60 ? 'risk' : 'safe'}>
                                {worstStatus >= 60 ? 'May Impact Background Checks' : 'No Impact Expected'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="recovery-action">
                        <h5>🚀 Immediate Action Required</h5>
                        <div className="action-steps">
                          <div className="step urgent">
                            <span className="step-number">1</span>
                            <div className="step-content">
                              <strong>Get Current Immediately:</strong>
                              <p>Pay ${totalPastDue.toLocaleString()} in past due amounts to stop further damage.</p>
                            </div>
                          </div>
                          <div className="step important">
                            <span className="step-number">2</span>
                            <div className="step-content">
                              <strong>Set Up Payment Plan:</strong>
                              <p>Contact creditors to negotiate payment arrangements and prevent charge-offs.</p>
                            </div>
                          </div>
                          <div className="step helpful">
                            <span className="step-number">3</span>
                            <div className="step-content">
                              <strong>Use Payment Simulator:</strong>
                              <p>Practice different payment scenarios to avoid future delinquency.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}
          
          {/* PAYMENT SIMULATOR BEHAVIORAL ANALYSIS SECTION */}
          {(simulatorData || loadedSimulatorData) && (() => {
            const simData = simulatorData || loadedSimulatorData;
            if (!simData?.paymentHistory || simData.paymentHistory.length === 0) return null;
            
            // Only count actual user actions, not default entries
            const actualPayments = simData.paymentHistory.filter(p => p.action === 'normal').length;
            const skippedPayments = simData.paymentHistory.filter(p => p.action === 'skip').length;
            const advancePayments = simData.paymentHistory.filter(p => p.action === 'advance').length;
            const totalUserActions = actualPayments + skippedPayments + advancePayments;
            const consistencyScore = totalUserActions > 0 ? Math.round(((actualPayments + advancePayments) / totalUserActions) * 100) : 100;
            
            // Calculate consecutive skipped months from payment history
            let consecutiveSkippedMonths = 0;
            let currentStreak = 0;
            if (simData.paymentHistory) {
              for (let i = simData.paymentHistory.length - 1; i >= 0; i--) {
                if (simData.paymentHistory[i].action === 'skip') {
                  currentStreak++;
                } else {
                  break;
                }
              }
              consecutiveSkippedMonths = currentStreak;
            }
            
            // Calculate delinquency events from delinquency data
            const delinquencyEvents = simData.delinquencyData?.hasDelinquent ? 1 : 0;
            
            return (
              <div className="payment-simulator-analysis" style={{
                background: '#fff',
                padding: '30px',
                borderRadius: '20px',
                marginBottom: '30px',
                boxShadow: '0 6px 30px rgba(102, 126, 234, 0.08)',
                border: '2px solid #e2e8f0',
                position: 'relative',
                overflow: 'hidden'
              }}>
                {/* Decorative pattern */}
                <div style={{
                  position: 'absolute',
                  top: '-30px',
                  right: '-30px',
                  width: '100px',
                  height: '100px',
                  background: 'linear-gradient(45deg, #667eea, #764ba2)',
                  borderRadius: '50%',
                  opacity: 0.08
                }}></div>
                <div style={{
                  position: 'absolute',
                  bottom: '-20px',
                  left: '-20px',
                  width: '80px',
                  height: '80px',
                  background: 'linear-gradient(45deg, #667eea, #764ba2)',
                  borderRadius: '50%',
                  opacity: 0.05,
                  transform: 'rotate(45deg)'
                }}></div>
                
                <div style={{ position: 'relative', zIndex: 2 }}>
                  <div style={{ textAlign: 'center', marginBottom: '25px' }}>
                    <h3 style={{
                      margin: '0 0 8px 0',
                      color: '#2d3748',
                      fontSize: '1.5rem',
                      fontWeight: '700'
                    }}>
                      🎯 Payment Simulator Behavioral Analysis
                    </h3>
                    <p style={{
                      margin: 0,
                      color: '#6c757d',
                      fontSize: '0.95rem'
                    }}>
                      Real-time behavioral insights based on your {totalUserActions} simulated payment decisions
                    </p>
                  </div>
                </div>
                
                <div className="simulator-metrics-grid">
                  <div className="metric-card consistency">
                    <div className="metric-icon">📊</div>
                    <h4>Payment Reliability Score</h4>
                    <div className="metric-value">
                      <span className={`score ${consistencyScore >= 90 ? 'excellent' : consistencyScore >= 70 ? 'good' : 'critical'}`}>
                        {consistencyScore}%
                      </span>
                    </div>
                    <p className="metric-desc">
                      {consistencyScore >= 90 ? "Exceptional payment discipline! You rarely miss payments." :
                       consistencyScore >= 70 ? "Good payment habits with minor gaps. Stay consistent." :
                       "Payment reliability needs immediate attention. Focus on automation."}
                    </p>
                    <div className="metric-breakdown">
                      <small>{actualPayments + advancePayments} payments made • {skippedPayments} skipped • {consecutiveSkippedMonths} consecutive misses</small>
                    </div>
                  </div>
                  
                  <div className="metric-card initiative">
                    <div className="metric-icon">🚀</div>
                    <h4>Proactive Payment Behavior</h4>
                    <div className="metric-value">
                      <span className={`count ${advancePayments > 3 ? 'high' : advancePayments > 0 ? 'moderate' : 'low'}`}>
                        {advancePayments} extra payments
                      </span>
                    </div>
                    <p className="metric-desc">
                      {advancePayments > 3 ? "Outstanding initiative! Extra payments accelerate debt freedom significantly." :
                       advancePayments > 0 ? "Good proactive behavior. Consider making extra payments more regularly." :
                       "Opportunity to accelerate debt payoff with occasional extra payments."}
                    </p>
                  </div>
                  
                  <div className="metric-card risk-assessment">
                    <div className="metric-icon">⚠️</div>
                    <h4>Payment Risk Assessment</h4>
                    <div className="metric-value">
                      <span className={`risk-level ${consecutiveSkippedMonths >= 3 ? 'critical' : skippedPayments > 2 ? 'high' : skippedPayments > 0 ? 'moderate' : 'low'}`}>
                        {consecutiveSkippedMonths >= 3 ? 'CRITICAL' : skippedPayments > 2 ? 'HIGH' : skippedPayments > 0 ? 'MODERATE' : 'LOW'}
                      </span>
                    </div>
                    <p className="metric-desc">
                      {consecutiveSkippedMonths >= 3 ? `URGENT: ${consecutiveSkippedMonths} consecutive missed payments indicate financial crisis.` :
                       skippedPayments > 2 ? "Multiple missed payments suggest budgeting challenges." :
                       skippedPayments > 0 ? "Occasional missed payments - monitor closely." :
                       "Excellent payment discipline with zero missed payments."}
                    </p>
                    {delinquencyEvents > 0 && (
                      <div className="delinquency-alert">
                        <small>⚡ Delinquency detected - immediate action required</small>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}


          {/* Fallback message when no financial data is available */}
          {!userFinancialData && !loadedFinancialData && (
            <div className="financial-behavior-section">
              <h3>💰 Financial Behavior Analysis</h3>
              <div style={{textAlign: 'center', padding: '40px 20px', color: '#6c757d'}}>
                <div style={{fontSize: '3rem', marginBottom: '20px'}}>📊</div>
                <h4>No Financial Data Available</h4>
                <p>Complete a debt analysis first to see your personalized financial behavior insights, spending patterns, and behavioral recommendations based on your actual income, expenses, and debt data.</p>
                <p style={{marginTop: '20px'}}>
                  <em>Go to the Debt Analysis tab, enter your financial information, and run an analysis to unlock detailed behavioral insights.</em>
                </p>
              </div>
            </div>
          )}

          {/* PERSONALIZED BEHAVIORAL STRATEGIES SECTION */}
          {(userFinancialData || loadedFinancialData || simulatorData || loadedSimulatorData) && (() => {
            const financialData = userFinancialData || loadedFinancialData;
            const simData = simulatorData || loadedSimulatorData;
            
            // Calculate strategy indicators from available data
            const hasSimulatorData = simData?.paymentHistory && simData.paymentHistory.length > 0;
            const hasFinancialData = financialData?.totalIncome;
            
            if (!hasSimulatorData && !hasFinancialData) return null;
            
            let behavioralStrategies: any[] = [];
            
            // Add strategies based on available data
            if (hasFinancialData) {
              const analysis = analyzeFinancialBehavior(financialData);
              const personalityType = assessPersonalityType(financialData, null);
              
              if (analysis && parseFloat(analysis.expenseRatio) > 80) {
                behavioralStrategies.push({
                  type: 'expense-control',
                  priority: 'high',
                  title: 'Expense Control Strategy',
                  description: 'Your expense ratio suggests tight budget constraints',
                  strategies: [
                    'Track every expense for 30 days to identify patterns',
                    'Implement the 50/30/20 rule gradually',
                    'Use cash envelopes for discretionary spending',
                    'Set up automatic transfers to prevent overspending'
                  ]
                });
              }
              
              if (personalityType.type === 'impulsive') {
                behavioralStrategies.push({
                  type: 'impulse-management',
                  priority: 'critical',
                  title: 'Impulse Control Strategies',
                  description: 'Your spending patterns suggest impulsive financial decisions',
                  strategies: [
                    'Implement 24-hour waiting period for purchases >$50',
                    'Remove saved payment methods from shopping apps',
                    'Set up automatic debt payments to prevent skipping',
                    'Use separate checking account for discretionary spending'
                  ]
                });
              }
              
              if (analysis && analysis.availableAmount < 200) {
                behavioralStrategies.push({
                  type: 'income-optimization',
                  priority: 'high',
                  title: 'Financial Capacity Building',
                  description: 'Limited payment capacity requires income/expense optimization',
                  strategies: [
                    'Audit all subscriptions and cancel unused services',
                    'Negotiate bills (phone, insurance, utilities)',
                    'Explore side income opportunities',
                    'Consider debt consolidation to lower minimum payments'
                  ]
                });
              }
            }
            
            if (hasSimulatorData && simData.paymentHistory) {
              const skippedCount = simData.paymentHistory.filter(p => p.action === 'skip').length;
              const totalPayments = simData.paymentHistory.length;
              const consistencyRate = ((totalPayments - skippedCount) / totalPayments) * 100;
              
              if (consistencyRate < 80) {
                behavioralStrategies.push({
                  type: 'payment-consistency',
                  priority: skippedCount > 3 ? 'critical' : 'high',
                  title: 'Payment Reliability Enhancement',
                  description: `Your payment consistency is ${Math.round(consistencyRate)}% - reliability is crucial`,
                  strategies: [
                    'Set up automatic payments for all minimum amounts',
                    'Create payment calendar with SMS reminders',
                    'Build emergency buffer equal to 1 month minimum payments',
                    'Use payment apps with progress visualization'
                  ]
                });
              }
              
              const advancePayments = simData.paymentHistory.filter(p => p.action === 'advance').length;
              if (advancePayments === 0 && consistencyRate >= 80) {
                behavioralStrategies.push({
                  type: 'acceleration-opportunity',
                  priority: 'medium',
                  title: 'Debt Acceleration Opportunities',
                  description: 'Strong payment discipline creates opportunities for faster payoff',
                  strategies: [
                    'Round up payments to nearest $25',
                    'Apply windfalls (bonuses, tax refunds) to debt',
                    'Focus on systematic debt reduction with your current strategy',
                    'Set milestone celebrations for motivation'
                  ]
                });
              }
            }
            
            // Sort by priority
            const priorityOrder: { [key: string]: number } = { critical: 0, high: 1, medium: 2, low: 3 };
            behavioralStrategies.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
            
            return (
              <div className="behavioral-strategies-section" style={{
                background: '#fff',
                padding: '30px',
                borderRadius: '20px',
                marginBottom: '30px',
                boxShadow: '0 6px 30px rgba(116, 75, 162, 0.08)',
                border: '2px solid #e2e8f0',
                position: 'relative',
                overflow: 'hidden'
              }}>
                {/* Decorative pattern */}
                <div style={{
                  position: 'absolute',
                  top: '-25px',
                  right: '-25px',
                  width: '90px',
                  height: '90px',
                  background: 'linear-gradient(45deg, #764ba2, #667eea)',
                  borderRadius: '50%',
                  opacity: 0.08,
                  transform: 'rotate(30deg)'
                }}></div>
                <div style={{
                  position: 'absolute',
                  bottom: '-40px',
                  left: '-40px',
                  width: '120px',
                  height: '120px',
                  background: 'linear-gradient(45deg, #764ba2, #667eea)',
                  borderRadius: '50%',
                  opacity: 0.04
                }}></div>
                
                <div style={{ position: 'relative', zIndex: 2 }}>
                  <div style={{ textAlign: 'center', marginBottom: '25px' }}>
                    <h3 style={{
                      margin: '0 0 8px 0',
                      color: '#2d3748',
                      fontSize: '1.5rem',
                      fontWeight: '700'
                    }}>
                      🎯 Personalized Behavioral Strategies
                    </h3>
                    <p style={{
                      margin: 0,
                      color: '#6c757d',
                      fontSize: '0.95rem'
                    }}>
                      Actionable strategies tailored to your specific behavioral patterns and financial situation
                    </p>
                  </div>
                </div>
                
                <div className="strategies-grid">
                  {behavioralStrategies.map((strategy, index) => (
                    <div key={index} className={`strategy-card priority-${strategy.priority}`}>
                      <div className="strategy-header">
                        <h4>{strategy.title}</h4>
                        <span className={`priority-badge ${strategy.priority}`}>
                          {strategy.priority.toUpperCase()}
                        </span>
                      </div>
                      <p className="strategy-description">{strategy.description}</p>
                      <div className="strategy-actions" style={{
                        marginTop: '15px',
                        padding: '15px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0'
                      }}>
                        <h5 style={{
                          color: '#2d3748',
                          marginBottom: '12px',
                          fontSize: '14px',
                          fontWeight: '600',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}>Action Steps:</h5>
                        <ul style={{
                          margin: 0,
                          padding: 0,
                          listStyle: 'none'
                        }}>
                          {strategy.strategies.map((step: string, stepIndex: number) => (
                            <li key={stepIndex} style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              marginBottom: '10px',
                              padding: '8px',
                              backgroundColor: 'white',
                              borderRadius: '6px',
                              border: '1px solid #e2e8f0'
                            }}>
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '24px',
                                height: '24px',
                                backgroundColor: '#4299e1',
                                color: 'white',
                                borderRadius: '50%',
                                fontSize: '12px',
                                fontWeight: '600',
                                marginRight: '10px',
                                flexShrink: 0
                              }}>
                                {stepIndex + 1}
                              </span>
                              <span style={{
                                color: '#2d3748',
                                fontSize: '14px',
                                lineHeight: '1.4',
                                fontWeight: '400'
                              }}>
                                {step}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                  
                  {behavioralStrategies.length === 0 && (
                    <div className="strategy-card success">
                      <div className="strategy-header">
                        <h4>🏆 Excellent Behavioral Profile</h4>
                        <span className="priority-badge success">OPTIMAL</span>
                      </div>
                      <p className="strategy-description">
                        Your financial behavior patterns show strong discipline and control.
                      </p>
                      <div className="strategy-actions" style={{
                        marginTop: '15px',
                        padding: '15px',
                        backgroundColor: '#f0fff4',
                        borderRadius: '8px',
                        border: '1px solid #9ae6b4'
                      }}>
                        <h5 style={{
                          color: '#2d3748',
                          marginBottom: '12px',
                          fontSize: '14px',
                          fontWeight: '600',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}>Optimization Opportunities:</h5>
                        <ul style={{
                          margin: 0,
                          padding: 0,
                          listStyle: 'none'
                        }}>
                          <li style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            marginBottom: '10px',
                            padding: '8px',
                            backgroundColor: 'white',
                            borderRadius: '6px',
                            border: '1px solid #c6f6d5'
                          }}>
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '24px',
                              height: '24px',
                              backgroundColor: '#48bb78',
                              color: 'white',
                              borderRadius: '50%',
                              fontSize: '12px',
                              fontWeight: '600',
                              marginRight: '10px',
                              flexShrink: 0
                            }}>1</span>
                            <span style={{
                              color: '#2d3748',
                              fontSize: '14px',
                              lineHeight: '1.4',
                              fontWeight: '400'
                            }}>Consider increasing payment amounts for faster payoff</span>
                          </li>
                          <li style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            marginBottom: '10px',
                            padding: '8px',
                            backgroundColor: 'white',
                            borderRadius: '6px',
                            border: '1px solid #c6f6d5'
                          }}>
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '24px',
                              height: '24px',
                              backgroundColor: '#48bb78',
                              color: 'white',
                              borderRadius: '50%',
                              fontSize: '12px',
                              fontWeight: '600',
                              marginRight: '10px',
                              flexShrink: 0
                            }}>2</span>
                            <span style={{
                              color: '#2d3748',
                              fontSize: '14px',
                              lineHeight: '1.4',
                              fontWeight: '400'
                            }}>Build emergency fund while maintaining debt progress</span>
                          </li>
                          <li style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            padding: '8px',
                            backgroundColor: 'white',
                            borderRadius: '6px',
                            border: '1px solid #c6f6d5'
                          }}>
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '24px',
                              height: '24px',
                              backgroundColor: '#48bb78',
                              color: 'white',
                              borderRadius: '50%',
                              fontSize: '12px',
                              fontWeight: '600',
                              marginRight: '10px',
                              flexShrink: 0
                            }}>3</span>
                            <span style={{
                              color: '#2d3748',
                              fontSize: '14px',
                              lineHeight: '1.4',
                              fontWeight: '400'
                            }}>Explore investment opportunities after debt freedom</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

    </div>
  );
};

export default BehavioralDashboard;