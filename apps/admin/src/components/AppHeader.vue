<template>
  <header class="border-b border-slate-200 bg-white/95 backdrop-blur">
    <div class="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 lg:px-6">
      <div>
        <p class="text-lg font-semibold text-slate-900">{{ appStore.title }}</p>
        <p class="text-sm text-slate-500">{{ headerSubtitle }}</p>
      </div>

      <div class="flex items-center gap-3">
        <div
          v-if="authStore.user"
          class="hidden rounded-xl bg-slate-100 px-4 py-2 text-right md:block"
        >
          <p class="text-sm font-medium text-slate-900">{{ authStore.user.username }}</p>
          <p class="text-xs text-slate-500">{{ roleLabels }}</p>
        </div>

        <button
          v-if="authStore.isAuthenticated"
          type="button"
          class="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          @click="handleLogout"
        >
          Logout
        </button>
        <RouterLink
          v-else
          to="/login"
          class="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
        >
          Go to Login
        </RouterLink>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { clearPermissionRoutes } from '../router';
import { useAppStore } from '../stores/app';
import { useAuthStore } from '../stores/auth';

const appStore = useAppStore();
const authStore = useAuthStore();
const router = useRouter();

const roleLabels = computed(() => authStore.roles.map((role) => role.id).join(', '));
const headerSubtitle = computed(() =>
  authStore.user ? `${appStore.subtitle} · ${authStore.user.username}` : appStore.subtitle
);

async function handleLogout(): Promise<void> {
  await authStore.logout();
  clearPermissionRoutes();
  await router.push('/login');
}
</script>
