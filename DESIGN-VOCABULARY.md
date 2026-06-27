# DESIGN-VOCABULARY.md — Words to describe a design system

A vocabulary for telling the agent (or Claude Design) what you want. Naming an
aesthetic sets many tokens at once and gives a more coherent result than
specifying colors one at a time. Pair a named style with a concrete detail (a hex
color, a font, "sharp corners") to hit the target. Use these with the `theme`
skill — e.g. "make it minimal and premium, monochrome, sharp corners."

> These terms aren't perfectly standardized — "minimal" or "modern" mean
> slightly different things to different people. An aesthetic is a _direction_,
> not a finished design; set the tokens, then look at the result and nudge.

## Named aesthetics (the whole vibe)

Each implies a bundle of choices — color, type, spacing, shape.

- **Minimal / clean** — whitespace, few colors, neutral, restrained
- **Editorial** — magazine-like, serif headings, generous spacing, content-first
- **Brutalist** — raw, high-contrast, sharp corners, mono/grotesque fonts
- **Neo-brutalist** — bold colors, thick black borders, hard drop shadows, chunky
- **Glassmorphism** — frosted translucent panels, blur, soft layering
- **Neumorphism / soft UI** — extruded look, subtle inner/outer shadows
- **Material** — elevation/shadows, bold color, motion (Google's system)
- **Flat** — no shadows or gradients, solid color blocks
- **Skeuomorphic** — mimics real-world textures/objects (deliberate, rare)
- **Corporate / enterprise** — conservative, trustworthy, blue-leaning, dense
- **Playful** — rounded, bright, friendly, illustrative
- **Luxury / premium** — restrained, high contrast, refined type, lots of space
- **Retro / vintage** — period palettes (70s earth, 80s neon, 90s web)
- **Y2K** — chrome, gradients, bubbly, glossy
- **Cyberpunk / neon** — dark base, electric accents, glow
- **Swiss / International typographic** — grid-driven, Helvetica-like, ordered
- **Bauhaus** — primary colors, geometric shapes, functional

## Mood / tone words (the feeling)

warm / cool · soft / sharp · calm / energetic · serious / friendly ·
elegant / bold · understated / loud · organic / geometric · airy / dense ·
approachable / authoritative · modern / classic / timeless · premium / accessible

## Color direction

- **Hue:** "blue brand", "earthy/warm tones", "monochrome", "muted pastels",
  "jewel tones", "neon accents"
- **Saturation:** vivid / saturated vs. muted / desaturated / washed-out
- **Lightness:** light/airy vs. dark/moody; "dark-mode-first"
- **Palette structure:** monochromatic, analogous, complementary,
  "single accent color on neutral"
- **Contrast:** high-contrast vs. low-contrast/subtle

## Typography direction

- **Family:** serif, sans-serif, slab serif, monospace, grotesque, geometric
  sans, humanist sans, display
- **Pairing:** "serif headings, sans body" (classic editorial), "all-mono for a
  technical feel", "rounded font for friendliness"
- **Weight/scale:** "big bold headings", "light and delicate", "tight dense type",
  "generous line height"

## Shape & form

- **Corners:** sharp (radius 0), soft/rounded, pill-shaped → the `--radius` token
- **Borders:** borderless, hairline, thick/bold
- **Elevation:** flat (no shadows), subtle shadows, dramatic/hard shadows
- **Density:** spacious/airy vs. compact/dense (information density)

## Stacked example prompts

The best prompts combine an aesthetic + mood + color + type:

- "minimal and premium, monochrome, sharp corners, geometric sans"
- "playful and warm, bright pastels, rounded font, soft shadows"
- "brutalist and high-contrast, black-and-white, thick borders, monospace"
- "corporate and trustworthy, blue palette, clean sans, subtle elevation"
- "editorial and elegant, warm cream background, serif headings, lots of whitespace"
- "dark-mode-first cyberpunk, near-black base, electric cyan accent, mono"

## Where the values live

This file is the _language_. The actual tokens are in
`apps/web/src/app/theme.css`, the intent is in `DESIGN.md`, and presets are in
`apps/web/src/app/themes/`. The `theme` skill turns a prompt from this vocabulary
into token edits.
