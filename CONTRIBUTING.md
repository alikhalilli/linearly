# Contributing to linearly

Thank you. This course is built to be grown by the people who learn from it, and every kind of
improvement matters: a fixed typo, a clearer sentence, a better drawing, a sharper exercise, a
whole new lecture. This guide covers all of them, from the one-line fix to the full technical
workflow.

Two things before anything else:

- **The spirit**: this course teaches by intuition. Picture first, plain words second, code
  third, notation last. If a change makes the course more intimidating, it is moving backward,
  even if it is more complete.
- **The license**: everything here is free to learn from and closed to commercial use. By
  contributing you agree that your contribution is licensed the same way as the rest of the
  project: code under [PolyForm Noncommercial 1.0.0](LICENSE), content under
  [CC BY-NC-SA 4.0](LICENSE-CONTENT). Only contribute material you have the right to give.
  Never paste text or images from books, courses, or other sites.

AI agents have their own complete rulebook: [AGENTS.md](AGENTS.md). Humans are welcome to read
it too; it is the most compressed statement of the house rules, and everything in it applies
to human contributions as well.

## Getting set up

```bash
pnpm install    # Node >= 22 required; this repo uses pnpm, not npm
pnpm dev        # local dev server
pnpm build      # production build + search index; must pass before any PR
```

The stack is Astro (static output, pinned version; do not upgrade it), MDX content, build-time
KaTeX, Shiki, Tailwind 4 tokens, and Pagefind. Playwright ships as a devDependency with
Chromium installed, because the verify loop below depends on it.

## The fast paths

### Fix a typo or improve wording
Every lecture is one file: `src/content/lectures/lecture-NN.mdx`. Edit it, run the checks in
"Before you open a PR", open a PR. Done.

### Improve or add a code example
Code examples live inside the lecture MDX in a `<CodeTabs>` block with one slot per framework:

```mdx
<CodeTabs>
  <Fragment slot="numpy">```python … ```</Fragment>
  <Fragment slot="pytorch">```python … ```</Fragment>
  <Fragment slot="jax">```python … ```</Fragment>
  <Fragment slot="tensorflow">```python … ```</Fragment>
</CodeTabs>
```

The rules:
- Examples run as-is and print something meaningful.
- The same numbers in all four frameworks, so readers can compare outputs line by line.
- **Never write an output comment you have not seen printed.** Run the code; paste the truth.
  If you can only run NumPy, restrict the other tabs to operations whose results are
  mathematically forced to match (matmul, einsum, reductions) and write their comments as
  values.
- Where frameworks disagree in behavior or naming (`axis` vs `dim`, `lstsq` on rank-deficient
  systems), that difference is content: teach it, or choose an operation that is uniquely
  defined (this course used `pinv` instead of `lstsq` for a singular system for exactly this
  reason).

### Suggest a resource for the Library
The Library (`/resources`) is deliberately small: only material that is genuinely among the
best in the world, each entry with an honest note on how it teaches and where it is weak. When
proposing an addition, make the case: what slot it fills that nothing on the page fills, and
what you learned from finishing it. Links must be verified working. HTTP 200 is not proof of
life: watch for soft-404 error pages, JS shells that answer 200 for any path, and silently
moved repositories.

## How we write

The writing is the point of this project, so it has a canon. Read these once before writing a
paragraph; they say more in twenty minutes than any style checklist can:

- Paul Graham, [Write Simply](https://paulgraham.com/simply.html). Ordinary words, short
  sentences, low friction. Many of our readers are not native English speakers, and their
  understanding of the ideas may be far ahead of their English.
- Paul Graham, [Good Writing](https://paulgraham.com/goodwriting.html). Read your draft the
  way he sands wood: over and over, fixing every sentence that catches. Writing that sounds
  wrong usually has the idea wrong too.
- Paul Graham, [How to Write Usefully](https://paulgraham.com/useful.html). Say things as
  strong as they can be while staying true, and no stronger. If you cannot verify a claim,
  do not publish it.
- Wikipedia, [Signs of AI writing](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing).
  This is our ban list. Whether or not a machine helped you write, none of these patterns may
  appear in the course.

The house rules those four produce:

- Picture first. Introduce the geometric idea before the notation that compresses it, and
  every symbol in prose before it appears in a formula.
- Real numbers in examples. A reader should be able to check the arithmetic by hand.
- Each chapter is a story with a hook and a payoff. A chapter that only enumerates its topics
  has failed. The last sentence of a section should make the reader want the next one.
- One name per thing. If the chapter calls it "the machine", it is "the machine" all the way
  down. Synonym-cycling reads as machine writing and costs the reader a lookup every time.
- Short sentences by default. A long sentence must earn its length.
- Cut. The best edit is usually a deletion.

Banned outright, each one a failed review: spaced em dashes; middle-dot separators;
"not X, but Y" constructions; habitual groups of three; puffery (crucial, pivotal, delve,
showcase, vibrant, testament, boasts, robust); "serves as" and "features" where "is" and
"has" do the job; "clearly", "obviously", "simply", "it is easy to see"; "it is important to
note" and "worth noting"; vague attributions ("some argue", "experts say"); "In summary"
closers; Title Case headings (house style is sentence case); curly quotes or apostrophes in
source files.

Also protected, in the other direction: plain "is" and "has" sentences, true superlatives,
deliberate qualifiers ("usually", "almost"), and the direct second-person voice. Do not
"improve" plain sentences into fancy ones. That impulse is the disease itself.

## How we explain

The pedagogy has laws of its own:

- **Chapter anatomy.** `## The idea in one sentence` (one true sentence), then story sections,
  then `## Where this is going` (an honest forward hook), then a closing
  `<Callout type="check">` with exercises. The last exercise follows the house convention:
  "Redraw Figure N from memory, labels included. The drawing is the test."
- **Callouts.** `intuition` holds the mental move the reader must keep. `note` holds an honest
  aside or forward hook. `warning` holds a trap. `check` holds exercises. Use each sparingly;
  a page of callouts is a page with no voice.
- **Running examples are canon.** The course reuses the same worked examples across chapters
  (the measurements table, the ring road machine, the elimination 3x3, the movie ratings
  matrix). Reuse them by their names with a short recall ("the measurements table from
  Lecture 8"); never re-derive them, and never change their numbers.
- **Notation is course-wide law.** $A$ is the matrix, $b$ the right-hand side, $x$ the
  unknown; $\hat{x}$ only ever means the least-squares solution; row space is written
  $C(A^\mathsf{T})$; $C(A)$, $N(A)$, $N(A^\mathsf{T})$ for the other subspaces; $Q$ has
  orthonormal columns; spaces are $\R^n$, never $\C^n$. Never reuse a letter with two
  meanings inside one lecture.
- **Math typography.** LaTeX inside `$…$` / `$$…$$`, rendered by KaTeX at build time. Inline
  math never uses tall constructs: tuples like $(1, 2, 3)$ inline, `\begin{bmatrix}` only in
  display math. No English words inside display math. Available macros:
  `\R \C \T \norm{x} \inner{x}{y} \rank \vv{x}`.

## How we draw

Diagrams are the soul of the course, and the site shows them exactly as drawn. The committed
source in `drawings/lecture-NN/fig-K-slug.excalidraw` is the single truth; the inline SVG in
the lecture's `<Figure>` block is its 1:1 export, generated by
`node scripts/export-figures.mjs` and never edited by hand. The hand-drawn look (Virgil
lettering, drawn strokes) is the course's figure identity. The full workflow is in
`drawings/README.md`.

- **Every coordinate is computed, never eyeballed.** If two lines are perpendicular, compute
  the perpendicular. If a point is a projection, compute the projection. Do the arithmetic in
  a Python scratch session first, then draw from the numbers. Most figures here were
  generated by a small script that writes the SVG and the `.excalidraw` from the same
  numbers; that is the preferred way to change one, because it cannot let the two drift.
- **Ink draws, color means, accent acts.** Structure (axes, frames, brackets, construction
  dashes) and all text stay `currentColor`. Strokes may additionally use
  `var(--color-accent)` for the action the figure exists to show,
  `var(--color-stroke-warm)` for the before/input voice, and `var(--color-stroke-green)` for
  the after/achieved voice. Fills use the pastel part tokens in two modes: **chip mode** for
  a cell or box carrying text on it (full-strength fill, and that text in fixed dark ink
  `#141414`, the site's callout convention) and **region mode** for large geometric fills
  (`fill-opacity` 0.30 to 0.5, so theme-ink labels stay legible in dark). Always CSS vars,
  never raw hex; `#141414` chip text is the one sanctioned literal.
- **The subspace color canon is binding**: C(A) green `part1`, C(Aᵀ) orange `part5`, N(A)
  cyan `part2`, N(Aᵀ) purple `part6`; yellow `part4` marks the highlighted cell; pink
  `part3` marks the broken thing. At most 4 colors per figure plus ink; every color carries
  one named meaning, stated in the caption or a small legend; color is never the only
  carrier (labels and dash patterns stay). A figure with nothing to mean stays ink-only.
- Hand-drawn stroke feel, 1.5 to 2px lines, round caps; dashes for construction, dots for
  "continues forever"; arrowheads drawn as two short lines, and a colored arrow keeps its
  own colored head.
- Label every arrow and region. A figure must survive being seen without its article, and
  **no label may touch a stroke, a shape edge, or another label** in either theme. The
  verify loop below is how you prove that.
- One idea per drawing. If it needs a paragraph to explain, split it.

## How we build interactives

Each lecture can carry small interactives (see `SpanPlayground.astro` and
`MatrixPlayground.astro` for the pattern):

- One self-contained `.astro` file in `src/components/`, named for the concept it teaches.
- `card-brutal` wrapper, a `label` header line starting with "Try it.", an SVG scene, controls
  on the right.
- Grid `sm:grid-cols-[1fr_15rem]`. Never `[1fr_auto]`: an auto column containing prose will
  swallow the SVG column entirely. This shipped as a live bug once.
- Vanilla TypeScript in a `<script>` tag, roughly 2KB, no dependencies. Colors only via CSS
  variables, with the same meanings as the chapter's figures.
- Import it inside the lecture MDX itself, not in the shared lecture layout.
- An interactive must deliver an intuition static text cannot. If it only decorates, it does
  not ship.

## The technical workflow (how to actually verify your work)

The one law above all others: **never claim what you have not verified.** Here is how the
house verifies, with the real commands.

**1. Build and serve.**

```bash
pnpm build
pnpm preview --port 4400        # or: python3 -m http.server 4400 -d dist
```

Built pages are flat files: `dist/lectures/lecture-06.html`, not `lecture-06/index.html`.
Point your checks at the path that exists; a grep against a missing file prints zero matches
and reads exactly like a pass.

**2. Screenshot what you changed, in both themes, and read the screenshots.**

```bash
node -e "
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1500, height: 1000 }, deviceScaleFactor: 2 });
  await p.addInitScript(() => localStorage.setItem('theme', 'dark'));  // dark; drop for light
  await p.goto('http://localhost:4400/lectures/lecture-NN.html', { waitUntil: 'networkidle' });
  await p.screenshot({ path: '/tmp/page-dark.png', fullPage: true });
  await b.close();
})();"
```

Set the theme through `localStorage` in an init script, as above. Flipping
`document.documentElement.dataset.theme` after load races the theme script and can hand you a
light screenshot labeled dark.

**3. For figures, crop each one and look at it at full size.** Full-page screenshots hide
label collisions. Take an element screenshot of the figure node
(`page.locator('article figure:has(svg)').nth(K).screenshot(...)`) at `deviceScaleFactor: 2`,
in both themes, and read it. If a label touches anything, recompute its coordinates and go
again.

**4. Run every code example you touched.**

```bash
python3 your_scratch_copy.py    # NumPy is enough; paste the printed truth into the comments
```

**5. The self-check greps.** All of these must report zero findings on your changed files
(the first three print nothing; the katex count prints 0):

```bash
grep -n "’\|“\|”" <files>                                  # straight quotes only
grep -n " — \|·" <files>                                   # no spaced em dashes, no middots
grep -rhoE "[a-zA-Z.,;:)]<(a href|em>|strong>)" dist/      # no glued text before inline tags
grep -c "katex-error" dist/lectures/<your page>.html       # 0, or a formula is broken
```

The glued-text pattern includes punctuation on purpose: Astro drops the newline before a
line-starting inline tag, and a sentence ending right before a link glues too. The fix is a
`{' '}` before the tag. CI runs these same checks and will fail a PR that skips them.

**6. Responsive.** If you changed layout or added a figure or interactive, look at your page
at 360, 390, 768, and 1024 wide. No horizontal page scroll; code and tables scroll inside
their own containers; interactives stack below the `sm:` breakpoint and stay usable.

### Add a whole lecture
Read two model chapters first: `lecture-01.mdx` and `lecture-02.mdx`. Match their anatomy and
run the full workflow above on your draft. Frontmatter schema is in `src/content.config.ts`.
Open an issue before starting a new lecture so nobody duplicates work.

## Before you open a PR

- [ ] `pnpm build` passes.
- [ ] Anything visual: screenshots taken in both themes and actually read.
- [ ] New or moved figures: per-figure crops read, zero label collisions, `.excalidraw`
      source regenerated together with the SVG and committed.
- [ ] Every code output comment was printed by running the code.
- [ ] The self-check greps above come back empty.
- [ ] Nothing pasted from copyrighted sources.

PRs are reviewed for correctness first, then style. Disagreements about math are settled by
proof or computation, which is the nicest property mathematics has. Everything else is covered
by the [Code of Conduct](CODE_OF_CONDUCT.md).

## Slide decks

The Keynote sources are not in this repo. The slide pipeline (`scripts/export-keynote.sh` +
`scripts/optimize-slides.mjs`, macOS-only) regenerates `public/slides/<deck>/` from a `.key`
file. PRs that need slide changes should describe the change; a maintainer re-exports.
