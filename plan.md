# my-notes — Master Plan

> A multi-course notes platform: chapters, quizzes, flashcards, raw transcripts, and slide decks.
> Vercel-deployed from day one. Hastarekha content will migrate here over time — **hastarekha itself is NOT touched now**.

---

## Courses Planned

| Slug | Name | Status |
|---|---|---|
| `hastarekha` | Hastarekha — Vedic Palmistry | Content exists in separate repo; will migrate later |
| `pr-23` | 64 Principles of Community Building | Slides ready at `~/Downloads/64-principals-of-community-building/` |

---

## Directory Structure

```
my-notes/
├── PLAN.md                          # This file
│
├── content/                         # All raw course content — versioned in git
│   │
│   ├── hastarekha/                  # Course: Hastarekha (Vedic Palmistry)
│   │   ├── _meta.json               # Course metadata
│   │   ├── chapters/                # Polished chapter MD files (rich frontmatter)
│   │   ├── notes/                   # Raw lecture notes (MD)
│   │   ├── quizzes/                 # Quiz data (JSON)
│   │   ├── flashcards/              # Flashcard decks (JSON)
│   │   └── transcripts/             # Raw lecture transcripts (plain MD) — admin-only
│   │
│   ├── pr-23/                       # Course: 64 Principles of Community Building
│   │   ├── _meta.json               # Course metadata
│   │   ├── slides/                  # Day-wise slide decks (MD) — mirrors source format
│   │   │   ├── ready/               # Finalized slides
│   │   │   ├── in-progress/         # WIP slides
│   │   │   └── ...
│   │   ├── quizzes/                 # Quizzes extracted from slide files (JSON)
│   │   ├── flashcards/              # Flashcard decks (JSON)
│   │   └── transcripts/             # Raw lecture transcripts — admin-only
│   │
│   └── [future-course]/             # Same pattern — drop a folder and go
│       ├── _meta.json
│       ├── chapters/  OR  slides/   # Depends on course type
│       ├── quizzes/
│       ├── flashcards/
│       └── transcripts/
│
├── src/                             # Next.js App Router
│   ├── app/
│   │   ├── layout.tsx               # Root layout with AdminProvider
│   │   ├── page.tsx                 # Home — public course listing
│   │   │
│   │   ├── [course]/                # Dynamic course root
│   │   │   ├── page.tsx             # Course home (chapter/slide list)
│   │   │   ├── chapters/[slug]/page.tsx
│   │   │   ├── slides/[slug]/page.tsx
│   │   │   ├── quiz/[slug]/page.tsx
│   │   │   ├── flashcards/[slug]/page.tsx
│   │   │   └── transcripts/[slug]/page.tsx  # Admin-only
│   │   │
│   │   └── api/
│   │       ├── courses/route.ts
│   │       ├── [course]/chapters/route.ts
│   │       ├── [course]/slides/route.ts
│   │       ├── [course]/quizzes/route.ts
│   │       ├── [course]/flashcards/route.ts
│   │       └── auth/route.ts        # Admin password verify
│   │
│   ├── components/
│   │   ├── AdminModal.tsx           # Login modal (same pattern as hastarekha)
│   │   ├── PrivateGuard.tsx         # Wraps admin-only content
│   │   ├── CourseCard.tsx
│   │   ├── ChapterReader.tsx        # Rich MD renderer
│   │   ├── SlideViewer.tsx          # Day-wise slide deck viewer
│   │   ├── QuizEngine.tsx
│   │   ├── FlashcardDeck.tsx
│   │   └── MarkdownRenderer.tsx
│   │
│   ├── context/
│   │   └── AdminContext.tsx         # Session storage, 10-min expiry (same as hastarekha)
│   │
│   └── lib/
│       ├── content.ts               # FS content loader (server-side)
│       ├── courses.ts               # _meta.json registry
│       └── types.ts                 # Shared TypeScript types
│
├── public/
│   └── course-images/
│
├── .env.local.example               # ADMIN_PASSWORD
├── next.config.ts
├── package.json
├── tsconfig.json
├── vercel.json
└── README.md
```

---

## Content Types Per Course

| Type | hastarekha | pr-23 | Future courses |
|---|---|---|---|
| `chapters/` | ✅ Rich MD with frontmatter | — | Optional |
| `slides/` | — | ✅ Day-wise MD slide decks | Optional |
| `notes/` | ✅ Raw lecture notes | — | Optional |
| `quizzes/` | ✅ JSON decks | ✅ Extracted from slides | Optional |
| `flashcards/` | ✅ JSON decks | ✅ | Optional |
| `transcripts/` | ✅ Admin-only | ✅ Admin-only | Always admin-only |

---

## Access Model

| Content | Default | Private |
|---|---|---|
| Course listing (home) | **Public** | — |
| Chapters / Slides | **Public** (overridable via `private: true` in frontmatter) | Admin login |
| Quizzes | **Public** | — |
| Flashcards | **Public** | — |
| Raw Transcripts | **Always private** | Admin login |

### Admin Auth Pattern
- Password in env var `ADMIN_PASSWORD`
- `sessionStorage` session with 10-min expiry
- Same pattern as the existing hastarekha `AdminContext`
- `PrivateGuard` component wraps any gated content

---

## Course `_meta.json` Schema

```json
{
  "slug": "pr-23",
  "title": "64 Principles of Community Building",
  "description": "A 30-day study of Srila Bhaktisiddhanta's 64 principles for a spiritual society, taught by HH Bhakti Dhira Damodara Swami Maharaja.",
  "icon": "🏛️",
  "color": "#7c5c2e",
  "language": "en",
  "public": true,
  "contentType": "slides"
}
```

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router) |
| Styling | Vanilla CSS + CSS variables |
| MD parsing | `gray-matter` + `remark` / `rehype` |
| Content storage | File-system, checked into git |
| Auth | Env-var password + sessionStorage |
| Deployment | Vercel |

---

## `vercel.json`

```json
{
  "crons": [
    { "path": "/api/keep-alive", "schedule": "0 5 * * *" }
  ]
}
```

**Env vars needed on Vercel:**
- `ADMIN_PASSWORD`

---

## Phase Plan

### Phase 0 — Plan (done)
- [x] Define repo structure and content model
- [x] Identify first two courses: `hastarekha` and `pr-23`

### Phase 1 — Scaffold
- [ ] Initialize Next.js project
- [ ] Create folder structure (src/, content/, public/)
- [ ] `_meta.json` files for both courses
- [ ] AdminContext + AdminModal (port from hastarekha)
- [ ] PrivateGuard stub
- [ ] Home page: course listing
- [ ] vercel.json + .env.local.example

### Phase 2 — PR-23 Content
- [ ] Copy `slides/ready/` and `slides/in-progress/` into `content/pr-23/slides/`
- [ ] Slide viewer UI (day-by-day navigation)
- [ ] Extract quizzes from slide files into `content/pr-23/quizzes/`
- [ ] Flashcard deck builder for PR-23

### Phase 3 — Hastarekha Migration
- [ ] Copy `chapters/` into `content/hastarekha/chapters/`
- [ ] Copy `notes/` into `content/hastarekha/notes/`
- [ ] Transcripts folder setup
- [ ] Migrate quiz/flashcard TS files to JSON in `content/hastarekha/`
- [ ] Chapter reader UI

### Phase 4 — Polish
- [ ] Quiz engine
- [ ] Flashcard flip UI
- [ ] Transcript viewer (admin-only)
- [ ] Progress tracking (optional)

---

## Notes

> **Hastarekha repo (`/pworkspace/hastarekha`) is NOT modified at any point.**
> Content will be gradually mirrored here. Hastarekha runs independently until explicitly deprecated.
