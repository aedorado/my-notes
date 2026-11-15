'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useReadingProgress } from '@/context/ReadingProgressContext';
import { ReadingContentType } from '@/lib/readingProgress';
import { Bookmark, Check, ArrowUp, ArrowLeft, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';

interface NoteReadingTrackerProps {
  courseSlug: string;
  courseTitle?: string;
  type: ReadingContentType;
  slug: string;
  title: string;
  url: string;
  prev?: { slug: string; title: string } | null;
  next?: { slug: string; title: string } | null;
  extraControls?: React.ReactNode;
}

export default function NoteReadingTracker({
  courseSlug,
  courseTitle,
  type,
  slug,
  title,
  url,
  prev,
  next,
  extraControls,
}: NoteReadingTrackerProps) {
  const { getBookmark, getItemProgress, saveProgress, markCurrent, toggleCompleted } = useReadingProgress();
  const [scrollPercent, setScrollPercent] = useState(0);
  const [showRestorePrompt, setShowRestorePrompt] = useState(false);
  const [savedY, setSavedY] = useState(0);
  const [savedPercent, setSavedPercent] = useState(0);
  const [didAutoScroll, setDidAutoScroll] = useState(false);
  const [hasManuallyMarked, setHasManuallyMarked] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const initializedKeyRef = useRef<string | null>(null);

  const itemProgress = getItemProgress(courseSlug, type, slug);
  const isCompleted = Boolean(itemProgress?.isCompleted);

  const currentBookmark = getBookmark(courseSlug, type);
  const isCurrentBookmark = currentBookmark?.slug?.toLowerCase() === slug.toLowerCase();

  // On mount: check if returning to this note and offer position restore
  useEffect(() => {
    const noteKey = `${courseSlug}:${type}:${slug}`;
    if (initializedKeyRef.current === noteKey) return;
    initializedKeyRef.current = noteKey;

    // Only get saved progress for THIS specific note
    const saved = getItemProgress(courseSlug, type, slug);
    const hasPreviousSpot = Boolean(saved && saved.scrollY && saved.scrollY > 250);

    // Check if user explicitly clicked "Resume" from a link with ?resume=1
    let explicitResume = false;
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      explicitResume = params.get('resume') === '1' || params.get('resume') === 'true';
    }

    if (saved && hasPreviousSpot) {
      setSavedY(saved.scrollY || 0);
      setSavedPercent(saved.scrollPercent || 0);
      setScrollPercent(saved.scrollPercent || 0);
      setHasManuallyMarked(Boolean(saved.isManual));

      if (explicitResume) {
        // User explicitly pressed "Resume" button -> scroll to spot
        setDidAutoScroll(true);
        setShowRestorePrompt(true);
        const autoScrollTimer = setTimeout(() => {
          window.scrollTo({ top: saved.scrollY, behavior: 'smooth' });
        }, 300);

        const hideToastTimer = setTimeout(() => {
          setShowRestorePrompt(false);
        }, 5000);

        return () => {
          clearTimeout(autoScrollTimer);
          clearTimeout(hideToastTimer);
        };
      } else {
        // Normal entry -> Stay at top (0%)! Show friendly prompt with Jump button
        setDidAutoScroll(false);
        setShowRestorePrompt(true);

        const hideToastTimer = setTimeout(() => {
          setShowRestorePrompt(false);
        }, 8000);

        return () => clearTimeout(hideToastTimer);
      }
    } else {
      // First visit to this note - start at top with 0% scroll
      saveProgress({
        courseSlug,
        type,
        slug,
        title,
        url,
        scrollPercent: saved?.isCompleted ? 100 : 0,
        scrollY: 0,
        isCompleted: saved?.isCompleted,
      });
      setScrollPercent(saved?.isCompleted ? 100 : 0);
      setSavedY(0);
      setSavedPercent(0);
      setShowRestorePrompt(false);
    }
  }, [courseSlug, type, slug, title, url, getItemProgress, saveProgress]);

  // Scroll listener with debounce (250ms)
  useEffect(() => {
    const handleScroll = () => {
      const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = height > 0 ? (winScroll / height) * 100 : 0;
      const boundedPercent = Math.min(100, Math.max(0, Math.round(scrolled)));

      setScrollPercent(boundedPercent);

      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      scrollTimeoutRef.current = setTimeout(() => {
        saveProgress({
          courseSlug,
          type,
          slug,
          title,
          url,
          scrollPercent: boundedPercent,
          scrollY: Math.round(winScroll),
          isManual: hasManuallyMarked,
          isCompleted,
        });
      }, 250);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, [courseSlug, type, slug, title, url, saveProgress, hasManuallyMarked, isCompleted]);

  const handleToggleDone = () => {
    const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
    toggleCompleted({
      courseSlug,
      type,
      slug,
      title,
      url,
      scrollPercent: isCompleted ? scrollPercent : 100,
      scrollY: Math.round(winScroll),
    });
  };

  const handleToggleManualMark = () => {
    const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = height > 0 ? (winScroll / height) * 100 : 0;

    markCurrent({
      courseSlug,
      type,
      slug,
      title,
      url,
      scrollPercent: Math.min(100, Math.max(0, Math.round(scrolled))),
      scrollY: Math.round(winScroll),
      isManual: true,
      isCompleted,
    });
    setHasManuallyMarked(true);
  };

  const jumpToSaved = () => {
    if (savedY > 0) {
      window.scrollTo({ top: savedY, behavior: 'smooth' });
      setDidAutoScroll(true);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setDidAutoScroll(false);
  };

  return (
    <>
      {/* Sticky Reader Navigation & Progress Bar */}
      <div className="sticky top-14 z-30 -mx-1 px-1 py-1.5 bg-[#faf9f5]/90 backdrop-blur-md transition-all">
        <div className="relative flex items-center justify-between gap-3 p-2.5 sm:px-4 rounded-2xl bg-white border border-stone-200/90 shadow-xs text-xs overflow-hidden">
          {/* Subtle real-time bottom progress bar */}
          <div
            className={`absolute bottom-0 left-0 h-[2.5px] transition-all duration-150 ${
              isCompleted ? 'bg-emerald-500' : 'bg-indigo-600'
            }`}
            style={{ width: `${isCompleted ? 100 : scrollPercent}%` }}
          />

          {/* Left: Back Link & Chevrons */}
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            {courseTitle ? (
              <Link
                href={`/${courseSlug}?tab=${type}`}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-700 hover:text-stone-950 transition shrink-0 bg-stone-50 hover:bg-stone-100 px-2.5 py-1.5 rounded-xl border border-stone-200/80"
                title={`Back to ${courseTitle}`}
              >
                <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline text-stone-500 font-normal">Back to</span>
                <span className="font-bold truncate max-w-[110px] sm:max-w-[200px] text-stone-900">
                  {courseTitle}
                </span>
              </Link>
            ) : (
              <Link
                href={`/${courseSlug}?tab=${type}`}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-700 hover:text-stone-950 transition shrink-0 bg-stone-50 hover:bg-stone-100 px-2.5 py-1.5 rounded-xl border border-stone-200/80"
              >
                <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
                <span>Back</span>
              </Link>
            )}

            {(prev || next) && (
              <div className="flex items-center gap-1 shrink-0">
                {prev ? (
                  <Link
                    href={`/${courseSlug}/${type}/${encodeURIComponent(prev.slug)}`}
                    className="p-1.5 rounded-xl border border-stone-200/80 bg-stone-50 hover:bg-stone-100 text-stone-600 hover:text-stone-900 transition"
                    title={`Previous: ${prev.title}`}
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </Link>
                ) : (
                  <span className="p-1.5 rounded-xl border border-stone-200/40 bg-stone-50/50 text-stone-300 cursor-not-allowed">
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </span>
                )}

                {next ? (
                  <Link
                    href={`/${courseSlug}/${type}/${encodeURIComponent(next.slug)}`}
                    className="p-1.5 rounded-xl border border-stone-200/80 bg-stone-50 hover:bg-stone-100 text-stone-600 hover:text-stone-900 transition"
                    title={`Next: ${next.title}`}
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                ) : (
                  <span className="p-1.5 rounded-xl border border-stone-200/40 bg-stone-50/50 text-stone-300 cursor-not-allowed">
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Right: Progress & Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {extraControls}

            {/* Reading Percentage Indicator */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-12 sm:w-16 bg-stone-200 h-1.5 rounded-full overflow-hidden shrink-0">
                <div
                  className={`h-full transition-all duration-150 ${
                    isCompleted ? 'bg-emerald-500' : 'bg-indigo-600'
                  }`}
                  style={{ width: `${isCompleted ? 100 : scrollPercent}%` }}
                />
              </div>
              <span className="font-semibold text-stone-700 font-mono text-[11px] whitespace-nowrap">
                {isCompleted ? '100%' : `${scrollPercent}%`} read
              </span>
            </div>

            {/* Mark as Done Toggle Button */}
            <button
              type="button"
              onClick={handleToggleDone}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition shadow-2xs whitespace-nowrap ${
                isCompleted
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                  : 'bg-stone-50 border border-stone-200 text-stone-700 hover:border-emerald-500 hover:text-emerald-700 hover:bg-emerald-50/60'
              }`}
              title={isCompleted ? 'Mark as incomplete' : 'Mark as completed'}
            >
              <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${isCompleted ? 'text-white' : 'text-stone-400'}`} />
              <span className="hidden sm:inline">
                {isCompleted ? 'Completed' : 'Mark as Done'}
              </span>
              <span className="sm:hidden">
                {isCompleted ? 'Done' : 'Done'}
              </span>
            </button>

            {/* Save Reading Spot Button */}
            <button
              type="button"
              onClick={handleToggleManualMark}
              className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl font-semibold transition border ${
                hasManuallyMarked || isCurrentBookmark
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                  : 'bg-stone-50 border-stone-200 text-stone-500 hover:bg-stone-100 hover:text-stone-800'
              }`}
              title={hasManuallyMarked || isCurrentBookmark ? 'Bookmarked as where you left off' : 'Mark exact scroll position'}
            >
              <Bookmark className={`w-3.5 h-3.5 ${hasManuallyMarked || isCurrentBookmark ? 'fill-indigo-600 text-indigo-700' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Floating Resume Notification on page entry */}
      {showRestorePrompt && savedY > 0 && (
        <aside
          aria-label="Reading position notice"
          className="fixed bottom-6 right-6 z-40 bg-stone-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-stone-800 flex items-center gap-3 text-xs animate-in slide-in-from-bottom-3 duration-200"
        >
          {didAutoScroll ? (
            <>
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-lg bg-indigo-500/20 text-indigo-300">
                  <Check className="w-3.5 h-3.5" />
                </span>
                <span>
                  Resumed at <strong>{savedPercent}%</strong>
                </span>
              </div>

              <div className="flex items-center gap-1.5 border-l border-stone-700 pl-3">
                <button
                  type="button"
                  onClick={scrollToTop}
                  className="text-stone-400 hover:text-white flex items-center gap-0.5 px-2 py-1 rounded hover:bg-stone-800 transition"
                  title="Scroll to top"
                >
                  <ArrowUp className="w-3 h-3" />
                  <span>Top</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowRestorePrompt(false)}
                  className="text-stone-400 hover:text-stone-200 px-1.5 py-1"
                >
                  ✕
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-lg bg-amber-500/20 text-amber-300">
                  <Bookmark className="w-3.5 h-3.5 text-amber-400" />
                </span>
                <span>
                  You were reading at <strong>{savedPercent}%</strong>
                </span>
              </div>

              <div className="flex items-center gap-1.5 border-l border-stone-700 pl-3">
                <button
                  type="button"
                  onClick={jumpToSaved}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-1 px-2.5 py-1 rounded-lg transition"
                  title="Jump to where you left off"
                >
                  <span>Jump to spot ↓</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowRestorePrompt(false)}
                  className="text-stone-400 hover:text-stone-200 px-1.5 py-1"
                >
                  ✕
                </button>
              </div>
            </>
          )}
        </aside>
      )}
    </>
  );
}
