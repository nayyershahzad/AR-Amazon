export interface EducationModule {
  id: string;
  title: string;
  description: string;
  category: 'debt_basics' | 'budgeting' | 'investment' | 'credit_management' | 'emergency_fund' | 'tax_planning';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number; // minutes
  prerequisites: string[]; // module IDs
  lessons: Lesson[];
  quiz: Quiz;
  rewards: ModuleReward;
  completionRate: number;
  averageRating: number;
  isLocked: boolean;
  unlockCriteria?: UnlockCriteria;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  content: LessonContent;
  interactiveElements: InteractiveElement[];
  estimatedTime: number;
  order: number;
  isCompleted: boolean;
  completedAt?: Date;
  userProgress: LessonProgress;
}

export interface LessonContent {
  type: 'text' | 'video' | 'interactive' | 'simulation' | 'calculator';
  content: string;
  mediaUrl?: string;
  transcript?: string;
  keyPoints: string[];
  examples: ContentExample[];
  resources: ExternalResource[];
}

export interface InteractiveElement {
  id: string;
  type: 'quiz_question' | 'calculator' | 'scenario' | 'drag_drop' | 'slider' | 'decision_tree';
  title: string;
  description: string;
  configuration: Record<string, any>;
  correctAnswer?: any;
  explanation?: string;
  points: number;
}

export interface ContentExample {
  id: string;
  title: string;
  scenario: string;
  calculation?: CalculationStep[];
  outcome: string;
  lessonLearned: string;
}

export interface CalculationStep {
  step: number;
  description: string;
  formula: string;
  values: Record<string, number>;
  result: number;
}

export interface ExternalResource {
  title: string;
  url: string;
  type: 'article' | 'video' | 'calculator' | 'tool' | 'book';
  provider: string;
  description: string;
}

export interface Quiz {
  id: string;
  moduleId: string;
  questions: QuizQuestion[];
  passingScore: number;
  timeLimit?: number; // minutes
  attempts: QuizAttempt[];
  maxAttempts: number;
}

export interface QuizQuestion {
  id: string;
  type: 'multiple_choice' | 'true_false' | 'fill_blank' | 'matching' | 'calculation' | 'scenario';
  question: string;
  options?: string[];
  correctAnswer: any;
  explanation: string;
  points: number;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
}

export interface QuizAttempt {
  id: string;
  userId: string;
  startedAt: Date;
  completedAt?: Date;
  score: number;
  totalPossible: number;
  answers: QuizAnswer[];
  passed: boolean;
  timeSpent: number; // seconds
}

export interface QuizAnswer {
  questionId: string;
  userAnswer: any;
  isCorrect: boolean;
  pointsEarned: number;
  timeSpent: number;
}

export interface ModuleReward {
  points: number;
  badges: Badge[];
  certificates: Certificate[];
  unlocks: string[]; // module IDs or feature names
  cashReward?: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  earnedAt?: Date;
}

export interface Certificate {
  id: string;
  name: string;
  description: string;
  issuer: string;
  validUntil?: Date;
  credentialUrl?: string;
}

export interface UnlockCriteria {
  requiredModules: string[];
  requiredPoints: number;
  requiredLevel: number;
  customConditions?: Record<string, any>;
}

export interface LessonProgress {
  startedAt?: Date;
  completedAt?: Date;
  timeSpent: number;
  interactionsCompleted: string[];
  notesCount: number;
  bookmarked: boolean;
  rating?: number;
  review?: string;
}

export interface UserEducationProfile {
  userId: string;
  currentLevel: number;
  totalPoints: number;
  completedModules: string[];
  inProgressModules: string[];
  badges: Badge[];
  certificates: Certificate[];
  learningStreak: number;
  preferredLearningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
  weeklyGoal: number; // minutes
  dailyGoal: number; // minutes
  achievements: Achievement[];
  personalizedPath: LearningPath;
  createdAt: Date;
  lastActiveAt: Date;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: 'module_completion' | 'streak' | 'quiz_performance' | 'time_spent' | 'special';
  earnedAt: Date;
  points: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface LearningPath {
  id: string;
  name: string;
  description: string;
  recommendedModules: string[];
  estimatedDuration: number; // days
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  personalizedFor: string[]; // user characteristics
}

export interface StudySession {
  id: string;
  userId: string;
  moduleId?: string;
  lessonId?: string;
  startedAt: Date;
  endedAt?: Date;
  duration: number; // seconds
  activitiesCompleted: SessionActivity[];
  pointsEarned: number;
  focusScore: number; // 0-100 based on engagement
  notes: StudyNote[];
}

export interface SessionActivity {
  type: 'lesson_read' | 'video_watched' | 'quiz_taken' | 'interactive_completed' | 'note_taken';
  itemId: string;
  duration: number;
  completed: boolean;
  score?: number;
}

export interface StudyNote {
  id: string;
  content: string;
  lessonId?: string;
  moduleId: string;
  createdAt: Date;
  tags: string[];
  isHighlighted: boolean;
}

export interface EducationAnalytics {
  userId: string;
  period: 'daily' | 'weekly' | 'monthly' | 'all_time';
  metrics: {
    totalTimeSpent: number;
    modulesCompleted: number;
    lessonsCompleted: number;
    quizzesCompleted: number;
    averageQuizScore: number;
    streakDays: number;
    pointsEarned: number;
    badgesEarned: number;
    learningVelocity: number; // lessons per week
    focusScore: number;
    retentionRate: number;
    preferredLearningTime: string;
    strongestTopics: string[];
    improvementAreas: string[];
  };
  trends: AnalyticsTrend[];
  recommendations: LearningRecommendation[];
}

export interface AnalyticsTrend {
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

export interface LearningRecommendation {
  type: 'next_module' | 'review_topic' | 'practice_more' | 'take_break' | 'adjust_goal';
  title: string;
  description: string;
  action: string;
  priority: 'low' | 'medium' | 'high';
  moduleId?: string;
  estimatedImpact: string;
}