# CLAUDE.md — Web App Agent Guide

This is the **Next.js (App Router) frontend** for the monorepo. It talks to the
NestJS API in `apps/api`. Read this before changing frontend code. The root
`CLAUDE.md` covers monorepo-wide rules.

## Stack

- **Next.js 16 (App Router)** + React 19, TypeScript strict. Turbopack is the
  default bundler. Request APIs (`cookies()`, `headers()`) are async-only.
- **`@repo/shared`** — all API types come from here. Never redefine a User,
  AuthTokens, or request/response type locally; import it.
- **shadcn/ui** (new-york style) + **Tailwind v4** for all UI. Components live
  in `src/components/ui`. Build screens by composing these, not raw HTML/CSS.

## Testing (two layers)

- **Component tests** — Vitest + React Testing Library, files named `*.test.tsx`
  next to the component. Fast, in-process (jsdom), run in the normal gate
  (`bun run test`). Use for component logic, forms, loading/error/empty states.
  References: `src/components/ui/button.test.tsx`, `src/app/login/page.test.tsx`.
  Mock boundaries (`next/navigation`, contexts), drive with `userEvent`, assert
  on what the user sees. See the `write-tests` skill.
- **E2E tests** — Playwright, in `e2e/*.spec.ts`. Real browser against the running
  app + API. Run in a **separate CI job**, not the fast gate; locally via
  `bun run test:e2e`. Use only for critical multi-step flows (login, checkout).
  Reference: `e2e/auth.spec.ts`. See the `write-e2e-tests` skill — and keep them
  non-flaky (wait on conditions, never sleeps).

## Vertical slices

Features are built as vertical slices — the contract types and API come before
the UI for a feature, and one feature ships working end-to-end before the next.
So when you build a screen, its API endpoint and `packages/shared` types should
already exist (or you build them first). Don't build UI against data with no API
behind it. See the root CLAUDE.md / WORKFLOW.md.

## The API contract (do not break)

- Base URL is `NEXT_PUBLIC_API_URL` (default `http://localhost:3000/api`).
- Successful responses are `{ data: ... }`. The API client unwraps this for you —
  call `api.*` and you get the inner value typed.
- Errors come back as `{ statusCode, error, timestamp }`. The client throws
  `ApiClientError(status, message)`. Catch it and show `e.message`.
- Auth is JWT. The client attaches the access token and **auto-refreshes** on a
  401 using the refresh token, then retries once. Don't reimplement this.

## How to add an API call

1. Add the types to `packages/shared/src/index.ts` (and the matching DTO on the
   API side). One source of truth.
2. Add a method to `src/lib/api.ts` under the right namespace (`auth`, `users`,
   `ai`). Use the `request<T>()` helper — never call `fetch` directly in a page.
3. Use it from a component. Wrap protected pages in `<RequireAuth>`.

## Documentation: use Context7

Use the Context7 MCP (configured at the repo root) to pull current Next.js 16,
React 19, Tailwind v4, and shadcn/ui docs before writing non-trivial UI or
data-fetching code. These move fast between versions — fetch the real docs
rather than relying on memory.

## Theming & design system

The whole app's look is controlled by design tokens in
`src/app/theme.css` (colors, radius, fonts — light + dark). Every component reads
these via semantic Tailwind utilities (`bg-primary`, `text-muted-foreground`,
`rounded-lg`), so changing a token re-themes everything. **Never hardcode colors
in components** (`bg-[#1a73e8]` is wrong; `bg-primary` is right) — that's what
makes re-theming one-file-deep.

- To change the design system, edit `theme.css` and `DESIGN.md` together, or use
  the `theme` skill ("make the brand color #1a73e8", "apply the ocean preset").
- Presets live in `src/app/themes/`. See `DESIGN.md` for the full token reference.

## Adding UI components

Use shadcn/ui. To add a component, run `bunx shadcn@latest add <name>` (e.g.
`button`, `dialog`, `form`). It writes to `src/components/ui`. Compose those
primitives; don't hand-roll styled divs when a shadcn component exists.

## Rules

- Never write a dependency version from memory; use `@latest` (see DEPENDENCIES.md).
- Build UI from shadcn components in `src/components/ui`; use the `cn()` helper
  from `@/lib/utils` for class merging.
- All API access goes through `src/lib/api.ts`. No raw `fetch` in components.
- All shared types come from `@repo/shared`. No duplicated interfaces.
- Auth state comes from `useAuth()`. Don't read tokens directly in components.
- Protected pages use `<RequireAuth>` (redirects to `/login`).
- Run `bun run check` (lint + typecheck) before finishing.

## Commands (from repo root or this app)

```
bun run dev          # both API + web via Turbo (root), or `next dev` here (port 3001)
bun run check        # lint + typecheck
bun run build        # production build
```
