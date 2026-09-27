import { StudentProfile } from '../types';

export const ACADEMIC_YEARS = [
  '2024 / 2025',
  '2025 / 2026',
  '2026 / 2027',
  '2027 / 2028',
];

export const ACADEMIC_GRADES = [
  'الصف الأول الابتدائي',
  'الصف الثاني الابتدائي',
  'الصف الثالث الابتدائي',
  'الصف الرابع الابتدائي',
  'الصف الخامس الابتدائي',
  'الصف السادس الابتدائي',
  'الصف الأول الإعدادي',
  'الصف الثاني الإعدادي',
  'الصف الثالث الإعدادي',
  'الصف الأول الثانوي',
  'الصف الثاني الثانوي',
  'الصف الثالث الثانوي',
];

export const PRAYER_GENERAL_OPTIONS = [
  'أحافظ عليها دائماً',
  'أحافظ عليها غالباً',
  'أتقطع أحياناً',
  'أتقطع كثيراً',
  'أتكاسل عن الصلاة وأحتاج إلى تحسين المحافظة عليها',
];

export const PRAYER_MOSQUE_OPTIONS = [
  'أحافظ على جميع الصلوات في المسجد',
  'أحافظ على معظم الصلوات في المسجد',
  'أصلي بعضها في المسجد وبعضها في المنزل',
  'أصلي في المسجد أحياناً',
  'أصلي في المنزل غالباً',
];

export const SOCIAL_PLATFORMS = [
  'واتساب (WhatsApp)',
  'تيليجرام (Telegram)',
  'يوتيوب (YouTube)',
  'فيسبوك (Facebook)',
  'إنستجرام (Instagram)',
  'سناب شات (Snapchat)',
];

export const LEARNING_GOALS = [
  'أفهم ديني وأعبد الله على بصيرة',
  'أتعلم الأحكام الشرعية الصحيحة',
  'أكون طالب علم وأحفظ المتون',
  'أستفيد في حياتي اليومية وأعلم غيري',
  'جميع ما سبق',
];

export const INITIAL_STUDENTS: StudentProfile[] = [
  {
    id: 'student-1',
    name: 'أحمد محمد علي',
    email: 'ahmed@bidayatfaqih.edu',
    password: '123',
    phone: '01012345678',
    fatherPhone: '01112345678',
    age: '14',
    school: 'مدرسة عمر بن الخطاب النموذجية',
    grade: 'الصف الثاني الإعدادي',
    academicYear: '2025 / 2026',
    quranMemorization: '5 أجزاء',
    prayerCommitment: 'أحافظ عليها دائماً',
    prayerMosque: 'أحافظ على جميع الصلوات في المسجد',
    skills: 'الخط العربي، الإلقاء',
    hobbies: 'القراءة، السباحة',
    videoGames: 'ألعاب ذكاء وألغاز',
    screenTime: 'ساعتان يومياً',
    socialPlatforms: ['واتساب (WhatsApp)', 'تيليجرام (Telegram)'],
    telegramAccount: '@ahmed_faqih',
    totalPoints: 240,
    totalStars: 9,
    registeredAt: '2026-08-01',
    teacherNotes: 'طالب متميز وشغوف بالفقه ومحافظ على الأحاديث.',
  },
  {
    id: 'student-2',
    name: 'عبد الرحمن محمود حسن',
    email: 'abdelrahman@bidayatfaqih.edu',
    password: '123',
    phone: '01098765432',
    fatherPhone: '01234567890',
    age: '16',
    school: 'مدرسة الأندلس الثانوية',
    grade: 'الصف الأول الثانوي',
    academicYear: '2025 / 2026',
    quranMemorization: '10 أجزاء',
    prayerCommitment: 'أحافظ عليها دائماً',
    prayerMosque: 'أصلي بعضها في المسجد وبعضها في المنزل',
    skills: 'الحفظ السريع، التلخيص',
    hobbies: 'قراءة كتب التاريخ',
    videoGames: 'استراتيجية وبناء',
    screenTime: 'ساعة ونصف',
    socialPlatforms: ['واتساب (WhatsApp)', 'يوتيوب (YouTube)'],
    telegramAccount: '@abdelrahman_h',
    totalPoints: 100,
    totalStars: 4,
    registeredAt: '2026-08-10',
    teacherNotes: 'يحتاج لمتابعة في أدلة مسح الخفين.',
  },
];
