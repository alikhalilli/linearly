/**
 * Export .excalidraw sources 1:1 into the lecture MDX, keeping the hand-drawn
 * Excalidraw look on the site. The sources are the single truth; this script
 * renders each one with Excalidraw's own export engine and splices the result
 * over the corresponding <svg slot="drawing"> block.
 *
 *   node scripts/export-figures.mjs src/content/lectures/lecture-05.mdx
 *   node scripts/export-figures.mjs --all
 *
 * What the post-processing does, and why:
 * - strips the per-figure embedded font (the site hosts one shared Virgil
 *   subset; embedded data: fonts would also violate the CSP),
 * - maps the light-theme palette hexes to the theme CSS variables so dark
 *   mode works, with ink (#141414/#1e1e1e) becoming currentColor,
 * - protects chip-mode text (digits sitting ON a full-strength part fill):
 *   those keep literal dark ink, exactly like the Callout convention,
 * - carries over each old svg's aria-label and its min-width floor.
 */
import { chromium } from 'playwright';
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { basename } from 'node:path';

const PART_HEX = {
  '#2e4fe8': 'var(--color-accent)',
  '#c75000': 'var(--color-stroke-warm)',
  '#0e7a3d': 'var(--color-stroke-green)',
  '#b8ff9f': 'var(--color-part1)',
  '#a6faff': 'var(--color-part2)',
  '#ffa6f6': 'var(--color-part3)',
  '#ffdd57': 'var(--color-part4)',
  '#ffb443': 'var(--color-part5)',
  '#c4a1ff': 'var(--color-part6)',
};
const FILL_HEXES = new Set(Object.keys(PART_HEX).slice(3));
const SENTINEL = '#141315';

const args = process.argv.slice(2);
const mdxFiles = args.includes('--all')
  ? readdirSync('src/content/lectures')
      .filter((f) => f.endsWith('.mdx'))
      .map((f) => `src/content/lectures/${f}`)
  : args;

// Random port + readiness poll, so back-to-back runs never race a dying
// predecessor on a fixed port.
const PORT = 4600 + Math.floor(Math.random() * 300);
const server = spawn('python3', ['-m', 'http.server', String(PORT), '-d', '.']);
for (let i = 0; i < 40; i++) {
  try {
    const r = await fetch(`http://localhost:${PORT}/scripts/excalidraw-harness.html`);
    if (r.ok) break;
  } catch {
    /* not up yet */
  }
  await new Promise((r) => setTimeout(r, 150));
}
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(`http://localhost:${PORT}/scripts/excalidraw-harness.html`);
await page.waitForFunction('window.ready === true', null, { timeout: 30000 });

/** Chip-text detection: a #141414 text whose centre sits inside a
 *  full-opacity part-colour fill keeps dark ink. Marked with a sentinel
 *  before export so it survives the ink->currentColor mapping. */
function markChipText(elements) {
  const chips = elements.filter(
    (el) =>
      (el.type === 'rectangle' || el.type === 'ellipse') &&
      FILL_HEXES.has((el.backgroundColor ?? '').toLowerCase()) &&
      (el.opacity ?? 100) >= 99,
  );
  for (const el of elements) {
    if (el.type !== 'text') continue;
    const ink = (el.strokeColor ?? '').toLowerCase();
    if (ink !== '#141414' && ink !== '#1e1e1e') continue;
    // Stored widths are estimates and drift on short glyphs, so bound the
    // width by glyph count and require the left edge inside the fill too.
    const estWidth = Math.min(el.width ?? 0, el.text.length * el.fontSize * 0.8);
    const cx = el.x + estWidth / 2;
    const cy = el.y + (el.height ?? 0) / 2;
    if (
      chips.some(
        (c) =>
          el.x >= c.x - 2 &&
          cx >= c.x &&
          cx <= c.x + c.width &&
          cy >= c.y &&
          cy <= c.y + c.height,
      )
    ) {
      el.strokeColor = SENTINEL;
    }
  }
  return elements;
}

function postProcess(svg, { ariaLabel, minWidth }) {
  // strip the embedded font block
  svg = svg.replace(/<style class="style-fonts">[\s\S]*?<\/style>/, '');
  svg = svg.replace(/<metadata><\/metadata>/, '');
  svg = svg.replace(/<!-- svg-source:excalidraw -->/, '');
  // palette -> theme vars; ink -> currentColor; chips restored to dark ink
  for (const [hex, cssVar] of Object.entries(PART_HEX)) {
    svg = svg.replaceAll(hex, cssVar);
  }
  svg = svg.replaceAll('#141414', 'currentColor').replaceAll('#1e1e1e', 'currentColor');
  svg = svg.replaceAll(SENTINEL, '#141414');
  // MDX reads bare braces as JSX expressions; escape them as entities.
  svg = svg.replaceAll('{', '&#123;').replaceAll('}', '&#125;');
  // A single-line svg parses as INLINE content in MDX, which merges it into
  // a paragraph and breaks Astro's named slot. Multi-line keeps it flow.
  svg = svg.replaceAll('><', '>\n<');
  // house attributes on the root tag
  const style = `max-width:100%;height:auto${minWidth ? `;min-width:${minWidth}` : ''}`;
  svg = svg.replace(
    /<svg version="1.1" xmlns="http:\/\/www.w3.org\/2000\/svg" viewBox="([^"]+)" width="([\d.]+)" height="([\d.]+)">/,
    (_m, vb, w) =>
      `<svg slot="drawing" viewBox="${vb}" width="${Math.round(Number(w))}" role="img" aria-label="${ariaLabel}" style="${style}">`,
  );
  return svg;
}

for (const mdx of mdxFiles) {
  const lecture = basename(mdx, '.mdx'); // lecture-NN
  const dir = `drawings/${lecture}`;
  if (!existsSync(dir)) {
    console.log('skip', mdx, '(no drawings dir)');
    continue;
  }
  const sources = readdirSync(dir)
    .filter((f) => f.endsWith('.excalidraw'))
    .sort((a, b) => Number(a.match(/fig-(\d+)/)[1]) - Number(b.match(/fig-(\d+)/)[1]));

  let text = readFileSync(mdx, 'utf8');
  const svgBlocks = [...text.matchAll(/<svg slot="drawing"[\s\S]*?<\/svg>/g)];
  if (svgBlocks.length !== sources.length) {
    console.log(`FAIL ${mdx}: ${svgBlocks.length} svg blocks vs ${sources.length} sources`);
    continue;
  }

  let out = '';
  let cursor = 0;
  for (let i = 0; i < svgBlocks.length; i++) {
    const block = svgBlocks[i];
    const old = block[0];
    const ariaLabel = (old.match(/aria-label="([^"]*)"/) ?? [null, ''])[1];
    const minWidth = (old.match(/min-width:(\d+px)/) ?? [null, null])[1];
    const scene = JSON.parse(readFileSync(`${dir}/${sources[i]}`, 'utf8'));
    markChipText(scene.elements);
    const exported = await page.evaluate(async (elements) => {
      const svg = await window.XU.exportToSvg({
        elements,
        appState: { exportBackground: false, exportPadding: 8 },
        files: {},
      });
      // Animation annotations. Excalidraw emits one top-level <g> per element,
      // in element order, which is the order the figure was authored: the
      // teaching order. Stamp each group with its sequence number (an element
      // can override via customData.seq in the source) and normalize stroked
      // paths with pathLength=1 so CSS can draw them on without measuring.
      // Paths that already carry a dash pattern are left alone: pathLength
      // rescales dash units and would render dashed strokes as solid.
      const live = elements.filter((el) => !el.isDeleted);
      const groups = [...svg.children].filter((c) => c.tagName === 'g');
      const paired = groups.length === live.length;
      groups.forEach((g, i) => {
        const seq = paired ? (live[i].customData?.seq ?? i) : i;
        g.setAttribute('data-s', String(seq));
        for (const p of g.querySelectorAll('path')) {
          const stroke = p.getAttribute('stroke');
          const dashed =
            p.hasAttribute('stroke-dasharray') ||
            (p.getAttribute('style') || '').includes('dash');
          if (stroke && stroke !== 'none' && !dashed) p.setAttribute('pathLength', '1');
        }
      });
      return svg.outerHTML;
    }, scene.elements);
    const processed = postProcess(exported, { ariaLabel, minWidth });
    out += text.slice(cursor, block.index) + processed;
    cursor = block.index + old.length;
  }
  out += text.slice(cursor);
  writeFileSync(mdx, out);
  console.log('ok  ', mdx, `(${svgBlocks.length} figures)`);
}

await browser.close();
server.kill();
