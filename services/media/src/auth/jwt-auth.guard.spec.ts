import { JwtAuthGuard } from './jwt-auth.guard';
import { UnauthorizedException, ExecutionContext } from '@nestjs/common';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;

  beforeEach(() => {
    guard = new JwtAuthGuard();
  });

  const createMockContext = (headers: Record<string, string> = {}) => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          headers,
        }),
      }),
    } as unknown as ExecutionContext;
  };

  it('should return user when Passport strategy successfully validates JWT', () => {
    const mockUser = { userId: 'user-123', role: 'CITIZEN' };
    const ctx = createMockContext();
    const result = guard.handleRequest(null, mockUser, null, ctx);
    expect(result).toEqual(mockUser);
  });

  it('should return user from Gateway x-user-id header when Passport user is missing', () => {
    const ctx = createMockContext({
      'x-user-id': 'user-gateway-456',
      'x-user-role': 'ADMIN',
    });
    const result = guard.handleRequest(null, null, null, ctx);
    expect(result).toEqual({ userId: 'user-gateway-456', role: 'ADMIN' });
  });

  it('should throw UnauthorizedException when no user or Gateway header is provided', () => {
    const ctx = createMockContext();
    expect(() => guard.handleRequest(null, null, null, ctx)).toThrow(UnauthorizedException);
  });
});
