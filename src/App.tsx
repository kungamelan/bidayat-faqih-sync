import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Navbar } from './components/Navbar';
import { ThemeDrawer } from './components/ThemeDrawer';
import { WelcomeView } from './views/WelcomeView';
import { LoginView } from './views/LoginView';
import { DashboardView } from './views/DashboardView';
import { LessonView } from './views/LessonView';
import { QuizEngine } from './components/QuizEngine';
import { QuizReviewView } from './views/QuizReviewView';
import { TeacherCMSView } from './views/TeacherCMSView';
import { AboutTeacherView } from './views/AboutTeacherView';
import { ExamsView } from './views/ExamsView';
import { CertificatesView } from './views/CertificatesView';
import { LeaderboardView } from './views/LeaderboardView';
import { SplashScreen } from './components/SplashScreen';
import { FULL_LESSONS_DATA } from './data/curriculumData';
import { FULL_QUIZ_BANK } from './data/quizBank';
import { THEME_MODES } from './data/themeConfig';
import { Lesson, StudentProfile, StudentProgress, DesignSettings, UserRole, CurrentUser, Question, QuizAttemptResult, TeacherProfile } from './types';
import * as storageService from './services/storageService';
import { can } from './services/permissionService';
import { sampleQuizQuestions, DEFAULT_QUIZ_SIZE } from './services/quizSamplingService';

export default function App() {
  // Cinematic Animated Opening Splash Screen State (C.9.8)
  const [showSplash, setShowSplash] = useState<boolean>(true);

  // Navigation View State
  const [currentView, setCurrentView] = useState<
    | 'welcome'
    | 'login'
    | 'dashboard'
    | 'lesson'
    | 'quiz'
    | 'quiz-review'
    | 'teacher-cms'
    | 'about-teacher'
    | 'exams'
    | 'certificates'
    | 'leaderboard'
  >('welcome');

  // User & Student State
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [userRole, setUserRole] = useState<UserRole>('student');
  const [currentStudent, setCurrentStudent] = useState<StudentProfile | null>(null);
  const [studentsList, setStudentsList] = useState<StudentProfile[]>(() =>
    storageService.loadStudents()
  );

  // Curriculum Data & Lesson Selection
  const [lessons, setLessons] = useState<Lesson[]>(() =>
    storageService.loadLessons()
  );
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(() => {
    const initialLessons = storageService.loadLessons();
    return initialLessons[0] || FULL_LESSONS_DATA[0];
  });

  // Admin / Teacher Lesson Unlock State (Dual-Unlock: Lesson 1 is unlocked by default, others require teacher approval)
  const [adminUnlocks, setAdminUnlocks] = useState<{ [lessonId: string]: boolean }>(() =>
    storageService.loadAdminUnlocks()
  );

  // Student Learning Progress
  const [studentProgress, setStudentProgress] = useState<StudentProgress>(() =>
    storageService.loadProgress()
  );

  // Active quiz session state: assembled balanced sample and attempt key
  const [activeQuizQuestions, setActiveQuizQuestions] = useState<Question[]>([]);
  const [quizAttemptKey, setQuizAttemptKey] = useState<number>(0);
  // Quiz attempt history state (Single Source of Truth)
  const [quizAttempts, setQuizAttempts] = useState<QuizAttemptResult[]>(() =>
    storageService.loadQuizAttempts()
  );
  const [activeReviewAttempt, setActiveReviewAttempt] = useState<QuizAttemptResult | null>(null);

  // Design Settings & Theme State
  const [designSettings, setDesignSettings] = useState<DesignSettings>(() => {
    const stored = storageService.loadDesignSettings();
    const readerPrefs = storageService.loadReaderPreferences();
    return (
      stored || {
        activeThemeId: 'simple-academic',
        globalFont: 'Cairo',
        fontSize: 16,
        isDarkMode: false,
        selfScrollSpeed: readerPrefs.selfScrollSpeed || 3,
      }
    );
  });
  const [isThemeDrawerOpen, setIsThemeDrawerOpen] = useState(false);

  // Teacher Profile
  const [teacherProfile, setTeacherProfile] = useState(() => {
    const stored = storageService.loadTeacherProfile();
    return (
      stored || {
        name: 'فضيلة الشيخ / الباحث الأكاديمي',
        qualifications: 'ماجستير في الدراسات اللغوية والبلاغية، وباحث دكتوراه في العلوم الشرعية.',
        certifications: 'إجازات متواترة في كتب السنة والحديث الشريف، ورئيس جمعية خيرية رسمية.',
        bio: 'متخصص في هندسة المعرفة الفقهية وتقريب المتون العلمية للناشئة والشباب بأحدث الوسائل التكنولوجية.',
      }
    );
  });

  // Active theme object
  const activeTheme =
    THEME_MODES.find((t) => t.id === designSettings.activeThemeId) || THEME_MODES[0];

  // Restore session on initial mount
  useEffect(() => {
    const session = storageService.loadSession();
    if (session && session.userId) {
      if (session.role === 'teacher') {
        const teacherProfileData = storageService.loadTeacherProfile() || teacherProfile;
        setCurrentUser({
          id: session.userId,
          role: 'teacher',
          displayName: teacherProfileData?.name || 'فضيلة المعلم',
        });
        setUserRole('teacher');
        setCurrentStudent(null);
        setCurrentView('teacher-cms');
      } else if (session.role === 'programmer') {
        setCurrentUser({
          id: session.userId,
          role: 'programmer',
          displayName: 'مدير النظام',
        });
        setUserRole('programmer');
        setCurrentStudent(null);
        setCurrentView('dashboard');
      } else if (session.role === 'institution_manager') {
        setCurrentUser({
          id: session.userId,
          role: 'institution_manager',
          displayName: 'مدير المؤسسة',
        });
        setUserRole('institution_manager');
        setCurrentStudent(null);
        setCurrentView('dashboard');
      } else {
        // Student role
        const allStudents = storageService.loadStudents();
        const matched = allStudents.find((s) => s.id === session.userId);
        if (matched) {
          setCurrentStudent(matched);
          setCurrentUser({
            id: matched.id,
            role: 'student',
            displayName: matched.name,
            email: matched.email,
          });
          setUserRole('student');
          setCurrentView('dashboard');
        } else {
          storageService.clearSession();
          setCurrentUser(null);
          setUserRole('student');
          setCurrentStudent(null);
        }
      }
    }
  }, []);

  // Sync state changes with persistence layer
  useEffect(() => {
    storageService.saveStudents(studentsList);
  }, [studentsList]);

  useEffect(() => {
    storageService.saveAdminUnlocks(adminUnlocks);
  }, [adminUnlocks]);

  useEffect(() => {
    storageService.saveProgress(studentProgress);
  }, [studentProgress]);

  useEffect(() => {
    storageService.saveLessons(lessons);
  }, [lessons]);

  useEffect(() => {
    storageService.saveDesignSettings(designSettings);
    if (designSettings.selfScrollSpeed) {
      storageService.saveReaderPreferences({ selfScrollSpeed: designSettings.selfScrollSpeed });
    }
  }, [designSettings]);

  useEffect(() => {
    storageService.saveTeacherProfile(teacherProfile);
  }, [teacherProfile]);

  // Sync css variables with body/html
  useEffect(() => {
    document.documentElement.style.setProperty('--app-font', designSettings.globalFont);
    document.documentElement.style.setProperty('--app-font-size', `${designSettings.fontSize}px`);
    document.body.style.backgroundColor = activeTheme.bg;
    document.body.style.color = activeTheme.text;
  }, [designSettings, activeTheme]);

  // Handlers
  const handleRegisterStudent = (newProfile: Partial<StudentProfile>) => {
    const student: StudentProfile = {
      id: `student-${Date.now()}`,
      name: newProfile.name || 'طالب جديد',
      email: newProfile.email || '',
      phone: newProfile.phone || '',
      fatherPhone: newProfile.fatherPhone || '',
      password: newProfile.password || '',
      age: newProfile.age || '14',
      school: newProfile.school || '',
      grade: newProfile.grade || 'الصف الثاني الإعدادي',
      academicYear: newProfile.academicYear || '2025 / 2026',
      quranMemorization: newProfile.quranMemorization || '',
      prayerCommitment: newProfile.prayerCommitment || 'أحافظ عليها دائماً',
      prayerMosque: newProfile.prayerMosque || 'أحافظ على جميع الصلوات في المسجد',
      skills: newProfile.skills || '',
      hobbies: newProfile.hobbies || '',
      videoGames: newProfile.videoGames || '',
      screenTime: newProfile.screenTime || '',
      socialPlatforms: newProfile.socialPlatforms || [],
      telegramAccount: newProfile.telegramAccount || '',
      avatar: newProfile.avatar || 'avatar-scholar',
      totalPoints: 0,
      totalStars: 0,
      registeredAt: new Date().toISOString().split('T')[0],
    };

    setStudentsList((prev) => {
      const updated = [...prev, student];
      storageService.saveStudents(updated);
      return updated;
    });
    setCurrentStudent(student);
    setCurrentUser({
      id: student.id,
      role: 'student',
      displayName: student.name,
      email: student.email,
    });
    setUserRole('student');
    storageService.saveSession({
      userId: student.id,
      role: 'student',
      displayName: student.name,
      currentView: 'dashboard',
    });
    setCurrentView('dashboard');
  };

  const handleStudentLogin = (identifier: string, pass: string): boolean => {
    const cleanId = identifier.trim().toLowerCase();
    const cleanPass = pass.trim();

    if (!cleanId || !cleanPass) {
      return false;
    }

    const found = studentsList.find(
      (s) =>
        (s.name.trim().toLowerCase() === cleanId ||
          (s.email && s.email.trim().toLowerCase() === cleanId)) &&
        Boolean(s.password && s.password === cleanPass)
    );

    if (found) {
      setCurrentStudent(found);
      setCurrentUser({
        id: found.id,
        role: 'student',
        displayName: found.name,
        email: found.email,
      });
      setUserRole('student');
      storageService.saveSession({
        userId: found.id,
        role: 'student',
        displayName: found.name,
        currentView: 'dashboard',
      });
      setCurrentView('dashboard');
      return true;
    }

    return false;
  };

  const handleTeacherLoginSuccess = () => {
    const teacherId = 'teacher-primary';
    const teacherName = teacherProfile?.name || 'فضيلة المعلم';
    setCurrentUser({
      id: teacherId,
      role: 'teacher',
      displayName: teacherName,
    });
    setUserRole('teacher');
    setCurrentStudent(null);
    storageService.saveSession({
      userId: teacherId,
      role: 'teacher',
      displayName: teacherName,
      currentView: 'teacher-cms',
    });
  };

  const handleToggleAdminUnlock = (lessonId: string) => {
    setAdminUnlocks((prev) => {
      const updated = {
        ...prev,
        [lessonId]: !prev[lessonId],
      };
      storageService.saveAdminUnlocks(updated);
      return updated;
    });
  };

  const handleUpdateLesson = (updatedLesson: Lesson) => {
    setLessons((prev) => {
      const updated = prev.map((l) => (l.id === updatedLesson.id ? updatedLesson : l));
      storageService.saveLessons(updated);
      return updated;
    });
    if (selectedLesson?.id === updatedLesson.id) {
      setSelectedLesson(updatedLesson);
    }
  };

  const handleUpdateStudentPoints = (studentId: string, deltaPoints: number) => {
    setStudentsList((prev) => {
      const updated = prev.map((s) =>
        s.id === studentId ? { ...s, totalPoints: s.totalPoints + deltaPoints } : s
      );
      storageService.saveStudents(updated);
      return updated;
    });
    if (currentStudent?.id === studentId) {
      setCurrentStudent((prev) =>
        prev ? { ...prev, totalPoints: prev.totalPoints + deltaPoints } : null
      );
    }
  };

  const startQuizForLesson = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    const lessonBank = FULL_QUIZ_BANK.filter((q) => q.lessonId === lesson.id);
    const sampled = sampleQuizQuestions(lessonBank, { quizSize: DEFAULT_QUIZ_SIZE });
    setActiveQuizQuestions(sampled);
    setQuizAttemptKey((prev) => prev + 1);
    setCurrentView('quiz');
  };

  const handleFinishQuiz = (result: QuizAttemptResult) => {
    if (!selectedLesson) return;

    // 1. Detect if this is the first attempt for this lesson
    const priorAttempts = quizAttempts.filter((a) => a.lessonId === selectedLesson.id);
    const isFirstAttempt = priorAttempts.length === 0;

    // RULE 3: XP / Points are awarded on the first attempt only!
    const pointsAwarded = isFirstAttempt ? result.pointsAwarded : 0;
    const isMastered = result.percentage >= 80;

    const attemptToSave: QuizAttemptResult = {
      ...result,
      isFirstAttempt,
      pointsAwarded,
      isMastered,
    };

    // Persist to attempt history (Single Source of Truth)
    storageService.saveQuizAttempt(attemptToSave);
    setQuizAttempts((prev) => [...prev, attemptToSave]);
    setActiveReviewAttempt(attemptToSave);

    // Update progress state
    setStudentProgress((prev) => {
      const prevInfo = prev[selectedLesson.id] || {
        finished: false,
        score: 0,
        stars: 0,
        attemptsCount: 0,
        highestStars: 0,
        lastScore: 0,
        bestScore: 0,
        mastered: false,
      };

      const updated = {
        ...prev,
        [selectedLesson.id]: {
          finished: prevInfo.finished || result.passed, // Initial passing (>= 60%)
          mastered: prevInfo.mastered || isMastered,     // Mastery threshold (>= 80%)
          score: result.correctAnswersCount,
          stars: Math.max(prevInfo.stars, result.stars),
          attemptsCount: prevInfo.attemptsCount + 1,
          highestStars: Math.max(prevInfo.highestStars, result.stars),
          lastScore: result.correctAnswersCount,
          bestScore: Math.max(prevInfo.bestScore, result.correctAnswersCount),
          completedAt: (result.passed || isMastered) ? (prevInfo.completedAt || new Date().toISOString()) : prevInfo.completedAt,
          masteredAt: isMastered ? (prevInfo.masteredAt || new Date().toISOString()) : prevInfo.masteredAt,
        },
      };
      storageService.saveProgress(updated);
      return updated;
    });

    // Update student points & stars in profile
    if (currentStudent) {
      // Points: only awarded if first attempt!
      const newPoints = currentStudent.totalPoints + pointsAwarded;

      // Stars: bounded delta improvement so stars do not inflate endlessly
      const prevStarsForLesson = studentProgress[selectedLesson.id]?.highestStars || 0;
      const starsDelta = Math.max(0, result.stars - prevStarsForLesson);
      const newStars = currentStudent.totalStars + starsDelta;

      const updatedStudent: StudentProfile = {
        ...currentStudent,
        totalPoints: newPoints,
        totalStars: newStars,
      };

      setCurrentStudent(updatedStudent);
      setStudentsList((prev) => {
        const updated = prev.map((s) => (s.id === currentStudent.id ? updatedStudent : s));
        storageService.saveStudents(updated);
        return updated;
      });
    }

    // Transition to post-quiz pedagogical review view
    setCurrentView('quiz-review');
  };

  const handleNextLesson = () => {
    if (!selectedLesson) return;
    // Dual-Unlock: requires mastery (>= 80%) on current lesson
    const isCurrentMastered = studentProgress[selectedLesson.id]?.mastered ?? false;
    if (!isCurrentMastered) {
      setCurrentView('dashboard');
      return;
    }

    const currentIndex = lessons.findIndex((l) => l.id === selectedLesson.id);
    if (currentIndex >= 0 && currentIndex < lessons.length - 1) {
      const nextLesson = lessons[currentIndex + 1];
      const isNextUnlocked = adminUnlocks[nextLesson.id] ?? false;
      if (isNextUnlocked) {
        setSelectedLesson(nextLesson);
        setCurrentView('lesson');
      } else {
        setCurrentView('dashboard');
      }
    } else {
      setCurrentView('dashboard');
    }
  };

  const handleUpdateStudentAvatar = (newAvatar: string) => {
    if (!currentStudent) return;
    const updated = { ...currentStudent, avatar: newAvatar };
    setCurrentStudent(updated);
    storageService.saveStudent(updated);
    setStudentsList(storageService.loadStudents());
  };

  const handleUpdateTeacherProfile = (profile: Partial<TeacherProfile>) => {
    storageService.saveTeacherProfile(profile);
    const updated = storageService.loadTeacherProfile();
    setTeacherProfile(updated);
  };

  const handleLogout = () => {
    storageService.clearSession();
    setCurrentStudent(null);
    setCurrentUser(null);
    setUserRole('student');
    setCurrentView('welcome');
  };

  return (
    <>
      {/* C.9.8 — Cinematic Opening Identity Splash Screen */}
      <AnimatePresence>
        {showSplash && (
          <motion.div
            key="cinematic-splash-overlay"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: 'easeInOut' }}
            className="fixed inset-0 z-[99999]"
          >
            <SplashScreen onComplete={() => setShowSplash(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {!showSplash && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="min-h-screen flex flex-col transition-colors duration-300 antialiased"
          style={{
            backgroundColor: activeTheme.bg,
            color: activeTheme.text,
            fontFamily: designSettings.globalFont || 'Cairo',
          }}
          dir="rtl"
        >
          {/* Top Navbar */}
          <Navbar
            currentUser={currentUser}
            currentStudent={currentStudent}
            userRole={userRole}
            currentView={currentView}
            onNavigate={(view) => setCurrentView(view)}
            onOpenThemeDrawer={() => setIsThemeDrawerOpen(true)}
            onLogout={handleLogout}
            activeTheme={activeTheme}
          />

      {/* Main Content Area with View Routing */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <AnimatePresence mode="wait">
          {currentView === 'welcome' && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <WelcomeView
                activeTheme={activeTheme}
                onRegisterNewStudent={handleRegisterStudent}
                onOpenTeacherLogin={() => setCurrentView('teacher-cms')}
                onGoToLogin={() => setCurrentView('login')}
              />
            </motion.div>
          )}

          {currentView === 'login' && (
            <motion.div
              key="login"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <LoginView
                activeTheme={activeTheme}
                onLogin={handleStudentLogin}
                onBackToWelcome={() => setCurrentView('welcome')}
                onGoToRegister={() => setCurrentView('welcome')}
              />
            </motion.div>
          )}

          {currentView === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <DashboardView
                lessons={lessons}
                currentStudent={
                  currentStudent || {
                    id: 'guest',
                    name: 'طالب العلم',
                    grade: 'الصف الثاني الإعدادي',
                    academicYear: '2025 / 2026',
                    prayerCommitment: 'أحافظ عليها دائماً',
                    totalPoints: 0,
                    totalStars: 0,
                  }
                }
                studentProgress={studentProgress}
                adminUnlocks={adminUnlocks}
                activeTheme={activeTheme}
                onSelectLesson={(lesson) => {
                  setSelectedLesson(lesson);
                  setCurrentView('lesson');
                }}
                onStartQuiz={(lesson) => {
                  startQuizForLesson(lesson);
                }}
                onNavigateToTeacher={() => setCurrentView('about-teacher')}
                onNavigateToExams={() => setCurrentView('exams')}
                onNavigateToCertificates={() => setCurrentView('certificates')}
                onNavigateToLeaderboard={() => setCurrentView('leaderboard')}
                onUpdateStudentAvatar={handleUpdateStudentAvatar}
              />
            </motion.div>
          )}

          {currentView === 'lesson' && selectedLesson && (() => {
            const latestLessonAttempt = quizAttempts
              .filter((a) => a.lessonId === selectedLesson.id)
              .slice(-1)[0] || null;

            return (
              <motion.div
                key={`lesson-${selectedLesson.id}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <LessonView
                  lesson={selectedLesson}
                  activeTheme={activeTheme}
                  designSettings={designSettings}
                  onStartQuiz={() => startQuizForLesson(selectedLesson)}
                  onBackToDashboard={() => setCurrentView('dashboard')}
                  isLessonFinished={studentProgress[selectedLesson.id]?.finished || false}
                  isLessonMastered={studentProgress[selectedLesson.id]?.mastered || false}
                  onOpenThemeDrawer={() => setIsThemeDrawerOpen(true)}
                  onReviewQuiz={
                    latestLessonAttempt
                      ? () => {
                          setActiveReviewAttempt(latestLessonAttempt);
                          setCurrentView('quiz-review');
                        }
                      : undefined
                  }
                />
              </motion.div>
            );
          })()}

          {currentView === 'quiz' && selectedLesson && (
            <motion.div
              key={`quiz-${selectedLesson.id}-${quizAttemptKey}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <QuizEngine
                lesson={selectedLesson}
                questions={activeQuizQuestions.length > 0 ? activeQuizQuestions : sampleQuizQuestions(FULL_QUIZ_BANK.filter((q) => q.lessonId === selectedLesson.id), { quizSize: DEFAULT_QUIZ_SIZE })}
                activeTheme={activeTheme}
                onFinishQuiz={handleFinishQuiz}
                onRetryQuiz={() => startQuizForLesson(selectedLesson)}
                onBackToLesson={() => setCurrentView('lesson')}
                onBackToDashboard={() => setCurrentView('dashboard')}
              />
            </motion.div>
          )}

          {currentView === 'quiz-review' && (() => {
            const reviewResult =
              activeReviewAttempt ||
              (selectedLesson
                ? quizAttempts.filter((a) => a.lessonId === selectedLesson.id).slice(-1)[0]
                : null) ||
              quizAttempts[quizAttempts.length - 1] ||
              null;

            return (
              <motion.div
                key={`quiz-review-${reviewResult?.id || reviewResult?.lessonId || 'none'}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {reviewResult ? (
                  <QuizReviewView
                    result={reviewResult}
                    activeTheme={activeTheme}
                    onRetryQuiz={() => {
                      if (selectedLesson) {
                        startQuizForLesson(selectedLesson);
                      }
                    }}
                    onNextLesson={(() => {
                      if (!selectedLesson) return undefined;
                      // Dual-Unlock: Student must achieve mastery (percentage >= 80%) on this lesson
                      const isMastered = reviewResult
                        ? (reviewResult.isMastered ?? (reviewResult.percentage >= 80))
                        : (studentProgress[selectedLesson.id]?.mastered ?? false);
                      if (!isMastered) return undefined;

                      const currentIndex = lessons.findIndex((l) => l.id === selectedLesson.id);
                      if (currentIndex < 0 || currentIndex >= lessons.length - 1) return undefined;
                      const nextLesson = lessons[currentIndex + 1];
                      const isNextUnlocked = adminUnlocks[nextLesson.id] ?? false;
                      return isNextUnlocked ? handleNextLesson : undefined;
                    })()}
                    onBackToLesson={() => setCurrentView('lesson')}
                    onBackToDashboard={() => setCurrentView('dashboard')}
                  />
                ) : (
                  <div className="text-center py-12" dir="rtl">
                    <p className="text-slate-400 mb-4">لا توجد محاولة اختبار سابقة مسجلة للمراجعة.</p>
                    <button
                      onClick={() => setCurrentView('dashboard')}
                      className="px-6 py-2.5 bg-slate-800 text-white rounded-xl text-xs font-bold"
                    >
                      العودة للوحة الدروس
                    </button>
                  </div>
                )}
              </motion.div>
            );
          })()}

          {currentView === 'teacher-cms' && (
            <motion.div
              key="teacher-cms"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <TeacherCMSView
                lessons={lessons}
                studentsList={studentsList}
                studentProgress={studentProgress}
                adminUnlocks={adminUnlocks}
                onToggleAdminUnlock={handleToggleAdminUnlock}
                onUpdateLesson={handleUpdateLesson}
                onUpdateStudentPoints={handleUpdateStudentPoints}
                onUpdateTeacherProfile={handleUpdateTeacherProfile}
                teacherProfile={teacherProfile}
                activeTheme={activeTheme}
                onBackToDashboard={() => setCurrentView(currentStudent ? 'dashboard' : 'welcome')}
                onTeacherLoginSuccess={handleTeacherLoginSuccess}
                isAlreadyAuthenticated={userRole === 'teacher'}
              />
            </motion.div>
          )}

          {currentView === 'about-teacher' && (
            <motion.div
              key="about-teacher"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <AboutTeacherView
                teacherProfile={teacherProfile}
                activeTheme={activeTheme}
                onBack={() => setCurrentView(currentStudent ? 'dashboard' : 'welcome')}
              />
            </motion.div>
          )}

          {currentView === 'exams' && (
            <motion.div
              key="exams"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ExamsView
                currentStudent={
                  currentStudent || {
                    id: 'guest',
                    name: 'طالب العلم',
                    grade: 'الصف الثاني الإعدادي',
                    academicYear: '2025 / 2026',
                    prayerCommitment: 'أحافظ عليها دائماً',
                    totalPoints: 0,
                    totalStars: 0,
                  }
                }
                activeTheme={activeTheme}
                onBackToDashboard={() => setCurrentView('dashboard')}
                onNavigateToCertificates={() => setCurrentView('certificates')}
                onUpdateStudentPoints={handleUpdateStudentPoints}
              />
            </motion.div>
          )}

          {currentView === 'certificates' && (
            <motion.div
              key="certificates"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <CertificatesView
                currentStudent={
                  currentStudent || {
                    id: 'guest',
                    name: 'طالب العلم',
                    grade: 'الصف الثاني الإعدادي',
                    academicYear: '2025 / 2026',
                    prayerCommitment: 'أحافظ عليها دائماً',
                    totalPoints: 0,
                    totalStars: 0,
                  }
                }
                activeTheme={activeTheme}
                onBackToDashboard={() => setCurrentView('dashboard')}
                onNavigateToExams={() => setCurrentView('exams')}
              />
            </motion.div>
          )}

          {currentView === 'leaderboard' && (
            <motion.div
              key="leaderboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <LeaderboardView
                currentStudent={
                  currentStudent || {
                    id: 'guest',
                    name: 'طالب العلم',
                    grade: 'الصف الثاني الإعدادي',
                    academicYear: '2025 / 2026',
                    prayerCommitment: 'أحافظ عليها دائماً',
                    totalPoints: 0,
                    totalStars: 0,
                  }
                }
                activeTheme={activeTheme}
                onBackToDashboard={() => setCurrentView('dashboard')}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Theme Drawer / Settings Popover */}
      <ThemeDrawer
        isOpen={isThemeDrawerOpen}
        onClose={() => setIsThemeDrawerOpen(false)}
        designSettings={designSettings}
        onUpdateDesignSettings={(newSettings) =>
          setDesignSettings((prev) => ({ ...prev, ...newSettings }))
        }
        currentStudent={currentStudent}
      />
    </motion.div>
  )}
</>
);
}
