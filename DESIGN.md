# DESIGN.md — Design System

This file defines the app's design system: the visual language every screen and
component should follow. Agents read this to stay consistent; you edit it (or ask
the agent to) when you want a different look. The _values_ live in
`apps/web/src/app/theme.css`; this file is the human-readable intent behind them.

> **Vocabulary:** see `DESIGN-VOCABULARY.md` for the language to describe a
> look (aesthetics, moods, color/type/shape terms, and stacked example prompts).
>
> **Per-project theming:** every project has its own look. To re-theme, change
> `theme.css` and this file together — or just tell the agent (see the `theme`
> skill): "make the brand color #1a73e8 and the corners sharp", or "apply the
> ocean preset". The agent updates the tokens and keeps components consistent.

## How theming works (the mechanism)

- **One source of truth:** `apps/web/src/app/theme.css` holds all visual tokens
  (colors, radius, fonts) as CSS variables, for light and dark mode.
- **Tokens cascade everywhere:** `globals.css` maps those variables to Tailwind
  utilities (`bg-primary`, `text-muted-foreground`, `rounded-lg`, `font-sans`).
  Every shadcn component and page uses these utilities, so changing a token in
  `theme.css` re-themes the whole app — no per-component edits.
- **Presets:** ready-made themes live in `apps/web/src/app/themes/` (e.g.
  `ocean.css`, `editorial.css`). Applying one means copying its tokens into
  `theme.css`.

## Color tokens (what each one is for)

Don't use raw hex/oklch in components — always use the semantic token so theming
works. Each has a `-foreground` pair for text/icons placed on top of it.

| Token                                    | Use for                                                |
| ---------------------------------------- | ------------------------------------------------------ |
| `background` / `foreground`              | Page background and default text.                      |
| `card` / `card-foreground`               | Card surfaces and their text.                          |
| `popover` / `popover-foreground`         | Menus, dropdowns, tooltips.                            |
| `primary` / `primary-foreground`         | Main brand color: primary buttons, key actions, links. |
| `secondary` / `secondary-foreground`     | Secondary buttons, subtle surfaces.                    |
| `muted` / `muted-foreground`             | De-emphasized backgrounds and secondary text.          |
| `accent` / `accent-foreground`           | Hover states, highlights.                              |
| `destructive` / `destructive-foreground` | Delete/danger actions, errors.                         |
| `border` / `input` / `ring`              | Borders, input borders, focus rings.                   |

## Typography

- `--font-sans` — default UI font (body, buttons, most text).
- `--font-serif` — for editorial/heading styles when a theme wants them.
- `--font-mono` — code, numeric/tabular data.

Set these in `theme.css`. To load a web font (e.g. via `next/font`), wire it in
`layout.tsx` and assign its CSS variable to `--font-sans`.

## Shape & spacing

- `--radius` controls corner roundness globally. `0` = sharp/brutalist,
  `0.5rem` = balanced, `1rem+` = soft/friendly. Components use `rounded-md`,
  `rounded-lg` etc., which derive from `--radius`.
- Spacing follows Tailwind's scale (`p-4`, `gap-6`, …). Keep spacing consistent;
  prefer the scale over arbitrary pixel values.

## Component conventions

- **Build UI from shadcn/ui components** in `src/components/ui`. Don't hand-roll
  styled `<div>`s when a component exists. Add new ones with
  `bunx shadcn@latest add <name>`.
- **Style with semantic tokens**, never raw colors. `bg-primary`, not
  `bg-[#1a73e8]`. This is what makes re-theming one-file-deep.
- **Compose with `cn()`** (from `@/lib/utils`) for conditional classes.
- **Respect dark mode**: every token has a `.dark` value; don't bypass it with
  fixed colors.

## When changing the design system

1. Update `theme.css` (the values) **and** this file (the intent) together.
2. Keep light and dark in sync — every token needs both.
3. Check contrast: text on its background should stay readable (WCAG AA where it
   matters — body text, buttons).
4. Verify nothing hardcodes a color that should be a token.
