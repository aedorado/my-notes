export interface ChapterMeta {
  id: string; // url slug e.g. "11-mount-of-saturn" or "17-the-life-line"
  code: string; // e.g. "A1", "D2", or "F2"
  chapterNumber: number;
  partId: string;
  partTitle: string;
  title: string;
  subtitleSanskrit: string;
  sourceNotes: string[];
  essence: string;
  readTime: string;
  hasCompiledChapter?: boolean;
  aliases?: string[];
}

export interface BookPart {
  id: string;
  title: string;
  description: string;
  chapters: ChapterMeta[];
}

export const BOOK_PARTS: BookPart[] = [
  {
    id: "part-a",
    title: "PART A · FOUNDATIONS",
    description: "The hand as a cosmic map: philosophy, anatomical structure, elements, and hand types.",
    chapters: [
      {
        id: "01-introduction",
        code: "A1",
        chapterNumber: 1,
        partId: "part-a",
        partTitle: "PART A · FOUNDATIONS",
        title: "Foundations & Structural Anatomy of the Hand",
        subtitleSanskrit: "Śāstra Paricaya & Hasta Racanā · Philosophy, Skin, Hardness & Lakṣaṇa Vidyā",
        sourceNotes: [
          "01 - Hasta Sāmudrika Śāstra: Introduction.md",
          "02 - Structure of Hand.md"
        ],
        essence: "The foundational doctrine of Hasta Sāmudrika Śāstra: its sacred lineage from Samudra Ṛṣi, the overarching law of Deśa-Kāla-Paristhiti, and the preliminary reading of skin texture, firmness, flexibility, and physical palm structure before touching a single line.",
        readTime: "18 min read",
        aliases: ["01-introduction-and-anatomy", "01-foundations-and-anatomy", "02-structure-of-hand", "introduction"]
      },
      {
        id: "02-elemental-types-and-colors",
        code: "A2",
        chapterNumber: 2,
        partId: "part-a",
        partTitle: "PART A · FOUNDATIONS",
        title: "The Four Elemental Archetypes & Palm Colorations",
        subtitleSanskrit: "Catur-Bhūta Hasta & Varṇa Lakṣaṇam",
        sourceNotes: [
          "03 - Fire & Water Hands.md",
          "04 - Square Palm: Airy & Earthy Hands, and Palm Colors.md"
        ],
        essence: "The proportion of fingers to palm defines the native's elemental engine—Fire, Water, Air, or Earth—while the tint of the palm reveals active blood circulation and internal disposition.",
        readTime: "15 min read",
        aliases: ["02-elemental-archetypes", "ch-02-elemental-archetypes", "03-elemental-types-and-colors", "elemental-types"]
      },
      {
        id: "03-dorsal-hand-types",
        code: "A3",
        chapterNumber: 3,
        partId: "part-a",
        partTitle: "PART A · FOUNDATIONS",
        title: "The Seven Dorsal Hand Archetypes",
        subtitleSanskrit: "Pṛṣṭha Hasta Bheda · Seven Classical Morphologies",
        sourceNotes: ["05 - The 7 Dorsal Hand Types (Back Palm Analysis).md"],
        essence: "Viewed from the dorsal plane, the hand reveals karmic inclination across seven archetypes, from the primitive elemental hand to the refined philosophic and psychic forms.",
        readTime: "14 min read",
        aliases: ["03-dorsal-archetypes", "ch-03-dorsal-archetypes", "04-dorsal-hand-types", "dorsal-hand-types"]
      }
    ]
  },
  {
    id: "part-b",
    title: "PART B · THE THUMB & FINGERS",
    description: "The instruments of consciousness: will power, logic, and planetary energy channels.",
    chapters: [
      {
        id: "04-the-thumb",
        code: "B1",
        chapterNumber: 4,
        partId: "part-b",
        partTitle: "PART B · THE THUMB & FINGERS",
        title: "The Thumb: King of the Hand",
        subtitleSanskrit: "Aṅguṣṭha Lakṣaṇam · Will, Logic & Parva Analysis",
        sourceNotes: [
          "06 - The Thumb (अंगूठा): Will Power, Length, Angle, & Phalange Reading.md",
          "07 - Thumb Phalanges (Parva) and Thumb Types.md"
        ],
        essence: "Without the thumb, the hand is powerless; without will, destiny cannot unfold. The angle of emergence, flexibility, and phalange proportions dictate executive resolve and reasoning.",
        readTime: "16 min read",
        aliases: ["04-thumb", "05-the-thumb", "the-thumb", "ch-04-thumb"]
      },
      {
        id: "05-finger-proportions",
        code: "B2",
        chapterNumber: 5,
        partId: "part-b",
        partTitle: "PART B · THE THUMB & FINGERS",
        title: "Finger Proportions & Universal Phalanges",
        subtitleSanskrit: "Aṅguli Pramāṇa & Parva Lakṣaṇam · Measurement, Base Alignment & The Three Universal Segments",
        sourceNotes: ["08 - Finger Length Measurement, Finger Phalanges, and the Jupiter Finger.md"],
        essence: "Every finger is governed by universal laws: benchmark measurement against the Saturn finger, setting of the finger root line, and the karmic tri-fold division of the phalanges into Mentality, Implementation, and Result.",
        readTime: "12 min read",
        aliases: ["finger-proportions", "ch-05-finger-proportions"]
      },
      {
        id: "06-jupiter-finger",
        code: "B3",
        chapterNumber: 6,
        partId: "part-b",
        partTitle: "PART B · THE THUMB & FINGERS",
        title: "The Jupiter Finger: Leadership, Morality & Ambition",
        subtitleSanskrit: "Tarjanī Aṅguli · Wisdom, Guru Karakatvas & Moral Authority",
        sourceNotes: ["08 - Finger Length Measurement, Finger Phalanges, and the Jupiter Finger.md"],
        essence: "The index finger is the antenna of ambition, dignity, and leadership. Its height relative to the Sun finger marks the balance between command and artistic impulse.",
        readTime: "13 min read",
        aliases: ["05-jupiter-finger", "ch-05-jupiter-finger", "jupiter-finger", "ch-06-jupiter-finger"]
      },
      {
        id: "07-saturn-finger",
        code: "B4",
        chapterNumber: 7,
        partId: "part-b",
        partTitle: "PART B · THE THUMB & FINGERS",
        title: "The Saturn Finger: Axis of Discipline",
        subtitleSanskrit: "Madhyamā Aṅguli · Gravity, Research & Solitude",
        sourceNotes: ["09 - Sun & Saturn Fingers.md"],
        essence: "Standing as the pillar of the hand, Madhyamā governs karmic endurance, philosophical contemplation, deep research, and the native's relationship with fate.",
        readTime: "11 min read",
        aliases: ["06-saturn-finger", "ch-06-saturn-finger", "saturn-finger", "ch-07-saturn-finger"]
      },
      {
        id: "08-sun-finger",
        code: "B5",
        chapterNumber: 8,
        partId: "part-b",
        partTitle: "PART B · THE THUMB & FINGERS",
        title: "The Sun Finger: Creative Brilliance & Risk",
        subtitleSanskrit: "Anāmikā Aṅguli · Fame, Aesthetics & Speculation",
        sourceNotes: ["09 - Sun & Saturn Fingers.md"],
        essence: "The ring finger reflects solar vitality, public recognition, artistic temperament, and the innate courage to undertake daring ventures.",
        readTime: "11 min read",
        aliases: ["07-sun-finger", "ch-07-sun-finger", "sun-finger", "ch-08-sun-finger"]
      },
      {
        id: "09-mercury-finger",
        code: "B6",
        chapterNumber: 9,
        partId: "part-b",
        partTitle: "PART B · THE THUMB & FINGERS",
        title: "The Mercury Finger: Commerce & Expression",
        subtitleSanskrit: "Kaniṣṭhikā Aṅguli · Eloquence, Business & Independence",
        sourceNotes: ["10 - Mercury (Little) Finger.md"],
        essence: "Reaching toward the nail joint of the Sun finger, Kaniṣṭhikā gauges articulation, commercial savvy, financial acumen, and sexual/emotional maturity.",
        readTime: "10 min read",
        aliases: ["08-mercury-finger", "ch-08-mercury-finger", "mercury-finger", "ch-09-mercury-finger"]
      }
    ]
  },
  {
    id: "part-c",
    title: "PART C · NAILS (NAKHA LAKṢAṆAM)",
    description: "The windows of constitutional health, planetary defects, and nervous equilibrium.",
    chapters: [
      {
        id: "10-the-nails",
        code: "C1",
        chapterNumber: 10,
        partId: "part-c",
        partTitle: "PART C · NAILS",
        title: "The Nails: Forms, Textures, Lunula & Clinical Signs",
        subtitleSanskrit: "Nakha Lakṣaṇam · Ardhacandra, Ridges & Constitutional Health",
        sourceNotes: [
          "11 - Nails.md",
          "12 - Nails.md"
        ],
        essence: "Nails are direct barometers of bodily prāṇa and systemic circulation. Their shape, texture, longitudinal ridges, and the half-moon (ardhacandra) expose constitutional strengths and chronic pathologies.",
        readTime: "18 min read",
        aliases: ["09-the-nails", "ch-09-the-nails", "the-nails", "nails"]
      }
    ]
  },
  {
    id: "part-d",
    title: "PART D · THE MOUNTS (GRAHA PARVATA)",
    description: "The capacitors of planetary prāṇa, apex focal points, and sacred markings.",
    chapters: [
      {
        id: "11-mount-of-jupiter",
        code: "D1",
        chapterNumber: 11,
        partId: "part-d",
        partTitle: "PART D · THE MOUNTS",
        title: "The Mount of Jupiter: Seat of Dharma & Dignity",
        subtitleSanskrit: "Guru Parvata · Leadership, Teacher's Square & Apex",
        sourceNotes: ["13 - JU Mount.md"],
        essence: "Located at the base of the index finger, Guru Parvata governs knowledge, self-respect, and moral authority. Its apex direction and sacred marks reveal the soul's teacher instincts.",
        readTime: "14 min read",
        aliases: ["10-mount-of-jupiter", "13-jupiter-mount", "ch-13-jupiter-mount", "mount-of-jupiter"]
      },
      {
        id: "12-mount-of-saturn",
        code: "D2",
        chapterNumber: 12,
        partId: "part-d",
        partTitle: "PART D · THE MOUNTS",
        title: "The Mount of Saturn: Solitude, Karma & Realism",
        subtitleSanskrit: "Śani Parvata · Karma-pradhān, Apex Shifts & Solitude",
        sourceNotes: ["14 - SA Mount.md"],
        essence: "Sitting under the middle finger, a healthy Saturn mount is slightly pressed rather than raised. Its apex indicates whether the native is karma-driven, traditional, or philosophical.",
        readTime: "15 min read",
        aliases: ["11-mount-of-saturn", "14-saturn-mount", "ch-14-saturn-mount", "mount-of-saturn"]
      },
      {
        id: "13-mount-of-sun",
        code: "D3",
        chapterNumber: 13,
        partId: "part-d",
        partTitle: "PART D · THE MOUNTS",
        title: "The Mount of the Sun: Radiance & Renown",
        subtitleSanskrit: "Sūrya Parvata · Glory, Aesthetics & Social Prestige",
        sourceNotes: ["15 - SU Mount.md"],
        essence: "The solar mount endows the individual with magnetism, public standing, aesthetic discernment, and the desire to leave an enduring legacy.",
        readTime: "14 min read",
        aliases: ["12-mount-of-sun", "15-sun-mount", "mount-of-sun"]
      },
      {
        id: "14-mount-of-mercury",
        code: "D4",
        chapterNumber: 14,
        partId: "part-d",
        partTitle: "PART D · THE MOUNTS",
        title: "The Mount of Mercury: Wit & Trade",
        subtitleSanskrit: "Budha Parvata · Speech, Healing & Mercantile Talent",
        sourceNotes: ["16 - ME Mount.md"],
        essence: "Guarding the outer percussion of the palm, Budha Parvata oversees mathematical aptitude, rapid verbal articulation, negotiation, and scientific healing.",
        readTime: "13 min read",
        aliases: ["13-mount-of-mercury", "16-mercury-mount", "mount-of-mercury"]
      },
      {
        id: "15-mount-of-moon",
        code: "D5",
        chapterNumber: 15,
        partId: "part-d",
        partTitle: "PART D · THE MOUNTS",
        title: "The Mount of the Moon: Ocean of Mind",
        subtitleSanskrit: "Candra Parvata · Imagination, Travel & Subconscious",
        sourceNotes: ["17 - MO Mount.md"],
        essence: "Occupying the lower hypothenar region, Candra Parvata governs emotional depth, intuition, love of foreign voyages, and receptivity to spiritual currents.",
        readTime: "15 min read",
        aliases: ["14-mount-of-moon", "17-moon-mount", "mount-of-moon"]
      },
      {
        id: "16-mount-of-venus",
        code: "D6",
        chapterNumber: 16,
        partId: "part-d",
        partTitle: "PART D · THE MOUNTS",
        title: "The Mount of Venus: Vital Prāṇa & Romance",
        subtitleSanskrit: "Śukra Parvata · Ojas, Sensory Pleasures & Compassion",
        sourceNotes: ["18 - VE + MA Mount.md"],
        essence: "Encapsulated by the Life Line, the Mount of Venus provides the physical fuel of vitality (ojas), love of beauty, warmth in relationships, and generous compassion.",
        readTime: "13 min read",
        aliases: ["15-mount-of-venus", "18-venus-mount", "mount-of-venus"]
      },
      {
        id: "17-mounts-of-mars",
        code: "D7",
        chapterNumber: 17,
        partId: "part-d",
        partTitle: "PART D · THE MOUNTS",
        title: "The Dual Mounts of Mars: Inner & Outer Courage",
        subtitleSanskrit: "Maṅgala Parvata · Positive & Negative Valor",
        sourceNotes: ["18 - VE + MA Mount.md"],
        essence: "Lower Mars (active aggression, physical bravery) and Upper Mars (moral stamina, resistance under pressure) together forge the warrior spirit within the palm.",
        readTime: "13 min read",
        aliases: ["16-mounts-of-mars", "17-mars-mount", "18-mars-mount", "mounts-of-mars"]
      }
    ]
  },
  {
    id: "part-e",
    title: "PART E · THE MAJOR LINES (MUKHYA REKHĀEN)",
    description: "The energetic meridians of life force, fate, consciousness, and emotional flow.",
    chapters: [
      {
        id: "18-the-life-line",
        code: "E1",
        chapterNumber: 18,
        partId: "part-e",
        partTitle: "PART E · THE MAJOR LINES",
        title: "The Life Line: Vitality, Breaks, Shoots & Ketu Splits",
        subtitleSanskrit: "Jīvana Rekhā · Complete Study of Origin, Repairs & Foreign Travel",
        sourceNotes: [
          "19 - Symbols & Life Line - Part 01.md",
          "20 - Symbols & Life Line - Part 02.md",
          "21 - Symbols & Life Line - Part 03.md"
        ],
        essence: "The complete master study of the Life Line: its origin near the thumb notch, curve encircling Venus, upward shoots marking milestone successes, breaks and overlapping repairs, and downward Ketu forks indicating foreign resettlement.",
        readTime: "22 min read",
        aliases: ["17-the-life-line", "ch-18-life-line", "the-life-line", "life-line"]
      },
      {
        id: "19-the-fate-line",
        code: "E2",
        chapterNumber: 19,
        partId: "part-e",
        partTitle: "PART E · THE MAJOR LINES",
        title: "The Fate Line: Vocation, Career Shifts & Stoppages",
        subtitleSanskrit: "Bhāgya Rekhā · Complete Study of Origins, Obstructions & Dual Lines",
        sourceNotes: [
          "22 - Bhāgya Rekhā (Fate Line) - 01.md",
          "23 - Bhāgya Rekhā (Fate Line) - 02: Variations, Timing, Branches, Influence Line.md"
        ],
        essence: "The full doctrine of the Fate Line: origins from the wrist, Moon, or Life Line, career timing, stoppages at the Head Line (age 35) or Heart Line (age 56), and secondary parallel lines generating multiple income streams.",
        readTime: "20 min read",
        aliases: ["18-the-fate-line", "the-fate-line", "fate-line"]
      },
      {
        id: "20-head-line-and-brain",
        code: "E3",
        chapterNumber: 20,
        partId: "part-e",
        partTitle: "PART E · THE MAJOR LINES",
        title: "The Head Line: Intellect, Mental Focus & Curvature",
        subtitleSanskrit: "Mastiṣka Rekhā · Slopes, Forks & Mental Tenacity",
        sourceNotes: [
          "24 - Diamond Chain, Canopy, and the Brain Line (mastiṣka rekhā).md",
          "25 - Mind Line & Heart Line.md"
        ],
        essence: "A straight Head Line seeks factual clarity and commercial logic; a gently sloping line dips into Moon's creative imagination, and the Writer's Fork balances both.",
        readTime: "15 min read",
        aliases: ["19-head-line-and-brain", "head-line-and-brain", "head-line", "brain-line"]
      },
      {
        id: "21-heart-line-and-emotions",
        code: "E4",
        chapterNumber: 21,
        partId: "part-e",
        partTitle: "PART E · THE MAJOR LINES",
        title: "The Heart Line: Emotional Flow, Idealism & Terminations",
        subtitleSanskrit: "Hṛdaya Rekhā · Guru Forks & Affectional Temperament",
        sourceNotes: [
          "25 - Mind Line & Heart Line.md",
          "26 - Heart Line Combinations, Sūrya Rekhā (Sun Line).md"
        ],
        essence: "Terminating under Jupiter creates an idealistic, noble lover; ending under Saturn brings pragmatic emotional caution; a trident on Jupiter blesses the native with emotional harmony.",
        readTime: "14 min read",
        aliases: ["20-heart-line-and-emotions", "heart-line-and-emotions", "heart-line"]
      },
      {
        id: "22-sun-line",
        code: "E5",
        chapterNumber: 22,
        partId: "part-e",
        partTitle: "PART E · THE MAJOR LINES",
        title: "The Sun Line: The Royal Road to Renown",
        subtitleSanskrit: "Sūrya Rekhā · Fame, Talent & Public Recognition",
        sourceNotes: ["26 - Heart Line Combinations, Sūrya Rekhā (Sun Line).md"],
        essence: "Running parallel to the Fate Line toward Apollo's mount, the Sun line is the line of brilliance—without it, a good Fate Line earns wealth but misses public celebration.",
        readTime: "12 min read",
        aliases: ["21-sun-line", "sun-line"]
      },
      {
        id: "23-mercury-health-line",
        code: "E6",
        chapterNumber: 23,
        partId: "part-e",
        partTitle: "PART E · THE MAJOR LINES",
        title: "The Mercury Line: Liver, Health & Commercial Instinct",
        subtitleSanskrit: "Budha Rekhā · Svasthya, Hepatic Health & Intuition",
        sourceNotes: ["27 - Aging.md"],
        essence: "Connecting the base of the palm to Mercury, this line serves as a health indicator (especially liver and digestion) and a marker of sharp commercial eloquence.",
        readTime: "11 min read",
        aliases: ["22-mercury-health-line", "23-the-mercury-line", "ch-23-mercury-line", "mercury-line"]
      }
    ]
  },
  {
    id: "part-f",
    title: "PART F · LIFE EVENTS, RELATIONSHIPS & SPIRITUALITY",
    description: "Chronology calculation, marital alliances, parental karma, and the marks of higher consciousness, mysticism, and spiritual vocation.",
    chapters: [
      {
        id: "24-age-calculation-systems",
        code: "F1",
        chapterNumber: 24,
        partId: "part-f",
        partTitle: "PART F · LIFE EVENTS & TIMING",
        title: "Āyu-Gaṇanā: Age Calculation Systems",
        subtitleSanskrit: "Kāla Gaṇanā · Saptāṁśa & Three-Line Average Method",
        sourceNotes: ["27 - Aging.md"],
        essence: "Classical Indian Ṣaḍaṁśa (divisions by 6), Cheiro's western Saptāṁśa (divisions by 7), and the teacher's three-line average method for accurately pinning age on major events.",
        readTime: "12 min read",
        aliases: ["23-age-calculation-systems", "24-ayu-ganana-age-calculation", "ch-24-ayu-ganana", "age-calculation"]
      },
      {
        id: "25-marriage-line",
        code: "F2",
        chapterNumber: 25,
        partId: "part-f",
        partTitle: "PART F · LIFE EVENTS & TIMING",
        title: "The Marriage Line: Attachments, Timing & Defects",
        subtitleSanskrit: "Vivāha Rekhā · Complete Study of Timing, Forks, Droops & Islands",
        sourceNotes: [
          "28 - Marriage Line 01.md",
          "29 - Marriage Line 02.md"
        ],
        essence: "The complete doctrine of marital indications: age timing on the percussion, depth of attachment, splits/forks, downward droops cutting the Heart Line, islands indicating health strain, and upward curls.",
        readTime: "18 min read",
        aliases: ["24-marriage-line", "ch-25-marriage-line", "marriage-line"]
      },
      {
        id: "26-children-lines",
        code: "F3",
        chapterNumber: 26,
        partId: "part-f",
        partTitle: "PART F · LIFE EVENTS & TIMING",
        title: "Children Lines: Fertility, Conception & Parental Responsibility",
        subtitleSanskrit: "Santāna Rekhā · Lines on Marriage Line, Venus & Thumb Base",
        sourceNotes: [
          "30 - Children 01.md",
          "31 - Children 02.md"
        ],
        essence: "The delicate vertical lines above the marriage line, the condition of Venus and Mars for fertility, temporary responsibility lines on the palm, and modern considerations under Deśa-Kāla-Paristhiti.",
        readTime: "14 min read",
        aliases: ["25-children-lines", "ch-25-children-lines", "children-lines"]
      },
      {
        id: "27-spirituality-and-mysticism",
        code: "F4",
        chapterNumber: 27,
        partId: "part-f",
        partTitle: "PART F · LIFE EVENTS & SPIRITUALITY",
        title: "Adhyātma Yoga: Spirituality, Mysticism & Sacred Signs",
        subtitleSanskrit: "Adhyātma Rekhā & Graha Yoga · Ring of Solomon, Intuition, Mystic Cross & Sacred Symbols",
        sourceNotes: ["32 - Spirituality.md"],
        essence: "Spirituality in the hand is a synthesis rather than a single line: elemental temperament sets the seeker's style, while the Ring of Solomon, line of intuition, mystic cross, puffed first phalanges, and rare sacred marks (fish, lotus, swastika) reveal whether higher consciousness manifests as quiet devotion, philosophical research, compassionate service, or public spiritual mission.",
        readTime: "16 min read",
        aliases: ["spirituality", "adhyatma", "27-adhyatma-spirituality", "ch-27-spirituality", "spirituality-and-mysticism"]
      }
    ]
  }
];

export const ALL_CHAPTERS = BOOK_PARTS.flatMap((part) => part.chapters);

export function getChapterBySlug(slug: string): ChapterMeta | undefined {
  if (!slug) return undefined;
  const s = slug.toLowerCase();
  const clean = s.replace(/^ch-/, '').replace(/^the-/, '').replace(/^\d+-/, '');

  return ALL_CHAPTERS.find((ch) => {
    if (ch.id.toLowerCase() === s) return true;
    if (ch.code.toLowerCase() === s) return true;
    if (ch.aliases?.some((a) => a.toLowerCase() === s)) return true;

    const chClean = ch.id.toLowerCase().replace(/^ch-/, '').replace(/^the-/, '').replace(/^\d+-/, '');
    if (chClean === clean) return true;
    if (chClean.includes(clean) || clean.includes(chClean)) return true;
    return false;
  });
}

export function getAdjacentChapters(slug: string): { prev?: ChapterMeta; next?: ChapterMeta } {
  const current = getChapterBySlug(slug);
  if (!current) return {};
  const index = ALL_CHAPTERS.findIndex((ch) => ch.id === current.id);
  if (index === -1) return {};
  return {
    prev: index > 0 ? ALL_CHAPTERS[index - 1] : undefined,
    next: index < ALL_CHAPTERS.length - 1 ? ALL_CHAPTERS[index + 1] : undefined,
  };
}
