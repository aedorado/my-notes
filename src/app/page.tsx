import React from 'react';
import { getAllCourses } from '@/lib/courses';
import CourseDirectory from '@/components/CourseDirectory';
import ContinueStudyingWidget from '@/components/reading/ContinueStudyingWidget';
import { Sparkles } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function HomePage() {
  const courses = getAllCourses();

  return (
    <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 space-y-10">
      {/* Hero Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-stone-900 via-stone-850 to-stone-900 text-white p-8 sm:p-12 relative overflow-hidden shadow-lg border border-stone-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-2xl relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold mb-4 border border-amber-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Multi-Course Knowledge Base</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4 text-white">
            Study Notes & Reference
          </h1>
          <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
            A unified learning library containing textbooks, lecture notes, day-wise slide decks, active recall flashcards, interactive quizzes, and raw transcripts.
          </p>
        </div>
      </div>

      {/* Global In-Progress Continue Studying Widget */}
      <ContinueStudyingWidget courses={courses} />

      {/* Courses Directory divided by category */}
      <CourseDirectory courses={courses} />
    </div>
  );
}

