<template>
  <div class="min-h-screen bg-slate-100 text-slate-900">
    <AppHeader />
    <div class="mx-auto flex max-w-7xl gap-4 px-4 py-4 lg:px-6">
      <AppSidebar class="w-64 shrink-0" />
      <main class="min-h-[calc(100vh-7rem)] flex-1 rounded-2xl bg-white p-6 shadow-sm">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import AppHeader from '../components/AppHeader.vue';
import AppSidebar from '../components/AppSidebar.vue';
</script>
