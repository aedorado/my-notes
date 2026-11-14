'use client';

import React from 'react';
import { useReadingProgress } from '@/context/ReadingProgressContext';
import { ReadingContentType } from '@/lib/readingProgress';
import { Bookmark } from 'lucide-react';

interface ReadingItemBadgeProps {
  courseSlug: string;
  type: ReadingContentType;
  slug: string;
  title: string;
  url: string;
  totalSlides?: number;
}

export default function ReadingItemBadge({
  courseSlug,
  type,
  slug,
  title,
  url,
  totalSlides,
}: ReadingItemBadgeProps) {
  const { getBookmark, markCurrent, clearProgress } = useReadingProgress();

  const bookmark = getBookmark(courseSlug, type);
  const isCurrent = bookmark?.slug === slug;

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isCurrent) {
      clearProgress(courseSlug, type);
    } else {
      markCurrent({
        courseSlug,
        type,
        slug,
        title,
        url,
        scrollPercent: 0,
        scrollY: 0,
        totalSlides,
        isManual: true,
      });
    }
  };

  return (
    <div className="flex items-center gap-2">
      {isCurrent && (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300 shadow-3xs animate-in fade-in duration-150">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
          <span>Last Read</span>
          <span className="font-mono text-amber-800">
            ({bookmark.scrollPercent || 0}%)
          </span>
        </span>
      )}

      <button
        type="button"
        onClick={handleToggle}
        className={`p-1 rounded-lg transition ${
          isCurrent
            ? 'text-amber-700 hover:text-amber-900 bg-amber-50'
            : 'text-stone-300 hover:text-stone-600 hover:bg-stone-100 opacity-60 hover:opacity-100'
        }`}
        title={isCurrent ? 'Bookmarked as where you left off. Click to clear.' : 'Mark as where you left off reading'}
      >
        <Bookmark className={`w-3.5 h-3.5 ${isCurrent ? 'fill-amber-600' : ''}`} />
      </button>
    </div>
  );
}

