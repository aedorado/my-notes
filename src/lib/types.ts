export type CourseCategory = 'mundane' | 'spiritual';

export interface CourseMeta {
  slug: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  category?: CourseCategory;
  language?: string;
  public?: boolean;
  defaultSection?: 'chapters' | 'notes' | 'slides' | 'transcripts';
  hasChapters?: boolean;
  hasNotes?: boolean;
  hasSlides?: boolean;
  hasQuizzes?: boolean;
  hasFlashcards?: boolean;
  hasTranscripts?: boolean;
  counts?: {
    chapters?: number;
    notes?: number;
    slides?: number;
    quizzes?: number;
    flashcards?: number;
    transcripts?: number;
  };
}

export interface ChapterItem {
  id: string;
  slug: string;
  title: string;
  chapterNumber?: number;
  content: string;
  private?: boolean;
  readTime?: string;
  summary?: string;
}

export interface NoteItem {
  id: string;
  slug: string;
  title: string;
  content: string;
  lectureNumber?: number;
  language?: 'en' | 'hi';
  private?: boolean;
}

export interface SlideItem {
  index: number;
  title: string;
  subtitle?: string;
  content: string;
  raw: string;
}

export interface SlideDeck {
  id: string;
  slug: string;
  title: string;
  dayNumber?: number;
  status: 'ready' | 'in-progress';
  slides: SlideItem[];
  rawContent: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number | number[]; // 0-based index or array of indices
  explanation?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  subtopic?: string;
}

export interface QuizDeck {
  id: string;
  slug: string;
  title: string;
  summary?: string;
  questions: QuizQuestion[];
}

export interface FlashcardItem {
  id: string;
  front: string;
  back: string;
  tip?: string;
  category?: string;
  tag?: string;
  subtopic?: string;
}

export interface FlashcardDeck {
  id: string;
  slug: string;
  title: string;
  summary?: string;
  cards: FlashcardItem[];
}

export interface TranscriptItem {
  id: string;
  slug: string;
  title: string;
  content: string;
}

