import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import {
  ResponseCode,
  ResponseStatusFactory,
} from '../api-response/response-status';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const contextType = host.getType();

    if (contextType === 'http') {
      this.handleHttpException(exception, host);
    } else if (contextType === 'ws') {
      this.handleWsException(exception, host);
    } else {
      this.logger.error(
        `Unhandled exception in ${contextType} context:`,
        exception,
      );
    }
  }

  private handleHttpException(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const errorResponse = ResponseStatusFactory.create(
      ResponseCode.INTERNAL_SERVER_ERROR,
    );

    const logData = {
      timestamp: new Date().toISOString(),
      method: request.method,
      url: request.url,
      userAgent: request.get('User-Agent'),
      ip: request.ip,
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      error: exception instanceof Error ? exception.message : String(exception),
      stack: exception instanceof Error ? exception.stack : undefined,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      requestBody: request.body,
      queryParams: request.query,
      headers: {
        'content-type': request.get('Content-Type'),
        authorization: request.get('Authorization') ? '[MASKED]' : undefined,
        'X-Forwarded-For': request.get('x-forwarded-for'),
      },
    };

    this.logger.error(
      'Unhandled HTTP exception occurred:',
      JSON.stringify(logData, null, 2),
    );

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errorResponse);
  }

  private handleWsException(exception: unknown, host: ArgumentsHost) {
    console.log('host: ', JSON.stringify(host, null, 2)); // 임시.
    const logData = {
      timestamp: new Date().toISOString(),
      error: exception instanceof Error ? exception.message : String(exception),
      stack: exception instanceof Error ? exception.stack : undefined,
    };

    this.logger.error(
      'Unhandled WebSocket exception occurred:',
      JSON.stringify(logData, null, 2),
    );

    // const client = host.switchToWs().getClient();
    // client.emit('error', { message: 'Internal server error' });
  }
}
