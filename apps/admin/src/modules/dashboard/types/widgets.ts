import type { ReactNode } from 'react';

export type WidgetId =
  | 'kpi'
  | 'business_overview'
  | 'device_status'
  | 'realtime_trend'
  | 'alarm_center'
  | 'quick_entry'
  | 'ai_assistant'
  | 'ai_daily_summary';

export interface WidgetLayout {
  id: WidgetId;
  order: number;
  colSpanLg: 1 | 2;
}

export interface WidgetUserConfig {
  id: WidgetId;
  visible: boolean;
  refreshIntervalMs: number | null;
}

export interface WidgetDefinition {
  id: WidgetId;
  title: string;
  permissionCode: string;
  defaultLayout: WidgetLayout;
  defaultConfig: WidgetUserConfig;
  render: (ctx: WidgetRenderContext) => ReactNode;
}

export interface WidgetRenderContext {
  requestRefresh: (widgetId: WidgetId) => void;
  requestRefreshAll: () => void;
  refreshSignal: number;
  refreshAllSignal: number;
}
