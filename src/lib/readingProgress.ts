export type ReadingContentType = 'chapters' | 'notes' | 'transcripts' | 'slides';

export interface ReadingBookmark {
  courseSlug: string;
  type: ReadingContentType;
  slug: string;
  title: string;
  url: string;
  scrollPercent: number; // 0 - 100
  scrollY?: number;
  slideIndex?: number;
  totalSlides?: number;
  updatedAt: number;
  isManual?: boolean;
}

export type ReadingProgressStore = Record<string, ReadingBookmark>;

export const STORAGE_KEY = 'mynotes_reading_progress_v2';
export const PROGRESS_EVENT_NAME = 'mynotes_reading_progress_updated';

export function getBookmarkKey(courseSlug: string, type: ReadingContentType): string {
  return `${courseSlug.toLowerCase()}:${type.toLowerCase()}`;
}

export function loadAllBookmarks(): ReadingProgressStore {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load reading progress from localStorage:', err);
    return {};
  }
}

export function saveAllBookmarks(store: ReadingProgressStore): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    window.dispatchEvent(new CustomEvent(PROGRESS_EVENT_NAME, { detail: store }));
  } catch (err) {
    console.error('Failed to save reading progress to localStorage:', err);
  }
}

export function getCourseTypeBookmark(
  courseSlug: string,
  type: ReadingContentType
): ReadingBookmark | null {
  const store = loadAllBookmarks();
  const key = getBookmarkKey(courseSlug, type);
  return store[key] || null;
}

export function saveCourseTypeBookmark(entry: Omit<ReadingBookmark, 'updatedAt'>): void {
  const store = loadAllBookmarks();
  const key = getBookmarkKey(entry.courseSlug, entry.type);
  store[key] = {
    ...entry,
    updatedAt: Date.now(),
  };
  saveAllBookmarks(store);
}

export function clearCourseTypeBookmark(courseSlug: string, type: ReadingContentType): void {
  const store = loadAllBookmarks();
  const key = getBookmarkKey(courseSlug, type);
  if (store[key]) {
    delete store[key];
    saveAllBookmarks(store);
  }
}

export function getCourseBookmarks(courseSlug: string): Record<string, ReadingBookmark> {
  const store = loadAllBookmarks();
  const targetPrefix = `${courseSlug.toLowerCase()}:`;
  const result: Record<string, ReadingBookmark> = {};

  for (const [key, val] of Object.entries(store)) {
    if (key.startsWith(targetPrefix)) {
      result[val.type] = val;
    }
  }

  return result;
}

export function formatRelativeTime(timestamp: number): string {
  const diffSec = Math.floor((Date.now() - timestamp) / 1000);
  if (diffSec < 60) return 'just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay === 1) return 'yesterday';
  return `${diffDay}d ago`;
}

