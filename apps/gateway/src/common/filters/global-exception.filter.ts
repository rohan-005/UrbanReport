import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { CORRELATION_ID_HEADER } from '../middleware/correlation-id.middleware';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('GlobalExceptionFilter');

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // If host context is GraphQL, let NestJS GraphQL handle normalization
    if (!response || typeof response.status !== 'function') {
      return exception;
    }

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse: any =
      exception instanceof HttpException ? exception.getResponse() : null;

    const message =
      typeof exceptionResponse === 'object' && exceptionResponse?.message
        ? exceptionResponse.message
        : exception.message || 'An unexpected server error occurred.';

    const correlationId = request.headers[CORRELATION_ID_HEADER] || 'unknown';

    this.logger.error(
      `[${correlationId}] ${request.method} ${request.url} -> Status ${status}: ${JSON.stringify(message)}`,
    );

    let errorCode = 'INTERNAL_ERROR';
    if (status === HttpStatus.UNAUTHORIZED) errorCode = 'UNAUTHENTICATED';
    if (status === HttpStatus.FORBIDDEN) errorCode = 'FORBIDDEN';
    if (status === HttpStatus.NOT_FOUND) errorCode = 'NOT_FOUND';
    if (status === HttpStatus.BAD_REQUEST) errorCode = 'BAD_REQUEST';
    if (status === HttpStatus.TOO_MANY_REQUESTS) errorCode = 'RATE_LIMITED';
    if (status === HttpStatus.SERVICE_UNAVAILABLE || status === HttpStatus.GATEWAY_TIMEOUT) errorCode = 'SERVICE_UNAVAILABLE';

    response.status(status).json({
      statusCode: status,
      errorCode,
      message,
      requestId: correlationId,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
