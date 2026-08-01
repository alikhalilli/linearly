#!/usr/bin/env node
/**
 * Hero artwork: Strang's Big Picture, the four fundamental subspaces.
 *
 * Construction follows the textbook figure. Each subspace is a true
 * parallelogram spanned by two vectors from its origin vertex, so the
 * row space and null space visibly grow out of the same point (the origin
 * of R^n), and the column space and left null space out of the origin of
 * R^m. A carries x to Ax across the top; the null space collapses along
 * the dashed line to the zero vector, which sits exactly at the origin
 * of R^m.
 *
 * Deterministic. Plane colors are fixed; structural ink uses currentColor.
 * Output: src/assets/hero-art.svg
 */
import { writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';

let seed = 1806;
const rand = () => {
  seed = (seed * 48271) % 2147483647;
  return seed / 2147483647;
};

const OL = { x: 330, y: 300 }; // origin of R^n
const OR = { x: 590, y: 300 }; // origin of R^m

// Parallelogram = origin + s·u + t·v, s,t ∈ [0,1].
const U = 238; // long axis
const V = { x: 56, y: 116 }; // short axis

const planes = [
  {
    id: 'ra', color: '#ff8c42', o: OL, u: { x: -U, y: -64 }, v: { x: -V.x, y: -V.y },
    label: 'R(A)', sub: 'row space', dim: 'dim r', labelAt: [52, 70],
  },
  {
    id: 'na', color: '#5b7bff', o: OL, u: { x: -U, y: 64 }, v: { x: -V.x, y: V.y },
    label: 'N(A)', sub: 'null space', dim: 'dim n − r', labelAt: [52, 548],
  },
  {
    id: 'ca', color: '#3ecf6e', o: OR, u: { x: U, y: -64 }, v: { x: V.x, y: -V.y },
    label: 'C(A)', sub: 'column space', dim: 'dim r', labelAt: [888, 70], anchor: 'end',
  },
  {
    id: 'nat', color: '#b07fff', o: OR, u: { x: U, y: 64 }, v: { x: V.x, y: V.y },
    label: 'N(Aᵀ)', sub: 'left null space', dim: 'dim m − r', labelAt: [888, 548], anchor: 'end',
  },
];

const mono = 'ui-monospace, Menlo, monospace';
const out = [];
const defs = [];

for (const p of planes) {
  const A = p.o;
  const B = { x: p.o.x + p.u.x, y: p.o.y + p.u.y };
  const C = { x: p.o.x + p.u.x + p.v.x, y: p.o.y + p.u.y + p.v.y };
  const D = { x: p.o.x + p.v.x, y: p.o.y + p.v.y };
  const pts = `${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y} ${D.x},${D.y}`;

  defs.push(`<clipPath id="clip-${p.id}"><polygon points="${pts}"/></clipPath>`);

  out.push(
    `<polygon points="${pts}" fill="${p.color}" fill-opacity="0.13" stroke="${p.color}" stroke-width="2.5" stroke-linejoin="round"/>`,
  );

  // Glyph texture, clipped to the parallelogram.
  const xs = [A.x, B.x, C.x, D.x];
  const ys = [A.y, B.y, C.y, D.y];
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  out.push(`<g clip-path="url(#clip-${p.id})">`);
  for (let y = minY + 18; y < maxY - 6; y += 16) {
    let line = '';
    const cols = Math.ceil((maxX - minX) / 16);
    for (let c = 0; c < cols; c++) {
      const t = rand();
      line += t < 0.66 ? '·' : t < 0.82 ? '0' : '1';
    }
    const fade = 0.35 + 0.45 * Math.abs(Math.sin(y * 0.11));
    out.push(
      `<text x="${minX + 10}" y="${y}" fill="${p.color}" opacity="${fade.toFixed(2)}" font-family="${mono}" font-size="12" letter-spacing="7">${line}</text>`,
    );
  }
  out.push('</g>');

  // Label block, clear of the plane. Right-side blocks mirror the left.
  const [lx, ly] = p.labelAt;
  const anchor = p.anchor ? ` text-anchor="${p.anchor}"` : '';
  out.push(
    `<text x="${lx}" y="${ly}" fill="${p.color}" font-family="${mono}" font-size="26" font-weight="700"${anchor}>${p.label}</text>`,
    `<text x="${lx}" y="${ly + 22}" fill="${p.color}" opacity="0.85" font-family="${mono}" font-size="13"${anchor}>${p.sub}</text>`,
    `<text x="${lx}" y="${ly + 42}" fill="currentColor" opacity="0.6" font-family="${mono}" font-size="13"${anchor}>${p.dim}</text>`,
  );
}

// Ambient spaces, centered beside each pair.
out.push(
  `<text x="252" y="92" fill="currentColor" opacity="0.9" font-family="${mono}" font-size="21" font-weight="700" text-anchor="middle">ℝⁿ</text>`,
  `<text x="668" y="92" fill="currentColor" opacity="0.9" font-family="${mono}" font-size="21" font-weight="700" text-anchor="middle">ℝᵐ</text>`,
);

// Orthogonality marks in the wedge between each pair.
out.push(
  `<text x="256" y="306" fill="currentColor" opacity="0.8" font-family="${mono}" font-size="19" text-anchor="middle">⊥</text>`,
  `<text x="668" y="306" fill="currentColor" opacity="0.8" font-family="${mono}" font-size="19" text-anchor="middle">⊥</text>`,
);

// Halos keep the vector points readable over the glyph texture.
out.push(
  `<circle cx="196" cy="224" r="15" fill="var(--color-paper, #fff)" opacity="0.8"/>`,
  `<circle cx="712" cy="224" r="17" fill="var(--color-paper, #fff)" opacity="0.8"/>`,
  `<circle cx="196" cy="378" r="15" fill="var(--color-paper, #fff)" opacity="0.8"/>`,
);

// x in the row space maps to Ax in the column space.
// The head is constructed, not eyeballed: the curve ends AT the tip, the tip
// sits on the Ax dot's edge along the end tangent (unit (0.814, 0.581) from
// the last control point), and the barbs open ±25° back from that tangent.
out.push(
  `<circle cx="196" cy="228" r="4" fill="currentColor"/>`,
  `<text x="188" y="214" fill="currentColor" font-family="${mono}" font-size="15" font-style="italic">x</text>`,
  `<path d="M204,224 C 330,128 570,128 705.5,224.8" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>`,
  `<path d="M705.5,224.8 l-11.8,-2.2 M705.5,224.8 l-5.9,-10.5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>`,
  `<circle cx="710" cy="228" r="4" fill="currentColor"/>`,
  `<text x="702" y="212" fill="currentColor" font-family="${mono}" font-size="15" font-style="italic">Ax</text>`,
  `<text x="453" y="136" fill="currentColor" opacity="0.95" font-family="${mono}" font-size="16" text-anchor="middle">x ↦ Ax</text>`,
);

// A second, fainter mapping: many vectors travel the same road.
out.push(
  `<path d="M240,262 C 350,200 552,200 662,256" fill="none" stroke="currentColor" stroke-width="1.4" stroke-dasharray="2 7" stroke-linecap="round" opacity="0.5"/>`,
);

// The null space collapses to the origin of R^m.
// Same construction as the black arrow. The zero circle (r 13, drawn later
// with opaque paper fill) must not swallow the head, so the tip lands on the
// circle's outer edge, 15 from its center along the end tangent
// (unit (0.980, -0.198)), aimed at the 0.
out.push(
  `<circle cx="196" cy="380" r="4" fill="#5b7bff"/>`,
  `<text x="184" y="366" fill="#5b7bff" font-family="${mono}" font-size="15" font-style="italic">xₙ</text>`,
  `<path d="M204,378 C 340,350 480,322 575.3,303" fill="none" stroke="#5b7bff" stroke-width="2.2" stroke-dasharray="8 6" stroke-linecap="round"/>`,
  `<path d="M575.3,303 l-11.7,-2.8 M575.3,303 l-9.7,7.1" fill="none" stroke="#5b7bff" stroke-width="2.2" stroke-linecap="round"/>`,
  `<text x="424" y="320" fill="#5b7bff" opacity="0.95" font-family="${mono}" font-size="15" text-anchor="middle">xₙ ↦ 0</text>`,
);

// Origins. The zero vector of R^m is where the null space lands.
out.push(
  `<circle cx="${OL.x}" cy="${OL.y}" r="4" fill="currentColor"/>`,
  `<circle cx="${OR.x}" cy="${OR.y}" r="13" fill="var(--color-paper, #fff)" stroke="currentColor" stroke-width="2.2"/>`,
  `<text x="${OR.x}" y="${OR.y + 5.5}" fill="currentColor" font-family="${mono}" font-size="15" font-weight="700" text-anchor="middle">0</text>`,
);

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="26 46 872 556" role="img" aria-label="The four fundamental subspaces. In R^n, the row space and null space grow out of the same origin. In R^m, the column space and left null space. A carries x in the row space to Ax in the column space, and sends the null space to zero.">
<defs>
${defs.join('\n')}
</defs>
${out.join('\n')}
</svg>`;

const dir = join(import.meta.dirname, '..', 'src', 'assets');
await mkdir(dir, { recursive: true });
await writeFile(join(dir, 'hero-art.svg'), svg);
console.log('hero-art.svg written:', (svg.length / 1024).toFixed(1), 'KB');
