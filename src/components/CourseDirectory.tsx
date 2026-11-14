'use client';

import React, { useState } from 'react';
import { CourseMeta } from '@/lib/types';
import CourseCard from '@/components/CourseCard';
import { BookOpen } from 'lucide-react';

interface CourseDirectoryProps {
  courses: CourseMeta[];
}

export default function CourseDirectory({ courses }: CourseDirectoryProps) {
  const [filter, setFilter] = useState<'all' | 'spiritual' | 'mundane'>('all');

  const spiritualCourses = courses.filter((c) => c.category === 'spiritual');
  const mundaneCourses = courses.filter((c) => c.category === 'mundane');

  return (
    <div className="space-y-12">
      {/* Category Filter Tabs Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-amber-700" />
          <h2 className="text-xl font-bold text-stone-900 tracking-tight">Available Courses</h2>
          <span className="text-xs text-stone-500 font-medium ml-1">({courses.length} courses)</span>
        </div>

        {/* Filter Buttons */}
        <div className="inline-flex items-center p-1 rounded-xl bg-stone-100 border border-stone-200 text-xs font-semibold self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filter === 'all'
                ? 'bg-white text-stone-900 shadow-2xs font-bold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            All ({courses.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('spiritual')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              filter === 'spiritual'
                ? 'bg-white text-amber-900 shadow-2xs font-bold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <span>🪷</span>
            <span>Spiritual ({spiritualCourses.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setFilter('mundane')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              filter === 'mundane'
                ? 'bg-white text-indigo-900 shadow-2xs font-bold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <span>🪐</span>
            <span>Mundane ({mundaneCourses.length})</span>
          </button>
        </div>
      </div>

      {/* Spiritual Section */}
      {(filter === 'all' || filter === 'spiritual') && (
        <section className="space-y-5">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2">
              <span className="text-xl">🪷</span>
              <h3 className="text-lg sm:text-xl font-bold text-stone-900 tracking-tight">
                Spiritual Knowledge & Śāstra
              </h3>
              <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                {spiritualCourses.length}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-stone-500">
              Gauḍīya Vaiṣṇava philosophy, Sandarbhas, commentaries, and foundational principles for spiritual life.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {spiritualCourses.map((course) => (
              <CourseCard key={course.slug} course={course} />
            ))}
          </div>
        </section>
      )}

      {/* Mundane Section */}
      {(filter === 'all' || filter === 'mundane') && (
        <section className="space-y-5">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2">
              <span className="text-xl">🪐</span>
              <h3 className="text-lg sm:text-xl font-bold text-stone-900 tracking-tight">
                Mundane & Predictive Sciences
              </h3>
              <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-indigo-100 text-indigo-900 border border-indigo-200">
                {mundaneCourses.length}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-stone-500">
              Applied astrology (APA, PR-23 practice batch) and classical Hasta Sāmudrika Śāstra (Palmistry).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mundaneCourses.map((course) => (
              <CourseCard key={course.slug} course={course} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

