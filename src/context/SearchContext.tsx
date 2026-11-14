'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';

interface SearchContextType {
  isOpen: boolean;
  openSearch: (courseScope?: string | null) => void;
  closeSearch: () => void;
  toggleSearch: () => void;
  courseScope: string | null;
  setCourseScope: (scope: string | null) => void;
}

const SearchContext = createContext<SearchContextType>({
  isOpen: false,
  openSearch: () => {},
  closeSearch: () => {},
  toggleSearch: () => {},
  courseScope: null,
  setCourseScope: () => {},
});

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [courseScope, setCourseScope] = useState<string | null>(null);
  const pathname = usePathname();

  // Determine current course slug from pathname if present
  const getCurrentCourseFromPath = useCallback(() => {
    const parts = pathname.split('/').filter(Boolean);
    const slug = parts[0];
    if (slug && !['api', 'lecture-notes-images', '_not-found'].includes(slug)) {
      return slug;
    }
    return null;
  }, [pathname]);

  const openSearch = useCallback((scope?: string | null) => {
    if (scope !== undefined) {
      setCourseScope(scope);
    } else {
      // Default to active course if in one
      const current = getCurrentCourseFromPath();
      setCourseScope(current);
    }
    setIsOpen(true);
  }, [getCurrentCourseFromPath]);

  const closeSearch = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggleSearch = useCallback(() => {
    setIsOpen(prev => {
      if (!prev) {
        setCourseScope(getCurrentCourseFromPath());
        return true;
      }
      return false;
    });
  }, [getCurrentCourseFromPath]);

  // Global hotkey: Cmd+K or Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        toggleSearch();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleSearch]);

  return (
    <SearchContext.Provider
      value={{
        isOpen,
        openSearch,
        closeSearch,
        toggleSearch,
        courseScope,
        setCourseScope,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  return useContext(SearchContext);
}

