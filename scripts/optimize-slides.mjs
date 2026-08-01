#!/usr/bin/env node
/**
 * Slide pipeline, step 2 of 2.
 * Step 1 (macOS, one-off per deck): export the Keynote deck to per-slide PNGs —
 *   see scripts/export-keynote.sh
 * Step 2 (this script): normalize names to 1.webp … N.webp, resize to 1600px
 *   wide, encode as WebP, and drop them into public/slides/<deck>/.
 *
 * Usage: node scripts/optimize-slides.mjs <png-dir> <deck-slug>
 */
import { readdir, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';

const [pngDir, deck] = process.argv.slice(2);
if (!pngDir || !deck) {
  console.error('Usage: node scripts/optimize-slides.mjs <png-dir> <deck-slug>');
  process.exit(1);
}

const outDir = join(import.meta.dirname, '..', 'public', 'slides', deck);
await mkdir(outDir, { recursive: true });

const files = (await readdir(pngDir))
  .filter((f) => f.toLowerCase().endsWith('.png'))
  .sort(); // Keynote exports as <name>.001.png … — lexicographic order is slide order

let n = 0;
for (const file of files) {
  n += 1;
  const out = join(outDir, `${n}.webp`);
  await sharp(join(pngDir, file))
    .resize({ width: 1600, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(out);
}

console.log(`✓ ${deck}: ${n} slides → ${outDir}`);
