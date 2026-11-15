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
  isCompleted?: boolean;
  completedAt?: number;
}

export type ReadingProgressStore = Record<string, ReadingBookmark>;

export interface CourseProgressStats {
  completedCount: number;
  inProgressCount: number;
  totalStarted: number;
  totalItems: number;
  percent: number; // 0 - 100
  latestActive: ReadingBookmark | null;
  completedSlugs: string[];
  typeStats: Record<string, { completed: number; inProgress: number }>;
}

export const STORAGE_KEY = 'mynotes_reading_progress_v2';
export const PROGRESS_EVENT_NAME = 'mynotes_reading_progress_updated';

/**
 * Key for section-level latest pointer (e.g. "pr-23:notes")
 */
export function getBookmarkKey(courseSlug: string, type: ReadingContentType): string {
  return `${courseSlug.toLowerCase()}:${type.toLowerCase()}`;
}

/**
 * Key for course-level latest pointer (e.g. "course:pr-23")
 */
export function getCourseKey(courseSlug: string): string {
  return `course:${courseSlug.toLowerCase()}`;
}

/**
 * Key for specific item progress (e.g. "item:pr-23:notes:lecture-01")
 */
export function getItemKey(courseSlug: string, type: ReadingContentType, slug: string): string {
  return `item:${courseSlug.toLowerCase()}:${type.toLowerCase()}:${slug.toLowerCase()}`;
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

/**
 * Retrieve progress for a specific note/chapter/slide deck.
 * Falls back to section pointer if migrated or matching.
 */
export function getItemProgress(
  courseSlug: string,
  type: ReadingContentType,
  slug: string
): ReadingBookmark | null {
  const store = loadAllBookmarks();
  const itemKey = getItemKey(courseSlug, type, slug);
  if (store[itemKey]) {
    return store[itemKey];
  }

  // Fallback: check section-level latest bookmark
  const sectionBookmark = store[getBookmarkKey(courseSlug, type)];
  if (sectionBookmark && sectionBookmark.slug?.toLowerCase() === slug.toLowerCase()) {
    return sectionBookmark;
  }

  return null;
}

/**
 * Saves progress for a specific item, while also updating section and course latest pointers.
 */
export function saveItemProgress(entry: Omit<ReadingBookmark, 'updatedAt'>): ReadingBookmark {
  const store = loadAllBookmarks();
  const itemKey = getItemKey(entry.courseSlug, entry.type, entry.slug);
  const existing = store[itemKey] || (store[getBookmarkKey(entry.courseSlug, entry.type)]?.slug === entry.slug ? store[getBookmarkKey(entry.courseSlug, entry.type)] : null);

  const isCompleted = entry.isCompleted !== undefined ? entry.isCompleted : Boolean(existing?.isCompleted);
  const completedAt = isCompleted ? (existing?.completedAt || Date.now()) : undefined;

  const updated: ReadingBookmark = {
    ...existing,
    ...entry,
    isCompleted,
    completedAt,
    updatedAt: Date.now(),
  };

  store[itemKey] = updated;

  // Update section-level pointer
  const sectionKey = getBookmarkKey(entry.courseSlug, entry.type);
  store[sectionKey] = updated;

  // Update course-level pointer
  const courseKey = getCourseKey(entry.courseSlug);
  store[courseKey] = updated;

  saveAllBookmarks(store);
  return updated;
}

/**
 * Toggle or explicitly set an item as completed or not.
 */
export function toggleItemCompleted(
  entry: Omit<ReadingBookmark, 'updatedAt'>,
  forceCompleted?: boolean
): ReadingBookmark {
  const store = loadAllBookmarks();
  const itemKey = getItemKey(entry.courseSlug, entry.type, entry.slug);
  const existing = store[itemKey] || (store[getBookmarkKey(entry.courseSlug, entry.type)]?.slug === entry.slug ? store[getBookmarkKey(entry.courseSlug, entry.type)] : null);

  const nextCompleted = forceCompleted !== undefined ? forceCompleted : !existing?.isCompleted;

  const currentPercent = entry.scrollPercent ?? existing?.scrollPercent ?? 0;
  const nextPercent = nextCompleted ? Math.max(100, currentPercent) : currentPercent;

  const updated: ReadingBookmark = {
    ...existing,
    ...entry,
    isCompleted: nextCompleted,
    completedAt: nextCompleted ? Date.now() : undefined,
    scrollPercent: nextPercent,
    updatedAt: Date.now(),
  };

  store[itemKey] = updated;

  // Update section and course pointers
  const sectionKey = getBookmarkKey(entry.courseSlug, entry.type);
  store[sectionKey] = updated;

  const courseKey = getCourseKey(entry.courseSlug);
  store[courseKey] = updated;

  saveAllBookmarks(store);
  return updated;
}

/**
 * Backward compatibility: get latest section bookmark
 */
export function getCourseTypeBookmark(
  courseSlug: string,
  type: ReadingContentType
): ReadingBookmark | null {
  const store = loadAllBookmarks();
  const key = getBookmarkKey(courseSlug, type);
  return store[key] || null;
}

/**
 * Backward compatibility: save bookmark
 */
export function saveCourseTypeBookmark(entry: Omit<ReadingBookmark, 'updatedAt'>): void {
  saveItemProgress(entry);
}

/**
 * Clear an item's progress or section pointer
 */
export function clearItemProgress(courseSlug: string, type: ReadingContentType, slug: string): void {
  const store = loadAllBookmarks();
  const itemKey = getItemKey(courseSlug, type, slug);
  if (store[itemKey]) {
    delete store[itemKey];
  }
  const sectionKey = getBookmarkKey(courseSlug, type);
  if (store[sectionKey]?.slug === slug) {
    delete store[sectionKey];
  }
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

/**
 * Returns latest active bookmarks for each section type in a course (excluding item: and course: keys).
 */
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

/**
 * Computes overall completion and progress statistics for a course.
 */
export function getCourseStats(
  courseSlug: string,
  totalItemsCount?: number
): CourseProgressStats {
  const store = loadAllBookmarks();
  const itemPrefix = `item:${courseSlug.toLowerCase()}:`;
  let completedCount = 0;
  let inProgressCount = 0;
  const completedSlugs: string[] = [];
  const typeStats: Record<string, { completed: number; inProgress: number }> = {};
  let latestActive: ReadingBookmark | null = null;

  for (const [key, val] of Object.entries(store)) {
    if (!key.startsWith(itemPrefix) || !val) continue;

    if (!typeStats[val.type]) {
      typeStats[val.type] = { completed: 0, inProgress: 0 };
    }

    if (val.isCompleted) {
      completedCount++;
      completedSlugs.push(val.slug);
      typeStats[val.type].completed++;
    } else if ((val.scrollPercent && val.scrollPercent > 0) || (val.slideIndex && val.slideIndex > 0)) {
      inProgressCount++;
      typeStats[val.type].inProgress++;
    }

    if (!latestActive || val.updatedAt > latestActive.updatedAt) {
      latestActive = val;
    }
  }

  // Also check course latest pointer if latestActive is null
  if (!latestActive) {
    const courseLatest = store[getCourseKey(courseSlug)];
    if (courseLatest) latestActive = courseLatest;
  }

  const totalStarted = completedCount + inProgressCount;
  const totalItems = totalItemsCount && totalItemsCount > 0 ? totalItemsCount : totalStarted;
  const percent = totalItems > 0 ? Math.min(100, Math.round((completedCount / totalItems) * 100)) : 0;

  return {
    completedCount,
    inProgressCount,
    totalStarted,
    totalItems,
    percent,
    latestActive,
    completedSlugs,
    typeStats,
  };
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
