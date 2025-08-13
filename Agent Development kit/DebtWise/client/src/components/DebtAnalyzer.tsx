import React, { useState } from 'react';
import './DebtAnalyzer.css';

interface Debt {
  name: string;
  balance: number;
  interestRate: number;
  minimumPayment: number;
}

interface UserProfile {
  monthlyIncome: number;
  monthlyExpenses: number;
  riskTolerance?: string;
}

const DebtAnalyzer: React.FC = () => {
  const [userProfile, setUserProfile] = useState<UserProfile>({
    monthlyIncome: 5000,
    monthlyExpenses: 3500,
    riskTolerance: 'moderate'
  });
  
  const [debts, setDebts] = useState<Debt[]>([
    { name: 'Credit Card 1', balance: 5000, interestRate: 18, minimumPayment: 150 },
    { name: 'Credit Card 2', balance: 3200, interestRate: 22, minimumPayment: 96 }
  ]);
  
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeDebts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:3001/api/debt/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userProfile: {
            ...userProfile,
            monthlyIncome: Number(userProfile.monthlyIncome),
            monthlyExpenses: Number(userProfile.monthlyExpenses)
          },
          debts: debts.map(debt => ({
            ...debt,
            balance: Number(debt.balance),
            interestRate: Number(debt.interestRate) / 100, // Convert percentage to decimal
            minimumPayment: Number(debt.minimumPayment)
          })),
          userGoals: 'I want to become debt-free as efficiently as possible'
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setAnalysis(result.data);
      } else {
        setError(result.error || 'Analysis failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const loadTestData = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/debt/test-data');
      const result = await response.json();
      
      if (result.success) {
        setUserProfile(result.data.userProfile);
        setDebts(result.data.debts.map((debt: any) => ({
          ...debt,
          interestRate: debt.interestRate * 100 // Convert decimal to percentage for display
        })));
      }
    } catch (err) {
      console.error('Failed to load test data:', err);
    }
  };

  const addDebt = () => {
    setDebts([...debts, { name: '', balance: 0, interestRate: 0, minimumPayment: 0 }]);
  };

  const updateDebt = (index: number, field: keyof Debt, value: string | number) => {
    const updatedDebts = [...debts];
    updatedDebts[index] = { ...updatedDebts[index], [field]: value };
    setDebts(updatedDebts);
  };

  const removeDebt = (index: number) => {
    setDebts(debts.filter((_, i) => i !== index));
  };

  return (
    <div className="debt-analyzer">
      <h1>DebtWise - AI Debt Analysis</h1>
      
      <div className="section">
        <h2>Your Financial Profile</h2>
        <div className="form-group">
          <label>Monthly Income ($)</label>
          <input
            type="number"
            value={userProfile.monthlyIncome}
            onChange={(e) => setUserProfile({...userProfile, monthlyIncome: Number(e.target.value)})}
          />
        </div>
        <div className="form-group">
          <label>Monthly Expenses ($)</label>
          <input
            type="number"
            value={userProfile.monthlyExpenses}
            onChange={(e) => setUserProfile({...userProfile, monthlyExpenses: Number(e.target.value)})}
          />
        </div>
        <div className="available-amount">
          Available for debt payment: ${userProfile.monthlyIncome - userProfile.monthlyExpenses}
        </div>
      </div>

      <div className="section">
        <h2>Your Debts</h2>
        {debts.map((debt, index) => (
          <div key={index} className="debt-item">
            <input
              type="text"
              placeholder="Debt name"
              value={debt.name}
              onChange={(e) => updateDebt(index, 'name', e.target.value)}
            />
            <input
              type="number"
              placeholder="Balance"
              value={debt.balance}
              onChange={(e) => updateDebt(index, 'balance', Number(e.target.value))}
            />
            <input
              type="number"
              placeholder="Interest Rate (%)"
              value={debt.interestRate}
              onChange={(e) => updateDebt(index, 'interestRate', Number(e.target.value))}
            />
            <input
              type="number"
              placeholder="Minimum Payment"
              value={debt.minimumPayment}
              onChange={(e) => updateDebt(index, 'minimumPayment', Number(e.target.value))}
            />
            <button onClick={() => removeDebt(index)} className="remove-btn">Remove</button>
          </div>
        ))}
        <button onClick={addDebt} className="add-btn">Add Debt</button>
      </div>

      <div className="actions">
        <button onClick={loadTestData} className="test-btn">Load Test Data</button>
        <button onClick={analyzeDebts} disabled={loading} className="analyze-btn">
          {loading ? 'Analyzing...' : 'Analyze Debts with AI'}
        </button>
      </div>

      {error && (
        <div className="error">
          <h3>Error:</h3>
          <p>{error}</p>
        </div>
      )}

      {analysis && (
        <div className="analysis-results">
          <h2>AI Analysis Results</h2>
          
          <div className="summary">
            <h3>Summary</h3>
            <p><strong>Total Debt:</strong> ${analysis.totalDebt?.toLocaleString()}</p>
            <p><strong>Available Monthly:</strong> ${analysis.availableAmount?.toLocaleString()}</p>
            <p><strong>Minimum Payments:</strong> ${analysis.minimumPayments?.toLocaleString()}</p>
          </div>

          <div className="strategy">
            <h3>Recommended Strategy</h3>
            <p>{analysis.strategy}</p>
          </div>

          <div className="payoff-strategies">
            <h3>Payoff Options</h3>
            {analysis.payoffStrategies?.map((strategy: any, index: number) => (
              <div key={index} className="strategy-option">
                <h4>{strategy.name}</h4>
                <p>{strategy.description}</p>
                <ul>
                  <li>Time to payoff: {strategy.monthsToPayoff} months</li>
                  <li>Total interest: ${strategy.totalInterestPaid?.toLocaleString()}</li>
                  <li>Monthly payment: ${strategy.monthlyPayment?.toLocaleString()}</li>
                </ul>
              </div>
            ))}
          </div>

          <div className="motivation">
            <h3>Motivational Message</h3>
            <p>{analysis.motivationalMessage}</p>
          </div>

          <div className="next-steps">
            <h3>Next Steps</h3>
            <ul>
              {analysis.nextSteps?.map((step: string, index: number) => (
                <li key={index}>{step}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default DebtAnalyzer;