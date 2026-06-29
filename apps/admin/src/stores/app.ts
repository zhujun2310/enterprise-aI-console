import { computed, ref } from 'vue';
import { defineStore } from 'pinia';

export const useAppStore = defineStore('app', () => {
  const title = ref('Enterprise AI Console');
  const subtitle = ref('Monorepo Bootstrap');
  const fullTitle = computed(() => `${title.value} | ${subtitle.value}`);

  return {
    title,
    subtitle,
    fullTitle
  };
});
