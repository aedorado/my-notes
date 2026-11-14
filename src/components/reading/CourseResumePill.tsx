'use client';

import React from 'react';
import Link from 'next/link';
import { useReadingProgress } from '@/context/ReadingProgressContext';
import { ArrowRight, Bookmark } from 'lucide-react';

export default function CourseResumePill({ courseSlug }: { courseSlug: string }) {
  const { getCourseBookmarks } = useReadingProgress();

  const courseBookmarks = getCourseBookmarks(courseSlug);
  const entries = Object.values(courseBookmarks);

  if (entries.length === 0) return null;

  // Pick the most recently updated
  const latest = entries.sort((a, b) => b.updatedAt - a.updatedAt)[0];
  if (!latest) return null;

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between"
    >
      <div className="flex items-center gap-1.5 min-w-0">
        <Bookmark className="w-3.5 h-3.5 text-amber-700 fill-amber-700 shrink-0" />
        <span className="text-xs text-stone-600 truncate">
          <strong className="text-stone-900 font-semibold capitalize">{latest.type}:</strong> {latest.title}
        </span>
      </div>

      <Link
        href={latest.url}
        className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-lg transition shrink-0 ml-2 shadow-3xs"
      >
        <span>Resume</span>
        <span className="font-mono text-[10px]">({latest.scrollPercent}%)</span>
        <ArrowRight className="w-3 h-3" />
      </Link>
    </div>
  );
}

