'use client';

import React from 'react';
import Link from 'next/link';
import { useReadingProgress } from '@/context/ReadingProgressContext';
import { ReadingContentType, formatRelativeTime } from '@/lib/readingProgress';
import { Bookmark, ArrowRight, BookOpen, FileText, Presentation, Lock, X } from 'lucide-react';

interface ContinueReadingBannerProps {
  courseSlug: string;
  courseTitle: string;
  activeTab: string;
}

export default function ContinueReadingBanner({
  courseSlug,
  courseTitle,
  activeTab,
}: ContinueReadingBannerProps) {
  const { getBookmark, getCourseBookmarks, clearProgress } = useReadingProgress();

  const courseBookmarks = getCourseBookmarks(courseSlug);
  const typesWithBookmarks = Object.keys(courseBookmarks) as ReadingContentType[];

  if (typesWithBookmarks.length === 0) {
    return null;
  }

  // Pick the most relevant bookmark: first matching activeTab, or most recently updated
  let primaryBookmark = courseBookmarks[activeTab as ReadingContentType] || null;

  if (!primaryBookmark) {
    // Pick the most recently updated one
    const sorted = Object.values(courseBookmarks).sort((a, b) => b.updatedAt - a.updatedAt);
    primaryBookmark = sorted[0] || null;
  }

  if (!primaryBookmark) return null;

  const getTypeMeta = (type: ReadingContentType) => {
    switch (type) {
      case 'chapters':
        return { label: 'Chapter', icon: <BookOpen className="w-4 h-4 text-amber-700" />, color: 'bg-amber-100 text-amber-900 border-amber-300' };
      case 'notes':
        return { label: 'Lecture Note', icon: <FileText className="w-4 h-4 text-indigo-700" />, color: 'bg-indigo-100 text-indigo-900 border-indigo-300' };
      case 'slides':
        return { label: 'Slide Deck', icon: <Presentation className="w-4 h-4 text-amber-700" />, color: 'bg-amber-100 text-amber-900 border-amber-300' };
      case 'transcripts':
        return { label: 'Transcript', icon: <Lock className="w-4 h-4 text-stone-600" />, color: 'bg-stone-100 text-stone-800 border-stone-300' };
    }
  };

  const typeMeta = getTypeMeta(primaryBookmark.type);
  const otherBookmarks = Object.values(courseBookmarks).filter(b => b.type !== primaryBookmark?.type);

  return (
    <div className="bg-gradient-to-r from-amber-500/10 via-amber-50/70 to-stone-50 border border-amber-300/80 rounded-2xl p-4 sm:p-5 shadow-xs relative overflow-hidden transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Info */}
        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-white border border-amber-300/90 text-amber-900 shadow-3xs">
              <Bookmark className="w-3 h-3 text-amber-700 fill-amber-700" />
              <span>Where you left off in {typeMeta.label}</span>
            </span>
            <span className="text-[11px] text-stone-500 font-medium">
              {formatRelativeTime(primaryBookmark.updatedAt)}
            </span>
          </div>

          <h3 className="text-base sm:text-lg font-bold text-stone-900 truncate">
            {primaryBookmark.title}
          </h3>

          {/* Progress bar */}
          <div className="flex items-center gap-3 pt-0.5 max-w-md">
            <div className="flex-1 bg-stone-200/80 h-2 rounded-full overflow-hidden">
              <div
                className="bg-amber-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.max(5, primaryBookmark.scrollPercent)}%` }}
              />
            </div>
            <span className="text-xs font-mono font-bold text-amber-900 shrink-0">
              {primaryBookmark.type === 'slides' && primaryBookmark.slideIndex !== undefined
                ? `Slide ${(primaryBookmark.slideIndex || 0) + 1} of ${primaryBookmark.totalSlides || '?'}`
                : `${primaryBookmark.scrollPercent}% read`}
            </span>
          </div>
        </div>

        {/* Right: Action button */}
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href={primaryBookmark.url}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs sm:text-sm shadow-xs transition hover:translate-x-0.5"
          >
            <span>Resume Reading</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <button
            type="button"
            onClick={() => clearProgress(courseSlug, primaryBookmark.type)}
            className="p-2 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-white/80 transition"
            title="Clear this bookmark"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Cross-type quick switch chips */}
      {otherBookmarks.length > 0 && (
        <div className="mt-3 pt-3 border-t border-amber-200/50 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-[11px] font-semibold text-stone-500">Also reading in {courseTitle}:</span>
          {otherBookmarks.map(ob => {
            const om = getTypeMeta(ob.type);
            return (
              <Link
                key={ob.type}
                href={ob.url}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/90 border border-stone-200 hover:border-amber-400 text-stone-700 hover:text-amber-900 text-[11px] font-medium transition shadow-3xs"
              >
                {om.icon}
                <span className="font-semibold">{om.label}:</span>
                <span className="truncate max-w-[140px]">{ob.title}</span>
                <span className="text-stone-400 font-mono">({ob.scrollPercent}%)</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

