import React, { useState, useEffect } from 'react';
import './EducationDashboard.css';

interface UserEducationProfile {
  userId: string;
  currentLevel: number;
  totalPoints: number;
  completedModules: string[];
  inProgressModules: string[];
  badges: Badge[];
  certificates: Certificate[];
  learningStreak: number;
  preferredLearningStyle: string;
  weeklyGoal: number;
  dailyGoal: number;
  achievements: Achievement[];
  personalizedPath: LearningPath;
  createdAt: string;
  lastActiveAt: string;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  earnedAt?: string;
}

interface Certificate {
  id: string;
  name: string;
  description: string;
  issuer: string;
  validUntil?: string;
  credentialUrl?: string;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: string;
  earnedAt: string;
  points: number;
  rarity: string;
}

interface LearningPath {
  id: string;
  name: string;
  description: string;
  recommendedModules: string[];
  estimatedDuration: number;
  difficulty: string;
  personalizedFor: string[];
}

interface EducationModule {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number;
  prerequisites: string[];
  lessons: Lesson[];
  quiz: Quiz;
  rewards: ModuleReward;
  completionRate: number;
  averageRating: number;
  isLocked: boolean;
  unlockCriteria?: UnlockCriteria;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface Lesson {
  id: string;
  title: string;
  estimatedTime: number;
  isCompleted: boolean;
}

interface Quiz {
  id: string;
  questions: any[];
  passingScore: number;
  maxAttempts: number;
}

interface ModuleReward {
  points: number;
  badges: Badge[];
  certificates: Certificate[];
  unlocks: string[];
}

interface UnlockCriteria {
  requiredModules: string[];
  requiredPoints: number;
  requiredLevel: number;
}

interface EducationAnalytics {
  userId: string;
  period: string;
  metrics: {
    totalTimeSpent: number;
    modulesCompleted: number;
    lessonsCompleted: number;
    quizzesCompleted: number;
    averageQuizScore: number;
    streakDays: number;
    pointsEarned: number;
    badgesEarned: number;
    learningVelocity: number;
    focusScore: number;
    retentionRate: number;
    preferredLearningTime: string;
    strongestTopics: string[];
    improvementAreas: string[];
  };
  recommendations: LearningRecommendation[];
}

interface LearningRecommendation {
  type: string;
  title: string;
  description: string;
  action: string;
  priority: 'low' | 'medium' | 'high';
  moduleId?: string;
  estimatedImpact: string;
}

interface EducationDashboardData {
  profile: UserEducationProfile;
  analytics: EducationAnalytics;
  availableModules: EducationModule[];
}

const EducationDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<EducationDashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string>('');
  const [selectedModule, setSelectedModule] = useState<EducationModule | null>(null);

  useEffect(() => {
    loadEducationData();
  }, []);

  const loadEducationData = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/education/profile/demo_user_123');
      const result = await response.json();
      
      if (result.success) {
        const [analyticsRes, modulesRes] = await Promise.all([
          fetch('http://localhost:3001/api/education/analytics/demo_user_123'),
          fetch('http://localhost:3001/api/education/modules/demo_user_123')
        ]);
        
        const analyticsData = await analyticsRes.json();
        const modulesData = await modulesRes.json();
        
        if (analyticsData.success && modulesData.success) {
          setDashboardData({
            profile: result.data,
            analytics: analyticsData.data,
            availableModules: modulesData.data
          });
        }
      }
    } catch (error) {
      console.error('Failed to load education data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createDemoEducation = async () => {
    setLoading(true);
    setMessage('');
    try {
      const response = await fetch('http://localhost:3001/api/education/demo/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      const result = await response.json();
      
      if (result.success) {
        setDashboardData(result.data);
        setMessage('🎓 Education system initialized! Your personalized learning journey is ready.');
      } else {
        setMessage(`❌ Error: ${result.error}`);
      }
    } catch (error) {
      setMessage('❌ Failed to create education system');
      console.error('Failed to create demo education:', error);
    } finally {
      setLoading(false);
    }
  };

  const simulateActivity = async (activityType: string) => {
    setLoading(true);
    setMessage('');
    try {
      let endpoint = '';
      let body = {};
      
      switch (activityType) {
        case 'complete_lesson':
          endpoint = '/api/education/demo/complete-lesson';
          body = { timeSpent: 1800 }; // 30 minutes
          break;
        case 'take_quiz':
          endpoint = '/api/education/demo/take-quiz';
          body = { score: 85 };
          break;
        case 'study_session':
          endpoint = '/api/education/demo/study-session';
          body = { duration: 25 };
          break;
        default:
          throw new Error('Unknown activity type');
      }
      
      const response = await fetch(`http://localhost:3001${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const result = await response.json();
      
      if (result.success) {
        setMessage(`✅ ${result.message}`);
        await loadEducationData(); // Refresh data
      } else {
        setMessage(`❌ Error: ${result.error}`);
      }
    } catch (error) {
      setMessage(`❌ Failed to simulate ${activityType}`);
      console.error(`Failed to simulate ${activityType}:`, error);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      beginner: '#28a745',
      intermediate: '#ffc107',
      advanced: '#dc3545'
    };
    return colors[difficulty as keyof typeof colors] || '#6c757d';
  };

  const getRarityColor = (rarity: string) => {
    const colors = {
      common: '#6c757d',
      rare: '#007bff',
      epic: '#6f42c1',
      legendary: '#fd7e14'
    };
    return colors[rarity as keyof typeof colors] || '#6c757d';
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      debt_basics: '📚',
      budgeting: '💰',
      investment: '📈',
      credit_management: '💳',
      emergency_fund: '🛡️',
      tax_planning: '📊'
    };
    return icons[category as keyof typeof icons] || '📖';
  };

  if (loading && !dashboardData) {
    return <div className="education-loading">Setting up your learning environment...</div>;
  }

  return (
    <div className="education-dashboard">
      <h2>🎓 Financial Education Academy</h2>
      
      {message && (
        <div className="education-message">
          <p>{message}</p>
          <button onClick={() => setMessage('')} className="close-message">×</button>
        </div>
      )}

      {/* Setup Section */}
      <div className="setup-section">
        <h3>📚 Learning Hub</h3>
        <p>Master financial concepts through interactive lessons, quizzes, and gamified learning experiences tailored to your debt payoff journey.</p>
        <div className="setup-buttons">
          <button 
            onClick={createDemoEducation} 
            disabled={loading}
            className="setup-btn primary"
          >
            {loading ? 'Initializing...' : '🚀 Initialize Education System'}
          </button>
        </div>
      </div>

      {dashboardData && (
        <>
          {/* Profile Overview */}
          <div className="profile-section">
            <h3>👨‍🎓 Learning Profile</h3>
            <div className="profile-grid">
              <div className="profile-card">
                <div className="profile-icon">🏆</div>
                <h4>Current Level</h4>
                <div className="profile-value level">{dashboardData.profile.currentLevel}</div>
              </div>
              <div className="profile-card">
                <div className="profile-icon">⭐</div>
                <h4>Total Points</h4>
                <div className="profile-value points">{dashboardData.profile.totalPoints.toLocaleString()}</div>
              </div>
              <div className="profile-card">
                <div className="profile-icon">🔥</div>
                <h4>Learning Streak</h4>
                <div className="profile-value streak">{dashboardData.profile.learningStreak} days</div>
              </div>
              <div className="profile-card">
                <div className="profile-icon">✅</div>
                <h4>Completed Modules</h4>
                <div className="profile-value completed">{dashboardData.profile.completedModules.length}</div>
              </div>
            </div>
          </div>

          {/* Activity Simulation */}
          <div className="simulation-section">
            <h3>🎮 Learning Activities</h3>
            <p>Simulate different learning activities to see progress and rewards:</p>
            <div className="simulation-buttons">
              <button 
                onClick={() => simulateActivity('complete_lesson')} 
                disabled={loading}
                className="sim-btn lesson"
              >
                📖 Complete Lesson
              </button>
              <button 
                onClick={() => simulateActivity('take_quiz')} 
                disabled={loading}
                className="sim-btn quiz"
              >
                🧠 Take Quiz
              </button>
              <button 
                onClick={() => simulateActivity('study_session')} 
                disabled={loading}
                className="sim-btn session"
              >
                ⏱️ Study Session
              </button>
            </div>
          </div>

          {/* Learning Analytics */}
          <div className="analytics-section">
            <h3>📊 Learning Analytics</h3>
            <div className="analytics-grid">
              <div className="analytics-card">
                <div className="card-header">
                  <span className="card-icon">⏱️</span>
                  <h4>Time Spent Learning</h4>
                </div>
                <div className="card-value">{dashboardData.analytics.metrics.totalTimeSpent} minutes</div>
                <div className="card-subtitle">Total study time</div>
              </div>
              <div className="analytics-card">
                <div className="card-header">
                  <span className="card-icon">🎯</span>
                  <h4>Quiz Performance</h4>
                </div>
                <div className="card-value">{Math.round(dashboardData.analytics.metrics.averageQuizScore)}%</div>
                <div className="card-subtitle">Average quiz score</div>
              </div>
              <div className="analytics-card">
                <div className="card-header">
                  <span className="card-icon">🚀</span>
                  <h4>Learning Velocity</h4>
                </div>
                <div className="card-value">{dashboardData.analytics.metrics.learningVelocity.toFixed(1)}</div>
                <div className="card-subtitle">Modules per week</div>
              </div>
              <div className="analytics-card">
                <div className="card-header">
                  <span className="card-icon">🎯</span>
                  <h4>Focus Score</h4>
                </div>
                <div className="card-value">{dashboardData.analytics.metrics.focusScore}%</div>
                <div className="card-subtitle">Engagement level</div>
              </div>
            </div>
          </div>

          {/* Available Modules */}
          <div className="modules-section">
            <h3>📚 Available Courses</h3>
            <div className="modules-grid">
              {dashboardData.availableModules.slice(0, 6).map((module) => (
                <div 
                  key={module.id} 
                  className={`module-card ${module.difficulty} ${module.isLocked ? 'locked' : ''}`}
                  onClick={() => !module.isLocked && setSelectedModule(module)}
                >
                  <div className="module-header">
                    <span className="module-icon">{getCategoryIcon(module.category)}</span>
                    <div className="module-meta">
                      <span className={`difficulty-badge ${module.difficulty}`}>
                        {module.difficulty.toUpperCase()}
                      </span>
                      {module.isLocked && <span className="lock-icon">🔒</span>}
                    </div>
                  </div>
                  <h4 className="module-title">{module.title}</h4>
                  <p className="module-description">{module.description}</p>
                  <div className="module-details">
                    <div className="detail-item">
                      <span>⏱️ {module.estimatedTime} min</span>
                    </div>
                    <div className="detail-item">
                      <span>📝 {module.lessons.length} lessons</span>
                    </div>
                    <div className="detail-item">
                      <span>⭐ {module.rewards.points} points</span>
                    </div>
                  </div>
                  {module.isLocked && module.unlockCriteria && (
                    <div className="unlock-requirements">
                      <small>
                        Requires: Level {module.unlockCriteria.requiredLevel}, 
                        {module.unlockCriteria.requiredPoints} points
                      </small>
                    </div>
                  )}
                  {!module.isLocked && (
                    <button className="module-btn">
                      {dashboardData.profile.completedModules.includes(module.id) ? 
                        '✅ Completed' : 
                        dashboardData.profile.inProgressModules.includes(module.id) ? 
                        '📖 Continue' : 
                        '🚀 Start Course'
                      }
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Badges & Achievements */}
          {dashboardData.profile.badges.length > 0 && (
            <div className="badges-section">
              <h3>🏆 Badges & Achievements</h3>
              <div className="badges-grid">
                {dashboardData.profile.badges.map((badge) => (
                  <div key={badge.id} className={`badge-card ${badge.rarity}`}>
                    <div className="badge-icon">{badge.icon}</div>
                    <h4>{badge.name}</h4>
                    <p>{badge.description}</p>
                    <div className={`badge-rarity ${badge.rarity}`}>
                      {badge.rarity.toUpperCase()}
                    </div>
                    {badge.earnedAt && (
                      <div className="badge-earned">
                        Earned: {new Date(badge.earnedAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                ))}
                {dashboardData.profile.achievements.map((achievement) => (
                  <div key={achievement.id} className={`achievement-card ${achievement.rarity}`}>
                    <div className="achievement-icon">{achievement.icon}</div>
                    <h4>{achievement.name}</h4>
                    <p>{achievement.description}</p>
                    <div className="achievement-points">+{achievement.points} points</div>
                    <div className="achievement-earned">
                      {new Date(achievement.earnedAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Learning Recommendations */}
          {dashboardData.analytics.recommendations.length > 0 && (
            <div className="recommendations-section">
              <h3>💡 Learning Recommendations</h3>
              <div className="recommendations-grid">
                {dashboardData.analytics.recommendations.map((rec, index) => (
                  <div key={index} className={`recommendation-card ${rec.priority}`}>
                    <div className="rec-header">
                      <h4>{rec.title}</h4>
                      <span className={`priority-badge ${rec.priority}`}>
                        {rec.priority.toUpperCase()}
                      </span>
                    </div>
                    <p className="rec-description">{rec.description}</p>
                    <div className="rec-impact">
                      <strong>Impact:</strong> {rec.estimatedImpact}
                    </div>
                    <button className="rec-action-btn">
                      {rec.action}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certificates */}
          {dashboardData.profile.certificates.length > 0 && (
            <div className="certificates-section">
              <h3>🎖️ Certificates Earned</h3>
              <div className="certificates-grid">
                {dashboardData.profile.certificates.map((cert) => (
                  <div key={cert.id} className="certificate-card">
                    <div className="cert-icon">🎖️</div>
                    <h4>{cert.name}</h4>
                    <p>{cert.description}</p>
                    <div className="cert-issuer">Issued by: {cert.issuer}</div>
                    {cert.credentialUrl && (
                      <button className="cert-view-btn">View Credential</button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Module Details Modal */}
      {selectedModule && (
        <div className="module-modal-overlay" onClick={() => setSelectedModule(null)}>
          <div className="module-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-section">
                <span className="modal-icon">{getCategoryIcon(selectedModule.category)}</span>
                <div>
                  <h3>{selectedModule.title}</h3>
                  <span className={`difficulty-badge ${selectedModule.difficulty}`}>
                    {selectedModule.difficulty.toUpperCase()}
                  </span>
                </div>
              </div>
              <button onClick={() => setSelectedModule(null)} className="close-modal">×</button>
            </div>
            <div className="modal-content">
              <p className="module-full-description">{selectedModule.description}</p>
              
              <div className="module-info-grid">
                <div className="info-item">
                  <strong>Duration:</strong> {selectedModule.estimatedTime} minutes
                </div>
                <div className="info-item">
                  <strong>Lessons:</strong> {selectedModule.lessons.length}
                </div>
                <div className="info-item">
                  <strong>Quiz Questions:</strong> {selectedModule.quiz.questions.length}
                </div>
                <div className="info-item">
                  <strong>Points Reward:</strong> {selectedModule.rewards.points}
                </div>
              </div>

              <div className="lessons-preview">
                <h4>Course Lessons:</h4>
                <div className="lessons-list">
                  {selectedModule.lessons.map((lesson, index) => (
                    <div key={lesson.id} className="lesson-item">
                      <span className="lesson-number">{index + 1}</span>
                      <div className="lesson-info">
                        <h5>{lesson.title}</h5>
                        <small>{lesson.estimatedTime} min</small>
                      </div>
                      {lesson.isCompleted && <span className="lesson-completed">✅</span>}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rewards-preview">
                <h4>Completion Rewards:</h4>
                <div className="rewards-list">
                  <div className="reward-item">
                    <span>⭐ {selectedModule.rewards.points} Points</span>
                  </div>
                  {selectedModule.rewards.badges.map((badge) => (
                    <div key={badge.id} className="reward-item">
                      <span>{badge.icon} {badge.name}</span>
                    </div>
                  ))}
                  {selectedModule.rewards.certificates.map((cert) => (
                    <div key={cert.id} className="reward-item">
                      <span>🎖️ {cert.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="modal-actions">
              <button 
                className="modal-btn primary"
                onClick={() => setSelectedModule(null)}
              >
                🚀 Start Learning
              </button>
              <button 
                className="modal-btn secondary"
                onClick={() => setSelectedModule(null)}
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EducationDashboard;