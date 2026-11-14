'use client';

import React, { useState, useEffect, useTransition, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import './reader.css';
import { BOOK_PARTS, ALL_CHAPTERS, ChapterMeta, BookPart } from '@/data/bookStructure';
import { QuizQuestion } from '@/lib/types';
import { useReadingProgress } from '@/context/ReadingProgressContext';
import ChapterContent, { extractChapterHeadings } from './ChapterContent';
import ChapterQuiz from './ChapterQuiz';

interface UniversalReaderProps {
  courseSlug: string;
  initialSlug: string;
  brandTitle?: string;
  basePath?: string;
  backUrl?: string;
}

export default function ReaderView({
  courseSlug = 'hastarekha',
  initialSlug,
  brandTitle = 'Hasta Sāmudrika Śāstra',
  basePath = `/${courseSlug}/chapters`,
  backUrl = `/${courseSlug}?tab=chapters`,
}: UniversalReaderProps) {
  const router = useRouter();
  const [currentSlug, setCurrentSlug] = useState(initialSlug);
  const [chapterData, setChapterData] = useState<{
    meta: ChapterMeta & { read_time?: string };
    content: string;
    isCompiled: boolean;
    compiledChapterIds?: string[];
    quizQuestions?: QuizQuestion[];
    adjacent: {
      prev: { id: string; title: string; code?: string; slug?: string } | null;
      next: { id: string; title: string; code?: string; slug?: string } | null;
    };
  } | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [fontSizeMultiplier, setFontSizeMultiplier] = useState(1);
  const [showFontPopover, setShowFontPopover] = useState(false);
  const [readProgress, setReadProgress] = useState(0);
  const [activeSectionId, setActiveSectionId] = useState<string>('');
  const [compiledChapterIds, setCompiledChapterIds] = useState<string[]>([]);
  const [isCurrentMarked, setIsCurrentMarked] = useState(false);

  const { getBookmark, saveProgress, markCurrent } = useReadingProgress();
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [, startTransition] = useTransition();

  // 1. Load font size from localStorage
  useEffect(() => {
    try {
      const savedFontSize = localStorage.getItem('mynotes_reader_fontsize');
      if (savedFontSize) setFontSizeMultiplier(parseFloat(savedFontSize));
    } catch { }
  }, []);

  // 2. Fetch chapter data & restore position
  useEffect(() => {
    let isCancelled = false;
    setIsLoading(true);

    async function fetchChapter() {
      try {
        const endpoint = courseSlug === 'hastarekha'
          ? `/api/hastarekha/chapters?slug=${encodeURIComponent(currentSlug)}`
          : `/api/courses/${courseSlug}/chapters?slug=${encodeURIComponent(currentSlug)}`;

        const res = await fetch(endpoint);
        if (!res.ok) throw new Error('Failed to load chapter');
        const data = await res.json();
        if (!isCancelled) {
          setChapterData(data);
          if (Array.isArray(data.compiledChapterIds)) {
            setCompiledChapterIds(data.compiledChapterIds);
          }
          setIsLoading(false);

          // Check if returning to this chapter with saved reading position
          const saved = getBookmark(courseSlug, 'chapters');
          if (saved && saved.slug === currentSlug && saved.scrollY && saved.scrollY > 250) {
            setIsCurrentMarked(Boolean(saved.isManual));
            setTimeout(() => {
              window.scrollTo({ top: saved.scrollY, behavior: 'smooth' });
            }, 300);
          } else {
            window.scrollTo({ top: 0, behavior: 'instant' });
            saveProgress({
              courseSlug,
              type: 'chapters',
              slug: currentSlug,
              title: data.meta?.title || currentSlug,
              url: `${basePath}/${currentSlug}`,
              scrollPercent: 0,
              scrollY: 0,
            });
          }
        }
      } catch (err) {
        console.error('Error fetching chapter:', err);
        if (!isCancelled) setIsLoading(false);
      }
    }

    fetchChapter();
    return () => {
      isCancelled = true;
    };
  }, [currentSlug, courseSlug, basePath, getBookmark, saveProgress]);

  // 3. Scroll spy and reading progress calculation
  useEffect(() => {
    const handleScroll = () => {
      const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = height > 0 ? (winScroll / height) * 100 : 0;
      setReadProgress(Math.min(100, Math.max(0, scrolled)));

      if (chapterData?.content) {
        const headings = extractChapterHeadings(chapterData.content);
        for (let i = headings.length - 1; i >= 0; i--) {
          const el = document.getElementById(headings[i].id);
          if (el) {
            const rect = el.getBoundingClientRect();
            if (rect.top <= 140) {
              setActiveSectionId(headings[i].id);
              return;
            }
          }
        }
        if (headings.length > 0 && winScroll < 200) {
          setActiveSectionId(headings[0].id);
        }
      }

      // Debounced progress save
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(() => {
        if (chapterData?.meta?.title) {
          saveProgress({
            courseSlug,
            type: 'chapters',
            slug: currentSlug,
            title: chapterData.meta.title,
            url: `${basePath}/${currentSlug}`,
            scrollPercent: Math.round(scrolled),
            scrollY: Math.round(winScroll),
            isManual: isCurrentMarked,
          });
        }
      }, 300);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, [chapterData, courseSlug, currentSlug, basePath, saveProgress, isCurrentMarked]);

  const handleToggleBookmark = () => {
    const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = height > 0 ? (winScroll / height) * 100 : 0;
    const title = chapterData?.meta?.title || currentSlug;

    markCurrent({
      courseSlug,
      type: 'chapters',
      slug: currentSlug,
      title,
      url: `${basePath}/${currentSlug}`,
      scrollPercent: Math.round(scrolled),
      scrollY: Math.round(winScroll),
      isManual: true,
    });
    setIsCurrentMarked(true);
  };

  const handleSelectChapter = (slug: string) => {
    setIsDrawerOpen(false);
    startTransition(() => {
      setCurrentSlug(slug);
      router.push(`${basePath}/${slug}`);
    });
  };

  const updateFontSize = (multiplier: number) => {
    setFontSizeMultiplier(multiplier);
    try {
      localStorage.setItem('mynotes_reader_fontsize', multiplier.toString());
    } catch { }
  };

  const headings = chapterData?.content ? extractChapterHeadings(chapterData.content) : [];
  const activeReadTime = chapterData?.meta?.readTime || chapterData?.meta?.read_time || '12 min read';

  // For hastarekha, use BOOK_PARTS; for others, create a default part
  const displayParts: BookPart[] = courseSlug === 'hastarekha'
    ? BOOK_PARTS
    : [
      {
        id: 'all',
        title: 'COURSE CHAPTERS',
        description: '',
        chapters: ALL_CHAPTERS,
      },
    ];

  return (
    <div
      className="reader-root"
      style={{ ['--fs' as string]: fontSizeMultiplier }}
    >
      {/* ---------- TOP STICKY BAR ---------- */}
      <header className="bar">
        {/* Drawer button */}
        <button
          type="button"
          className="ib"
          onClick={() => setIsDrawerOpen(true)}
          title="Open Table of Contents"
          aria-label="Table of Contents"
        >
          <svg
            viewBox="0 0 24 24"
            width="22"
            height="22"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          >
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        {/* Brand */}
        <Link href={backUrl} className="brand">
          {brandTitle}
        </Link>

        {/* Where locator */}
        {chapterData?.meta && (
          <span className="where">
            {chapterData.meta.partTitle ? ` · ${chapterData.meta.partTitle}` : ''}
            {chapterData.meta.code ? ` · ${chapterData.meta.code}` : ''}
            <span className="where-time"> · ⏱ {activeReadTime}</span>
          </span>
        )}

        <div className="sp" />

        {/* Back Link */}
        <Link
          href={backUrl}
          className="ib"
          title="Back to Course Overview"
          style={{ fontSize: '0.85rem', textDecoration: 'none' }}
        >
          Overview
        </Link>

        {/* Bookmark / Mark Left Off */}
        <button
          type="button"
          className="ib"
          onClick={handleToggleBookmark}
          title={isCurrentMarked ? 'Bookmarked as where you left off' : 'Mark where I left off reading'}
          style={{ color: isCurrentMarked ? '#d97706' : undefined }}
          aria-label="Bookmark reading location"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill={isCurrentMarked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
        </button>

        {/* Text Size (AA) */}
        <button
          type="button"
          className="ib"
          onClick={() => setShowFontPopover(!showFontPopover)}
          title="Adjust Text Size"
          aria-expanded={showFontPopover}
        >
          <span className="aa">
            A<small>A</small>
          </span>
        </button>

        {/* Real-time reading progress bar */}
        <div className="progress" style={{ width: `${readProgress}%` }} />
      </header>

      {/* ---------- TEXT SIZE POPOVER ---------- */}
      {showFontPopover && (
        <div className="pop">
          <h2>Text Size</h2>
          <div className="sizer">
            <button
              type="button"
              className="minus"
              onClick={() => updateFontSize(Math.max(0.85, fontSizeMultiplier - 0.1))}
              disabled={fontSizeMultiplier <= 0.85}
            >
              −
            </button>
            <div className="pct">{Math.round(fontSizeMultiplier * 100)}%</div>
            <button
              type="button"
              className="plus"
              onClick={() => updateFontSize(Math.min(1.35, fontSizeMultiplier + 0.1))}
              disabled={fontSizeMultiplier >= 1.35}
            >
              +
            </button>
          </div>
          <div className="sample">
            Sample text: <em>Lakṣaṇa Vidyā</em> reveals character and health through physical signs.
          </div>
        </div>
      )}

      {/* ---------- SLIDING DRAWER ---------- */}
      {isDrawerOpen && (
        <>
          <div className="scrim" onClick={() => setIsDrawerOpen(false)} />
          <aside className="drawer">
            <div className="dh">
              <strong>Table of Contents</strong>
              <button
                type="button"
                className="ib"
                onClick={() => setIsDrawerOpen(false)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <nav className="np">
              {displayParts.map((part) => (
                <div key={part.id}>
                  <h2>{part.title}</h2>
                  <ul>
                    {part.chapters.map((ch) => {
                      const isActive = ch.id === currentSlug || ch.id === chapterData?.meta?.id;
                      const isCompiled = compiledChapterIds.length > 0
                        ? compiledChapterIds.includes(ch.id)
                        : Boolean(ch.hasCompiledChapter ?? true);

                      return (
                        <li key={ch.id}>
                          <a
                            href={`${basePath}/${ch.id}`}
                            className={`${isActive ? 'on' : ''} ${isCompiled ? 'is-chapter' : 'is-note'}`}
                            onClick={(e) => {
                              e.preventDefault();
                              handleSelectChapter(ch.id);
                            }}
                          >
                            <span className="n">{ch.code || '•'}</span>
                            <span style={{ flex: 1, minWidth: 0, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                              {ch.title}
                            </span>
                            <span className="toc-time">{ch.readTime}</span>
                            {isCompiled ? (
                              <span className="badge-chapter">Chapter</span>
                            ) : (
                              <span className="badge-upcoming">In Prep</span>
                            )}
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </nav>
          </aside>
        </>
      )}

      {/* ---------- PAGE FRAME ---------- */}
      <main>
        <div className="frame">
          {/* DESKTOP RAIL: Left In This Chapter */}
          <nav className="rail">
            <div className="rail-head">
              <h3>In this chapter</h3>
              <div className="rail-time">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                {activeReadTime}
              </div>
            </div>
            {chapterData?.isCompiled && headings.length > 0 ? (
              <ol>
                {headings.map((h) => {
                  const isActive = activeSectionId === h.id;
                  return (
                    <li key={h.id}>
                      <a
                        href={`#${h.id}`}
                        className={isActive ? 'on' : ''}
                      >
                        {h.title}
                      </a>
                    </li>
                  );
                })}
              </ol>
            ) : (
              <p style={{ color: 'var(--muted)', fontSize: '0.85rem', fontStyle: 'italic', padding: '8px 0' }}>
                {chapterData?.isCompiled ? '...' : 'Editorial preparation in progress.'}
              </p>
            )}

            {chapterData?.isCompiled && chapterData?.meta?.sourceNotes && (
              <div className="rail-quiz-link">
                <a href="#chapter-assessment">
                  <span>🎯</span> Chapter Assessment
                </a>
              </div>
            )}
          </nav>

          {/* MAIN CHAPTER ARTICLE */}
          <article className="ch">
            {isLoading ? (
              <div style={{ padding: '96px 0', textAlign: 'center', color: 'var(--muted)', fontFamily: 'var(--ui)' }}>
                Loading chapter...
              </div>
            ) : chapterData ? (
              <>
                {/* Chapter Opener */}
                <header className="opener">
                  <div className="opener-meta">
                    {chapterData.meta.partTitle && (
                      <p className="eyebrow" style={{ margin: 0 }}>
                        {chapterData.meta.partTitle} {chapterData.meta.code ? `· CHAPTER ${chapterData.meta.code}` : ''}
                      </p>
                    )}
                    <span className="meta-dot">·</span>
                    <span className="read-time" title="Estimated reading time">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      {activeReadTime}
                    </span>
                    <span className="meta-dot">·</span>
                    <span className="badge-chapter">✦ Chapter Edition</span>
                  </div>

                  <h1>{chapterData.meta.title}</h1>
                  {chapterData.meta.subtitleSanskrit && (
                    <p className="skt">{chapterData.meta.subtitleSanskrit}</p>
                  )}
                  {chapterData.meta.essence && (
                    <p className="essence">{chapterData.meta.essence}</p>
                  )}
                </header>

                {/* Chapter Running Prose */}
                <ChapterContent content={chapterData.content} />

                {/* Non-Intrusive Chapter Assessment Quiz */}
                <ChapterQuiz
                  questions={chapterData.quizQuestions || []}
                  chapterTitle={chapterData.meta.title}
                  chapterCode={chapterData.meta.code || 'CH'}
                />

                {/* Previous / Next Chapter Cards */}
                <nav className="pn">
                  {chapterData.adjacent?.prev ? (
                    <a
                      href={`${basePath}/${chapterData.adjacent.prev.slug || chapterData.adjacent.prev.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        handleSelectChapter(chapterData.adjacent.prev!.slug || chapterData.adjacent.prev!.id);
                      }}
                    >
                      <small>Previous {chapterData.adjacent.prev.code ? `· ${chapterData.adjacent.prev.code}` : ''}</small>
                      {chapterData.adjacent.prev.title}
                    </a>
                  ) : <div />}

                  {chapterData.adjacent?.next ? (
                    <a
                      href={`${basePath}/${chapterData.adjacent.next.slug || chapterData.adjacent.next.id}`}
                      className="nx"
                      onClick={(e) => {
                        e.preventDefault();
                        handleSelectChapter(chapterData.adjacent.next!.slug || chapterData.adjacent.next!.id);
                      }}
                    >
                      <small>Next {chapterData.adjacent.next.code ? `· ${chapterData.adjacent.next.code}` : ''}</small>
                      {chapterData.adjacent.next.title}
                    </a>
                  ) : <div />}
                </nav>
              </>
            ) : (
              <div style={{ padding: '64px 0', textAlign: 'center' }}>
                <p>Chapter not found.</p>
                <button
                  type="button"
                  onClick={() => handleSelectChapter('01-introduction')}
                  className="btn"
                  style={{ marginTop: '16px' }}
                >
                  Return to Introduction
                </button>
              </div>
            )}
          </article>
        </div>
      </main>
    </div>
  );
}
