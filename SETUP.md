# SETUP — First Run

This kit uses **Bun**, **Next.js 16**, and **Prisma 7**. A couple of first-run
notes so nothing surprises you.

## Prerequisites

- [Bun](https://bun.sh) 1.3+
- Node 20+ (Next 16 and Prisma 7 minimum)
- Docker (for local Postgres) or a hosted Postgres URL

## Steps

```bash
bun install
# ^ postinstall runs `prisma generate`, which creates apps/api/src/generated/prisma
# (gitignored). The API will NOT typecheck or run until this has happened.

cp apps/api/env.example apps/api/.env          # set JWT_SECRET + JWT_REFRESH_SECRET
cp apps/web/env.example apps/web/.env.local
```

Every variable (and how `NODE_ENV=production` switches logging, etc.) is
documented in **ENVIRONMENT.md**. The API validates its env at boot and fails
fast if something required is missing.

```bash
# (continue setup)

cd apps/api
docker compose up -d                            # local Postgres
bun run db:migrate                              # apply Prisma migrations
bun run db:seed                                 # admin@example.com / Password123!
cd ../..

bun run dev                                     # API :3000, web :3001
```

## Why the API needs `prisma generate` first

Prisma 7 generates its client into `apps/api/src/generated/prisma` (not
`node_modules`). That folder is gitignored, so a fresh clone has no client until
you run `bun install` (postinstall) or `bunx prisma generate`. If you see
`Cannot find module '../generated/prisma/client'`, you skipped this step.

## Verify

```bash
bun run check     # lint + typecheck
bun run test      # API unit tests (needs generated client)
bun run build     # build both apps
```

The web app (Next 16 + shadcn) builds and typechecks independently of the
database. The API's tests need the generated Prisma client present.

## Context7 (live documentation for agents)

This kit ships with the **Context7 MCP** server configured so coding agents fetch
current, version-specific library docs instead of relying on training data.

- **Claude Code** reads `.mcp.json` automatically — just open the repo.
- **Cursor** reads `.cursor/mcp.json`.
- No install needed (remote HTTP endpoint). It works **keyless** on the free tier.
- For higher rate limits, set `CONTEXT7_API_KEY` (get one at
  https://context7.com/dashboard) in your environment.

The agent docs instruct agents to use it before writing framework code. You can
also trigger it inline by ending a prompt with `use context7`.

## Git hooks (automatic enforcement)

`bun install` sets up Husky git hooks via the `prepare` script:

- **pre-commit** — formats and lint-fixes staged files (lint-staged).
- **commit-msg** — requires Conventional Commits (commitlint), e.g.
  `feat(api): add billing endpoint`.
- **pre-push** — runs the full `scripts/verify.sh` gate; a red gate can't be pushed.

These make the quality gates mechanical rather than optional. To make CI a
required check too, enable branch protection on `main` in your repo settings.

If hooks aren't running after clone, run `bunx husky` once.

## Tests

- **API + component tests** (the fast gate): `bun run test` from the root.
- **E2E (Playwright)**: first install browsers once —
  `cd apps/web && bunx playwright install chromium` — then `bun run test:e2e`
  (it starts the dev server for you; the API must be able to reach the database).
  E2E also runs as its own CI job on PRs.

## Line endings (Windows)

The repo ships a `.gitattributes` that forces LF line endings, because the shell
scripts and git hooks break with Windows-style CRLF. If `git add` warns "LF will
be replaced by CRLF", it's harmless — the `.gitattributes` keeps the committed
files correct. Optionally quiet the warning with `git config --global
core.autocrlf input`.
