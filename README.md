# Turbo Kit — Full-Stack Agentic Starter

A Turborepo monorepo: a **NestJS API** and a **Next.js frontend**, sharing types,
wired together with JWT auth and auto token-refresh. Built so coding agents extend
both sides consistently.

## Layout

```
turbo-kit/
├── apps/
│   ├── api/          # NestJS 11 + Fastify + Prisma 7 + Passport/JWT + AI
│   └── web/          # Next.js 16 + shadcn/ui frontend
├── packages/
│   ├── shared/       # API contract types (imported by BOTH apps)
│   └── config/       # shared ESLint + Prettier config (used by BOTH apps)
├── turbo.json
└── package.json      # npm workspaces + turbo
```

The `@repo/shared` package is the key to the connection: the API's response
wrapper and the frontend's API client both import the same `User`, `AuthTokens`,
and request/response types, so the contract can't silently drift.

## What's included

**API (`apps/api`)** — register/login/refresh/logout with argon2-hashed
passwords and hashed, rotating refresh tokens; protected `/users/me` + profile
update; admin-only user list; provider-agnostic AI endpoint; global guard,
validation, error filter; Jest + Supertest; CI.

**Web (`apps/web`)** — Next.js 16 + React 19, built with **shadcn/ui** (new-york)
and **Tailwind v4**. Login and register UIs wired to JWT auth; a protected
dashboard and profile page; an API client that attaches the access token and
**auto-refreshes on 401** then retries; auth React context + `<RequireAuth>`
route guard.

## Create a new app

The fastest way to start a new project from this kit:

```bash
npx create-turbokit-app@latest my-app
```

This scaffolds a fresh copy, sets the project name, generates new JWT secrets,
and (optionally) installs deps and inits git. Use `--yes` for a non-interactive
run. See `packages/create-turbokit-app/` for the CLI itself.

If you're working from a clone of this repo instead, follow the Quick start below.

## Quick start

```bash
# 1. Install everything (Bun workspaces). postinstall runs `prisma generate`.
bun install

# 2. Configure
cp apps/api/env.example apps/api/.env     # set JWT secrets
cp apps/web/env.example apps/web/.env.local

# 3. Database (Prisma 7)
cd apps/api && docker compose up -d && bun run db:migrate && bun run db:seed && cd ../..

# 4. Run both apps together
bun run dev
```

Requires [Bun](https://bun.sh) and Node 20+ (Next 16 / Prisma 7 minimum).

- API: `http://localhost:3000/api`
- Web: `http://localhost:3001`

Seeded login: `admin@example.com` / `Password123!`

## How they connect

1. The web app's `src/lib/api.ts` calls the API at `NEXT_PUBLIC_API_URL`.
2. On login, tokens are stored; the access token is attached to every request.
3. On a 401, the client transparently calls `/auth/refresh`, stores the new
   tokens, and retries the original request once.
4. The API allows the web origin via `CORS_ORIGIN` (defaults to the web port).

## Monorepo commands

```
bun run dev          # run api + web together (turbo)
bun run build        # build all
bun run check        # lint + typecheck across the repo
bun run test         # run tests across the repo
bun run lint         # ESLint across both apps (shared config)
bun run format       # Prettier across the repo (shared config)
bun run deps:check   # show dependencies behind latest
bun run deps:upgrade # bump all to latest, then install
```

## Shared lint & format config

Both apps consume one ESLint and one Prettier config from `packages/config`, so
style can't drift between frontend and backend:

- `@repo/config/eslint/base` — shared TypeScript flat config (used by the API).
- `@repo/config/eslint/next` — composes the base with Next's rules (used by web).
- `@repo/config/prettier` — one Prettier config; each app's `.prettierrc`
  re-exports it.

To change a lint rule or format setting for the whole repo, edit it once in
`packages/config`. Both apps run on ESLint 9 flat config.

## Agent layer & workflow

Both apps carry agent docs (`CLAUDE.md`), and the repo ships a **complete
incremental-development workflow** as skills in `.claude/skills/` (mirrored to
`.agents/skills/` for Codex/Cursor):

```
plan-feature → split-work → create-spec → implement-feature → verify → review/security-scan → ship
```

- **plan-feature** — clarify scope, pull current docs, decide spec-vs-direct
- **split-work** — break the plan into parallel, verifiable waves
- **create-spec** — for large features: requirements + waves + manual actions
- **implement-feature** — build wave by wave with a gate between each
- **verify** — lint + typecheck + tests + build (red = not done)
- **review / security-scan** — convention and security passes
- **ship** — final gate, summary, manual actions, PR description

See `WORKFLOW.md` for the full loop. The skills trigger from their descriptions
when a task matches — no slash commands needed.

Configuration is documented in **`ENVIRONMENT.md`** (every env var, plus how
`NODE_ENV=production` switches logging to JSON and other dev→prod behavior).

Two files worth knowing: **`DOMAIN.md`** holds your project's data model and
domain rules (fill it in per project; it ships with a commented e-commerce
sample), and the **Definition of Done** in `CLAUDE.md` is the bar every feature
must clear (types shared, inputs validated, behavior tested, gate green,
committed).

## Tutorial: build an e-commerce app with Claude Code

A complete, copy-pasteable walkthrough — every prompt you'd type into Claude
Code, in order. It shows the full loop on a real app: catalog → cart → checkout →
orders → admin. Adapt the wording freely; the prompts are a starting point, not a
script you must follow verbatim.

### 0. One-time setup

```bash
bun install
cp apps/api/env.example apps/api/.env          # set JWT_SECRET + JWT_REFRESH_SECRET
cp apps/web/env.example apps/web/.env.local
cd apps/api && docker compose up -d && bun run db:migrate && bun run db:seed && cd ../..
bun run dev                                     # API :3000, web :3001 — confirm it runs
```

Then initialize git and push to a remote so CI and branch protection work:

```bash
git init && git add -A && git commit -m "chore: initial commit from starter kit"
# create a repo on your host, then:
git remote add origin <your-repo-url> && git push -u origin main
```

Open the project in Claude Code (`claude` in the repo root, or the desktop app).
It auto-reads `CLAUDE.md`, the skills in `.claude/skills/`, and `.mcp.json`.

**Verify Context7 is connected** (this keeps generated code current):

```
/mcp
```

You should see `context7` listed. **Enable branch protection** on `main` in your
repo settings and make the CI check required — otherwise the local hooks can be
bypassed with nothing behind them.

### 1. Plan the whole app

First, capture your domain rules **once** in `DOMAIN.md` (it ships as a template
with a commented e-commerce sample). Fill in the entities and conventions — prices
in cents, products have variants, inventory as a stock count, order statuses, etc.
That way every session shares them and you don't restate them in prompts.

Then map the app into features. Don't dive into code. Paste:

```
I'm building an e-commerce web app on this kit. Before any code, use the
plan-feature skill. I've filled in DOMAIN.md with the data model and conventions
— read it.

Scope: a product catalog with categories, product detail pages, a shopping cart,
checkout with Stripe payments, order history for customers, and an admin area to
manage products and orders. Single store, not multi-vendor.

Break this into a sequence of features I can build one at a time, in dependency
order. For each, note anything that needs an external service or a decision from
me. Don't write code yet — just the roadmap.
```

Claude Code runs `plan-feature`, may ask a few clarifying questions, and returns
a feature roadmap. Read it. If the order or scope looks wrong, say so now — this
is the cheapest moment to change direction.

### 1b. Set the design system (optional but do it early)

Before building screens, lock in the look so every feature is consistent:

```
Use the theme skill. This is a fashion store — make it minimal and editorial:
off-white background, near-black primary, sharp corners (small radius), and a
serif font for headings. Update theme.css and DESIGN.md for both light and dark,
then build the web app to confirm it compiles.
```

Or apply a preset: `Apply the ocean theme.` Re-theming later is also one prompt —
it only touches `theme.css`, not your components.

### 2. Feature 1 — Product catalog (spec + build)

Each feature is one full cycle. Start with a spec so progress is durable:

```
Use create-spec for the product catalog feature. Include the Prisma models
(Product with variants, Category, stock count, prices in cents), the API
endpoints (list/detail/CRUD), the storefront UI (catalog grid + product detail
page using shadcn), and admin CRUD. Break it into dependency waves and list any
manual setup steps. Don't implement yet — write the spec so I can review it.
```

Claude Code writes `specs/product-catalog/` (requirements, tasks, manual-actions).
**Review `specs/product-catalog/requirements.md` and `tasks.md`.** When it looks
right:

```
The spec looks good. Implement it with the implement-feature skill. Build it wave
by wave: write real tests for each wave (use the write-tests skill), run the
verify gate, and commit each wave as its own conventional commit before moving on.
Pause after each wave so I can review.
```

It builds wave by wave — typically shared types + schema → API → web → admin —
verifying and committing each. Review the diff at each pause.

When the feature is done:

```
Use the ship skill to finalize the product catalog: run the full gate, do the
review and security-scan passes, reconcile tasks.md against git, and give me a
summary with any manual actions.
```

### 3. Feature 2 — Cart

```
Plan the cart feature with plan-feature, then create-spec for it. Cart belongs to
a logged-in user, persists across sessions, holds product variants with
quantities, and validates against stock. Then implement it wave by wave with
tests, verify, and commit each wave. Pause after each wave.
```

### 4. Feature 3 — Checkout & payments (the careful one)

Payments touch money and security — be explicit and review closely:

```
Plan the checkout feature. Use Context7 to pull the current Stripe API and
Stripe Checkout docs before designing anything — do not write Stripe code from
memory. Requirements: create an order from the cart, redirect to Stripe Checkout,
handle the success/cancel return, and confirm payment via a Stripe webhook before
marking the order paid. Prices are already in cents. Card data must never touch
our server — use Stripe's hosted checkout.

Write the spec and list every manual action I must do (Stripe account, API keys,
webhook secret, which env vars to set). Don't implement yet.
```

After you review the spec and complete the manual Stripe steps it lists:

```
Implement the checkout spec wave by wave with tests, verify, and commit each
wave. After implementing, run the security-scan skill specifically on the payment
and webhook code, and show me the webhook signature-verification code for review.
```

Read the payment and webhook code yourself — this is the one place not to trust a
green gate alone.

### 5. Feature 4 — Orders, and Feature 5 — Admin

```
Plan and spec the order history feature: customers view their past orders and
order detail; orders have status (pending, paid, shipped). Implement wave by wave
with tests, verify, commit. Pause after each wave.
```

```
Plan and spec the admin area: an admin-only section (use the existing
@Roles('ADMIN') guard) to manage products and view/update orders. Implement wave
by wave with tests, verify, commit. Pause after each wave.
```

### 6. Resuming after time away

Progress lives in `specs/*/tasks.md` and in git. Whenever you come back:

```
Where are we now?
```

Claude Code runs the `status` skill — reconciles every spec's `tasks.md` against
`git log`, and tells you which features are 100% done, which are in progress and
at which wave, and what to do next. Then continue:

```
Continue the cart feature from where we left off.
```

### Handy mid-build prompts

```
Where are we now?                          # full status report
Show me the spec for checkout.             # review a feature's plan
Replan the cart feature — I want guest carts too.   # change scope mid-stream
Run the verify gate and fix anything red.  # force the full check
Use the review skill on the last wave.     # convention/quality pass
Use security-scan on the auth changes.     # security pass
```

### What the kit already gives you (don't rebuild these)

Auth (register/login/JWT with refresh) is done, so customer accounts and
protected checkout work already; admin role-gating (`@Roles('ADMIN')`) exists;
the web API client auto-refreshes tokens; and the shared-types contract keeps the
storefront and API in sync as you add product/cart/order types.

### Honest cautions

- **The kit is a foundation, not a finished store.** A production shop also needs
  things outside its scope: payment-provider hardening, tax/shipping logic,
  transactional email (order confirmations), rate limiting, and stock-race
  handling at checkout. Plan each as its own feature.
- **Review payment and pricing code by hand.** Everywhere else the gates catch
  problems; for money, read the diff regardless of a green build.
- **Review each spec before implementing.** Scope errors are cheap to fix in
  `requirements.md` and expensive to fix in code.

## Dependency versions

This kit targets current versions and includes a policy so AI agents don't pin
stale ones from memory. See `DEPENDENCIES.md`. TL;DR: install with `@latest`,
use `bun run deps:check` / `deps:upgrade`, and upgrade framework majors
deliberately (read the migration guide, run the codemod, verify the build).

## Live docs: Context7 MCP

Agents in this repo use the **Context7 MCP** server to fetch current,
version-specific library documentation — the documentation half of the currency
story (`@latest` handles versions; Context7 handles knowing their APIs).

- Configured at the repo root: `.mcp.json` (Claude Code), `.cursor/mcp.json` (Cursor).
- Remote endpoint, no local install; works keyless on the free tier.
- Optional `CONTEXT7_API_KEY` for higher rate limits (context7.com/dashboard).

The agent guides instruct agents to consult it before writing framework code.

## Design system & theming

Every project has its own look, so theming is first-class and one-file-deep. All
visual tokens — colors (light + dark), corner radius, fonts — live in
`apps/web/src/app/theme.css`. Every component reads them via semantic utilities
(`bg-primary`, `rounded-lg`), so changing a token re-themes the whole app without
touching components.

Change the design system three ways:

- **Ask the agent** (the `theme` skill): "make the brand color #1a73e8", "sharper
  corners and a serif font", "apply the ocean preset", "match this brand".
- **Edit `theme.css`** directly — it's organized and commented.
- **Apply a preset** from `apps/web/src/app/themes/` (e.g. `ocean`, `editorial`)
  by copying its tokens into `theme.css`.

`DESIGN-VOCABULARY.md` lists the language for describing a look (aesthetics,
moods, color/type/shape terms, stacked example prompts) — handy when telling the
agent what you want. You can also design and fine-tune visually with **Claude
Design** and hand off to Claude Code; see `CLAUDE-DESIGN.md`.

`DESIGN.md` is the human-readable spec of the design system (what each token is
for, typography, conventions). Edit it alongside `theme.css` so intent and values
stay in sync. The rule everywhere: **style with semantic tokens, never raw
colors** — that's what keeps re-theming a one-file change.

## UI: shadcn/ui

The frontend uses shadcn/ui (new-york style) on Tailwind v4. Components live in
`apps/web/src/components/ui`. Add more with:

```bash
cd apps/web && bunx shadcn@latest add dialog form select
```

## License

MIT.
