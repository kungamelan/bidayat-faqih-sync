import {
  StudentProfile,
  StudentProgress,
  Lesson,
  DesignSettings,
  UserRole,
  QuizAttemptResult,
  ReaderPreferences,
  TeacherProfile,
  OfficialExam,
  StudentExamResult,
  CertificateItem,
} from '../types';
import { INITIAL_STUDENTS } from '../data/studentsSchema';
import { FULL_LESSONS_DATA } from '../data/curriculumData';
import { INITIAL_OFFICIAL_EXAMS } from '../data/initialExams';

/**
 * Storage Namespace & Version Prefix
 * Temporary MVP Client Persistence Layer (Local Development / MVP only)
 */
const STORAGE_PREFIX = 'bidayat_faqih_v1_';

const STORAGE_KEYS = {
  STUDENTS: `${STORAGE_PREFIX}students`,
  SESSION: `${STORAGE_PREFIX}session`,
  PROGRESS: `${STORAGE_PREFIX}progress`,
  UNLOCKS: `${STORAGE_PREFIX}unlocks`,
  LESSONS: `${STORAGE_PREFIX}lessons`,
  DESIGN: `${STORAGE_PREFIX}design_settings`,
  READER_PREFERENCES: `${STORAGE_PREFIX}reader_preferences`,
  TEACHER_PROFILE: `${STORAGE_PREFIX}teacher_profile`,
  LATEST_QUIZ_RESULT: `${STORAGE_PREFIX}latest_quiz_result`,
  QUIZ_ATTEMPTS: `${STORAGE_PREFIX}quiz_attempts`,
  OFFICIAL_EXAMS: `${STORAGE_PREFIX}official_exams`,
  STUDENT_EXAM_RESULTS: `${STORAGE_PREFIX}student_exam_results`,
  CERTIFICATES: `${STORAGE_PREFIX}certificates`,
};

export interface StoredSession {
  userId: string;
  role: UserRole;
  displayName?: string;
  currentView?: string;
  lastActive?: string;
}

export const DEFAULT_ADMIN_UNLOCKS: { [lessonId: string]: boolean } = {
  'lesson-1': true,
  'lesson-2': false,
  'lesson-3': false,
  'lesson-4': false,
  'lesson-5': false,
  'lesson-6': false,
  'lesson-7': false,
  'lesson-8': false,
  'lesson-9': false,
};

export const DEFAULT_STUDENT_PROGRESS: StudentProgress = {
  'lesson-1': {
    finished: false,
    score: 0,
    stars: 0,
    attemptsCount: 0,
    highestStars: 0,
    lastScore: 0,
    bestScore: 0,
    mastered: false,
  },
};

/**
 * Safe LocalStorage Helper with Exception Catching
 */
function safeGetItem(key: string): string | null {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return null;
    }
    return window.localStorage.getItem(key);
  } catch (error) {
    console.warn(`[storageService] Failed to read ${key} from localStorage:`, error);
    return null;
  }
}

function safeSetItem(key: string, value: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
    }
  } catch (error) {
    console.warn(`[storageService] Failed to write ${key} to localStorage:`, error);
  }
}

function safeRemoveItem(key: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(key);
    }
  } catch (error) {
    console.warn(`[storageService] Failed to remove ${key} from localStorage:`, error);
  }
}

// ==========================================
// 1. STUDENTS MANAGEMENT
// ==========================================

export function loadStudents(): StudentProfile[] {
  const data = safeGetItem(STORAGE_KEYS.STUDENTS);
  if (!data) {
    // Initial launch: seed with INITIAL_STUDENTS and save once
    saveStudents(INITIAL_STUDENTS);
    return INITIAL_STUDENTS;
  }
  try {
    const parsed = JSON.parse(data);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (error) {
    console.error('[storageService] Malformed students data in storage. Falling back to INITIAL_STUDENTS.', error);
  }
  return INITIAL_STUDENTS;
}

export function saveStudents(students: StudentProfile[]): void {
  if (!Array.isArray(students)) return;
  safeSetItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
}

export function saveStudent(student: StudentProfile): void {
  if (!student || !student.id) return;
  const current = loadStudents();
  const index = current.findIndex((s) => s.id === student.id);
  let updated: StudentProfile[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = student;
  } else {
    updated = [...current, student];
  }
  saveStudents(updated);
}

// ==========================================
// 2. SESSION MANAGEMENT
// ==========================================

export function loadSession(): StoredSession | null {
  const data = safeGetItem(STORAGE_KEYS.SESSION);
  if (!data) return null;
  try {
    const parsed = JSON.parse(data) as StoredSession;
    // Support either userId or legacy studentId
    const id = parsed?.userId || (parsed as any)?.studentId;
    if (parsed && typeof id === 'string' && id.trim().length > 0 && parsed.role) {
      return {
        ...parsed,
        userId: id.trim(),
      };
    }
  } catch (error) {
    console.error('[storageService] Malformed session data in storage. Clearing session.', error);
    clearSession();
  }
  return null;
}

export function saveSession(session: StoredSession): void {
  if (!session || !session.userId) return;
  safeSetItem(STORAGE_KEYS.SESSION, JSON.stringify({
    ...session,
    lastActive: new Date().toISOString(),
  }));
}

export function clearSession(): void {
  safeRemoveItem(STORAGE_KEYS.SESSION);
}

// ==========================================
// 3. STUDENT PROGRESS
// ==========================================

export function loadProgress(): StudentProgress {
  const data = safeGetItem(STORAGE_KEYS.PROGRESS);
  if (!data) {
    return DEFAULT_STUDENT_PROGRESS;
  }
  try {
    const parsed = JSON.parse(data);
    if (parsed && typeof parsed === 'object') {
      const normalized: StudentProgress = {};
      for (const [k, v] of Object.entries(parsed as StudentProgress)) {
        normalized[k] = {
          ...v,
          mastered: v.mastered ?? (v.bestScore >= 8 || v.highestStars >= 3 || false),
        };
      }
      return normalized;
    }
  } catch (error) {
    console.error('[storageService] Malformed progress data. Falling back to default progress.', error);
  }
  return DEFAULT_STUDENT_PROGRESS;
}

export function saveProgress(progress: StudentProgress): void {
  if (!progress || typeof progress !== 'object') return;
  safeSetItem(STORAGE_KEYS.PROGRESS, JSON.stringify(progress));
}

// ==========================================
// 4. ADMIN UNLOCKS (DUAL-UNLOCK)
// ==========================================

export function loadAdminUnlocks(): { [lessonId: string]: boolean } {
  const data = safeGetItem(STORAGE_KEYS.UNLOCKS);
  if (!data) {
    return DEFAULT_ADMIN_UNLOCKS;
  }
  try {
    const parsed = JSON.parse(data);
    if (parsed && typeof parsed === 'object') {
      return { ...DEFAULT_ADMIN_UNLOCKS, ...parsed };
    }
  } catch (error) {
    console.error('[storageService] Malformed admin unlocks data. Falling back to default.', error);
  }
  return DEFAULT_ADMIN_UNLOCKS;
}

export function saveAdminUnlocks(unlocks: { [lessonId: string]: boolean }): void {
  if (!unlocks || typeof unlocks !== 'object') return;
  safeSetItem(STORAGE_KEYS.UNLOCKS, JSON.stringify(unlocks));
}

// ==========================================
// 5. LESSONS CURRICULUM
// ==========================================

export function loadLessons(): Lesson[] {
  const data = safeGetItem(STORAGE_KEYS.LESSONS);
  if (!data) {
    return FULL_LESSONS_DATA;
  }
  try {
    const parsed = JSON.parse(data);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (error) {
    console.error('[storageService] Malformed lessons data. Falling back to FULL_LESSONS_DATA.', error);
  }
  return FULL_LESSONS_DATA;
}

export function saveLessons(lessons: Lesson[]): void {
  if (!Array.isArray(lessons)) return;
  safeSetItem(STORAGE_KEYS.LESSONS, JSON.stringify(lessons));
}

// ==========================================
// 6. DESIGN SETTINGS & THEMES
// ==========================================

export function loadDesignSettings(): DesignSettings | null {
  const data = safeGetItem(STORAGE_KEYS.DESIGN);
  if (!data) return null;
  try {
    const parsed = JSON.parse(data);
    if (parsed && typeof parsed.activeThemeId === 'string') {
      return parsed;
    }
  } catch (error) {
    console.error('[storageService] Malformed design settings. Falling back to default.', error);
  }
  return null;
}

export function saveDesignSettings(settings: DesignSettings): void {
  if (!settings || typeof settings !== 'object') return;
  safeSetItem(STORAGE_KEYS.DESIGN, JSON.stringify(settings));
}

export function loadReaderPreferences(): ReaderPreferences {
  const data = safeGetItem(STORAGE_KEYS.READER_PREFERENCES);
  if (!data) return { selfScrollSpeed: 3 };
  try {
    const parsed = JSON.parse(data);
    if (parsed && typeof parsed.selfScrollSpeed === 'number') {
      return parsed;
    }
  } catch (error) {
    console.error('[storageService] Malformed reader preferences:', error);
  }
  return { selfScrollSpeed: 3 };
}

export function saveReaderPreferences(prefs: ReaderPreferences): void {
  if (!prefs || typeof prefs !== 'object') return;
  safeSetItem(STORAGE_KEYS.READER_PREFERENCES, JSON.stringify(prefs));
}

// ==========================================
// 7. TEACHER PROFILE
// ==========================================

export const DEFAULT_TEACHER_PROFILE: TeacherProfile = {
  name: 'فضيلة الشيخ / الباحث الأكاديمي',
  title: 'المشرف العلمي والتربوي على منهاج بداية فقيه',
  specialty: 'الدراسات الشرعية، البلاغة العربية، وإجازات متون الفقه والحديث',
  bio: 'باحث في العلوم الشرعية واللغوية، متخصص في هندسة المعرفة الفقهية وتقريب العلوم الإسلامية الأصيلة للناشئة والشباب بأحدث الوسائل التكنولوجية التفاعلية.',
  qualifications: 'ماجستير في الدراسات اللغوية والبلاغية، وباحث دكتوراه في العلوم الإنسانية والخطاب المعرفي، مع عناية خاصة بمتون الفقه المقارن وأصول الفتيا.',
  certifications: 'إجازات علمية متصلة السند في كتب السنة النبوية الشريفة ومتون الفقه المعتمدة، مع رئاسة جمعيات ومؤسسات تربوية شرعية معتمدة.',
  contactMethod: 'التواصل عبر واتساب المنصة وحلقات المتابعة التفاعلية',
  whatsappPhone: '+966500000000',
  email: 'teacher@bidayat-faqih.edu',
  missionStatement: 'غرس الفهم الفقهي السليم المبني على الدليل من الكتاب والسنة بفهم سلف الأمة، وبناء جيل فتي يفقه دينه بيقين واعتزاز.',
};

export function loadTeacherProfile(): TeacherProfile {
  const data = safeGetItem(STORAGE_KEYS.TEACHER_PROFILE);
  if (!data) return DEFAULT_TEACHER_PROFILE;
  try {
    const parsed = JSON.parse(data);
    return { ...DEFAULT_TEACHER_PROFILE, ...parsed };
  } catch (error) {
    console.error('[storageService] Malformed teacher profile data.', error);
    return DEFAULT_TEACHER_PROFILE;
  }
}

export function saveTeacherProfile(profile: Partial<TeacherProfile>): void {
  if (!profile || typeof profile !== 'object') return;
  const current = loadTeacherProfile();
  const merged = { ...current, ...profile };
  safeSetItem(STORAGE_KEYS.TEACHER_PROFILE, JSON.stringify(merged));
}

// ==========================================
// 8. QUIZ ATTEMPT HISTORY & LATEST RESULT
// ==========================================

/**
 * Loads all quiz attempt records from local storage.
 * Includes minimal backward-compatibility migration:
 * If no history array exists yet, checks for legacy single-slot result,
 * wraps it safely into history without deleting the legacy key.
 */
export function loadQuizAttempts(): QuizAttemptResult[] {
  const data = safeGetItem(STORAGE_KEYS.QUIZ_ATTEMPTS);
  if (data) {
    try {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch (error) {
      console.error('[storageService] Malformed quiz attempts data.', error);
    }
  }

  // Backward-compatibility: Check if legacy single-slot result exists
  const legacyData = safeGetItem(STORAGE_KEYS.LATEST_QUIZ_RESULT);
  if (legacyData) {
    try {
      const legacyResult = JSON.parse(legacyData) as QuizAttemptResult;
      if (legacyResult && legacyResult.lessonId) {
        const migrated: QuizAttemptResult = {
          ...legacyResult,
          id: legacyResult.id || `legacy-${Date.now()}`,
          completedAt: legacyResult.completedAt || new Date().toISOString(),
        };
        // Persist migrated array into new key without removing the legacy key
        safeSetItem(STORAGE_KEYS.QUIZ_ATTEMPTS, JSON.stringify([migrated]));
        return [migrated];
      }
    } catch (error) {
      console.error('[storageService] Malformed legacy latest quiz result data.', error);
    }
  }

  return [];
}

/**
 * Appends a new quiz attempt to history and synchronizes the legacy slot.
 * Ensures the attempt has an ID and a completion timestamp.
 */
export function saveQuizAttempt(attempt: QuizAttemptResult): void {
  if (!attempt || !attempt.lessonId) return;

  const attemptWithMeta: QuizAttemptResult = {
    ...attempt,
    id: attempt.id || `attempt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    completedAt: attempt.completedAt || new Date().toISOString(),
  };

  const currentAttempts = loadQuizAttempts();
  const updated = [...currentAttempts, attemptWithMeta];

  safeSetItem(STORAGE_KEYS.QUIZ_ATTEMPTS, JSON.stringify(updated));

  // Keep legacy single-slot key in sync for any legacy external readers
  safeSetItem(STORAGE_KEYS.LATEST_QUIZ_RESULT, JSON.stringify(attemptWithMeta));
}

/**
 * Retrieves all attempts for a specific lesson from history.
 */
export function getQuizAttemptsForLesson(lessonId: string): QuizAttemptResult[] {
  const attempts = loadQuizAttempts();
  return attempts.filter((a) => a.lessonId === lessonId);
}

/**
 * Retrieves the latest attempt for a specific lesson from history.
 */
export function getLatestQuizAttemptForLesson(lessonId: string): QuizAttemptResult | null {
  const attempts = loadQuizAttempts();
  for (let i = attempts.length - 1; i >= 0; i--) {
    if (attempts[i].lessonId === lessonId) {
      return attempts[i];
    }
  }
  return null;
}

/**
 * Backward-compatible helper: Returns the most recent quiz attempt overall.
 * Single source of truth: derives directly from history.
 */
export function loadLatestQuizResult(): QuizAttemptResult | null {
  const attempts = loadQuizAttempts();
  if (attempts.length > 0) {
    return attempts[attempts.length - 1];
  }
  return null;
}

/**
 * Backward-compatible helper: Saves attempt using history storage.
 */
export function saveLatestQuizResult(result: QuizAttemptResult | null): void {
  if (!result) {
    safeRemoveItem(STORAGE_KEYS.LATEST_QUIZ_RESULT);
    return;
  }
  saveQuizAttempt(result);
}

// ==========================================
// 9. OFFICIAL EXAMS BY CODE
// ==========================================

export function loadOfficialExams(): OfficialExam[] {
  const data = safeGetItem(STORAGE_KEYS.OFFICIAL_EXAMS);
  if (!data) {
    saveOfficialExams(INITIAL_OFFICIAL_EXAMS);
    return INITIAL_OFFICIAL_EXAMS;
  }
  try {
    const parsed = JSON.parse(data);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (error) {
    console.error('[storageService] Malformed official exams data. Falling back to initial.', error);
  }
  return INITIAL_OFFICIAL_EXAMS;
}

export function saveOfficialExams(exams: OfficialExam[]): void {
  if (!Array.isArray(exams)) return;
  safeSetItem(STORAGE_KEYS.OFFICIAL_EXAMS, JSON.stringify(exams));
}

export function getExamByCode(code: string): OfficialExam | null {
  const cleanCode = code.trim().toUpperCase();
  const exams = loadOfficialExams();
  return exams.find((e) => e.code.toUpperCase() === cleanCode && e.isActive) || null;
}

export function saveOfficialExam(exam: OfficialExam): void {
  const exams = loadOfficialExams();
  const existingIdx = exams.findIndex((e) => e.id === exam.id || e.code.toUpperCase() === exam.code.toUpperCase());
  if (existingIdx >= 0) {
    exams[existingIdx] = exam;
  } else {
    exams.push(exam);
  }
  saveOfficialExams(exams);
}

// ==========================================
// 10. STUDENT EXAM RESULTS
// ==========================================

export function loadStudentExamResults(): StudentExamResult[] {
  const data = safeGetItem(STORAGE_KEYS.STUDENT_EXAM_RESULTS);
  if (!data) return [];
  try {
    const parsed = JSON.parse(data);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch (error) {
    console.error('[storageService] Malformed student exam results data.', error);
  }
  return [];
}

export function saveStudentExamResult(result: StudentExamResult): void {
  if (!result || !result.id) return;
  const current = loadStudentExamResults();
  const updated = [result, ...current];
  safeSetItem(STORAGE_KEYS.STUDENT_EXAM_RESULTS, JSON.stringify(updated));
}

export function getExamResultsForStudent(studentId: string): StudentExamResult[] {
  const allResults = loadStudentExamResults();
  return allResults.filter((r) => r.studentId === studentId);
}

// ==========================================
// 11. CERTIFICATES OF MERIT
// ==========================================

export function loadCertificates(): CertificateItem[] {
  const data = safeGetItem(STORAGE_KEYS.CERTIFICATES);
  if (!data) return [];
  try {
    const parsed = JSON.parse(data);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch (error) {
    console.error('[storageService] Malformed certificates data.', error);
  }
  return [];
}

export function saveCertificate(cert: CertificateItem): void {
  if (!cert || !cert.id) return;
  const current = loadCertificates();
  // Prevent duplicate certificate for same student and type
  const exists = current.some((c) => c.studentId === cert.studentId && c.type === cert.type);
  if (!exists) {
    const updated = [cert, ...current];
    safeSetItem(STORAGE_KEYS.CERTIFICATES, JSON.stringify(updated));
  }
}

export function getCertificatesForStudent(studentId: string): CertificateItem[] {
  const all = loadCertificates();
  return all.filter((c) => c.studentId === studentId);
}

// Clean up any legacy C.9 internal messaging keys from localStorage if present
try {
  safeRemoveItem(`${STORAGE_PREFIX}conversations`);
  safeRemoveItem(`${STORAGE_PREFIX}messages`);
} catch {
  // Silent ignore
}



