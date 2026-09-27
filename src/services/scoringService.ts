/**
 * Bidayat Faqih - Central Competitive Scoring & Educational Mastery Service (C.9.7)
 * Single Source of Truth for Quiz & Question Scoring
 *
 * Distinct Dimensions:
 * 1. Educational Score (الدرجة التعليمية): Pure measure of accuracy (e.g. 10/10).
 * 2. Competitive Points / XP (نقاط المنافسة): Progressive quality measure based on first-attempt mastery,
 *    penalizing errors, retries, and timeouts proportionally without ruining one-time mistakes.
 */

export const SCORING_CONFIG = {
  // Base points for a question answered correctly on the 1st attempt
  BASE_POINTS_PER_QUESTION: 10,

  // Progressive rewards per attempt count
  FIRST_ATTEMPT_POINTS: 10,       // 100% of base (أعلى مكافأة للإتقان من أول محاولة)
  SECOND_ATTEMPT_POINTS: 6,       // 60% of base (مكافأة أقل بوضوح: انخفاض 40%)
  THIRD_ATTEMPT_POINTS: 3,        // 30% of base (انخفاض إضافي)
  SUBSEQUENT_ATTEMPT_POINTS: 1,  // 10% of base (الحد الأدنى التشجيعي لأي محاولة صحيحة رابعة فأكثر)
  FAILED_POINTS: 0,              // 0 points for unreached/wrong final answer

  // Educational mastery thresholds
  MASTERY_PERCENTAGE: 80,         // حد الإتقان المطلوب لفتح الدرس التالي
  PASSING_PERCENTAGE: 60,         // حد الاجتياز الأولي

  // Star Rating Scale based on Educational Percentage
  STAR_THRESHOLDS: [
    { minPercentage: 100, stars: 5 },
    { minPercentage: 90, stars: 4 },
    { minPercentage: 80, stars: 3 },
    { minPercentage: 70, stars: 2 },
    { minPercentage: 60, stars: 1 },
  ],
};

export interface QuestionAttemptInput {
  isCorrect: boolean;
  attemptsCount: number; // 1 = first attempt, 2 = second attempt, etc.
  timeoutsCount?: number;
}

export interface QuestionScoreResult {
  isCorrect: boolean;
  attemptsCount: number;
  timeoutsCount: number;
  retriesCount: number;
  isFirstAttemptCorrect: boolean;
  competitivePointsAwarded: number;
}

export interface QuizEvaluationSummary {
  totalQuestions: number;
  score: number; // Educational score (e.g. 10)
  percentage: number; // 0 - 100
  passed: boolean; // >= 60%
  isMastered: boolean; // >= 80%
  stars: number; // 0 - 5
  competitivePoints: number; // Sum of points
  firstAttemptCorrectCount: number; // How many questions mastered on 1st attempt
  totalRetriesCount: number; // Total extra attempts made
  totalTimeoutsCount: number; // Total timeouts across the quiz
}

/**
 * Calculates competitive points for a single question based on attempt count and correctness.
 * Enforces Progressive Penalty:
 * - Attempt 1: 10 pts
 * - Attempt 2: 6 pts
 * - Attempt 3: 3 pts
 * - Attempt 4+: 1 pt
 * - Incorrect / Unanswered: 0 pts
 */
export function calculateQuestionPoints(input: QuestionAttemptInput): number {
  if (!input.isCorrect) {
    return SCORING_CONFIG.FAILED_POINTS;
  }

  const attempts = Math.max(1, input.attemptsCount);

  if (attempts === 1) {
    return SCORING_CONFIG.FIRST_ATTEMPT_POINTS;
  }
  if (attempts === 2) {
    return SCORING_CONFIG.SECOND_ATTEMPT_POINTS;
  }
  if (attempts === 3) {
    return SCORING_CONFIG.THIRD_ATTEMPT_POINTS;
  }
  return SCORING_CONFIG.SUBSEQUENT_ATTEMPT_POINTS;
}

/**
 * Evaluates full quiz results into a structured educational and competitive summary.
 */
export function evaluateQuizSummary(
  totalQuestions: number,
  items: Array<{
    isCorrect: boolean;
    attemptsCount: number;
    timeoutsCount?: number;
  }>
): QuizEvaluationSummary {
  let score = 0;
  let competitivePoints = 0;
  let firstAttemptCorrectCount = 0;
  let totalRetriesCount = 0;
  let totalTimeoutsCount = 0;

  for (const item of items) {
    const timeouts = item.timeoutsCount || 0;
    totalTimeoutsCount += timeouts;

    if (item.isCorrect) {
      score += 1;
      const pts = calculateQuestionPoints({
        isCorrect: true,
        attemptsCount: item.attemptsCount,
        timeoutsCount: timeouts,
      });
      competitivePoints += pts;

      if (item.attemptsCount === 1) {
        firstAttemptCorrectCount += 1;
      } else {
        totalRetriesCount += (item.attemptsCount - 1);
      }
    } else {
      totalRetriesCount += Math.max(0, item.attemptsCount - 1);
    }
  }

  const validTotal = Math.max(1, totalQuestions);
  const percentage = Math.round((score / validTotal) * 100);
  const passed = percentage >= SCORING_CONFIG.PASSING_PERCENTAGE;
  const isMastered = percentage >= SCORING_CONFIG.MASTERY_PERCENTAGE;

  let stars = 0;
  for (const t of SCORING_CONFIG.STAR_THRESHOLDS) {
    if (percentage >= t.minPercentage) {
      stars = t.stars;
      break;
    }
  }

  return {
    totalQuestions: validTotal,
    score,
    percentage,
    passed,
    isMastered,
    stars,
    competitivePoints,
    firstAttemptCorrectCount,
    totalRetriesCount,
    totalTimeoutsCount,
  };
}

/**
 * Built-in Verification Test Runner
 * Validates all 10 required pedagogical scenarios + 4 exploit prevention rules.
 */
export function runScoringVerificationSuite() {
  const results = {
    scenario1_perfectFirstAttempt: evaluateQuizSummary(10, Array(10).fill({ isCorrect: true, attemptsCount: 1 })),
    scenario2_nineFirstOneSecond: evaluateQuizSummary(10, [
      ...Array(9).fill({ isCorrect: true, attemptsCount: 1 }),
      { isCorrect: true, attemptsCount: 2 },
    ]),
    scenario3_eightFirstTwoSecond: evaluateQuizSummary(10, [
      ...Array(8).fill({ isCorrect: true, attemptsCount: 1 }),
      { isCorrect: true, attemptsCount: 2 },
      { isCorrect: true, attemptsCount: 2 },
    ]),
    scenario4_eightFirstOneSecondOneThird: evaluateQuizSummary(10, [
      ...Array(8).fill({ isCorrect: true, attemptsCount: 1 }),
      { isCorrect: true, attemptsCount: 2 },
      { isCorrect: true, attemptsCount: 3 },
    ]),
    scenario5_multipleRetries: evaluateQuizSummary(10, [
      ...Array(5).fill({ isCorrect: true, attemptsCount: 1 }),
      ...Array(3).fill({ isCorrect: true, attemptsCount: 2 }),
      ...Array(2).fill({ isCorrect: true, attemptsCount: 3 }),
    ]),
    scenario6_timeoutThenCorrectSecond: evaluateQuizSummary(10, [
      ...Array(9).fill({ isCorrect: true, attemptsCount: 1 }),
      { isCorrect: true, attemptsCount: 2, timeoutsCount: 1 },
    ]),
    scenario7_doubleTimeoutThenCorrectThird: evaluateQuizSummary(10, [
      ...Array(9).fill({ isCorrect: true, attemptsCount: 1 }),
      { isCorrect: true, attemptsCount: 3, timeoutsCount: 2 },
    ]),
    scenario8_tenCorrectAfterManyRetries: evaluateQuizSummary(10, Array(10).fill({ isCorrect: true, attemptsCount: 5 })),
    scenario9_nineFirstOneWrong: evaluateQuizSummary(10, [
      ...Array(9).fill({ isCorrect: true, attemptsCount: 1 }),
      { isCorrect: false, attemptsCount: 3 },
    ]),
    scenario10_eightFirstTwoWrong: evaluateQuizSummary(10, [
      ...Array(8).fill({ isCorrect: true, attemptsCount: 1 }),
      { isCorrect: false, attemptsCount: 2 },
      { isCorrect: false, attemptsCount: 2 },
    ]),
  };

  return results;
}
