/**
 * Bidayat Faqih — WhatsApp Contact Configuration (C.9 External Communication)
 *
 * Central configuration for institution WhatsApp communication launcher.
 * NOTE: Do NOT invent a phone number. If the official number is not yet supplied,
 * keep the placeholder empty or clearly flagged for configuration.
 */

// OFFICIAL INSTITUTION WHATSAPP NUMBER
// Replace with the real institution phone number in international format without + or dashes (e.g., '966500000000' or '201000000000')
export const WHATSAPP_NUMBER = 'PLACEHOLDER_WHATSAPP_NUMBER';

export interface WhatsAppMessageOptions {
  studentName?: string;
  lessonTitle?: string;
  customMessage?: string;
  role?: string;
}

/**
 * Builds a standardized pre-filled message based on available real context
 */
export function buildPreFilledMessage(options?: WhatsAppMessageOptions): string {
  if (options?.customMessage) {
    return options.customMessage.trim();
  }

  if (options?.studentName && options?.lessonTitle) {
    return `السلام عليكم ورحمة الله وبركاته، أود الاستفسار بخصوص الطالب (${options.studentName}) في (${options.lessonTitle}) — برنامج بداية فقيه.`;
  }

  if (options?.studentName) {
    return `السلام عليكم ورحمة الله وبركاته، أود الاستفسار بخصوص الطالب (${options.studentName}) في برنامج بداية فقيه.`;
  }

  if (options?.lessonTitle) {
    return `السلام عليكم ورحمة الله وبركاته، أود الاستفسار حول مسألة فقهية في (${options.lessonTitle}) — برنامج بداية فقيه.`;
  }

  return `السلام عليكم ورحمة الله وبركاته، أود الاستفسار والتواصل بخصوص برنامج بداية فقيه (فقه الطهارة).`;
}

/**
 * Cleans phone number by removing spaces, dashes, parentheses and plus sign
 */
export function sanitizePhoneNumber(phone: string): string {
  return phone.replace(/[^0-9]/g, '');
}

/**
 * Builds a valid WhatsApp web/mobile launcher URL
 * If the configured number is empty or a placeholder, it still builds a wa.me URL with the prefilled message.
 */
export function createWhatsAppLink(options?: WhatsAppMessageOptions, customNumber?: string): string {
  const rawNumber = customNumber || WHATSAPP_NUMBER;
  const cleanNumber = sanitizePhoneNumber(rawNumber);
  const messageText = buildPreFilledMessage(options);
  const encodedText = encodeURIComponent(messageText);

  // If valid cleaned number is available
  if (cleanNumber && cleanNumber.length >= 7) {
    return `https://wa.me/${cleanNumber}?text=${encodedText}`;
  }

  // Fallback if number is not yet configured (opens WhatsApp with pre-filled message prompt)
  return `https://wa.me/?text=${encodedText}`;
}
