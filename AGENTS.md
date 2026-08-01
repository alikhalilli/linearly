# AGENTS.md: the rulebook for AI agents working on linearly

You are working on a free, community-grown linear algebra course for people building AI,
published at linearly.space as a reading companion to MIT 18.06. The quality bar is not
negotiable: this project aims to be the best material of its kind in the world, useful enough
that MIT could cite it. Every rule below was learned the hard way. Follow all of them.

## The one law above the others

**Never claim what you have not verified.** Never state a program output you did not run.
Never call a visual fixed without a rendered screenshot you looked at. Never cite an edition,
date, or fact you did not check against a primary source. Never invent a resource, video, or
citation: fabrication has been caught in this project before, and everything an agent asserts
is re-checkable. When you cannot verify, say so plainly instead of guessing.

## Project shape

- Astro (pinned version in `package.json`; do not upgrade it), MDX content collections,
  Tailwind 4 tokens in `src/styles/global.css`, KaTeX at build time (the `katex` package major
  version must match what `rehype-katex` expects; a mismatch silently breaks subscript
  rendering), Shiki, Pagefind. Package manager is pnpm, always.
- One lecture = one file: `src/content/lectures/lecture-NN.mdx` (7.5 is `lecture-07-5`).
  Frontmatter schema: `src/content.config.ts`.
- `src/pages/lectures/[...slug].astro` provides these components to every lecture: SlideViewer,
  CodeTabs, Callout, Figure, SpanPlayground, MatrixPlayground, and `pre` → CodeFigure. New
  lecture-specific components are imported inside the lecture's own MDX, never registered in
  the shared layout.
- Figures: inline SVG in the MDX plus a matching `.excalidraw` source in
  `drawings/lecture-NN/`. Slides: `public/slides/<deck>/` (never touched by agents).
- Model chapters: `lecture-01.mdx` and `lecture-02.mdx`. Read both before writing any lecture
  content. Model interactives: `SpanPlayground.astro`, `MatrixPlayground.astro`.

## Writing law

Four references define the standard; when in doubt, they outrank any checklist:
[Write Simply](https://paulgraham.com/simply.html),
[Good Writing](https://paulgraham.com/goodwriting.html), and
[How to Write Usefully](https://paulgraham.com/useful.html) by Paul Graham say what to do;
Wikipedia's [Signs of AI writing](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing)
says what must never appear, whether or not a machine wrote it.

The style is Paul Graham's "Write Simply". Ordinary words, short sentences, low friction.
Every symbol introduced in prose before it appears in a formula. Picture first, notation last.
Each chapter is a story with a hook and a payoff. Real numbers everywhere; every claim
checkable by hand or by running the shown code.

Hard bans, each one a failed review:

- Em dashes in article prose (use a comma, a colon, or two sentences). Middle-dot separators.
- "not X, but Y" constructions; habitual groups of three; "-ing" analysis clauses tacked onto
  sentences.
- Puffery: crucial, pivotal, delve, showcase, vibrant, testament, elegant, stunning (about the
  work itself). "Serves as", "features" (use "is", "has").
- "clearly", "obviously", "it is easy to see", "simply" as filler.
- Curly quotes or apostrophes in source files. Check: `grep -n "’\|“\|”" <file>` must be empty.
- English words inside display math. Tall constructs (`\begin{bmatrix}`) in inline math:
  tuples like $(1, 2)$ inline, matrices only in display.

Chapter anatomy: `## The idea in one sentence` → story sections → `## Where this is going` →
closing `<Callout type="check">` exercises, the last one: "Redraw Figure N from memory, labels
included. The drawing is the test."

## Notation canon (course-wide, binding)

$A$ matrix, $b$ right-hand side, $x$ unknown; $\hat{x}$ only ever the least-squares solution;
$w$ only an ML weight vector; row space written $C(A^\mathsf{T})$, column space $C(A)$, null
space $N(A)$, left null space $N(A^\mathsf{T})$; bare $R$ is the current factorization's
triangular/rref factor; $Q$ has orthonormal columns; eigenpairs $\lambda, x$ (or $q$ when
orthonormal). Real spaces $\R^n \to \R^m$, never $\C$. Never reuse a letter with two meanings
in one lecture. KaTeX macros available: `\R \C \T \norm{} \inner{}{} \rank \vv{}`.

## Figure law

- **Ink draws, color means, accent acts.** Structure (axes, frames, brackets, construction
  dashes) and ALL text stay `currentColor`; text is never colored. Strokes may additionally
  use `var(--color-accent)` (the action: mapping arrows, the vector being followed),
  `var(--color-stroke-warm)` (the before/input/contrast voice), and
  `var(--color-stroke-green)` (the after/output/achieved voice). Fills use the pastel part
  tokens `--color-part1..6` in two modes: chip mode (a cell/box carrying text on it:
  full-strength fill + that text in fixed dark ink `#141414`, the Callout convention) and
  region mode (large geometric fills: `fill-opacity` 0.30-0.5 so `currentColor` labels stay
  legible in dark). The dark chip ink applies ONLY to glyphs sitting on a part-token fill;
  text on the page background stays `currentColor`, or dark mode breaks the other way.
  Otherwise always CSS vars, never raw hex, so both themes work from the same SVG;
  `#141414` chip text is the one sanctioned literal. Style attribute on the svg:
  `style="max-width:100%;height:auto;font:italic 15px var(--font-serif)"`.
- Course-wide color canon: C(A) green `part1`, C(Aᵀ) orange `part5`, N(A) cyan `part2`,
  N(Aᵀ) purple `part6`; yellow `part4` = the highlighted cell (pivots, "look here"); pink
  `part3` = the broken thing (counterexamples, impossible targets). 2 to 4 colors per figure
  plus ink; every color carries exactly one meaning, named in the caption or a small legend;
  color is never the only carrier (labels and dash patterns stay). A figure with nothing to
  mean stays ink-only.
- **Every coordinate computed, never eyeballed.** Compute perpendiculars, projections, and
  landing points in a Python scratch session, then draw from the numbers.
- Arrowheads are two short lines; a colored arrow keeps its own head (ink heads belong to ink
  structure only). Dashes = construction, dots = continues forever. Label every arrow and
  region; a figure must survive alone.
- Filling a curved surface from mesh quads: SVG fills a whole `<path>` as one region, so
  overlapping subpaths of opposite winding cancel under the default nonzero rule and punch
  holes. Normalize every subpath to one winding (flip it if its shoelace area is negative)
  and the union fills correctly.
- **The `.excalidraw` source is the single truth and the site shows its 1:1 export.** The
  inline SVG in the MDX is generated by `scripts/export-figures.mjs` (which maps palette
  hexes to theme vars, keeps chip text dark, and preserves aria-labels and responsive
  floors) and is never hand-edited. To change a figure: edit or regenerate the source, run
  the exporter, verify with `scripts/render-excalidraw.mjs` plus both-theme page
  screenshots. The site's figure identity is the hand-drawn Excalidraw look (Virgil
  lettering, drawn-stroke roughness); do not "clean it up".
- Nothing borrowed, ever: no memes, no textbook screenshots, no stock imagery, no redrawn
  copyrighted figures. This repo had to purge all of those once.

## Code law

- `<CodeTabs>` blocks with numpy / pytorch / jax / tensorflow slots, identical numbers in all
  four, printed outputs in comments.
- Outputs only from executed code. NumPy is usually available locally; the other three often
  are not, so restrict their tabs to operations whose results are mathematically forced to
  match (matmul, einsum, reductions) and prefer uniquely defined operations: use `pinv` over
  `lstsq` for rank-deficient systems, because `lstsq` behavior differs per framework and NumPy
  even returns an empty residual array there.
- Framework differences are content, not noise: `axis` vs `dim`, `amin` vs `reduce_min`,
  TensorFlow's column-vector conventions. Teach them where they appear.

## Interactive law

- Pattern: self-contained `.astro` component, `card-brutal` wrapper, header
  `<span class="label !text-ink">Try it. …</span>`, SVG scene left, controls right.
- Grid must be `sm:grid-cols-[1fr_15rem]`. **Never `[1fr_auto]`**: a prose-bearing auto column
  takes max-content and collapses the 1fr SVG column to zero width. This shipped as a live bug
  once.
- Inside `.label` spans that hold lowercase math letters, add `style="text-transform:none"`
  (`.label` uppercases, and "A = 2.0" reads as the matrix when you meant the entry `a`).
- Vanilla TypeScript in the `<script>` tag, ~2KB, zero dependencies, colors only via CSS vars.
- An interactive must deliver an intuition the text cannot. Otherwise it does not ship.

## The verify loop (mandatory for anything visual)

1. `pnpm build` (if concurrent agents are building, expect occasional cache collisions; wait
   and retry, or build with `--outDir` to a private directory and serve it with
   `python3 -m http.server`).
2. Playwright (a devDependency, chromium installed): screenshot the affected page full-page
   in both themes. Set dark through an init script BEFORE navigation:
   `page.addInitScript(() => localStorage.setItem('theme', 'dark'))`. Flipping
   `document.documentElement.dataset.theme` after load races the theme script and can hand
   you a light screenshot labeled dark.
3. **Read the screenshots.** Crop and zoom with sharp when the full page is too small to
   judge. For figures, render with `deviceScaleFactor: 2` and crop each figure by its own
   bounding box: downscaled full-page screenshots have hidden real label collisions before.
   Fix what you see. Repeat until clean.
4. Glued-text check (Astro drops the newline before a line-starting `<a>`):
   `grep -o "[a-zA-Z.,;:)]<a href" dist/**/*.html` must return nothing; fix with `{' '}`.
   The character class includes punctuation because a sentence ending right before a link
   glues too, and a letters-only pattern reads that as a pass.
5. The build emits one file per page (`dist/lectures/lecture-06.html`, NOT
   `lecture-06/index.html`). A check that greps a path that does not exist reports zero
   matches and reads exactly like a pass. Verify your target file exists before trusting
   any zero.

## Link law (for anything touching /resources or external links)

HTTP 200 is not proof of life. Verified failure modes on this project: soft-404s redirecting
to styled error pages; JS shells returning byte-identical 200s for real and fabricated paths;
intermittent WAF block pages served under 200; silently redirected GitHub repos. Check with
full browser headers, inspect the effective URL, grep bodies for error markers, and when a
site looks like an SPA, diff a fabricated sibling URL against the real one. For GitHub license
checks use `gh api repos/OWNER/REPO/license`, not `--json licenseInfo` (which lies).

## Boundaries

- Never run git commands that create history (commit, push, rebase); the repository's history
  belongs to its human maintainer.
- Do not edit shared infrastructure (`[...slug].astro`, `global.css`, `Base.astro`, header,
  footer, workflows) unless that is explicitly your task.
- Never leave a temporary marker in a committed-path file, even for minutes: a bare `<` in
  MDX halts every concurrent build (this happened with a `<<<PLACEHOLDER>>>` during parallel
  authoring). Stage multi-pass edits outside the tree and write the file once, or use
  `{/* ... */}` comments, which MDX tolerates. CI rejects literal `<<<` in content.
- Do not upgrade or add dependencies casually; the pins exist for verified reasons.
- Licensing: code PolyForm Noncommercial 1.0.0, content CC BY-NC-SA 4.0. Everything you
  generate here is licensed that way, and nothing may be imported that cannot carry those
  terms.
- When your work is done, report precisely: files touched, what you verified and how, and
  anything you could not verify, stated as such.
