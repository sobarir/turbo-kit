# API-CONVENTIONS.md — How code is structured here

This replaces the UI "design system" of a frontend kit. It's the contract every
agent follows so generated code stays uniform. Match these patterns exactly.

## Module structure

Every feature is a NestJS module with this shape (generate via `npx nest g resource`):

```
src/<feature>/
├── <feature>.module.ts       # wires controller + providers
├── <feature>.controller.ts   # HTTP layer only — thin
├── <feature>.service.ts      # all business logic; injects PrismaService
├── <feature>.service.spec.ts # unit tests (mock Prisma)
└── dto/
    ├── create-<feature>.dto.ts
    └── update-<feature>.dto.ts
```

Controllers map HTTP to service calls and nothing more. Logic lives in services.

## REST conventions

- Plural resource names: `/users`, `/widgets`.
- Standard verbs: `GET /widgets`, `GET /widgets/:id`, `POST /widgets`,
  `PATCH /widgets/:id`, `DELETE /widgets/:id`.
- Global prefix is `/api` (set in `main.ts`). So routes are `/api/widgets`.
- `POST` returns 201, `DELETE` returns 204, everything else 200.
- Use `@HttpCode()` when the default doesn't match.

## Request validation (DTOs)

Every request body is a DTO class with `class-validator` decorators:

```ts
export class CreateWidgetDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  quantity?: number;
}
```

The global `ValidationPipe` strips unknown fields and rejects them. Never read
raw `req.body` — always go through a typed DTO.

## Response shape

Successful responses are wrapped by the global interceptor as:

```json
{ "data": <your return value> }
```

Just return plain objects/arrays from controllers. Don't wrap them yourself.

## Errors

Throw NestJS HTTP exceptions; the global filter formats them:

```ts
throw new NotFoundException('Widget not found');
throw new ConflictException('Name already taken');
throw new ForbiddenException('Insufficient role');
```

Error responses always look like:

```json
{ "statusCode": 404, "error": "Widget not found", "timestamp": "..." }
```

Never construct a different error shape by hand.

## Auth & authorization

- Routes are protected by default (global `JwtAuthGuard`).
- Public routes: add `@Public()`.
- Role-gated routes: add `@Roles('ADMIN')` (enforced by global `RolesGuard`).
- Get the caller: `@CurrentUser() user: AuthUser`.

```ts
@Roles('ADMIN')
@Get()
findAll() { return this.widgets.findAll(); }

@Get('mine')
mine(@CurrentUser() user: AuthUser) {
  return this.widgets.findByOwner(user.id);
}
```

## Database access

- Inject `PrismaService` into services only (never controllers).
- Add models to `prisma/schema.prisma`, then `npm run db:migrate`.
- When returning user-related data, use a `select` that excludes `passwordHash`.
- Use Prisma transactions (`this.prisma.$transaction`) for multi-step writes.

## Tests

- Unit: one `.spec.ts` per service using `bun:test`, Prisma mocked. Cover happy path + each error branch.
- E2E: in `test/`, real test DB, exercise the full HTTP path including auth.
- A feature isn't done until both exist and `bun run check && bun test` is green.
