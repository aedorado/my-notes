'use client';

import React from 'react';
import { Search, Sparkles } from 'lucide-react';
import { useSearch } from '@/context/SearchContext';

export default function CourseSearchBar({
  courseSlug,
  courseTitle,
}: {
  courseSlug: string;
  courseTitle: string;
}) {
  const { openSearch } = useSearch();

  return (
    <div
      onClick={() => openSearch(courseSlug)}
      className="cursor-pointer group flex items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-white border border-stone-200/90 shadow-2xs hover:border-amber-400 hover:shadow-xs transition"
      role="search"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openSearch(courseSlug);
        }
      }}
    >
      <div className="flex items-center gap-3 text-stone-500 group-hover:text-stone-800 transition">
        <Search className="w-4 h-4 text-stone-400 group-hover:text-amber-600 transition" />
        <span className="text-xs sm:text-sm font-medium">
          Search in {courseTitle}...
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/70">
          <Sparkles className="w-3 h-3 text-amber-600" />
          <span>Fuzzy (±2 chars)</span>
        </span>
        <kbd className="hidden sm:inline-flex items-center gap-1 text-[11px] font-mono text-stone-400 bg-stone-100 border border-stone-200 rounded px-2 py-0.5">
          ⌘K
        </kbd>
      </div>
    </div>
  );
}

