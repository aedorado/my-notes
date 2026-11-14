'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Lock, Unlock, Clock, Search } from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';
import { useSearch } from '@/context/SearchContext';

export default function Navbar() {
  const pathname = usePathname();
  const { isAdmin, remainingSeconds, openLoginModal, logout } = useAdmin();
  const { openSearch } = useSearch();

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  const pathParts = pathname.split('/').filter(Boolean);
  const currentCourseSlug = pathParts[0] && !['api'].includes(pathParts[0]) ? pathParts[0] : null;

  // Let the chapter reader provide its own immersive sticky top bar
  if (pathname.includes('/chapters/')) {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-stone-200/80 transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Left: Brand & Breadcrumbs */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold text-sm shadow-xs group-hover:bg-amber-700 transition">
              MN
            </div>
            <span className="font-bold text-stone-900 tracking-tight text-base sm:text-lg">
              my-notes
            </span>
          </Link>

          {currentCourseSlug && (
            <>
              <span className="text-stone-300 font-light">/</span>
              <Link
                href={`/${currentCourseSlug}`}
                className="text-xs sm:text-sm font-semibold text-stone-700 hover:text-amber-700 uppercase tracking-wider transition truncate max-w-[150px] sm:max-w-[240px]"
              >
                {currentCourseSlug}
              </Link>
            </>
          )}

          {pathParts.length > 1 && (
            <>
              <span className="text-stone-300 font-light hidden sm:inline">/</span>
              <span className="text-xs text-stone-500 font-medium capitalize hidden sm:inline">
                {pathParts[1]}
              </span>
            </>
          )}
        </div>

        {/* Right: Quick actions, Search & Admin */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => openSearch(currentCourseSlug)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-stone-200/90 bg-stone-50/80 hover:bg-stone-100 hover:border-stone-300 text-stone-500 hover:text-stone-800 text-xs transition shadow-2xs group"
            title="Search notes, chapters, topics (Cmd+K)"
          >
            <Search className="w-3.5 h-3.5 text-stone-400 group-hover:text-amber-700 transition" />
            <span className="hidden md:inline font-medium text-stone-600">
              {currentCourseSlug ? `Search ${currentCourseSlug.toUpperCase()}` : 'Search notes'}
            </span>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 text-[10px] font-mono text-stone-400 bg-white border border-stone-200 rounded px-1.5 py-0.2 shadow-2xs">
              ⌘K
            </kbd>
          </button>

          {isAdmin ? (
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200/80 rounded-xl px-3 py-1.5 shadow-2xs">
              <Unlock className="w-3.5 h-3.5 text-amber-700" />
              <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-900">
                <span className="hidden sm:inline">Admin Mode</span>
                <span className="text-amber-700 font-mono text-[11px] flex items-center gap-1">
                  <Clock className="w-3 h-3 inline" />
                  {formatTimer(remainingSeconds)}
                </span>
              </div>
              <button
                type="button"
                onClick={logout}
                className="text-[11px] text-stone-500 hover:text-rose-600 ml-1 underline transition"
                title="Log out of Admin Mode"
              >
                Lock
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={openLoginModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 hover:border-stone-300 bg-stone-50 hover:bg-stone-100 text-stone-700 text-xs font-medium transition"
              title="Admin Mode Authorization"
            >
              <Lock className="w-3.5 h-3.5 text-stone-500" />
              <span className="hidden sm:inline">Admin</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

