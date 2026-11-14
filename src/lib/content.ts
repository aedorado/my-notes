import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { ChapterItem, NoteItem, SlideDeck, SlideItem, QuizDeck, QuizQuestion, FlashcardDeck, TranscriptItem } from './types';
import { getChapterBySlug } from '@/data/bookStructure';

const CONTENT_DIR = path.join(process.cwd(), 'content');

export function cleanTitle(title: string): string {
  return title
    .replace(/^Hasta\s+S[aā]mudrik[aā]\s+Ś[aā]stra\s*(\(Palmistry\))?\s*[:\u2013\u2014\u2212\-\s]*/i, '')
    .replace(/^हस्त\s*सामुद्रिक\s*शास्त्र\s*(\(हस्तरेखा\))?\s*[:\u2013\u2014\u2212\-\s]*/i, '')
    .replace(/^Day\s*\d+\s*(?:Slide\s*Deck)?\s*[:\u2013\u2014\u2212\-\s]*/i, '')
    .replace(/^[:\u2013\u2014\u2212\-\s]+/, '')
    .trim() || title;
}

/**
 * Returns candidate directories for a given course and subfolder.
 * For 'hastarekha', it checks the actual hastarekha workspace repo first
 * so changes made in hastarekha are immediately live in my-notes without duplication!
 */
export function getCandidateDirs(
  courseSlug: string,
  sub: 'chapters' | 'notes' | 'transcripts' | 'slides' | 'quizzes' | 'flashcards'
): string[] {
  const localDir = path.join(CONTENT_DIR, courseSlug, sub);
  const dirs: string[] = [];

  if (courseSlug === 'hastarekha') {
    const envRepo = process.env.HASTAREKHA_DIR;
    const relRepo = path.resolve(process.cwd(), '..', 'hastarekha');
    const absRepo = '/Users/anurag/pworkspace/hastarekha';

    const repoCandidates = [envRepo, relRepo, absRepo].filter(Boolean) as string[];

    for (const repo of repoCandidates) {
      if (sub === 'chapters') {
        const p = path.join(repo, 'chapters');
        if (fs.existsSync(p) && !dirs.includes(p)) dirs.push(p);
      } else if (sub === 'notes') {
        const p = path.join(repo, 'notes');
        if (fs.existsSync(p) && !dirs.includes(p)) dirs.push(p);
      } else if (sub === 'transcripts') {
        const p1 = path.join(repo, 'lectures_raw');
        if (fs.existsSync(p1) && !dirs.includes(p1)) dirs.push(p1);
        const p2 = path.join(repo, 'transcripts');
        if (fs.existsSync(p2) && !dirs.includes(p2)) dirs.push(p2);
      }
    }
  }

  // Always include local content dir as fallback or primary
  if (fs.existsSync(localDir) && !dirs.includes(localDir)) {
    dirs.push(localDir);
  }

  return dirs;
}

/**
 * Gathers unique files across candidate directories.
 * If a file exists in multiple directories, picks the one with latest modification time.
 */
function getMergedFiles(dirs: string[], filterFn: (f: string) => boolean): { fileName: string; fullPath: string; mtimeMs: number }[] {
  const fileMap = new Map<string, { fileName: string; fullPath: string; mtimeMs: number }>();

  for (const dir of dirs) {
    if (!fs.existsSync(dir)) continue;
    try {
      const files = fs.readdirSync(dir).filter(filterFn);
      for (const fileName of files) {
        const fullPath = path.join(dir, fileName);
        const stat = fs.statSync(fullPath);
        if (stat.isFile()) {
          const existing = fileMap.get(fileName);
          if (!existing || stat.mtimeMs > existing.mtimeMs) {
            fileMap.set(fileName, { fileName, fullPath, mtimeMs: stat.mtimeMs });
          }
        }
      }
    } catch {}
  }

  return Array.from(fileMap.values());
}

// ----------------------------------------------------------------------
// Chapters
// ----------------------------------------------------------------------
export function getCourseChapters(courseSlug: string): ChapterItem[] {
  const candidateDirs = getCandidateDirs(courseSlug, 'chapters');
  const merged = getMergedFiles(candidateDirs, f => f.endsWith('.md') && f.toLowerCase() !== 'readme.md');

  const chapters: ChapterItem[] = [];

  for (const item of merged) {
    const raw = fs.readFileSync(item.fullPath, 'utf8');
    const { data: frontmatter, content } = matter(raw);

    const slug = item.fileName.replace(/\.md$/, '');
    const numMatch = item.fileName.match(/^(\d+)/);
    const chapterNumber = frontmatter.chapter_number
      ? parseInt(frontmatter.chapter_number, 10)
      : numMatch ? parseInt(numMatch[1], 10) : undefined;

    let title = frontmatter.title || '';
    if (!title) {
      const firstH1 = content.split('\n').find(l => l.trim().startsWith('# '));
      title = firstH1 ? firstH1.replace('# ', '').trim() : slug;
    }

    const words = content.trim().split(/\s+/).length;
    const readTime = `${Math.max(1, Math.ceil(words / 200))} min read`;

    chapters.push({
      id: frontmatter.id || slug,
      slug,
      title: cleanTitle(title),
      chapterNumber,
      content,
      private: frontmatter.private === true || frontmatter.private === 'true',
      readTime: frontmatter.read_time || readTime,
      summary: frontmatter.description || frontmatter.summary || '',
    });
  }

  return chapters.sort((a, b) => {
    if (a.chapterNumber !== undefined && b.chapterNumber !== undefined) {
      return a.chapterNumber - b.chapterNumber;
    }
    return a.slug.localeCompare(b.slug);
  });
}

export function getChapter(courseSlug: string, chapterSlug: string): {
  chapter: ChapterItem;
  prev: ChapterItem | null;
  next: ChapterItem | null;
} | null {
  const chapters = getCourseChapters(courseSlug);
  let idx = chapters.findIndex(c => c.slug === chapterSlug || c.id === chapterSlug);

  // 1. For hastarekha, resolve via bookStructure metadata / aliases
  if (idx === -1 && courseSlug === 'hastarekha') {
    const targetMeta = getChapterBySlug(chapterSlug);
    if (targetMeta) {
      idx = chapters.findIndex(c => {
        if (c.slug === targetMeta.id || c.id === targetMeta.id) return true;
        const cMeta = getChapterBySlug(c.slug) || getChapterBySlug(c.id);
        return cMeta?.id === targetMeta.id;
      });
    }
  }

  // 2. Normalized fallback (remove leading digits, 'the-', 'ch-')
  if (idx === -1) {
    const normalize = (s: string) => s.toLowerCase().replace(/^ch-/, '').replace(/^the-/, '').replace(/^\d+-/, '');
    const targetNorm = normalize(chapterSlug);
    if (targetNorm) {
      idx = chapters.findIndex(c => normalize(c.slug) === targetNorm || normalize(c.id) === targetNorm);
    }
  }

  if (idx === -1) return null;

  return {
    chapter: chapters[idx],
    prev: idx > 0 ? chapters[idx - 1] : null,
    next: idx < chapters.length - 1 ? chapters[idx + 1] : null,
  };
}

// ----------------------------------------------------------------------
// Notes
// ----------------------------------------------------------------------
export function getCourseNotes(courseSlug: string): NoteItem[] {
  const candidateDirs = getCandidateDirs(courseSlug, 'notes');
  const merged = getMergedFiles(candidateDirs, f => f.endsWith('.md') && f.toLowerCase() !== 'readme.md');

  const notes: NoteItem[] = [];

  for (const item of merged) {
    const raw = fs.readFileSync(item.fullPath, 'utf8');
    const { data: frontmatter, content } = matter(raw);

    const slug = item.fileName.replace(/\.md$/, '');
    const numMatch = item.fileName.match(/^(\d+)/);
    const lectureNumber = numMatch ? parseInt(numMatch[1], 10) : undefined;

    let title = frontmatter.title || '';
    if (!title) {
      const firstH1 = content.split('\n').find(l => l.trim().startsWith('# '));
      title = firstH1 ? firstH1.replace('# ', '').trim() : slug;
    }

    notes.push({
      id: slug,
      slug,
      title: cleanTitle(title),
      content,
      lectureNumber,
      private: frontmatter.private === true || frontmatter.private === 'true',
    });
  }

  return notes.sort((a, b) => {
    if (a.lectureNumber !== undefined && b.lectureNumber !== undefined) {
      return a.lectureNumber - b.lectureNumber;
    }
    return a.slug.localeCompare(b.slug);
  });
}

export function getNote(courseSlug: string, noteSlug: string): {
  note: NoteItem;
  prev: NoteItem | null;
  next: NoteItem | null;
} | null {
  const notes = getCourseNotes(courseSlug);
  const idx = notes.findIndex(n => n.slug === noteSlug || encodeURIComponent(n.slug) === noteSlug);
  if (idx === -1) return null;

  return {
    note: notes[idx],
    prev: idx > 0 ? notes[idx - 1] : null,
    next: idx < notes.length - 1 ? notes[idx + 1] : null,
  };
}

// ----------------------------------------------------------------------
// Slides
// ----------------------------------------------------------------------
export function parseSlideMarkdown(raw: string, filename: string, status: 'ready' | 'in-progress'): SlideDeck {
  const slug = filename.replace(/\.md$/, '');
  const dayMatch = filename.match(/day-(\d+)/i);
  const dayNumber = dayMatch ? parseInt(dayMatch[1], 10) : undefined;

  const lines = raw.split('\n');
  const firstH1 = lines.find(l => l.trim().startsWith('# '));
  const rawTitle = firstH1 ? firstH1.replace('# ', '').trim() : slug;
  const title = cleanTitle(rawTitle);

  const sections = raw.split(/^---$/m).map(s => s.trim()).filter(Boolean);
  const slides: SlideItem[] = [];

  sections.forEach((sec, index) => {
    const secLines = sec.split('\n');
    const h2Index = secLines.findIndex(l => l.trim().startsWith('## '));
    const h3Index = secLines.findIndex(l => l.trim().startsWith('### '));

    let slideTitle = `Slide ${index + 1}`;
    let subtitle = '';

    if (h2Index !== -1) {
      slideTitle = secLines[h2Index].replace('## ', '').trim();
    }
    if (h3Index !== -1) {
      subtitle = secLines[h3Index].replace('### ', '').replace(/\*\*/g, '').trim();
    }

    slides.push({
      index: index + 1,
      title: slideTitle,
      subtitle: subtitle || undefined,
      content: sec,
      raw: sec,
    });
  });

  return {
    id: slug,
    slug,
    title,
    dayNumber,
    status,
    slides,
    rawContent: raw,
  };
}

export function getCourseSlides(courseSlug: string): SlideDeck[] {
  const baseDir = path.join(CONTENT_DIR, courseSlug, 'slides');
  if (!fs.existsSync(baseDir)) return [];

  const decks: SlideDeck[] = [];

  const readyDir = path.join(baseDir, 'ready');
  if (fs.existsSync(readyDir)) {
    const readyFiles = fs.readdirSync(readyDir).filter(f => f.endsWith('.md'));
    for (const file of readyFiles) {
      const raw = fs.readFileSync(path.join(readyDir, file), 'utf8');
      decks.push(parseSlideMarkdown(raw, file, 'ready'));
    }
  }

  const wipDir = path.join(baseDir, 'in-progress');
  if (fs.existsSync(wipDir)) {
    const wipFiles = fs.readdirSync(wipDir).filter(f => f.endsWith('.md'));
    for (const file of wipFiles) {
      if (!decks.some(d => d.id === file.replace(/\.md$/, ''))) {
        const raw = fs.readFileSync(path.join(wipDir, file), 'utf8');
        decks.push(parseSlideMarkdown(raw, file, 'in-progress'));
      }
    }
  }

  return decks.sort((a, b) => {
    if (a.dayNumber !== undefined && b.dayNumber !== undefined) {
      return a.dayNumber - b.dayNumber;
    }
    return a.slug.localeCompare(b.slug);
  });
}

export function getSlideDeck(courseSlug: string, slideSlug: string): SlideDeck | null {
  const decks = getCourseSlides(courseSlug);
  return decks.find(d => d.slug === slideSlug || encodeURIComponent(d.slug) === slideSlug) || null;
}

// ----------------------------------------------------------------------
// Quizzes & Flashcards
// ----------------------------------------------------------------------
export function getCourseQuizzes(courseSlug: string): QuizDeck[] {
  const candidateDirs = getCandidateDirs(courseSlug, 'quizzes');
  const merged = getMergedFiles(candidateDirs, f => f.endsWith('.json'));

  const decks: QuizDeck[] = [];
  for (const item of merged) {
    try {
      const raw = fs.readFileSync(item.fullPath, 'utf8');
      decks.push(JSON.parse(raw));
    } catch {}
  }

  return decks.sort((a, b) => a.title.localeCompare(b.title));
}

export function getQuizDeck(courseSlug: string, quizSlug: string): QuizDeck | null {
  const decks = getCourseQuizzes(courseSlug);
  return decks.find(d => d.slug === quizSlug || encodeURIComponent(d.slug) === quizSlug) || null;
}

export function getChapterQuizQuestions(courseSlug: string, sourceNotes: string[] = []): QuizQuestion[] {
  if (!sourceNotes || sourceNotes.length === 0) return [];
  const allDecks = getCourseQuizzes(courseSlug);
  const questions: QuizQuestion[] = [];
  const seenIds = new Set<string>();

  for (const deck of allDecks) {
    const isMatch = sourceNotes.some(note => {
      const cleanNote = note.toLowerCase().replace(/\.md$/, '').trim();
      const cleanDeck = deck.slug.toLowerCase().trim();
      if (cleanDeck === cleanNote || cleanDeck.includes(cleanNote) || cleanNote.includes(cleanDeck)) return true;
      const numMatch = cleanNote.match(/^(\d+)/);
      if (numMatch && (cleanDeck === numMatch[1] || cleanDeck.startsWith(`${numMatch[1]}-`) || cleanDeck.startsWith(`${numMatch[1]} `))) return true;
      return false;
    });

    if (isMatch && deck.questions) {
      for (const q of deck.questions) {
        if (!seenIds.has(q.id)) {
          seenIds.add(q.id);
          questions.push(q);
        }
      }
    }
  }

  return questions;
}

export function getCourseFlashcards(courseSlug: string): FlashcardDeck[] {
  const candidateDirs = getCandidateDirs(courseSlug, 'flashcards');
  const merged = getMergedFiles(candidateDirs, f => f.endsWith('.json'));

  const decks: FlashcardDeck[] = [];
  for (const item of merged) {
    try {
      const raw = fs.readFileSync(item.fullPath, 'utf8');
      decks.push(JSON.parse(raw));
    } catch {}
  }

  return decks.sort((a, b) => a.title.localeCompare(b.title));
}

export function getFlashcardDeck(courseSlug: string, deckSlug: string): FlashcardDeck | null {
  const decks = getCourseFlashcards(courseSlug);
  return decks.find(d => d.slug === deckSlug || encodeURIComponent(d.slug) === deckSlug) || null;
}

// ----------------------------------------------------------------------
// Transcripts (Admin only)
// ----------------------------------------------------------------------
export function getCourseTranscripts(courseSlug: string): TranscriptItem[] {
  const candidateDirs = getCandidateDirs(courseSlug, 'transcripts');
  const merged = getMergedFiles(candidateDirs, f => f.endsWith('.txt') || f.endsWith('.md'));

  const transcripts: TranscriptItem[] = [];

  for (const item of merged) {
    const raw = fs.readFileSync(item.fullPath, 'utf8');
    const slug = item.fileName.replace(/\.(txt|md)$/, '');
    const clean = item.fileName.replace(/_clean\.(txt|md)$/, '').replace(/_/g, ' ');
    transcripts.push({
      id: slug,
      slug,
      title: clean,
      content: raw,
    });
  }

  return transcripts.sort((a, b) => a.slug.localeCompare(b.slug));
}

export function getTranscript(courseSlug: string, transcriptSlug: string): TranscriptItem | null {
  const transcripts = getCourseTranscripts(courseSlug);
  return transcripts.find(t => t.slug === transcriptSlug || encodeURIComponent(t.slug) === transcriptSlug) || null;
}
