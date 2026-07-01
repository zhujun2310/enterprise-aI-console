import { serve } from '@hono/node-server';
import type { RoleId, User } from '../../packages/auth/dist/index.js';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { streamSSE } from 'hono/streaming';
import { requireAuth, requirePermission, type AuthVariables } from './auth/middleware';
import {
  createManagedUser,
  deleteManagedUser,
  getUserInfoByToken,
  getUserManagementPayload,
  loginWithPassword,
  updateManagedUserRoles
} from './auth/service';
import {
  acknowledgeAlarm,
  getDailySummary,
  getDashboardSnapshot,
  listDashboardAlarms,
  maybeCreateAlarm
} from './dashboard';

interface LoginBody {
  username: string;
  password: string;
}

interface CreateUserBody {
  username: string;
  roleIds?: RoleId[];
}

interface UpdateUserRolesBody {
  roleIds?: RoleId[];
}

const app = new Hono<{ Variables: AuthVariables }>();
const port = Number(process.env.PORT ?? 3000);
const version = '0.1.0';

app.use(
  '*',
  cors({
    origin: '*',
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS']
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

app.get('/dashboard/snapshot', requireAuth, requirePermission('dashboard:view'), (c) => {
  return c.json(getDashboardSnapshot());
});

app.get('/dashboard/alarms', requireAuth, requirePermission('dashboard:view'), (c) => {
  return c.json({
    alarms: listDashboardAlarms()
  });
});

app.post(
  '/dashboard/alarms/:alarmId/ack',
  requireAuth,
  requirePermission('dashboard:view'),
  (c) => {
    const alarmId = c.req.param('alarmId');
    const alarm = acknowledgeAlarm(alarmId);

    if (!alarm) {
      return c.json(
        {
          message: 'Alarm not found.'
        },
        404
      );
    }

    return c.json({
      alarm
    });
  }
);

app.get('/dashboard/ai/daily-summary', requireAuth, requirePermission('dashboard:view'), (c) => {
  return c.json({
    summary: getDailySummary()
  });
});

app.get('/sse/dashboard', requireAuth, requirePermission('dashboard:view'), async (c) => {
  let id = 0;

  return streamSSE(c, async (stream) => {
    const initial = getDashboardSnapshot();

    await stream.writeSSE({
      data: JSON.stringify({
        type: 'kpi:update',
        payload: { kpis: initial.kpis, updatedAt: initial.updatedAt }
      }),
      event: 'dashboard',
      id: String(id++)
    });
    await stream.writeSSE({
      data: JSON.stringify({ type: 'device:status', payload: initial.deviceStatus }),
      event: 'dashboard',
      id: String(id++)
    });
    for (const point of initial.trend.slice(-5)) {
      await stream.writeSSE({
        data: JSON.stringify({ type: 'trend:point', payload: point }),
        event: 'dashboard',
        id: String(id++)
      });
    }
    for (const alarm of initial.alarms.slice(0, 3)) {
      await stream.writeSSE({
        data: JSON.stringify({ type: 'alarm:update', payload: alarm }),
        event: 'dashboard',
        id: String(id++)
      });
    }

    const timer = setInterval(() => {
      void (async () => {
        const snapshot = getDashboardSnapshot();
        await stream.writeSSE({
          data: JSON.stringify({
            type: 'kpi:update',
            payload: { kpis: snapshot.kpis, updatedAt: snapshot.updatedAt }
          }),
          event: 'dashboard',
          id: String(id++)
        });

        await stream.writeSSE({
          data: JSON.stringify({ type: 'device:status', payload: snapshot.deviceStatus }),
          event: 'dashboard',
          id: String(id++)
        });

        const point = snapshot.trend.at(-1);
        if (point) {
          await stream.writeSSE({
            data: JSON.stringify({ type: 'trend:point', payload: point }),
            event: 'dashboard',
            id: String(id++)
          });
        }

        const alarm = maybeCreateAlarm();
        if (alarm) {
          await stream.writeSSE({
            data: JSON.stringify({ type: 'alarm:new', payload: alarm }),
            event: 'dashboard',
            id: String(id++)
          });
        }
      })();
    }, 5000);

    stream.onAbort(() => {
      clearInterval(timer);
    });
  });
});

app.post('/users', requireAuth, requirePermission('user:create'), async (c) => {
  const body = (await c.req.json()) as Partial<CreateUserBody>;
  const actor: User = c.get('user');
  const username = body.username?.trim() ?? '';
  const roleIds = body.roleIds ?? ['viewer'];

  if (!username) {
    return c.json(
      {
        message: 'Username is required.'
      },
      400
    );
  }

  try {
    const createdUser = createManagedUser(username, roleIds);

    return c.json({
      success: true,
      message: `User ${createdUser.username} created by ${actor.username}.`
    });
  } catch (error: unknown) {
    return c.json(
      {
        message: error instanceof Error ? error.message : 'Failed to create user.'
      },
      400
    );
  }
});

app.get('/users', requireAuth, requirePermission('user:create'), (c) => {
  return c.json(getUserManagementPayload());
});

app.patch('/users/:userId/roles', requireAuth, requirePermission('user:edit'), async (c) => {
  const actor: User = c.get('user');
  const userId = c.req.param('userId');
  const body = (await c.req.json()) as Partial<UpdateUserRolesBody>;
  const roleIds = body.roleIds ?? [];

  try {
    const updatedUser = updateManagedUserRoles(userId, roleIds);

    return c.json({
      success: true,
      message: `Roles for ${updatedUser.username} updated by ${actor.username}.`,
      user: updatedUser
    });
  } catch (error: unknown) {
    return c.json(
      {
        message: error instanceof Error ? error.message : 'Failed to update roles.'
      },
      400
    );
  }
});

app.delete('/users/:userId', requireAuth, requirePermission('user:delete'), (c) => {
  const actor: User = c.get('user');
  const userId = c.req.param('userId');

  if (actor.id === userId) {
    return c.json(
      {
        message: 'You cannot delete the current signed-in user.'
      },
      400
    );
  }

  try {
    deleteManagedUser(userId);

    return c.json({
      success: true,
      message: `User ${userId} deleted by ${actor.username}.`
    });
  } catch (error: unknown) {
    return c.json(
      {
        message: error instanceof Error ? error.message : 'Failed to delete user.'
      },
      400
    );
  }
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
