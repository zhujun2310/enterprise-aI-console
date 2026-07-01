import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth';
import { acknowledgeDashboardAlarm, getDailySummary, getDashboardSnapshot } from '../api/dashboard';
import type {
  AlarmItem,
  DailySummary,
  DashboardSseEvent,
  DeviceStatusSnapshot,
  KpiMetric,
  TrendPoint
} from '../types/dashboard';
import type { WidgetDefinition, WidgetId, WidgetLayout, WidgetUserConfig } from '../types/widgets';
import WidgetContainer from '../components/WidgetContainer';
import WidgetGrid from '../components/WidgetGrid';
import WidgetConfigPanel from '../components/WidgetConfigPanel';
import {
  loadDashboardWidgetPreferences,
  moveWidgetLayout,
  saveDashboardWidgetPreferences,
  updateWidgetConfig,
  type DashboardWidgetPreferences
} from '../store/widgetConfig';
import { useSse } from '../composables/useSse';
import {
  AiAssistantWidget,
  AiDailySummaryWidget,
  AlarmCenterWidget,
  BusinessOverviewWidget,
  DeviceStatusWidget,
  KpiWidget,
  QuickEntryWidget,
  RealtimeTrendWidget
} from '../widgets';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

interface DashboardDataState {
  kpis: KpiMetric[];
  deviceStatus: DeviceStatusSnapshot | null;
  alarms: AlarmItem[];
  trend: TrendPoint[];
  dailySummary: DailySummary | null;
  updatedAt: string | null;
}

function getDefaultDefinitions(ctx: {
  navigateTo: (path: string) => void;
  acknowledgeAlarm: (alarmId: string) => Promise<void>;
  getData: () => DashboardDataState;
  isAllowed: (permissionCode: string) => boolean;
}): WidgetDefinition[] {
  const permission = 'dashboard:view';

  return [
    {
      id: 'kpi',
      title: 'KPI 卡片',
      permissionCode: permission,
      defaultLayout: { id: 'kpi', order: 0, colSpanLg: 2 },
      defaultConfig: { id: 'kpi', visible: true, refreshIntervalMs: 15000 },
      render: (renderCtx) => (
        <KpiWidget
          kpis={ctx.getData().kpis}
          navigateTo={ctx.navigateTo}
          requestRefreshAll={renderCtx.requestRefreshAll}
        />
      )
    } satisfies WidgetDefinition,
    {
      id: 'business_overview',
      title: '业务概览',
      permissionCode: permission,
      defaultLayout: { id: 'business_overview', order: 1, colSpanLg: 1 },
      defaultConfig: { id: 'business_overview', visible: true, refreshIntervalMs: null },
      render: (renderCtx) => (
        <BusinessOverviewWidget
          updatedAt={ctx.getData().updatedAt}
          requestRefreshAll={renderCtx.requestRefreshAll}
        />
      )
    } satisfies WidgetDefinition,
    {
      id: 'ai_assistant',
      title: 'AI 助手',
      permissionCode: permission,
      defaultLayout: { id: 'ai_assistant', order: 2, colSpanLg: 1 },
      defaultConfig: { id: 'ai_assistant', visible: true, refreshIntervalMs: null },
      render: () => (
        <AiAssistantWidget
          navigateTo={ctx.navigateTo}
          alarms={ctx.getData().alarms}
          kpis={ctx.getData().kpis}
          trend={ctx.getData().trend}
        />
      )
    } satisfies WidgetDefinition,
    {
      id: 'device_status',
      title: '设备状态',
      permissionCode: permission,
      defaultLayout: { id: 'device_status', order: 3, colSpanLg: 1 },
      defaultConfig: { id: 'device_status', visible: true, refreshIntervalMs: 15000 },
      render: () => <DeviceStatusWidget snapshot={ctx.getData().deviceStatus} />
    } satisfies WidgetDefinition,
    {
      id: 'alarm_center',
      title: '告警中心',
      permissionCode: permission,
      defaultLayout: { id: 'alarm_center', order: 4, colSpanLg: 1 },
      defaultConfig: { id: 'alarm_center', visible: true, refreshIntervalMs: 10000 },
      render: () => (
        <AlarmCenterWidget alarms={ctx.getData().alarms} acknowledgeAlarm={ctx.acknowledgeAlarm} />
      )
    } satisfies WidgetDefinition,
    {
      id: 'realtime_trend',
      title: '实时趋势',
      permissionCode: permission,
      defaultLayout: { id: 'realtime_trend', order: 5, colSpanLg: 2 },
      defaultConfig: { id: 'realtime_trend', visible: true, refreshIntervalMs: 15000 },
      render: () => <RealtimeTrendWidget points={ctx.getData().trend} />
    } satisfies WidgetDefinition,
    {
      id: 'quick_entry',
      title: '快捷入口',
      permissionCode: permission,
      defaultLayout: { id: 'quick_entry', order: 6, colSpanLg: 1 },
      defaultConfig: { id: 'quick_entry', visible: true, refreshIntervalMs: null },
      render: () => <QuickEntryWidget navigateTo={ctx.navigateTo} />
    } satisfies WidgetDefinition,
    {
      id: 'ai_daily_summary',
      title: 'AI 今日摘要',
      permissionCode: permission,
      defaultLayout: { id: 'ai_daily_summary', order: 7, colSpanLg: 1 },
      defaultConfig: { id: 'ai_daily_summary', visible: true, refreshIntervalMs: 60000 },
      render: (renderCtx) => (
        <AiDailySummaryWidget
          summary={ctx.getData().dailySummary}
          requestRefresh={() => renderCtx.requestRefresh('ai_daily_summary')}
        />
      )
    } satisfies WidgetDefinition
  ].filter((def) => ctx.isAllowed(def.permissionCode));
}

function buildDefaults(definitions: WidgetDefinition[]): DashboardWidgetPreferences {
  return {
    layouts: definitions.map((def) => def.defaultLayout),
    configs: definitions.map((def) => def.defaultConfig),
    updatedAt: new Date().toISOString()
  };
}

function findLayout(layouts: WidgetLayout[], widgetId: WidgetId): WidgetLayout | undefined {
  return layouts.find((layout) => layout.id === widgetId);
}

export default function DashboardPage() {
  const authStore = useAuthStore();
  const navigate = useNavigate();
  const token = authStore.token;

  const [data, setData] = useState<DashboardDataState>({
    kpis: [],
    deviceStatus: null,
    alarms: [],
    trend: [],
    dailySummary: null,
    updatedAt: null
  });
  const [loadingSnapshot, setLoadingSnapshot] = useState(false);
  const [snapshotError, setSnapshotError] = useState<string | null>(null);
  const [configOpen, setConfigOpen] = useState(false);
  const [refreshSignals, setRefreshSignals] = useState<Partial<Record<WidgetId, number>>>({});
  const [refreshAllSignal, setRefreshAllSignal] = useState(0);
  const dataRef = useRef(data);
  const hasLoadedSnapshotRef = useRef(false);
  const lastPassiveRefreshAtRef = useRef(0);

  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  const requestRefresh = useCallback((widgetId: WidgetId) => {
    setRefreshSignals((prev) => ({
      ...prev,
      [widgetId]: (prev[widgetId] ?? 0) + 1
    }));
  }, []);

  const requestRefreshAll = useCallback(() => {
    setRefreshAllSignal((prev) => prev + 1);
  }, []);

  const dailySummaryRefreshSignal = refreshSignals.ai_daily_summary ?? 0;

  const definitions = useMemo(
    () =>
      getDefaultDefinitions({
        navigateTo: (path) => navigate(path),
        acknowledgeAlarm: async (alarmId) => {
          if (!token) {
            return;
          }
          const response = await acknowledgeDashboardAlarm(token, alarmId);
          setData((prev) => ({
            ...prev,
            alarms: prev.alarms.map((item) => (item.id === alarmId ? response.alarm : item))
          }));
        },
        getData: () => dataRef.current,
        isAllowed: (permissionCode) => authStore.hasPermission(permissionCode)
      }),
    [authStore, navigate, token]
  );

  const [prefs, setPrefs] = useState<DashboardWidgetPreferences>(() => buildDefaults(definitions));

  useEffect(() => {
    const defaults = buildDefaults(definitions);
    setPrefs(loadDashboardWidgetPreferences(defaults));
  }, [definitions]);

  const visibleDefinitions = useMemo(() => {
    const visibleSet = new Set(
      prefs.configs.filter((config) => config.visible).map((config) => config.id)
    );
    const availableIds = new Set(definitions.map((def) => def.id));

    return definitions.filter((def) => visibleSet.has(def.id) && availableIds.has(def.id));
  }, [definitions, prefs.configs]);

  const mergedLayouts = useMemo(() => {
    const layoutMap = new Map<WidgetId, WidgetLayout>();
    for (const layout of prefs.layouts) {
      layoutMap.set(layout.id, layout);
    }

    for (const def of definitions) {
      if (!layoutMap.has(def.id)) {
        layoutMap.set(def.id, def.defaultLayout);
      }
    }

    return Array.from(layoutMap.values());
  }, [definitions, prefs.layouts]);

  const mergedConfigs = useMemo(() => {
    const configMap = new Map<WidgetId, WidgetUserConfig>();
    for (const config of prefs.configs) {
      configMap.set(config.id, config);
    }

    for (const def of definitions) {
      if (!configMap.has(def.id)) {
        configMap.set(def.id, def.defaultConfig);
      }
    }

    return Array.from(configMap.values());
  }, [definitions, prefs.configs]);

  const refreshSnapshot = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!token) {
        return;
      }

      if (!options?.silent) {
        setLoadingSnapshot(true);
      }
      setSnapshotError(null);

      try {
        const response = await getDashboardSnapshot(token);
        setData((prev) => ({
          ...prev,
          kpis: response.kpis,
          deviceStatus: response.deviceStatus,
          alarms: response.alarms,
          trend: response.trend,
          updatedAt: response.updatedAt
        }));
        hasLoadedSnapshotRef.current = true;
      } catch (error: unknown) {
        setSnapshotError(
          error instanceof Error ? error.message : 'Failed to load dashboard snapshot.'
        );
      } finally {
        if (!options?.silent) {
          setLoadingSnapshot(false);
        }
      }
    },
    [token]
  );

  const refreshDailySummary = useCallback(async () => {
    if (!token) {
      return;
    }

    try {
      const response = await getDailySummary(token);
      setData((prev) => ({
        ...prev,
        dailySummary: response.summary
      }));
    } catch {
      setData((prev) => ({
        ...prev,
        dailySummary: null
      }));
    }
  }, [token]);

  useEffect(() => {
    void refreshSnapshot({ silent: hasLoadedSnapshotRef.current });
  }, [refreshSnapshot, refreshAllSignal]);

  useEffect(() => {
    void refreshDailySummary();
  }, [refreshDailySummary, dailySummaryRefreshSignal]);

  const passiveRefresh = useCallback(async () => {
    if (!token) {
      return;
    }

    const now = Date.now();
    if (now - lastPassiveRefreshAtRef.current < 10_000) {
      return;
    }

    lastPassiveRefreshAtRef.current = now;
    await refreshSnapshot({ silent: true });
    await refreshDailySummary();
  }, [refreshDailySummary, refreshSnapshot, token]);

  const sseUrl = useMemo(() => {
    if (!token) {
      return null;
    }

    return `${API_BASE_URL}/sse/dashboard?token=${encodeURIComponent(token)}`;
  }, [token]);

  const sseState = useSse<DashboardSseEvent>({
    url: sseUrl ?? '',
    parse: (event) => {
      if (!event.data) {
        return null;
      }
      try {
        return JSON.parse(event.data) as DashboardSseEvent;
      } catch {
        return null;
      }
    },
    onMessage: (message) => {
      setData((prev) => {
        switch (message.type) {
          case 'kpi:update':
            return {
              ...prev,
              kpis: message.payload.kpis,
              updatedAt: message.payload.updatedAt
            };
          case 'device:status':
            return {
              ...prev,
              deviceStatus: message.payload
            };
          case 'alarm:new':
            return {
              ...prev,
              alarms: [message.payload, ...prev.alarms].slice(0, 20)
            };
          case 'alarm:update':
            return {
              ...prev,
              alarms: prev.alarms.map((item) =>
                item.id === message.payload.id ? message.payload : item
              )
            };
          case 'trend:point':
            return {
              ...prev,
              trend: [...prev.trend, message.payload].slice(-60)
            };
          default:
            return prev;
        }
      });
    }
  });

  const previousSseStatusRef = useRef(sseState.status);

  useEffect(() => {
    const onFocus = () => {
      void passiveRefresh();
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void passiveRefresh();
      }
    };

    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [passiveRefresh]);

  useEffect(() => {
    const previous = previousSseStatusRef.current;
    previousSseStatusRef.current = sseState.status;

    if (previous !== 'open' && sseState.status === 'open') {
      void passiveRefresh();
    }
  }, [passiveRefresh, sseState.status]);

  const items = useMemo(() => {
    return visibleDefinitions.map((def) => {
      const layout = findLayout(mergedLayouts, def.id) ?? def.defaultLayout;
      const content = def.render({
        requestRefresh,
        requestRefreshAll,
        refreshSignal: refreshSignals[def.id] ?? 0,
        refreshAllSignal
      });

      return {
        layout,
        content
      };
    });
  }, [
    mergedLayouts,
    refreshAllSignal,
    refreshSignals,
    requestRefresh,
    requestRefreshAll,
    visibleDefinitions
  ]);

  const headerMessage = useMemo(() => {
    if (snapshotError) {
      return snapshotError;
    }
    if (loadingSnapshot) {
      return '正在加载首页快照...';
    }
    if (sseUrl) {
      if (sseState.status === 'open') {
        return '实时连接已建立。';
      }
      if (sseState.status === 'error') {
        return '实时连接断开，正在重连...';
      }
    }
    return null;
  }, [loadingSnapshot, snapshotError, sseState.status, sseUrl]);

  const headerTone = snapshotError ? 'rose' : sseState.status === 'open' ? 'cyan' : 'slate';

  const shouldShowBanner = headerMessage !== null;

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-slate-400">首页</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">数据看板</h1>
          <p className="mt-2 text-slate-500">
            企业级后台业务入口：KPI、告警、设备、趋势与 AI 助手。
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
            onClick={() => {
              setConfigOpen(true);
            }}
          >
            配置中心
          </button>
          <button
            type="button"
            className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-cyan-400"
            onClick={() => {
              requestRefreshAll();
            }}
          >
            全部刷新
          </button>
        </div>
      </header>

      <div
        aria-hidden={!shouldShowBanner}
        className={[
          'rounded-2xl border px-4 py-3 text-sm',
          shouldShowBanner ? '' : 'invisible',
          headerTone === 'rose'
            ? 'border-rose-200 bg-rose-50 text-rose-700'
            : headerTone === 'cyan'
              ? 'border-cyan-200 bg-cyan-50 text-cyan-800'
              : 'border-slate-200 bg-slate-50 text-slate-600'
        ].join(' ')}
      >
        {headerMessage ?? ' '}
      </div>

      <WidgetGrid items={items} />

      <WidgetConfigPanel
        open={configOpen}
        definitions={definitions}
        layouts={mergedLayouts}
        configs={mergedConfigs}
        onClose={() => setConfigOpen(false)}
        onToggleVisible={(widgetId, visible) => {
          const next = updateWidgetConfig(prefs, (current) => ({ ...current, visible }), widgetId);
          setPrefs(next);
          saveDashboardWidgetPreferences(next);
        }}
        onMove={(widgetId, direction) => {
          const next = moveWidgetLayout(prefs, widgetId, direction);
          setPrefs(next);
          saveDashboardWidgetPreferences(next);
        }}
        onRefreshIntervalChange={(widgetId, refreshIntervalMs) => {
          const next = updateWidgetConfig(
            prefs,
            (current) => ({ ...current, refreshIntervalMs }),
            widgetId
          );
          setPrefs(next);
          saveDashboardWidgetPreferences(next);
        }}
      />

      <WidgetContainer
        title="系统状态"
        state="ready"
        onRefresh={() => {
          void refreshSnapshot();
        }}
      >
        <dl className="grid gap-3 text-sm text-slate-600 md:grid-cols-2">
          <div className="flex justify-between gap-3">
            <dt>当前用户</dt>
            <dd className="font-medium text-slate-900">{authStore.user?.username ?? '-'}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt>角色</dt>
            <dd className="font-medium text-slate-900">
              {authStore.roles.map((role) => role.id).join(', ') || '-'}
            </dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt>实时连接</dt>
            <dd className="font-medium text-slate-900">{sseUrl ? sseState.status : '-'}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt>最后更新</dt>
            <dd className="font-medium text-slate-900">{data.updatedAt ?? '-'}</dd>
          </div>
        </dl>
      </WidgetContainer>
    </div>
  );
}
