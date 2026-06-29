<template>
  <section class="space-y-6">
    <div>
      <p class="text-sm uppercase tracking-[0.25em] text-slate-400">Overview</p>
      <h1 class="mt-2 text-3xl font-semibold text-slate-900">Dashboard</h1>
      <p class="mt-2 text-slate-500">
        该页面用于验证登录状态、权限集合、API 鉴权与按钮级权限控制。
      </p>
    </div>

    <div
      v-if="summaryMessage"
      class="rounded-2xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm text-cyan-800"
    >
      {{ summaryMessage }}
    </div>

    <div class="grid gap-4 md:grid-cols-3">
      <article
        v-for="card in cards"
        :key="card.title"
        class="rounded-2xl border border-slate-200 bg-slate-50 p-5"
      >
        <p class="text-sm text-slate-500">{{ card.title }}</p>
        <p class="mt-3 text-2xl font-semibold text-slate-900">{{ card.value }}</p>
        <p class="mt-2 text-sm text-slate-500">{{ card.description }}</p>
      </article>
    </div>

    <div class="grid gap-4 lg:grid-cols-2">
      <article class="rounded-2xl border border-slate-200 bg-white p-5">
        <p class="text-lg font-semibold text-slate-900">Current Session</p>
        <dl class="mt-4 space-y-3 text-sm text-slate-600">
          <div class="flex justify-between gap-4">
            <dt>Username</dt>
            <dd class="font-medium text-slate-900">{{ authStore.user?.username ?? '-' }}</dd>
          </div>
          <div class="flex justify-between gap-4">
            <dt>Roles</dt>
            <dd class="font-medium text-slate-900">{{ roleSummary }}</dd>
          </div>
          <div class="flex justify-between gap-4">
            <dt>Permissions</dt>
            <dd class="font-medium text-slate-900">{{ authStore.permissionIds.join(', ') }}</dd>
          </div>
        </dl>
      </article>

      <article class="rounded-2xl border border-slate-200 bg-white p-5">
        <p class="text-lg font-semibold text-slate-900">Permission Actions</p>
        <div class="mt-4 flex flex-wrap gap-3">
          <button
            v-permission="'dashboard:view'"
            type="button"
            class="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
            @click="loadSummary"
          >
            Refresh Summary
          </button>
          <button
            v-permission="'user:create'"
            type="button"
            class="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-cyan-400"
            @click="createUser"
          >
            Create User API
          </button>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { createUserRequest, getDashboardSummaryRequest } from '../api/auth';
import { useAuthStore } from '../stores/auth';

interface DashboardCard {
  title: string;
  value: string;
  description: string;
}

const authStore = useAuthStore();
const summaryMessage = ref('');
const roleSummary = computed(() => authStore.roles.map((role) => role.id).join(', '));
const cards = computed<DashboardCard[]>(() => [
  {
    title: 'Workspace',
    value: 'Ready',
    description: 'Monorepo and RBAC scaffolding are initialized.'
  },
  {
    title: 'Active Roles',
    value: roleSummary.value || 'none',
    description: 'Current roles are resolved from the authenticated session.'
  },
  {
    title: 'Permissions',
    value: String(authStore.permissionIds.length),
    description: 'Permissions are injected into router, menu, UI, and API access.'
  }
]);

async function loadSummary(): Promise<void> {
  if (!authStore.token) {
    summaryMessage.value = 'Missing access token.';
    return;
  }

  const response = await getDashboardSummaryRequest(authStore.token);
  summaryMessage.value = response.message;
}

async function createUser(): Promise<void> {
  if (!authStore.token) {
    summaryMessage.value = 'Missing access token.';
    return;
  }

  const response = await createUserRequest(authStore.token);
  summaryMessage.value = response.message;
}

onMounted(async () => {
  await loadSummary();
});
</script>
