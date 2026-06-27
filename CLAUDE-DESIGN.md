# CLAUDE-DESIGN.md — Using Claude Design with this kit

Yes — you can use **Claude Design** to design and fine-tune the look of this app,
and it fits this kit unusually well because of two features: it can **read this
repo's design system**, and it can **hand off to Claude Code**.

> Claude Design is Anthropic's AI design canvas (research preview at the time of
> writing; check the current product page for status and plan availability). It
> generates live HTML/CSS you refine through chat, inline comments, direct canvas
> edits, and adjustment sliders. Details below may have changed — verify against
> Anthropic's current docs.

## Why it pairs with this kit

Two capabilities matter here:

1. **Design-system import.** Before designing, Claude Design can read your brand
   from a GitHub repo, a Figma file, or an uploaded style guide, and extract
   colors, type, and component patterns so every design starts on-brand. This
   kit's design system is already structured for that: `theme.css` holds the
   tokens, `DESIGN.md` describes them, `DESIGN-VOCABULARY.md` gives the language,
   and the shadcn components in `apps/web/src/components/ui` are the patterns.

2. **Claude Code handoff.** When a design is ready, Claude Design packages it into
   a handoff bundle you pass to Claude Code (there's also a `/design` command from
   the terminal). So you can design the look visually, then have Claude Code
   implement it _into this kit_, following the workflow and gates already here.

## Two ways to use it

### A. Fine-tune the theme visually, then bring it back to `theme.css`

Good when you want to _see_ color/spacing/type changes live before committing.

1. In Claude Design, import this repo's design system (point it at your GitHub
   repo, or upload `DESIGN.md` + `theme.css`).
2. Explore looks using the vocabulary in `DESIGN-VOCABULARY.md` — "make it warm
   and editorial with serif headings," adjust with the sliders, comment inline.
3. When you like a direction, read off the resulting colors/radius/fonts and ask
   Claude Code (in this repo): "use the theme skill — set `theme.css` to this
   palette: primary <x>, background <y>, radius <z>, font <f>, light and dark."
   The `theme` skill applies it to the real tokens and verifies the build.

This keeps `theme.css` the single source of truth — Claude Design is the
exploration surface, the kit stays the system of record.

### B. Design a new screen/page, then hand off to Claude Code

Good for laying out a new page (a landing page, a dashboard) before building.

1. Design the screen in Claude Design, on-brand via the imported design system.
2. Use the **Claude Code handoff** to send the design bundle to Claude Code
   pointed at this repo.
3. Tell Claude Code to implement it _through the kit's workflow_: "build this as
   a new page using our shadcn components and `theme.css` tokens — plan it, build
   wave by wave, write tests, verify, commit." It becomes real code under the
   same gates as everything else.

## Keep the kit as the source of truth

A caution worth stating: Claude Design generates its own HTML/CSS. Don't let a
handoff overwrite the kit's structure wholesale — you want the _design intent_
(layout, color, type), re-expressed through this kit's conventions (shadcn
components, semantic `theme.css` tokens, the `{ data }` API contract). When you
hand off, instruct Claude Code to **adapt the design to the kit's components and
tokens**, not to paste raw generated markup. That preserves theming-in-one-file
and everything the workflow depends on.

## Practical notes

- Claude Design shares usage limits with Claude Code and chat, and visual
  exploration can use tokens quickly — explore deliberately.
- It's a complement to Figma/Canva, not a replacement; it also exports to
  PDF/PPTX/HTML/Canva if you need those.
- For pure theming (colors/type/radius), you often don't need Claude Design at
  all — the `theme` skill + `DESIGN-VOCABULARY.md` handles it in one prompt.
  Reach for Claude Design when you want to _see and iterate visually_ or design
  whole new screens.
