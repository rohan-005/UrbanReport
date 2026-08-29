import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    // 1. Valid JWT verified by Passport strategy
    if (user && !err) {
      return user;
    }

    // 2. Forwarded identity from trusted API Gateway
    const req = context.switchToHttp().getRequest();
    if (req?.headers && req.headers['x-user-id']) {
      return {
        userId: req.headers['x-user-id'] as string,
        role: (req.headers['x-user-role'] as string) || 'CITIZEN',
      };
    }

    // 3. Reject unauthenticated requests with 401 UnauthorizedException
    throw err || new UnauthorizedException('Authentication token or Gateway identity required to access media endpoints.');
  }
}
