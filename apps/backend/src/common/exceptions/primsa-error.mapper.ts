// prisma-error.mapper.ts
import { Prisma } from '@prisma/client';
import { NotFoundException, BadRequestException, PrismaException } from './common.exceptions';

export function mapPrismaError(error: any) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        return new BadRequestException(
          'Unique constraint failed',
          error.meta
        );

      case 'P2003':
        return new BadRequestException(
          'Foreign key constraint failed',
          error.meta
        );

      case 'P2025':
        return new NotFoundException(
          'Record',
          error.meta
        );

      default:
        return new PrismaException(
          `Prisma error (${error.code})`,
          error.meta
        );
    }
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return new BadRequestException('Prisma validation error', error.message);
  }

  return error;
}
