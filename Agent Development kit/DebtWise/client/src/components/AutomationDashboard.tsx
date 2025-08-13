import React, { useState, useEffect } from 'react';
import './AutomationDashboard.css';

interface AutomationStatus {
  settings: AutomationSettings | null;
  upcomingPayments: ScheduledPayment[];
  recentPayments: ScheduledPayment[];
  monthlyStats: {
    paymentsScheduled: number;
    paymentsExecuted: number;
    totalAmount: number;
    interestSaved: number;
    rewardPointsEarned: number;
  };
}

interface AutomationSettings {
  id: string;
  userId: string;
  enabled: boolean;
  automationLevel: 'manual' | 'semi-auto' | 'full-auto';
  maxMonthlyPayment: number;
  minBufferAmount: number;
  paymentStrategy: 'avalanche' | 'snowball' | 'custom';
  paymentTiming: 'optimal' | 'fixed' | 'flexible';
}

interface ScheduledPayment {
  id: string;
  debtId: string;
  amount: number;
  scheduledDate: string;
  executionDate?: string;
  status: 'pending' | 'scheduled' | 'executed' | 'failed' | 'cancelled';
  paymentType: 'minimum' | 'extra' | 'strategic';
  expectedInterestSavings: number;
  rewardPointsEarned?: number;
  failureReason?: string;
}

interface PaymentPlan {
  totalMonthlyPayment: number;
  optimizedPayments: PaymentOptimization[];
  projectedOutcomes: {
    monthsToDebtFree: number;
    totalInterestSaved: number;
    rewardPointsEarned: number;
    cashRewardsEarned: number;
  };
  riskAssessment: {
    level: 'low' | 'medium' | 'high';
    factors: string[];
    recommendations: string[];
  };
}

interface PaymentOptimization {
  debtId: string;
  currentBalance: number;
  suggestedAmount: number;
  minimumPayment: number;
  interestRate: number;
  priority: number;
  reasoning: string;
  potentialInterestSavings: number;
  payoffAcceleration: number;
}

const AutomationDashboard: React.FC = () => {
  const [automationStatus, setAutomationStatus] = useState<AutomationStatus | null>(null);
  const [paymentPlan, setPaymentPlan] = useState<PaymentPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    loadAutomationStatus();
  }, []);

  const loadAutomationStatus = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/automation/status/demo_user_123');
      const result = await response.json();
      
      if (result.success) {
        setAutomationStatus(result.data);
      }
    } catch (error) {
      console.error('Failed to load automation status:', error);
    } finally {
      setLoading(false);
    }
  };

  const createDemoAutomation = async () => {
    setLoading(true);
    setMessage('');
    try {
      const response = await fetch('http://localhost:3001/api/automation/demo/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      const result = await response.json();
      
      if (result.success) {
        setAutomationStatus(result.data.status);
        setPaymentPlan(result.data.paymentPlan);
        setMessage('🤖 Smart automation setup completed! Optimized payment plan generated.');
      } else {
        setMessage(`❌ Error: ${result.error}`);
      }
    } catch (error) {
      setMessage('❌ Failed to create automation setup');
      console.error('Failed to create demo automation:', error);
    } finally {
      setLoading(false);
    }
  };

  const executePayment = async () => {
    if (!automationStatus?.upcomingPayments.length) {
      setMessage('⚠️ No upcoming payments to execute. Create automation first.');
      return;
    }

    setLoading(true);
    setMessage('');
    try {
      const response = await fetch('http://localhost:3001/api/automation/demo/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      const result = await response.json();
      
      if (result.success) {
        setAutomationStatus(result.data.updatedStatus);
        if (result.data.executionResult.success) {
          const payment = result.data.executionResult.payment;
          const reward = result.data.executionResult.rewardResult;
          setMessage(`💰 Payment executed! $${payment.amount} paid, earned ${reward.pointsEarned} points. ${reward.motivationalMessage}`);
        } else {
          setMessage(`❌ Payment failed: ${result.data.executionResult.error}`);
        }
      } else {
        setMessage(`❌ Error: ${result.error}`);
      }
    } catch (error) {
      setMessage('❌ Failed to execute payment');
      console.error('Failed to execute payment:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return '#007bff';
      case 'executed': return '#28a745';
      case 'failed': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low': return '#28a745';
      case 'medium': return '#ffc107';
      case 'high': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && !automationStatus) {
    return <div className="automation-loading">Setting up smart automation...</div>;
  }

  return (
    <div className="automation-dashboard">
      <h2>🤖 Smart Payment Automation</h2>
      
      {message && (
        <div className="automation-message">
          <p>{message}</p>
          <button onClick={() => setMessage('')} className="close-message">×</button>
        </div>
      )}

      {/* Setup Section */}
      <div className="setup-section">
        <h3>⚡ Quick Setup</h3>
        <p>Create an intelligent automation system that optimizes your payments, schedules them automatically, and maximizes interest savings.</p>
        <div className="setup-buttons">
          <button 
            onClick={createDemoAutomation} 
            disabled={loading}
            className="setup-btn primary"
          >
            {loading ? 'Creating...' : '🚀 Create Smart Automation'}
          </button>
          <button 
            onClick={executePayment} 
            disabled={loading || !automationStatus?.upcomingPayments.length}
            className="setup-btn secondary"
          >
            {loading ? 'Processing...' : '⚡ Execute Next Payment'}
          </button>
        </div>
      </div>

      {automationStatus && (
        <>
          {/* Automation Settings */}
          {automationStatus.settings && (
            <div className="settings-section">
              <h3>⚙️ Current Settings</h3>
              <div className="settings-grid">
                <div className="setting-item">
                  <span className="setting-label">Automation Level</span>
                  <span className={`setting-value ${automationStatus.settings.automationLevel}`}>
                    {automationStatus.settings.automationLevel.replace('-', ' ').toUpperCase()}
                  </span>
                </div>
                <div className="setting-item">
                  <span className="setting-label">Max Monthly Payment</span>
                  <span className="setting-value">${automationStatus.settings.maxMonthlyPayment.toLocaleString()}</span>
                </div>
                <div className="setting-item">
                  <span className="setting-label">Strategy</span>
                  <span className="setting-value">{automationStatus.settings.paymentStrategy.toUpperCase()}</span>
                </div>
                <div className="setting-item">
                  <span className="setting-label">Status</span>
                  <span className={`setting-value ${automationStatus.settings.enabled ? 'enabled' : 'disabled'}`}>
                    {automationStatus.settings.enabled ? '✅ ACTIVE' : '❌ INACTIVE'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Monthly Statistics */}
          <div className="stats-section">
            <h3>📊 This Month's Performance</h3>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">📅</div>
                <div className="stat-value">{automationStatus.monthlyStats.paymentsScheduled}</div>
                <div className="stat-label">Scheduled</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">✅</div>
                <div className="stat-value">{automationStatus.monthlyStats.paymentsExecuted}</div>
                <div className="stat-label">Executed</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">💰</div>
                <div className="stat-value">${automationStatus.monthlyStats.totalAmount.toLocaleString()}</div>
                <div className="stat-label">Total Paid</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">💎</div>
                <div className="stat-value">{automationStatus.monthlyStats.rewardPointsEarned}</div>
                <div className="stat-label">Points Earned</div>
              </div>
            </div>
          </div>

          {/* Payment Plan */}
          {paymentPlan && (
            <div className="plan-section">
              <h3>🎯 Optimized Payment Plan</h3>
              <div className="plan-overview">
                <div className="plan-summary">
                  <h4>Projected Outcomes</h4>
                  <ul>
                    <li><strong>Debt-Free in:</strong> {paymentPlan.projectedOutcomes.monthsToDebtFree} months</li>
                    <li><strong>Interest Saved:</strong> ${paymentPlan.projectedOutcomes.totalInterestSaved.toLocaleString()}</li>
                    <li><strong>Reward Points:</strong> {paymentPlan.projectedOutcomes.rewardPointsEarned.toLocaleString()}</li>
                    <li><strong>Cash Rewards:</strong> ${paymentPlan.projectedOutcomes.cashRewardsEarned.toFixed(2)}</li>
                  </ul>
                </div>
                <div className="risk-assessment">
                  <h4>Risk Assessment</h4>
                  <div className={`risk-level ${paymentPlan.riskAssessment.level}`}>
                    Risk Level: {paymentPlan.riskAssessment.level.toUpperCase()}
                  </div>
                  <div className="risk-recommendations">
                    {paymentPlan.riskAssessment.recommendations.map((rec, index) => (
                      <p key={index}>{rec}</p>
                    ))}
                  </div>
                </div>
              </div>

              <div className="optimized-payments">
                <h4>Payment Optimization</h4>
                {paymentPlan.optimizedPayments.map((payment, index) => (
                  <div key={index} className="payment-item">
                    <div className="payment-header">
                      <span className="debt-name">Debt #{payment.priority}</span>
                      <span className="payment-amount">${payment.suggestedAmount.toLocaleString()}</span>
                    </div>
                    <div className="payment-details">
                      <p><strong>Balance:</strong> ${payment.currentBalance.toLocaleString()}</p>
                      <p><strong>Interest Rate:</strong> {(payment.interestRate * 100).toFixed(1)}%</p>
                      <p><strong>Strategy:</strong> {payment.reasoning}</p>
                      <p><strong>Interest Savings:</strong> ${payment.potentialInterestSavings.toFixed(2)}/month</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upcoming Payments */}
          <div className="upcoming-section">
            <h3>📅 Upcoming Payments</h3>
            {automationStatus.upcomingPayments.length > 0 ? (
              <div className="payments-list">
                {automationStatus.upcomingPayments.slice(0, 5).map((payment) => (
                  <div key={payment.id} className="payment-row">
                    <div className="payment-info">
                      <div className="payment-amount">${payment.amount.toLocaleString()}</div>
                      <div className="payment-date">{formatDate(payment.scheduledDate)}</div>
                    </div>
                    <div className="payment-meta">
                      <span className={`payment-status ${payment.status}`}>
                        {payment.status.toUpperCase()}
                      </span>
                      <span className="payment-type">{payment.paymentType}</span>
                    </div>
                    <div className="payment-savings">
                      <small>Saves ${payment.expectedInterestSavings.toFixed(2)} interest</small>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-payments">No upcoming payments scheduled. Create automation to get started!</p>
            )}
          </div>

          {/* Recent Payments */}
          {automationStatus.recentPayments.length > 0 && (
            <div className="recent-section">
              <h3>✅ Recent Payments</h3>
              <div className="payments-list">
                {automationStatus.recentPayments.slice(0, 5).map((payment) => (
                  <div key={payment.id} className="payment-row executed">
                    <div className="payment-info">
                      <div className="payment-amount">${payment.amount.toLocaleString()}</div>
                      <div className="payment-date">
                        {payment.executionDate && formatDate(payment.executionDate)}
                      </div>
                    </div>
                    <div className="payment-meta">
                      <span className={`payment-status ${payment.status}`}>
                        {payment.status.toUpperCase()}
                      </span>
                      {payment.rewardPointsEarned && (
                        <span className="reward-points">+{payment.rewardPointsEarned} pts</span>
                      )}
                    </div>
                    <div className="payment-savings">
                      <small>
                        {payment.status === 'executed' 
                          ? `Saved $${payment.expectedInterestSavings.toFixed(2)} interest`
                          : payment.failureReason || 'Processing...'
                        }
                      </small>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AutomationDashboard;