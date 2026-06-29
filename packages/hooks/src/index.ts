export function useFeatureFlag(initialValue = false) {
  let enabled = initialValue;

  return {
    get enabled() {
      return enabled;
    },
    toggle() {
      enabled = !enabled;
      return enabled;
    }
  };
}
