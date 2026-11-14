'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSearch } from '@/context/SearchContext';
import { useAdmin } from '@/context/AdminContext';
import { SearchResultItem } from '@/lib/search';
import {
  Search,
  X,
  BookOpen,
  FileText,
  Presentation,
  Lock,
  ArrowRight,
  Sparkles,
  Command,
  CornerDownLeft,
} from 'lucide-react';

const COURSES_LIST = [
  { slug: 'hastarekha', title: 'Hastarekha', icon: '✋', color: '#a37f1a' },
  { slug: 'pr-23', title: 'PR-23', icon: '🪐', color: '#b45309' },
  { slug: 'apa', title: 'APA OL27', icon: '✨', color: '#4f46e5' },
  { slug: 'community-64', title: 'Community 64', icon: '🏛️', color: '#0d9488' },
];

export default function SearchModal() {
  const { isOpen, closeSearch, courseScope, setCourseScope } = useSearch();
  const { isAdmin } = useAdmin();
  const router = useRouter();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [totalMatches, setTotalMatches] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const resultsContainerRef = useRef<HTMLDivElement>(null);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
    } else {
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Debounced search fetch
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setTotalMatches(0);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(async () => {
      try {
        const params = new URLSearchParams({
          q: query.trim(),
          private: isAdmin ? 'true' : 'false',
        });
        if (courseScope) {
          params.set('course', courseScope);
        }

        const res = await fetch(`/api/search?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.results || []);
          setTotalMatches(data.totalMatches || 0);
          setSelectedIndex(0);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsLoading(false);
      }
    }, 120);

    return () => clearTimeout(timer);
  }, [query, courseScope, isAdmin]);

  // Navigate to selected result
  const handleSelect = useCallback((item: SearchResultItem) => {
    closeSearch();
    router.push(item.url);
  }, [closeSearch, router]);

  // Keyboard navigation within list
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selectedIndex]) {
        handleSelect(results[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      closeSearch();
    }
  };

  // Auto-scroll selected item into view
  useEffect(() => {
    if (resultsContainerRef.current) {
      const selectedEl = resultsContainerRef.current.querySelector(`[data-index="${selectedIndex}"]`);
      if (selectedEl) {
        selectedEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  const getTypeIcon = (type: SearchResultItem['type']) => {
    switch (type) {
      case 'chapter':
        return <BookOpen className="w-3.5 h-3.5 text-amber-700" />;
      case 'note':
        return <FileText className="w-3.5 h-3.5 text-indigo-700" />;
      case 'slide':
        return <Presentation className="w-3.5 h-3.5 text-amber-700" />;
      case 'transcript':
        return <Lock className="w-3.5 h-3.5 text-stone-500" />;
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-start justify-center pt-12 sm:pt-20 px-3 sm:px-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={closeSearch}
    >
      <div
        className="w-full max-w-2xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="relative border-b border-stone-200 px-4 py-3.5 flex items-center gap-3 bg-stone-50/50">
          <Search className="w-5 h-5 text-stone-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={
              courseScope
                ? `Search in ${COURSES_LIST.find(c => c.slug === courseScope)?.title || courseScope}...`
                : 'Search notes, chapters, topics across all courses...'
            }
            className="w-full bg-transparent text-stone-900 placeholder-stone-400 text-sm sm:text-base outline-none font-medium"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition"
              title="Clear input"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-mono text-stone-400 bg-white border border-stone-200 rounded-lg px-2 py-0.5 shadow-2xs">
            ESC
          </span>
        </div>

        {/* Scope Pill Selectors & Fuzzy Indicator */}
        <div className="px-4 py-2 border-b border-stone-100 bg-white flex items-center justify-between gap-2 overflow-x-auto text-xs">
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mr-1">
              Scope:
            </span>
            <button
              type="button"
              onClick={() => setCourseScope(null)}
              className={`px-2.5 py-1 rounded-lg font-semibold text-xs transition ${
                courseScope === null
                  ? 'bg-stone-900 text-white shadow-2xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              All Courses
            </button>
            {COURSES_LIST.map(c => (
              <button
                key={c.slug}
                type="button"
                onClick={() => setCourseScope(c.slug)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold text-xs transition ${
                  courseScope === c.slug
                    ? 'bg-stone-900 text-white shadow-2xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                <span>{c.icon}</span>
                <span>{c.title}</span>
              </button>
            ))}
          </div>

          <div className="hidden sm:flex items-center gap-1 text-[11px] text-amber-700 bg-amber-50 border border-amber-200/80 rounded-md px-1.5 py-0.5 shrink-0 font-medium" title="Typo-tolerant diacritics & fuzzy matching">
            <Sparkles className="w-3 h-3 text-amber-600" />
            <span>Fuzzy (±2 chars)</span>
          </div>
        </div>

        {/* Results Container */}
        <div
          ref={resultsContainerRef}
          className="flex-1 overflow-y-auto p-2 sm:p-3 divide-y divide-stone-100"
        >
          {isLoading && (
            <div className="p-8 text-center text-xs text-stone-400 flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
              <span>Searching content...</span>
            </div>
          )}

          {!isLoading && query.trim() && results.length === 0 && (
            <div className="p-10 text-center space-y-2">
              <p className="text-sm font-semibold text-stone-700">No matching notes or chapters</p>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                No matches found for <span className="font-semibold text-stone-800">&quot;{query}&quot;</span> in{' '}
                {courseScope ? COURSES_LIST.find(c => c.slug === courseScope)?.title : 'any course'}.
                Try a different keyword or switch scope to <button type="button" onClick={() => setCourseScope(null)} className="text-amber-700 font-semibold underline">All Courses</button>.
              </p>
            </div>
          )}

          {!isLoading && !query.trim() && (
            <div className="p-8 text-center space-y-3 text-stone-500">
              <div className="inline-flex p-3 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200/60 mb-1">
                <Command className="w-5 h-5" />
              </div>
              <p className="text-xs sm:text-sm font-medium text-stone-700">
                Type a term to search across all lecture notes, chapters &amp; slides
              </p>
              <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1 text-[11px]">
                <span className="text-stone-400">Popular:</span>
                {['kendriya', 'pada', 'trine', 'marriage', 'ring of solomon', 'dasha'].map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setQuery(tag)}
                    className="px-2 py-0.5 rounded-md bg-stone-100 hover:bg-amber-100 text-stone-600 hover:text-amber-900 transition"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {!isLoading && results.length > 0 && (
            <div className="space-y-1">
              {results.map((item, idx) => {
                const isSelected = idx === selectedIndex;
                return (
                  <div
                    key={item.id}
                    data-index={idx}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`p-3 rounded-xl cursor-pointer transition flex flex-col gap-1.5 ${
                      isSelected
                        ? 'bg-amber-500/10 border border-amber-300/80 shadow-2xs'
                        : 'hover:bg-stone-100/80 border border-transparent'
                    }`}
                  >
                    {/* Top Row: Course + Type + Matches */}
                    <div className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="font-bold px-2 py-0.5 rounded-md text-white shadow-2xs"
                          style={{ backgroundColor: item.courseColor }}
                        >
                          {item.courseTitle}
                        </span>
                        <span className="flex items-center gap-1 font-semibold text-stone-600 bg-stone-100 px-2 py-0.5 rounded-md capitalize">
                          {getTypeIcon(item.type)}
                          <span>{item.type}</span>
                        </span>
                      </div>

                      <span className="text-stone-400 font-mono text-[11px]">
                        {item.matchCount} {item.matchCount === 1 ? 'hit' : 'hits'}
                      </span>
                    </div>

                    {/* Title */}
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-bold text-stone-900 text-sm leading-snug">
                        {item.title}
                      </h4>
                      {isSelected && (
                        <ArrowRight className="w-4 h-4 text-amber-700 shrink-0 hidden sm:block" />
                      )}
                    </div>

                    {/* Context Snippet */}
                    {item.snippets.length > 0 && (
                      <p
                        className="text-xs text-stone-600 line-clamp-2 leading-relaxed bg-white/70 p-1.5 rounded-lg border border-stone-150/70"
                        dangerouslySetInnerHTML={{ __html: item.snippets[0] }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-4 py-2.5 border-t border-stone-200 bg-stone-50 flex items-center justify-between text-xs text-stone-500">
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 font-mono text-[10px] bg-white border border-stone-200 rounded">↑↓</kbd>
              <span>navigate</span>
            </span>
            <span className="hidden sm:inline-flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 font-mono text-[10px] bg-white border border-stone-200 rounded flex items-center">
                <CornerDownLeft className="w-2.5 h-2.5" />
              </kbd>
              <span>select</span>
            </span>
            <span className="hidden sm:inline-flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 font-mono text-[10px] bg-white border border-stone-200 rounded">ESC</kbd>
              <span>close</span>
            </span>
          </div>

          <div>
            {totalMatches > 0 && (
              <span className="font-semibold text-stone-700">
                {totalMatches} {totalMatches === 1 ? 'result' : 'results'} found
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

