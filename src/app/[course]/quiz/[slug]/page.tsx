import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getQuizDeck } from '@/lib/content';
import { getCourseBySlug } from '@/lib/courses';
import QuizEngine from '@/components/QuizEngine';
import { ArrowLeft, HelpCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function QuizPage({
  params,
}: {
  params: Promise<{ course: string; slug: string }>;
}) {
  const { course: courseSlug, slug: quizSlug } = await params;
  const decodedSlug = decodeURIComponent(quizSlug);

  const course = getCourseBySlug(courseSlug);
  if (!course) notFound();

  const deck = getQuizDeck(courseSlug, decodedSlug);
  if (!deck) notFound();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back button */}
      <div className="flex items-center justify-between pb-4 border-b border-stone-200">
        <Link
          href={`/${courseSlug}?tab=quizzes`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to {course.title}</span>
        </Link>

        <div className="flex items-center gap-2 text-xs text-stone-500 font-mono">
          <HelpCircle className="w-3.5 h-3.5 text-emerald-700" />
          <span>{deck.questions.length} questions</span>
        </div>
      </div>

      <QuizEngine deck={deck} />
    </div>
  );
}

