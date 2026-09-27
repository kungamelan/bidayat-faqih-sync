/**
 * Bidayat Faqih — Lesson Audio Service Layer (C.9.5)
 *
 * Implements a clean, decoupled abstraction for storing and retrieving lesson audio.
 * Uses browser IndexedDB for binary storage to strictly avoid LocalStorage quota overflow.
 *
 * ARCHITECTURAL GUARANTEE:
 * - No audio binary / base64 is EVER stored in localStorage.
 * - IndexedDB holds Blobs and metadata keyed by `lessonId`.
 * - Can be swapped in the future for Firebase / S3 / Supabase Storage without UI refactoring.
 */

import { LessonAudio } from '../types';

const DB_NAME = 'bidayat_faqih_audio_v1';
const DB_VERSION = 1;
const STORE_METADATA = 'audio_metadata';
const STORE_BLOBS = 'audio_blobs';

// Supported Web Audio MIME types & extensions
export const ALLOWED_AUDIO_EXTENSIONS = ['.mp3', '.wav', '.m4a', '.ogg', '.aac'];
export const MAX_AUDIO_SIZE_BYTES = 60 * 1024 * 1024; // 60 MB

// Cache of active blob URLs for proper garbage collection
const activeObjectUrls = new Map<string, string>();

/**
 * Initializes and returns the IndexedDB database instance
 */
function openAudioDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB غير مدعوم في هذا المتصفح.'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_METADATA)) {
        db.createObjectStore(STORE_METADATA, { keyPath: 'lessonId' });
      }
      if (!db.objectStoreNames.contains(STORE_BLOBS)) {
        db.createObjectStore(STORE_BLOBS); // keyed by lessonId string
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('فشل فتح قاعدة بيانات الصوت.'));
  });
}

/**
 * Validates audio file type and size
 */
export function validateAudioFile(file: File): { isValid: boolean; error?: string } {
  if (!file) {
    return { isValid: false, error: 'لم يتم اختيار أي ملف.' };
  }

  if (file.size > MAX_AUDIO_SIZE_BYTES) {
    return {
      isValid: false,
      error: `حجم الملف (${(file.size / (1024 * 1024)).toFixed(1)} ميغابايت) يتجاوز الحد الأقصى المسموح (60 ميغابايت).`,
    };
  }

  const fileNameLower = file.name.toLowerCase();
  const hasValidExt = ALLOWED_AUDIO_EXTENSIONS.some((ext) => fileNameLower.endsWith(ext));
  const isAudioMime = file.type.startsWith('audio/') || file.type === 'video/mp4' || file.type === 'application/ogg';

  if (!hasValidExt && !isAudioMime) {
    return {
      isValid: false,
      error: 'نوع الملف غير مدعوم. الصيغ المدعومة هي: MP3, WAV, M4A, OGG, AAC.',
    };
  }

  return { isValid: true };
}

/**
 * Saves or replaces lesson audio in IndexedDB
 */
export async function saveLessonAudio(
  lessonId: string,
  file: File,
  customTitle?: string
): Promise<LessonAudio> {
  const validation = validateAudioFile(file);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  const db = await openAudioDatabase();

  const now = new Date().toISOString();
  const metadata: LessonAudio = {
    id: `audio-${lessonId}-${Date.now()}`,
    lessonId,
    title: customTitle || file.name.replace(/\.[^/.]+$/, ''),
    fileName: file.name,
    mimeType: file.type || 'audio/mpeg',
    size: file.size,
    createdAt: now,
    updatedAt: now,
    storageKey: `blob-${lessonId}`,
  };

  // Revoke previous URL if any exists
  if (activeObjectUrls.has(lessonId)) {
    URL.revokeObjectURL(activeObjectUrls.get(lessonId)!);
    activeObjectUrls.delete(lessonId);
  }

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_METADATA, STORE_BLOBS], 'readwrite');
    const metaStore = transaction.objectStore(STORE_METADATA);
    const blobStore = transaction.objectStore(STORE_BLOBS);

    metaStore.put(metadata);
    blobStore.put(file, lessonId);

    transaction.oncomplete = () => {
      resolve(metadata);
    };

    transaction.onerror = () => {
      reject(transaction.error || new Error('فشل حفظ الملف الصوتي.'));
    };
  });
}

/**
 * Gets the metadata for a lesson audio
 */
export async function getLessonAudio(lessonId: string): Promise<LessonAudio | null> {
  try {
    const db = await openAudioDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_METADATA, 'readonly');
      const store = transaction.objectStore(STORE_METADATA);
      const request = store.get(lessonId);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error(`[audioService] Failed to load audio metadata for ${lessonId}:`, error);
    return null;
  }
}

/**
 * Gets the raw binary Blob for a lesson audio
 */
export async function getLessonAudioBlob(lessonId: string): Promise<Blob | null> {
  try {
    const db = await openAudioDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_BLOBS, 'readonly');
      const store = transaction.objectStore(STORE_BLOBS);
      const request = store.get(lessonId);

      request.onsuccess = () => resolve((request.result as Blob) || null);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error(`[audioService] Failed to load audio blob for ${lessonId}:`, error);
    return null;
  }
}

/**
 * Gets a playable URL for the lesson audio
 */
export async function getLessonAudioUrl(lessonId: string): Promise<string | null> {
  const blob = await getLessonAudioBlob(lessonId);
  if (!blob) return null;

  if (activeObjectUrls.has(lessonId)) {
    URL.revokeObjectURL(activeObjectUrls.get(lessonId)!);
  }

  const url = URL.createObjectURL(blob);
  activeObjectUrls.set(lessonId, url);
  return url;
}

/**
 * Deletes a lesson audio (metadata and binary blob)
 */
export async function deleteLessonAudio(lessonId: string): Promise<void> {
  const db = await openAudioDatabase();

  if (activeObjectUrls.has(lessonId)) {
    URL.revokeObjectURL(activeObjectUrls.get(lessonId)!);
    activeObjectUrls.delete(lessonId);
  }

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_METADATA, STORE_BLOBS], 'readwrite');
    const metaStore = transaction.objectStore(STORE_METADATA);
    const blobStore = transaction.objectStore(STORE_BLOBS);

    metaStore.delete(lessonId);
    blobStore.delete(lessonId);

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error || new Error('فشل حذف الملف الصوتي.'));
  });
}

/**
 * Lists all audio metadata records across all lessons
 */
export async function listAllLessonAudios(): Promise<LessonAudio[]> {
  try {
    const db = await openAudioDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_METADATA, 'readonly');
      const store = transaction.objectStore(STORE_METADATA);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('[audioService] Failed to list all audios:', error);
    return [];
  }
}

/**
 * Revokes a generated URL when component unmounts
 */
export function revokeAudioUrl(url: string): void {
  try {
    URL.revokeObjectURL(url);
  } catch {
    // Silent
  }
}
