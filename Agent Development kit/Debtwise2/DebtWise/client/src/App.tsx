import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DebtAnalyzer from './components/DebtAnalyzer';
import AutomationDashboard from './components/AutomationDashboard';
import BehavioralDashboard from './components/BehavioralDashboard';
import LoginPage from './components/LoginPage';
import AuthCallback from './components/AuthCallback';
import useAuth from './hooks/useAuth';
import './App.css';

// Protected Dashboard Component
const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'analyzer' | 'automation' | 'behavioral'>('analyzer');
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <div className="App">
      <nav className="app-nav">
        <div className="nav-brand">
          <h1>Debtwise</h1>
          <span className="nav-subtitle">AI-Powered Debt Freedom</span>
        </div>
        <div className="nav-tabs">
          <button 
            className={`nav-tab ${activeTab === 'analyzer' ? 'active' : ''}`}
            onClick={() => setActiveTab('analyzer')}
          >
            📊 Debt Analysis
          </button>
          <button 
            className={`nav-tab ${activeTab === 'automation' ? 'active' : ''}`}
            onClick={() => setActiveTab('automation')}
          >
            🎯 Payment Simulator
          </button>
          <button 
            className={`nav-tab ${activeTab === 'behavioral' ? 'active' : ''}`}
            onClick={() => setActiveTab('behavioral')}
          >
            🧠 Behavioral Analysis
          </button>
        </div>
        <div className="nav-user">
          {user?.picture && (
            <img src={user.picture} alt={user.name} className="user-avatar" />
          )}
          <span className="user-name">{user?.name}</span>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </nav>

      <main className="app-content">
        {activeTab === 'analyzer' && <DebtAnalyzer key={activeTab} />}
        {activeTab === 'automation' && <AutomationDashboard />}
        {activeTab === 'behavioral' && <BehavioralDashboard />}
      </main>
    </div>
  );
};

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/" 
          element={<Navigate to="/dashboard" replace />} 
        />
      </Routes>
    </Router>
  );
}

export default App;
