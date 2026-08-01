/**
 * Generate the social brand assets into brand/ from the site's own identity:
 * the neobrutal card system, the yellow wordmark chip, the light-theme
 * palette, Space Grotesk and JetBrains Mono, and the four-subspaces hero art.
 *
 *   node scripts/generate-social.mjs
 *
 * Outputs (exact platform sizes):
 * Every asset is laid out at the platform's display size and rendered at 2x
 * device pixels, so it stays sharp on retina screens after the platform
 * scales it.
 *
 *   brand/logo.png            2048 x 2048 for a 1024 avatar; circle-crop safe
 *   brand/cover-x.png         3000 x 1000 for the 1500 x 500 X header
 *   brand/cover-linkedin.png  2256 x  382 for the 1128 x 191 LinkedIn
 *                             COMPANY-page banner (the square page logo
 *                             overlaps its lower left, so that corner stays
 *                             empty)
 *   brand/cover-instagram.png 2160 x 2160 for a 1080 Instagram square
 */
import { chromium } from 'playwright';
import { readFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const OUT = resolve(ROOT, 'brand');
mkdirSync(OUT, { recursive: true });

// Light-theme tokens from src/styles/global.css
const C = {
  paper: '#fffdf7',
  ink: '#141414',
  inkMuted: '#5f5f5f',
  accent: '#2e4fe8',
  part1: '#b8ff9f', // C(A) green
  part2: '#a6faff', // N(A) cyan
  part4: '#ffdd57', // wordmark yellow
  part5: '#ffb443', // C(A^T) orange
  part6: '#c4a1ff', // N(A^T) purple
};

// Fonts inlined as data URLs: setContent pages live on about:blank, where
// file:// font requests never resolve.
const font64 = (p) => readFileSync(resolve(ROOT, 'node_modules', p)).toString('base64');
const grotesk = font64(
  '@fontsource-variable/space-grotesk/files/space-grotesk-latin-wght-normal.woff2',
);
const mono = font64('@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2');
const heroArt = readFileSync(resolve(ROOT, 'src/assets/hero-art.svg'), 'utf8');

const base = `
  @font-face {
    font-family: 'Space Grotesk';
    src: url(data:font/woff2;base64,${grotesk}) format('woff2-variations');
    font-weight: 300 700;
  }
  @font-face {
    font-family: 'JetBrains Mono';
    src: url(data:font/woff2;base64,${mono}) format('woff2-variations');
    font-weight: 100 800;
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 100%; height: 100%; }
  body {
    background: ${C.paper};
    font-family: 'Space Grotesk', sans-serif;
    color: ${C.ink};
    overflow: hidden;
  }
  .chip {
    display: inline-block;
    background: ${C.part4};
    color: ${C.ink};
    font-weight: 700;
    line-height: 1;
    letter-spacing: -0.02em;
  }
  .label {
    font-family: 'JetBrains Mono', monospace;
    font-weight: 500;
    text-transform: uppercase;
    color: ${C.inkMuted};
  }
  .art svg { display: block; width: 100%; height: auto; }
`;

// The four subspace swatches, in the order the Big Picture draws them:
// row space, null space, column space, left null space.
const swatches = (s, b, sh) =>
  [C.part5, C.part2, C.part1, C.part6]
    .map(
      (c) =>
        `<span style="display:inline-block;width:${s}px;height:${s}px;background:${c};border:${b}px solid ${C.ink};box-shadow:${sh}px ${sh}px 0 ${C.ink}"></span>`,
    )
    .join('');

const pages = {
  'logo.png': {
    w: 1024,
    h: 1024,
    html: `
      <div style="height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:56px">
        <div class="chip" style="font-size:148px;padding:44px 56px;border:12px solid ${C.ink};box-shadow:26px 26px 0 ${C.ink}">linearly</div>
        <div style="display:flex;gap:30px;margin-left:-12px">${swatches(62, 8, 12)}</div>
      </div>`,
  },
  'cover-x.png': {
    w: 1500,
    h: 500,
    html: `
      <div style="height:100%;display:flex;align-items:center;justify-content:space-between;padding:0 84px;border-bottom:10px solid ${C.ink}">
        <div>
          <div class="chip" style="font-size:64px;padding:20px 26px;border:5px solid ${C.ink};box-shadow:12px 12px 0 ${C.ink}">linearly</div>
          <p style="margin-top:44px;font-size:40px;font-weight:600;line-height:1.28">Linear algebra,<br>drawn until it's obvious.</p>
          <p class="label" style="margin-top:26px;font-size:19px;letter-spacing:0.14em">linearly.space &nbsp;/&nbsp; free, for everyone</p>
        </div>
        <div class="art" style="width:620px;flex:none">${heroArt}</div>
      </div>`,
  },
  'cover-linkedin.png': {
    w: 1128,
    h: 191,
    html: `
      <div style="height:100%;display:flex;align-items:center;justify-content:space-between;padding:0 44px 0 240px;border-bottom:6px solid ${C.ink}">
        <div>
          <div style="display:flex;align-items:center;gap:26px">
            <div class="chip" style="font-size:34px;padding:11px 14px;border:3px solid ${C.ink};box-shadow:7px 7px 0 ${C.ink}">linearly</div>
            <p style="font-size:22px;font-weight:600;line-height:1.25">Linear algebra,<br>drawn until it's obvious.</p>
          </div>
          <p class="label" style="margin-top:16px;font-size:12px;letter-spacing:0.14em">linearly.space &nbsp;/&nbsp; free, for everyone</p>
        </div>
        <div class="art" style="width:260px;flex:none">${heroArt}</div>
      </div>`,
  },
  'cover-instagram.png': {
    w: 1080,
    h: 1080,
    html: `
      <div style="height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:44px;border:14px solid ${C.ink}">
        <div class="chip" style="font-size:88px;padding:26px 34px;border:7px solid ${C.ink};box-shadow:16px 16px 0 ${C.ink}">linearly</div>
        <p style="font-size:44px;font-weight:600;text-align:center;max-width:15em;line-height:1.3">Linear algebra,<br>drawn until it's obvious.</p>
        <div class="art" style="width:660px">${heroArt}</div>
        <p class="label" style="font-size:22px;letter-spacing:0.14em">linearly.space &nbsp;/&nbsp; free, for everyone</p>
      </div>`,
  },
};

const browser = await chromium.launch();
for (const [name, { w, h, html }] of Object.entries(pages)) {
  const page = await browser.newPage({
    viewport: { width: w, height: h },
    deviceScaleFactor: 2,
  });
  await page.setContent(`<!doctype html><style>${base}</style><body>${html}</body>`, {
    waitUntil: 'networkidle',
  });
  await page.screenshot({ path: resolve(OUT, name) });
  await page.close();
  console.log('ok  ', name, `${w * 2}x${h * 2} (for ${w}x${h})`);
}
await browser.close();
