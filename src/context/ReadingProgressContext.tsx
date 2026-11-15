'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  ReadingBookmark,
  ReadingContentType,
  ReadingProgressStore,
  CourseProgressStats,
  loadAllBookmarks,
  getItemProgress as getItemProgressUtil,
  saveItemProgress,
  toggleItemCompleted,
  clearItemProgress,
  clearCourseTypeBookmark,
  getCourseBookmarks as getCourseBookmarksUtil,
  getCourseStats as getCourseStatsUtil,
  getBookmarkKey,
  PROGRESS_EVENT_NAME,
} from '@/lib/readingProgress';

interface ReadingProgressContextType {
  bookmarks: ReadingProgressStore;
  getBookmark: (courseSlug: string, type: ReadingContentType) => ReadingBookmark | null;
  getItemProgress: (courseSlug: string, type: ReadingContentType, slug: string) => ReadingBookmark | null;
  isItemCompleted: (courseSlug: string, type: ReadingContentType, slug: string) => boolean;
  getCourseBookmarks: (courseSlug: string) => Record<string, ReadingBookmark>;
  getCourseStats: (courseSlug: string, totalItemsCount?: number) => CourseProgressStats;
  saveProgress: (data: Omit<ReadingBookmark, 'updatedAt'>) => void;
  markCurrent: (data: Omit<ReadingBookmark, 'updatedAt'>) => void;
  toggleCompleted: (data: Omit<ReadingBookmark, 'updatedAt'>, forceCompleted?: boolean) => ReadingBookmark;
  clearProgress: (courseSlug: string, type: ReadingContentType) => void;
  clearItem: (courseSlug: string, type: ReadingContentType, slug: string) => void;
}

const defaultStats: CourseProgressStats = {
  completedCount: 0,
  inProgressCount: 0,
  totalStarted: 0,
  totalItems: 0,
  percent: 0,
  latestActive: null,
  completedSlugs: [],
  typeStats: {},
};

const ReadingProgressContext = createContext<ReadingProgressContextType>({
  bookmarks: {},
  getBookmark: () => null,
  getItemProgress: () => null,
  isItemCompleted: () => false,
  getCourseBookmarks: () => ({}),
  getCourseStats: () => defaultStats,
  saveProgress: () => {},
  markCurrent: () => {},
  toggleCompleted: (data) => ({ ...data, updatedAt: Date.now() }),
  clearProgress: () => {},
  clearItem: () => {},
});

export function ReadingProgressProvider({ children }: { children: React.ReactNode }) {
  const [bookmarks, setBookmarks] = useState<ReadingProgressStore>({});
  const bookmarksRef = useRef<ReadingProgressStore>({});

  // Synchronize ref on every render so stable callbacks always read latest data
  bookmarksRef.current = bookmarks;

  const refresh = useCallback(() => {
    const loaded = loadAllBookmarks();
    bookmarksRef.current = loaded;
    setBookmarks(loaded);
  }, []);

  // Initial load & listeners for cross-tab or in-app updates
  useEffect(() => {
    refresh();

    const handleCustomEvent = (e: Event) => {
      const custom = e as CustomEvent<ReadingProgressStore>;
      if (custom.detail) {
        bookmarksRef.current = custom.detail;
        setBookmarks(custom.detail);
      } else {
        refresh();
      }
    };

    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key === 'mynotes_reading_progress_v2') {
        refresh();
      }
    };

    window.addEventListener(PROGRESS_EVENT_NAME, handleCustomEvent);
    window.addEventListener('storage', handleStorageEvent);

    return () => {
      window.removeEventListener(PROGRESS_EVENT_NAME, handleCustomEvent);
      window.removeEventListener('storage', handleStorageEvent);
    };
  }, [refresh]);

  const getBookmark = useCallback(
    (courseSlug: string, type: ReadingContentType): ReadingBookmark | null => {
      const key = getBookmarkKey(courseSlug, type);
      return bookmarksRef.current[key] || null;
    },
    []
  );

  const getItemProgress = useCallback(
    (courseSlug: string, type: ReadingContentType, slug: string): ReadingBookmark | null => {
      return getItemProgressUtil(courseSlug, type, slug);
    },
    // We intentionally depend on bookmarks so components rerender when store changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [bookmarks]
  );

  const isItemCompleted = useCallback(
    (courseSlug: string, type: ReadingContentType, slug: string): boolean => {
      const item = getItemProgressUtil(courseSlug, type, slug);
      return Boolean(item?.isCompleted);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [bookmarks]
  );

  const getCourseBookmarksFn = useCallback(
    (courseSlug: string): Record<string, ReadingBookmark> => {
      return getCourseBookmarksUtil(courseSlug);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [bookmarks]
  );

  const getCourseStatsFn = useCallback(
    (courseSlug: string, totalItemsCount?: number): CourseProgressStats => {
      return getCourseStatsUtil(courseSlug, totalItemsCount);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [bookmarks]
  );

  const saveProgress = useCallback((data: Omit<ReadingBookmark, 'updatedAt'>) => {
    saveItemProgress(data);
  }, []);

  const markCurrent = useCallback((data: Omit<ReadingBookmark, 'updatedAt'>) => {
    saveItemProgress({
      ...data,
      isManual: true,
    });
  }, []);

  const toggleCompletedFn = useCallback(
    (data: Omit<ReadingBookmark, 'updatedAt'>, forceCompleted?: boolean): ReadingBookmark => {
      return toggleItemCompleted(data, forceCompleted);
    },
    []
  );

  const clearProgress = useCallback((courseSlug: string, type: ReadingContentType) => {
    clearCourseTypeBookmark(courseSlug, type);
  }, []);

  const clearItem = useCallback((courseSlug: string, type: ReadingContentType, slug: string) => {
    clearItemProgress(courseSlug, type, slug);
  }, []);

  return (
    <ReadingProgressContext.Provider
      value={{
        bookmarks,
        getBookmark,
        getItemProgress,
        isItemCompleted,
        getCourseBookmarks: getCourseBookmarksFn,
        getCourseStats: getCourseStatsFn,
        saveProgress,
        markCurrent,
        toggleCompleted: toggleCompletedFn,
        clearProgress,
        clearItem,
      }}
    >
      {children}
    </ReadingProgressContext.Provider>
  );
}

export function useReadingProgress() {
  return useContext(ReadingProgressContext);
}
