import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    if (user && !err) {
      return user;
    }

    const req = context.switchToHttp().getRequest();
    if (req?.headers && req.headers['x-user-id']) {
      return {
        userId: req.headers['x-user-id'] as string,
        role: (req.headers['x-user-role'] as string) || 'CITIZEN',
      };
    }

    throw err || new UnauthorizedException('Authentication token or Gateway identity required to access complaint endpoints.');
  }
}
