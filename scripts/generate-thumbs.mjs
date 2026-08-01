#!/usr/bin/env node
/**
 * Generates one topic thumbnail per lecture: small SVG drawings in the same
 * visual language as the hero art. Ink uses currentColor so every thumbnail
 * works in both themes; each drawing leans on its course part's color.
 *
 * Output: src/assets/thumbs/<lecture-id>.svg  (inlined by TocRow)
 */
import { writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';

const W = 264;
const H = 152;
const mono = 'ui-monospace, Menlo, monospace';

// Stronger part colors that read on both paper and near-black.
const C = {
  green: '#3fb95a',
  cyan: '#1fb0bd',
  pink: '#d95ec9',
  yellow: '#d9a80c',
  orange: '#f08c1f',
  purple: '#9a6cf5',
  blue: '#5b7bff',
};

const ink = 'currentColor';
const arrow = (x1, y1, x2, y2, color = ink, w = 2.5, dash = '') => {
  const a = Math.atan2(y2 - y1, x2 - x1);
  const h = 9;
  const p1 = `${x2 - h * Math.cos(a - 0.42)},${y2 - h * Math.sin(a - 0.42)}`;
  const p2 = `${x2 - h * Math.cos(a + 0.42)},${y2 - h * Math.sin(a + 0.42)}`;
  return (
    `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${w}"${dash ? ` stroke-dasharray="${dash}"` : ''} stroke-linecap="round"/>` +
    `<polyline points="${p1} ${x2},${y2} ${p2}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`
  );
};
const txt = (x, y, s, color = ink, size = 13, extra = '') =>
  `<text x="${x}" y="${y}" fill="${color}" font-family="${mono}" font-size="${size}" ${extra}>${s}</text>`;
const cells = (x, y, cw, ch, rows, colsArr, fill, op = 0.9) => {
  let s = '';
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < colsArr; c++)
      s += `<rect x="${x + c * cw}" y="${y + r * ch}" width="${cw - 3}" height="${ch - 3}" rx="2" fill="${fill}" opacity="${op}"/>`;
  return s;
};

const thumbs = {
  // 00 · How do machines learn — a Turing tape, head centered on its cell.
  'lecture-00': () => {
    let s = '';
    const vals = ['0', '1', '1', '0', '1', '1', '0'];
    for (let i = 0; i < 7; i++) {
      s += `<rect x="${22 + i * 32}" y="58" width="28" height="36" rx="4" fill="${i === 3 ? C.green : 'none'}" fill-opacity="${i === 3 ? 0.15 : 0}" stroke="${i === 3 ? C.green : ink}" stroke-width="2.2" opacity="${i === 3 ? 1 : 0.55}"/>`;
      s += txt(31 + i * 32, 82, vals[i], i === 3 ? C.green : ink, 15);
    }
    s += `<polyline points="124,40 136,52 148,40" fill="none" stroke="${C.green}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>`;
    s += arrow(96, 122, 132, 122, ink, 2.2);
    s += txt(142, 126, 'read, write, move', ink, 11);
    return s;
  },

  // 01 · Vectors — the walk cv + dw, with the dashed leg truly parallel to w.
  'lecture-01': () => {
    const O = [36, 126];
    const vTip = [96, 96];
    const wTip = [92, 68];
    const dest = [163, 26]; // vTip + 1.2 · w
    let s = `<line x1="${O[0]}" y1="${O[1]}" x2="238" y2="${O[1]}" stroke="${ink}" stroke-width="2"/>`;
    s += `<line x1="${O[0]}" y1="${O[1]}" x2="${O[0]}" y2="18" stroke="${ink}" stroke-width="2"/>`;
    s += arrow(O[0], O[1], vTip[0], vTip[1], C.green, 3);
    s += arrow(O[0], O[1], wTip[0], wTip[1], C.orange, 3);
    s += `<line x1="${vTip[0]}" y1="${vTip[1]}" x2="${dest[0]}" y2="${dest[1]}" stroke="${ink}" stroke-width="1.8" stroke-dasharray="4 5"/>`;
    s += `<circle cx="${dest[0]}" cy="${dest[1]}" r="4.5" fill="${ink}"/>`;
    s += txt(80, 118, 'v', C.green, 13, 'font-style="italic"');
    s += txt(56, 68, 'w', C.orange, 13, 'font-style="italic"');
    s += txt(174, 24, 'cv+dw', ink, 11, 'font-style="italic"');
    return s;
  },

  // 02 · Matrices as transformations — square in, parallelogram out.
  'lecture-02': () => {
    let s = `<rect x="30" y="46" width="60" height="60" fill="${C.green}" fill-opacity="0.15" stroke="${C.green}" stroke-width="2.5" rx="2"/>`;
    s += `<line x1="30" y1="76" x2="90" y2="76" stroke="${C.green}" stroke-width="1.2" opacity="0.6"/>`;
    s += `<line x1="60" y1="46" x2="60" y2="106" stroke="${C.green}" stroke-width="1.2" opacity="0.6"/>`;
    s += arrow(104, 76, 148, 76, ink, 2.5);
    s += txt(118, 66, 'A', ink, 14, 'font-style="italic"');
    s += `<polygon points="162,106 214,106 244,46 192,46" fill="${C.cyan}" fill-opacity="0.15" stroke="${C.cyan}" stroke-width="2.5" stroke-linejoin="round"/>`;
    s += `<line x1="177" y1="76" x2="229" y2="76" stroke="${C.cyan}" stroke-width="1.2" opacity="0.6"/>`;
    s += `<line x1="188" y1="106" x2="218" y2="46" stroke="${C.cyan}" stroke-width="1.2" opacity="0.6"/>`;
    return s;
  },

  // 03 · Tensors — a stack of arrays.
  'lecture-03': () => {
    let s = '';
    for (let k = 2; k >= 0; k--) {
      const o = k * 16;
      s += `<g opacity="${1 - k * 0.28}"><rect x="${58 + o}" y="${34 + o}" width="96" height="72" rx="4" fill="${C.pink}" fill-opacity="0.13" stroke="${C.pink}" stroke-width="2.3"/>`;
      s += cells(66 + o, 42 + o, 27, 19, 3, 3, C.pink, 0.5) + '</g>';
    }
    s += txt(196, 130, '[3,3,3]', ink, 12);
    return s;
  },

  // 04 · Elimination — below the diagonal, zeros. A becomes U.
  'lecture-04': () => {
    let s = '';
    const v = [
      ['a', 'b', 'c'],
      ['0', 'e', 'f'],
      ['0', '0', 'i'],
    ];
    for (let r = 0; r < 3; r++)
      for (let c = 0; c < 3; c++) {
        const zero = v[r][c] === '0';
        s += `<rect x="${64 + c * 42}" y="${24 + r * 34}" width="36" height="28" rx="4" fill="${zero ? 'none' : C.cyan}" fill-opacity="${zero ? 0 : 0.18}" stroke="${zero ? ink : C.cyan}" stroke-width="2" opacity="${zero ? 0.4 : 1}"/>`;
        s += txt(76 + c * 42, 43 + r * 34, v[r][c], zero ? ink : C.cyan, 13, zero ? 'opacity="0.5"' : '');
      }
    s += txt(96, 144, 'A', ink, 13, 'font-style="italic"');
    s += arrow(112, 140, 148, 140, ink, 2.2);
    s += txt(158, 144, 'U', C.cyan, 13, 'font-style="italic"');
    return s;
  },

  // 05 · Multiply — a row meets a column and makes one entry.
  'lecture-05': () => {
    let s = `<rect x="30" y="42" width="66" height="66" rx="4" fill="none" stroke="${ink}" stroke-width="2.2" opacity="0.6"/>`;
    s += `<rect x="30" y="63" width="66" height="20" rx="3" fill="${C.orange}" fill-opacity="0.65"/>`;
    s += `<rect x="112" y="42" width="66" height="66" rx="4" fill="none" stroke="${ink}" stroke-width="2.2" opacity="0.6"/>`;
    s += `<rect x="134" y="42" width="20" height="66" rx="3" fill="${C.cyan}" fill-opacity="0.65"/>`;
    s += txt(190, 82, '=', ink, 16);
    s += `<rect x="208" y="42" width="44" height="66" rx="4" fill="none" stroke="${ink}" stroke-width="2.2" opacity="0.6"/>`;
    s += `<rect x="222" y="63" width="15" height="20" rx="3" fill="${C.green}" stroke="${C.green}" stroke-width="2"/>`;
    return s;
  },

  // 06 · A = LU — the square splits into two triangles.
  'lecture-06': () => {
    let s = txt(30, 84, 'A', ink, 16, 'font-style="italic"');
    s += txt(52, 84, '=', ink, 15);
    s += `<polygon points="74,36 74,116 154,116" fill="${C.cyan}" fill-opacity="0.25" stroke="${C.cyan}" stroke-width="2.5" stroke-linejoin="round"/>`;
    s += txt(88, 104, 'L', C.cyan, 15, 'font-style="italic"');
    s += `<polygon points="162,36 242,36 242,116" fill="${C.orange}" fill-opacity="0.25" stroke="${C.orange}" stroke-width="2.5" stroke-linejoin="round"/>`;
    s += txt(216, 60, 'U', C.orange, 15, 'font-style="italic"');
    return s;
  },

  // 07 · Vector spaces — a subspace holds its origin and its combinations.
  'lecture-07': () => {
    let s = `<rect x="36" y="26" width="192" height="104" rx="6" fill="none" stroke="${ink}" stroke-width="2.2" opacity="0.5"/>`;
    s += `<rect x="60" y="44" width="128" height="70" rx="5" fill="${C.pink}" fill-opacity="0.12" stroke="${C.pink}" stroke-width="2.4"/>`;
    s += arrow(84, 100, 168, 62, C.green, 3);
    s += `<circle cx="84" cy="100" r="3.5" fill="${ink}"/>`;
    s += txt(76, 92, '0', ink, 11);
    s += txt(206, 44, 'ℝⁿ', ink, 13);
    s += txt(68, 62, 'S', C.pink, 13, 'font-style="italic"');
    return s;
  },

  // 7.5 · Null space — Ax = 0.
  'lecture-07-5': () => {
    let s = `<polygon points="40,116 96,60 176,60 120,116" fill="${C.blue}" fill-opacity="0.15" stroke="${C.blue}" stroke-width="2.5" stroke-linejoin="round"/>`;
    s += `<circle cx="104" cy="88" r="4" fill="${C.blue}"/>`;
    s += txt(84, 80, 'xₙ', C.blue, 12, 'font-style="italic"');
    s += arrow(112, 86, 208, 62, C.blue, 2.2, '6 5');
    s += `<circle cx="218" cy="60" r="11" fill="none" stroke="${ink}" stroke-width="2.2"/>`;
    s += txt(214, 65, '0', ink, 13);
    s += txt(150, 124, 'Ax = 0', ink, 12);
    return s;
  },

  // 08 · Complete solution — the null line through 0, shifted by x_p.
  'lecture-08': () => {
    let s = `<line x1="36" y1="118" x2="200" y2="38" stroke="${C.pink}" stroke-width="2.4" stroke-dasharray="7 6"/>`;
    s += `<circle cx="118" cy="78" r="4" fill="${ink}"/>`;
    s += txt(104, 70, '0', ink, 12);
    s += `<line x1="64" y1="132" x2="228" y2="52" stroke="${C.green}" stroke-width="2.8"/>`;
    s += `<circle cx="146" cy="92" r="5" fill="${C.green}"/>`;
    s += txt(154, 108, 'xₚ', C.green, 13, 'font-style="italic"');
    s += txt(46, 42, 'N(A)', C.pink, 12);
    s += txt(180, 132, 'xₚ + xₙ', ink, 12, 'font-style="italic"');
    return s;
  },

  // 09 · The four subspaces — the big picture, miniature.
  'lecture-09': () => {
    const P = (pts, col) =>
      `<polygon points="${pts}" fill="${col}" fill-opacity="0.16" stroke="${col}" stroke-width="2.2" stroke-linejoin="round"/>`;
    let s = P('112,76 52,44 24,64 84,96', C.orange);
    s += P('112,76 52,108 24,88', C.blue);
    s += P('152,76 212,44 240,64 180,96', C.green);
    s += P('152,76 212,108 240,88', C.purple);
    s += arrow(96, 62, 172, 62, ink, 2);
    s += `<circle cx="152" cy="76" r="7" fill="none" stroke="${ink}" stroke-width="1.8"/>`;
    s += txt(122, 130, 'rank r', ink, 12);
    return s;
  },

  // 10 · Orthogonality — two subspaces at a true right angle.
  'lecture-10': () => {
    // Line 1 direction (168,-58); line 2 is its exact perpendicular (58,168).
    const P = [136, 89];
    let s = `<line x1="52" y1="118" x2="220" y2="60" stroke="${C.orange}" stroke-width="3" stroke-linecap="round"/>`;
    s += `<line x1="118" y1="37" x2="154" y2="141" stroke="${C.blue}" stroke-width="3" stroke-linecap="round"/>`;
    const u1 = [9.45, -3.26];
    const u2 = [3.26, 9.45];
    s += `<polyline points="${P[0] + u1[0]},${P[1] + u1[1]} ${P[0] + u1[0] + u2[0]},${P[1] + u1[1] + u2[1]} ${P[0] + u2[0]},${P[1] + u2[1]}" fill="none" stroke="${ink}" stroke-width="2"/>`;
    s += txt(190, 102, 'R(A)', C.orange, 12);
    s += txt(158, 34, 'N(A)', C.blue, 12);
    return s;
  },

  // 11 · Projections — the shadow.
  'lecture-11': () => {
    let s = `<line x1="36" y1="118" x2="236" y2="118" stroke="${ink}" stroke-width="2.2"/>`;
    s += arrow(60, 118, 178, 38, C.yellow, 3);
    s += `<line x1="178" y1="38" x2="178" y2="118" stroke="${ink}" stroke-width="1.8" stroke-dasharray="4 5"/>`;
    s += `<polyline points="168,118 168,108 178,108" fill="none" stroke="${ink}" stroke-width="1.8"/>`;
    s += `<line x1="60" y1="118" x2="178" y2="118" stroke="${C.orange}" stroke-width="5" stroke-linecap="round" opacity="0.9"/>`;
    s += txt(112, 60, 'b', C.yellow, 13, 'font-style="italic"');
    s += txt(112, 138, 'p = Pb', C.orange, 12, 'font-style="italic"');
    return s;
  },

  // 12 · Least squares — the best line through the cloud.
  'lecture-12': () => {
    const pts = [
      [52, 106, -14], [86, 84, 12], [120, 92, -16], [154, 62, 10], [188, 58, -12], [216, 40, 8],
    ];
    let s = `<line x1="36" y1="122" x2="238" y2="30" stroke="${C.yellow}" stroke-width="2.8"/>`;
    for (const [x, y, e] of pts) {
      const ly = 122 - ((x - 36) * 92) / 202;
      s += `<line x1="${x}" y1="${y}" x2="${x}" y2="${ly}" stroke="${ink}" stroke-width="1.5" stroke-dasharray="3 4" opacity="0.65"/>`;
      s += `<circle cx="${x}" cy="${y}" r="4" fill="${C.cyan}"/>`;
    }
    return s;
  },

  // 13 · Gram-Schmidt — skew a, b become an exact orthonormal pair.
  'lecture-13': () => {
    let s = arrow(48, 112, 118, 76, ink, 2.4);
    s += arrow(48, 112, 96, 34, ink, 2.4);
    s += txt(104, 60, 'a', ink, 12, 'font-style="italic" opacity="0.7"');
    s += txt(56, 60, 'b', ink, 12, 'font-style="italic" opacity="0.7"');
    s += arrow(134, 76, 182, 76, C.yellow, 2.2, '2 5');
    // q1 along (30,-52), q2 along its exact perpendicular (-52,-30); equal lengths.
    const P = [214, 112];
    s += arrow(P[0], P[1], 244, 60, C.green, 3);
    s += arrow(P[0], P[1], 162, 82, C.green, 3);
    const u1 = [6.5, -11.3];
    const u2 = [-11.3, -6.5];
    s += `<polyline points="${P[0] + u1[0]},${P[1] + u1[1]} ${P[0] + u1[0] + u2[0]},${P[1] + u1[1] + u2[1]} ${P[0] + u2[0]},${P[1] + u2[1]}" fill="none" stroke="${ink}" stroke-width="1.8"/>`;
    s += txt(244, 132, 'q₁, q₂', C.green, 12, 'font-style="italic" text-anchor="end"');
    return s;
  },

  // 14 · Determinants — area, scaled.
  'lecture-14': () => {
    let s = `<rect x="44" y="72" width="44" height="44" fill="${C.orange}" fill-opacity="0.2" stroke="${C.orange}" stroke-width="2.4"/>`;
    s += arrow(102, 94, 136, 94, ink, 2.4);
    s += `<polygon points="150,116 222,116 244,52 172,52" fill="${C.orange}" fill-opacity="0.28" stroke="${C.orange}" stroke-width="2.6" stroke-linejoin="round"/>`;
    s += txt(62, 98, '1', C.orange, 13);
    s += txt(186, 96, 'det A', ink, 13, 'font-style="italic"');
    return s;
  },

  // 15 · Eigenvectors — arrows on the true axes of the energy ellipses.
  'lecture-15': () => {
    let s = '';
    for (let i = 0; i < 3; i++)
      s += `<ellipse cx="138" cy="78" rx="${94 - i * 26}" ry="${52 - i * 15}" fill="none" stroke="${ink}" stroke-width="1.6" opacity="${0.3 + i * 0.14}" transform="rotate(-18 138 78)"/>`;
    s += arrow(138, 78, 226, 46, C.purple, 3);
    s += arrow(138, 78, 150, 114, C.green, 3);
    s += txt(216, 34, 'λ₁v₁', C.purple, 12, 'font-style="italic"');
    s += txt(158, 126, 'λ₂v₂', C.green, 12, 'font-style="italic"');
    return s;
  },

  // 16 · SVD — the circle becomes an ellipse.
  'lecture-16': () => {
    let s = `<circle cx="70" cy="78" r="38" fill="${C.purple}" fill-opacity="0.12" stroke="${C.purple}" stroke-width="2.4"/>`;
    s += arrow(120, 78, 152, 78, ink, 2.4);
    s += txt(128, 68, 'A', ink, 13, 'font-style="italic"');
    s += `<ellipse cx="204" cy="78" rx="46" ry="24" fill="${C.purple}" fill-opacity="0.16" stroke="${C.purple}" stroke-width="2.6" transform="rotate(-22 204 78)"/>`;
    s += arrow(204, 78, 246, 61, C.orange, 2.4);
    s += txt(210, 44, 'σ₁', C.orange, 12);
    return s;
  },

  // 17 · Pseudoinverse — there and back, as well as possible.
  'lecture-17': () => {
    let s = `<circle cx="64" cy="70" r="5" fill="${ink}"/>`;
    s += `<circle cx="204" cy="70" r="5" fill="${ink}"/>`;
    s += `<path d="M74,58 C 110,30 160,30 196,58" fill="none" stroke="${C.purple}" stroke-width="2.6"/>`;
    s += `<polyline points="188,52 196,58 190,66" fill="none" stroke="${C.purple}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>`;
    s += `<path d="M196,84 C 160,112 110,112 74,84" fill="none" stroke="${C.green}" stroke-width="2.6" stroke-dasharray="7 5"/>`;
    s += `<polyline points="82,78 74,84 81,92" fill="none" stroke="${C.green}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>`;
    s += txt(128, 32, 'A', C.purple, 13, 'font-style="italic"');
    s += txt(124, 132, 'A⁺', C.green, 13, 'font-style="italic"');
    return s;
  },

  // 18 · PCA — the axis of most variance, and its exact perpendicular.
  'lecture-18': () => {
    const pts = [[70, 96], [92, 78], [118, 88], [128, 62], [152, 70], [168, 48], [190, 58], [104, 106], [146, 96], [206, 40]];
    let s = '';
    for (const [x, y] of pts) s += `<circle cx="${x}" cy="${y}" r="4" fill="${C.cyan}" opacity="0.85"/>`;
    s += arrow(66, 110, 218, 34, C.purple, 3);
    s += arrow(128, 80, 111, 46, C.pink, 2, '2 4');
    s += txt(196, 24, 'PC1', C.purple, 12);
    return s;
  },

  // 19 · Complex eigenvalues — λ lives on the unit circle.
  'lecture-19': () => {
    let s = `<circle cx="132" cy="78" r="46" fill="none" stroke="${ink}" stroke-width="2" opacity="0.55"/>`;
    s += `<line x1="72" y1="78" x2="192" y2="78" stroke="${ink}" stroke-width="1.4" opacity="0.4"/>`;
    s += `<line x1="132" y1="18" x2="132" y2="138" stroke="${ink}" stroke-width="1.4" opacity="0.4"/>`;
    s += arrow(132, 78, 168, 49, C.purple, 3);
    s += `<path d="M150,64 A 23,23 0 0 1 155,78" fill="none" stroke="${C.orange}" stroke-width="2.2"/>`;
    s += txt(160, 70, 'θ', C.orange, 12, 'font-style="italic"');
    s += txt(176, 42, 'λ', C.purple, 13, 'font-style="italic"');
    s += txt(138, 32, 'i', ink, 13, 'font-style="italic"');
    return s;
  },

  // 20 · Fourier — waves that form a basis.
  'lecture-20': () => {
    let s = '';
    const wave = (amp, freq, col, y0) => {
      let d = `M 36 ${y0}`;
      for (let x = 0; x <= 200; x += 4) d += ` L ${36 + x} ${y0 - amp * Math.sin((x / 200) * Math.PI * 2 * freq)}`;
      return `<path d="${d}" fill="none" stroke="${col}" stroke-width="2.4" stroke-linecap="round"/>`;
    };
    s += wave(20, 1, C.purple, 56);
    s += wave(14, 2, C.cyan, 96);
    s += wave(9, 3, C.orange, 128);
    return s;
  },

  // 21 · Circulants — a ring of states, and the shift that walks it.
  'lecture-21': () => {
    let s = '';
    const n = 6;
    const node = (i) => {
      const a = (i / n) * Math.PI * 2 - Math.PI / 2;
      return [132 + 52 * Math.cos(a), 78 + 52 * Math.sin(a)];
    };
    for (let i = 0; i < n; i++) {
      const [x, y] = node(i);
      s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="9" fill="${C.purple}" fill-opacity="0.2" stroke="${C.purple}" stroke-width="2.2"/>`;
    }
    // Faint ring hinting the cycle.
    s += `<circle cx="132" cy="78" r="52" fill="none" stroke="${C.purple}" stroke-width="1.4" opacity="0.3" stroke-dasharray="2 6"/>`;
    // One emphatic shift: node 0 to node 1, along the circle, with a head.
    s += `<path d="M141,15.5 A 63 63 0 0 1 187,42" fill="none" stroke="${C.purple}" stroke-width="2.6" stroke-linecap="round"/>`;
    s += `<polyline points="184,31 187,42 176,44" fill="none" stroke="${C.purple}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>`;
    s += txt(196, 24, 'shift', ink, 11);
    return s;
  },

  // 22 · Capstone — every thread, one knot.
  'lecture-22': () => {
    let s = txt(132, 86, 'A = UΣVᵀ', ink, 21, 'text-anchor="middle" font-weight="700"');
    const cols = [C.green, C.cyan, C.pink, C.yellow, C.orange, C.purple];
    for (let i = 0; i < 6; i++)
      s += `<rect x="${64 + i * 24}" y="106" width="16" height="7" rx="2" fill="${cols[i]}"/>`;
    return s;
  },

  // 23 · Memory layout — a 3x4 matrix flattens row by row into one line.
  'lecture-23': () => {
    let s = '';
    const rowCols = [C.green, C.cyan, C.orange];
    for (let r = 0; r < 3; r++)
      for (let c = 0; c < 4; c++)
        s += `<rect x="${28 + c * 24}" y="${26 + r * 24}" width="21" height="21" rx="3" fill="${rowCols[r]}" opacity="0.85"/>`;
    s += arrow(136, 62, 172, 100, ink, 2.2);
    for (let i = 0; i < 12; i++)
      s += `<rect x="${26 + i * 18}" y="112" width="15" height="15" rx="3" fill="${rowCols[(i / 4) | 0]}" opacity="0.85"/>`;
    s += txt(150, 34, 'row-major', ink, 12);
    return s;
  },

  // 24 · CPU speed — measured steps down a log scale: 4481, 1621, 89, 70, 16 ms.
  //     Bar heights are 28 * log10(ms): 102, 90, 55, 52, 34.
  'lecture-24': () => {
    let s = `<line x1="26" y1="128" x2="242" y2="128" stroke="${ink}" stroke-width="2"/>`;
    const h = [102, 90, 55, 52, 34];
    for (let i = 0; i < 5; i++) {
      const color = i === 4 ? C.green : i >= 2 ? C.yellow : C.orange;
      s += `<rect x="${44 + i * 40}" y="${128 - h[i]}" width="26" height="${h[i]}" rx="3" fill="${color}" opacity="0.9"/>`;
    }
    s += txt(38, 18, '4.4s', C.orange, 12);
    s += txt(204, 88, '16ms', C.green, 12);
    return s;
  },

  // 25 · GPU — a 2x2 grid of blocks, threads inside, one warp row lit.
  'lecture-25': () => {
    let s = '';
    for (let bx = 0; bx < 2; bx++)
      for (let by = 0; by < 2; by++) {
        const X = 40 + bx * 100, Y = 24 + by * 56;
        const hot = bx === 0 && by === 0;
        s += `<rect x="${X}" y="${Y}" width="84" height="44" rx="4" fill="none" stroke="${hot ? C.green : ink}" stroke-width="2.2" opacity="${hot ? 1 : 0.5}"/>`;
        for (let r = 0; r < 2; r++)
          for (let c = 0; c < 8; c++) {
            const warp = hot && r === 0;
            s += `<rect x="${X + 5 + c * 10}" y="${Y + 6 + r * 18}" width="7" height="14" rx="2" fill="${warp ? C.cyan : hot ? C.green : ink}" opacity="${warp ? 0.95 : hot ? 0.45 : 0.25}"/>`;
          }
      }
    s += txt(40, 142, 'grid  ·  block  ·  warp', ink, 11);
    return s;
  },

  // 26 · GEMM kernel — A strip, B strip, and C with block/warp/thread tiles nested.
  'lecture-26': () => {
    let s = `<rect x="124" y="36" width="100" height="100" rx="3" fill="none" stroke="${ink}" stroke-width="2.2"/>`;
    s += `<rect x="124" y="18" width="100" height="12" rx="3" fill="${C.cyan}" opacity="0.8"/>`;
    s += `<rect x="106" y="36" width="12" height="100" rx="3" fill="${C.orange}" opacity="0.8"/>`;
    s += `<rect x="140" y="52" width="48" height="48" rx="3" fill="${C.yellow}" opacity="0.3" stroke="${C.yellow}" stroke-width="2"/>`;
    s += `<rect x="148" y="60" width="24" height="24" rx="2" fill="${C.orange}" opacity="0.4" stroke="${C.orange}" stroke-width="2"/>`;
    s += `<rect x="152" y="64" width="9" height="9" rx="1.5" fill="${C.green}"/>`;
    s += txt(24, 30, 'B', C.cyan, 13, 'font-style="italic"');
    s += txt(24, 50, 'A', C.orange, 13, 'font-style="italic"');
    s += txt(24, 90, 'block', C.yellow, 11);
    s += txt(24, 106, 'warp', C.orange, 11);
    s += txt(24, 122, 'thread', C.green, 11);
    return s;
  },

  // 27 · Layouts — (4,3):(3,1) as a function: coordinate (2,1) lands on 7.
  //     Cell (r,c) holds 3r + c, the layout function itself.
  'lecture-27': () => {
    let s = txt(36, 24, '(4,3):(3,1)', C.purple, 14, 'font-weight="700"');
    for (let r = 0; r < 4; r++)
      for (let c = 0; c < 3; c++) {
        const hot = r === 2 && c === 1;
        s += `<rect x="${36 + c * 28}" y="${34 + r * 26}" width="25" height="23" rx="3" fill="${hot ? C.purple : 'none'}" fill-opacity="${hot ? 0.3 : 0}" stroke="${C.purple}" stroke-width="1.8" opacity="${hot ? 1 : 0.55}"/>`;
        s += txt(44 + c * 28, 50 + r * 26, String(3 * r + c), hot ? C.purple : ink, 12);
      }
    s += arrow(196, 100, 136, 96, C.purple, 2.2);
    s += txt(200, 92, '(2,1)', ink, 12);
    s += txt(200, 108, '↦ 7', C.purple, 12);
    return s;
  },

  // 28 · Sparse — a mostly empty grid becomes three short CSR arrays.
  'lecture-28': () => {
    let s = '';
    const nz = [[0, 2], [1, 5], [2, 0], [3, 3], [4, 6], [5, 1]];
    for (let r = 0; r < 6; r++)
      for (let c = 0; c < 8; c++) {
        const hit = nz.some(([a, b]) => a === r && b === c);
        s += hit
          ? `<rect x="${30 + c * 17}" y="${18 + r * 15}" width="13" height="11" rx="2" fill="${C.green}"/>`
          : `<circle cx="${36 + c * 17}" cy="${23 + r * 15}" r="1.4" fill="${ink}" opacity="0.3"/>`;
      }
    s += arrow(176, 76, 200, 76, ink, 2.2);
    for (let i = 0; i < 6; i++) s += `<rect x="${208}" y="${20 + i * 8}" width="10" height="6" rx="1" fill="${C.green}"/>`;
    for (let i = 0; i < 6; i++) s += `<rect x="${224}" y="${20 + i * 8}" width="10" height="6" rx="1" fill="${C.cyan}"/>`;
    for (let i = 0; i < 7; i++) s += `<rect x="${240}" y="${20 + i * 8}" width="10" height="6" rx="1" fill="${C.orange}"/>`;
    s += txt(204, 96, 'CSR', ink, 11);
    return s;
  },
};

const dir = join(import.meta.dirname, '..', 'src', 'assets', 'thumbs');
await mkdir(dir, { recursive: true });
for (const [slug, fn] of Object.entries(thumbs)) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" aria-hidden="true">${fn()}</svg>`;
  await writeFile(join(dir, `${slug}.svg`), svg);
}
console.log(Object.keys(thumbs).length, 'thumbnails written');
