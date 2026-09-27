// Constitutional & Platform Roles
export type UserRole =
  | 'programmer'
  | 'institution_manager'
  | 'supervisor'
  | 'teacher'
  | 'parent'
  | 'student';

export type Permission =
  | 'view_student_area'
  | 'manage_students'
  | 'manage_teachers'
  | 'manage_institution'
  | 'manage_system'
  | 'manage_lessons'
  | 'authorize_lesson_unlock'
  | 'view_student_progress';

export interface CurrentUser {
  id: string;
  role: UserRole;
  displayName: string;
  email?: string;
  phone?: string;
  institutionId?: string;
  teacherId?: string;
  supervisorId?: string;
  studentId?: string; // Linked student (for parent role)
}

export type QuestionType =
  | 'multiple-choice'
  | 'true-false'
  | 'situation'
  | 'ordering'
  | 'error-detection'
  | 'matching';

export type QuestionLevel = 'للطالب الجيدين' | 'للطالب المجتهدين' | 'للأذكياء';

export interface QuestionOption {
  id: number;
  text: string;
  isCorrect?: boolean;
}

export interface Question {
  id: number;
  lessonId: string;
  level: QuestionLevel;
  type: QuestionType;
  q: string;
  options: string[];
  correct: number; // Index in options array
  explanation: string;
  learningPoint?: string;
}

export interface HadithItem {
  text: string;
  narrator: string;
  source: string;
  memorizationRequired: boolean;
}

export interface Lesson {
  id: string;
  order: number;
  title: string;
  subtitle?: string;
  summary: string;
  hadiths: string[];
  detailedHadiths?: HadithItem[];
  content: string;
  keyPoints?: string[];
  teacherReviewNotes?: string[];
}

export interface StudentProgress {
  [lessonId: string]: {
    finished: boolean;
    score: number;
    stars: number; // 0 to 5
    attemptsCount: number;
    highestStars: number;
    lastScore: number;
    bestScore: number;
    completedAt?: string;
    mastered?: boolean;
    masteredAt?: string;
  };
}

export interface QuestionReviewItem {
  question: Question;
  studentAnswerIndex: number | null;
  studentAnswerText: string;
  isCorrect: boolean;
  attemptsUsed: number;
  timeoutsCount?: number;
  pointsAwarded?: number;
  isFirstAttemptCorrect?: boolean;
}

export interface QuizAttemptResult {
  id?: string;
  lessonId: string;
  lessonTitle: string;
  totalQuestions: number;
  correctAnswersCount: number; // Educational score (e.g. 10/10)
  percentage: number;
  passed: boolean; // Initial threshold (>= 60%)
  isMastered?: boolean; // Mastery threshold (>= 80%)
  stars: number;
  pointsAwarded: number; // Competitive Points
  reviewItems: QuestionReviewItem[];
  completedAt?: string;
  isFirstAttempt?: boolean;

  // C.9.7: Explicit Educational & Competitive Metadata
  score?: number; // Educational score alias (accuracy)
  competitivePoints?: number; // Competitive points alias (XP)
  firstAttemptCount?: number; // Count of questions correct on first attempt
  retriesCount?: number; // Total retries/errors count
  timeoutsCount?: number; // Total timeouts count
}

export interface StudentProfile {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  fatherPhone?: string;
  password?: string;
  age?: string;
  school?: string;
  grade: string;
  academicYear?: string;
  quranMemorization?: string;
  prayerCommitment: string;
  prayerMosque?: string;
  skills?: string;
  hobbies?: string;
  videoGames?: string;
  screenTime?: string;
  socialPlatforms?: string[];
  telegramAccount?: string;
  totalPoints: number;
  totalStars: number;
  avatar?: string;
  registeredAt?: string;
  teacherNotes?: string;
  parentId?: string;
  supervisorId?: string;
}

export interface ThemeMode {
  id: string;
  name: string;
  arabicLabel: string;
  description: string;
  unlockPoints: number;
  isUnlockedByDefault: boolean;
  bg: string;
  cardBg: string;
  primary: string;
  primaryHover: string;
  accent: string;
  text: string;
  textMuted: string;
  border: string;
  fontTitle: string;
  fontContent: string;
  fontHadith: string;
  badgeBg: string;
  badgeText: string;
  overlayPattern?: string;
  category?: 'wahy' | 'dark' | 'gray' | 'warm' | 'white' | 'classic';
  isWahyFeatured?: boolean;
}

export interface DesignSettings {
  activeThemeId: string;
  globalFont: string;
  fontSize: number; // Base font size in px (e.g. 16)
  isDarkMode: boolean;
  selfScrollSpeed?: number; // 1 (بطيء جداً) to 5 (سريع جداً)
}

export interface ReaderPreferences {
  selfScrollSpeed: number;
}

export interface LessonAudioExplanation {
  lessonId: string;
  audioTitle?: string;
  teacherName?: string;
  audioUrl?: string;
  audioDuration?: number;
  isAvailable: boolean;
}

export interface LessonAudio {
  id: string;
  lessonId: string;
  title: string;
  fileName: string;
  mimeType: string;
  size: number; // in bytes
  createdAt: string;
  updatedAt: string;
  duration?: number; // duration in seconds
  storageKey?: string;
}

export interface TeacherProfile {
  name: string;
  title: string;
  specialty: string;
  bio: string;
  qualifications: string;
  certifications: string;
  contactMethod?: string;
  whatsappPhone?: string;
  email?: string;
  avatar?: string;
  missionStatement?: string;
}

export type ExamType = 'weekly' | 'periodic' | 'term' | 'final';

export interface OfficialExam {
  id: string;
  code: string; // e.g. "WEEK-01", "DAWRI-01", "TERM-01", "FINAL-2026"
  title: string;
  subtitle?: string;
  type: ExamType;
  questions: Question[];
  pointsPerQuestion: number; // standard 5 points per question
  passingPercentage: number; // e.g. 70 or 80
  isActive: boolean;
  createdAt: string;
  description?: string;
}

export interface StudentExamResult {
  id: string;
  examId: string;
  examCode: string;
  examTitle: string;
  examType: ExamType;
  studentId: string;
  studentName: string;
  studentAvatar?: string;
  totalQuestions: number;
  correctAnswersCount: number;
  wrongAnswersCount: number;
  percentage: number;
  pointsEarned: number;
  passed: boolean;
  completedAt: string;
  reviewItems?: QuestionReviewItem[];
}

export interface CertificateItem {
  id: string;
  studentId: string;
  studentName: string;
  title: string;
  type: 'periodic' | 'term' | 'final' | 'curriculum-mastery';
  milestoneDescription: string;
  issueDate: string;
  teacherName: string;
  scorePercentage: number;
  honorsTitle: string; // e.g. "تقدير ممتاز مع مرتبة الشرف"
  certificateCode: string; // Verification code
}

