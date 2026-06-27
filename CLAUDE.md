# CLAUDE.md — Monorepo Guide

This is a Turborepo monorepo with a NestJS API and a Next.js frontend that share
types. Each app has its own `CLAUDE.md` with stack-specific rules — read the one
for the app you're touching. This file covers cross-cutting rules.

## Toolchain

- **Bun** is the package manager and runtime. Use `bun install`, `bun add`,
  `bun add -d`, `bun run <script>`, `bunx <tool>`. Do not use npm/yarn/pnpm.
- **Turborepo** orchestrates tasks across apps (`bun run dev`, `build`, etc).

## Structure

- `apps/api` — NestJS 11 + Fastify API. See `apps/api/CLAUDE.md` and `apps/api/API-CONVENTIONS.md`.
- `apps/web` — Next.js 16 frontend with shadcn/ui. See `apps/web/CLAUDE.md`.
- `packages/shared` — the API contract. Types here are imported by BOTH apps.
- `packages/config` — shared ESLint + Prettier config. Edit a rule here once and
  both apps pick it up. Don't add per-app lint/format rules unless an app
  genuinely needs an exception.

## Dependency versions — READ DEPENDENCIES.md

**Never write a version number from memory.** Your training data lags the real
registry. When adding or upgrading a package, install with `@latest` so Bun
resolves the current version, or check first with `bun pm view <pkg> version`.
See `DEPENDENCIES.md` for the full policy, the `deps:check` / `deps:upgrade`
scripts, and the staged-upgrade workflow for major versions. Upgrading a
framework major (e.g. Next, Prisma, NestJS) requires reading its migration guide
and running its codemod — not a blind bump.

## Documentation: use Context7

This repo has the **Context7 MCP** server configured (`.mcp.json` for Claude
Code, `.cursor/mcp.json` for Cursor). Context7 fetches current, version-specific
docs for any library, so you write code against the real current API, not a
stale memory of it.

**Always use Context7 when you need library/API documentation, setup, or
configuration steps — without being asked.** Before writing non-trivial code
against a framework (Next.js, NestJS, Prisma, Tailwind, shadcn, etc.), pull its
docs via Context7 first. The two tools are `resolve-library-id` (name → ID) then
`query-docs` (ID + your question). Mention the version when it matters, e.g.
"Next.js 16 middleware" or use the ID form like `/vercel/next.js`.

This pairs with the version policy: `@latest` keeps your _versions_ current,
Context7 keeps your _knowledge of their APIs_ current. Use both.

## The one rule that ties it together

**Every change to the API/frontend contract starts in `packages/shared`.** When
you add or change an endpoint:

1. Edit/add the types in `packages/shared/src/index.ts`.
2. Edit the matching DTO + handler in `apps/api` (per its conventions).
3. Edit the client method in `apps/web/src/lib/api.ts` and the UI.

This keeps the two apps in lockstep. Never define a request/response type in only
one app.

## How we build: vertical slices (always)

**Build features as vertical slices, one feature working end-to-end before
starting the next.** This is the default for all feature work — do not build "all
the backend" then "all the frontend," and do not build a UI against data that has
no API behind it. Each feature goes contract → API → UI as one slice, ships
working, then the next feature begins.

For a single feature, the slice order is:

1. **Shared first** — define/extend the contract types in `packages/shared`.
2. **API** — implement the endpoint, validate input, write tests, verify.
3. **Web** — add the client method, build the UI (shadcn components), wrap
   protected pages in `<RequireAuth>`, verify.
4. **Verify the whole repo:** `bun run check` then `bun run build` from root.

Then move to the next feature. The `split-work` skill turns this into waves; the
point of stating it here is that it governs **every** feature, whether or not a
skill is invoked. If implementing the UI reveals the contract was wrong, fix the
shared types and replan (`replan` skill) — don't paper over a mismatch.

## Development workflow — use the skills

This kit ships a complete incremental workflow as skills in `.claude/skills/`:
**plan-feature → split-work → (create-spec) → implement-feature → write-tests →
verify → commit → replan? → review/security-scan → ship**. See WORKFLOW.md.

Ask **"where are we now?"** any time — the `status` skill reconciles every
spec's `tasks.md` against git history and reports done / in-progress / not-started
per feature, correcting any stale checkboxes.

Key parts are **enforced mechanically**, not just instructed: a pre-commit hook
formats/lints staged files, commitlint requires Conventional Commits, a pre-push
hook runs the full `scripts/verify.sh` gate, and CI re-runs it with a coverage
floor. You can't commit unformatted code or push a red gate.

- Start every non-trivial feature with `plan-feature` (clarify + scope).
- Large features get a spec via `create-spec`, then `implement-feature` builds
  them wave by wave.
- Run the `verify` gate after every wave; finish with `ship`.
- Build incrementally: small waves, verified and committed one at a time.

## Commands (from repo root)

```
bun run dev          # run both apps (turbo)
bun run check        # lint + typecheck across all packages
bun run build        # build all
bun run test         # test all
bun run deps:check   # show dependencies behind latest
bun run deps:upgrade # bump all to latest, then install
```

## Definition of Done

A feature or wave is **done** only when all of these are true:

1. Contract types are in `packages/shared` (not duplicated in an app).
2. Every input is validated (DTOs on the API; typed client calls on the web).
3. Tests cover the behavior and each error branch (see the `write-tests` skill) —
   not tautological tests.
4. The verify gate is green: `bun run check`, `bun test`, `bun run build`.
5. It's committed as one atomic Conventional Commit.
6. If a spec exists, `specs/{feature}/tasks.md` is updated to match what was
   committed.

"Looks done" is not done. If any item is unmet, it's not finished.

## Project domain

Project-specific rules — the data model and domain conventions — live in
`DOMAIN.md`. Read it before building features. It's a per-project file: fill it in
for your app (entities, relationships, and conventions like how money, dates, or
IDs are handled). When a feature changes the data model, update `DOMAIN.md` too.

## Conventions

- **Reuse before you write.** Before adding a function, type, component, or
  helper, check whether one already exists — don't create a second version of
  something the codebase already has. Search first (grep/your editor's search) for
  the name and for similar logic. Where shared things live:
  - **Cross-app types** (request/response, domain models) → `packages/shared/src`.
  - **Web utilities/helpers** → `apps/web/src/lib` (e.g. `api.ts`, `utils.ts`).
  - **Web UI** → reuse shadcn components in `apps/web/src/components/ui`; compose
    them, don't hand-roll a new styled element that already exists.
  - **API cross-cutting code** (guards, filters, decorators, pipes) →
    `apps/api/src/common`.
  - **API domain logic** → the relevant service; call the existing service rather
    than re-querying the database from a new place.
    If you find near-duplicate logic, extract it to the right shared home and have
    both callers use it. `bun run dupes` flags copy-paste.
- **Logging:** the API uses **Pino** (structured JSON, request ids, secret
  redaction) via `nestjs-pino` — inject `PinoLogger`, never use `console.*`. Log
  meaningful events/errors; **never log secrets, tokens, or passwords.** See
  `apps/api/src/config/logger.config.ts`.
- **Error handling:** throw Nest exceptions (`NotFoundException`, etc.); the global
  filter standardizes them. **Full stack + context is logged server-side; the
  client only gets a safe message + request id — never a stack trace or internal
  detail.** Don't swallow errors or return 200 on failure. The web app must handle
  **loading, error, and empty states** for every async view.
- **Secrets & config:** all secrets and environment-specific values come from env
  vars (`.env`, never committed). Never hardcode a secret, key, or URL that
  differs by environment. Every var is documented in `ENVIRONMENT.md`; add new
  ones to the Zod schema (`env.validation.ts`) **and** `env.example` **and**
  `ENVIRONMENT.md`.

## Hard rules

- **Ask, don't assume.** If a requirement is ambiguous, ask before building —
  confidently building the wrong thing is the most expensive mistake.
- Resolve dependency versions at install time, never from memory (see DEPENDENCIES.md).
- Build features as vertical slices: contract → API → UI, one feature end-to-end before the next. Never all-backend-then-all-frontend.
- Contract types live only in `packages/shared`.
- The frontend never calls `fetch` directly — always through `apps/web/src/lib/api.ts`. **(enforced: ESLint blocks `fetch` outside the api client.)**
- The frontend builds UI from shadcn/ui components in `apps/web/src/components/ui`.
- The API protects every route by default; the web app guards every private page.
- Don't break the `{ data: ... }` response wrapper — both sides depend on it.
- Never return `passwordHash` or secrets from an endpoint. **(enforced: a test fails if the users service leaks it.)**
- Before shipping auth, payment, or user-data code, do a security review — see
  `SECURITY.md` (and the `security-scan` skill).

## Enforced patterns (mechanically, not just by instruction)

Some patterns are gates, not suggestions — the build fails if you break them:

- **No `fetch` outside the api client** — ESLint (`no-restricted-globals`),
  `src/lib/api.ts` exempted.
- **No hardcoded color classes** (`bg-[#...]`) — ESLint (`no-restricted-syntax`);
  use `theme.css` tokens.
- **No bare `console.*` in the API** — ESLint (`no-console`, allows warn/error);
  use the NestJS `Logger`.
- **API never returns `passwordHash`** — a unit test asserts the users service's
  select is secret-free.
- **Every service has a test** — `scripts/check-test-presence.sh` fails the gate if
  a `*.service.ts` has no matching `*.service.spec.ts` (so "skipped writing tests"
  can't pass). Checks presence; the coverage floor guards depth.
- Plus the always-on gate: format, lint, typecheck, tests, build, duplicate-check
  (`scripts/verify.sh`, via hooks + CI).

Don't try to satisfy these by disabling the rule — fix the code.

## Anti-patterns (don't do these)

- Hardcoding colors in components (`bg-[#1a73e8]`) instead of tokens (`bg-primary`).
- Calling `fetch` directly in the web app instead of `apps/web/src/lib/api.ts`.
- Writing a new helper/component/type when one already exists — search first.
- Copy-pasting a block instead of extracting it to a shared home (`bun run dupes`).
- Business logic in controllers — it belongs in services.
- Adding a dependency with a version from memory instead of `@latest`.
- Bypassing git hooks with `--no-verify` (except a stated emergency).
- Returning `passwordHash` or other secrets from an endpoint.
- Logging secrets, tokens, or passwords.
- Shipping a UI view with no loading or error state.
- Defining a request/response type in only one app instead of `packages/shared`.
- Editing component colors to re-theme instead of editing `theme.css` tokens. **(enforced: ESLint blocks hardcoded color classes.)**
