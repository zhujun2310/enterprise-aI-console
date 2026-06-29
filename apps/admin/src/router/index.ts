import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const protectedRoutes: RouteRecordRaw[] = [
  {
    path: 'dashboard',
    name: 'dashboard',
    component: () => import('../views/Dashboard.vue'),
    meta: {
      permissionCode: 'dashboard:view',
      title: 'Dashboard'
    }
  },
  {
    path: 'users',
    name: 'users',
    component: () => import('../views/Users.vue'),
    meta: {
      permissionCode: 'user:create',
      title: 'Users'
    }
  }
];

function installProtectedRoutes(
  permissionIds: string[],
  routerInstance: ReturnType<typeof createRouter>
): void {
  for (const route of protectedRoutes) {
    const routeName = String(route.name);
    const permissionCode =
      typeof route.meta?.permissionCode === 'string' ? route.meta.permissionCode : null;
    const canInstall = !permissionCode || permissionIds.includes(permissionCode);

    if (canInstall && !routerInstance.hasRoute(routeName)) {
      routerInstance.addRoute('root', route);
    }
  }
}

function resetProtectedRoutes(routerInstance: ReturnType<typeof createRouter>): void {
  for (const route of protectedRoutes) {
    const routeName = String(route.name);

    if (routerInstance.hasRoute(routeName)) {
      routerInstance.removeRoute(routeName);
    }
  }
}

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/Login.vue'),
      meta: {
        public: true,
        title: 'Login'
      }
    },
    {
      path: '/403',
      name: 'forbidden',
      component: () => import('../views/Forbidden.vue'),
      meta: {
        title: 'Forbidden'
      }
    },
    {
      path: '/',
      name: 'root',
      component: () => import('../layouts/AdminLayout.vue'),
      redirect: '/dashboard',
      children: []
    }
  ]
});

router.beforeEach(async (to) => {
  const authStore = useAuthStore();

  if (to.meta.public) {
    if (to.path === '/login' && authStore.isAuthenticated) {
      return '/dashboard';
    }

    return true;
  }

  if (!authStore.hydrated) {
    await authStore.hydrate();
  }

  if (!authStore.token) {
    resetProtectedRoutes(router);

    return {
      path: '/login',
      query: {
        redirect: to.fullPath
      }
    };
  }

  if (!authStore.routesReady) {
    installProtectedRoutes(authStore.permissionIds, router);
    authStore.markRoutesReady(true);

    return to.fullPath;
  }

  if (to.matched.length === 0) {
    return '/403';
  }

  const permissionCode = typeof to.meta.permissionCode === 'string' ? to.meta.permissionCode : null;

  if (permissionCode && !authStore.hasPermission(permissionCode)) {
    return '/403';
  }

  return true;
});

export function clearPermissionRoutes(): void {
  resetProtectedRoutes(router);
}

export default router;
