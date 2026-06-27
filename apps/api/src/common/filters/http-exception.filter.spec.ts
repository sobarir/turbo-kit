import { describe, it, expect, mock } from 'bun:test';
import {
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import type { LoggerService } from '@nestjs/common';
import { AllExceptionsFilter } from './http-exception.filter';

// Verifies the core security property: clients never see internal details or
// stack traces, but the server logs full detail.
function makeHost(req: object, sent: { status?: number; body?: unknown }) {
  return {
    switchToHttp: () => ({
      getResponse: () => ({
        status(code: number) {
          sent.status = code;
          return { send: (b: unknown) => (sent.body = b) };
        },
      }),
      getRequest: () => req,
    }),
  } as never;
}

describe('AllExceptionsFilter', () => {
  const makeLogger = () =>
    ({
      error: mock(),
      warn: mock(),
      log: mock(),
    }) as unknown as LoggerService & {
      error: ReturnType<typeof mock>;
      warn: ReturnType<typeof mock>;
    };

  it('sends a safe shape with requestId and never a stack trace', () => {
    const logger = makeLogger();
    const filter = new AllExceptionsFilter(logger);
    const sent: { status?: number; body: Record<string, unknown> } = {
      body: {},
    };
    filter.catch(
      new NotFoundException('User not found'),
      makeHost({ id: 'req-1', method: 'GET', url: '/users/x' }, sent),
    );
    expect(sent.status).toBe(404);
    expect(sent.body.error).toBe('User not found');
    expect(sent.body.requestId).toBe('req-1');
    expect('stack' in sent.body).toBe(false); // never leak a stack
  });

  it('hides internal details for 5xx but logs the full error server-side', () => {
    const logger = makeLogger();
    const filter = new AllExceptionsFilter(logger);
    const sent: { status?: number; body: Record<string, unknown> } = {
      body: {},
    };
    const boom = new InternalServerErrorException(
      'db connection string leaked!',
    );
    filter.catch(
      boom,
      makeHost({ id: 'req-2', method: 'POST', url: '/x' }, sent),
    );
    // Client sees generic message, not the internal detail
    expect(sent.body.error).toBe('Internal server error');
    expect(JSON.stringify(sent.body)).not.toContain('leaked');
    // Server logged the error (with context) for examination
    expect(logger.error).toHaveBeenCalled();
  });
});
