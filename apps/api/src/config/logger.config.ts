import { randomUUID } from 'node:crypto';
import { LoggerModule } from 'nestjs-pino';
import type { IncomingMessage, ServerResponse } from 'node:http';

// Structured logging with Pino (nestjs-pino).
//
// What this gives you, and the patterns agents should follow:
// - JSON logs in production (machine-parseable for log aggregators), pretty
//   human-readable logs in development.
// - A request id on every log line (correlation) — auto-generated, or taken from
//   an incoming `x-request-id` header. The same id is sent back on the response
//   so a user-reported error maps to exact log lines.
// - Secrets/PII redaction: auth headers, cookies, passwords and tokens are
//   stripped from logs automatically. NEVER log raw secrets; add new sensitive
//   paths to `redact` below.
// - Inject `Logger` from 'nestjs-pino' in services and call
//   `this.logger.log(...)` / `.error(...)`. Do NOT use console.* (ESLint blocks it).

const isProd = process.env.NODE_ENV === 'production';

export const loggerModule = LoggerModule.forRoot({
  pinoHttp: {
    level: process.env.LOG_LEVEL ?? (isProd ? 'info' : 'debug'),

    // Pretty, colorized output in dev; raw JSON in prod.
    transport: isProd
      ? undefined
      : {
          target: 'pino-pretty',
          options: {
            singleLine: true,
            translateTime: 'SYS:HH:MM:ss',
            ignore: 'pid,hostname',
          },
        },

    // Correlation id: reuse an inbound x-request-id or generate one.
    genReqId: (req: IncomingMessage, res: ServerResponse) => {
      const existing = req.headers['x-request-id'];
      const id =
        (Array.isArray(existing) ? existing[0] : existing) ?? randomUUID();
      res.setHeader('x-request-id', id);
      return id;
    },

    // Redact sensitive data so it never reaches the logs.
    redact: {
      paths: [
        'req.headers.authorization',
        'req.headers.cookie',
        'res.headers["set-cookie"]',
        'req.body.password',
        'req.body.passwordHash',
        'req.body.refreshToken',
        '*.password',
        '*.passwordHash',
        '*.refreshToken',
        '*.accessToken',
      ],
      remove: true,
    },

    // Keep request logs lean — only the fields worth keeping.
    serializers: {
      req(req: { method: string; url: string; id: string }) {
        return { id: req.id, method: req.method, url: req.url };
      },
      res(res: { statusCode: number }) {
        return { statusCode: res.statusCode };
      },
    },

    // 5xx → error, 4xx → warn, the rest → info. Mirrors how the exception filter
    // treats severity: client errors aren't system alarms.
    customLogLevel: (_req: any, res: any, err: any) => {
      if (res.statusCode >= 500 || err) return 'error';
      if (res.statusCode >= 400) return 'warn';
      return 'info';
    },
  },
});
