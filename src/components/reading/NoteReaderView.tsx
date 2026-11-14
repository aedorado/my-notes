'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import NoteReadingTracker from '@/components/reading/NoteReadingTracker';
import {
  extractNoteToc,
  useScrollspy,
  NoteSidebarToc,
  NoteTocDrawer,
} from '@/components/reading/NoteTableOfContents';
import {
  FileText,
  ChevronLeft,
  ChevronRight,
  ListTree,
  Highlighter,
  Trash2,
  Copy,
  Check,
  X,
  Type,
} from 'lucide-react';

interface NoteReaderViewProps {
  courseSlug: string;
  courseTitle: string;
  note: {
    slug: string;
    title: string;
    content: string;
  };
  prev: { slug: string; title: string } | null;
  next: { slug: string; title: string } | null;
}

interface SavedHighlight {
  id: string;
  text: string;
  createdAt: number;
}

export default function NoteReaderView({
  courseSlug,
  courseTitle,
  note,
  prev,
  next,
}: NoteReaderViewProps) {
  // 1. Table of Contents & Scrollspy
  const toc = useMemo(() => extractNoteToc(note.content), [note.content]);
  const headingIds = useMemo(() => toc.map((t) => t.id), [toc]);
  const activeHeadingId = useScrollspy(headingIds);
  const [isTocDrawerOpen, setIsTocDrawerOpen] = useState(false);

  // 2. Font Size control: sm, base, lg, xl
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg' | 'xl'>('base');
  const [showFontPopover, setShowFontPopover] = useState(false);

  useEffect(() => {
    try {
      const savedSize = localStorage.getItem('mynotes_note_fontsize');
      if (savedSize && ['sm', 'base', 'lg', 'xl'].includes(savedSize)) {
        setFontSize(savedSize as 'sm' | 'base' | 'lg' | 'xl');
      }
    } catch {}
  }, []);

  const changeFontSize = (size: 'sm' | 'base' | 'lg' | 'xl') => {
    setFontSize(size);
    try {
      localStorage.setItem('mynotes_note_fontsize', size);
    } catch {}
    setShowFontPopover(false);
  };

  // 3. Text Highlighting / Saved Quotes
  const highlightStorageKey = `mynotes_highlights_${courseSlug}_${note.slug}`;
  const [highlights, setHighlights] = useState<SavedHighlight[]>([]);
  const [isHighlightsDrawerOpen, setIsHighlightsDrawerOpen] = useState(false);
  const [selectionPopup, setSelectionPopup] = useState<{
    visible: boolean;
    x: number;
    y: number;
    text: string;
  }>({ visible: false, x: 0, y: 0, text: '' });
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const articleRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(highlightStorageKey);
      if (raw) {
        setHighlights(JSON.parse(raw));
      }
    } catch {}
  }, [highlightStorageKey]);

  // Handle text selection in article
  useEffect(() => {
    const handleMouseUp = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed || !articleRef.current) {
        setSelectionPopup((p) => ({ ...p, visible: false }));
        return;
      }

      const text = selection.toString().trim();
      if (text.length < 5) {
        setSelectionPopup((p) => ({ ...p, visible: false }));
        return;
      }

      // Check if selection is within articleRef
      if (!articleRef.current.contains(selection.anchorNode)) {
        setSelectionPopup((p) => ({ ...p, visible: false }));
        return;
      }

      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      setSelectionPopup({
        visible: true,
        x: rect.left + rect.width / 2,
        y: rect.top - 10,
        text,
      });
    };

    document.addEventListener('mouseup', handleMouseUp);
    return () => document.removeEventListener('mouseup', handleMouseUp);
  }, []);

  const saveSelectedHighlight = () => {
    if (!selectionPopup.text) return;
    const newHighlight: SavedHighlight = {
      id: Date.now().toString(),
      text: selectionPopup.text,
      createdAt: Date.now(),
    };
    const updated = [newHighlight, ...highlights];
    setHighlights(updated);
    try {
      localStorage.setItem(highlightStorageKey, JSON.stringify(updated));
    } catch {}
    setSelectionPopup({ visible: false, x: 0, y: 0, text: '' });
    window.getSelection()?.removeAllRanges();
  };

  const deleteHighlight = (id: string) => {
    const updated = highlights.filter((h) => h.id !== id);
    setHighlights(updated);
    try {
      localStorage.setItem(highlightStorageKey, JSON.stringify(updated));
    } catch {}
  };

  const copyHighlight = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Sticky Reader Navigation, Progress & Actions Bar */}
      <NoteReadingTracker
        courseSlug={courseSlug}
        courseTitle={courseTitle}
        type="notes"
        slug={note.slug}
        title={note.title}
        url={`/${courseSlug}/notes/${encodeURIComponent(note.slug)}`}
        prev={prev ? { slug: prev.slug, title: prev.title } : null}
        next={next ? { slug: next.slug, title: next.title } : null}
        extraControls={
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Outline / TOC Button */}
            {toc.length > 0 && (
              <button
                type="button"
                onClick={() => setIsTocDrawerOpen(true)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-stone-200/90 bg-stone-50 hover:bg-stone-100 text-stone-700 hover:text-stone-900 text-xs font-semibold transition"
                title="View Table of Contents"
              >
                <ListTree className="w-3.5 h-3.5 text-amber-700" />
                <span className="hidden sm:inline">Outline</span>
                <span className="text-[10px] text-stone-400 font-mono">({toc.length})</span>
              </button>
            )}

            {/* Font Size AA Popover */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowFontPopover(!showFontPopover)}
                className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-stone-200/90 text-xs font-semibold transition ${
                  showFontPopover
                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                    : 'bg-stone-50 hover:bg-stone-100 text-stone-700 hover:text-stone-900'
                }`}
                title="Adjust text size"
                aria-expanded={showFontPopover}
              >
                <Type className="w-3.5 h-3.5" />
                <span className="uppercase text-[11px] font-bold">
                  {fontSize === 'sm' ? 'S' : fontSize === 'base' ? 'M' : fontSize === 'lg' ? 'L' : 'XL'}
                </span>
              </button>

              {showFontPopover && (
                <div
                  className="absolute top-full right-0 mt-2 p-2 rounded-2xl bg-white border border-stone-200 shadow-xl z-50 flex items-center gap-1 animate-in fade-in duration-150"
                  onClick={(e) => e.stopPropagation()}
                >
                  {(['sm', 'base', 'lg', 'xl'] as const).map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => changeFontSize(sz)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                        fontSize === sz
                          ? 'bg-amber-600 text-white shadow-2xs'
                          : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                      }`}
                    >
                      {sz === 'sm' ? 'Small' : sz === 'base' ? 'Medium' : sz === 'lg' ? 'Large' : 'Huge'}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Highlights Drawer Button */}
            {highlights.length > 0 && (
              <button
                type="button"
                onClick={() => setIsHighlightsDrawerOpen(true)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-semibold transition"
                title="View saved quotes & highlights"
              >
                <Highlighter className="w-3.5 h-3.5 text-amber-700" />
                <span className="hidden md:inline">Quotes</span>
                <span className="text-[10px] font-mono font-bold text-amber-800">
                  ({highlights.length})
                </span>
              </button>
            )}
          </div>
        }
      />

      {/* Floating Highlight Action Button when user selects text */}
      {selectionPopup.visible && (
        <div
          className="fixed z-50 -translate-x-1/2 -translate-y-full pb-2 animate-in fade-in duration-100"
          style={{ left: `${selectionPopup.x}px`, top: `${selectionPopup.y}px` }}
        >
          <button
            type="button"
            onClick={saveSelectedHighlight}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-900 text-white hover:bg-black shadow-lg text-xs font-semibold transition transform hover:scale-105 cursor-pointer border border-stone-700"
          >
            <Highlighter className="w-3.5 h-3.5 text-amber-400" />
            <span>Highlight Quote</span>
          </button>
        </div>
      )}

      {/* Note Title Header */}
      <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-10 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-semibold text-indigo-700 uppercase tracking-wider mb-2">
          <FileText className="w-4 h-4" />
          <span>Lecture Note</span>
          <span className="text-stone-300">•</span>
          <span className="font-mono text-stone-400 lowercase">{note.slug}</span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold text-stone-900 tracking-tight leading-tight">
          {note.title}
        </h1>
      </div>

      {/* Main Content Area: Article + Right-side Sticky TOC on xl screens */}
      <div className="flex items-start gap-8">
        <article
          ref={articleRef}
          className="flex-1 min-w-0 bg-white border border-stone-200 rounded-3xl p-6 sm:p-12 shadow-xs transition-all"
        >
          <MarkdownRenderer content={note.content} fontSize={fontSize} />
        </article>

        {/* Desktop Sticky Table of Contents (visible on xl screens) */}
        {toc.length > 0 && (
          <aside className="hidden xl:block w-72 shrink-0 sticky top-28 self-start">
            <NoteSidebarToc toc={toc} activeId={activeHeadingId} />
          </aside>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="flex items-center justify-between pt-6 border-t border-stone-200">
        {prev ? (
          <Link
            href={`/${courseSlug}/notes/${encodeURIComponent(prev.slug)}`}
            className="group flex items-center gap-3 p-3 rounded-2xl hover:bg-stone-100 transition max-w-[45%]"
          >
            <div className="w-9 h-9 rounded-xl bg-white border border-stone-200 flex items-center justify-center shrink-0 group-hover:border-indigo-400">
              <ChevronLeft className="w-4 h-4 text-stone-600" />
            </div>
            <div className="text-left">
              <div className="text-[11px] uppercase font-semibold text-stone-400">Previous</div>
              <div className="text-xs sm:text-sm font-bold text-stone-800 line-clamp-1 group-hover:text-indigo-800">
                {prev.title}
              </div>
            </div>
          </Link>
        ) : (
          <div />
        )}

        {next ? (
          <Link
            href={`/${courseSlug}/notes/${encodeURIComponent(next.slug)}`}
            className="group flex items-center gap-3 p-3 rounded-2xl hover:bg-stone-100 transition max-w-[45%] text-right ml-auto"
          >
            <div className="text-right">
              <div className="text-[11px] uppercase font-semibold text-stone-400">Next</div>
              <div className="text-xs sm:text-sm font-bold text-stone-800 line-clamp-1 group-hover:text-indigo-800">
                {next.title}
              </div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-white border border-stone-200 flex items-center justify-center shrink-0 group-hover:border-indigo-400">
              <ChevronRight className="w-4 h-4 text-stone-600" />
            </div>
          </Link>
        ) : (
          <div />
        )}
      </div>

      {/* Mobile/Tablet Table of Contents Drawer */}
      <NoteTocDrawer
        isOpen={isTocDrawerOpen}
        onClose={() => setIsTocDrawerOpen(false)}
        toc={toc}
        activeId={activeHeadingId}
      />

      {/* Highlights / Saved Quotes Slide-over Drawer */}
      {isHighlightsDrawerOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex justify-end bg-stone-950/40 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setIsHighlightsDrawerOpen(false)}
        >
          <div
            className="w-full max-w-sm sm:max-w-md bg-[#faf9f5] border-l border-stone-200 h-full p-6 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-stone-200 mb-4">
              <div className="flex items-center gap-2">
                <Highlighter className="w-5 h-5 text-amber-700" />
                <h3 className="text-base font-bold text-stone-900">Saved Quotes & Highlights</h3>
                <span className="text-xs text-stone-500 font-mono">({highlights.length})</span>
              </div>

              <button
                type="button"
                onClick={() => setIsHighlightsDrawerOpen(false)}
                className="p-1.5 rounded-xl hover:bg-stone-200 text-stone-500 hover:text-stone-900 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
              {highlights.length === 0 ? (
                <p className="text-xs text-stone-500 italic p-4 text-center">
                  Select any text in the note to highlight and save quotes here.
                </p>
              ) : (
                highlights.map((h) => (
                  <div
                    key={h.id}
                    className="p-4 rounded-2xl bg-white border border-stone-200/90 shadow-2xs space-y-2.5"
                  >
                    <p className="text-xs sm:text-sm text-stone-800 italic leading-relaxed border-l-2 border-amber-500 pl-3">
                      &ldquo;{h.text}&rdquo;
                    </p>
                    <div className="flex items-center justify-between pt-1 text-[11px] text-stone-400">
                      <span>{new Date(h.createdAt).toLocaleDateString()}</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => copyHighlight(h.text, h.id)}
                          className="hover:text-stone-800 transition flex items-center gap-1"
                          title="Copy to clipboard"
                        >
                          {copiedId === h.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                          <span>{copiedId === h.id ? 'Copied' : 'Copy'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteHighlight(h.id)}
                          className="hover:text-red-600 transition"
                          title="Delete highlight"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

