import React from 'react';
import { notFound } from 'next/navigation';
import { getNote } from '@/lib/content';
import { getCourseBySlug } from '@/lib/courses';
import NoteReaderView from '@/components/reading/NoteReaderView';

export const dynamic = 'force-dynamic';

export default async function NotePage({
  params,
}: {
  params: Promise<{ course: string; slug: string }>;
}) {
  const { course: courseSlug, slug: noteSlug } = await params;
  const decodedSlug = decodeURIComponent(noteSlug);

  const course = getCourseBySlug(courseSlug);
  if (!course) notFound();

  const data = getNote(courseSlug, decodedSlug);
  if (!data) notFound();

  const { note, prev, next } = data;

  return (
    <NoteReaderView
      courseSlug={courseSlug}
      courseTitle={course.title}
      note={note}
      prev={prev ? { slug: prev.slug, title: prev.title } : null}
      next={next ? { slug: next.slug, title: next.title } : null}
    />
  );
}

