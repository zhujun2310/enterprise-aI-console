<template>
  <section class="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
    <p class="text-sm uppercase tracking-[0.35em] text-rose-500">403</p>
    <h1 class="text-3xl font-semibold text-slate-900">Forbidden</h1>
    <p class="max-w-xl text-sm text-slate-500">
      当前账号缺少访问该页面所需的权限，请切换账号或联系管理员授权。
    </p>
    <RouterLink
      to="/dashboard"
      class="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
    >
      返回 Dashboard
    </RouterLink>
  </section>
</template>

<script setup lang="ts"></script>
