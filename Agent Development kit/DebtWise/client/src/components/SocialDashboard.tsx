import React, { useState, useEffect } from 'react';
import './SocialDashboard.css';

interface UserSocialProfile {
  userId: string;
  displayName: string;
  avatar: string;
  bio: string;
  socialStats: {
    totalConnections: number;
    groupsJoined: number;
    challengesCompleted: number;
    helpfulVotes: number;
    postsCreated: number;
    commentsPosted: number;
    likesReceived: number;
    sharesReceived: number;
    mentorshipSessions: number;
  };
  reputation: number;
  achievements: SocialAchievement[];
  friends: string[];
  followers: string[];
  verificationLevel: string;
}

interface SocialAchievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: string;
  earnedAt: string;
  pointsAwarded: number;
}

interface DebtPayoffGroup {
  id: string;
  name: string;
  description: string;
  category: string;
  privacy: string;
  memberCount: number;
  maxMembers?: number;
  groupStats: {
    totalDebtPaidOff: number;
    averageMonthlyProgress: number;
    successRate: number;
  };
  currentChallenge?: GroupChallenge;
}

interface GroupChallenge {
  id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  participants: ChallengeParticipant[];
  leaderboard: any[];
  endDate: string;
}

interface ChallengeParticipant {
  userId: string;
  displayName: string;
  rank: number;
  score: number;
  progress: any;
}

interface SocialLeaderboard {
  id: string;
  title: string;
  description: string;
  type: string;
  timeframe: string;
  entries: LeaderboardEntry[];
  totalParticipants: number;
}

interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  avatar: string;
  score: number;
  trend: string;
  badges: string[];
  streak: number;
}

interface CommunityPost {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  type: string;
  tags: string[];
  likes: PostReaction[];
  comments: PostComment[];
  createdAt: string;
  views: number;
}

interface PostReaction {
  userId: string;
  displayName: string;
  type: string;
}

interface PostComment {
  id: string;
  authorName: string;
  content: string;
  createdAt: string;
}

interface SocialAnalytics {
  engagement: {
    postsCreated: number;
    commentsPosted: number;
    likesReceived: number;
    timeSpentInCommunity: number;
    responseRate: number;
  };
  influence: {
    followers: number;
    helpfulVotes: number;
    influenceScore: number;
  };
  support: {
    supportRequestsHelped: number;
    supportScore: number;
  };
  growth: {
    newConnections: number;
    groupsJoined: number;
    progressRate: number;
  };
  recommendations: SocialRecommendation[];
}

interface SocialRecommendation {
  type: string;
  title: string;
  description: string;
  action: string;
  priority: string;
  estimatedImpact: string;
}

interface SocialDashboardData {
  profile: UserSocialProfile;
  groups: DebtPayoffGroup[];
  leaderboards: SocialLeaderboard[];
  posts: CommunityPost[];
  analytics: SocialAnalytics;
}

const SocialDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<SocialDashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string>('');
  const [activeSection, setActiveSection] = useState<'feed' | 'groups' | 'leaderboards' | 'profile'>('feed');

  useEffect(() => {
    loadSocialData();
  }, []);

  const loadSocialData = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/social/profile/demo_user_123');
      const result = await response.json();
      
      if (result.success) {
        const [groupsRes, leaderboardsRes, postsRes, analyticsRes] = await Promise.all([
          fetch('http://localhost:3001/api/social/groups/demo_user_123'),
          fetch('http://localhost:3001/api/social/leaderboards'),
          fetch('http://localhost:3001/api/social/posts?limit=10'),
          fetch('http://localhost:3001/api/social/analytics/demo_user_123')
        ]);
        
        const groupsData = await groupsRes.json();
        const leaderboardsData = await leaderboardsRes.json();
        const postsData = await postsRes.json();
        const analyticsData = await analyticsRes.json();
        
        if (groupsData.success && leaderboardsData.success && postsData.success && analyticsData.success) {
          setDashboardData({
            profile: result.data,
            groups: groupsData.data,
            leaderboards: leaderboardsData.data,
            posts: postsData.data,
            analytics: analyticsData.data
          });
        }
      }
    } catch (error) {
      console.error('Failed to load social data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createDemoSocial = async () => {
    setLoading(true);
    setMessage('');
    try {
      const response = await fetch('http://localhost:3001/api/social/demo/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      const result = await response.json();
      
      if (result.success) {
        setDashboardData(result.data);
        setMessage('🌟 Social community initialized! Connect, share, and grow together.');
      } else {
        setMessage(`❌ Error: ${result.error}`);
      }
    } catch (error) {
      setMessage('❌ Failed to create social community');
      console.error('Failed to create demo social:', error);
    } finally {
      setLoading(false);
    }
  };

  const simulateActivity = async (activityType: string) => {
    setLoading(true);
    setMessage('');
    try {
      const response = await fetch('http://localhost:3001/api/social/demo/activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activityType })
      });
      const result = await response.json();
      
      if (result.success) {
        setMessage(`✅ ${result.message}`);
        await loadSocialData(); // Refresh data
      } else {
        setMessage(`❌ Error: ${result.message}`);
      }
    } catch (error) {
      setMessage(`❌ Failed to simulate ${activityType}`);
      console.error(`Failed to simulate ${activityType}:`, error);
    } finally {
      setLoading(false);
    }
  };

  const getPostTypeIcon = (type: string) => {
    const icons = {
      milestone: '🎉',
      question: '❓',
      tip: '💡',
      success_story: '🏆',
      support_request: '🤝',
      general: '💬'
    };
    return icons[type as keyof typeof icons] || '📝';
  };

  const getReactionIcon = (type: string) => {
    const icons = {
      like: '👍',
      love: '❤️',
      celebrate: '🎉',
      support: '🤝',
      helpful: '💡'
    };
    return icons[type as keyof typeof icons] || '👍';
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (loading && !dashboardData) {
    return <div className="social-loading">Building your social community...</div>;
  }

  return (
    <div className="social-dashboard">
      <h2>🌟 Social Community</h2>
      
      {message && (
        <div className="social-message">
          <p>{message}</p>
          <button onClick={() => setMessage('')} className="close-message">×</button>
        </div>
      )}

      {/* Setup Section */}
      <div className="setup-section">
        <h3>🤝 Community Hub</h3>
        <p>Connect with others on similar debt-free journeys. Share milestones, join challenges, get support, and celebrate victories together!</p>
        <div className="setup-buttons">
          <button 
            onClick={createDemoSocial} 
            disabled={loading}
            className="setup-btn primary"
          >
            {loading ? 'Connecting...' : '🚀 Join Social Community'}
          </button>
        </div>
      </div>

      {dashboardData && (
        <>
          {/* Navigation Tabs */}
          <div className="social-nav">
            <button 
              className={`nav-btn ${activeSection === 'feed' ? 'active' : ''}`}
              onClick={() => setActiveSection('feed')}
            >
              📰 Community Feed
            </button>
            <button 
              className={`nav-btn ${activeSection === 'groups' ? 'active' : ''}`}
              onClick={() => setActiveSection('groups')}
            >
              👥 Groups & Challenges
            </button>
            <button 
              className={`nav-btn ${activeSection === 'leaderboards' ? 'active' : ''}`}
              onClick={() => setActiveSection('leaderboards')}
            >
              🏆 Leaderboards
            </button>
            <button 
              className={`nav-btn ${activeSection === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveSection('profile')}
            >
              👤 Social Profile
            </button>
          </div>

          {/* Community Feed */}
          {activeSection === 'feed' && (
            <div className="feed-section">
              <div className="activity-simulation">
                <h3>📱 Social Activities</h3>
                <p>Try different social activities to engage with the community:</p>
                <div className="activity-buttons">
                  <button 
                    onClick={() => simulateActivity('create_milestone_post')} 
                    disabled={loading}
                    className="activity-btn milestone"
                  >
                    🎉 Share Milestone
                  </button>
                  <button 
                    onClick={() => simulateActivity('help_community_member')} 
                    disabled={loading}
                    className="activity-btn help"
                  >
                    🤝 Help Someone
                  </button>
                  <button 
                    onClick={() => simulateActivity('like_posts')} 
                    disabled={loading}
                    className="activity-btn celebrate"
                  >
                    💖 Celebrate Others
                  </button>
                  <button 
                    onClick={() => simulateActivity('share_tip')} 
                    disabled={loading}
                    className="activity-btn tip"
                  >
                    💡 Share Tip
                  </button>
                </div>
              </div>

              <div className="community-posts">
                <h3>📰 Community Feed</h3>
                <div className="posts-container">
                  {dashboardData.posts.map((post) => (
                    <div key={post.id} className={`post-card ${post.type}`}>
                      <div className="post-header">
                        <div className="post-author">
                          <span className="author-avatar">{post.authorAvatar}</span>
                          <div className="author-info">
                            <h4>{post.authorName}</h4>
                            <span className="post-time">{formatTimeAgo(post.createdAt)}</span>
                          </div>
                        </div>
                        <div className="post-type">
                          <span className="type-icon">{getPostTypeIcon(post.type)}</span>
                          <span className="type-label">{post.type.replace('_', ' ')}</span>
                        </div>
                      </div>
                      
                      <div className="post-content">
                        <p>{post.content}</p>
                      </div>
                      
                      {post.tags.length > 0 && (
                        <div className="post-tags">
                          {post.tags.map((tag, index) => (
                            <span key={index} className="post-tag">#{tag}</span>
                          ))}
                        </div>
                      )}
                      
                      <div className="post-actions">
                        <div className="reactions">
                          {post.likes.slice(0, 3).map((reaction, index) => (
                            <span key={index} className="reaction" title={`${reaction.displayName} ${reaction.type}`}>
                              {getReactionIcon(reaction.type)}
                            </span>
                          ))}
                          {post.likes.length > 0 && (
                            <span className="reaction-count">{post.likes.length}</span>
                          )}
                        </div>
                        
                        <div className="engagement-stats">
                          <span className="stat">💬 {post.comments.length}</span>
                          <span className="stat">👁️ {post.views}</span>
                        </div>
                      </div>
                      
                      {post.comments.length > 0 && (
                        <div className="post-comments">
                          <h5>Comments:</h5>
                          {post.comments.slice(0, 2).map((comment) => (
                            <div key={comment.id} className="comment">
                              <strong>{comment.authorName}:</strong>
                              <span>{comment.content}</span>
                              <small>{formatTimeAgo(comment.createdAt)}</small>
                            </div>
                          ))}
                          {post.comments.length > 2 && (
                            <div className="more-comments">
                              +{post.comments.length - 2} more comments
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Groups & Challenges */}
          {activeSection === 'groups' && (
            <div className="groups-section">
              <h3>👥 Debt Payoff Groups</h3>
              <div className="groups-grid">
                {dashboardData.groups.map((group) => (
                  <div key={group.id} className={`group-card ${group.category}`}>
                    <div className="group-header">
                      <h4>{group.name}</h4>
                      <span className={`privacy-badge ${group.privacy}`}>
                        {group.privacy.toUpperCase()}
                      </span>
                    </div>
                    
                    <p className="group-description">{group.description}</p>
                    
                    <div className="group-stats">
                      <div className="stat">
                        <span className="stat-icon">👥</span>
                        <span>{group.memberCount.toLocaleString()} members</span>
                      </div>
                      <div className="stat">
                        <span className="stat-icon">💰</span>
                        <span>${(group.groupStats.totalDebtPaidOff / 1000000).toFixed(1)}M paid off</span>
                      </div>
                      <div className="stat">
                        <span className="stat-icon">📈</span>
                        <span>{group.groupStats.successRate}% success rate</span>
                      </div>
                    </div>
                    
                    {group.currentChallenge && (
                      <div className="current-challenge">
                        <h5>🏆 Active Challenge</h5>
                        <p><strong>{group.currentChallenge.title}</strong></p>
                        <p>{group.currentChallenge.description}</p>
                        <div className="challenge-stats">
                          <span>👥 {group.currentChallenge.participants.length} participants</span>
                          <span>⏰ Ends {formatTimeAgo(group.currentChallenge.endDate)}</span>
                        </div>
                        
                        {group.currentChallenge.leaderboard.length > 0 && (
                          <div className="mini-leaderboard">
                            <h6>Top Performers:</h6>
                            {group.currentChallenge.leaderboard.slice(0, 3).map((entry: any, index: number) => (
                              <div key={entry.userId} className="mini-leader-entry">
                                <span className="rank">#{entry.rank}</span>
                                <span className="name">{entry.displayName}</span>
                                <span className="score">{entry.score.toLocaleString()}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    
                    <button 
                      className="group-join-btn"
                      onClick={() => simulateActivity('join_group')}
                      disabled={loading}
                    >
                      👥 Join Group
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Leaderboards */}
          {activeSection === 'leaderboards' && (
            <div className="leaderboards-section">
              <h3>🏆 Community Leaderboards</h3>
              <div className="leaderboards-grid">
                {dashboardData.leaderboards.map((leaderboard) => (
                  <div key={leaderboard.id} className="leaderboard-card">
                    <div className="leaderboard-header">
                      <h4>{leaderboard.title}</h4>
                      <span className="timeframe-badge">{leaderboard.timeframe}</span>
                    </div>
                    
                    <p className="leaderboard-description">{leaderboard.description}</p>
                    
                    <div className="leaderboard-stats">
                      <span>👥 {leaderboard.totalParticipants} participants</span>
                    </div>
                    
                    <div className="leaderboard-entries">
                      {leaderboard.entries.slice(0, 5).map((entry) => (
                        <div key={entry.userId} className={`leader-entry ${entry.userId === 'demo_user_123' ? 'current-user' : ''}`}>
                          <div className="entry-rank">
                            <span className={`rank-badge rank-${entry.rank <= 3 ? entry.rank : 'other'}`}>
                              #{entry.rank}
                            </span>
                            {entry.trend === 'up' && <span className="trend up">↗️</span>}
                            {entry.trend === 'down' && <span className="trend down">↘️</span>}
                          </div>
                          
                          <div className="entry-info">
                            <div className="entry-user">
                              <span className="user-avatar">{entry.avatar}</span>
                              <span className="user-name">{entry.displayName}</span>
                              {entry.userId === 'demo_user_123' && <span className="you-badge">You</span>}
                            </div>
                            <div className="entry-score">
                              <span className="score-value">{entry.score.toLocaleString()}</span>
                              {entry.streak > 0 && <span className="streak">🔥 {entry.streak}</span>}
                            </div>
                          </div>
                          
                          {entry.badges.length > 0 && (
                            <div className="entry-badges">
                              {entry.badges.slice(0, 2).map((badge, index) => (
                                <span key={index} className="mini-badge">{badge}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Social Profile */}
          {activeSection === 'profile' && (
            <div className="profile-section">
              <div className="profile-header">
                <div className="profile-info">
                  <span className="profile-avatar">{dashboardData.profile.avatar}</span>
                  <div className="profile-details">
                    <h3>{dashboardData.profile.displayName}</h3>
                    <p>{dashboardData.profile.bio}</p>
                    <div className="verification">
                      {dashboardData.profile.verificationLevel === 'verified' && 
                        <span className="verified-badge">✅ Verified</span>
                      }
                      <span className="reputation">⭐ {dashboardData.profile.reputation} reputation</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="social-stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">👥</div>
                  <div className="stat-value">{dashboardData.profile.socialStats.totalConnections}</div>
                  <div className="stat-label">Connections</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">📝</div>
                  <div className="stat-value">{dashboardData.profile.socialStats.postsCreated}</div>
                  <div className="stat-label">Posts Created</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">💬</div>
                  <div className="stat-value">{dashboardData.profile.socialStats.commentsPosted}</div>
                  <div className="stat-label">Comments Posted</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">👍</div>
                  <div className="stat-value">{dashboardData.profile.socialStats.helpfulVotes}</div>
                  <div className="stat-label">Helpful Votes</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">🏆</div>
                  <div className="stat-value">{dashboardData.profile.socialStats.challengesCompleted}</div>
                  <div className="stat-label">Challenges Won</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">❤️</div>
                  <div className="stat-value">{dashboardData.profile.socialStats.likesReceived}</div>
                  <div className="stat-label">Likes Received</div>
                </div>
              </div>

              {/* Social Achievements */}
              {dashboardData.profile.achievements.length > 0 && (
                <div className="achievements-section">
                  <h4>🏆 Social Achievements</h4>
                  <div className="achievements-grid">
                    {dashboardData.profile.achievements.map((achievement) => (
                      <div key={achievement.id} className={`achievement-card ${achievement.rarity}`}>
                        <div className="achievement-icon">{achievement.icon}</div>
                        <h5>{achievement.title}</h5>
                        <p>{achievement.description}</p>
                        <div className="achievement-meta">
                          <span className="points">+{achievement.pointsAwarded} pts</span>
                          <span className="earned-date">{formatTimeAgo(achievement.earnedAt)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Social Analytics */}
              <div className="analytics-section">
                <h4>📊 Social Impact</h4>
                <div className="analytics-grid">
                  <div className="analytics-card">
                    <h5>👥 Engagement</h5>
                    <div className="metric">
                      <span>Response Rate: {Math.round(dashboardData.analytics.engagement.responseRate * 100)}%</span>
                    </div>
                    <div className="metric">
                      <span>Community Time: {Math.round(dashboardData.analytics.engagement.timeSpentInCommunity / 60)}h</span>
                    </div>
                  </div>
                  
                  <div className="analytics-card">
                    <h5>🌟 Influence</h5>
                    <div className="metric">
                      <span>Influence Score: {dashboardData.analytics.influence.influenceScore}</span>
                    </div>
                    <div className="metric">
                      <span>Followers: {dashboardData.analytics.influence.followers}</span>
                    </div>
                  </div>
                  
                  <div className="analytics-card">
                    <h5>🤝 Support</h5>
                    <div className="metric">
                      <span>People Helped: {dashboardData.analytics.support.supportRequestsHelped}</span>
                    </div>
                    <div className="metric">
                      <span>Support Score: {dashboardData.analytics.support.supportScore}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              {dashboardData.analytics.recommendations.length > 0 && (
                <div className="recommendations-section">
                  <h4>💡 Social Recommendations</h4>
                  <div className="recommendations-list">
                    {dashboardData.analytics.recommendations.map((rec, index) => (
                      <div key={index} className={`recommendation-card ${rec.priority}`}>
                        <h5>{rec.title}</h5>
                        <p>{rec.description}</p>
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
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SocialDashboard;