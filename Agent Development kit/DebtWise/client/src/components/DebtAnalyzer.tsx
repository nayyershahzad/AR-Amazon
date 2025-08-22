import React, { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import './DebtAnalyzer.css';

interface Debt {
  name: string;
  balance: number;
  interestRate: number;
  minimumPayment: number;
}

interface Expense {
  category: string;
  amount: number;
  description?: string;
}

interface IncomeStream {
  source: string;
  amount: number;
  description?: string;
}

interface Goal {
  category: string;
  description: string;
  targetAmount?: number;
  targetDate?: string;
  priority: 'low' | 'medium' | 'high';
  notes?: string;
}

interface UserProfile {
  primaryIncome: number;
  additionalIncomes: IncomeStream[];
  expenses: Expense[];
  goals: Goal[];
  riskTolerance?: string;
}

const DebtAnalyzer: React.FC = () => {
  const { apiCall, isAuthenticated, isLoading } = useAuth();
  
  const [userProfile, setUserProfile] = useState<UserProfile>({
    primaryIncome: 0,
    additionalIncomes: [],
    expenses: [],
    goals: [],
    riskTolerance: 'moderate'
  });
  
  const [debts, setDebts] = useState<Debt[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisOutdated, setAnalysisOutdated] = useState(false);
  const [lastAnalyzed, setLastAnalyzed] = useState<string | null>(null);
  const [loadingPreviousAnalysis, setLoadingPreviousAnalysis] = useState(false);

  // Load user's saved financial data and analysis after authentication
  useEffect(() => {
    if (isAuthenticated && !isLoading && !dataLoaded) {
      console.log('🔄 Auth complete - loading user data');
      loadUserData();
      loadPreviousAnalysis();
    } else if (!isLoading && !isAuthenticated) {
      console.log('❌ User not authenticated, skipping data load');
      setDataLoaded(true); // Set as loaded so we show the form with defaults
    }
  }, [isAuthenticated, isLoading, dataLoaded]);

  const loadUserData = async () => {
    console.log('🔄 Loading user data from API...');
    try {
      const data = await apiCall('/api/user/profile');
      console.log('📊 Received data from API:', data);
      
      // Set default values if no data exists
      const defaultExpenses = [
        { category: 'Housing', amount: 0, description: 'Rent/Mortgage' },
        { category: 'Grocery', amount: 0, description: 'Food and groceries' },
        { category: 'Transportation', amount: 0, description: 'Gas, public transport' },
        { category: 'Utilities', amount: 0, description: 'Electric, water, internet' },
        { category: 'Health', amount: 0, description: 'Healthcare, insurance' },
        { category: 'Recreation', amount: 0, description: 'Entertainment, dining out' }
      ];

      // Map database data to frontend format
      const primaryIncome = data.incomeStreams?.find((income: any) => income.isPrimary)?.amount || 0;
      const additionalIncomes = data.incomeStreams?.filter((income: any) => !income.isPrimary) || [];
      const expenses = data.expenseCategories?.length > 0 ? data.expenseCategories : defaultExpenses;
      const goals = data.financialGoals || [];
      const debts = data.debts || [];

      setUserProfile({
        primaryIncome,
        additionalIncomes: additionalIncomes.map((income: any) => ({
          source: income.source,
          amount: income.amount,
          description: income.description
        })),
        expenses: expenses.map((expense: any) => ({
          category: expense.category,
          amount: expense.amount,
          description: expense.description
        })),
        goals: goals.map((goal: any) => ({
          category: goal.category,
          description: goal.description,
          targetAmount: goal.targetAmount,
          targetDate: goal.targetDate,
          priority: goal.priority,
          notes: goal.notes
        })),
        riskTolerance: data.user?.riskTolerance || 'moderate'
      });

      setDebts(debts.map((debt: any) => ({
        name: debt.name,
        balance: debt.balance,
        interestRate: debt.interestRate,
        minimumPayment: debt.minimumPayment
      })));

      setDataLoaded(true);
      console.log('✅ User data loaded successfully');
    } catch (error) {
      console.error('❌ Error loading user data:', error);
      console.error('❌ Error details:', error);
      
      // Set default data if loading fails
      setUserProfile(prev => ({
        ...prev,
        expenses: [
          { category: 'Housing', amount: 0, description: 'Rent/Mortgage' },
          { category: 'Grocery', amount: 0, description: 'Food and groceries' },
          { category: 'Transportation', amount: 0, description: 'Gas, public transport' },
          { category: 'Utilities', amount: 0, description: 'Electric, water, internet' },
          { category: 'Health', amount: 0, description: 'Healthcare, insurance' },
          { category: 'Recreation', amount: 0, description: 'Entertainment, dining out' }
        ]
      }));
      setDataLoaded(true);
      console.log('⚠️ Loaded with default data due to error');
    }
  };

  const loadPreviousAnalysis = async () => {
    if (!isAuthenticated) return;
    
    setLoadingPreviousAnalysis(true);
    console.log('🔄 Loading previous analysis...');
    
    try {
      const result = await apiCall('/api/user/analysis');
      
      if (result.analysis) {
        console.log('📊 Found previous analysis:', result.analysis.createdAt);
        setAnalysis(result.analysis.aiAnalysis);
        setLastAnalyzed(result.analysis.createdAt);
        
        // Check if analysis is outdated by comparing current data
        await checkAnalysisOutdated();
      } else {
        console.log('📊 No previous analysis found');
      }
    } catch (error) {
      console.error('❌ Error loading previous analysis:', error);
    } finally {
      setLoadingPreviousAnalysis(false);
    }
  };

  const checkAnalysisOutdated = async () => {
    if (!isAuthenticated) return;
    
    try {
      const currentData = {
        userProfile: {
          ...userProfile,
          primaryIncome: Number(userProfile.primaryIncome),
          totalIncome: getTotalIncome(),
          totalExpenses: getTotalExpenses(),
          additionalIncomes: userProfile.additionalIncomes.map(income => ({
            ...income,
            amount: Number(income.amount)
          })),
          expenses: userProfile.expenses.map(expense => ({
            ...expense,
            amount: Number(expense.amount)
          })),
          goals: userProfile.goals
        },
        debts: debts.map(debt => ({
          ...debt,
          balance: Number(debt.balance),
          interestRate: Number(debt.interestRate) / 100,
          minimumPayment: Number(debt.minimumPayment)
        }))
      };
      
      const result = await apiCall('/api/user/analysis/check-outdated', {
        method: 'POST',
        body: JSON.stringify(currentData)
      });
      
      setAnalysisOutdated(result.isOutdated);
      console.log(`📊 Analysis outdated check: ${result.isOutdated}`);
    } catch (error) {
      console.error('❌ Error checking analysis status:', error);
    }
  };

  const saveAnalysisToDatabase = async (analysisData: any) => {
    if (!isAuthenticated) return;
    
    console.log('💾 Saving analysis to database...');
    
    try {
      const saveData = {
        userProfile: {
          ...userProfile,
          primaryIncome: Number(userProfile.primaryIncome),
          totalIncome: getTotalIncome(),
          totalExpenses: getTotalExpenses(),
          additionalIncomes: userProfile.additionalIncomes.map(income => ({
            ...income,
            amount: Number(income.amount)
          })),
          expenses: userProfile.expenses.map(expense => ({
            ...expense,
            amount: Number(expense.amount)
          })),
          goals: userProfile.goals
        },
        debts: debts.map(debt => ({
          ...debt,
          balance: Number(debt.balance),
          interestRate: Number(debt.interestRate) / 100,
          minimumPayment: Number(debt.minimumPayment)
        })),
        aiAnalysis: analysisData,
        strategies: analysisData.payoffStrategies || {},
        totalInterestSaved: analysisData.totalInterestSaved || 0,
        recommendedStrategy: analysisData.strategy || '',
        monthsToPayoff: analysisData.payoffStrategies?.[0]?.monthsToPayoff || 0
      };
      
      await apiCall('/api/user/analysis', {
        method: 'POST',
        body: JSON.stringify(saveData)
      });
      
      setAnalysisOutdated(false);
      setLastAnalyzed(new Date().toISOString());
      console.log('✅ Analysis saved to database');
    } catch (error) {
      console.error('❌ Error saving analysis:', error);
    }
  };

  const saveUserData = async (forceUpdate: boolean = false) => {
    console.log(`💾 Saving user data - forceUpdate: ${forceUpdate}`);
    console.log('📊 Data to save:', {
      primaryIncome: userProfile.primaryIncome,
      additionalIncomes: userProfile.additionalIncomes.length,
      expenses: userProfile.expenses.length,
      goals: userProfile.goals.length,
      debts: debts.length
    });
    
    setSaving(true);
    setSaveMessage(null);
    
    try {
      const result = await apiCall('/api/user/profile', {
        method: 'POST',
        body: JSON.stringify({
          primaryIncome: userProfile.primaryIncome,
          additionalIncomes: userProfile.additionalIncomes,
          expenses: userProfile.expenses,
          goals: userProfile.goals,
          debts: debts,
          riskTolerance: userProfile.riskTolerance,
          forceUpdate: forceUpdate  // Only true when user explicitly clicks save
        })
      });
      
      console.log('✅ Save result:', result);
      
      setSaveMessage('✅ Data saved successfully!');
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      console.error('Error saving user data:', error);
      setSaveMessage('❌ Failed to save data. Please try again.');
      setTimeout(() => setSaveMessage(null), 5000);
    } finally {
      setSaving(false);
    }
  };

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
            primaryIncome: Number(userProfile.primaryIncome),
            totalIncome: getTotalIncome(),
            totalExpenses: getTotalExpenses(),
            additionalIncomes: userProfile.additionalIncomes.map(income => ({
              ...income,
              amount: Number(income.amount)
            })),
            expenses: userProfile.expenses.map(expense => ({
              ...expense,
              amount: Number(expense.amount)
            })),
            goals: userProfile.goals
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
        // Save the analysis to database after successful analysis
        await saveAnalysisToDatabase(result.data);
      } else {
        setError(result.error || 'Analysis failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error occurred');
    } finally {
      setLoading(false);
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

  const addExpense = () => {
    setUserProfile({
      ...userProfile,
      expenses: [...userProfile.expenses, { category: '', amount: 0, description: '' }]
    });
  };

  const updateExpense = (index: number, field: keyof Expense, value: string | number) => {
    const updatedExpenses = [...userProfile.expenses];
    updatedExpenses[index] = { ...updatedExpenses[index], [field]: value };
    setUserProfile({ ...userProfile, expenses: updatedExpenses });
  };

  const removeExpense = (index: number) => {
    setUserProfile({
      ...userProfile,
      expenses: userProfile.expenses.filter((_, i) => i !== index)
    });
  };

  const addIncomeStream = () => {
    setUserProfile({
      ...userProfile,
      additionalIncomes: [...userProfile.additionalIncomes, { source: '', amount: 0, description: '' }]
    });
  };

  const updateIncomeStream = (index: number, field: keyof IncomeStream, value: string | number) => {
    const updatedIncomes = [...userProfile.additionalIncomes];
    updatedIncomes[index] = { ...updatedIncomes[index], [field]: value };
    setUserProfile({ ...userProfile, additionalIncomes: updatedIncomes });
  };

  const removeIncomeStream = (index: number) => {
    setUserProfile({
      ...userProfile,
      additionalIncomes: userProfile.additionalIncomes.filter((_, i) => i !== index)
    });
  };

  const getTotalIncome = () => {
    return userProfile.primaryIncome + userProfile.additionalIncomes.reduce((sum, income) => sum + income.amount, 0);
  };

  const getTotalExpenses = () => {
    return userProfile.expenses.reduce((sum, expense) => sum + expense.amount, 0);
  };

  const getAvailableAmount = () => {
    return getTotalIncome() - getTotalExpenses();
  };

  const hasNegativeCashFlow = () => {
    return getAvailableAmount() <= 0;
  };

  const addGoal = () => {
    setUserProfile({
      ...userProfile,
      goals: [...userProfile.goals, { 
        category: '', 
        description: '', 
        targetAmount: 0, 
        targetDate: '', 
        priority: 'medium',
        notes: ''
      }]
    });
  };

  const updateGoal = (index: number, field: keyof Goal, value: string | number) => {
    const updatedGoals = [...userProfile.goals];
    updatedGoals[index] = { ...updatedGoals[index], [field]: value };
    setUserProfile({ ...userProfile, goals: updatedGoals });
  };

  const removeGoal = (index: number) => {
    setUserProfile({
      ...userProfile,
      goals: userProfile.goals.filter((_, i) => i !== index)
    });
  };

  // Show loading indicator while data is being loaded
  if (!dataLoaded) {
    return (
      <div className="debt-analyzer" style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '400px',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <div style={{ 
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #3498db',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          animation: 'spin 2s linear infinite'
        }}></div>
        <p>Loading your financial data...</p>
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    );
  }

  return (
    <div className="debt-analyzer">
      <h1>DebtWise - AI Debt Analysis</h1>
      
      <div className="section">
        <h2>💰 Income Sources</h2>
        <div className="form-group">
          <label>Primary Monthly Income ($)</label>
          <input
            type="number"
            value={userProfile.primaryIncome}
            onChange={(e) => setUserProfile({...userProfile, primaryIncome: Number(e.target.value)})}
          />
        </div>
        
        <h3>Additional Income Streams</h3>
        {userProfile.additionalIncomes.map((income, index) => (
          <div key={index} className="income-item">
            <input
              type="text"
              placeholder="Income source (e.g., Side hustle, Freelance, Rental)"
              value={income.source}
              onChange={(e) => updateIncomeStream(index, 'source', e.target.value)}
            />
            <input
              type="number"
              placeholder="Monthly amount"
              value={income.amount}
              onChange={(e) => updateIncomeStream(index, 'amount', Number(e.target.value))}
            />
            <input
              type="text"
              placeholder="Description (optional)"
              value={income.description || ''}
              onChange={(e) => updateIncomeStream(index, 'description', e.target.value)}
            />
            <button onClick={() => removeIncomeStream(index)} className="remove-btn">Remove</button>
          </div>
        ))}
        <button onClick={addIncomeStream} className="add-btn">Add Income Stream</button>
      </div>

      <div className="section">
        <h2>📊 Monthly Expenses</h2>
        {userProfile.expenses.map((expense, index) => (
          <div key={index} className="expense-item">
            <select
              value={expense.category}
              onChange={(e) => updateExpense(index, 'category', e.target.value)}
            >
              <option value="">Select category</option>
              <option value="Housing">🏠 Housing (Rent/Mortgage)</option>
              <option value="Grocery">🛒 Grocery & Food</option>
              <option value="Transportation">🚗 Transportation</option>
              <option value="Utilities">⚡ Utilities</option>
              <option value="Health">🏥 Healthcare</option>
              <option value="Recreation">🎯 Recreation & Entertainment</option>
              <option value="Shopping">🛍️ Shopping & Personal</option>
              <option value="Insurance">🛡️ Insurance</option>
              <option value="Education">📚 Education & Learning</option>
              <option value="Savings">💰 Savings & Investments</option>
              <option value="Other">📝 Other</option>
            </select>
            <input
              type="number"
              placeholder="Monthly amount"
              value={expense.amount}
              onChange={(e) => updateExpense(index, 'amount', Number(e.target.value))}
            />
            <input
              type="text"
              placeholder="Description (optional)"
              value={expense.description || ''}
              onChange={(e) => updateExpense(index, 'description', e.target.value)}
            />
            <button onClick={() => removeExpense(index)} className="remove-btn">Remove</button>
          </div>
        ))}
        <button onClick={addExpense} className="add-btn">Add Expense</button>
        
        <div className="financial-summary">
          <div className="summary-item">
            <strong>Total Monthly Income: ${getTotalIncome().toLocaleString()}</strong>
          </div>
          <div className="summary-item">
            <strong>Total Monthly Expenses: ${getTotalExpenses().toLocaleString()}</strong>
          </div>
          <div className={`summary-item ${hasNegativeCashFlow() ? 'negative-cash-flow' : 'available-amount'}`}>
            <strong>Available for Debt Payment: ${getAvailableAmount().toLocaleString()}</strong>
            {hasNegativeCashFlow() && (
              <div className="cash-flow-warning">
                ⚠️ Negative cash flow! Please reduce expenses or increase income before analysis.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="section">
        <h2>🎯 Financial Goals</h2>
        <p style={{ color: '#6c757d', marginBottom: '20px' }}>
          Add your financial goals so AI can provide personalized advice and timelines
        </p>
        {userProfile.goals.map((goal, index) => (
          <div key={index} className="goal-item">
            <select
              value={goal.category}
              onChange={(e) => updateGoal(index, 'category', e.target.value)}
            >
              <option value="">Select goal category</option>
              <option value="Education">🎓 Education (College, Courses, Certifications)</option>
              <option value="Home Buying">🏡 Home Buying (Down Payment, Closing Costs)</option>
              <option value="Retirement">🌅 Retirement Savings</option>
              <option value="Emergency Fund">🆘 Emergency Fund</option>
              <option value="Travel">✈️ Travel & Vacation</option>
              <option value="Car">🚗 Car Purchase</option>
              <option value="Wedding">💒 Wedding</option>
              <option value="Business">🏢 Start a Business</option>
              <option value="Investment">📈 Investment Fund</option>
              <option value="Other">📝 Other Goal</option>
            </select>
            <input
              type="text"
              placeholder="Goal description (e.g., 'Master's Degree in 2026')"
              value={goal.description}
              onChange={(e) => updateGoal(index, 'description', e.target.value)}
            />
            <input
              type="number"
              placeholder="Target amount ($)"
              value={goal.targetAmount || ''}
              onChange={(e) => updateGoal(index, 'targetAmount', Number(e.target.value))}
            />
            <input
              type="date"
              placeholder="Target date"
              value={goal.targetDate || ''}
              onChange={(e) => updateGoal(index, 'targetDate', e.target.value)}
            />
            <select
              value={goal.priority}
              onChange={(e) => updateGoal(index, 'priority', e.target.value as 'low' | 'medium' | 'high')}
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
            <button onClick={() => removeGoal(index)} className="remove-btn">Remove</button>
          </div>
        ))}
        <button onClick={addGoal} className="add-btn">Add Financial Goal</button>
      </div>

      <div className="section">
        <h2>💳 Your Debts</h2>
        <div className="debt-header">
          <div className="debt-header-item">Debt Name</div>
          <div className="debt-header-item">Current Balance</div>
          <div className="debt-header-item">Interest Rate (%)</div>
          <div className="debt-header-item">Min. Payment</div>
          <div className="debt-header-item">Action</div>
        </div>
        {debts.map((debt, index) => (
          <div key={index} className="debt-item">
            <input
              type="text"
              placeholder="e.g., Credit Card 1"
              value={debt.name}
              onChange={(e) => updateDebt(index, 'name', e.target.value)}
            />
            <input
              type="number"
              placeholder="$0"
              value={debt.balance}
              onChange={(e) => updateDebt(index, 'balance', Number(e.target.value))}
            />
            <input
              type="number"
              placeholder="0.0"
              value={debt.interestRate}
              onChange={(e) => updateDebt(index, 'interestRate', Number(e.target.value))}
            />
            <input
              type="number"
              placeholder="$0"
              value={debt.minimumPayment}
              onChange={(e) => updateDebt(index, 'minimumPayment', Number(e.target.value))}
            />
            <button onClick={() => removeDebt(index)} className="remove-btn">Remove</button>
          </div>
        ))}
        <button onClick={addDebt} className="add-btn">Add Debt</button>
      </div>

      <div className="actions">
        <button 
          onClick={() => saveUserData(true)} 
          className="save-btn"
          disabled={!dataLoaded || saving}
        >
          {saving ? '💾 Saving...' : '💾 Save My Data'}
        </button>
        {saveMessage && (
          <div className="save-message" style={{
            marginLeft: '10px',
            padding: '5px 10px',
            borderRadius: '4px',
            fontSize: '14px',
            backgroundColor: saveMessage.includes('✅') ? '#d4edda' : '#f8d7da',
            color: saveMessage.includes('✅') ? '#155724' : '#721c24',
            border: `1px solid ${saveMessage.includes('✅') ? '#c3e6cb' : '#f5c6cb'}`
          }}>
            {saveMessage}
          </div>
        )}
        
        {/* Analysis Status Indicator */}
        {analysis && lastAnalyzed && (
          <div style={{
            padding: '10px',
            borderRadius: '6px',
            fontSize: '14px',
            margin: '10px 0',
            backgroundColor: analysisOutdated ? '#fff3cd' : '#d4edda',
            color: analysisOutdated ? '#856404' : '#155724',
            border: `1px solid ${analysisOutdated ? '#ffc107' : '#c3e6cb'}`
          }}>
            {analysisOutdated ? (
              <>
                ⚠️ <strong>Analysis may be outdated</strong> - Your data has changed since last analysis on {new Date(lastAnalyzed).toLocaleDateString()}
              </>
            ) : (
              <>
                ✅ <strong>Analysis up to date</strong> - Last analyzed on {new Date(lastAnalyzed).toLocaleDateString()}
              </>
            )}
          </div>
        )}
        
        <button 
          onClick={analyzeDebts} 
          disabled={loading || hasNegativeCashFlow() || loadingPreviousAnalysis} 
          className={`analyze-btn ${hasNegativeCashFlow() ? 'disabled-negative-flow' : ''}`}
        >
          {loading ? '🤖 Analyzing with AI...' : 
           loadingPreviousAnalysis ? '📊 Loading Analysis...' :
           analysisOutdated ? '🔄 Update Analysis with AI' : 
           '🧠 Analyze My Financial Situation with AI'}
        </button>
        {hasNegativeCashFlow() && (
          <div className="analysis-disabled-message">
            <p>⚠️ <strong>Analysis Disabled:</strong> Your expenses exceed your income by ${Math.abs(getAvailableAmount()).toLocaleString()}.</p>
            <p>Please adjust your income or expenses to enable AI analysis.</p>
          </div>
        )}
      </div>

      {error && (
        <div className="error">
          <h3>⚠️ Unable to Analyze</h3>
          <p>{error}</p>
          {error.includes('exceed your income') && (
            <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#fff3cd', border: '1px solid #ffc107', borderRadius: '4px' }}>
              <strong>💡 Suggestions to get started:</strong>
              <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
                <li>Review your expenses and identify areas to reduce</li>
                <li>Consider adding income streams in the "Additional Income" section</li>
                <li>Focus on essential expenses only until you have positive cash flow</li>
              </ul>
            </div>
          )}
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
                
                {strategy.paymentSchedule && strategy.paymentSchedule.length > 0 && (
                  <div className="payment-schedule">
                    <h5>📅 Next 6 Months Payment Breakdown</h5>
                    <div className="schedule-table">
                      <div className="schedule-header">
                        <div className="schedule-cell">Month</div>
                        <div className="schedule-cell">Debt</div>
                        <div className="schedule-cell">Payment</div>
                        <div className="schedule-cell">Interest</div>
                        <div className="schedule-cell">Remaining</div>
                      </div>
                      {strategy.paymentSchedule.map((month: any) => (
                        <>
                          {month.debts.map((debt: any, debtIndex: number) => (
                            <div key={`${month.month}-${debtIndex}`} className="schedule-row">
                              <div className="schedule-cell">{debtIndex === 0 ? `Month ${month.month}` : ''}</div>
                              <div className="schedule-cell">{debt.name}</div>
                              <div className="schedule-cell">${debt.payment.toLocaleString()}</div>
                              <div className="schedule-cell">${debt.interestPaid.toLocaleString()}</div>
                              <div className="schedule-cell">
                                {debt.remainingBalance > 0 ? `$${debt.remainingBalance.toLocaleString()}` : '✅ PAID OFF'}
                              </div>
                            </div>
                          ))}
                          <div className="schedule-total">
                            <div className="schedule-cell"></div>
                            <div className="schedule-cell"><strong>Total Month {month.month}</strong></div>
                            <div className="schedule-cell"><strong>${month.totalPayment.toLocaleString()}</strong></div>
                            <div className="schedule-cell"></div>
                            <div className="schedule-cell"></div>
                          </div>
                        </>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="motivation">
            <h3>Motivational Message</h3>
            <p>{analysis.motivationalMessage}</p>
          </div>

          {analysis.goalAnalysis && (
            <div className="goal-analysis">
              <h3>🎯 Goal Achievement Analysis</h3>
              <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', background: '#f8f9fa', padding: '15px', borderRadius: '6px', border: '1px solid #e9ecef' }}>
                {analysis.goalAnalysis}
              </pre>
            </div>
          )}

          {analysis.expenseAnalysis && (
            <div className="expense-analysis">
              <h3>💸 Expense Analysis</h3>
              <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', background: '#fff3cd', padding: '15px', borderRadius: '6px', border: '1px solid #ffc107' }}>
                {analysis.expenseAnalysis}
              </pre>
            </div>
          )}

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