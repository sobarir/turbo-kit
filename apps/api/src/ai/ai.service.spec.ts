import { describe, it, expect, beforeEach, afterEach, mock } from 'bun:test';
import { ServiceUnavailableException } from '@nestjs/common';
import { AiService } from './ai.service';

// Behavior tests for AiService (see the write-tests skill): mock the boundaries
// (config + fetch), let the real service logic run, and assert on outcomes and
// each error branch — not on mock internals.

type ConfigMap = {
  AI_API_KEY: string;
  AI_BASE_URL: string;
  AI_MODEL: string;
};

const makeConfig = (overrides: Partial<ConfigMap> = {}) => {
  const values: ConfigMap = {
    AI_API_KEY: 'test-key',
    AI_BASE_URL: 'https://gateway.test/v1',
    AI_MODEL: 'test/model',
    ...overrides,
  };
  return {
    get: (key: keyof ConfigMap) => values[key],
  } as never;
};

const noopLogger = {
  error: mock(),
  warn: mock(),
  info: mock(),
};

describe('AiService', () => {
  const realFetch = globalThis.fetch;

  beforeEach(() => {
    noopLogger.error.mockClear();
  });

  afterEach(() => {
    globalThis.fetch = realFetch;
  });

  it('returns the assistant message content on a successful response', async () => {
    globalThis.fetch = mock(async () => ({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: 'hello there' } }],
      }),
    })) as never;

    const service = new AiService(makeConfig(), noopLogger as never);
    const result = await service.chat([{ role: 'user', content: 'hi' }]);
    expect(result).toBe('hello there');
  });

  it('throws ServiceUnavailable when AI_API_KEY is not configured', async () => {
    const service = new AiService(
      makeConfig({ AI_API_KEY: '' }),
      noopLogger as never,
    );
    await expect(
      service.chat([{ role: 'user', content: 'hi' }]),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
  });

  it('throws ServiceUnavailable when the gateway returns a non-OK status', async () => {
    globalThis.fetch = mock(async () => ({
      ok: false,
      status: 500,
      text: async () => 'upstream boom',
    })) as never;

    const service = new AiService(makeConfig(), noopLogger as never);
    await expect(
      service.chat([{ role: 'user', content: 'hi' }]),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
  });

  it('throws ServiceUnavailable (not the raw error) when fetch itself fails', async () => {
    globalThis.fetch = mock(async () => {
      throw new Error('network down');
    }) as never;

    const service = new AiService(makeConfig(), noopLogger as never);
    // The raw network error must not leak — it's wrapped in a safe 503.
    await expect(
      service.chat([{ role: 'user', content: 'hi' }]),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
  });

  it('returns empty string when the response has no choices', async () => {
    globalThis.fetch = mock(async () => ({
      ok: true,
      json: async () => ({ choices: [] }),
    })) as never;

    const service = new AiService(makeConfig(), noopLogger as never);
    expect(await service.chat([{ role: 'user', content: 'hi' }])).toBe('');
  });
});
