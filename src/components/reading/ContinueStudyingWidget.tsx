'use client';

import React from 'react';
import Link from 'next/link';
import { useReadingProgress } from '@/context/ReadingProgressContext';
import { formatRelativeTime } from '@/lib/readingProgress';
import { CourseMeta } from '@/lib/types';
import {
  Bookmark,
  ArrowRight,
  BookOpen,
  FileText,
  Presentation,
  CheckCircle2,
  X,
  Sparkles,
} from 'lucide-react';

interface ContinueStudyingWidgetProps {
  courses: CourseMeta[];
}

export default function ContinueStudyingWidget({ courses }: ContinueStudyingWidgetProps) {
  const { bookmarks, clearProgress } = useReadingProgress();

  const courseMap = React.useMemo(() => {
    const map = new Map<string, CourseMeta>();
    for (const c of courses) {
      map.set(c.slug.toLowerCase(), c);
    }
    return map;
  }, [courses]);

  const activeBookmarks = React.useMemo(() => {
    const list = Object.values(bookmarks);
    return list
      .filter((b) => b && b.title && b.url)
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, 3);
  }, [bookmarks]);

  if (activeBookmarks.length === 0) {
    return null;
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'chapters':
        return <BookOpen className="w-3.5 h-3.5 text-amber-700" />;
      case 'notes':
        return <FileText className="w-3.5 h-3.5 text-indigo-700" />;
      case 'slides':
        return <Presentation className="w-3.5 h-3.5 text-amber-700" />;
      default:
        return <Bookmark className="w-3.5 h-3.5 text-stone-600" />;
    }
  };

  return (
    <section className="space-y-4 animate-in fade-in duration-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
            <span>Continue Studying</span>
            <span className="text-stone-400 font-mono text-xs font-normal">
              ({activeBookmarks.length})
            </span>
          </h2>
        </div>
        <span className="text-xs text-stone-500">Pick up right where you left off</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {activeBookmarks.map((b) => {
          const course = courseMap.get(b.courseSlug.toLowerCase());
          const percent = Math.min(100, Math.max(0, b.scrollPercent || 0));

          return (
            <div
              key={`${b.courseSlug}:${b.type}`}
              className="group relative flex flex-col justify-between p-5 rounded-2xl bg-white border border-stone-200/90 hover:border-amber-400 shadow-xs hover:shadow-md transition-all duration-200"
            >
              {/* Top Row: Course pill + Clear button */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-sm">{course?.icon || '📖'}</span>
                    <span className="text-xs font-bold text-stone-800 truncate">
                      {course?.title || b.courseSlug}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => clearProgress(b.courseSlug, b.type)}
                    className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition"
                    title="Remove from recent activity"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Title */}
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-1">
                  {getTypeIcon(b.type)}
                  <span className="capitalize">{b.type === 'notes' ? 'Note' : b.type.slice(0, -1)}</span>
                  <span>•</span>
                  <span>{formatRelativeTime(b.updatedAt)}</span>
                </div>

                <h3 className="text-sm font-bold text-stone-900 group-hover:text-amber-800 transition line-clamp-2 leading-snug mb-4">
                  {b.title}
                </h3>
              </div>

              {/* Bottom: Progress Capsule + Resume Button */}
              <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-14 bg-stone-100 h-1.5 rounded-full overflow-hidden shrink-0">
                    <div
                      className="bg-amber-600 h-full rounded-full transition-all duration-200"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <span className="font-mono text-xs font-semibold text-stone-600">
                    {percent}%
                  </span>
                </div>

                <Link
                  href={b.url}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs transition shadow-2xs group-hover:bg-amber-600 group-hover:text-white"
                >
                  <span>Resume</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

