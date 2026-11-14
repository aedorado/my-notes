import type { Metadata } from 'next';
import './globals.css';
import { AdminProvider } from '@/context/AdminContext';
import { SearchProvider } from '@/context/SearchContext';
import { ReadingProgressProvider } from '@/context/ReadingProgressContext';
import AdminModal from '@/components/AdminModal';
import SearchModal from '@/components/search/SearchModal';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'My Notes — Multi-Course Study Platform',
  description: 'A multi-course knowledge base: chapters, lecture notes, slide decks, interactive quizzes, flashcards, and transcripts.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-[#faf9f5] text-stone-900 min-h-screen flex flex-col">
        <AdminProvider>
          <ReadingProgressProvider>
            <SearchProvider>
              <Navbar />
              <main className="flex-1 flex flex-col w-full">
                {children}
              </main>
              <Footer />
              <AdminModal />
              <SearchModal />
            </SearchProvider>
          </ReadingProgressProvider>
        </AdminProvider>
      </body>
    </html>
  );
}

