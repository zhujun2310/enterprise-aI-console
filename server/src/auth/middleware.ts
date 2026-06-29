import { getUserInfo, hasPermission, type User } from '../../../packages/auth/dist/index.js';
import type { MiddlewareHandler } from 'hono';

export interface AuthVariables {
  user: User;
}

function extractToken(authorizationHeader: string | undefined): string | null {
  if (!authorizationHeader) {
    return null;
  }

  const [scheme, token] = authorizationHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return null;
  }

  return token;
}

export const requireAuth: MiddlewareHandler<{ Variables: AuthVariables }> = async (c, next) => {
  const authorizationHeader = c.req.header('Authorization');
  const token = extractToken(authorizationHeader);

  if (!token) {
    return c.json(
      {
        message: 'Unauthorized'
      },
      401
    );
  }

  const user = getUserInfo(token);

  if (!user) {
    return c.json(
      {
        message: 'Unauthorized'
      },
      401
    );
  }

  c.set('user', user);
  await next();
};

export function requirePermission(
  permissionCode: string
): MiddlewareHandler<{ Variables: AuthVariables }> {
  return async (c, next) => {
    const user = c.get('user');

    if (!hasPermission(user, permissionCode)) {
      return c.json(
        {
          message: 'Forbidden'
        },
        403
      );
    }

    await next();
  };
}
