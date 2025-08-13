import React, { useState } from 'react';
import DebtAnalyzer from './components/DebtAnalyzer';
import RewardDashboard from './components/RewardDashboard';
import AutomationDashboard from './components/AutomationDashboard';
import BehavioralDashboard from './components/BehavioralDashboard';
import EducationDashboard from './components/EducationDashboard';
import SocialDashboard from './components/SocialDashboard';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState<'analyzer' | 'rewards' | 'automation' | 'behavioral' | 'education' | 'social' | 'analytics'>('analyzer');

  return (
    <div className="App">
      <nav className="app-nav">
        <div className="nav-brand">
          <h1>💰 DebtWise</h1>
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
            className={`nav-tab ${activeTab === 'rewards' ? 'active' : ''}`}
            onClick={() => setActiveTab('rewards')}
          >
            🏆 Rewards
          </button>
          <button 
            className={`nav-tab ${activeTab === 'automation' ? 'active' : ''}`}
            onClick={() => setActiveTab('automation')}
          >
            🤖 Automation
          </button>
          <button 
            className={`nav-tab ${activeTab === 'behavioral' ? 'active' : ''}`}
            onClick={() => setActiveTab('behavioral')}
          >
            🧠 Behavioral
          </button>
          <button 
            className={`nav-tab ${activeTab === 'education' ? 'active' : ''}`}
            onClick={() => setActiveTab('education')}
          >
            🎓 Education
          </button>
          <button 
            className={`nav-tab ${activeTab === 'social' ? 'active' : ''}`}
            onClick={() => setActiveTab('social')}
          >
            🌟 Social
          </button>
          <button 
            className={`nav-tab ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            📈 Analytics
          </button>
        </div>
      </nav>

      <main className="app-content">
        {activeTab === 'analyzer' && <DebtAnalyzer />}
        {activeTab === 'rewards' && <RewardDashboard />}
        {activeTab === 'automation' && <AutomationDashboard />}
        {activeTab === 'behavioral' && <BehavioralDashboard />}
        {activeTab === 'education' && <EducationDashboard />}
        {activeTab === 'social' && <SocialDashboard />}
        {activeTab === 'analytics' && <AnalyticsDashboard />}
      </main>
    </div>
  );
}

export default App;
