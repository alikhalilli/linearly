# Drawings

Every figure on the site IS its `.excalidraw` source, exported 1:1 with
Excalidraw's own engine. The sources in this folder are the single truth;
the inline SVG in the lecture MDX is generated from them and never edited
by hand.

## Workflow

1. Edit the `.excalidraw` file: open it at
   [excalidraw.com](https://excalidraw.com) (menu, Open) or in the VS Code
   Excalidraw extension, or regenerate it from a script when the figure's
   numbers change. Geometry is computed, never eyeballed (see AGENTS.md).
2. Export it into the lecture:
   `node scripts/export-figures.mjs src/content/lectures/lecture-NN.mdx`
   The exporter maps the palette to theme CSS variables, keeps chip-mode
   text in dark ink, strips embedded fonts (the site hosts one shared
   Virgil subset), and preserves each figure's aria-label and responsive
   floor.
3. Prove it: `node scripts/render-excalidraw.mjs drawings/lecture-NN/...`
   renders the source exactly as Excalidraw would; the built page must
   show the same drawing. Screenshot both themes and read them.
4. Commit the `.excalidraw` source and the regenerated MDX in one PR.

## Style rules

- Hand-drawn Excalidraw look: roughness as drawn, Virgil lettering. This
  is the site's figure identity; do not "clean it up".
- A filled region must be a `line` element with a closed point ring and
  `polygon: true`. Excalidraw never fills an `arrow`, whatever its
  backgroundColor; this silently shipped eight fill-less figures once.
- Colors from the light-theme palette hexes only (the exporter maps them):
  ink `#141414`, accent `#2e4fe8`, warm `#c75000`, green `#0e7a3d`, part
  pastels `#b8ff9f #a6faff #ffa6f6 #ffdd57 #ffb443 #c4a1ff`. The color
  canon and the chip/region fill modes are defined in CONTRIBUTING.md.
- If the subset font misses a new glyph, rebuild
  `public/fonts/virgil-subset.woff` (the pipeline scripts document how).
- Excalidraw computes the export bounds from each text element's **stored**
  `width`, so an underestimated width silently clips the text with no error
  anywhere. When generating text elements, store a generous width (an upper
  bound on the true ink; Virgil runs about 0.41 to 0.50 of
  `characters * fontSize` depending on the glyph mix). Reading the render is
  the only check that catches this.
- Label every arrow and region. A diagram should make sense away from its
  article.
- One idea per drawing. If it needs a paragraph to explain, split it.
- One folder per lecture, one file per figure, named for what it shows:
  `drawings/lecture-01/fig-1-dimension-ladder.excalidraw`.

## Animation beats

Every exported figure can replay itself through the play chip beside its
label, stepping in beats like a teacher drawing at a board. The default
beat order is the element order of the source, which is the order you
authored the story; dense figures are auto-chunked to about ten beats.
To curate a figure deliberately, set on elements in the source:

- `customData.seq` (integer): the beat this element belongs to. Elements
  sharing a value appear together. seq reorders time, never paint: z-order
  is untouched, so occlusion-dependent figures are safe to re-sequence.
- `customData.note` (string, seven words or fewer, house voice): a
  micro-caption shown under the figure while that beat is current.

Only curate figures whose default order mistells the story. A five-element
figure in perfect order needs nothing.
