<template>
  <aside class="rounded-2xl bg-slate-900 p-4 text-slate-100 shadow-sm">
    <p class="mb-4 text-sm font-medium text-slate-400">Navigation</p>

    <nav class="flex flex-col gap-2">
      <RouterLink
        v-for="item in authStore.menus"
        :key="item.path"
        :to="item.path"
        class="rounded-xl px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-800 hover:text-white"
        active-class="bg-slate-100 text-slate-900"
      >
        {{ item.name }}
      </RouterLink>
    </nav>

    <div class="mt-6 rounded-2xl bg-slate-800/70 p-4 text-sm text-slate-300">
      <p class="font-medium text-white">Access Summary</p>
      <p class="mt-2">Roles: {{ roleSummary }}</p>
      <p class="mt-1">Permissions: {{ authStore.permissionIds.length }}</p>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useAuthStore } from '../stores/auth';

const authStore = useAuthStore();
const roleSummary = computed(() => authStore.roles.map((role) => role.id).join(', '));
</script>
