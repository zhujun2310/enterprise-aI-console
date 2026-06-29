import { serve } from '@hono/node-server';
import type { User } from '../../packages/auth/dist/index.js';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { requireAuth, requirePermission, type AuthVariables } from './auth/middleware';
import { getUserInfoByToken, loginWithPassword } from './auth/service';

interface LoginBody {
  username: string;
  password: string;
}

const app = new Hono<{ Variables: AuthVariables }>();
const port = Number(process.env.PORT ?? 3000);
const version = '0.1.0';

app.use(
  '*',
  cors({
    origin: '*',
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['GET', 'POST', 'OPTIONS']
  })
);

app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    service: 'enterprise-ai-console-server',
    timestamp: new Date().toISOString()
  });
});

app.get('/version', (c) => {
  return c.json({
    name: 'enterprise-ai-console-server',
    version
  });
});

app.post('/auth/login', async (c) => {
  const body = (await c.req.json()) as Partial<LoginBody>;
  const username = body.username?.trim() ?? '';
  const password = body.password ?? '';

  if (!username || !password) {
    return c.json(
      {
        message: 'Username and password are required.'
      },
      400
    );
  }

  try {
    const result = loginWithPassword(username, password);
    return c.json(result);
  } catch (error: unknown) {
    return c.json(
      {
        message: error instanceof Error ? error.message : 'Login failed.'
      },
      401
    );
  }
});

app.post('/auth/logout', requireAuth, (c) => {
  return c.json({
    success: true,
    message: `Logout accepted for ${c.get('user').username}.`
  });
});

app.get('/user/info', requireAuth, (c) => {
  const authorizationHeader = c.req.header('Authorization');
  const token = authorizationHeader?.replace('Bearer ', '') ?? '';
  const payload = getUserInfoByToken(token);

  if (!payload) {
    return c.json(
      {
        message: 'Unauthorized'
      },
      401
    );
  }

  return c.json(payload);
});

app.get('/dashboard/summary', requireAuth, requirePermission('dashboard:view'), (c) => {
  const user = c.get('user');

  return c.json({
    message: `Dashboard access granted for ${user.username}.`,
    permissions: user.roles.flatMap((role) => role.permissions.map((permission) => permission.id)),
    roleIds: user.roles.map((role) => role.id)
  });
});

app.post('/users', requireAuth, requirePermission('user:create'), async (c) => {
  const body = (await c.req.json()) as { username?: string };
  const actor: User = c.get('user');

  return c.json({
    success: true,
    message: `User ${body.username ?? 'new-user'} created by ${actor.username}.`
  });
});

serve(
  {
    fetch: app.fetch,
    port
  },
  (info: { port: number }) => {
    console.log(`Hono server is running at http://localhost:${info.port}`);
  }
);
