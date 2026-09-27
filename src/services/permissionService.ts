import { UserRole, Permission, CurrentUser } from '../types';

/**
 * Role Permission Matrix
 * Maps each Constitutional & Platform Role to authorized capabilities.
 */
export const ROLE_PERMISSIONS: Record<UserRole, readonly Permission[]> = {
  // 1. PROGRAMMER / SYSTEM MANAGER:
  programmer: [
    'manage_system',
    'view_student_area',
    'view_student_progress',
  ] as const,

  // 2. INSTITUTION MANAGER:
  institution_manager: [
    'manage_institution',
    'manage_teachers',
    'manage_students',
    'manage_lessons',
    'authorize_lesson_unlock',
    'view_student_progress',
    'view_student_area',
  ] as const,

  // 3. SUPERVISOR / PEDAGOGICAL MENTOR:
  supervisor: [
    'manage_students',
    'view_student_progress',
    'view_student_area',
  ] as const,

  // 4. TEACHER:
  teacher: [
    'manage_students',
    'manage_lessons',
    'authorize_lesson_unlock',
    'view_student_progress',
    'view_student_area',
  ] as const,

  // 5. PARENT / GUARDIAN:
  parent: [
    'view_student_progress',
    'view_student_area',
  ] as const,

  // 6. STUDENT:
  student: [
    'view_student_area',
  ] as const,
};

/**
 * Central Permission Checker
 * Evaluates whether a given user or role possesses a specific capability.
 *
 * @param userOrRole The CurrentUser object or UserRole string
 * @param permission The required Permission
 * @returns boolean indicating whether the permission is granted
 */
export function can(
  userOrRole: CurrentUser | UserRole | null | undefined,
  permission: Permission
): boolean {
  if (!userOrRole) {
    return false;
  }

  const role: UserRole = typeof userOrRole === 'string' ? userOrRole : userOrRole.role;
  const permissions = ROLE_PERMISSIONS[role];

  if (!permissions) {
    return false;
  }

  return permissions.includes(permission);
}

/**
 * Human-readable Arabic Role Titles
 */
export const ROLE_LABELS: Record<UserRole, string> = {
  programmer: 'المبرمج / مدير النظام',
  institution_manager: 'مدير المؤسسة / المشرف العام',
  supervisor: 'المشرف التربوي',
  teacher: 'المعلم / المربي الفاضل',
  parent: 'ولي الأمر',
  student: 'طالب العلم',
};

