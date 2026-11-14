'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowUp } from 'lucide-react';

export default function Footer() {
  const pathname = usePathname();

  // Hide in full-screen immersive chapter reader
  if (pathname.includes('/chapters/')) {
    return null;
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="mt-auto border-t border-stone-200/80 bg-white/60 text-stone-500 text-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 text-stone-600">
          <div className="w-5 h-5 rounded bg-amber-600 text-white flex items-center justify-center font-bold text-[10px]">
            MN
          </div>
          <span className="font-semibold text-stone-800">my-notes</span>
          <span className="text-stone-300">•</span>
          <span>Study Notes & Reference Library</span>
        </div>

        <div className="flex items-center gap-6 text-stone-500">
          <Link href="/" className="hover:text-stone-900 transition">
            Home
          </Link>
          <button
            type="button"
            onClick={scrollToTop}
            className="hover:text-stone-900 transition inline-flex items-center gap-1 cursor-pointer"
          >
            <span>Back to top</span>
            <ArrowUp className="w-3 h-3" />
          </button>
        </div>
      </div>
    </footer>
  );
}

