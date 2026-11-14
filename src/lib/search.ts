import { getAllCourses, getCourseBySlug } from './courses';
import {
  getCourseChapters,
  getCourseNotes,
  getCourseTranscripts,
  getCourseSlides,
} from './content';

export interface SearchResultItem {
  id: string;
  slug: string;
  title: string;
  url: string;
  courseSlug: string;
  courseTitle: string;
  courseColor: string;
  courseIcon: string;
  type: 'chapter' | 'note' | 'transcript' | 'slide';
  matchCount: number;
  score: number;
  snippets: string[];
  private?: boolean;
}

export interface SearchOptions {
  query: string;
  courseSlug?: string | null;
  includePrivate?: boolean;
  limit?: number;
}

// Normalize text: lowercase, strip Sanskrit / Unicode diacritics
export function normalizeDiacritics(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

// Levenshtein distance for fuzzy matching
export function levenshteinDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = i;
    for (let j = 1; j <= b.length; j++) {
      const val = a[i - 1] === b[j - 1] ? row[j - 1] : Math.min(row[j - 1], row[j], prev) + 1;
      row[j - 1] = prev;
      prev = val;
    }
    row[b.length] = prev;
  }
  return row[b.length];
}

// Fuzzy word test allowing 1 or 2 characters difference
export function isWordFuzzyMatch(word: string, queryToken: string, maxDistance: number = 2): boolean {
  if (word === queryToken) return true;
  if (word.includes(queryToken)) return true;

  // Short tokens (<=3 chars): exact substring only
  if (queryToken.length <= 3) {
    return word.includes(queryToken);
  }

  // 4-5 chars: max 1 edit distance
  const allowed = queryToken.length <= 5 ? Math.min(maxDistance, 1) : maxDistance;
  if (Math.abs(word.length - queryToken.length) > allowed) return false;

  return levenshteinDistance(word, queryToken) <= allowed;
}

// Helper to strip markdown formatting for cleaner snippets
function stripMarkdown(text: string): string {
  return text
    .replace(/^[#>-]+\s*/gm, '') // headings, blockquotes, bullets
    .replace(/\[!([a-zA-Z]+)\](-|\+)?/g, '') // obsidian callouts
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // links
    .replace(/[*_`~]/g, '') // bold/italic/code
    .replace(/\|/g, ' ') // table pipes
    .replace(/\s+/g, ' ')
    .trim();
}

// Extract context snippets around matches with <mark> tags
function extractSnippets(rawContent: string, queryTokens: string[], maxSnippets: number = 2): string[] {
  const lines = rawContent.split('\n');
  const snippets: string[] = [];
  const seenSnippetTexts = new Set<string>();

  for (const rawLine of lines) {
    const cleanLine = stripMarkdown(rawLine);
    if (!cleanLine || cleanLine.length < 10) continue;

    const normLine = normalizeDiacritics(cleanLine);
    const lineWords = normLine.split(/[^a-z0-9]+/);

    // Check if any query token matches in this line
    let matchedInLine = false;
    for (const q of queryTokens) {
      if (lineWords.some(w => isWordFuzzyMatch(w, q, 2))) {
        matchedInLine = true;
        break;
      }
    }

    if (matchedInLine) {
      // Find the position of the first matching word in cleanLine
      let bestPos = -1;
      let matchLen = queryTokens[0].length;

      for (const q of queryTokens) {
        const idx = normLine.indexOf(q);
        if (idx !== -1) {
          bestPos = idx;
          matchLen = q.length;
          break;
        }
      }

      if (bestPos === -1) {
        // Fallback: word-based match position
        for (const word of cleanLine.split(/\s+/)) {
          const normW = normalizeDiacritics(word);
          if (queryTokens.some(q => isWordFuzzyMatch(normW, q, 2))) {
            bestPos = cleanLine.indexOf(word);
            matchLen = word.length;
            break;
          }
        }
      }

      if (bestPos === -1) bestPos = 0;

      // Extract window around match (~130 chars)
      const windowStart = Math.max(0, bestPos - 50);
      const windowEnd = Math.min(cleanLine.length, bestPos + matchLen + 80);
      let excerpt = cleanLine.slice(windowStart, windowEnd);

      if (windowStart > 0) excerpt = '...' + excerpt;
      if (windowEnd < cleanLine.length) excerpt = excerpt + '...';

      // Highlight matched tokens
      let highlighted = excerpt;
      for (const q of queryTokens) {
        // Build regex that matches the query token or close word
        const regex = new RegExp(`(\\b[\\w]{0,2}${q}[\\w]{0,2}\\b|${q})`, 'gi');
        highlighted = highlighted.replace(regex, '<mark class="match-highlight">$1</mark>');
      }

      if (!seenSnippetTexts.has(excerpt)) {
        seenSnippetTexts.add(excerpt);
        snippets.push(highlighted);
        if (snippets.length >= maxSnippets) break;
      }
    }
  }

  return snippets;
}

export function searchContent({
  query,
  courseSlug,
  includePrivate = false,
  limit = 40,
}: SearchOptions): {
  results: SearchResultItem[];
  totalMatches: number;
} {
  const cleanQ = query.trim();
  if (!cleanQ) {
    return { results: [], totalMatches: 0 };
  }

  const normQuery = normalizeDiacritics(cleanQ);
  const queryTokens = normQuery.split(/\s+/).filter(t => t.length > 0);

  const coursesToSearch = courseSlug
    ? [getCourseBySlug(courseSlug)].filter(Boolean)
    : getAllCourses();

  const results: SearchResultItem[] = [];

  for (const course of coursesToSearch) {
    if (!course) continue;

    // 1. Chapters
    const chapters = getCourseChapters(course.slug);
    for (const ch of chapters) {
      if (ch.private && !includePrivate) continue;

      const normTitle = normalizeDiacritics(ch.title);
      const titleWords = normTitle.split(/[^a-z0-9]+/);
      const normContent = normalizeDiacritics(ch.content);
      const contentWords = normContent.split(/[^a-z0-9]+/);

      let score = 0;
      let matchCount = 0;

      for (const q of queryTokens) {
        // Title matches
        if (normTitle.includes(q)) {
          score += 60;
          matchCount += 3;
        } else if (titleWords.some(w => isWordFuzzyMatch(w, q, 2))) {
          score += 35;
          matchCount += 2;
        }

        // Content matches
        const exactOccurrences = (normContent.match(new RegExp(q, 'g')) || []).length;
        if (exactOccurrences > 0) {
          score += Math.min(exactOccurrences * 5, 50);
          matchCount += exactOccurrences;
        } else {
          const fuzzyMatches = contentWords.filter(w => isWordFuzzyMatch(w, q, 2)).length;
          if (fuzzyMatches > 0) {
            score += Math.min(fuzzyMatches * 3, 30);
            matchCount += fuzzyMatches;
          }
        }
      }

      if (matchCount > 0) {
        const snippets = extractSnippets(ch.content, queryTokens);
        results.push({
          id: `ch-${course.slug}-${ch.slug}`,
          slug: ch.slug,
          title: ch.title,
          url: `/${course.slug}/chapters/${ch.slug}`,
          courseSlug: course.slug,
          courseTitle: course.title,
          courseColor: course.color || '#a37f1a',
          courseIcon: course.icon || '📖',
          type: 'chapter',
          matchCount,
          score,
          snippets,
          private: ch.private,
        });
      }
    }

    // 2. Notes
    const notes = getCourseNotes(course.slug);
    for (const note of notes) {
      if (note.private && !includePrivate) continue;

      const normTitle = normalizeDiacritics(note.title);
      const titleWords = normTitle.split(/[^a-z0-9]+/);
      const normContent = normalizeDiacritics(note.content);
      const contentWords = normContent.split(/[^a-z0-9]+/);

      let score = 0;
      let matchCount = 0;

      for (const q of queryTokens) {
        if (normTitle.includes(q)) {
          score += 60;
          matchCount += 3;
        } else if (titleWords.some(w => isWordFuzzyMatch(w, q, 2))) {
          score += 35;
          matchCount += 2;
        }

        const exactOccurrences = (normContent.match(new RegExp(q, 'g')) || []).length;
        if (exactOccurrences > 0) {
          score += Math.min(exactOccurrences * 5, 50);
          matchCount += exactOccurrences;
        } else {
          const fuzzyMatches = contentWords.filter(w => isWordFuzzyMatch(w, q, 2)).length;
          if (fuzzyMatches > 0) {
            score += Math.min(fuzzyMatches * 3, 30);
            matchCount += fuzzyMatches;
          }
        }
      }

      if (matchCount > 0) {
        const snippets = extractSnippets(note.content, queryTokens);
        results.push({
          id: `note-${course.slug}-${note.slug}`,
          slug: note.slug,
          title: note.title,
          url: `/${course.slug}/notes/${encodeURIComponent(note.slug)}`,
          courseSlug: course.slug,
          courseTitle: course.title,
          courseColor: course.color || '#4f46e5',
          courseIcon: course.icon || '📝',
          type: 'note',
          matchCount,
          score,
          snippets,
          private: note.private,
        });
      }
    }

    // 3. Slides
    const slides = getCourseSlides(course.slug);
    for (const deck of slides) {
      const normTitle = normalizeDiacritics(deck.title);
      const titleWords = normTitle.split(/[^a-z0-9]+/);
      const allSlideText = deck.slides.map(s => `${s.title} ${s.content}`).join('\n');
      const normContent = normalizeDiacritics(allSlideText);
      const contentWords = normContent.split(/[^a-z0-9]+/);

      let score = 0;
      let matchCount = 0;

      for (const q of queryTokens) {
        if (normTitle.includes(q)) {
          score += 60;
          matchCount += 3;
        } else if (titleWords.some(w => isWordFuzzyMatch(w, q, 2))) {
          score += 35;
          matchCount += 2;
        }

        const exactOccurrences = (normContent.match(new RegExp(q, 'g')) || []).length;
        if (exactOccurrences > 0) {
          score += Math.min(exactOccurrences * 5, 50);
          matchCount += exactOccurrences;
        } else {
          const fuzzyMatches = contentWords.filter(w => isWordFuzzyMatch(w, q, 2)).length;
          if (fuzzyMatches > 0) {
            score += Math.min(fuzzyMatches * 3, 30);
            matchCount += fuzzyMatches;
          }
        }
      }

      if (matchCount > 0) {
        const snippets = extractSnippets(allSlideText, queryTokens);
        results.push({
          id: `slide-${course.slug}-${deck.slug}`,
          slug: deck.slug,
          title: deck.title,
          url: `/${course.slug}/slides/${deck.slug}`,
          courseSlug: course.slug,
          courseTitle: course.title,
          courseColor: course.color || '#d97706',
          courseIcon: course.icon || '📽️',
          type: 'slide',
          matchCount,
          score,
          snippets,
        });
      }
    }

    // 4. Transcripts (admin only)
    if (includePrivate) {
      const transcripts = getCourseTranscripts(course.slug);
      for (const tr of transcripts) {
        const normTitle = normalizeDiacritics(tr.title);
        const titleWords = normTitle.split(/[^a-z0-9]+/);
        const normContent = normalizeDiacritics(tr.content);
        const contentWords = normContent.split(/[^a-z0-9]+/);

        let score = 0;
        let matchCount = 0;

        for (const q of queryTokens) {
          if (normTitle.includes(q)) {
            score += 50;
            matchCount += 2;
          } else if (titleWords.some(w => isWordFuzzyMatch(w, q, 2))) {
            score += 25;
            matchCount += 1;
          }

          const exactOccurrences = (normContent.match(new RegExp(q, 'g')) || []).length;
          if (exactOccurrences > 0) {
            score += Math.min(exactOccurrences * 4, 40);
            matchCount += exactOccurrences;
          } else {
            const fuzzyMatches = contentWords.filter(w => isWordFuzzyMatch(w, q, 2)).length;
            if (fuzzyMatches > 0) {
              score += Math.min(fuzzyMatches * 2, 25);
              matchCount += fuzzyMatches;
            }
          }
        }

        if (matchCount > 0) {
          const snippets = extractSnippets(tr.content, queryTokens);
          results.push({
            id: `tr-${course.slug}-${tr.slug}`,
            slug: tr.slug,
            title: tr.title,
            url: `/${course.slug}/transcripts/${encodeURIComponent(tr.slug)}`,
            courseSlug: course.slug,
            courseTitle: course.title,
            courseColor: course.color || '#64748b',
            courseIcon: course.icon || '🔒',
            type: 'transcript',
            matchCount,
            score,
            snippets,
            private: true,
          });
        }
      }
    }
  }

  // Sort by relevance score descending, then matchCount descending
  results.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return b.matchCount - a.matchCount;
  });

  return {
    results: results.slice(0, limit),
    totalMatches: results.length,
  };
}

