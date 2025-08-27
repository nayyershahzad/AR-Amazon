import React from 'react';
import GoogleLoginButton from './GoogleLoginButton';
import './LoginPage.css';

const LoginPage: React.FC = () => {
  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1>Welcome to Debtwise</h1>
          <p>Your Personal AI Debt Management Coach</p>
          <div className="tagline">
            Transform your financial future with intelligent debt strategies and behavioral insights
          </div>
        </div>
        
        <div className="login-content">
          <div className="features-list">
            <div className="feature">
              <div className="feature-icon">📊</div>
              <div className="feature-text">
                <h3>Smart Debt Analysis</h3>
                <p>AI-powered analysis of your debts with personalized Avalanche & Snowball strategies</p>
              </div>
            </div>
            
            <div className="feature">
              <div className="feature-icon">🎯</div>
              <div className="feature-text">
                <h3>Payment Simulator</h3>
                <p>Interactive payment simulation to test different scenarios and see real outcomes</p>
              </div>
            </div>
            
            <div className="feature">
              <div className="feature-icon">🧠</div>
              <div className="feature-text">
                <h3>Behavioral Coaching</h3>
                <p>Understand your financial personality with achievement badges and personalized strategies</p>
              </div>
            </div>
            
            <div className="feature">
              <div className="feature-icon">🏅</div>
              <div className="feature-text">
                <h3>Achievement System</h3>
                <p>Track progress with beautiful badges that reflect your financial discipline and growth</p>
              </div>
            </div>
            
            <div className="feature">
              <div className="feature-icon">🤖</div>
              <div className="feature-text">
                <h3>AI-Powered Insights</h3>
                <p>Get personalized recommendations based on your spending patterns and payment behavior</p>
              </div>
            </div>
            
          </div>
          
          <div className="login-form">
            <h2>Get Started Now</h2>
            <p className="login-description">
              Access your personal AI debt coach with your Google account
            </p>
            
            <GoogleLoginButton />
            
            <div className="benefits">
              <div className="benefit-item">
                ✨ Instant setup - no forms required
              </div>
              <div className="benefit-item">
                🎯 Personalized debt strategies
              </div>
              <div className="benefit-item">
                🧠 Smart behavioral insights
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;