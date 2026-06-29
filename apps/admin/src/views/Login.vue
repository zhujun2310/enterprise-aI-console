<template>
  <div class="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10 text-white">
    <div
      class="w-full max-w-md rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur"
    >
      <p class="text-sm uppercase tracking-[0.3em] text-cyan-300">Enterprise AI Console</p>
      <h1 class="mt-3 text-3xl font-semibold">Login</h1>
      <p class="mt-2 text-sm text-slate-300">
        使用 `admin / admin123` 或 `viewer / viewer123` 验证 RBAC 链路。
      </p>

      <form class="mt-8 space-y-4" @submit.prevent="handleSubmit">
        <label class="block">
          <span class="mb-2 block text-sm text-slate-300">Username</span>
          <input
            v-model="form.username"
            class="w-full rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 outline-none transition focus:border-cyan-400"
            type="text"
            autocomplete="username"
          />
        </label>
        <label class="block">
          <span class="mb-2 block text-sm text-slate-300">Password</span>
          <input
            v-model="form.password"
            class="w-full rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 outline-none transition focus:border-cyan-400"
            type="password"
            autocomplete="current-password"
          />
        </label>

        <p
          v-if="errorMessage"
          class="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200"
        >
          {{ errorMessage }}
        </p>

        <button
          type="submit"
          class="inline-flex w-full items-center justify-center rounded-xl bg-cyan-400 px-4 py-3 text-sm font-medium text-slate-950 transition hover:bg-cyan-300"
        >
          {{ submitting ? 'Signing in...' : 'Sign In' }}
        </button>
      </form>

      <div class="mt-6 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          class="rounded-xl border border-white/10 px-4 py-3 text-left text-sm transition hover:border-cyan-400"
          @click="applyPreset('admin')"
        >
          <span class="block font-medium text-white">Admin</span>
          <span class="mt-1 block text-slate-300">Full permissions</span>
        </button>
        <button
          type="button"
          class="rounded-xl border border-white/10 px-4 py-3 text-left text-sm transition hover:border-cyan-400"
          @click="applyPreset('viewer')"
        >
          <span class="block font-medium text-white">Viewer</span>
          <span class="mt-1 block text-slate-300">Read-only dashboard access</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

type PresetRole = 'admin' | 'viewer';

const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();
const submitting = ref(false);
const errorMessage = ref('');
const form = reactive({
  username: 'admin',
  password: 'admin123'
});

function applyPreset(role: PresetRole): void {
  if (role === 'admin') {
    form.username = 'admin';
    form.password = 'admin123';
    return;
  }

  form.username = 'viewer';
  form.password = 'viewer123';
}

async function handleSubmit(): Promise<void> {
  errorMessage.value = '';
  submitting.value = true;

  try {
    await authStore.login(form.username, form.password);
    const redirectPath =
      typeof route.query.redirect === 'string' && route.query.redirect
        ? route.query.redirect
        : '/dashboard';

    await router.push(redirectPath);
  } catch (error: unknown) {
    errorMessage.value = error instanceof Error ? error.message : 'Login failed.';
  } finally {
    submitting.value = false;
  }
}
</script>
