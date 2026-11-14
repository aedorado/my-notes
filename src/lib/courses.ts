import fs from 'fs';
import path from 'path';
import { CourseMeta } from './types';
import {
  getCourseChapters,
  getCourseNotes,
  getCourseSlides,
  getCourseQuizzes,
  getCourseFlashcards,
  getCourseTranscripts,
} from './content';

const CONTENT_DIR = path.join(process.cwd(), 'content');

export function getAllCourses(): CourseMeta[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];

  const dirs = fs.readdirSync(CONTENT_DIR, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  const courses: CourseMeta[] = [];

  for (const slug of dirs) {
    const meta = getCourseBySlug(slug);
    if (meta) {
      courses.push(meta);
    }
  }

  const order = ['hastarekha', 'pr-23', 'apa', 'community-64', 'bhakti-sandarbha'];
  return courses.sort((a, b) => {
    const idxA = order.indexOf(a.slug);
    const idxB = order.indexOf(b.slug);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return a.title.localeCompare(b.title);
  });
}

export function getCourseBySlug(slug: string): CourseMeta | null {
  const metaPath = path.join(CONTENT_DIR, slug, '_meta.json');
  if (!fs.existsSync(metaPath)) return null;

  try {
    const raw = fs.readFileSync(metaPath, 'utf8');
    const meta: CourseMeta = JSON.parse(raw);
    meta.slug = slug;

    if (!meta.category) {
      const mundaneSlugs = ['apa', 'hastarekha', 'pr-23'];
      meta.category = mundaneSlugs.includes(slug.toLowerCase()) ? 'mundane' : 'spiritual';
    }

    const chapters = getCourseChapters(slug);
    const notes = getCourseNotes(slug);
    const slides = getCourseSlides(slug);
    const quizzes = getCourseQuizzes(slug);
    const flashcards = getCourseFlashcards(slug);
    const transcripts = getCourseTranscripts(slug);

    meta.hasChapters = chapters.length > 0;
    meta.hasNotes = notes.length > 0;
    meta.hasSlides = slides.length > 0;
    meta.hasQuizzes = quizzes.length > 0;
    meta.hasFlashcards = flashcards.length > 0;
    meta.hasTranscripts = transcripts.length > 0;

    meta.counts = {
      chapters: chapters.length,
      notes: notes.length,
      slides: slides.length,
      quizzes: quizzes.length,
      flashcards: flashcards.length,
      transcripts: transcripts.length,
    };

    return meta;
  } catch (err) {
    return null;
  }
}
