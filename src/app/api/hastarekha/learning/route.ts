import { NextResponse } from 'next/server';
import { getCourseQuizzes, getQuizDeck, getCourseFlashcards, getFlashcardDeck } from '@/lib/content';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const deck = url.searchParams.get('deck') || url.searchParams.get('id');

    if (deck) {
      const quiz = getQuizDeck('hastarekha', deck);
      const flashcards = getFlashcardDeck('hastarekha', deck);

      if (!quiz && !flashcards) {
        return NextResponse.json({ error: 'Deck not found' }, { status: 404 });
      }

      return NextResponse.json({
        id: deck,
        lectureId: deck,
        title: quiz?.title || flashcards?.title || deck,
        summary: quiz?.summary || flashcards?.summary || '',
        flashcards: flashcards?.cards || [],
        quizzes: quiz?.questions || [],
      });
    }

    const quizzes = getCourseQuizzes('hastarekha');
    const flashcards = getCourseFlashcards('hastarekha');

    return NextResponse.json({
      totalQuizzes: quizzes.length,
      totalFlashcardDecks: flashcards.length,
      quizzes: quizzes.map(q => ({ id: q.id, slug: q.slug, title: q.title, count: q.questions.length })),
      flashcards: flashcards.map(f => ({ id: f.id, slug: f.slug, title: f.title, count: f.cards.length })),
    });
  } catch (err) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

