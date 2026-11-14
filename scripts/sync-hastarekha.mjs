import fs from 'fs';
import path from 'path';
import ts from 'typescript';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const HASTAREKHA_DIR = process.env.HASTAREKHA_DIR || '/Users/anurag/pworkspace/hastarekha';

console.log('🔄 Checking Hastarekha Synchronization...');
console.log(`   Hastarekha Repo: ${HASTAREKHA_DIR}`);
console.log(`   My-Notes Root:   ${ROOT_DIR}\n`);

if (!fs.existsSync(HASTAREKHA_DIR)) {
  console.error(`❌ Hastarekha directory not found at: ${HASTAREKHA_DIR}`);
  process.exit(1);
}

function syncFolder(srcDir, destDir, label) {
  if (!fs.existsSync(srcDir)) return { synced: 0 };
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

  let count = 0;
  const files = fs.readdirSync(srcDir, { recursive: true });

  for (const rel of files) {
    const srcFile = path.join(srcDir, rel);
    const destFile = path.join(destDir, rel);

    try {
      const srcStat = fs.statSync(srcFile);
      if (srcStat.isDirectory()) {
        if (!fs.existsSync(destFile)) fs.mkdirSync(destFile, { recursive: true });
        continue;
      }

      let shouldCopy = false;
      if (!fs.existsSync(destFile)) {
        shouldCopy = true;
      } else {
        const destStat = fs.statSync(destFile);
        if (srcStat.mtimeMs > destStat.mtimeMs + 1000) {
          shouldCopy = true;
        }
      }

      if (shouldCopy) {
        fs.copyFileSync(srcFile, destFile);
        count++;
      }
    } catch {}
  }

  if (count > 0) {
    console.log(`  ✓ Synced ${count} file(s) in ${label}`);
  } else {
    console.log(`  ✓ ${label} is already up to date`);
  }
  return { synced: count };
}

// 1. Chapters
syncFolder(
  path.join(HASTAREKHA_DIR, 'chapters'),
  path.join(ROOT_DIR, 'content', 'hastarekha', 'chapters'),
  'Chapters (Hastarekha -> My-Notes)'
);

// 2. Notes
syncFolder(
  path.join(HASTAREKHA_DIR, 'notes'),
  path.join(ROOT_DIR, 'content', 'hastarekha', 'notes'),
  'Notes (Hastarekha -> My-Notes)'
);

// 3. Images
syncFolder(
  path.join(HASTAREKHA_DIR, 'public', 'lecture-notes-images'),
  path.join(ROOT_DIR, 'public', 'lecture-notes-images'),
  'Lecture Images (Hastarekha -> My-Notes)'
);

// 4. Learning Decks (Transpile TS to JSON)
const learningDir = path.join(HASTAREKHA_DIR, 'src', 'data', 'learning');
if (fs.existsSync(learningDir)) {
  const tsFiles = fs.readdirSync(learningDir).filter(f => f.endsWith('.ts') && f !== 'index.ts');
  let deckCount = 0;

  for (const file of tsFiles) {
    try {
      const tsCode = fs.readFileSync(path.join(learningDir, file), 'utf8');
      const jsCode = ts.transpileModule(tsCode, {
        compilerOptions: { module: ts.ModuleKind.CommonJS }
      }).outputText;

      const m = { exports: {} };
      const fn = new Function('exports', 'module', 'require', jsCode);
      fn(m.exports, m, (mod) => {
        if (mod.startsWith('@/')) return {};
        return {};
      });

      const deck = Object.values(m.exports)[0];
      if (deck) {
        const slug = file.replace('.ts', '');
        if (deck.flashcards) {
          fs.writeFileSync(
            path.join(ROOT_DIR, 'content', 'hastarekha', 'flashcards', `${slug}.json`),
            JSON.stringify({
              id: slug,
              slug,
              title: deck.lectureTitle || slug,
              summary: deck.summary || '',
              cards: deck.flashcards,
            }, null, 2)
          );
        }
        if (deck.quizzes) {
          fs.writeFileSync(
            path.join(ROOT_DIR, 'content', 'hastarekha', 'quizzes', `${slug}.json`),
            JSON.stringify({
              id: slug,
              slug,
              title: deck.lectureTitle || slug,
              summary: deck.summary || '',
              questions: deck.quizzes,
            }, null, 2)
          );
        }
        deckCount++;
      }
    } catch (e) {
      // Ignore
    }
  }
  console.log(`  ✓ Synced ${deckCount} Curated Learning Decks (Quizzes & Flashcards)`);
}

console.log('\n✨ Hastarekha & My-Notes synchronization complete!\n');

