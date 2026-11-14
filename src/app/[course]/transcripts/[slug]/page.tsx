import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTranscript } from '@/lib/content';
import { getCourseBySlug } from '@/lib/courses';
import PrivateGuard from '@/components/PrivateGuard';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import NoteReadingTracker from '@/components/reading/NoteReadingTracker';
import { ArrowLeft, Lock, FileText } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function TranscriptPage({
  params,
}: {
  params: Promise<{ course: string; slug: string }>;
}) {
  const { course: courseSlug, slug: transcriptSlug } = await params;
  const decodedSlug = decodeURIComponent(transcriptSlug);

  const course = getCourseBySlug(courseSlug);
  if (!course) notFound();

  const transcript = getTranscript(courseSlug, decodedSlug);
  if (!transcript) notFound();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back button */}
      <div className="flex items-center justify-between pb-4 border-b border-stone-200">
        <Link
          href={`/${courseSlug}?tab=transcripts`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to {course.title}</span>
        </Link>

        <div className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200/60 font-semibold">
          <Lock className="w-3 h-3" />
          <span>Admin Only</span>
        </div>
      </div>

      <PrivateGuard
        title="Restricted Transcript"
        description="This lecture recording transcript is private and restricted to authorized admins. Enter the admin passcode to unlock and view the transcript."
      >
        <div className="bg-white border border-stone-200 rounded-3xl p-8 sm:p-10 shadow-xs mb-6">
          <div className="flex items-center gap-2 text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">
            <FileText className="w-4 h-4" />
            <span>Raw Transcript</span>
            <span className="text-stone-300">•</span>
            <span className="font-mono text-stone-400 lowercase">{transcript.slug}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            {transcript.title}
          </h1>
        </div>

        {/* Reading Progress Tracker & Bookmark */}
        <div className="mb-6">
          <NoteReadingTracker
            courseSlug={courseSlug}
            courseTitle={course.title}
            type="transcripts"
            slug={transcript.slug}
            title={transcript.title}
            url={`/${courseSlug}/transcripts/${encodeURIComponent(transcript.slug)}`}
          />
        </div>

        <article className="bg-white border border-stone-200 rounded-3xl p-8 sm:p-12 shadow-xs">
          <MarkdownRenderer content={transcript.content} />
        </article>
      </PrivateGuard>
    </div>
  );
}

