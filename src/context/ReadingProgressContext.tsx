'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  ReadingBookmark,
  ReadingContentType,
  ReadingProgressStore,
  loadAllBookmarks,
  saveCourseTypeBookmark,
  clearCourseTypeBookmark,
  getBookmarkKey,
  PROGRESS_EVENT_NAME,
} from '@/lib/readingProgress';

interface ReadingProgressContextType {
  bookmarks: ReadingProgressStore;
  getBookmark: (courseSlug: string, type: ReadingContentType) => ReadingBookmark | null;
  getCourseBookmarks: (courseSlug: string) => Record<string, ReadingBookmark>;
  saveProgress: (data: Omit<ReadingBookmark, 'updatedAt'>) => void;
  markCurrent: (data: Omit<ReadingBookmark, 'updatedAt'>) => void;
  clearProgress: (courseSlug: string, type: ReadingContentType) => void;
}

const ReadingProgressContext = createContext<ReadingProgressContextType>({
  bookmarks: {},
  getBookmark: () => null,
  getCourseBookmarks: () => ({}),
  saveProgress: () => {},
  markCurrent: () => {},
  clearProgress: () => {},
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

  const getCourseBookmarksFn = useCallback(
    (courseSlug: string): Record<string, ReadingBookmark> => {
      const prefix = `${courseSlug.toLowerCase()}:`;
      const res: Record<string, ReadingBookmark> = {};
      for (const [k, v] of Object.entries(bookmarksRef.current)) {
        if (k.startsWith(prefix)) {
          res[v.type] = v;
        }
      }
      return res;
    },
    []
  );

  const saveProgress = useCallback((data: Omit<ReadingBookmark, 'updatedAt'>) => {
    saveCourseTypeBookmark(data);
  }, []);

  const markCurrent = useCallback((data: Omit<ReadingBookmark, 'updatedAt'>) => {
    saveCourseTypeBookmark({
      ...data,
      isManual: true,
    });
  }, []);

  const clearProgress = useCallback((courseSlug: string, type: ReadingContentType) => {
    clearCourseTypeBookmark(courseSlug, type);
  }, []);

  return (
    <ReadingProgressContext.Provider
      value={{
        bookmarks,
        getBookmark,
        getCourseBookmarks: getCourseBookmarksFn,
        saveProgress,
        markCurrent,
        clearProgress,
      }}
    >
      {children}
    </ReadingProgressContext.Provider>
  );
}

export function useReadingProgress() {
  return useContext(ReadingProgressContext);
}

