import { BaseException } from './base.exception';
import { HttpStatus } from '@nestjs/common';


export class PrismaException extends BaseException {
  constructor(message: string, details?: any) {
    super(message, HttpStatus.BAD_REQUEST, details);
  }
}

export class BadRequestException extends BaseException {
  constructor(message = 'Bad request', details?: any) {
    super(message, HttpStatus.BAD_REQUEST, details);
  }
}

export class UnauthorizedException extends BaseException {
  constructor(message = 'Unauthorized', details?: any) {
    super(message, HttpStatus.UNAUTHORIZED, details);
  }
}

export class ForbiddenException extends BaseException {
  constructor(message = 'Forbidden', details?: any) {
    super(message, HttpStatus.FORBIDDEN, details);
  }
}

export class NotFoundException extends BaseException {
  constructor(resource: string, details?: any) {
    super(`${resource} not found`, HttpStatus.NOT_FOUND, details);
  }
}

export class ConflictException extends BaseException {
  constructor(message = 'Conflict', details?: any) {
    super(message, HttpStatus.CONFLICT, details);
  }
}

export class UnprocessableEntityException extends BaseException {
  constructor(message = 'Unprocessable entity', details?: any) {
    super(message, HttpStatus.UNPROCESSABLE_ENTITY, details);
  }
}

export class InternalServerErrorException extends BaseException {
  constructor(message = 'Internal server error', details?: any) {
    super(message, HttpStatus.INTERNAL_SERVER_ERROR, details);
  }
}
