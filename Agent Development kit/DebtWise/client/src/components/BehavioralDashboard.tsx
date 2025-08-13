import React, { useState, useEffect } from 'react';
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

const BehavioralDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<BehavioralDashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string>('');
  const [selectedNudge, setSelectedNudge] = useState<BehavioralNudge | null>(null);

  useEffect(() => {
    loadBehavioralData();
  }, []);

  const loadBehavioralData = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/behavioral/profile/demo_user_123');
      const result = await response.json();
      
      if (result.success) {
        const [insightsRes, nudgesRes] = await Promise.all([
          fetch('http://localhost:3001/api/behavioral/insights/demo_user_123'),
          fetch('http://localhost:3001/api/behavioral/nudges/demo_user_123')
        ]);
        
        const insightsData = await insightsRes.json();
        const nudgesData = await nudgesRes.json();
        
        setDashboardData({
          profile: result.data,
          insights: insightsData.success ? insightsData.data : [],
          nudges: nudgesData.success ? nudgesData.data : []
        });
      }
    } catch (error) {
      console.error('Failed to load behavioral data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createDemoBehavioralAnalysis = async () => {
    setLoading(true);
    setMessage('');
    try {
      const response = await fetch('http://localhost:3001/api/behavioral/demo/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      const result = await response.json();
      
      if (result.success) {
        setDashboardData({
          profile: result.data.profile,
          insights: result.data.insights,
          nudges: result.data.nudges
        });
        setMessage('🧠 Behavioral analysis completed! Personalized insights and nudges generated.');
      } else {
        setMessage(`❌ Error: ${result.error}`);
      }
    } catch (error) {
      setMessage('❌ Failed to create behavioral analysis');
      console.error('Failed to create demo behavioral analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  const triggerBehavioralEvent = async (triggerType: string) => {
    setLoading(true);
    setMessage('');
    try {
      const response = await fetch('http://localhost:3001/api/behavioral/demo/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ triggerType })
      });
      const result = await response.json();
      
      if (result.success) {
        if (result.data.nudge) {
          setSelectedNudge(result.data.nudge);
          setMessage(`🎯 Behavioral trigger "${triggerType}" activated! New personalized nudge generated.`);
        }
        // Reload nudges to show the new one
        await loadBehavioralData();
      } else {
        setMessage(`❌ Error: ${result.error}`);
      }
    } catch (error) {
      setMessage('❌ Failed to trigger behavioral event');
      console.error('Failed to trigger behavioral event:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNudgeAction = async (nudge: BehavioralNudge, action: 'viewed' | 'acted') => {
    try {
      await fetch(`http://localhost:3001/api/behavioral/nudges/${nudge.id}/${action}`, {
        method: 'POST'
      });
      
      if (action === 'acted') {
        setMessage(`✅ Great job! You acted on the nudge: "${nudge.content.title}"`);
      }
      
      await loadBehavioralData();
    } catch (error) {
      console.error(`Failed to mark nudge as ${action}:`, error);
    }
  };

  const getPersonalityColor = (type: string) => {
    const colors = {
      spender: '#e74c3c',
      saver: '#27ae60',
      balanced: '#3498db',
      impulsive: '#f39c12',
      analytical: '#9b59b6'
    };
    return colors[type as keyof typeof colors] || '#95a5a6';
  };

  const getInsightIcon = (type: string) => {
    const icons = {
      spending_pattern: '💳',
      payment_behavior: '📅',
      motivation_trend: '🎯',
      risk_factor: '⚠️',
      opportunity: '🚀'
    };
    return icons[type as keyof typeof icons] || '📊';
  };

  const getNudgeIcon = (type: string) => {
    const icons = {
      spending_prevention: '🛑',
      payment_motivation: '💪',
      habit_formation: '🔄',
      goal_reinforcement: '🎯'
    };
    return icons[type as keyof typeof icons] || '💡';
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

      {/* Setup Section */}
      <div className="setup-section">
        <h3>🔬 Behavioral Intelligence</h3>
        <p>Analyze your spending patterns, payment behaviors, and psychological triggers to deliver personalized nudges that motivate better financial decisions.</p>
        <div className="setup-buttons">
          <button 
            onClick={createDemoBehavioralAnalysis} 
            disabled={loading}
            className="setup-btn primary"
          >
            {loading ? 'Analyzing...' : '🧠 Create Behavioral Analysis'}
          </button>
        </div>
      </div>

      {dashboardData && (
        <>
          {/* Behavioral Profile */}
          {dashboardData.profile && (
            <div className="profile-section">
              <h3>👤 Your Behavioral Profile</h3>
              <div className="profile-grid">
                <div className="profile-card">
                  <div className="profile-icon">🧬</div>
                  <h4>Personality Type</h4>
                  <div className="profile-value" style={{color: getPersonalityColor(dashboardData.profile.personalityType)}}>
                    {dashboardData.profile.personalityType.toUpperCase()}
                  </div>
                </div>
                <div className="profile-card">
                  <div className="profile-icon">🎯</div>
                  <h4>Motivation Style</h4>
                  <div className="profile-value">
                    {dashboardData.profile.motivationType.toUpperCase()}
                  </div>
                </div>
                <div className="profile-card">
                  <div className="profile-icon">⚖️</div>
                  <h4>Risk Tolerance</h4>
                  <div className="profile-value">
                    {dashboardData.profile.riskTolerance.toUpperCase()}
                  </div>
                </div>
                <div className="profile-card">
                  <div className="profile-icon">📊</div>
                  <h4>Confidence Score</h4>
                  <div className="profile-value">
                    {dashboardData.profile.confidenceScore}%
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Trigger Simulation */}
          <div className="triggers-section">
            <h3>⚡ Behavioral Trigger Simulation</h3>
            <p>Test different behavioral scenarios to see personalized nudges in action:</p>
            <div className="trigger-buttons">
              <button 
                onClick={() => triggerBehavioralEvent('spending_alert')} 
                disabled={loading}
                className="trigger-btn spending"
              >
                🛒 Spending Alert
              </button>
              <button 
                onClick={() => triggerBehavioralEvent('payment_reminder')} 
                disabled={loading}
                className="trigger-btn payment"
              >
                📅 Payment Reminder
              </button>
              <button 
                onClick={() => triggerBehavioralEvent('milestone_celebration')} 
                disabled={loading}
                className="trigger-btn milestone"
              >
                🎉 Milestone Celebration
              </button>
              <button 
                onClick={() => triggerBehavioralEvent('streak_maintenance')} 
                disabled={loading}
                className="trigger-btn streak"
              >
                🔥 Streak Maintenance
              </button>
              <button 
                onClick={() => triggerBehavioralEvent('social_comparison')} 
                disabled={loading}
                className="trigger-btn social"
              >
                👥 Social Comparison
              </button>
            </div>
          </div>

          {/* Active Nudges */}
          {dashboardData.nudges.length > 0 && (
            <div className="nudges-section">
              <h3>💡 Active Nudges</h3>
              <div className="nudges-grid">
                {dashboardData.nudges.slice(0, 6).map((nudge) => (
                  <div key={nudge.id} className={`nudge-card ${nudge.type} ${nudge.content.priority}`}>
                    <div className="nudge-header">
                      <span className="nudge-icon">{getNudgeIcon(nudge.type)}</span>
                      <span className={`nudge-status ${nudge.status}`}>
                        {nudge.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <h4>{nudge.content.title}</h4>
                    <p className="nudge-message">{nudge.content.message}</p>
                    <div className="nudge-actions">
                      {nudge.status === 'pending' && (
                        <>
                          <button 
                            onClick={() => handleNudgeAction(nudge, 'viewed')}
                            className="nudge-btn view"
                          >
                            👁️ View
                          </button>
                          <button 
                            onClick={() => handleNudgeAction(nudge, 'acted')}
                            className="nudge-btn act"
                          >
                            ✅ {nudge.content.actionText || 'Act'}
                          </button>
                        </>
                      )}
                    </div>
                    <div className="nudge-meta">
                      <small>Effectiveness: {Math.round(nudge.effectiveness * 100)}%</small>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Behavioral Insights */}
          {dashboardData.insights.length > 0 && (
            <div className="insights-section">
              <h3>🔍 Behavioral Insights</h3>
              <div className="insights-grid">
                {dashboardData.insights.map((insight) => (
                  <div key={insight.id} className={`insight-card ${insight.impact} ${insight.severity}`}>
                    <div className="insight-header">
                      <span className="insight-icon">{getInsightIcon(insight.type)}</span>
                      <div className="insight-meta">
                        <span className={`insight-impact ${insight.impact}`}>
                          {insight.impact.toUpperCase()}
                        </span>
                        <span className="insight-confidence">
                          {Math.round(insight.confidence)}% confidence
                        </span>
                      </div>
                    </div>
                    <h4>{insight.title}</h4>
                    <p className="insight-description">{insight.description}</p>
                    
                    {insight.actionable && insight.recommendations.length > 0 && (
                      <div className="insight-recommendations">
                        <h5>💡 Recommendations:</h5>
                        <ul>
                          {insight.recommendations.slice(0, 3).map((rec, index) => (
                            <li key={index}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Spending Triggers */}
          {dashboardData.profile && dashboardData.profile.spendingTriggers.length > 0 && (
            <div className="triggers-analysis-section">
              <h3>🎯 Spending Trigger Analysis</h3>
              <div className="triggers-grid">
                {dashboardData.profile.spendingTriggers.map((trigger) => (
                  <div key={trigger.id} className={`trigger-card ${trigger.type}`}>
                    <div className="trigger-header">
                      <h4>{trigger.trigger}</h4>
                      <span className="trigger-type">{trigger.type}</span>
                    </div>
                    <div className="trigger-stats">
                      <div className="stat">
                        <span className="stat-label">Frequency</span>
                        <span className="stat-value">{trigger.frequency} times</span>
                      </div>
                      <div className="stat">
                        <span className="stat-label">Avg Amount</span>
                        <span className="stat-value">${trigger.averageAmount.toFixed(2)}</span>
                      </div>
                      <div className="stat">
                        <span className="stat-label">Pattern</span>
                        <span className="stat-value">{trigger.timePattern}</span>
                      </div>
                      <div className="stat">
                        <span className="stat-label">Confidence</span>
                        <span className="stat-value">{Math.round(trigger.confidence * 100)}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Payment Patterns */}
          {dashboardData.profile && dashboardData.profile.paymentPatterns.length > 0 && (
            <div className="patterns-section">
              <h3>📊 Payment Pattern Analysis</h3>
              <div className="patterns-grid">
                {dashboardData.profile.paymentPatterns.map((pattern) => (
                  <div key={pattern.id} className={`pattern-card ${pattern.type}`}>
                    <h4>Payment Pattern</h4>
                    <div className="pattern-details">
                      <div className="pattern-row">
                        <span>Type:</span>
                        <span className="pattern-value">{pattern.type.replace('-', ' ')}</span>
                      </div>
                      <div className="pattern-row">
                        <span>Frequency:</span>
                        <span className="pattern-value">{pattern.frequency}</span>
                      </div>
                      <div className="pattern-row">
                        <span>Timing:</span>
                        <span className="pattern-value">{pattern.timing}</span>
                      </div>
                      <div className="pattern-row">
                        <span>Reliability:</span>
                        <span className={`pattern-value reliability-${pattern.reliability > 80 ? 'high' : pattern.reliability > 60 ? 'medium' : 'low'}`}>
                          {pattern.reliability}%
                        </span>
                      </div>
                      <div className="pattern-row">
                        <span>Avg Amount:</span>
                        <span className="pattern-value">${pattern.averageAmount.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Selected Nudge Modal */}
      {selectedNudge && (
        <div className="nudge-modal-overlay" onClick={() => setSelectedNudge(null)}>
          <div className="nudge-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedNudge.content.title}</h3>
              <button onClick={() => setSelectedNudge(null)} className="close-modal">×</button>
            </div>
            <div className="modal-content">
              <div className={`nudge-priority ${selectedNudge.content.priority}`}>
                Priority: {selectedNudge.content.priority.toUpperCase()}
              </div>
              <p className="nudge-message-large">{selectedNudge.content.message}</p>
              <div className="nudge-details">
                <p><strong>Type:</strong> {selectedNudge.type.replace('_', ' ')}</p>
                <p><strong>Tone:</strong> {selectedNudge.content.emotionalTone}</p>
                <p><strong>Effectiveness:</strong> {Math.round(selectedNudge.effectiveness * 100)}%</p>
              </div>
            </div>
            <div className="modal-actions">
              <button 
                onClick={() => {
                  handleNudgeAction(selectedNudge, 'acted');
                  setSelectedNudge(null);
                }}
                className="modal-btn primary"
              >
                ✅ {selectedNudge.content.actionText || 'Take Action'}
              </button>
              <button 
                onClick={() => setSelectedNudge(null)}
                className="modal-btn secondary"
              >
                Later
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BehavioralDashboard;