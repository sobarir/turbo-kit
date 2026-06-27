# AGENTS.md

Monorepo: a NestJS API (`apps/api`) and a Next.js frontend (`apps/web`) sharing
types (`packages/shared`). This file applies to all agents (Codex, Cursor, Claude,
etc.). The full guide is **CLAUDE.md** — read it; each app also has its own
`CLAUDE.md`.

## Core rules (these govern every change)

- **Build features as vertical slices.** One feature, end-to-end, before the next:
  contract types (`packages/shared`) → API → UI. Never build all-backend then
  all-frontend, and never build UI against data that has no API. If the UI reveals
  the contract was wrong, fix the shared types and replan.
- **Contract first.** Every API/frontend contract change starts in
  `packages/shared`; both apps import those types. Never define a request/response
  type in only one app.
- **Reuse before you write.** Search for an existing function/type/component/helper
  before adding one. Shared homes: cross-app types → `packages/shared/src`; web
  helpers → `apps/web/src/lib`; web UI → `apps/web/src/components/ui`; API
  cross-cutting code → `apps/api/src/common`; domain logic → the existing service.
  Extract near-duplicate logic instead of copy-pasting. `bun run dupes` flags it.
- **Toolchain is Bun.** `bun install`, `bun add`, `bun run <script>`, `bunx`.
- **Never write dependency versions from memory** — install with `@latest` or check
  the registry. See DEPENDENCIES.md.
- **Use Context7 MCP** for current library/API docs before writing framework code.
- **Verify gate after every wave:** `bun run check`, `bun test`, `bun run build`
  must pass. Enforced by git hooks + CI — don't bypass.
- **The frontend never calls `fetch` directly** — always via `apps/web/src/lib/api.ts`.
- **The API protects every route by default;** the web app guards every private page.
- **Don't break the `{ data: ... }` response wrapper** — both sides depend on it.
- **Logging:** use the structured logger (NestJS `Logger`), never bare
  `console.log`; never log secrets, tokens, or passwords.
- **Error handling:** API errors are proper HTTP status codes via Nest exceptions,
  never swallowed; the web app handles loading, error, and empty states for every
  async view.
- **Secrets & config:** all secrets/env-specific values come from env vars
  (`.env`, never committed). Document every var in `ENVIRONMENT.md` and add it to
  the Zod schema + `env.example`. Never hardcode a secret.
- **Security review** required before shipping auth, payment, or user-data code —
  see `SECURITY.md` and the `security-scan` skill.

## Definition of Done

Done means: contract types in `packages/shared`; inputs validated; tests cover
behavior + error branches; verify gate green (`bun run check`, `bun test`,
`bun run build`); committed as one Conventional Commit; `tasks.md` updated if a
spec exists. "Looks done" is not done.

## Project domain

Per-project data model and domain rules live in `DOMAIN.md` — read it before
building, and update it when the data model changes.

## Ask, don't assume

If a requirement is ambiguous, ask before building. Confidently building the
wrong thing is the most expensive mistake.

## Enforced patterns (build fails if broken)

These are gates, not suggestions: no `fetch` outside `src/lib/api.ts` (ESLint);
no hardcoded color classes like `bg-[#...]` (ESLint — use theme.css tokens); no
bare `console.*` in the API (ESLint — use NestJS `Logger`); the API never returns
`passwordHash` (a test asserts it); every `*.service.ts` must have a matching
`*.service.spec.ts` (test-presence gate). Fix the code, don't disable the rule.

## Workflow

Use the skills in `.claude/skills/` (mirrored in `.agents/skills/`):
**plan-feature → split-work → create-spec (large) → implement-feature →
write-tests → verify → commit → replan? → review/security-scan → ship.** Each
feature is a vertical slice built wave by wave. Ask **"where are we now?"** any
time for a reconciled status. See WORKFLOW.md for the full loop.

## Theming

Design tokens live in `apps/web/src/app/theme.css`; change them (or use the
`theme` skill), never hardcode colors in components. See DESIGN.md and
DESIGN-VOCABULARY.md.
