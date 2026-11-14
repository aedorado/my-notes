import { NextResponse } from 'next/server';
import { getCourseChapters, getChapter, getChapterQuizQuestions } from '@/lib/content';
import { ALL_CHAPTERS, getChapterBySlug } from '@/data/bookStructure';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const slug = url.searchParams.get('slug');

    const chapters = getCourseChapters('hastarekha');

    // If no slug, return directory list index
    if (!slug) {
      return NextResponse.json({
        totalChapters: chapters.length,
        compiledCount: chapters.length,
        chapters: chapters.map(ch => {
          const bs = getChapterBySlug(ch.slug) || getChapterBySlug(ch.id);
          return {
            id: ch.id,
            slug: ch.slug,
            code: bs?.code || '',
            title: bs?.title || ch.title,
            chapterNumber: bs?.chapterNumber || ch.chapterNumber,
            readTime: bs?.readTime || ch.readTime,
            summary: bs?.essence || ch.summary,
            hasCompiledChapter: true,
          };
        }),
      });
    }

    // Specific chapter requested
    const data = getChapter('hastarekha', slug);
    if (!data) {
      return NextResponse.json({ error: 'Chapter not found' }, { status: 404 });
    }

    const { chapter, prev, next } = data;
    const bs = getChapterBySlug(chapter.slug) || getChapterBySlug(chapter.id) || getChapterBySlug(slug);
    const prevBs = prev ? (getChapterBySlug(prev.slug) || getChapterBySlug(prev.id)) : null;
    const nextBs = next ? (getChapterBySlug(next.slug) || getChapterBySlug(next.id)) : null;

    const quizQuestions = getChapterQuizQuestions('hastarekha', bs?.sourceNotes || []);

    return NextResponse.json({
      meta: {
        id: bs?.id || chapter.id,
        slug: chapter.slug,
        code: bs?.code || (chapter.chapterNumber ? `CH${chapter.chapterNumber}` : ''),
        partId: bs?.partId || '',
        partTitle: bs?.partTitle || '',
        title: bs?.title || chapter.title,
        subtitleSanskrit: bs?.subtitleSanskrit || '',
        chapterNumber: bs?.chapterNumber || chapter.chapterNumber,
        readTime: bs?.readTime || chapter.readTime,
        essence: bs?.essence || chapter.summary,
        sourceNotes: bs?.sourceNotes || [],
        hasCompiledChapter: true,
      },
      content: chapter.content,
      isCompiled: true,
      quizQuestions,
      compiledChapterIds: ALL_CHAPTERS.map(c => c.id),
      adjacent: {
        prev: prev ? {
          id: prevBs?.id || prev.id,
          slug: prev.slug,
          code: prevBs?.code || '',
          title: prevBs?.title || prev.title,
        } : null,
        next: next ? {
          id: nextBs?.id || next.id,
          slug: next.slug,
          code: nextBs?.code || '',
          title: nextBs?.title || next.title,
        } : null,
      },
    });
  } catch (err) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
