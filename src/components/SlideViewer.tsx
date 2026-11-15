'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, Minimize2, List, Sparkles, Bookmark, Check, CheckCircle2 } from 'lucide-react';
import { SlideDeck } from '@/lib/types';
import { useReadingProgress } from '@/context/ReadingProgressContext';
import MarkdownRenderer from './MarkdownRenderer';

interface SlideViewerProps {
  deck: SlideDeck;
  courseSlug: string;
}

export default function SlideViewer({ deck, courseSlug }: SlideViewerProps) {
  const { getBookmark, getItemProgress, saveProgress, markCurrent, toggleCompleted } = useReadingProgress();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showThumbnails, setShowThumbnails] = useState(false);
  const [resumedBanner, setResumedBanner] = useState<string | null>(null);
  const hasInitializedRef = useRef(false);

  const itemProgress = getItemProgress(courseSlug, 'slides', deck.slug);
  const isCompleted = Boolean(itemProgress?.isCompleted);

  const slides = deck.slides;
  const currentSlide = slides[currentIdx] || slides[0];

  // Restore saved slide index on mount
  useEffect(() => {
    if (hasInitializedRef.current) return;
    hasInitializedRef.current = true;

    const saved = getBookmark(courseSlug, 'slides');
    if (saved && saved.slug === deck.slug && saved.slideIndex !== undefined && saved.slideIndex > 0) {
      const idx = Math.min(slides.length - 1, Math.max(0, saved.slideIndex));
      setCurrentIdx(idx);
      setResumedBanner(`Resumed at slide ${idx + 1} of ${slides.length}`);
      setTimeout(() => setResumedBanner(null), 4000);
    }
  }, [courseSlug, deck.slug, getBookmark, slides.length]);

  // Update progress as slides change
  useEffect(() => {
    if (!hasInitializedRef.current) return;

    saveProgress({
      courseSlug,
      type: 'slides',
      slug: deck.slug,
      title: deck.title,
      url: `/${courseSlug}/slides/${encodeURIComponent(deck.slug)}`,
      scrollPercent: Math.round(((currentIdx + 1) / Math.max(1, slides.length)) * 100),
      slideIndex: currentIdx,
      totalSlides: slides.length,
    });
  }, [currentIdx, courseSlug, deck.slug, deck.title, slides.length, saveProgress]);

  const handleToggleDone = () => {
    toggleCompleted({
      courseSlug,
      type: 'slides',
      slug: deck.slug,
      title: deck.title,
      url: `/${courseSlug}/slides/${encodeURIComponent(deck.slug)}`,
      scrollPercent: isCompleted ? Math.round(((currentIdx + 1) / Math.max(1, slides.length)) * 100) : 100,
      slideIndex: currentIdx,
      totalSlides: slides.length,
    });
    setResumedBanner(isCompleted ? 'Marked deck as in progress' : 'Marked deck as completed!');
    setTimeout(() => setResumedBanner(null), 3000);
  };

  const handleManualBookmark = () => {
    markCurrent({
      courseSlug,
      type: 'slides',
      slug: deck.slug,
      title: deck.title,
      url: `/${courseSlug}/slides/${encodeURIComponent(deck.slug)}`,
      scrollPercent: Math.round(((currentIdx + 1) / Math.max(1, slides.length)) * 100),
      slideIndex: currentIdx,
      totalSlides: slides.length,
      isManual: true,
    });
    setResumedBanner(`Bookmarked slide ${currentIdx + 1} as where you left off`);
    setTimeout(() => setResumedBanner(null), 3000);
  };

  const goNext = useCallback(() => {
    setCurrentIdx((prev) => Math.min(slides.length - 1, prev + 1));
  }, [slides.length]);

  const goPrev = useCallback(() => {
    setCurrentIdx((prev) => Math.max(0, prev - 1));
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        e.preventDefault();
        goNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        goPrev();
      } else if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goNext, goPrev, isFullscreen]);

  return (
    <div className={`relative flex flex-col ${isFullscreen ? 'fixed inset-0 z-50 bg-stone-950 text-stone-100 p-6' : 'w-full'}`}>
      {/* Top Slide Control Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-stone-200/80 mb-6">
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-amber-700 bg-amber-50 border border-amber-200/60 px-2.5 py-1 rounded-md">
            Slide {currentIdx + 1} of {slides.length}
          </span>
          <span className="ml-3 text-xs text-stone-500 font-medium">
            {deck.status === 'ready' ? '✅ Final Deck' : '🚧 In-Progress'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleToggleDone}
            className={`p-2 px-3 rounded-lg text-xs font-bold flex items-center gap-1.5 transition shadow-2xs ${
              isCompleted
                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                : 'bg-white border border-stone-200 text-stone-700 hover:border-emerald-500 hover:text-emerald-700 hover:bg-emerald-50'
            }`}
            title={isCompleted ? 'Mark deck as incomplete' : 'Mark entire slide deck as completed'}
          >
            <CheckCircle2 className={`w-3.5 h-3.5 ${isCompleted ? 'text-white' : 'text-stone-400'}`} />
            <span>{isCompleted ? 'Completed' : 'Mark Done'}</span>
          </button>

          <button
            type="button"
            onClick={handleManualBookmark}
            className="p-2 px-2.5 text-stone-600 hover:text-amber-800 bg-white border border-stone-200 hover:border-amber-400 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-2xs"
            title="Mark this slide as where you left off reading"
          >
            <Bookmark className="w-3.5 h-3.5 text-amber-700" />
            <span className="hidden sm:inline">Bookmark Slide</span>
          </button>

          <button
            onClick={() => setShowThumbnails(!showThumbnails)}
            className="p-2 text-stone-600 hover:text-stone-900 bg-white border border-stone-200 rounded-lg text-xs font-medium flex items-center gap-1.5 transition"
            title="Toggle Slide Grid"
          >
            <List className="w-4 h-4" />
            <span className="hidden sm:inline">Grid</span>
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 text-stone-600 hover:text-stone-900 bg-white border border-stone-200 rounded-lg text-xs font-medium transition"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Presentation'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {resumedBanner && (
        <div className="mb-4 px-4 py-2 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs font-semibold flex items-center justify-between animate-in fade-in duration-200">
          <span>{resumedBanner}</span>
          <button type="button" onClick={() => setResumedBanner(null)} className="text-amber-700 hover:text-amber-950">✕</button>
        </div>
      )}

      {/* Thumbnails Drawer */}
      {showThumbnails && (
        <div className="mb-6 p-4 bg-stone-100 rounded-2xl border border-stone-200 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 max-h-60 overflow-y-auto">
          {slides.map((s, idx) => (
            <button
              key={idx}
              onClick={() => {
                setCurrentIdx(idx);
                setShowThumbnails(false);
              }}
              className={`p-2.5 rounded-xl text-left border text-xs transition ${currentIdx === idx
                  ? 'bg-amber-600 text-white border-amber-600 font-medium shadow-xs'
                  : 'bg-white text-stone-700 border-stone-200 hover:border-amber-400'
                }`}
            >
              <div className="text-[10px] opacity-75 font-mono">Slide {idx + 1}</div>
              <div className="line-clamp-2 mt-0.5">{s.title.replace(/^Slide \d+:\s*/, '')}</div>
            </button>
          ))}
        </div>
      )}

      {/* Main Slide Card */}
      <div className={`flex-1 flex flex-col justify-center min-h-[420px] rounded-3xl p-8 sm:p-12 shadow-sm transition-all border ${isFullscreen ? 'bg-stone-900 border-stone-800' : 'bg-white border-stone-200'
        }`}>
        <div className="max-w-3xl mx-auto w-full">
          {/* Header */}
          {currentSlide.title && (
            <div className="mb-6 pb-4 border-b border-stone-100">
              <h2 className="text-xl sm:text-3xl font-bold tracking-tight text-stone-900">
                {currentSlide.title.replace(/^Slide \d+:\s*/, '')}
              </h2>
              {currentSlide.subtitle && (
                <p className="text-sm sm:text-base text-amber-700 font-medium mt-1">
                  {currentSlide.subtitle}
                </p>
              )}
            </div>
          )}

          {/* Slide Body */}
          <div className="text-base sm:text-lg leading-relaxed">
            <MarkdownRenderer
              content={currentSlide.content.replace(/^##\s+[^\n]+\n/, '').replace(/^###\s+[^\n]+\n/, '')}
            />
          </div>
        </div>
      </div>

      {/* Bottom Nav Controls */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-stone-200/80">
        <button
          onClick={goPrev}
          disabled={currentIdx === 0}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-stone-200 text-stone-700 font-medium text-sm hover:bg-stone-50 active:bg-stone-100 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-2xs"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        {/* Progress Dots */}
        <div className="hidden sm:flex items-center gap-1.5 overflow-x-auto px-4 max-w-md">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIdx(idx)}
              className={`h-2 rounded-full transition-all ${currentIdx === idx ? 'w-6 bg-amber-600' : 'w-2 bg-stone-300 hover:bg-stone-400'
                }`}
              title={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

        <button
          onClick={goNext}
          disabled={currentIdx === slides.length - 1}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-stone-900 text-white font-medium text-sm hover:bg-stone-800 active:bg-black disabled:opacity-40 disabled:cursor-not-allowed transition shadow-2xs"
        >
          <span>Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

