import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import useAuth from '../hooks/useAuth';
import useSocket from '../hooks/useSocket';
import './DebtAnalyzer.css';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

interface Debt {
  id?: string;
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
  const { apiCall, isAuthenticated, isLoading, user } = useAuth();
  const { projectionUpdate, clearProjectionUpdate, connected: socketConnected } = useSocket(user?.id || null);
  
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
  
  // Change tracking states
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [significantChangesPending, setSignificantChangesPending] = useState(false);
  const [autoAnalyzing, setAutoAnalyzing] = useState(false);
  const [originalData, setOriginalData] = useState<{
    userProfile: UserProfile;
    debts: Debt[];
  } | null>(null);
  
  // Mobile-friendly collapsible sections
  const [showOtherStrategies, setShowOtherStrategies] = useState(false);
  const [showGoalAnalysis, setShowGoalAnalysis] = useState(false);
  const [showExpenseAnalysis, setShowExpenseAnalysis] = useState(false);
  const [showNextSteps, setShowNextSteps] = useState(false);

  // Load user's saved financial data and analysis after authentication
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      console.log('🔄 DebtAnalyzer mounted/activated - loading fresh user data');
      loadUserData();
      loadPreviousAnalysis();
    } else if (!isLoading && !isAuthenticated) {
      console.log('❌ User not authenticated, skipping data load');
      setDataLoaded(true); // Set as loaded so we show the form with defaults
    }
  }, [isAuthenticated, isLoading]); // Removed dataLoaded dependency to always reload

  // Handle real-time projection updates from Socket.io
  useEffect(() => {
    if (projectionUpdate && projectionUpdate.type === 'projection_recalculated') {
      console.log('🔄 Received real-time projection update:', projectionUpdate);
      
      // Update the analysis with new projections
      setAnalysis((prevAnalysis: any) => {
        if (!prevAnalysis) return null;
        
        // Find the strategy that matches the updated projections
        const updatedStrategies = prevAnalysis.strategies.map((strategy: any) => {
          if (strategy.type === projectionUpdate.projections.strategy) {
            return {
              ...strategy,
              paymentSchedule: projectionUpdate.projections.paymentSchedule,
              monthsToPayoff: projectionUpdate.projections.monthsToPayoff,
              totalInterestPaid: projectionUpdate.projections.totalInterestPaid,
              lastUpdated: projectionUpdate.projections.lastUpdated
            };
          }
          return strategy;
        });

        return {
          ...prevAnalysis,
          strategies: updatedStrategies,
          lastUpdated: projectionUpdate.timestamp
        };
      });

      // Show a notification to the user
      setSaveMessage(`📊 Payment breakdown updated in real-time after ${projectionUpdate.eventType}!`);
      setTimeout(() => setSaveMessage(null), 3000);

      // Clear the update so it doesn't trigger again
      clearProjectionUpdate();
    }
  }, [projectionUpdate, clearProjectionUpdate]);

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

      console.log('💰 Debt data received:', debts);
      setDebts(debts.map((debt: any) => ({
        id: debt.id, // Include debt ID from database
        name: debt.name,
        balance: debt.balance,
        interestRate: debt.interestRate,
        minimumPayment: debt.minimumPayment
      })));
      console.log('✅ Debt data set in state');

      // Store original data for change tracking
      const originalUserProfile = {
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
      };
      
      const originalDebts = debts.map((debt: any) => ({
        id: debt.id,
        name: debt.name,
        balance: debt.balance,
        interestRate: debt.interestRate,
        minimumPayment: debt.minimumPayment
      }));
      
      setOriginalData({
        userProfile: originalUserProfile,
        debts: originalDebts
      });
      setHasUnsavedChanges(false);
      
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
    
    // We now handle outdated analysis through local change tracking
    // No need to check with backend anymore since we track changes locally
    console.log(`📊 Analysis outdated status managed locally: ${hasUnsavedChanges}`);
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
      
      // Update original data to current data after successful save
      const currentUserProfile = {
        primaryIncome: userProfile.primaryIncome,
        additionalIncomes: userProfile.additionalIncomes,
        expenses: userProfile.expenses,
        goals: userProfile.goals,
        riskTolerance: userProfile.riskTolerance
      };
      
      const currentDebts = debts.map(debt => ({
        id: debt.id,
        name: debt.name,
        balance: debt.balance,
        interestRate: debt.interestRate,
        minimumPayment: debt.minimumPayment
      }));
      
      // Save data to localStorage for Payment Simulator
      const dataForSimulator = {
        debts: currentDebts,
        primaryIncome: userProfile.primaryIncome,
        additionalIncomes: userProfile.additionalIncomes,
        expenses: userProfile.expenses
      };
      localStorage.setItem('debtWiseData', JSON.stringify(dataForSimulator));
      console.log('💾 Data saved to localStorage for Payment Simulator');
      
      setOriginalData({
        userProfile: currentUserProfile,
        debts: currentDebts
      });
      setHasUnsavedChanges(false);
      setAnalysisOutdated(false);
      
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
        // Reset outdated flag after successful analysis
        setAnalysisOutdated(false);
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

  // Function to detect significant changes that warrant auto-analysis
  const detectSignificantChanges = (currentData: any, originalData: any) => {
    if (!originalData.userProfile || !originalData.debts) return true; // First time setup
    
    // Check income changes > $200
    const incomeChange = Math.abs(currentData.userProfile.primaryIncome - originalData.userProfile.primaryIncome);
    if (incomeChange >= 200) {
      console.log(`💰 Significant income change detected: $${incomeChange}`);
      return true;
    }
    
    // Check total expense changes > $100
    const currentExpenseTotal = currentData.userProfile.expenses.reduce((sum: number, exp: any) => sum + exp.amount, 0);
    const originalExpenseTotal = originalData.userProfile.expenses.reduce((sum: number, exp: any) => sum + exp.amount, 0);
    const expenseChange = Math.abs(currentExpenseTotal - originalExpenseTotal);
    if (expenseChange >= 100) {
      console.log(`💸 Significant expense change detected: $${expenseChange}`);
      return true;
    }
    
    // Check debt count changes (added/removed)
    if (currentData.debts.length !== originalData.debts.length) {
      console.log(`📊 Debt count changed: ${originalData.debts.length} → ${currentData.debts.length}`);
      return true;
    }
    
    // Check debt amount changes > $500 for any debt
    for (let i = 0; i < currentData.debts.length; i++) {
      const currentDebt = currentData.debts[i];
      const originalDebt = originalData.debts.find((d: any) => d.name === currentDebt.name);
      if (originalDebt) {
        const debtChange = Math.abs(currentDebt.balance - originalDebt.balance);
        if (debtChange >= 500) {
          console.log(`💳 Significant debt change detected in ${currentDebt.name}: $${debtChange}`);
          return true;
        }
        
        // Check interest rate changes > 1%
        const rateChange = Math.abs(currentDebt.interestRate - originalDebt.interestRate);
        if (rateChange >= 1) {
          console.log(`📈 Significant rate change detected in ${currentDebt.name}: ${rateChange}%`);
          return true;
        }
      }
    }
    
    // Check for strategy/goal changes
    if (currentData.userProfile.riskTolerance !== originalData.userProfile.riskTolerance) {
      console.log(`🎯 Risk tolerance changed: ${originalData.userProfile.riskTolerance} → ${currentData.userProfile.riskTolerance}`);
      return true;
    }
    
    console.log(`✅ No significant changes detected`);
    return false;
  };

  // Check if current data differs from original data
  const checkForChanges = () => {
    if (!originalData) return false;
    
    // Deep compare current data with original data
    const currentUserProfile = {
      primaryIncome: userProfile.primaryIncome,
      additionalIncomes: userProfile.additionalIncomes,
      expenses: userProfile.expenses,
      goals: userProfile.goals,
      riskTolerance: userProfile.riskTolerance
    };
    
    const currentDebts = debts.map(debt => ({
      id: debt.id,
      name: debt.name,
      balance: debt.balance,
      interestRate: debt.interestRate,
      minimumPayment: debt.minimumPayment
    }));
    
    // Convert to JSON strings for deep comparison
    const originalProfileString = JSON.stringify(originalData.userProfile);
    const currentProfileString = JSON.stringify(currentUserProfile);
    const originalDebtsString = JSON.stringify(originalData.debts);
    const currentDebtsString = JSON.stringify(currentDebts);
    
    return originalProfileString !== currentProfileString || originalDebtsString !== currentDebtsString;
  };

  // Monitor for changes in user data
  useEffect(() => {
    if (originalData && dataLoaded) {
      const hasChanges = checkForChanges();
      setHasUnsavedChanges(hasChanges);
      if (hasChanges) {
        setAnalysisOutdated(true);
      }
    }
  }, [userProfile, debts, originalData, dataLoaded]);

  // Generate debt composition chart for Debt Freedom Plan
  const generateDebtCompositionChart = () => {
    if (!debts || debts.length === 0) return null;

    const activeDebts = debts.filter(debt => debt.balance > 0);
    if (activeDebts.length === 0) return null;

    return {
      labels: activeDebts.map(debt => debt.name),
      datasets: [{
        data: activeDebts.map(debt => debt.balance),
        backgroundColor: [
          '#FF6B6B', // Red
          '#4ECDC4', // Teal  
          '#45B7D1', // Blue
          '#96CEB4', // Green
          '#FFEAA7', // Yellow
          '#DDA0DD', // Plum
          '#98D8C8', // Mint
          '#F7DC6F', // Light Yellow
          '#BB8FCE', // Light Purple
          '#85C1E9'  // Light Blue
        ],
        borderWidth: 3,
        borderColor: '#fff',
        hoverBorderWidth: 5,
        cutout: '60%' // Makes it a donut chart
      }]
    };
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
      <div className="analyzer-header">
        <h1>DebtWise - AI Debt Analysis</h1>
        
        {/* Real-time connection status */}
        <div className={`connection-status ${socketConnected ? 'connected' : 'disconnected'}`}>
          <span className="status-indicator"></span>
          {socketConnected ? (
            <span className="status-text">🔴 Live Updates Active</span>
          ) : (
            <span className="status-text">⚪ Offline Mode</span>
          )}
        </div>
      </div>
      
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
          disabled={!dataLoaded || saving || !hasUnsavedChanges}
          style={{
            opacity: (!dataLoaded || saving || !hasUnsavedChanges) ? 0.5 : 1,
            cursor: (!dataLoaded || saving || !hasUnsavedChanges) ? 'not-allowed' : 'pointer'
          }}
        >
          {saving ? '💾 Saving...' : hasUnsavedChanges ? '💾 Save Changes' : '✅ Data Saved'}
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
            backgroundColor: (hasUnsavedChanges && analysisOutdated) ? '#fff3cd' : '#d4edda',
            color: (hasUnsavedChanges && analysisOutdated) ? '#856404' : '#155724',
            border: `1px solid ${(hasUnsavedChanges && analysisOutdated) ? '#ffc107' : '#c3e6cb'}`
          }}>
            {hasUnsavedChanges && analysisOutdated ? (
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
          disabled={loading || hasNegativeCashFlow() || loadingPreviousAnalysis || (!hasUnsavedChanges && analysis)} 
          className={`analyze-btn ${hasNegativeCashFlow() ? 'disabled-negative-flow' : ''}`}
          style={{
            opacity: (loading || hasNegativeCashFlow() || loadingPreviousAnalysis || (!hasUnsavedChanges && analysis)) ? 0.5 : 1,
            cursor: (loading || hasNegativeCashFlow() || loadingPreviousAnalysis || (!hasUnsavedChanges && analysis)) ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? '🤖 Analyzing with AI...' : 
           loadingPreviousAnalysis ? '📊 Loading Analysis...' :
           !analysis ? '🧠 Analyze My Financial Situation with AI' :
           hasUnsavedChanges ? '🔄 Update Analysis with AI' : 
           '✅ Analysis Up to Date'}
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
        <div className="analysis-results" style={{ maxWidth: '100%', margin: '20px 0' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#2c3e50' }}>🎯 Your Debt Freedom Plan</h2>
          
          {/* Debt Composition Chart */}
          {(() => {
            const chartData = generateDebtCompositionChart();
            const totalDebt = debts.reduce((sum, debt) => sum + debt.balance, 0);
            
            return chartData && (
              <div style={{ 
                background: '#fff', 
                padding: '25px', 
                borderRadius: '16px', 
                marginBottom: '25px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                border: '2px solid #e3f2fd'
              }}>
                <h3 style={{ 
                  textAlign: 'center', 
                  marginBottom: '20px', 
                  color: '#1565c0',
                  fontSize: '20px'
                }}>
                  💰 Your Debt Portfolio
                </h3>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
                  gap: '30px',
                  alignItems: 'center'
                }}>
                  <div style={{ height: '300px', position: 'relative' }}>
                    <Doughnut 
                      data={chartData} 
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'right',
                            labels: {
                              padding: 15,
                              usePointStyle: true,
                              font: {
                                size: 12
                              },
                              generateLabels: (chart) => {
                                const data = chart.data;
                                if (data.labels && data.datasets[0].data && Array.isArray(data.datasets[0].backgroundColor)) {
                                  return data.labels.map((label, i) => {
                                    const value = data.datasets[0].data[i] as number;
                                    const percentage = ((value / totalDebt) * 100).toFixed(1);
                                    const backgroundColor = data.datasets[0].backgroundColor as string[];
                                    return {
                                      text: `${label}: $${value.toLocaleString()} (${percentage}%)`,
                                      fillStyle: backgroundColor[i] || '#666',
                                      strokeStyle: backgroundColor[i] || '#666',
                                      pointStyle: 'circle'
                                    };
                                  });
                                }
                                return [];
                              }
                            }
                          },
                          tooltip: {
                            callbacks: {
                              label: function(context) {
                                const value = context.raw as number;
                                const percentage = ((value / totalDebt) * 100).toFixed(1);
                                return `${context.label}: $${value.toLocaleString()} (${percentage}%)`;
                              }
                            }
                          }
                        }
                      }}
                    />
                    <div style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      textAlign: 'center',
                      pointerEvents: 'none'
                    }}>
                      <div style={{ 
                        fontSize: '24px', 
                        fontWeight: 'bold', 
                        color: '#1565c0' 
                      }}>
                        ${totalDebt.toLocaleString()}
                      </div>
                      <div style={{ 
                        fontSize: '14px', 
                        color: '#666',
                        marginTop: '5px'
                      }}>
                        Total Debt
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ 
                      display: 'grid', 
                      gap: '15px',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))'
                    }}>
                      <div style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        padding: '15px',
                        borderRadius: '12px',
                        textAlign: 'center'
                      }}>
                        <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                          {debts.filter(d => d.balance > 0).length}
                        </div>
                        <div style={{ fontSize: '12px', opacity: 0.9 }}>Active Debts</div>
                      </div>
                      <div style={{
                        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                        color: 'white',
                        padding: '15px',
                        borderRadius: '12px',
                        textAlign: 'center'
                      }}>
                        <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                          {Math.max(...debts.filter(d => d.balance > 0).map(d => Number(d.interestRate))).toFixed(1)}%
                        </div>
                        <div style={{ fontSize: '12px', opacity: 0.9 }}>Highest APR</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
          
          {/* Quick Summary Cards */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
            gap: '10px', 
            marginBottom: '25px' 
          }}>
            <div style={{ 
              background: '#e8f5e8', 
              padding: '15px', 
              borderRadius: '12px', 
              textAlign: 'center', 
              border: '2px solid #4caf50' 
            }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2e7d32' }}>
                ${analysis.totalDebt?.toLocaleString()}
              </div>
              <div style={{ fontSize: '12px', color: '#555', marginTop: '5px' }}>Total Debt</div>
            </div>
            <div style={{ 
              background: '#e3f2fd', 
              padding: '15px', 
              borderRadius: '12px', 
              textAlign: 'center', 
              border: '2px solid #2196f3' 
            }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1565c0' }}>
                ${analysis.availableAmount?.toLocaleString()}
              </div>
              <div style={{ fontSize: '12px', color: '#555', marginTop: '5px' }}>Available Monthly</div>
            </div>
            <div style={{ 
              background: '#fff3e0', 
              padding: '15px', 
              borderRadius: '12px', 
              textAlign: 'center', 
              border: '2px solid #ff9800' 
            }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#e65100' }}>
                ${analysis.minimumPayments?.toLocaleString()}
              </div>
              <div style={{ fontSize: '12px', color: '#555', marginTop: '5px' }}>Minimum Payments</div>
            </div>
          </div>

          {/* Recommended Strategy (Prominently Featured) */}
          <div style={{ 
            background: '#f8f9fa', 
            padding: '20px', 
            borderRadius: '12px', 
            marginBottom: '20px',
            border: '3px solid #28a745'
          }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#28a745', display: 'flex', alignItems: 'center', gap: '8px' }}>
              ⭐ Recommended Strategy
            </h3>
            <div style={{ fontSize: '16px', lineHeight: '1.6', whiteSpace: 'pre-line', marginBottom: '20px' }}>
              {analysis.strategy}
            </div>

            {/* Best Strategy Details */}
            {analysis.payoffStrategies && analysis.payoffStrategies.length > 0 && (() => {
              // Find the best strategy (lowest total interest)
              const bestStrategy = analysis.payoffStrategies.reduce((best: any, current: any) => 
                (current.totalInterestPaid < best.totalInterestPaid) ? current : best
              );
              
              return (
                <div style={{ 
                  background: 'white', 
                  padding: '15px', 
                  borderRadius: '8px',
                  border: '1px solid #dee2e6'
                }}>
                  <h4 style={{ margin: '0 0 10px 0', color: '#495057' }}>{bestStrategy.name}</h4>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
                    gap: '10px',
                    marginBottom: '15px'
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#28a745' }}>
                        {bestStrategy.monthsToPayoff}
                      </div>
                      <div style={{ fontSize: '12px', color: '#666' }}>Months</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#dc3545' }}>
                        ${bestStrategy.totalInterestPaid?.toLocaleString()}
                      </div>
                      <div style={{ fontSize: '12px', color: '#666' }}>Total Interest</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#007bff' }}>
                        ${bestStrategy.monthlyPayment?.toLocaleString()}
                      </div>
                      <div style={{ fontSize: '12px', color: '#666' }}>Monthly Payment</div>
                    </div>
                  </div>
                  
                  {/* Payment Schedule for Best Strategy */}
                  {bestStrategy.paymentSchedule && bestStrategy.paymentSchedule.length > 0 && (
                    <div style={{ marginTop: '15px' }}>
                      <h5 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#666' }}>📅 Next 6 Months</h5>
                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
                          <thead>
                            <tr style={{ background: '#f8f9fa' }}>
                              <th style={{ padding: '8px 4px', textAlign: 'left', border: '1px solid #dee2e6' }}>Month</th>
                              <th style={{ padding: '8px 4px', textAlign: 'left', border: '1px solid #dee2e6' }}>Debt</th>
                              <th style={{ padding: '8px 4px', textAlign: 'right', border: '1px solid #dee2e6' }}>Payment</th>
                              <th style={{ padding: '8px 4px', textAlign: 'right', border: '1px solid #dee2e6' }}>Interest</th>
                            </tr>
                          </thead>
                          <tbody>
                            {bestStrategy.paymentSchedule.map((month: any) => 
                              month.debts.map((debt: any, debtIndex: number) => (
                                <tr key={`${month.month}-${debtIndex}`}>
                                  <td style={{ padding: '6px 4px', border: '1px solid #dee2e6' }}>
                                    {debtIndex === 0 ? month.month : ''}
                                  </td>
                                  <td style={{ padding: '6px 4px', border: '1px solid #dee2e6' }}>{debt.name}</td>
                                  <td style={{ padding: '6px 4px', textAlign: 'right', border: '1px solid #dee2e6' }}>
                                    ${debt.payment.toLocaleString()}
                                  </td>
                                  <td style={{ padding: '6px 4px', textAlign: 'right', border: '1px solid #dee2e6' }}>
                                    ${debt.interestPaid.toLocaleString()}
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>

          {/* Other Strategies (Collapsible) */}
          {analysis.payoffStrategies && analysis.payoffStrategies.length > 1 && (
            <div style={{ marginBottom: '20px' }}>
              <button
                onClick={() => setShowOtherStrategies(!showOtherStrategies)}
                style={{
                  width: '100%',
                  padding: '15px',
                  background: 'white',
                  border: '2px solid #6c757d',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  color: '#495057',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <span>📊 Compare Other Strategies</span>
                <span>{showOtherStrategies ? '▼' : '▶'}</span>
              </button>
              
              {showOtherStrategies && (
                <div style={{ 
                  marginTop: '10px', 
                  padding: '15px', 
                  background: '#f8f9fa', 
                  borderRadius: '8px',
                  border: '1px solid #dee2e6'
                }}>
                  {analysis.payoffStrategies.map((strategy: any, index: number) => (
                    <div key={index} style={{ 
                      marginBottom: index === analysis.payoffStrategies.length - 1 ? '0' : '20px' 
                    }}>
                      <h4 style={{ margin: '0 0 10px 0', color: '#495057' }}>{strategy.name}</h4>
                      <p style={{ fontSize: '14px', color: '#666', margin: '0 0 10px 0' }}>{strategy.description}</p>
                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', 
                        gap: '8px',
                        background: 'white',
                        padding: '10px',
                        borderRadius: '6px'
                      }}>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontWeight: 'bold' }}>{strategy.monthsToPayoff}</div>
                          <div style={{ fontSize: '11px', color: '#666' }}>Months</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontWeight: 'bold' }}>${strategy.totalInterestPaid?.toLocaleString()}</div>
                          <div style={{ fontSize: '11px', color: '#666' }}>Interest</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontWeight: 'bold' }}>${strategy.monthlyPayment?.toLocaleString()}</div>
                          <div style={{ fontSize: '11px', color: '#666' }}>Monthly</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Motivational Message */}
          <div style={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
            color: 'white', 
            padding: '20px', 
            borderRadius: '12px', 
            textAlign: 'center',
            marginBottom: '20px'
          }}>
            <h3 style={{ margin: '0 0 10px 0' }}>💪 Your Motivation</h3>
            <p style={{ margin: 0, fontSize: '16px', lineHeight: '1.5' }}>{analysis.motivationalMessage}</p>
          </div>

          {/* Collapsible Sections */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            
            {/* Goal Analysis */}
            {analysis.goalAnalysis && (
              <div>
                <button
                  onClick={() => setShowGoalAnalysis(!showGoalAnalysis)}
                  style={{
                    width: '100%',
                    padding: '15px',
                    background: 'white',
                    border: '2px solid #17a2b8',
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: '#17a2b8',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <span>🎯 Goal Achievement Analysis</span>
                  <span>{showGoalAnalysis ? '▼' : '▶'}</span>
                </button>
                {showGoalAnalysis && (
                  <div style={{ 
                    marginTop: '10px', 
                    padding: '15px', 
                    background: '#f8f9fa', 
                    borderRadius: '8px',
                    border: '1px solid #17a2b8',
                    fontSize: '14px',
                    lineHeight: '1.6',
                    whiteSpace: 'pre-wrap',
                    fontFamily: 'inherit'
                  }}>
                    {analysis.goalAnalysis}
                  </div>
                )}
              </div>
            )}

            {/* Expense Analysis */}
            {analysis.expenseAnalysis && (
              <div>
                <button
                  onClick={() => setShowExpenseAnalysis(!showExpenseAnalysis)}
                  style={{
                    width: '100%',
                    padding: '15px',
                    background: 'white',
                    border: '2px solid #ffc107',
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: '#856404',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <span>💸 Expense Optimization Tips</span>
                  <span>{showExpenseAnalysis ? '▼' : '▶'}</span>
                </button>
                {showExpenseAnalysis && (
                  <div style={{ 
                    marginTop: '10px', 
                    padding: '15px', 
                    background: '#fff3cd', 
                    borderRadius: '8px',
                    border: '1px solid #ffc107',
                    fontSize: '14px',
                    lineHeight: '1.6',
                    whiteSpace: 'pre-wrap',
                    fontFamily: 'inherit'
                  }}>
                    {analysis.expenseAnalysis}
                  </div>
                )}
              </div>
            )}

            {/* Next Steps */}
            <div>
              <button
                onClick={() => setShowNextSteps(!showNextSteps)}
                style={{
                  width: '100%',
                  padding: '15px',
                  background: 'white',
                  border: '2px solid #28a745',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  color: '#28a745',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <span>🚀 Your Action Plan</span>
                <span>{showNextSteps ? '▼' : '▶'}</span>
              </button>
              {showNextSteps && (
                <div style={{ 
                  marginTop: '10px', 
                  padding: '15px', 
                  background: '#d4edda', 
                  borderRadius: '8px',
                  border: '1px solid #28a745'
                }}>
                  <ul style={{ margin: 0, paddingLeft: '20px' }}>
                    {analysis.nextSteps?.map((step: string, index: number) => (
                      <li key={index} style={{ marginBottom: '8px', fontSize: '14px', lineHeight: '1.5' }}>
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DebtAnalyzer;