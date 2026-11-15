'use client';

import React from 'react';
import { useReadingProgress } from '@/context/ReadingProgressContext';
import { ReadingContentType } from '@/lib/readingProgress';
import { CheckCircle2, Circle, Bookmark } from 'lucide-react';

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
  const { getItemProgress, getBookmark, toggleCompleted, markCurrent } = useReadingProgress();

  const item = getItemProgress(courseSlug, type, slug);
  const isDone = Boolean(item?.isCompleted);
  const bookmark = getBookmark(courseSlug, type);
  const isCurrent = bookmark?.slug?.toLowerCase() === slug.toLowerCase();

  const percent = item?.scrollPercent || 0;
  const inProgress = !isDone && (percent > 0 || (item?.slideIndex !== undefined && item.slideIndex > 0));

  const handleToggleDone = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    toggleCompleted({
      courseSlug,
      type,
      slug,
      title,
      url,
      scrollPercent: isDone ? 0 : 100,
      totalSlides,
    });
  };

  const handleToggleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    markCurrent({
      courseSlug,
      type,
      slug,
      title,
      url,
      scrollPercent: percent,
      totalSlides,
    });
  };

  return (
    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
      {/* 1. Status Badges */}
      {isDone ? (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-3xs animate-in fade-in duration-150">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          <span>Done</span>
        </span>
      ) : inProgress ? (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-50 text-amber-900 border border-amber-300/80 shadow-3xs animate-in fade-in duration-150">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          <span className="font-mono">{percent}% read</span>
        </span>
      ) : null}

      {/* 2. Last Read Flag (if current active) */}
      {isCurrent && (
        <span
          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200"
          title="Where you left off reading"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" />
          <span className="hidden sm:inline">Active</span>
        </span>
      )}

      {/* 3. Quick 1-Click Done Toggle Button */}
      <button
        type="button"
        onClick={handleToggleDone}
        className={`p-1 rounded-lg transition-all transform active:scale-95 ${
          isDone
            ? 'text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50'
            : 'text-stone-300 hover:text-emerald-600 hover:bg-emerald-50/60'
        }`}
        title={isDone ? 'Mark as incomplete' : 'Mark as done'}
        aria-label={isDone ? 'Mark as incomplete' : 'Mark as done'}
      >
        {isDone ? (
          <CheckCircle2 className="w-4 h-4 fill-emerald-100 text-emerald-600" />
        ) : (
          <Circle className="w-4 h-4 text-stone-300 hover:text-emerald-500 transition" />
        )}
      </button>

      {/* 4. Bookmark Icon (Save as left-off pointer) */}
      {!isDone && (
        <button
          type="button"
          onClick={handleToggleBookmark}
          className={`p-1 rounded-lg transition ${
            isCurrent
              ? 'text-amber-700 hover:text-amber-900 bg-amber-50'
              : 'text-stone-300 hover:text-stone-600 hover:bg-stone-100 opacity-60 hover:opacity-100'
          }`}
          title={isCurrent ? 'Current reading location' : 'Mark as where you left off'}
          aria-label="Bookmark position"
        >
          <Bookmark className={`w-3.5 h-3.5 ${isCurrent ? 'fill-amber-600 text-amber-700' : ''}`} />
        </button>
      )}
    </div>
  );
}
