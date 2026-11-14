import { NextRequest, NextResponse } from 'next/server';
import { searchContent } from '@/lib/search';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const course = searchParams.get('course') || null;
    const includePrivate = searchParams.get('private') === 'true';
    const limit = parseInt(searchParams.get('limit') || '40', 10);

    if (!query.trim()) {
      return NextResponse.json({
        query: '',
        course,
        results: [],
        totalMatches: 0,
      });
    }

    const { results, totalMatches } = searchContent({
      query,
      courseSlug: course,
      includePrivate,
      limit,
    });

    return NextResponse.json({
      query,
      course,
      results,
      totalMatches,
    });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Failed to execute search' },
      { status: 500 }
    );
  }
}

