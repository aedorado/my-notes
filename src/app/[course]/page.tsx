import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCourseBySlug } from '@/lib/courses';
import {
  getCourseChapters,
  getCourseNotes,
  getCourseSlides,
  getCourseQuizzes,
  getCourseFlashcards,
  getCourseTranscripts,
} from '@/lib/content';
import CourseSearchBar from '@/components/search/CourseSearchBar';
import ContinueReadingBanner from '@/components/reading/ContinueReadingBanner';
import ReadingItemBadge from '@/components/reading/ReadingItemBadge';
import {
  BookOpen,
  FileText,
  Presentation,
  HelpCircle,
  Layers,
  Lock,
  ChevronRight,
  ArrowRight,
  Clock,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function CoursePage({
  params,
  searchParams,
}: {
  params: Promise<{ course: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { course: courseSlug } = await params;
  const { tab } = await searchParams;

  const course = getCourseBySlug(courseSlug);
  if (!course) {
    notFound();
  }

  const chapters = getCourseChapters(courseSlug);
  const notes = getCourseNotes(courseSlug);
  const slides = getCourseSlides(courseSlug);
  const quizzes = getCourseQuizzes(courseSlug);
  const flashcards = getCourseFlashcards(courseSlug);
  const transcripts = getCourseTranscripts(courseSlug);

  // Available tabs
  const availableTabs: { key: string; label: string; count: number; icon: React.ReactNode }[] = [];
  if (chapters.length > 0) availableTabs.push({ key: 'chapters', label: 'Chapters', count: chapters.length, icon: <BookOpen className="w-4 h-4 text-amber-700" /> });
  if (notes.length > 0) availableTabs.push({ key: 'notes', label: 'Lecture Notes', count: notes.length, icon: <FileText className="w-4 h-4 text-indigo-700" /> });
  if (slides.length > 0) availableTabs.push({ key: 'slides', label: 'Slide Decks', count: slides.length, icon: <Presentation className="w-4 h-4 text-amber-700" /> });
  if (quizzes.length > 0) availableTabs.push({ key: 'quizzes', label: 'Quizzes', count: quizzes.length, icon: <HelpCircle className="w-4 h-4 text-emerald-700" /> });
  if (flashcards.length > 0) availableTabs.push({ key: 'flashcards', label: 'Flashcards', count: flashcards.length, icon: <Layers className="w-4 h-4 text-purple-700" /> });
  if (transcripts.length > 0) availableTabs.push({ key: 'transcripts', label: 'Transcripts (Admin)', count: transcripts.length, icon: <Lock className="w-4 h-4 text-stone-500" /> });

  const activeTab = tab && availableTabs.some(t => t.key === tab)
    ? tab
    : (course.defaultSection && availableTabs.some(t => t.key === course.defaultSection) ? course.defaultSection : availableTabs[0]?.key || 'chapters');

  return (
    <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Course Banner */}
      <div className="bg-white border border-stone-200/90 rounded-3xl p-6 sm:p-10 shadow-xs relative overflow-hidden">
        <div
          className="absolute top-0 left-0 right-0 h-1.5"
          style={{ backgroundColor: course.color || '#a37f1a' }}
        />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <span className="text-4xl p-2.5 bg-stone-50 border border-stone-100 rounded-2xl">
              {course.icon}
            </span>
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-stone-400">
                Course: {course.slug}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
                {course.title}
              </h1>
            </div>
          </div>
        </div>

        <p className="text-sm sm:text-base text-stone-600 leading-relaxed max-w-3xl">
          {course.description}
        </p>
      </div>

      {/* Course-Scoped Search Bar */}
      <CourseSearchBar courseSlug={courseSlug} courseTitle={course.title} />

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-stone-200">
        {availableTabs.map((t) => (
          <Link
            key={t.key}
            href={`/${courseSlug}?tab=${t.key}`}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap ${activeTab === t.key
                ? 'bg-stone-900 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
          >
            {t.icon}
            <span>{t.label}</span>
            <span className={`text-[11px] px-1.5 py-0.5 rounded-full ${activeTab === t.key ? 'bg-stone-800 text-stone-300' : 'bg-stone-200 text-stone-600'
              }`}>
              {t.count}
            </span>
          </Link>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-6 space-y-6">
        {/* Continue Reading Banner for Active Tab or Course */}
        <ContinueReadingBanner
          courseSlug={courseSlug}
          courseTitle={course.title}
          activeTab={activeTab}
        />

        {/* Chapters */}
        {activeTab === 'chapters' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {chapters.map((ch, idx) => (
              <Link
                key={ch.slug}
                href={`/${courseSlug}/chapters/${ch.slug}`}
                className="group p-5 bg-white border border-stone-200 hover:border-amber-400 rounded-2xl transition hover:shadow-xs flex items-start justify-between gap-4"
              >
                <div className="flex items-start gap-3.5">
                  <span className="w-8 h-8 rounded-lg bg-stone-100 text-stone-700 font-mono text-xs font-semibold flex items-center justify-center shrink-0 group-hover:bg-amber-100 group-hover:text-amber-800 transition">
                    {ch.chapterNumber !== undefined ? String(ch.chapterNumber).padStart(2, '0') : String(idx + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-stone-900 group-hover:text-amber-800 transition">
                      {ch.title}
                    </h3>
                    {ch.summary && (
                      <p className="text-xs text-stone-500 line-clamp-2 mt-1">{ch.summary}</p>
                    )}
                    <div className="flex items-center gap-2 mt-2 text-[11px] text-stone-400">
                      <Clock className="w-3 h-3" />
                      <span>{ch.readTime || '5 min read'}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-amber-700 transition" />
                  <ReadingItemBadge
                    courseSlug={courseSlug}
                    type="chapters"
                    slug={ch.slug}
                    title={ch.title}
                    url={`/${courseSlug}/chapters/${ch.slug}`}
                  />
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Notes */}
        {activeTab === 'notes' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {notes.map((note, idx) => (
              <Link
                key={note.slug}
                href={`/${courseSlug}/notes/${encodeURIComponent(note.slug)}`}
                className="group p-5 bg-white border border-stone-200 hover:border-indigo-400 rounded-2xl transition hover:shadow-xs flex items-start justify-between gap-4"
              >
                <div className="flex items-start gap-3.5">
                  <span className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 font-mono text-xs font-semibold flex items-center justify-center shrink-0 group-hover:bg-indigo-100 transition">
                    {note.lectureNumber !== undefined ? String(note.lectureNumber).padStart(2, '0') : String(idx + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-stone-900 group-hover:text-indigo-800 transition">
                      {note.title}
                    </h3>
                    <p className="text-xs text-stone-400 mt-1 font-mono">
                      {note.slug}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-indigo-700 transition" />
                  <ReadingItemBadge
                    courseSlug={courseSlug}
                    type="notes"
                    slug={note.slug}
                    title={note.title}
                    url={`/${courseSlug}/notes/${encodeURIComponent(note.slug)}`}
                  />
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Slides */}
        {activeTab === 'slides' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {slides.map((deck) => (
              <Link
                key={deck.slug}
                href={`/${courseSlug}/slides/${encodeURIComponent(deck.slug)}`}
                className="group p-5 bg-white border border-stone-200 hover:border-amber-500 rounded-2xl transition hover:shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] uppercase font-bold tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                      Day {deck.dayNumber || 'Deck'}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${deck.status === 'ready' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50' : 'bg-stone-100 text-stone-500'
                        }`}>
                        {deck.status === 'ready' ? 'Ready' : 'In Progress'}
                      </span>
                      <ReadingItemBadge
                        courseSlug={courseSlug}
                        type="slides"
                        slug={deck.slug}
                        title={deck.title}
                        url={`/${courseSlug}/slides/${encodeURIComponent(deck.slug)}`}
                        totalSlides={deck.slides.length}
                      />
                    </div>
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-stone-900 group-hover:text-amber-800 transition line-clamp-2">
                    {deck.title}
                  </h3>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                  <span>{deck.slides.length} slides</span>
                  <span className="font-medium text-amber-700 flex items-center gap-1 group-hover:translate-x-0.5 transition">
                    View Deck <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Quizzes */}
        {activeTab === 'quizzes' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quizzes.map((quiz) => (
              <Link
                key={quiz.slug}
                href={`/${courseSlug}/quiz/${encodeURIComponent(quiz.slug)}`}
                className="group p-5 bg-white border border-stone-200 hover:border-emerald-500 rounded-2xl transition hover:shadow-xs flex items-start justify-between gap-4"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                    <HelpCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-stone-900 group-hover:text-emerald-800 transition">
                      {quiz.title}
                    </h3>
                    {quiz.summary && (
                      <p className="text-xs text-stone-500 line-clamp-2 mt-1">{quiz.summary}</p>
                    )}
                    <span className="inline-block mt-2 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      {quiz.questions.length} Questions
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-emerald-700 shrink-0 mt-1 transition" />
              </Link>
            ))}
          </div>
        )}

        {/* Flashcards */}
        {activeTab === 'flashcards' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {flashcards.map((deck) => (
              <Link
                key={deck.slug}
                href={`/${courseSlug}/flashcards/${encodeURIComponent(deck.slug)}`}
                className="group p-5 bg-white border border-stone-200 hover:border-purple-500 rounded-2xl transition hover:shadow-xs flex items-start justify-between gap-4"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-stone-900 group-hover:text-purple-800 transition">
                      {deck.title}
                    </h3>
                    {deck.summary && (
                      <p className="text-xs text-stone-500 line-clamp-2 mt-1">{deck.summary}</p>
                    )}
                    <span className="inline-block mt-2 text-[11px] font-medium text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                      {deck.cards.length} Cards
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-purple-700 shrink-0 mt-1 transition" />
              </Link>
            ))}
          </div>
        )}

        {/* Transcripts */}
        {activeTab === 'transcripts' && (
          <div className="space-y-4">
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 flex items-center gap-2.5">
              <Lock className="w-4 h-4 text-amber-700 shrink-0" />
              <span>
                Raw transcripts are restricted admin-only records of live recordings. You must unlock Admin Mode with your passcode to read them.
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {transcripts.map((t) => (
                <Link
                  key={t.slug}
                  href={`/${courseSlug}/transcripts/${encodeURIComponent(t.slug)}`}
                  className="group p-5 bg-white border border-stone-200 hover:border-stone-400 rounded-2xl transition hover:shadow-xs flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-stone-100 text-stone-500 flex items-center justify-center">
                      <Lock className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-stone-900 group-hover:text-stone-700 transition">
                        {t.title}
                      </h3>
                      <p className="text-xs text-stone-400 font-mono mt-0.5">{t.slug}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <ReadingItemBadge
                      courseSlug={courseSlug}
                      type="transcripts"
                      slug={t.slug}
                      title={t.title}
                      url={`/${courseSlug}/transcripts/${encodeURIComponent(t.slug)}`}
                    />
                    <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-stone-700 shrink-0" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

