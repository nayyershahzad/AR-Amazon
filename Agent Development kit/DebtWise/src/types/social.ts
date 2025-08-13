export interface UserSocialProfile {
  userId: string;
  displayName: string;
  avatar: string;
  bio: string;
  privacySettings: PrivacySettings;
  socialStats: SocialStats;
  joinedAt: Date;
  lastActiveAt: Date;
  achievements: SocialAchievement[];
  friends: string[]; // user IDs
  following: string[];
  followers: string[];
  blockedUsers: string[];
  reputation: number;
  verificationLevel: 'none' | 'email' | 'phone' | 'verified';
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'friends' | 'private';
  shareDebtProgress: boolean;
  sharePaymentActivity: boolean;
  shareEducationProgress: boolean;
  allowFriendRequests: boolean;
  allowMessages: boolean;
  showInLeaderboards: boolean;
  shareAchievements: boolean;
  allowGroupInvites: boolean;
}

export interface SocialStats {
  totalConnections: number;
  groupsJoined: number;
  challengesCompleted: number;
  helpfulVotes: number;
  postsCreated: number;
  commentsPosted: number;
  likesReceived: number;
  sharesReceived: number;
  mentorshipSessions: number;
}

export interface SocialAchievement {
  id: string;
  type: 'social_milestone' | 'community_helper' | 'challenge_winner' | 'mentor' | 'supporter';
  title: string;
  description: string;
  icon: string;
  earnedAt: Date;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  pointsAwarded: number;
  sharable: boolean;
}

export interface DebtPayoffGroup {
  id: string;
  name: string;
  description: string;
  category: 'support' | 'challenge' | 'education' | 'accountability' | 'milestone';
  privacy: 'public' | 'private' | 'invite_only';
  memberCount: number;
  maxMembers?: number;
  createdBy: string;
  moderators: string[];
  members: GroupMember[];
  rules: string[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  groupStats: GroupStats;
  currentChallenge?: GroupChallenge;
}

export interface GroupMember {
  userId: string;
  displayName: string;
  avatar: string;
  role: 'owner' | 'moderator' | 'member';
  joinedAt: Date;
  contributionScore: number;
  lastActiveAt: Date;
  permissions: string[];
  memberStats: MemberStats;
}

export interface MemberStats {
  postsCreated: number;
  commentsPosted: number;
  likesGiven: number;
  helpfulResponses: number;
  challengesCompleted: number;
  milestonesCelebrated: number;
}

export interface GroupStats {
  totalDebtPaidOff: number;
  averageMonthlyProgress: number;
  activeChallenges: number;
  completedChallenges: number;
  totalMilestones: number;
  engagementScore: number;
  successRate: number;
}

export interface GroupChallenge {
  id: string;
  groupId: string;
  title: string;
  description: string;
  type: 'debt_reduction' | 'savings_goal' | 'payment_streak' | 'education' | 'custom';
  startDate: Date;
  endDate: Date;
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
  participants: ChallengeParticipant[];
  rules: ChallengeRule[];
  rewards: ChallengeReward[];
  leaderboard: ChallengeLeaderboard[];
  progress: ChallengeProgress;
  createdBy: string;
  prizePot?: number;
}

export interface ChallengeParticipant {
  userId: string;
  displayName: string;
  avatar: string;
  joinedAt: Date;
  status: 'active' | 'completed' | 'dropped' | 'disqualified';
  progress: Record<string, any>;
  score: number;
  rank: number;
  achievements: string[];
}

export interface ChallengeRule {
  id: string;
  title: string;
  description: string;
  type: 'requirement' | 'scoring' | 'bonus' | 'penalty';
  parameters: Record<string, any>;
  pointValue?: number;
}

export interface ChallengeReward {
  id: string;
  type: 'points' | 'badge' | 'certificate' | 'cash' | 'feature_unlock' | 'title';
  title: string;
  description: string;
  value: any;
  criteria: 'winner' | 'top_3' | 'top_10' | 'participation' | 'custom';
  customCriteria?: string;
}

export interface ChallengeLeaderboard {
  rank: number;
  userId: string;
  displayName: string;
  avatar: string;
  score: number;
  progress: Record<string, any>;
  achievements: string[];
  trend: 'up' | 'down' | 'same';
}

export interface ChallengeProgress {
  totalParticipants: number;
  activeParticipants: number;
  completedParticipants: number;
  averageScore: number;
  topScore: number;
  milestones: ChallengeMilestone[];
  timeline: ProgressTimelineEntry[];
}

export interface ChallengeMilestone {
  id: string;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  achievedBy: string[];
  achievedAt?: Date;
  celebrationMessage: string;
}

export interface ProgressTimelineEntry {
  timestamp: Date;
  userId: string;
  displayName: string;
  action: string;
  details: Record<string, any>;
  pointsAwarded?: number;
}

export interface CommunityPost {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  type: 'milestone' | 'question' | 'tip' | 'success_story' | 'support_request' | 'general';
  tags: string[];
  attachments: PostAttachment[];
  privacy: 'public' | 'friends' | 'group';
  groupId?: string;
  likes: PostReaction[];
  comments: PostComment[];
  shares: PostShare[];
  views: number;
  createdAt: Date;
  updatedAt: Date;
  isPinned: boolean;
  isEdited: boolean;
  moderationStatus: 'approved' | 'pending' | 'flagged' | 'removed';
}

export interface PostAttachment {
  id: string;
  type: 'image' | 'document' | 'link' | 'poll' | 'chart';
  url: string;
  title: string;
  description: string;
  metadata: Record<string, any>;
}

export interface PostReaction {
  userId: string;
  displayName: string;
  type: 'like' | 'love' | 'celebrate' | 'support' | 'helpful';
  createdAt: Date;
}

export interface PostComment {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  parentCommentId?: string;
  likes: PostReaction[];
  createdAt: Date;
  updatedAt: Date;
  isEdited: boolean;
  moderationStatus: 'approved' | 'pending' | 'flagged' | 'removed';
}

export interface PostShare {
  userId: string;
  displayName: string;
  platform: 'internal' | 'facebook' | 'twitter' | 'linkedin' | 'email';
  sharedAt: Date;
  message?: string;
}

export interface MentorshipProgram {
  id: string;
  title: string;
  description: string;
  category: 'debt_payoff' | 'budgeting' | 'investment' | 'career' | 'general';
  duration: number; // weeks
  mentors: MentorProfile[];
  mentees: MenteeProfile[];
  matches: MentorshipMatch[];
  requirements: ProgramRequirement[];
  curriculum: CurriculumItem[];
  status: 'active' | 'inactive' | 'full';
  maxParticipants: number;
  applicationDeadline: Date;
  startDate: Date;
  endDate: Date;
}

export interface MentorProfile {
  userId: string;
  displayName: string;
  avatar: string;
  bio: string;
  expertise: string[];
  experience: string;
  availability: TimeSlot[];
  menteesCount: number;
  maxMentees: number;
  rating: number;
  reviewCount: number;
  successStories: number;
  badges: string[];
  isVerified: boolean;
}

export interface MenteeProfile {
  userId: string;
  displayName: string;
  avatar: string;
  goals: string[];
  challenges: string[];
  learningStyle: string;
  availability: TimeSlot[];
  currentDebtAmount: number;
  targetPayoffDate: Date;
  preferredMentorType: string[];
  applicationEssay: string;
}

export interface TimeSlot {
  dayOfWeek: number; // 0-6, Sunday = 0
  startTime: string; // HH:MM format
  endTime: string;
  timezone: string;
}

export interface MentorshipMatch {
  id: string;
  mentorId: string;
  menteeId: string;
  programId: string;
  status: 'pending' | 'active' | 'completed' | 'terminated';
  startDate: Date;
  endDate?: Date;
  goals: string[];
  progress: MatchProgress;
  sessions: MentorshipSession[];
  feedback: MatchFeedback[];
  compatibility: number; // 0-100
}

export interface MatchProgress {
  goalsCompleted: number;
  totalGoals: number;
  sessionsCompleted: number;
  totalSessions: number;
  milestones: ProgressMilestone[];
  overallRating: number;
}

export interface ProgressMilestone {
  id: string;
  title: string;
  description: string;
  targetDate: Date;
  completedDate?: Date;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
}

export interface MentorshipSession {
  id: string;
  matchId: string;
  scheduledDate: Date;
  duration: number; // minutes
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  agenda: string;
  notes: string;
  actionItems: ActionItem[];
  mentorRating?: number;
  menteeRating?: number;
  feedback?: string;
}

export interface ActionItem {
  id: string;
  description: string;
  assignedTo: 'mentor' | 'mentee' | 'both';
  dueDate: Date;
  status: 'pending' | 'in_progress' | 'completed';
  notes: string;
}

export interface MatchFeedback {
  id: string;
  fromUserId: string;
  toUserId: string;
  type: 'session' | 'overall' | 'milestone';
  rating: number;
  comment: string;
  isAnonymous: boolean;
  createdAt: Date;
  categories: FeedbackCategory[];
}

export interface FeedbackCategory {
  category: string;
  rating: number;
  comment: string;
}

export interface ProgramRequirement {
  id: string;
  type: 'mentor' | 'mentee' | 'both';
  requirement: string;
  description: string;
  mandatory: boolean;
}

export interface CurriculumItem {
  week: number;
  title: string;
  description: string;
  objectives: string[];
  resources: string[];
  assignments: Assignment[];
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  type: 'reading' | 'exercise' | 'reflection' | 'goal_setting' | 'tracking';
  dueDate: string; // relative to week start
  points: number;
}

export interface SocialLeaderboard {
  id: string;
  title: string;
  description: string;
  type: 'debt_reduction' | 'savings_achievement' | 'education_progress' | 'community_engagement' | 'challenge_victories';
  timeframe: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'all_time';
  category?: string;
  entries: LeaderboardEntry[];
  lastUpdated: Date;
  nextUpdate: Date;
  totalParticipants: number;
  averageScore: number;
  prizes: LeaderboardPrize[];
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  avatar: string;
  score: number;
  previousRank: number;
  trend: 'up' | 'down' | 'same' | 'new';
  trendChange: number;
  badges: string[];
  achievements: string[];
  streak: number;
  additionalStats: Record<string, any>;
}

export interface LeaderboardPrize {
  rankRange: string; // e.g., "1", "2-5", "6-10"
  title: string;
  description: string;
  type: 'points' | 'badge' | 'cash' | 'feature' | 'recognition';
  value: any;
}

export interface SocialNotification {
  id: string;
  userId: string;
  type: 'friend_request' | 'group_invite' | 'challenge_invite' | 'mentorship_match' | 'post_like' | 'comment' | 'achievement' | 'milestone_celebration';
  title: string;
  message: string;
  actionUrl?: string;
  actionText?: string;
  fromUserId?: string;
  fromUserName?: string;
  fromUserAvatar?: string;
  metadata: Record<string, any>;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: Date;
  expiresAt?: Date;
}

export interface SocialAnalytics {
  userId: string;
  period: 'daily' | 'weekly' | 'monthly' | 'all_time';
  engagement: EngagementMetrics;
  influence: InfluenceMetrics;
  support: SupportMetrics;
  growth: GrowthMetrics;
  achievements: AchievementMetrics;
  trends: SocialTrend[];
  recommendations: SocialRecommendation[];
}

export interface EngagementMetrics {
  postsCreated: number;
  commentsPosted: number;
  likesGiven: number;
  likesReceived: number;
  sharesGiven: number;
  sharesReceived: number;
  viewsGenerated: number;
  timeSpentInCommunity: number;
  responseRate: number;
  activeHours: string[];
}

export interface InfluenceMetrics {
  followers: number;
  following: number;
  menteeCount: number;
  helpfulVotes: number;
  postReach: number;
  engagementRate: number;
  influenceScore: number;
  topPosts: string[];
}

export interface SupportMetrics {
  supportRequestsHelped: number;
  supportRequestsMade: number;
  mentorshipSessions: number;
  groupContributions: number;
  challengeSupport: number;
  encouragementGiven: number;
  supportScore: number;
}

export interface GrowthMetrics {
  newConnections: number;
  groupsJoined: number;
  challengesParticipated: number;
  skillsLearned: number;
  milestonesAchieved: number;
  progressRate: number;
  consistencyScore: number;
}

export interface AchievementMetrics {
  totalAchievements: number;
  recentAchievements: number;
  rareBadges: number;
  socialAchievements: number;
  leaderboardAppearances: number;
  recognitionReceived: number;
}

export interface SocialTrend {
  metric: string;
  timeframe: string;
  data: TrendDataPoint[];
  trend: 'increasing' | 'decreasing' | 'stable';
  changePercentage: number;
}

export interface TrendDataPoint {
  date: Date;
  value: number;
  label: string;
}

export interface SocialRecommendation {
  type: 'connect' | 'join_group' | 'enter_challenge' | 'share_milestone' | 'help_others' | 'seek_mentorship';
  title: string;
  description: string;
  action: string;
  priority: 'low' | 'medium' | 'high';
  targetId?: string;
  estimatedImpact: string;
  timeCommitment: string;
}