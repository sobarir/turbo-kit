# CLAUDE.md — Agent Operating Guide

This is a **NestJS API starter kit** built for agentic development. You (the coding agent) turn this boilerplate into the user's actual API. Read this file fully before making changes.

`AGENTS.md` (for Codex/Cursor/other tools) points here. This file is the source of truth.

## The Stack (do not change without a stated reason)

- **NestJS 11 + Fastify adapter** — the HTTP framework. Fastify, not Express.
- **TypeScript (strict)** — strict null checks, no implicit any.
- **Prisma 7 + PostgreSQL** — `prisma/schema.prisma` is the source of truth. Uses a
  driver adapter (pg); datasource URL is in `prisma.config.ts`; the client
  generates to `src/generated/prisma` (gitignored — run `bunx prisma generate`).
- **Passport + JWT** — global auth guard; routes are protected by default.
- **Provider-agnostic AI** — `src/ai/` talks to any OpenAI-compatible gateway via env.
- **Bun test + Supertest** — unit specs next to source (`bun:test`), e2e in `test/`.

## Vertical slices

Features are built as vertical slices: for each feature, the shared contract types
and this API's endpoints come first, then the web UI consumes them — one feature
end-to-end before the next. When you add an endpoint, also add/extend its types in
`packages/shared` so the frontend can build against it. See the root CLAUDE.md.

## The Golden Workflow

For every change, follow this loop. The verify step is non-negotiable.

1. **Plan.** Restate the goal. For non-trivial work, ask clarifying questions before assuming. For large/multi-session features, use the `create-spec` skill.
2. **Scaffold with the CLI.** New resource? Run `bunx nest g resource <name>` (choose REST, no CRUD entry points if you want to wire them by hand). Never hand-create module boilerplate the generator produces.
3. **Implement** following `API-CONVENTIONS.md` exactly — DTOs with validation, services own logic, controllers stay thin.
4. **Test.** Every service method gets a unit spec. Every endpoint gets an e2e path. Mock Prisma in unit tests; use the real test DB in e2e.
5. **Verify.** Run `bun run check` (lint + typecheck) and `bun test`. For DB or endpoint changes, run `bun run test:e2e`. Then `bun run build`. Do not finish with a red check.

## Hard Rules

- **Never write a dependency version from memory.** Use `bun add <pkg>@latest`
  or check `bun pm view <pkg> version`. See `DEPENDENCIES.md`.

- **Every route is protected by default.** The global `JwtAuthGuard` enforces this. Mark public routes explicitly with `@Public()`. Never disable the global guard.
- **Never store secrets or raw tokens.** Passwords are argon2-hashed; refresh tokens are stored as SHA-256 hashes. Preserve this. A DB leak must never yield usable credentials.
- **Never return `passwordHash`.** Use the `publicUser` select pattern in `users.service.ts`.
- **Validate every input.** Every request body is a DTO with `class-validator` decorators. The global `ValidationPipe` has `whitelist` + `forbidNonWhitelisted` on — unknown fields are rejected.
- **One error shape.** Throw `HttpException` subclasses (`NotFoundException`, etc.). The global filter formats them. Never invent a new error response shape.
- **Schema changes go through migrations.** Edit `schema.prisma`, then `bun run db:migrate`. Never use `db push` for changes you intend to keep.
- **Don't leak the stack to the client.** No frontend lives here. This is an API.

## Logging & error handling (follow these patterns)

**Logging — Pino, structured, never `console`.** The app uses `nestjs-pino`
(configured in `src/config/logger.config.ts`): JSON logs in production, pretty in
dev, a request id on every line, and automatic redaction of secrets. In a service,
inject the logger and log structured objects:

```ts
constructor(
  @InjectPinoLogger(MyService.name) private readonly logger: PinoLogger,
) {}
// ...
this.logger.error({ err }, 'thing failed');   // object first, message second
```

Never use `console.*` (ESLint blocks it). Never log secrets/tokens/passwords —
they're redacted, but don't rely on it; add new sensitive paths to the `redact`
list in `logger.config.ts`.

**Error handling — throw, don't hand-format.** Throw `HttpException` subclasses
(`NotFoundException`, `BadRequestException`, `ForbiddenException`, …). The global
`AllExceptionsFilter` (`src/common/filters/http-exception.filter.ts`) turns them
into the standard error shape `{ statusCode, error, requestId, timestamp }`.

The filter enforces a key rule: **the server logs the full error (stack trace +
request context) for any 5xx, but the client only ever receives a safe message
and a request id — never a stack trace or internal detail.** So a user can quote
the `requestId` from their error and you can find the exact log line. Don't catch
an exception just to reformat it; let it propagate to the filter.

## Adding a Feature (the canonical path)

`src/users/` is the reference resource. To add a new one, copy its shape:

```
bunx nest g resource widgets   # generates module/controller/service/dto + spec
```

Then:

1. Add the model to `prisma/schema.prisma`, run `bun run db:migrate`.
2. Define DTOs in `widgets/dto/` with validation decorators.
3. Put all logic in `widgets.service.ts`. Inject `PrismaService`.
4. Keep `widgets.controller.ts` thin — it maps HTTP to service calls.
5. Protect with `@Roles('ADMIN')` where needed; use `@CurrentUser()` for the caller.
6. Write `widgets.service.spec.ts` (mock Prisma) and add e2e coverage.
7. Run the verify step.

## Commands

```
bun run start:dev        # dev server (watch)
bun run check            # lint + typecheck — run before every commit
bun test                 # unit tests
bun run test:e2e         # e2e (needs test DB up)
bun run build            # production build
bun run db:migrate       # create + apply a migration
bun run db:studio        # browse the DB
```

## When to Use a Spec

Use the `create-spec` skill for features that span many files, need parallel work, or run across sessions. Otherwise the normal loop above is enough. See `.claude/skills/`.
