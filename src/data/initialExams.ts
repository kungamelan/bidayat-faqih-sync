import { OfficialExam } from '../types';
import { FULL_QUIZ_BANK } from './quizBank';

// Helper to grab questions by lesson
function getQuestionsForLessons(lessonIds: string[], count: number) {
  const filtered = FULL_QUIZ_BANK.filter((q) => lessonIds.includes(q.lessonId));
  return filtered.slice(0, count);
}

export const INITIAL_OFFICIAL_EXAMS: OfficialExam[] = [
  {
    id: 'exam-week-1',
    code: 'WEEK-01',
    title: 'اختبار الأسبوع الأول: أحكام المياه والأسآر',
    subtitle: 'تقييم أسبوعي شامل على اللقاء الأول',
    type: 'weekly',
    questions: getQuestionsForLessons(['lesson-1'], 10),
    pointsPerQuestion: 5,
    passingPercentage: 60,
    isActive: true,
    createdAt: '2026-09-01T08:00:00.000Z',
    description: 'اختبار تدريبي أسبوعي لقياس مدى استيعاب أحكام المياه الطاهرة والنجسة وسؤر الحيوانات.',
  },
  {
    id: 'exam-week-2',
    code: 'WEEK-02',
    title: 'اختبار الأسبوع الثاني: الآنية والاستنجاء وسنن الفطرة',
    subtitle: 'تقييم أسبوعي على اللقاءين الثاني والثالث',
    type: 'weekly',
    questions: getQuestionsForLessons(['lesson-2', 'lesson-3'], 10),
    pointsPerQuestion: 5,
    passingPercentage: 60,
    isActive: true,
    createdAt: '2026-09-08T08:00:00.000Z',
    description: 'اختبار أسبوعي يقيس فقه الآنية وآداب قضاء الحاجة وأحكام الاستنجاء وسنن الفطرة.',
  },
  {
    id: 'exam-dawri-1',
    code: 'DAWRI-01',
    title: 'الاختبار الدوري الأول: كتاب الطهارة',
    subtitle: 'اختبار معتمد يشمل اللقاءات 1 و 2 و 3',
    type: 'periodic',
    questions: getQuestionsForLessons(['lesson-1', 'lesson-2', 'lesson-3'], 12),
    pointsPerQuestion: 5,
    passingPercentage: 75,
    isActive: true,
    createdAt: '2026-09-15T08:00:00.000Z',
    description: 'اختبار دوري رسمي، اجتيازه بنسبة 75% فما فوق يمنح الطالب شهادة التميز في الاختبار الدوري.',
  },
  {
    id: 'exam-term-1',
    code: 'TERM-01',
    title: 'اختبار منتصف الفصل (ترم): فقه الطهارة والوضوء',
    subtitle: 'اختبار رسمي يغطي اللقاءات من 1 إلى 6',
    type: 'term',
    questions: getQuestionsForLessons(['lesson-1', 'lesson-2', 'lesson-3', 'lesson-4', 'lesson-5', 'lesson-6'], 15),
    pointsPerQuestion: 5,
    passingPercentage: 75,
    isActive: true,
    createdAt: '2026-09-20T08:00:00.000Z',
    description: 'اختبار ترم فقهي شامل يغطي النصف الأول من كتاب الطهارة، يؤهل لشهادة التفوق الفقهي.',
  },
  {
    id: 'exam-final-2026',
    code: 'FINAL-2026',
    title: 'الاختبار النهائي الشامل لكتاب الطهارة كاملاً',
    subtitle: 'الاختبار الأكبر لختام وإجازة منهاج بداية فقيه',
    type: 'final',
    questions: getQuestionsForLessons(
      ['lesson-1', 'lesson-2', 'lesson-3', 'lesson-4', 'lesson-5', 'lesson-6', 'lesson-7', 'lesson-8', 'lesson-9'],
      20
    ),
    pointsPerQuestion: 5,
    passingPercentage: 80,
    isActive: true,
    createdAt: '2026-09-25T08:00:00.000Z',
    description: 'الاختبار الختامي الشامل لجميع أبواب كتاب الطهارة. يؤهل لشهادة الإجازة الكبرى وختام المنهاج.',
  },
];
