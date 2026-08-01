/**
 * Render .excalidraw sources through Excalidraw's own export engine, so a
 * source can be proven to match the figure it mirrors. Usage:
 *
 *   node scripts/render-excalidraw.mjs drawings/lecture-05/fig-1-*.excalidraw
 *   node scripts/render-excalidraw.mjs --all
 *
 * PNGs land next to nothing in the repo: they go to OUT (default
 * /tmp/excalidraw-renders). The renderer runs @excalidraw/utils' exportToSvg
 * inside Chromium, which is exactly what the excalidraw.com export produces.
 */
import { chromium } from 'playwright';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { globSync } from 'node:fs';
import { basename, dirname, resolve } from 'node:path';

const OUT = process.env.OUT ?? '/tmp/excalidraw-renders';
const args = process.argv.slice(2);
const files = args.includes('--all')
  ? globSync('drawings/**/*.excalidraw')
  : args;

if (files.length === 0) {
  console.error('no input files');
  process.exit(1);
}
mkdirSync(OUT, { recursive: true });

import { spawn } from 'node:child_process';

const PORT = 4412;
const server = spawn('python3', ['-m', 'http.server', String(PORT), '-d', resolve('.')]);
await new Promise((r) => setTimeout(r, 900));

const browser = await chromium.launch();
const page = await browser.newPage({ deviceScaleFactor: 2 });
page.on('pageerror', (e) => console.error('pageerror:', String(e).slice(0, 200)));
await page.goto(`http://localhost:${PORT}/scripts/excalidraw-harness.html`);
await page.waitForFunction('window.ready === true', null, { timeout: 30000 });

for (const file of files) {
  const scene = JSON.parse(readFileSync(file, 'utf8'));
  const name = basename(dirname(file)) + '--' + basename(file, '.excalidraw');
  try {
    const dims = await page.evaluate(async (elements) => {
      const svg = await window.XU.exportToSvg({
        elements,
        appState: { exportBackground: true, viewBackgroundColor: '#fffdf7', exportPadding: 8 },
        files: {},
      });
      document.body.innerHTML = '';
      document.body.style.margin = '0';
      document.body.appendChild(svg);
      return { w: Number(svg.getAttribute('width')), h: Number(svg.getAttribute('height')) };
    }, scene.elements);
    await page.setViewportSize({ width: Math.ceil(dims.w) + 4, height: Math.ceil(dims.h) + 4 });
    await page.waitForTimeout(120);
    await page.screenshot({ path: `${OUT}/${name}.png` });
    console.log('ok  ', name, `${dims.w}x${dims.h}`);
  } catch (e) {
    console.log('FAIL', name, String(e).slice(0, 140));
  }
}
await browser.close();
server.kill();
