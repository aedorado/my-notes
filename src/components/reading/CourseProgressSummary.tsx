'use client';

import React from 'react';
import { useReadingProgress } from '@/context/ReadingProgressContext';
import { CheckCircle2, TrendingUp, Sparkles, BookOpen } from 'lucide-react';

interface CourseProgressSummaryProps {
  courseSlug: string;
  totalItems: number;
  itemCounts?: {
    chapters?: number;
    notes?: number;
    slides?: number;
  };
}

export default function CourseProgressSummary({
  courseSlug,
  totalItems,
  itemCounts,
}: CourseProgressSummaryProps) {
  const { getCourseStats } = useReadingProgress();

  const stats = getCourseStats(courseSlug, totalItems);

  if (totalItems === 0) return null;

  const isComplete = stats.percent === 100;
  const hasStarted = stats.totalStarted > 0 || stats.completedCount > 0;

  return (
    <div className="bg-white border border-stone-200/90 rounded-2xl p-4 sm:p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          {isComplete ? (
            <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          ) : (
            <div className="p-1.5 rounded-lg bg-amber-100 text-amber-700">
              <TrendingUp className="w-4 h-4" />
            </div>
          )}

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900 flex items-center gap-1.5">
              <span>Overall Course Completion</span>
              {isComplete && (
                <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded">
                  Completed! 🎉
                </span>
              )}
            </h3>
            <p className="text-xs text-stone-500">
              {hasStarted ? (
                <span>
                  <strong>{stats.completedCount}</strong> of <strong>{totalItems}</strong> completed
                  {stats.inProgressCount > 0 && (
                    <span className="text-stone-400"> • {stats.inProgressCount} in progress</span>
                  )}
                </span>
              ) : (
                <span>Not started yet — open any lecture note to begin tracking</span>
              )}
            </p>
          </div>
        </div>

        <div className="text-right flex sm:flex-col items-center sm:items-end justify-between">
          <span className="text-lg sm:text-2xl font-black font-mono text-stone-900">
            {stats.percent}%
          </span>
          <span className="text-[11px] text-stone-400 font-medium hidden sm:inline">
            completed
          </span>
        </div>
      </div>

      {/* Main Progress Bar */}
      <div className="w-full bg-stone-100 h-2.5 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            isComplete ? 'bg-emerald-500' : 'bg-gradient-to-r from-amber-500 to-amber-600'
          }`}
          style={{ width: `${Math.max(stats.percent > 0 ? 3 : 0, stats.percent)}%` }}
        />
      </div>

      {/* Breakdown per type if multiple types exist */}
      {itemCounts && (
        <div className="mt-3 pt-2.5 border-t border-stone-100 flex flex-wrap items-center gap-4 text-xs text-stone-500">
          {Boolean(itemCounts.notes) && (
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              <span>
                Notes: <strong className="text-stone-800">{stats.typeStats?.notes?.completed || 0}/{itemCounts.notes}</strong> done
              </span>
            </div>
          )}

          {Boolean(itemCounts.chapters) && (
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span>
                Chapters: <strong className="text-stone-800">{stats.typeStats?.chapters?.completed || 0}/{itemCounts.chapters}</strong> done
              </span>
            </div>
          )}

          {Boolean(itemCounts.slides) && (
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
              <span>
                Slide Decks: <strong className="text-stone-800">{stats.typeStats?.slides?.completed || 0}/{itemCounts.slides}</strong> done
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

