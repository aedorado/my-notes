import React from 'react';
import { notFound } from 'next/navigation';
import { getCourseBySlug } from '@/lib/courses';
import { getChapter } from '@/lib/content';
import ReaderView from '@/components/reader/ReaderView';

export const dynamic = 'force-dynamic';

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ course: string; slug: string }>;
}) {
  const { course: courseSlug, slug: chapterSlug } = await params;

  const course = getCourseBySlug(courseSlug);
  if (!course) notFound();

  const data = getChapter(courseSlug, chapterSlug);
  if (!data) notFound();

  return (
    <ReaderView
      courseSlug={courseSlug}
      initialSlug={chapterSlug}
      brandTitle={course.title}
      basePath={`/${courseSlug}/chapters`}
      backUrl={`/${courseSlug}?tab=chapters`}
    />
  );
}
