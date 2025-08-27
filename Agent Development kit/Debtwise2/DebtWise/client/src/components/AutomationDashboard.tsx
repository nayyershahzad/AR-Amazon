import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import useAuth from '../hooks/useAuth';
import './AutomationDashboard.css';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

interface SimulationDebt {
  id: string;
  name: string;
  balance: number;
  interestRate: number;
  minimumPayment: number;
  pastDueAmount: number;        // Accumulated missed minimum payments
  daysPastDue: number;          // 0, 30, 60, 90+ days
  consecutiveSkips: number;     // Track consecutive months skipped
}

interface SimulationState {
  debts: SimulationDebt[];
  monthlyBudget: number;
  strategy: 'manual';
  currentMonth: number;
  paymentHistory: PaymentHistory[];
  totalInterestPaid: number;
  totalPrincipalPaid: number;
}

interface PaymentHistory {
  month: number;
  debtName: string;
  payment: number;
  principal: number;
  interest: number;
  remainingBalance: number;
  action: 'normal' | 'skip' | 'advance';
}

const AutomationDashboard: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [simulationState, setSimulationState] = useState<SimulationState | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string>('');
  const [advanceAmount, setAdvanceAmount] = useState<number>(0);
  const [partialAmount, setPartialAmount] = useState<number>(0);

  // Save simulation state to localStorage whenever it changes (for Behavioral Dashboard)
  useEffect(() => {
    if (simulationState) {
      console.log('💾 Saving Payment Simulator state to localStorage for Behavioral Dashboard');
      localStorage.setItem('paymentSimulatorState', JSON.stringify(simulationState));
    }
  }, [simulationState]);

  // Load simulation state from localStorage on component mount (for session persistence)
  useEffect(() => {
    const savedSimulationState = localStorage.getItem('paymentSimulatorState');
    if (savedSimulationState && !simulationState) {
      try {
        const parsedState = JSON.parse(savedSimulationState);
        console.log('🔄 Restoring Payment Simulator state from localStorage');
        setSimulationState(parsedState);
        setLoading(false);
        return; // Skip the normal data loading process
      } catch (error) {
        console.error('❌ Failed to parse saved simulation state:', error);
        localStorage.removeItem('paymentSimulatorState'); // Clean up corrupted data
      }
    }
  }, []); // Only run on mount

  // Reset simulation to start fresh
  const resetSimulation = () => {
    if (window.confirm('Are you sure you want to reset the Payment Simulator? This will clear all your payment history and start over.')) {
      console.log('🔄 Resetting Payment Simulator...');
      localStorage.removeItem('paymentSimulatorState');
      setSimulationState(null);
      setAdvanceAmount(0);
      setPartialAmount(0);
      loadDataFromFirstTab(); // Reload fresh data
    }
  };

  // Simple API call function matching the one from DebtAnalyzer
  const apiCall = async (url: string, options?: any) => {
    try {
      const response = await fetch(`http://localhost:3001${url}`, {
        ...options,
        credentials: 'include', // Important for session-based auth
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (isAuthenticated && !isLoading && !simulationState) {
      // Only load data if we don't already have restored simulation state
      loadDataFromFirstTab();
    } else if (!isLoading && !isAuthenticated) {
      setMessage('❌ Please log in to use the Payment Simulator.');
      setLoading(false);
    }
  }, [isAuthenticated, isLoading, simulationState]);

  // Load debt and financial data with multiple fallback methods
  const loadDataFromFirstTab = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      console.log('🔄 Loading data for Payment Simulator...');
      
      // Method 1: Try to get data from localStorage (set by first tab)
      const localStorageData = localStorage.getItem('debtWiseData');
      if (localStorageData) {
        console.log('📦 Found data in localStorage');
        try {
          const parsedData = JSON.parse(localStorageData);
          console.log('📊 LocalStorage data:', parsedData);
          if (parsedData.debts && parsedData.debts.length > 0) {
            return processDataAndSetState(parsedData, 'localStorage');
          }
        } catch (e) {
          console.log('⚠️ Invalid localStorage data, clearing it');
          localStorage.removeItem('debtWiseData');
        }
      }

      // Method 2: Try API call if authenticated
      if (isAuthenticated) {
        console.log('🌐 Trying API call...');
        try {
          // Try the analysis endpoint first (where debt analyzer saves data)
          let data = await apiCall('/api/user/analysis');
          console.log('📊 Analysis API data received:', data);
          
          // If analysis endpoint doesn't have data, try profile endpoint
          if (!data || !data.debts || data.debts.length === 0) {
            console.log('🔄 Trying profile endpoint...');
            data = await apiCall('/api/user/profile');
            console.log('📊 Profile API data received:', data);
          }
          
          if (data && data.debts && data.debts.length > 0) {
            return processDataAndSetState(data, 'API');
          }
        } catch (apiError) {
          console.log('⚠️ API calls failed:', apiError);
        }
      }

      // Method 3: Show error instead of demo data to avoid confusion
      console.log('❌ No data available from localStorage or API');
      setMessage('❌ No debt data found. Please go to the "📊 Debt Analysis" tab first, add your debts, and save your data. Then come back to run simulations.');
      return;
      
    } catch (error) {
      console.error('❌ All data loading methods failed:', error);
      setMessage('❌ Unable to load data. This might be a demo - showing sample data, or please complete the debt analysis in the first tab.');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to process data and set simulation state
  const processDataAndSetState = (data: any, source: string) => {
    console.log(`✨ Processing data from ${source}:`, data);

    // Handle different data structures from API vs localStorage
    let userData = data;
    if (data.userProfile) {
      // API response format: { userProfile: {...}, debts: [...] }
      userData = {
        ...data.userProfile,
        debts: data.debts || data.userProfile.debts || []
      };
    }

    // Map debts to simulation format with better error handling
    const rawDebts = userData.debts || [];
    if (!Array.isArray(rawDebts) || rawDebts.length === 0) {
      setMessage('❌ No debts found in the data. Please add debts in the Debt Analysis tab first.');
      return;
    }

    const debts: SimulationDebt[] = rawDebts.map((debt: any, index: number) => {
      let interestRate = Number(debt.interestRate) || 0;
      
      // Handle different interest rate formats - DebtAnalyzer already converts to decimal
      // So we expect values like 0.18 for 18%, but handle edge cases
      if (interestRate > 1) {
        console.warn(`⚠️ Interest rate ${interestRate} appears to be in percentage format, converting to decimal`);
        interestRate = interestRate / 100;
      }
      
      // Cap interest rate at 50% APR for safety
      if (interestRate > 0.5) {
        console.warn(`⚠️ Interest rate ${interestRate} seems too high, capping at 50% APR`);
        interestRate = 0.5;
      }

      return {
        id: debt.id || `debt-${index}`,
        name: debt.name || `Debt ${index + 1}`,
        balance: Number(debt.balance) || 0,
        interestRate: interestRate, // Should already be decimal (0.18 for 18%)
        minimumPayment: Number(debt.minimumPayment) || 0,
        pastDueAmount: 0,        // Start with no past due
        daysPastDue: 0,          // Start current
        consecutiveSkips: 0      // No skips initially
      };
    }).filter(debt => debt.balance > 0); // Only include debts with positive balance

    if (debts.length === 0) {
      setMessage('❌ No active debts with positive balance found. Please check your debt data.');
      return;
    }

    // Calculate monthly budget from income and expenses with better handling
    const primaryIncome = Number(userData.primaryIncome) || 0;
    const additionalIncomes = userData.additionalIncomes || [];
    const additionalIncome = Array.isArray(additionalIncomes) ? 
      additionalIncomes.reduce((sum: number, income: any) => sum + (Number(income.amount) || 0), 0) : 0;
    const totalIncome = primaryIncome + additionalIncome;
    
    const expenses = userData.expenses || [];
    const totalExpenses = Array.isArray(expenses) ? 
      expenses.reduce((sum: number, expense: any) => sum + (Number(expense.amount) || 0), 0) : 0;
    
    const monthlyBudget = Math.max(100, totalIncome - totalExpenses); // Minimum $100

    console.log(`💰 Budget calculation: Income=$${totalIncome}, Expenses=$${totalExpenses}, Available=$${monthlyBudget}`);
    console.log(`📊 Processed ${debts.length} debts:`, debts.map(d => `${d.name}: $${d.balance}`));

    setSimulationState({
      debts,
      monthlyBudget,
      strategy: 'manual',
      currentMonth: 1,
      paymentHistory: [],
      totalInterestPaid: 0,
      totalPrincipalPaid: 0
    });
    
    setMessage(`✅ Data loaded from ${source}. Found ${debts.length} active debts. Ready to simulate payments!`);
    console.log('✅ Payment Simulator ready!');
  };

  // Calculate next payment based on strategy - INCLUDES PAST DUE AMOUNTS
  const calculateNextPayment = (state: SimulationState) => {
    const { debts, monthlyBudget, strategy } = state;
    const activeDebts = debts.filter(debt => debt.balance > 0);
    
    if (activeDebts.length === 0) return null;

    // Calculate total past due amounts across all debts
    const totalPastDue = activeDebts.reduce((sum, debt) => sum + debt.pastDueAmount, 0);
    const totalMinimums = activeDebts.reduce((sum, debt) => sum + debt.minimumPayment, 0);
    const totalRequired = totalPastDue + totalMinimums;

    // For manual payment allocation, sort by balance (smallest first) for display consistency
    const sortedDebts = [...activeDebts].sort((a, b) => {
      return a.balance - b.balance;
    });

    // Check if budget can cover required payments
    const hasPastDue = totalPastDue > 0;
    const canAffordRequired = monthlyBudget >= totalRequired;
    const extraAmount = Math.max(0, monthlyBudget - totalRequired);
    
    return {
      priorityDebt: sortedDebts[0],
      payments: activeDebts.map(debt => ({
        debt,
        // Required: past due + minimum + (extra if priority debt)
        amount: debt.pastDueAmount + debt.minimumPayment + 
               (debt.id === sortedDebts[0].id ? extraAmount : 0),
        pastDueAmount: debt.pastDueAmount,
        minimumAmount: debt.minimumPayment
      })),
      totalPayment: Math.min(monthlyBudget, totalRequired + extraAmount),
      totalRequired,
      totalPastDue,
      canAffordRequired,
      hasPastDue,
      shortfall: canAffordRequired ? 0 : totalRequired - monthlyBudget
    };
  };

  // Simulate making the next payment - REALISTIC FINANCE LOGIC WITH PAST DUE HANDLING
  const makeNextPayment = () => {
    if (!simulationState) return;

    const paymentPlan = calculateNextPayment(simulationState);
    if (!paymentPlan) {
      setMessage('🎉 All debts are paid off!');
      return;
    }

    // Check if user has sufficient funds for required payments
    if (!paymentPlan.canAffordRequired) {
      setMessage(`❌ Insufficient funds! Need $${paymentPlan.totalRequired.toLocaleString()} but budget is $${simulationState.monthlyBudget.toLocaleString()}. Shortfall: $${paymentPlan.shortfall.toLocaleString()}`);
      return;
    }

    const updatedDebts = [...simulationState.debts];
    const newHistory: PaymentHistory[] = [];
    let totalInterest = 0;
    let totalPrincipal = 0;

    // STEP 1 & 2: For each debt, calculate interest and apply payments
    paymentPlan.payments.forEach(({ debt, amount, pastDueAmount, minimumAmount }) => {
      const debtIndex = updatedDebts.findIndex(d => d.id === debt.id);
      if (debtIndex === -1 || debt.balance <= 0) return;

      // Calculate monthly interest on ORIGINAL balance (before any changes this month)
      const monthlyInterest = (debt.balance * debt.interestRate) / 12;
      
      // Debug: Log calculation
      console.log(`💰 ${debt.name}: Balance=$${debt.balance}, Rate=${(debt.interestRate * 100).toFixed(2)}%, Monthly Interest=$${monthlyInterest.toFixed(2)}`);
      
      // Sanity check: If monthly interest is more than 10% of balance, something's wrong
      if (monthlyInterest > debt.balance * 0.1) {
        console.error(`🚨 INSANE INTEREST CALCULATION: ${debt.name} - $${monthlyInterest.toFixed(2)} monthly interest on $${debt.balance} balance`);
        console.error(`🚨 Interest rate appears to be: ${debt.interestRate}, should be decimal like 0.18 for 18%`);
        return; // Skip this debt to prevent explosion
      }
      
      // Add interest to balance first
      updatedDebts[debtIndex].balance = debt.balance + monthlyInterest;
      totalInterest += monthlyInterest;

      let remainingPayment = amount;
      let principal = 0;

      // First: Pay down past due amount (brings account current)
      if (pastDueAmount > 0 && remainingPayment > 0) {
        const pastDuePayment = Math.min(remainingPayment, pastDueAmount);
        updatedDebts[debtIndex].pastDueAmount = Math.max(0, pastDueAmount - pastDuePayment);
        remainingPayment -= pastDuePayment;
        
        // Reset delinquency status if fully caught up
        if (updatedDebts[debtIndex].pastDueAmount === 0) {
          updatedDebts[debtIndex].daysPastDue = 0;
          updatedDebts[debtIndex].consecutiveSkips = 0;
        }
      }

      // Second: Apply remaining payment as principal (reduces the balance)
      if (remainingPayment > 0) {
        principal = Math.min(remainingPayment, updatedDebts[debtIndex].balance);
        updatedDebts[debtIndex].balance = Math.max(0, updatedDebts[debtIndex].balance - principal);
        totalPrincipal += principal;
      }

      newHistory.push({
        month: simulationState.currentMonth,
        debtName: debt.name,
        payment: amount,
        principal,
        interest: monthlyInterest, // Show only the actual monthly interest, not inflated
        remainingBalance: updatedDebts[debtIndex].balance,
        action: 'normal'
      });
    });

    const catchUpMessage = paymentPlan.hasPastDue ? 
      ` Caught up on $${paymentPlan.totalPastDue.toLocaleString()} in past due amounts.` : '';

    setSimulationState({
      ...simulationState,
      debts: updatedDebts,
      currentMonth: simulationState.currentMonth + 1,
      paymentHistory: [...simulationState.paymentHistory, ...newHistory],
      totalInterestPaid: simulationState.totalInterestPaid + totalInterest,
      totalPrincipalPaid: simulationState.totalPrincipalPaid + totalPrincipal
    });

    setMessage(`💰 Month ${simulationState.currentMonth} payment processed!${catchUpMessage} Interest accrued, then payments applied.`);
  };

  // Simulate skipping the next payment - REALISTIC DELINQUENCY TRACKING
  // Make catch-up payment only (pay past due amounts to get current)
  const makeCatchUpPayment = () => {
    if (!simulationState) return;

    const paymentPlan = calculateNextPayment(simulationState);
    if (!paymentPlan || !paymentPlan.hasPastDue) return;

    // Check if user has sufficient funds for past due amounts only
    if (simulationState.monthlyBudget < paymentPlan.totalPastDue) {
      setMessage(`❌ Insufficient funds for catch-up! Need $${paymentPlan.totalPastDue.toLocaleString()} but budget is $${simulationState.monthlyBudget.toLocaleString()}.`);
      return;
    }

    const updatedDebts = [...simulationState.debts];
    const newHistory: PaymentHistory[] = [];
    let totalInterest = 0;
    let totalPrincipal = 0;

    // STEP 1: ALL debts accrue interest monthly
    updatedDebts.forEach(debt => {
      if (debt.balance > 0) {
        const monthlyInterest = (debt.balance * debt.interestRate) / 12;
        debt.balance += monthlyInterest;
        totalInterest += monthlyInterest;
      }
    });

    // STEP 2: Apply only past due payments (minimum catch-up to get current)
    let remainingBudget = simulationState.monthlyBudget;
    
    updatedDebts.forEach(debt => {
      if (debt.pastDueAmount > 0 && remainingBudget > 0) {
        const pastDuePayment = Math.min(remainingBudget, debt.pastDueAmount);
        debt.pastDueAmount = Math.max(0, debt.pastDueAmount - pastDuePayment);
        remainingBudget -= pastDuePayment;
        
        // Reset delinquency status if fully caught up
        if (debt.pastDueAmount === 0) {
          debt.daysPastDue = 0;
          debt.consecutiveSkips = 0;
        }

        // Any remaining budget goes toward principal on this debt
        if (remainingBudget > 0) {
          const extraPrincipal = Math.min(remainingBudget, debt.balance);
          debt.balance = Math.max(0, debt.balance - extraPrincipal);
          totalPrincipal += extraPrincipal;
          remainingBudget -= extraPrincipal;
        }

        newHistory.push({
          month: simulationState.currentMonth,
          debtName: debt.name,
          payment: pastDuePayment + (totalPrincipal > 0 ? totalPrincipal : 0),
          principal: totalPrincipal > 0 ? totalPrincipal : 0,
          interest: (debt.balance * debt.interestRate) / 12,
          remainingBalance: debt.balance,
          action: 'normal'
        });
      }
    });

    setSimulationState({
      ...simulationState,
      debts: updatedDebts,
      currentMonth: simulationState.currentMonth + 1,
      paymentHistory: [...simulationState.paymentHistory, ...newHistory],
      totalInterestPaid: simulationState.totalInterestPaid + totalInterest,
      totalPrincipalPaid: simulationState.totalPrincipalPaid + totalPrincipal
    });

    const usedAmount = simulationState.monthlyBudget - remainingBudget;
    setMessage(`💰 Catch-up payment of $${usedAmount.toLocaleString()} processed! You are now current on all accounts.`);
  };

  // Make partial payment with available funds - FIXED LOGIC: Consider total monthly payments
  const makePartialPayment = () => {
    if (!simulationState || partialAmount <= 0) return;

    const paymentPlan = calculateNextPayment(simulationState);
    if (!paymentPlan) return;

    // Check if we have any payments made this month from advance payments
    const thisMonthPayments = simulationState.paymentHistory.filter(
      h => h.month === simulationState.currentMonth && h.action === 'advance'
    );
    const alreadyPaidThisMonth = thisMonthPayments.reduce((sum, payment) => sum + payment.payment, 0);
    const totalMonthlyPayment = partialAmount + alreadyPaidThisMonth;

    console.log(`💡 Month ${simulationState.currentMonth}: Partial payment $${partialAmount} + Already paid $${alreadyPaidThisMonth} = Total $${totalMonthlyPayment} vs Required $${paymentPlan.totalRequired}`);

    const updatedDebts = [...simulationState.debts];
    const newHistory: PaymentHistory[] = [];
    let totalInterest = 0;
    let totalPrincipal = 0;
    let totalLateFees = 0;
    let remainingPayment = partialAmount;

    // STEP 1: ALL debts accrue interest monthly
    updatedDebts.forEach(debt => {
      if (debt.balance > 0) {
        const monthlyInterest = (debt.balance * debt.interestRate) / 12;
        debt.balance += monthlyInterest;
        totalInterest += monthlyInterest;
      }
    });

    // STEP 2: First pay all past due amounts (if any)
    const activeDebts = updatedDebts.filter(debt => debt.balance > 0);
    activeDebts.forEach(debt => {
      const debtIndex = updatedDebts.findIndex(d => d.id === debt.id);
      if (debt.pastDueAmount > 0 && remainingPayment > 0) {
        const pastDuePayment = Math.min(remainingPayment, debt.pastDueAmount);
        updatedDebts[debtIndex].pastDueAmount -= pastDuePayment;
        remainingPayment -= pastDuePayment;
        
        if (updatedDebts[debtIndex].pastDueAmount === 0) {
          updatedDebts[debtIndex].daysPastDue = 0;
          updatedDebts[debtIndex].consecutiveSkips = 0;
        }
      }
    });

    // STEP 3: Apply remaining payment to minimums (sorted by balance for consistency)
    const sortedDebts = [...activeDebts].sort((a, b) => {
      return a.balance - b.balance;
    });

    // Track which debts get their minimum covered
    const debtPayments: { [key: string]: number } = {};
    
    sortedDebts.forEach(debt => {
      const debtIndex = updatedDebts.findIndex(d => d.id === debt.id);
      if (debtIndex === -1) return;

      // Try to pay minimum first
      const minimumNeeded = debt.minimumPayment;
      const paymentForMinimum = Math.min(remainingPayment, minimumNeeded);
      
      if (paymentForMinimum > 0) {
        // Apply to principal
        const principal = Math.min(paymentForMinimum, updatedDebts[debtIndex].balance);
        updatedDebts[debtIndex].balance -= principal;
        totalPrincipal += principal;
        remainingPayment -= paymentForMinimum;
        
        debtPayments[debt.id] = paymentForMinimum;
      }
    });

    // STEP 4: Apply any extra payment to priority debt
    if (remainingPayment > 0 && sortedDebts.length > 0) {
      const priorityDebt = sortedDebts[0];
      const debtIndex = updatedDebts.findIndex(d => d.id === priorityDebt.id);
      if (debtIndex !== -1) {
        const extraPrincipal = Math.min(remainingPayment, updatedDebts[debtIndex].balance);
        updatedDebts[debtIndex].balance -= extraPrincipal;
        totalPrincipal += extraPrincipal;
        debtPayments[priorityDebt.id] = (debtPayments[priorityDebt.id] || 0) + extraPrincipal;
      }
    }

    // STEP 5: Apply consequences ONLY if total monthly payment is insufficient
    const isMonthlyPaymentSufficient = totalMonthlyPayment >= paymentPlan.totalRequired;
    console.log(`💡 Is monthly payment sufficient? ${isMonthlyPaymentSufficient} (${totalMonthlyPayment} >= ${paymentPlan.totalRequired})`);

    activeDebts.forEach(debt => {
      const debtIndex = updatedDebts.findIndex(d => d.id === debt.id);
      if (debtIndex === -1) return;

      const paidAmount = debtPayments[debt.id] || 0;
      const shortfall = Math.max(0, debt.minimumPayment - paidAmount);

      // Only apply late fees if the total monthly payment is insufficient AND there's a shortfall on this specific debt
      if (!isMonthlyPaymentSufficient && shortfall > 0) {
        // Late fee for unpaid minimum
        const lateFee = Math.max(debt.minimumPayment * 0.035, 25);
        updatedDebts[debtIndex].balance += lateFee;
        updatedDebts[debtIndex].consecutiveSkips = debt.consecutiveSkips + 1;
        updatedDebts[debtIndex].daysPastDue = Math.min(debt.daysPastDue + 30, 120);
        updatedDebts[debtIndex].pastDueAmount += shortfall; // Only add the actual shortfall
        totalLateFees += lateFee;
      }

      // Create history entry
      const monthlyInterest = (debt.balance * debt.interestRate) / 12;
      newHistory.push({
        month: simulationState.currentMonth,
        debtName: debt.name,
        payment: paidAmount,
        principal: paidAmount, // For partial payments, all goes to principal after interest
        interest: monthlyInterest,
        remainingBalance: updatedDebts[debtIndex].balance,
        action: (!isMonthlyPaymentSufficient && shortfall > 0) ? 'skip' : 'normal'
      });
    });

    setSimulationState({
      ...simulationState,
      debts: updatedDebts,
      currentMonth: simulationState.currentMonth + 1,
      paymentHistory: [...simulationState.paymentHistory, ...newHistory],
      totalInterestPaid: simulationState.totalInterestPaid + totalInterest + totalLateFees,
      totalPrincipalPaid: simulationState.totalPrincipalPaid + totalPrincipal
    });

    let messageText;
    if (isMonthlyPaymentSufficient) {
      messageText = `✅ Monthly payment complete! Total paid: $${totalMonthlyPayment.toLocaleString()} (exceeds required $${paymentPlan.totalRequired.toLocaleString()}) - No late fees applied.`;
    } else {
      const shortfall = paymentPlan.totalRequired - totalMonthlyPayment;
      messageText = `💸 Partial payment of $${partialAmount.toLocaleString()} processed. Total monthly payment: $${totalMonthlyPayment.toLocaleString()}, still short $${shortfall.toLocaleString()} - late fees applied only for actual shortfalls!`;
    }
    
    setMessage(messageText);
    setPartialAmount(0);
  };

  const skipNextPayment = () => {
    if (!simulationState) return;

    const activeDebts = simulationState.debts.filter(debt => debt.balance > 0);
    const updatedDebts = [...simulationState.debts];
    const newHistory: PaymentHistory[] = [];
    let totalInterest = 0;
    let totalLateFees = 0;
    let totalPastDueAdded = 0;

    activeDebts.forEach(debt => {
      const debtIndex = updatedDebts.findIndex(d => d.id === debt.id);
      if (debtIndex === -1) return;

      // STEP 1: Regular monthly interest compounds on existing balance
      const monthlyInterest = (debt.balance * debt.interestRate) / 12;
      
      // STEP 2: Calculate late fee (varies by consecutive skips)
      const baseLateFee = Math.max(debt.minimumPayment * 0.035, 25);
      const lateFee = Math.min(baseLateFee * (1 + debt.consecutiveSkips * 0.1), 40); // Cap at $40
      
      // STEP 3: Add minimum payment to past due amount (this is the key insight!)
      const currentMinimum = debt.minimumPayment;
      
      // STEP 4: Update delinquency tracking
      const newConsecutiveSkips = debt.consecutiveSkips + 1;
      const newDaysPastDue = Math.min(debt.daysPastDue + 30, 120); // Cap at 120+ days

      updatedDebts[debtIndex] = {
        ...debt,
        balance: debt.balance + monthlyInterest + lateFee,
        pastDueAmount: debt.pastDueAmount + currentMinimum, // THIS IS THE CRITICAL PART
        daysPastDue: newDaysPastDue,
        consecutiveSkips: newConsecutiveSkips,
        // Minimum payment may increase slightly with higher balance
        minimumPayment: Math.max(debt.minimumPayment, 
                               (debt.balance + monthlyInterest + lateFee) * 0.02)
      };

      totalInterest += monthlyInterest;
      totalLateFees += lateFee;
      totalPastDueAdded += currentMinimum;

      newHistory.push({
        month: simulationState.currentMonth,
        debtName: debt.name,
        payment: 0,
        principal: 0,
        interest: monthlyInterest + lateFee,
        remainingBalance: updatedDebts[debtIndex].balance,
        action: 'skip'
      });
    });

    const delinquencyStatus = Math.max(...updatedDebts.map(d => d.daysPastDue));
    let statusMessage = '';
    if (delinquencyStatus >= 90) statusMessage = '🚨 90+ days delinquent - Credit severely impacted!';
    else if (delinquencyStatus >= 60) statusMessage = '⚠️ 60+ days delinquent - Credit being damaged!';
    else if (delinquencyStatus >= 30) statusMessage = '⚠️ 30+ days delinquent - Credit impact starting!';

    setSimulationState({
      ...simulationState,
      debts: updatedDebts,
      currentMonth: simulationState.currentMonth + 1,
      paymentHistory: [...simulationState.paymentHistory, ...newHistory],
      totalInterestPaid: simulationState.totalInterestPaid + totalInterest + totalLateFees,
    });

    setMessage(`⚠️ Month ${simulationState.currentMonth} payments skipped! Interest: $${totalInterest.toFixed(2)}, Late fees: $${totalLateFees.toFixed(2)}, Past due increased by: $${totalPastDueAdded.toFixed(2)}. ${statusMessage}`);
  };

  // Simulate making an advance payment - FIXED TO HANDLE PAST DUE FIRST
  const makeAdvancePayment = () => {
    if (!simulationState || advanceAmount <= 0) return;

    const paymentPlan = calculateNextPayment(simulationState);
    if (!paymentPlan) return;

    let remainingAmount = advanceAmount;
    const updatedDebts = [...simulationState.debts];
    let totalPastDuePaid = 0;
    let totalPrincipalPaid = 0;

    // STEP 1: Pay past due amounts first (if any exist)
    if (paymentPlan.hasPastDue && remainingAmount > 0) {
      updatedDebts.forEach(debt => {
        const debtIndex = updatedDebts.findIndex(d => d.id === debt.id);
        if (debt.pastDueAmount > 0 && remainingAmount > 0) {
          const pastDuePayment = Math.min(remainingAmount, debt.pastDueAmount);
          updatedDebts[debtIndex].pastDueAmount -= pastDuePayment;
          remainingAmount -= pastDuePayment;
          totalPastDuePaid += pastDuePayment;
          
          // Reset delinquency status if fully caught up
          if (updatedDebts[debtIndex].pastDueAmount === 0) {
            updatedDebts[debtIndex].daysPastDue = 0;
            updatedDebts[debtIndex].consecutiveSkips = 0;
          }
        }
      });
    }

    // STEP 2: Apply remaining amount to priority debt principal
    if (remainingAmount > 0) {
      const priorityDebt = paymentPlan.priorityDebt;
      const debtIndex = updatedDebts.findIndex(d => d.id === priorityDebt.id);
      
      if (debtIndex !== -1) {
        const principal = Math.min(remainingAmount, updatedDebts[debtIndex].balance);
        updatedDebts[debtIndex].balance = Math.max(0, updatedDebts[debtIndex].balance - principal);
        totalPrincipalPaid = principal;
      }
    }

    const newHistory: PaymentHistory = {
      month: simulationState.currentMonth,
      debtName: paymentPlan.priorityDebt.name,
      payment: advanceAmount,
      principal: totalPrincipalPaid,
      interest: 0, // No interest for immediate extra payment
      remainingBalance: updatedDebts.find(d => d.id === paymentPlan.priorityDebt.id)?.balance || 0,
      action: 'advance'
    };

    setSimulationState({
      ...simulationState,
      debts: updatedDebts,
      paymentHistory: [...simulationState.paymentHistory, newHistory],
      totalPrincipalPaid: simulationState.totalPrincipalPaid + totalPrincipalPaid
    });

    let message = `🚀 Extra payment of $${advanceAmount.toLocaleString()} processed!`;
    if (totalPastDuePaid > 0) {
      message += ` Paid $${totalPastDuePaid.toLocaleString()} toward past due balances.`;
    }
    if (totalPrincipalPaid > 0) {
      message += ` Applied $${totalPrincipalPaid.toLocaleString()} to ${paymentPlan.priorityDebt.name} principal.`;
    }

    setMessage(message);
    setAdvanceAmount(0);
  };

  // Generate debt breakdown chart
  const generateDebtChart = () => {
    if (!simulationState) return null;

    const activeDebts = simulationState.debts.filter(debt => debt.balance > 0);
    
    return {
      labels: activeDebts.map(debt => debt.name),
      datasets: [{
        data: activeDebts.map(debt => debt.balance),
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40'
        ],
        borderWidth: 2,
        borderColor: '#fff'
      }]
    };
  };

  // Generate payment history chart - FIXED AGGREGATION LOGIC
  const generatePaymentChart = () => {
    if (!simulationState || simulationState.paymentHistory.length === 0) return null;

    // Group by month and properly aggregate all payments for that month
    const monthlyData: { [key: string]: { principal: number, interest: number, totalPayment: number, actions: string[] } } = {};
    
    simulationState.paymentHistory.forEach(payment => {
      const month = `Month ${payment.month}`;
      if (!monthlyData[month]) {
        monthlyData[month] = { principal: 0, interest: 0, totalPayment: 0, actions: [] };
      }
      
      // Safely aggregate data
      const principal = isNaN(payment.principal) || payment.principal < 0 ? 0 : payment.principal;
      const interest = isNaN(payment.interest) || payment.interest < 0 ? 0 : payment.interest;
      const totalPayment = isNaN(payment.payment) || payment.payment < 0 ? 0 : payment.payment;
      
      monthlyData[month].principal += principal;
      monthlyData[month].interest += interest;
      monthlyData[month].totalPayment += totalPayment;
      
      // Track action types for this month
      if (!monthlyData[month].actions.includes(payment.action)) {
        monthlyData[month].actions.push(payment.action);
      }
    });

    // Sort months numerically
    const months = Object.keys(monthlyData).sort((a, b) => {
      const monthA = parseInt(a.replace('Month ', ''));
      const monthB = parseInt(b.replace('Month ', ''));
      return monthA - monthB;
    });
    
    // Only show months with actual data
    const validMonths = months.filter(month => 
      monthlyData[month].principal > 0 || monthlyData[month].interest > 0
    );
    
    if (validMonths.length === 0) return null;
    
    return {
      labels: validMonths,
      datasets: [
        {
          label: 'Principal Payments',
          data: validMonths.map(month => Number(monthlyData[month].principal.toFixed(2))),
          backgroundColor: '#28a745',
          borderColor: '#1e7e34',
          borderWidth: 1
        },
        {
          label: 'Interest & Fees',
          data: validMonths.map(month => Number(monthlyData[month].interest.toFixed(2))),
          backgroundColor: '#dc3545',
          borderColor: '#c82333',
          borderWidth: 1
        }
      ]
    };
  };

  if (loading) {
    return (
      <div style={{ 
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
        <p>Loading Payment Simulator...</p>
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

  if (!simulationState) {
    return (
      <div style={{ 
        padding: '40px',
        textAlign: 'center',
        background: '#f8f9fa',
        borderRadius: '12px',
        margin: '20px'
      }}>
        <h2 style={{ color: '#e74c3c', marginBottom: '20px' }}>⚠️ No Data Available</h2>
        <p style={{ fontSize: '16px', marginBottom: '20px', color: '#6c757d' }}>
          {message || 'Please complete your debt analysis in the first tab to use the Payment Simulator.'}
        </p>
        <button 
          onClick={loadDataFromFirstTab}
          style={{
            padding: '12px 24px',
            background: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          🔄 Retry Loading Data
        </button>
      </div>
    );
  }

  const debtChart = generateDebtChart();
  const paymentChart = generatePaymentChart();
  const paymentPlan = calculateNextPayment(simulationState);
  const totalDebt = simulationState.debts.reduce((sum, debt) => sum + debt.balance, 0);
  const totalPaid = simulationState.totalInterestPaid + simulationState.totalPrincipalPaid;

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px', color: '#2c3e50' }}>
        🎯 Payment Simulator
      </h1>

      {message && (
        <div style={{
          padding: '12px 20px',
          marginBottom: '20px',
          background: message.includes('❌') ? '#f8d7da' : '#d4edda',
          color: message.includes('❌') ? '#721c24' : '#155724',
          border: `1px solid ${message.includes('❌') ? '#f5c6cb' : '#c3e6cb'}`,
          borderRadius: '8px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>{message}</span>
          <button 
            onClick={() => setMessage('')}
            style={{ 
              background: 'none', 
              border: 'none', 
              fontSize: '18px', 
              cursor: 'pointer',
              color: 'inherit'
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* Current Status */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '20px', 
        marginBottom: '30px' 
      }}>
        <div style={{ 
          background: '#fff', 
          padding: '20px', 
          borderRadius: '12px', 
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#e74c3c' }}>Current Month</h3>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#2c3e50' }}>
            {simulationState.currentMonth}
          </div>
        </div>
        <div style={{ 
          background: '#fff', 
          padding: '20px', 
          borderRadius: '12px', 
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#e74c3c' }}>Total Debt</h3>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#2c3e50' }}>
            ${totalDebt.toLocaleString()}
          </div>
        </div>
        <div style={{ 
          background: '#fff', 
          padding: '20px', 
          borderRadius: '12px', 
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#28a745' }}>Monthly Budget</h3>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#2c3e50' }}>
            ${simulationState.monthlyBudget.toLocaleString()}
          </div>
        </div>
        <div style={{ 
          background: '#fff', 
          padding: '20px', 
          borderRadius: '12px', 
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#17a2b8' }}>Strategy</h3>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2c3e50' }}>
            👤 Manual Payment Choices
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ 
        background: '#fff', 
        padding: '25px', 
        borderRadius: '12px', 
        marginBottom: '30px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ margin: '0 0 20px 0', color: '#2c3e50' }}>💳 Payment Actions</h2>
        
        {paymentPlan && (
          <div style={{ 
            marginBottom: '20px', 
            padding: '20px', 
            background: paymentPlan.hasPastDue ? '#fff3cd' : '#f8f9fa', 
            borderRadius: '8px',
            border: paymentPlan.hasPastDue ? '2px solid #ffc107' : '1px solid #dee2e6'
          }}>
            <h4 style={{ margin: '0 0 15px 0', color: paymentPlan.hasPastDue ? '#856404' : '#495057' }}>
              {paymentPlan.hasPastDue ? '⚠️ CATCH-UP PAYMENT REQUIRED' : '💡 Next Suggested Payment:'}
            </h4>
            
            {paymentPlan.hasPastDue && (
              <div style={{ marginBottom: '15px', padding: '15px', background: '#f8d7da', borderRadius: '6px', color: '#721c24' }}>
                <strong>⚠️ Delinquent Accounts Detected!</strong><br />
                <div style={{ margin: '10px 0', fontSize: '14px', lineHeight: '1.4' }}>
                  <strong>Breakdown:</strong><br />
                  • Past Due (missed payments): <strong>${paymentPlan.totalPastDue.toLocaleString()}</strong><br />
                  • Current Month Minimums: <strong>${(paymentPlan.totalRequired - paymentPlan.totalPastDue).toLocaleString()}</strong><br />
                  • <strong>Total Required: ${paymentPlan.totalRequired.toLocaleString()}</strong>
                </div>
                <div style={{ fontSize: '12px', fontStyle: 'italic', color: '#856404', marginTop: '8px' }}>
                  💡 When you skip payments, you must catch up on missed amounts PLUS pay current month minimums to avoid further delinquency.
                </div>
              </div>
            )}
            
            {!paymentPlan.canAffordRequired && (
              <div style={{ marginBottom: '15px', padding: '10px', background: '#f8d7da', borderRadius: '6px', color: '#721c24' }}>
                <strong>❌ INSUFFICIENT FUNDS!</strong><br />
                Budget: ${simulationState.monthlyBudget.toLocaleString()} | Required: ${paymentPlan.totalRequired.toLocaleString()}<br />
                Shortfall: <strong>${paymentPlan.shortfall.toLocaleString()}</strong>
              </div>
            )}
            
            <div style={{ margin: '10px 0' }}>
              <strong>Total Payment: ${paymentPlan.totalPayment.toLocaleString()}</strong><br />
              Priority Debt: {paymentPlan.priorityDebt.name} ({(paymentPlan.priorityDebt.interestRate * 100).toFixed(1)}% APR)
              {paymentPlan.priorityDebt.daysPastDue > 0 && (
                <span style={{ color: '#dc3545', marginLeft: '10px' }}>
                  [{paymentPlan.priorityDebt.daysPastDue} days past due]
                </span>
              )}
            </div>
          </div>
        )}
        
        {/* Primary Actions Row */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: paymentPlan?.hasPastDue ? 'repeat(auto-fit, minmax(160px, 1fr))' : 'repeat(auto-fit, minmax(180px, 1fr))', 
          gap: '12px',
          marginBottom: '15px'
        }}>
          {paymentPlan?.hasPastDue ? (
            <>
              {/* Catch-Up Payment Only */}
              <button
                onClick={() => makeCatchUpPayment()}
                disabled={!paymentPlan || simulationState.monthlyBudget < paymentPlan.totalPastDue}
                style={{
                  padding: '15px 16px',
                  background: (paymentPlan && simulationState.monthlyBudget >= paymentPlan.totalPastDue) ? '#ffc107' : '#6c757d',
                  color: (paymentPlan && simulationState.monthlyBudget >= paymentPlan.totalPastDue) ? '#212529' : 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: (paymentPlan && simulationState.monthlyBudget >= paymentPlan.totalPastDue) ? 'pointer' : 'not-allowed',
                  transition: 'all 0.3s ease'
                }}
              >
                💰 Get Current<br />
                <span style={{ fontSize: '12px' }}>(${paymentPlan.totalPastDue.toLocaleString()})</span>
              </button>

              {/* Full Catch-Up + Current */}
              <button
                onClick={makeNextPayment}
                disabled={!paymentPlan || !paymentPlan.canAffordRequired}
                style={{
                  padding: '15px 16px',
                  background: (paymentPlan && paymentPlan.canAffordRequired) ? '#17a2b8' : '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: (paymentPlan && paymentPlan.canAffordRequired) ? 'pointer' : 'not-allowed',
                  transition: 'all 0.3s ease'
                }}
              >
                💳 Full Payment<br />
                <span style={{ fontSize: '12px' }}>(${paymentPlan.totalRequired.toLocaleString()})</span>
              </button>
            </>
          ) : (
            <button
              onClick={makeNextPayment}
              disabled={!paymentPlan}
              style={{
                padding: '15px 20px',
                background: paymentPlan ? '#28a745' : '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: paymentPlan ? 'pointer' : 'not-allowed',
                transition: 'all 0.3s ease'
              }}
            >
              💰 Make All Payments
            </button>
          )}
          
          <button
            onClick={skipNextPayment}
            disabled={!paymentPlan}
            style={{
              padding: '15px 20px',
              background: paymentPlan ? '#dc3545' : '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: paymentPlan ? 'pointer' : 'not-allowed',
              transition: 'all 0.3s ease'
            }}
          >
            ⚠️ Skip All Payments
          </button>
        </div>

        {/* Partial Payment Section */}
        {paymentPlan && (
          <div style={{ 
            background: '#e7f3ff', 
            padding: '20px', 
            borderRadius: '8px',
            marginBottom: '15px',
            border: '2px solid #007bff'
          }}>
            <h4 style={{ margin: '0 0 15px 0', color: '#0056b3' }}>💸 Make Partial Payment</h4>
            <div style={{ marginBottom: '15px', fontSize: '14px', color: '#495057' }}>
              <p style={{ margin: '0 0 10px 0' }}>
                <strong>Can't afford the full ${paymentPlan.totalRequired.toLocaleString()}?</strong> Pay what you can.
              </p>
              <div style={{ fontSize: '12px', color: '#6c757d', fontStyle: 'italic' }}>
                💡 Partial payments are better than skipping entirely. You'll get late fees for unpaid minimums, 
                but less damage than missing all payments.
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 'bold' }}>
                  Available Amount
                </label>
                <input
                  type="number"
                  placeholder={`$0 - $${simulationState.monthlyBudget.toLocaleString()}`}
                  value={partialAmount || ''}
                  onChange={(e) => setPartialAmount(Number(e.target.value))}
                  max={simulationState.monthlyBudget}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #007bff',
                    borderRadius: '6px',
                    fontSize: '16px'
                  }}
                />
              </div>
              <button
                onClick={makePartialPayment}
                disabled={!paymentPlan || partialAmount <= 0 || partialAmount >= paymentPlan.totalRequired}
                style={{
                  padding: '12px 20px',
                  background: (paymentPlan && partialAmount > 0 && partialAmount < paymentPlan.totalRequired) ? '#007bff' : '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: (paymentPlan && partialAmount > 0 && partialAmount < paymentPlan.totalRequired) ? 'pointer' : 'not-allowed',
                  whiteSpace: 'nowrap',
                  minWidth: '140px'
                }}
              >
                💸 Pay Partial
              </button>
            </div>
            
            {partialAmount > 0 && partialAmount < paymentPlan.totalRequired && (
              <div style={{ 
                marginTop: '10px', 
                padding: '10px', 
                background: '#fff3cd', 
                borderRadius: '6px',
                fontSize: '12px',
                color: '#856404'
              }}>
                ⚠️ <strong>Consequence:</strong> ${(paymentPlan.totalRequired - partialAmount).toLocaleString()} shortfall 
                will result in late fees and continued delinquency. Still better than skipping all payments!
              </div>
            )}
          </div>
        )}

        {/* Extra Payment Section */}
        <div style={{ 
          background: paymentPlan?.hasPastDue ? '#fff3cd' : '#f8f9fa', 
          padding: '20px', 
          borderRadius: '8px',
          marginBottom: '15px',
          border: paymentPlan?.hasPastDue ? '2px solid #ffc107' : '1px solid #dee2e6'
        }}>
          <h4 style={{ margin: '0 0 15px 0', color: paymentPlan?.hasPastDue ? '#856404' : '#495057' }}>
            {paymentPlan?.hasPastDue ? '⚠️ Extra Payments Blocked' : '💡 Make Extra Payment'}
          </h4>
          
          {paymentPlan?.hasPastDue ? (
            <div style={{ color: '#856404', fontSize: '14px', lineHeight: '1.5' }}>
              <p style={{ margin: '0 0 15px 0', fontWeight: 'bold' }}>
                ⚠️ You cannot make extra payments while accounts are delinquent.
              </p>
              <p style={{ margin: '0 0 15px 0' }}>
                <strong>Recommended approach:</strong>
              </p>
              <ol style={{ margin: '0 0 15px 20px', paddingLeft: '0' }}>
                <li>First: Pay $<strong>{paymentPlan.totalPastDue.toLocaleString()}</strong> to get current (use "💰 Get Current" button)</li>
                <li>Then: Make extra payments to accelerate debt payoff</li>
              </ol>
              <p style={{ margin: '0', fontSize: '12px', fontStyle: 'italic' }}>
                💡 Think like someone managing debt: Get current first, then focus on paying extra to save interest.
              </p>
            </div>
          ) : (
            <>
              <p style={{ margin: '0 0 15px 0', color: '#6c757d', fontSize: '14px' }}>
                Apply additional money toward your highest priority debt to accelerate payoff
              </p>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 'bold' }}>
                    Extra Payment Amount
                  </label>
                  <input
                    type="number"
                    placeholder="Enter extra payment amount (e.g. 500)"
                    value={advanceAmount || ''}
                    onChange={(e) => setAdvanceAmount(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #dee2e6',
                      borderRadius: '6px',
                      fontSize: '16px'
                    }}
                  />
                </div>
                <button
                  onClick={makeAdvancePayment}
                  disabled={!paymentPlan || advanceAmount <= 0}
                  style={{
                    padding: '12px 20px',
                    background: (paymentPlan && advanceAmount > 0) ? '#17a2b8' : '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: (paymentPlan && advanceAmount > 0) ? 'pointer' : 'not-allowed',
                    whiteSpace: 'nowrap',
                    minWidth: '140px'
                  }}
                >
                  🚀 Apply Payment
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Simulation Control Section */}
      <div style={{ 
        background: '#fff', 
        padding: '20px', 
        borderRadius: '12px', 
        marginBottom: '30px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        textAlign: 'center'
      }}>
        <h3 style={{ margin: '0 0 15px 0', color: '#495057' }}>⚙️ Simulation Controls</h3>
        <button
          onClick={resetSimulation}
          style={{
            padding: '12px 30px',
            background: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
        >
          🔄 Reset Simulation to Original Data
        </button>
        <p style={{ margin: '10px 0 0 0', fontSize: '14px', color: '#6c757d' }}>
          This will restore all debts to their original balances and reset the simulation
        </p>
      </div>

      {/* Charts Section */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
        gap: '30px', 
        marginBottom: '30px' 
      }}>
        {/* Debt Breakdown Pie Chart */}
        {debtChart && (
          <div style={{ 
            background: '#fff', 
            padding: '25px', 
            borderRadius: '12px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ margin: '0 0 20px 0', textAlign: 'center', color: '#2c3e50' }}>
              📊 Current Debt Breakdown
            </h3>
            <div style={{ height: '300px', display: 'flex', justifyContent: 'center' }}>
              <Pie 
                data={debtChart} 
                options={{ 
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: {
                        padding: 20,
                        usePointStyle: true
                      }
                    }
                  }
                }} 
              />
            </div>
          </div>
        )}

        {/* Payment History Bar Chart */}
        {paymentChart && (
          <div style={{ 
            background: '#fff', 
            padding: '25px', 
            borderRadius: '12px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ margin: '0 0 20px 0', textAlign: 'center', color: '#2c3e50' }}>
              📈 Payment History
            </h3>
            <div style={{ height: '300px' }}>
              <Bar 
                data={paymentChart} 
                options={{ 
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    x: {
                      stacked: true,
                    },
                    y: {
                      stacked: true,
                    }
                  },
                  plugins: {
                    legend: {
                      position: 'top',
                    },
                    title: {
                      display: true,
                      text: 'Principal vs Interest Payments'
                    }
                  }
                }} 
              />
            </div>
          </div>
        )}
      </div>

      {/* Payment Summary */}
      {totalPaid > 0 && (
        <div style={{ 
          background: '#fff', 
          padding: '25px', 
          borderRadius: '12px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#2c3e50' }}>📋 Simulation Summary</h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '20px' 
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>
                ${simulationState.totalPrincipalPaid.toLocaleString()}
              </div>
              <div style={{ color: '#6c757d' }}>Total Principal Paid</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc3545' }}>
                ${simulationState.totalInterestPaid.toLocaleString()}
              </div>
              <div style={{ color: '#6c757d' }}>Total Interest Paid</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#17a2b8' }}>
                {simulationState ? new Set(simulationState.paymentHistory.map(h => h.month)).size : 0}
              </div>
              <div style={{ color: '#6c757d' }}>Payment Actions Taken</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AutomationDashboard;