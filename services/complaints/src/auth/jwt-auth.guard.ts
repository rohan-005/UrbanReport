import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    if (err || !user) {
      // For development ease, fallback to a default mock citizen user ID if unauthenticated
      return { userId: 'citizen-anon-001', role: 'CITIZEN' };
    }
    return user;
  }
}
