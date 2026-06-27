---
name: theme
description: Change the app's design system and theming — brand colors, dark/light palette, corner radius, fonts, or apply a preset. Use whenever the user wants a different look ("make it blue", "use this brand color #1a73e8", "sharper corners", "warm editorial feel", "apply the ocean preset", "match this brand"). Every project has its own design system; this is how you set it.
---

# theme

Re-theme the whole app by editing design tokens in one place. Because every
shadcn component and page reads from CSS variables, changing the tokens cascades
everywhere — you never restyle components one by one. Read `DESIGN.md` first (token meanings) and `DESIGN-VOCABULARY.md` (the
language of aesthetics/moods, for interpreting requests like "warm editorial").

## The one rule
**Change tokens, not components.** The tokens live in
`apps/web/src/app/theme.css` (light `:root` + `.dark`). Components already use
semantic utilities (`bg-primary`, `text-muted-foreground`, `rounded-lg`). If you
find yourself editing a component's colors to theme the app, stop — fix the token.

## Steps

1. **Understand the request.** A brand color? A whole mood? A preset? A font?
   Sharper/softer corners? If the user gives a hex (e.g. `#1a73e8`), that's the
   `--primary`; build the rest of the palette around it.

2. **Apply a preset if asked.** Presets live in `apps/web/src/app/themes/`
   (e.g. `ocean.css`, `editorial.css`). To apply one, copy its `:root` and
   `.dark` token blocks into `theme.css`, replacing the existing color tokens.

3. **Or set tokens directly.** Edit `theme.css`:
   - **Brand color** → set `--primary` (and `--ring`, usually the same hue).
     Pick a `--primary-foreground` that's readable on it (near-white on dark
     primaries, near-black on light ones).
   - **Whole palette** → shift `background`, `card`, `muted`, `accent`,
     `border` toward the brand hue for a cohesive feel, or keep them neutral for
     a clean look.
   - **Corners** → `--radius` (0 sharp, 0.5rem balanced, 1rem+ soft).
   - **Fonts** → `--font-sans` / `--font-serif`. To load a web font, wire it via
     `next/font` in `layout.tsx` and point `--font-sans` at its variable.

4. **Always do light AND dark.** Every token has a `.dark` value. Update both —
   a half-themed app looks broken in the other mode.

5. **Keep contrast readable.** Body text and buttons should stay legible (aim for
   WCAG AA). oklch makes this easier: keep foreground lightness far from its
   background's. When unsure, nudge lightness, not just hue.

6. **Update DESIGN.md** to describe the new intent (brand, mood, font choices) so
   the design system stays documented, not just encoded in numbers.

7. **Verify.** Run `bun run build` for the web app and, if possible, eyeball the
   pages in both light and dark mode. Colors are easy to get subtly wrong — look.

## Working with oklch
Tokens use `oklch(lightness chroma hue)`: lightness 0–1, chroma 0 (gray) to ~0.3
(vivid), hue 0–360°. To convert a hex brand color, get its oklch equivalent
(any color tool does this) and use it for `--primary`. Keeping the same hue while
varying lightness/chroma gives a coherent palette.

## Output
An updated `theme.css` (light + dark), an updated `DESIGN.md`, and a passing web
build. The whole app reflects the new design system without touching components.
