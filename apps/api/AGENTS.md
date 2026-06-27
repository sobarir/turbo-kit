# AGENTS.md

This project is a NestJS API starter kit set up for agentic development.

The full operating guide lives in **CLAUDE.md** — read it before making changes.
It applies to all agents (Codex, Cursor, Claude, etc.), not just Claude.

Quick summary of the rules:

- Stack: NestJS 11 + Fastify, Prisma 7 + PostgreSQL, Passport/JWT, provider-agnostic AI, Bun test.
- Workflow: plan → scaffold with `bunx nest g resource` → implement per API-CONVENTIONS.md → test → verify.
- Verify means: `bun run check` (lint + typecheck), `bun test`, and `bun run build` must all pass.
- Every route is auth-protected by default; mark public ones with `@Public()`.
- Validate every input with DTOs. Never return passwordHash. Schema changes go through migrations.

See CLAUDE.md for the complete guide and API-CONVENTIONS.md for code patterns.
- Never write dependency versions from memory; install with `@latest`. See DEPENDENCIES.md.
- Use the **Context7 MCP** server for current library/API docs before writing
  framework code. Config is in the repo root `.mcp.json` / `.cursor/mcp.json`.
