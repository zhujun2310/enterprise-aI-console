<template>
  <section class="space-y-6">
    <div class="flex items-center justify-between gap-4">
      <div>
        <p class="text-sm uppercase tracking-[0.25em] text-slate-400">RBAC</p>
        <h1 class="mt-2 text-3xl font-semibold text-slate-900">User Management</h1>
        <p class="mt-2 text-slate-500">该页面用于验证菜单权限、路由权限和按钮级权限控制。</p>
      </div>
      <button
        v-permission="['user:create', 'user:edit']"
        type="button"
        class="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-cyan-400"
        @click="createUser"
      >
        Create User
      </button>
    </div>

    <div
      v-if="feedback"
      class="rounded-2xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm text-cyan-800"
    >
      {{ feedback }}
    </div>

    <div class="grid gap-4 md:grid-cols-2">
      <article
        v-for="entry in entries"
        :key="entry.username"
        class="rounded-2xl border border-slate-200 bg-white p-5"
      >
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="text-lg font-semibold text-slate-900">{{ entry.username }}</p>
            <p class="text-sm text-slate-500">{{ entry.description }}</p>
          </div>
          <span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            {{ entry.role }}
          </span>
        </div>

        <div class="mt-4 flex gap-2">
          <button
            v-permission="'user:edit'"
            type="button"
            class="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
          >
            Edit
          </button>
          <button
            v-permission="'user:delete'"
            type="button"
            class="rounded-xl border border-rose-200 px-3 py-2 text-sm text-rose-600 transition hover:bg-rose-50"
          >
            Delete
          </button>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { createUserRequest } from '../api/auth';
import { useAuthStore } from '../stores/auth';

interface UserEntry {
  username: string;
  role: string;
  description: string;
}

const authStore = useAuthStore();
const feedback = ref('');
const entries: UserEntry[] = [
  {
    username: 'admin',
    role: 'admin',
    description: 'Full access user.'
  },
  {
    username: 'viewer',
    role: 'viewer',
    description: 'Read-only user.'
  }
];

async function createUser(): Promise<void> {
  if (!authStore.token) {
    feedback.value = 'Current session is missing an access token.';
    return;
  }

  const response = await createUserRequest(authStore.token);
  feedback.value = response.message;
}
</script>
