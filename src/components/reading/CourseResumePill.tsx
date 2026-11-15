'use client';

import React from 'react';
import Link from 'next/link';
import { useReadingProgress } from '@/context/ReadingProgressContext';
import { ArrowRight, Bookmark, CheckCircle2 } from 'lucide-react';

interface CourseResumePillProps {
  courseSlug: string;
  totalItems?: number;
}

export default function CourseResumePill({ courseSlug, totalItems = 0 }: CourseResumePillProps) {
  const { getCourseStats, getCourseBookmarks } = useReadingProgress();

  const stats = getCourseStats(courseSlug, totalItems);
  const courseBookmarks = getCourseBookmarks(courseSlug);
  const entries = Object.values(courseBookmarks);

  // Pick the most recently updated item across bookmarks or stats
  const latest = stats.latestActive || entries.sort((a, b) => b.updatedAt - a.updatedAt)[0] || null;

  const hasActivity = stats.totalStarted > 0 || stats.completedCount > 0 || Boolean(latest);

  if (!hasActivity && totalItems === 0) return null;

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="mt-4 pt-3.5 border-t border-stone-100 flex flex-col gap-2.5"
    >
      {/* 1. Progress Bar & Percent Summary */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-stone-700 flex items-center gap-1.5">
            {stats.percent === 100 ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-800 font-bold">All Completed</span>
              </>
            ) : hasActivity ? (
              <>
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <span>
                  {stats.completedCount} of {totalItems || stats.totalStarted} completed
                </span>
              </>
            ) : (
              <span className="text-stone-400 font-normal">Not started yet</span>
            )}
          </span>

          <span className="font-bold font-mono text-stone-700">
            {stats.percent}%
          </span>
        </div>

        {/* Progress track */}
        <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              stats.percent === 100 ? 'bg-emerald-500' : 'bg-amber-500'
            }`}
            style={{ width: `${Math.max(stats.percent > 0 ? 5 : 0, stats.percent)}%` }}
          />
        </div>
      </div>

      {/* 2. Resume Latest Note Pill */}
      {latest && (
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1.5 min-w-0 pr-2">
            {latest.isCompleted ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            ) : (
              <Bookmark className="w-3.5 h-3.5 text-amber-700 fill-amber-700 shrink-0" />
            )}
            <span className="text-xs text-stone-600 truncate">
              <strong className="text-stone-900 font-semibold capitalize">{latest.type === 'notes' ? 'Note' : latest.type.slice(0, -1)}:</strong> {latest.title}
            </span>
          </div>

          <Link
            href={latest.isCompleted ? latest.url : (latest.url.includes('?') ? `${latest.url}&resume=1` : `${latest.url}?resume=1`)}
            className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 hover:text-amber-950 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-lg transition shrink-0 shadow-3xs"
          >
            <span>{latest.isCompleted ? 'Review' : 'Resume'}</span>
            {!latest.isCompleted && latest.scrollPercent !== undefined && latest.scrollPercent > 0 && (
              <span className="font-mono text-[10px]">({latest.scrollPercent}%)</span>
            )}
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      )}
    </div>
  );
}
