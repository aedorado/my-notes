'use client';

import React, { useState, useEffect } from 'react';
import { createSlugger } from '@/components/MarkdownRenderer';
import { ListTree, X, ChevronRight } from 'lucide-react';

export interface TocItem {
  id: string;
  title: string;
  level: 2 | 3;
}

/**
 * Extracts h2 and h3 headings in exact document order using the same slugger logic
 * as MarkdownRenderer to ensure IDs match 100%.
 */
export function extractNoteToc(content: string): TocItem[] {
  const getUniqueId = createSlugger();
  const lines = content.split('\n');
  const items: TocItem[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('# ')) {
      getUniqueId(trimmed.slice(2));
    } else if (trimmed.startsWith('## ')) {
      const text = trimmed.slice(3);
      const cleanTitle = text.replace(/[*_`]/g, '').trim();
      const id = getUniqueId(text);
      if (cleanTitle) {
        items.push({ id, title: cleanTitle, level: 2 });
      }
    } else if (trimmed.startsWith('### ')) {
      const text = trimmed.slice(4);
      const cleanTitle = text.replace(/[*_`]/g, '').trim();
      const id = getUniqueId(text);
      if (cleanTitle) {
        items.push({ id, title: cleanTitle, level: 3 });
      }
    } else if (trimmed.startsWith('#### ')) {
      getUniqueId(trimmed.slice(5));
    }
  }

  return items;
}

/**
 * Scrollspy hook to track the active heading in the viewport
 */
export function useScrollspy(headingIds: string[]): string {
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    if (headingIds.length === 0) return;

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 140; // offset for sticky navbar + reading bar

      // Find the heading that is closest above the current scroll position
      let current = headingIds[0];
      for (const id of headingIds) {
        const el = document.getElementById(id);
        if (el) {
          const top = el.offsetTop;
          if (top <= scrollPosition) {
            current = id;
          } else {
            break;
          }
        }
      }
      setActiveId(current || '');
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [headingIds]);

  return activeId;
}

interface NoteSidebarTocProps {
  toc: TocItem[];
  activeId: string;
}

export function NoteSidebarToc({ toc, activeId }: NoteSidebarTocProps) {
  if (toc.length === 0) return null;

  const scrollToHeading = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Update hash without jumping
      history.replaceState(null, '', `#${id}`);
    }
  };

  return (
    <nav
      aria-label="Table of contents"
      className="bg-white/95 backdrop-blur-sm border border-stone-200/90 rounded-3xl p-5 shadow-xs max-h-[calc(100vh-8.5rem)] flex flex-col"
    >
      <div className="flex items-center gap-2 pb-3 mb-2 border-b border-stone-100 text-stone-900 font-bold text-xs uppercase tracking-wider">
        <ListTree className="w-4 h-4 text-amber-700" />
        <span>On This Page</span>
        <span className="ml-auto text-[10px] text-stone-400 font-mono font-medium">
          {toc.length}
        </span>
      </div>

      <div className="overflow-y-auto pr-1 space-y-0.5 custom-scrollbar text-xs">
        {toc.map((item) => {
          const isActive = activeId === item.id;
          return (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={(e) => scrollToHeading(item.id, e)}
              className={`group flex items-start gap-1.5 py-1.5 px-2 rounded-xl transition-all leading-snug ${
                item.level === 3 ? 'pl-4 text-[11px]' : 'font-medium'
              } ${
                isActive
                  ? 'bg-amber-50 text-amber-900 font-bold border-l-2 border-amber-600 pl-2.5'
                  : 'text-stone-600 hover:text-stone-950 hover:bg-stone-50'
              }`}
              title={item.title}
            >
              <span className="line-clamp-2">{item.title}</span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}

interface NoteTocDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  toc: TocItem[];
  activeId: string;
}

export function NoteTocDrawer({ isOpen, onClose, toc, activeId }: NoteTocDrawerProps) {
  if (!isOpen) return null;

  const scrollToHeading = (id: string) => {
    onClose();
    const el = document.getElementById(id);
    if (el) {
      setTimeout(() => {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        history.replaceState(null, '', `#${id}`);
      }, 50);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="toc-drawer-title"
      className="fixed inset-0 z-50 flex justify-end bg-stone-950/40 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm sm:max-w-md bg-[#faf9f5] border-l border-stone-200 h-full p-6 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-stone-200 mb-4">
          <div className="flex items-center gap-2">
            <ListTree className="w-5 h-5 text-amber-700" />
            <h3 id="toc-drawer-title" className="text-base font-bold text-stone-900">
              Table of Contents
            </h3>
            <span className="text-xs text-stone-500 font-mono">({toc.length})</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-stone-200/70 text-stone-500 hover:text-stone-900 transition"
            aria-label="Close outline"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
          {toc.map((item) => {
            const isActive = activeId === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => scrollToHeading(item.id)}
                className={`w-full text-left flex items-start gap-2 p-2.5 rounded-xl transition text-xs leading-relaxed ${
                  item.level === 3 ? 'pl-6 text-[11px]' : 'font-semibold'
                } ${
                  isActive
                    ? 'bg-amber-100/80 text-amber-950 font-bold border-l-3 border-amber-600'
                    : 'text-stone-700 hover:text-stone-950 hover:bg-stone-100'
                }`}
              >
                <ChevronRight className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${isActive ? 'text-amber-700' : 'text-stone-400'}`} />
                <span className="line-clamp-2">{item.title}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

