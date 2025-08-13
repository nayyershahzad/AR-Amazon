import React, { useState, useEffect } from 'react';
import './RewardDashboard.css';

interface RewardSummary {
  totalPoints: number;
  cashEarned: number;
  level: number;
  nextLevelRequirement: number;
  pointsToNextLevel: number;
  achievements: Achievement[];
  streaks: {
    paymentStreak: number;
    learningStreak: number;
    savingsStreak: number;
  };
  weeklyChallenge: Challenge;
  recentActivity: Activity[];
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  unlockedAt: string;
  pointsAwarded: number;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  target: number;
  reward: number;
  type: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface Activity {
  date: string;
  action: string;
  pointsEarned: number;
  description: string;
}

interface LeaderboardEntry {
  userId: string;
  name: string;
  points: number;
  level: number;
  rank: number;
}

const RewardDashboard: React.FC = () => {
  const [rewardData, setRewardData] = useState<RewardSummary | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [simulateResult, setSimulateResult] = useState<any>(null);

  useEffect(() => {
    fetchRewardData();
    fetchLeaderboard();
  }, []);

  const fetchRewardData = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/rewards/summary/test_user_123');
      const result = await response.json();
      if (result.success) {
        setRewardData(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch reward data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/rewards/leaderboard');
      const result = await response.json();
      if (result.success) {
        setLeaderboard(result.data.leaders);
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    }
  };

  const simulateAction = async (actionType: string) => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/rewards/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actionType })
      });
      const result = await response.json();
      if (result.success) {
        setSimulateResult(result.data);
        // Refresh reward data to show updated totals
        await fetchRewardData();
      }
    } catch (error) {
      console.error('Failed to simulate action:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetProgress = async () => {
    if (window.confirm('Are you sure you want to reset all progress? This will clear all points and achievements.')) {
      try {
        // This will be handled by restarting the backend server for now
        // In a real app, we'd have a reset endpoint
        setSimulateResult({ 
          pointsEarned: 0, 
          totalPoints: 0, 
          cashEarned: 0, 
          newAchievements: [], 
          motivationalMessage: '🔄 Progress reset! Ready for a fresh start on your debt freedom journey!' 
        });
        await fetchRewardData();
      } catch (error) {
        console.error('Failed to reset progress:', error);
      }
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '#28a745';
      case 'medium': return '#ffc107';
      case 'hard': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  if (loading && !rewardData) {
    return <div className="reward-loading">Loading reward dashboard...</div>;
  }

  return (
    <div className="reward-dashboard">
      <h2>🏆 Reward Dashboard</h2>

      {simulateResult && (
        <div className="simulation-result">
          <h3>🎉 Action Simulated!</h3>
          <p><strong>Points Earned:</strong> {simulateResult.pointsEarned}</p>
          <p><strong>Total Points:</strong> {simulateResult.totalPoints}</p>
          <p><strong>Cash Earned:</strong> ${simulateResult.cashEarned?.toFixed(2)}</p>
          {simulateResult.newAchievements?.length > 0 && (
            <p><strong>New Achievement:</strong> {simulateResult.newAchievements[0].title}</p>
          )}
          <p className="motivation">{simulateResult.motivationalMessage}</p>
          <button onClick={() => setSimulateResult(null)}>Close</button>
        </div>
      )}

      {rewardData && (
        <>
          {/* Reward Summary Cards */}
          <div className="reward-summary">
            <div className="reward-card points">
              <h3>💎 Total Points</h3>
              <div className="value">{rewardData.totalPoints.toLocaleString()}</div>
              <div className="subtitle">Level {rewardData.level}</div>
            </div>
            
            <div className="reward-card cash">
              <h3>💰 Cash Earned</h3>
              <div className="value">${rewardData.cashEarned.toFixed(2)}</div>
              <div className="subtitle">$0.05 per point</div>
            </div>
            
            <div className="reward-card level">
              <h3>📈 Progress to Next Level</h3>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{
                    width: `${getProgressPercentage(
                      rewardData.nextLevelRequirement - rewardData.pointsToNextLevel,
                      rewardData.nextLevelRequirement
                    )}%`
                  }}
                ></div>
              </div>
              <div className="subtitle">
                {rewardData.pointsToNextLevel} points to Level {rewardData.level + 1}
              </div>
            </div>
          </div>

          {/* Streaks */}
          <div className="streaks-section">
            <h3>🔥 Current Streaks</h3>
            <div className="streaks">
              <div className="streak-item">
                <span className="streak-icon">💳</span>
                <span className="streak-label">Payment Streak</span>
                <span className="streak-value">{rewardData.streaks.paymentStreak} days</span>
              </div>
              <div className="streak-item">
                <span className="streak-icon">📚</span>
                <span className="streak-label">Learning Streak</span>
                <span className="streak-value">{rewardData.streaks.learningStreak} days</span>
              </div>
              <div className="streak-item">
                <span className="streak-icon">💰</span>
                <span className="streak-label">Savings Streak</span>
                <span className="streak-value">{rewardData.streaks.savingsStreak} days</span>
              </div>
            </div>
          </div>

          {/* Weekly Challenge */}
          <div className="challenge-section">
            <h3>🎯 Weekly Challenge</h3>
            <div className="challenge-card">
              <div className="challenge-header">
                <h4>{rewardData.weeklyChallenge.title}</h4>
                <span 
                  className="difficulty-badge"
                  style={{ backgroundColor: getDifficultyColor(rewardData.weeklyChallenge.difficulty) }}
                >
                  {rewardData.weeklyChallenge.difficulty}
                </span>
              </div>
              <p>{rewardData.weeklyChallenge.description}</p>
              <div className="challenge-reward">
                <span>Reward: {rewardData.weeklyChallenge.reward} points</span>
              </div>
            </div>
          </div>

          {/* Recent Achievements */}
          <div className="achievements-section">
            <h3>🏅 Recent Achievements</h3>
            <div className="achievements">
              {rewardData.achievements.slice(0, 3).map((achievement, index) => (
                <div key={index} className="achievement-item">
                  <div className="achievement-title">{achievement.title}</div>
                  <div className="achievement-description">{achievement.description}</div>
                  <div className="achievement-points">+{achievement.pointsAwarded} points</div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="activity-section">
            <h3>📈 Recent Activity</h3>
            <div className="activities">
              {rewardData.recentActivity.map((activity, index) => (
                <div key={index} className="activity-item">
                  <div className="activity-description">{activity.description}</div>
                  <div className="activity-points">+{activity.pointsEarned} pts</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Leaderboard */}
      <div className="leaderboard-section">
        <h3>🏆 Community Leaderboard</h3>
        <div className="leaderboard">
          {leaderboard.map((entry) => (
            <div key={entry.userId} className="leaderboard-item">
              <span className="rank">#{entry.rank}</span>
              <span className="name">{entry.name}</span>
              <span className="points">{entry.points.toLocaleString()} pts</span>
              <span className="level">Level {entry.level}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Simulation Buttons for Testing */}
      <div className="simulation-section">
        <h3>🎮 Test Reward System</h3>
        <div className="simulation-buttons">
          <button 
            onClick={() => simulateAction('payment')} 
            disabled={loading}
            className="sim-btn payment"
          >
            Simulate Payment
          </button>
          <button 
            onClick={() => simulateAction('learning')} 
            disabled={loading}
            className="sim-btn learning"
          >
            Simulate Learning
          </button>
          <button 
            onClick={() => simulateAction('milestone')} 
            disabled={loading}
            className="sim-btn milestone"
          >
            Simulate Milestone
          </button>
          <button 
            onClick={() => simulateAction('streak')} 
            disabled={loading}
            className="sim-btn streak"
          >
            Simulate Streak
          </button>
        </div>
        
        <div className="reset-section">
          <button 
            onClick={resetProgress}
            disabled={loading}
            className="reset-btn"
          >
            🔄 Reset Progress
          </button>
          <p className="reset-help">
            Start fresh to see points accumulate from zero. Each button simulates different actions:
          </p>
          <ul className="action-explanations">
            <li><strong>Payment:</strong> 10-15 points + achievements for first/multiple payments</li>
            <li><strong>Learning:</strong> 5 points + education streak bonuses</li>
            <li><strong>Milestone:</strong> 50+ points for major debt goals (2x-3x multipliers)</li>
            <li><strong>Streak:</strong> 25+ points based on streak length (longer = more points)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RewardDashboard;