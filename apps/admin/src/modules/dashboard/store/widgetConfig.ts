import type { WidgetId, WidgetLayout, WidgetUserConfig } from '../types/widgets';

export interface DashboardWidgetPreferences {
  layouts: WidgetLayout[];
  configs: WidgetUserConfig[];
  updatedAt: string;
}

const STORAGE_KEY = 'enterprise-ai-console.dashboard.widgets:v1';

function safeParseJson(value: string): unknown {
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return null;
  }
}

function isWidgetId(value: unknown): value is WidgetId {
  return (
    value === 'kpi' ||
    value === 'business_overview' ||
    value === 'device_status' ||
    value === 'realtime_trend' ||
    value === 'alarm_center' ||
    value === 'quick_entry' ||
    value === 'ai_assistant' ||
    value === 'ai_daily_summary'
  );
}

function normalizeRefreshInterval(value: unknown): number | null {
  if (value === null) {
    return null;
  }

  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return null;
  }

  const rounded = Math.round(value);

  if (rounded <= 0) {
    return null;
  }

  return rounded;
}

export function loadDashboardWidgetPreferences(
  defaults: DashboardWidgetPreferences
): DashboardWidgetPreferences {
  if (typeof window === 'undefined') {
    return defaults;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return defaults;
  }

  const parsed = safeParseJson(raw);
  if (!parsed || typeof parsed !== 'object') {
    return defaults;
  }

  const record = parsed as Partial<DashboardWidgetPreferences>;
  const layouts = Array.isArray(record.layouts) ? record.layouts : [];
  const configs = Array.isArray(record.configs) ? record.configs : [];

  const normalizedLayouts: WidgetLayout[] = layouts
    .map((item) => {
      const layout = item as Partial<WidgetLayout>;
      if (!isWidgetId(layout.id)) {
        return null;
      }

      const order =
        typeof layout.order === 'number' && Number.isFinite(layout.order) ? layout.order : null;
      const colSpanLg = layout.colSpanLg === 2 ? 2 : 1;

      if (order === null) {
        return null;
      }

      return {
        id: layout.id,
        order,
        colSpanLg
      } satisfies WidgetLayout;
    })
    .filter((value): value is WidgetLayout => Boolean(value));

  const normalizedConfigs: WidgetUserConfig[] = configs
    .map((item) => {
      const config = item as Partial<WidgetUserConfig>;
      if (!isWidgetId(config.id)) {
        return null;
      }

      const visible = typeof config.visible === 'boolean' ? config.visible : true;
      const refreshIntervalMs = normalizeRefreshInterval(config.refreshIntervalMs);

      return {
        id: config.id,
        visible,
        refreshIntervalMs
      } satisfies WidgetUserConfig;
    })
    .filter((value): value is WidgetUserConfig => Boolean(value));

  return {
    layouts: normalizedLayouts.length > 0 ? normalizedLayouts : defaults.layouts,
    configs: normalizedConfigs.length > 0 ? normalizedConfigs : defaults.configs,
    updatedAt: typeof record.updatedAt === 'string' ? record.updatedAt : defaults.updatedAt
  };
}

export function saveDashboardWidgetPreferences(value: DashboardWidgetPreferences): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
}

export function updateWidgetConfig(
  prefs: DashboardWidgetPreferences,
  update: (current: WidgetUserConfig) => WidgetUserConfig,
  widgetId: WidgetId
): DashboardWidgetPreferences {
  const configs = prefs.configs.map((config) => (config.id === widgetId ? update(config) : config));

  return {
    ...prefs,
    configs,
    updatedAt: new Date().toISOString()
  };
}

export function moveWidgetLayout(
  prefs: DashboardWidgetPreferences,
  widgetId: WidgetId,
  direction: 'up' | 'down'
): DashboardWidgetPreferences {
  const layouts = [...prefs.layouts].sort((a, b) => a.order - b.order);
  const index = layouts.findIndex((layout) => layout.id === widgetId);

  if (index === -1) {
    return prefs;
  }

  const targetIndex = direction === 'up' ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= layouts.length) {
    return prefs;
  }

  const current = layouts[index];
  const target = layouts[targetIndex];

  layouts[index] = { ...current, order: target.order };
  layouts[targetIndex] = { ...target, order: current.order };

  return {
    ...prefs,
    layouts,
    updatedAt: new Date().toISOString()
  };
}
