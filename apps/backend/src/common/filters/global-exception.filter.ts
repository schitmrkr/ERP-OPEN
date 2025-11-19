import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { BaseException } from '../exceptions/base.exception';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number;
    let message: string | any;
    let details: any = undefined;

    if (exception instanceof BaseException) {
        // Handle your custom BaseException
        status = exception.statusCode;
        message = exception.message;
        details = exception.details;
    } else if (exception instanceof HttpException) {
        // Handle other standard HttpExceptions
        status = exception.getStatus();
        message = exception.getResponse();
    } else {
        // Handle unknown/unexpected exceptions
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        message = 'Internal server error';
        console.error('Unhandled Exception:', exception);
        }

        response.status(status).json({
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            message,
            ...(details ? { details } : {}),
        });
}
}
