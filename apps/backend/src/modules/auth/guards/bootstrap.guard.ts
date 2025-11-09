import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';

@Injectable()
export class BootstrapGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    const headerKey = request.headers['x-master-key'];

    if (!headerKey || headerKey !== process.env.MASTER_BOOTSTRAP_KEY) {
      throw new ForbiddenException('Invalid master bootstrap key.');
    }

    return true;
  }
}
