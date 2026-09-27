import { Question } from '../types';

/**
 * Default number of questions to assemble for a standard lesson quiz attempt.
 * Configurable via options.quizSize.
 */
export const DEFAULT_QUIZ_SIZE = 10;

/**
 * Options to configure quiz sampling.
 */
export interface QuizSamplingOptions {
  /**
   * Target number of questions to select. Defaults to DEFAULT_QUIZ_SIZE (10).
   */
  quizSize?: number;

  /**
   * Optional custom random function (e.g. for deterministic seeding or testing).
   * Defaults to Math.random.
   */
  randomFn?: () => number;
}

/**
 * Fisher-Yates array shuffle using a provided random function.
 */
export function shuffleArray<T>(array: readonly T[], randomFn: () => number = Math.random): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(randomFn() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Randomized Balanced Sampling for Quiz Assembly.
 *
 * Selects a balanced subset of questions from a lesson bank while adhering to:
 * 1. Difficulty Level Balancing (~30% Foundational, ~30% Intermediate, ~40% Advanced).
 * 2. Question Type Diversity (round-robin multi-type sampling across available types).
 * 3. Strict Deduplication (each question ID appears at most once).
 * 4. Safety & Edge Cases (safe fallback when pool size is smaller than requested).
 * 5. Shuffled Final Presentation (questions presented in engaging randomized sequence).
 *
 * @param lessonQuestions All available questions for the target lesson (e.g. 20 questions).
 * @param options Configuration options including quizSize and randomFn.
 * @returns A balanced array of Question objects ready for QuizEngine.
 */
export function sampleQuizQuestions(
  lessonQuestions: readonly Question[],
  options?: QuizSamplingOptions
): Question[] {
  const randomFn = options?.randomFn ?? Math.random;
  const requestedSize = options?.quizSize ?? DEFAULT_QUIZ_SIZE;

  // Edge case 1: Empty pool
  if (!lessonQuestions || lessonQuestions.length === 0) {
    return [];
  }

  // Edge case 2: Request non-positive size
  const targetSize = Math.max(1, requestedSize);

  // Edge case 3: Pool is smaller than or equal to requested size -> return shuffled full pool
  if (lessonQuestions.length <= targetSize) {
    return shuffleArray(lessonQuestions, randomFn);
  }

  // Define target difficulty levels
  const LEVEL_GOOD = 'للطالب الجيدين';
  const LEVEL_DILIGENT = 'للطالب المجتهدين';
  const LEVEL_SMART = 'للأذكياء';

  // Group questions by difficulty level
  const byLevel: Record<string, Question[]> = {
    [LEVEL_GOOD]: lessonQuestions.filter((q) => q.level === LEVEL_GOOD),
    [LEVEL_DILIGENT]: lessonQuestions.filter((q) => q.level === LEVEL_DILIGENT),
    [LEVEL_SMART]: lessonQuestions.filter((q) => q.level === LEVEL_SMART),
  };

  // Target proportions: 30% Good, 30% Diligent, 40% Smart
  const idealGood = Math.round(targetSize * 0.3);
  const idealDiligent = Math.round(targetSize * 0.3);
  const idealSmart = targetSize - (idealGood + idealDiligent);

  // Clamp ideal quotas to what is actually available in the bank
  const actualGood = Math.min(idealGood, byLevel[LEVEL_GOOD].length);
  const actualDiligent = Math.min(idealDiligent, byLevel[LEVEL_DILIGENT].length);
  const actualSmart = Math.min(idealSmart, byLevel[LEVEL_SMART].length);

  const levelQuotas: Record<string, number> = {
    [LEVEL_GOOD]: actualGood,
    [LEVEL_DILIGENT]: actualDiligent,
    [LEVEL_SMART]: actualSmart,
  };

  const selected: Question[] = [];
  const selectedIds = new Set<number>();

  /**
   * Helper: Selects N questions from a difficulty bucket while maximizing type diversity.
   * Groups questions by type, then performs round-robin picks across types.
   */
  const pickFromBucket = (bucket: Question[], quota: number) => {
    if (quota <= 0 || bucket.length === 0) return;

    // Group available questions in this bucket by QuestionType
    const byType: Record<string, Question[]> = {};
    for (const q of bucket) {
      if (!selectedIds.has(q.id)) {
        if (!byType[q.type]) {
          byType[q.type] = [];
        }
        byType[q.type].push(q);
      }
    }

    // Shuffle questions within each type group
    const typeKeys = shuffleArray(Object.keys(byType), randomFn);
    for (const type of typeKeys) {
      byType[type] = shuffleArray(byType[type], randomFn);
    }

    let pickedCount = 0;
    while (pickedCount < quota) {
      let madeProgress = false;
      for (const type of typeKeys) {
        if (pickedCount >= quota) break;
        const candidates = byType[type];
        while (candidates && candidates.length > 0) {
          const candidate = candidates.pop()!;
          if (!selectedIds.has(candidate.id)) {
            selected.push(candidate);
            selectedIds.add(candidate.id);
            pickedCount++;
            madeProgress = true;
            break;
          }
        }
      }
      // If no candidate could be picked in a full round, break to avoid infinite loop
      if (!madeProgress) break;
    }
  };

  // Execute balanced pick for each difficulty tier
  pickFromBucket(byLevel[LEVEL_GOOD], levelQuotas[LEVEL_GOOD]);
  pickFromBucket(byLevel[LEVEL_DILIGENT], levelQuotas[LEVEL_DILIGENT]);
  pickFromBucket(byLevel[LEVEL_SMART], levelQuotas[LEVEL_SMART]);

  // If quotas were constrained and total is still less than targetSize, fill from unselected pool
  if (selected.length < targetSize) {
    const remainingPool = shuffleArray(
      lessonQuestions.filter((q) => !selectedIds.has(q.id)),
      randomFn
    );
    for (const q of remainingPool) {
      if (selected.length >= targetSize) break;
      selected.push(q);
      selectedIds.add(q.id);
    }
  }

  // Shuffle final selection so questions appear in varied pedagogical order
  return shuffleArray(selected, randomFn);
}
