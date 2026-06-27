# ENVIRONMENT.md — Configuration & environment switching

All configuration is via environment variables — no secrets or
environment-specific values in code. This file documents every variable, what it
does, and how behavior changes between development and production.

The API **validates its environment at boot** (Zod, in
`apps/api/src/config/env.validation.ts`) and fails fast with a clear message if
anything required is missing or malformed. The schema there is the source of
truth; this file is the human explanation.

## How environments switch

The single most important switch is **`NODE_ENV`**. It changes behavior in
several places:

| `NODE_ENV`    | Logging                                   | Error detail to client            | Other                     |
| ------------- | ----------------------------------------- | --------------------------------- | ------------------------- |
| `development` | Pretty, colorized (`pino-pretty`)         | Safe message only                 | Verbose default log level |
| `production`  | **Structured JSON** (for log aggregators) | Safe message only (never a stack) | Lean default log level    |
| `test`        | As configured                             | Safe message only                 | Used by the test suite    |

So `NODE_ENV=production` flips logs from human-readable to JSON automatically —
you don't configure the format separately. (In both modes, the client never
receives a stack trace; full detail is always logged server-side with a request
id. See the exception filter.)

`LOG_LEVEL` overrides the default verbosity independently of `NODE_ENV` —
`fatal | error | warn | info | debug | trace`. Defaults: `debug` in dev, `info`
in prod.

## API variables (`apps/api/.env`)

Copy `apps/api/env.example` to `apps/api/.env` and fill in. Required unless noted.

| Variable                 | Required | Default (if any)               | What it does                                                                       |
| ------------------------ | -------- | ------------------------------ | ---------------------------------------------------------------------------------- |
| `DATABASE_URL`           | **Yes**  | —                              | PostgreSQL connection string.                                                      |
| `JWT_SECRET`             | **Yes**  | — (min 16 chars)               | Signs access tokens. **Use a long random value; different per environment.**       |
| `JWT_REFRESH_SECRET`     | **Yes**  | — (min 16 chars)               | Signs refresh tokens. **Must differ from `JWT_SECRET`.**                           |
| `JWT_EXPIRES_IN`         | No       | `15m`                          | Access-token lifetime.                                                             |
| `JWT_REFRESH_EXPIRES_IN` | No       | `7d`                           | Refresh-token lifetime.                                                            |
| `PORT`                   | No       | `3000`                         | API port.                                                                          |
| `NODE_ENV`               | No       | `development`                  | Environment switch (see above). Set to `production` in prod.                       |
| `LOG_LEVEL`              | No       | `debug` dev / `info` prod      | Log verbosity.                                                                     |
| `CORS_ORIGIN`            | No       | `http://localhost:3001`        | Allowed browser origin. **Set to your real frontend URL in prod.**                 |
| `AI_API_KEY`             | No       | `''`                           | Key for the AI gateway; AI features need it.                                       |
| `AI_BASE_URL`            | No       | `https://openrouter.ai/api/v1` | OpenAI-compatible gateway base URL.                                                |
| `AI_MODEL`               | No       | `anthropic/claude-3.5-sonnet`  | Model id; change to switch models, no code change.                                 |
| `CONTEXT7_API_KEY`       | No       | — (empty)                      | Optional; higher doc rate limits for the Context7 MCP. Free tier works without it. |

> To add a new API variable: add it to the Zod schema in `env.validation.ts`
> **and** to `env.example` (and this table). The build won't know about a var
> that isn't in the schema, and boot will reject one that's required but unset.

## Web variables (`apps/web/.env.local`)

Copy `apps/web/env.example` to `apps/web/.env.local`.

| Variable              | Required | Default                     | What it does                                                           |
| --------------------- | -------- | --------------------------- | ---------------------------------------------------------------------- |
| `NEXT_PUBLIC_API_URL` | No       | `http://localhost:3000/api` | Base URL the frontend calls. **Set to your deployed API URL in prod.** |
| `CONTEXT7_API_KEY`    | No       | — (empty)                   | Optional, as above.                                                    |

> **`NEXT_PUBLIC_` prefix matters:** Next.js only exposes variables to browser
> code if they start with `NEXT_PUBLIC_`. Anything without that prefix stays
> server-only. **Never put a secret in a `NEXT_PUBLIC_` variable** — it ships to
> the browser.

## Going to production — checklist

- Set `NODE_ENV=production` (switches logs to JSON; lean defaults).
- Generate fresh, long, random `JWT_SECRET` and `JWT_REFRESH_SECRET` (different
  from each other and from any dev values). Rotate if a value may have leaked.
- Point `CORS_ORIGIN` at your real frontend domain (not localhost).
- Point `NEXT_PUBLIC_API_URL` at your deployed API.
- Set `DATABASE_URL` to the production database; run
  `bunx prisma migrate deploy` (not `migrate dev`) to apply migrations.
- Provide real secrets via your host's secret manager — **never commit `.env`
  files** (they're gitignored).
- Consider `LOG_LEVEL=info` (or `warn`) to reduce noise.
- See `SECURITY.md` before shipping auth/payment/user-data code.
