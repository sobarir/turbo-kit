---
name: write-tests
description: Write tests that verify behavior, not tests that merely restate the implementation. Use whenever adding tests for a service, endpoint, or component. Read this before writing test code — a green test suite full of tautological tests is worse than no tests, because it gives false confidence.
---

# write-tests

A passing test suite only means something if the tests would actually **fail when
the code is wrong**. The trap — easy to fall into, especially for an agent — is
writing tests that pass no matter what the code does. This skill exists to avoid
that.

## The tautological-test trap

A tautological test confirms the code does what the code does. Classic shapes:

- **Mock-and-assert-the-mock.** Mock Prisma, call the service, assert the mock
  was called. This tests that you wrote the call you wrote. It catches nothing.
- **Asserting a hardcoded return.** The service returns `42`; the test asserts
  `42`. If someone changes it to `43`, you update the test. The test never
  defends anything.
- **Re-implementing the logic in the test** and comparing. Now a bug in your
  understanding lives in both places and they agree.

The test for whether a test is real: **would it fail if the behavior were wrong?**
If you can't construct a code change that breaks the feature but keeps the test
green, the test is tautological.

## What to test instead — behavior and contracts

Test the observable behavior and the edges:

- **Inputs → outputs.** Given this input, the service produces this *meaningful*
  result (not a mock echo). Use real logic where you can; mock only the I/O
  boundary (the database, the network), not the thing under test.
- **Error branches.** Each `throw` path: wrong password → `UnauthorizedException`,
  missing record → `NotFoundException`, duplicate → `ConflictException`. These
  are high-value because they're easy to break and the test genuinely guards them.
- **Boundaries.** Empty input, the limit and one past it, null/absent optional
  fields.
- **Contract shape.** For endpoints (e2e): the real HTTP path returns the right
  status and the `{ data: ... }` shape, and a protected route 401s without a token.

## Guidance for this kit

- **Unit tests** (`bun:test`, Prisma mocked): mock the database boundary, but let
  the service's real logic run. Assert on the result and on which error is thrown
  — not merely that a mock was invoked. Cover the happy path *and every error
  branch*.
- **E2E tests** (in `test/`, real test DB): exercise the actual endpoint through
  HTTP including the auth flow. This is where the contract is genuinely verified.
- **Coverage is a floor, not a goal.** CI enforces a minimum, but high coverage
  with tautological tests is still worthless. Aim for *meaningful* coverage of
  behavior and error paths.

## Output
Tests where each one defends a real behavior or contract. Before finishing, sanity
-check each: "what code change would make this fail?" If the answer is "none",
rewrite it.
