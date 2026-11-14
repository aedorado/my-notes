'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, RotateCw, Shuffle, Sparkles, BookOpen } from 'lucide-react';
import { FlashcardDeck as DeckType, FlashcardItem } from '@/lib/types';

interface FlashcardDeckProps {
  deck: DeckType;
}

export default function FlashcardDeck({ deck }: FlashcardDeckProps) {
  const [cards, setCards] = useState<FlashcardItem[]>(deck.cards);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const currentCard = cards[currentIdx];

  const handleFlip = () => setIsFlipped(!isFlipped);

  const handleNext = useCallback(() => {
    setIsFlipped(false);
    setCurrentIdx((prev) => (prev < cards.length - 1 ? prev + 1 : 0));
  }, [cards.length]);

  const handlePrev = useCallback(() => {
    setIsFlipped(false);
    setCurrentIdx((prev) => (prev > 0 ? prev - 1 : cards.length - 1));
  }, [cards.length]);

  const handleShuffle = () => {
    setIsFlipped(false);
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setCurrentIdx(0);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        setIsFlipped((f) => !f);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev]);

  if (!cards || cards.length === 0) {
    return (
      <div className="p-12 text-center bg-white border border-stone-200 rounded-2xl">
        <p className="text-stone-500">No flashcards available in this deck.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col items-center">
      {/* Top Controls */}
      <div className="w-full flex items-center justify-between mb-4 px-2">
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md">
            Card {currentIdx + 1} of {cards.length}
          </span>
          {currentCard.tag && (
            <span className="ml-2 text-xs font-semibold uppercase text-stone-500 bg-stone-100 px-2 py-0.5 rounded">
              {currentCard.tag}
            </span>
          )}
        </div>

        <button
          onClick={handleShuffle}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-600 hover:text-stone-900 bg-white border border-stone-200 rounded-lg hover:bg-stone-50 transition"
          title="Shuffle Deck"
        >
          <Shuffle className="w-3.5 h-3.5" />
          <span>Shuffle</span>
        </button>
      </div>

      {/* Flip Card Container */}
      <div
        onClick={handleFlip}
        role="button"
        tabIndex={0}
        className="w-full min-h-[340px] cursor-pointer rounded-3xl p-8 sm:p-12 transition-all duration-300 relative select-none flex flex-col justify-between border bg-white border-stone-200 hover:border-amber-400 hover:shadow-md"
      >
        {/* Card Header Badge */}
        <div className="flex items-center justify-between text-xs text-stone-400">
          <span className="uppercase font-semibold tracking-wider">
            {isFlipped ? 'Answer / Insight' : 'Prompt / Concept'}
          </span>
          <span className="flex items-center gap-1 text-stone-400">
            <RotateCw className="w-3.5 h-3.5" />
            <span>Click or Space to flip</span>
          </span>
        </div>

        {/* Card Content */}
        <div className="my-auto py-6 text-center">
          {!isFlipped ? (
            <div className="text-lg sm:text-2xl font-bold text-stone-900 leading-snug">
              {currentCard.front}
            </div>
          ) : (
            <div className="text-base sm:text-lg text-stone-800 leading-relaxed whitespace-pre-line text-left">
              {currentCard.back}
            </div>
          )}
        </div>

        {/* Card Footer Tip */}
        <div className="text-center">
          {currentCard.tip && (
            <div className="inline-block px-3 py-1 bg-amber-50/70 border border-amber-200/50 rounded-full text-xs text-amber-800">
              💡 {currentCard.tip}
            </div>
          )}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="w-full flex items-center justify-between mt-6">
        <button
          onClick={handlePrev}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-stone-200 text-stone-700 font-medium text-sm hover:bg-stone-50 active:bg-stone-100 transition shadow-2xs"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        <button
          onClick={handleFlip}
          className="px-5 py-2.5 rounded-xl bg-stone-100 text-stone-700 font-medium text-sm hover:bg-stone-200 transition"
        >
          {isFlipped ? 'Show Front' : 'Flip to Answer'}
        </button>

        <button
          onClick={handleNext}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-stone-900 text-white font-medium text-sm hover:bg-stone-800 active:bg-black transition shadow-2xs"
        >
          <span>Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

