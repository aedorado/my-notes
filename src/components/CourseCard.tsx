import React from 'react';
import Link from 'next/link';
import { BookOpen, FileText, Presentation, HelpCircle, Layers, Lock } from 'lucide-react';
import { CourseMeta } from '@/lib/types';
import CourseResumePill from '@/components/reading/CourseResumePill';

interface CourseCardProps {
  course: CourseMeta;
}

export default function CourseCard({ course }: CourseCardProps) {
  const counts = course.counts || {};

  return (
    <Link
      href={`/${course.slug}`}
      className="group relative flex flex-col justify-between bg-white border border-stone-200/90 hover:border-amber-400 rounded-3xl p-6 sm:p-7 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 overflow-hidden"
    >
      <div
        className="absolute top-0 left-0 right-0 h-1.5 opacity-80 group-hover:opacity-100 transition"
        style={{ backgroundColor: course.color || '#a37f1a' }}
      />

      <div>
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="text-3xl p-2.5 rounded-2xl bg-stone-50 border border-stone-100 group-hover:scale-105 transition-transform">
            {course.icon || '📖'}
          </div>
          <div className="flex items-center gap-1.5">
            {course.category && (
              <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md border ${
                course.category === 'spiritual'
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : 'bg-indigo-50 text-indigo-800 border-indigo-200'
              }`}>
                {course.category}
              </span>
            )}
            <span className="text-[11px] font-mono uppercase tracking-wider text-stone-400 font-semibold px-2 py-0.5 rounded bg-stone-100">
              {course.slug}
            </span>
          </div>
        </div>

        <h3 className="text-lg sm:text-xl font-bold text-stone-900 group-hover:text-amber-800 transition line-clamp-1 mb-2">
          {course.title}
        </h3>

        <p className="text-xs sm:text-sm text-stone-600 line-clamp-2 leading-relaxed mb-6">
          {course.description}
        </p>
      </div>

      <div className="pt-4 border-t border-stone-100 flex flex-wrap items-center gap-2">
        {Boolean(counts.chapters) && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-50 border border-stone-200 text-stone-700 text-xs font-medium">
            <BookOpen className="w-3 h-3 text-amber-700" />
            <span>{counts.chapters} Chapters</span>
          </span>
        )}

        {Boolean(counts.notes) && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-50 border border-stone-200 text-stone-700 text-xs font-medium">
            <FileText className="w-3 h-3 text-indigo-700" />
            <span>{counts.notes} Notes</span>
          </span>
        )}

        {Boolean(counts.slides) && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-50 border border-stone-200 text-stone-700 text-xs font-medium">
            <Presentation className="w-3 h-3 text-amber-700" />
            <span>{counts.slides} Slide Decks</span>
          </span>
        )}

        {Boolean(counts.quizzes) && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-50 border border-stone-200 text-stone-700 text-xs font-medium">
            <HelpCircle className="w-3 h-3 text-emerald-700" />
            <span>{counts.quizzes} Quizzes</span>
          </span>
        )}

        {Boolean(counts.flashcards) && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-50 border border-stone-200 text-stone-700 text-xs font-medium">
            <Layers className="w-3 h-3 text-purple-700" />
            <span>{counts.flashcards} Flashcards</span>
          </span>
        )}

        {Boolean(counts.transcripts) && (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-stone-50 text-stone-500 text-xs font-medium">
            <Lock className="w-3 h-3 text-stone-400" />
            <span>{counts.transcripts} Transcripts</span>
          </span>
        )}
      </div>

      {/* Continue Reading Pill if user has progress in this course */}
      <CourseResumePill courseSlug={course.slug} />
    </Link>
  );
}

