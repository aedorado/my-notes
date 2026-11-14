import { NextResponse } from 'next/server';
import { getCourseNotes, getNote } from '@/lib/content';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const slug = url.searchParams.get('slug') || url.searchParams.get('id');
    const requestedLang = (url.searchParams.get('lang') || 'en').toLowerCase();

    if (slug) {
      const data = getNote('hastarekha', slug);
      if (!data) {
        return NextResponse.json({ error: 'Note not found' }, { status: 404 });
      }
      return NextResponse.json({
        id: data.note.id,
        fileName: `${data.note.slug}.md`,
        title: data.note.title,
        content: data.note.content,
        language: data.note.language || 'en',
      });
    }

    const notes = getCourseNotes('hastarekha');
    const formatted = notes.map(n => ({
      id: `${n.slug}.md`,
      fileName: `${n.slug}.md`,
      title: n.title,
      content: n.content,
      language: n.language || 'en',
    }));

    return NextResponse.json(formatted, {
      headers: {
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
      },
    });
  } catch (err) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

