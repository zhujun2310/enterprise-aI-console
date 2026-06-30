const appState = {
  title: 'Enterprise AI Console',
  subtitle: 'React 19 RBAC Console'
};

export function useAppStore() {
  return {
    ...appState,
    fullTitle: `${appState.title} | ${appState.subtitle}`
  };
}
