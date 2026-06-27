import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { LoggerService } from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';

// Standardizes ALL error responses to one shape AND controls what is logged vs.
// what the client sees. The rule (best practice):
//   - Server-side: log the FULL error including stack trace + request context,
//     so you can examine and fix it later (down to the line of code).
//   - Client-side: send only a safe message + status + request id. NEVER leak a
//     stack trace, internal exception details, or 5xx specifics to the user.
// The request id ties a user-reported error back to the exact server logs.
//
// Agents: never invent a different error shape. Throw HttpException subclasses
// (NotFoundException, BadRequestException, ...) and this filter handles the rest.
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const reply = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<FastifyRequest>();

    const isHttp = exception instanceof HttpException;
    const status = isHttp
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    // The request id set by the Pino logger (genReqId), echoed to the client.
    const requestId = (request.id as string) ?? undefined;

    // --- What the CLIENT sees: safe, minimal, no internals. ---
    let clientMessage: string | string[];
    if (status >= 500) {
      // Any server error: never reveal the real reason to the client, even if
      // it was a thrown HttpException with a detailed message.
      clientMessage = 'Internal server error';
    } else if (isHttp) {
      const res = exception.getResponse();
      // Nest puts validation messages under `message`; keep those (they're safe
      // and useful), otherwise use the string response.
      clientMessage =
        typeof res === 'string'
          ? res
          : ((res as { message?: string | string[] }).message ??
            exception.message);
    } else {
      clientMessage = 'Internal server error';
    }

    // --- What the SERVER LOGS: full detail for examination/fixing. ---
    const logContext = {
      requestId,
      method: request.method,
      url: request.url,
      statusCode: status,
    };

    if (status >= 500) {
      // Pass the actual Error so Pino serializes the full stack trace.
      const error =
        exception instanceof Error ? exception : new Error(String(exception));
      this.logger.error(
        { ...logContext, err: error, stack: error.stack },
        error.message,
      );
    } else if (status >= 400) {
      // Client errors: warn, no stack needed (they're expected, not bugs).
      this.logger.warn?.({ ...logContext, message: clientMessage });
    }

    reply.status(status).send({
      statusCode: status,
      error: clientMessage,
      requestId, // so a user can quote this and you can find the log line
      timestamp: new Date().toISOString(),
    });
  }
}
