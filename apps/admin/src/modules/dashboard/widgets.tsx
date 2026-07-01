import { useEffect, useMemo, useRef, useState } from 'react';
import type { EChartsOption } from 'echarts';
import type {
  AlarmItem,
  DailySummary,
  DeviceStatusSnapshot,
  KpiMetric,
  TrendPoint
} from './types/dashboard';
import WidgetContainer from './components/WidgetContainer';
import EChart from './components/charts/EChart';
import type { AlarmLevel, KpiMetric as KpiMetricType } from './types/dashboard';
import type { WidgetId } from './types/widgets';

function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value);
}

function formatPercent(value: number): string {
  const sign = value > 0 ? '+' : '';
  return `${sign}${(value * 100).toFixed(1)}%`;
}

function getAlarmLevelClasses(level: AlarmLevel): string {
  switch (level) {
    case 'critical':
      return 'bg-rose-100 text-rose-700 border-rose-200';
    case 'high':
      return 'bg-orange-100 text-orange-700 border-orange-200';
    case 'medium':
      return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'low':
      return 'bg-slate-100 text-slate-700 border-slate-200';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
}

function useCountUp(value: number, durationMs = 800): number {
  const [animated, setAnimated] = useState(value);
  const previousRef = useRef(value);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const from = previousRef.current;
    const to = value;
    previousRef.current = value;

    if (from === to) {
      setAnimated(to);
      return;
    }

    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = from + (to - from) * eased;
      setAnimated(current);

      if (progress < 1) {
        frameRef.current = window.requestAnimationFrame(tick);
      }
    };

    frameRef.current = window.requestAnimationFrame(tick);

    return () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, [durationMs, value]);

  return animated;
}

function MetricDelta({ label, value }: { label: string; value: number | undefined }) {
  if (typeof value !== 'number') {
    return (
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>{label}</span>
        <span>-</span>
      </div>
    );
  }

  const positive = value > 0;
  const tone = positive ? 'text-emerald-700' : value < 0 ? 'text-rose-700' : 'text-slate-600';

  return (
    <div className="flex items-center justify-between text-xs text-slate-500">
      <span>{label}</span>
      <span className={tone}>{formatPercent(value)}</span>
    </div>
  );
}

export function KpiWidget({
  kpis,
  navigateTo,
  requestRefreshAll
}: {
  kpis: KpiMetricType[];
  navigateTo: (path: string) => void;
  requestRefreshAll: () => void;
}) {
  const state = kpis.length === 0 ? 'empty' : 'ready';

  return (
    <WidgetContainer title="KPI 卡片" state={state} onRefresh={requestRefreshAll}>
      <div className="grid gap-3 md:grid-cols-3">
        {kpis.map((metric) => (
          <KpiCard key={metric.id} metric={metric} navigateTo={navigateTo} />
        ))}
      </div>
    </WidgetContainer>
  );
}

function KpiCard({
  metric,
  navigateTo
}: {
  metric: KpiMetric;
  navigateTo: (path: string) => void;
}) {
  const animatedValue = useCountUp(metric.value);

  return (
    <button
      type="button"
      className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:bg-slate-100"
      onClick={() => {
        if (metric.href) {
          navigateTo(metric.href);
        }
      }}
    >
      <p className="text-sm text-slate-500">{metric.title}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-900">
        {formatNumber(Math.round(animatedValue))} {metric.unit ?? ''}
      </p>
      <div className="mt-3 space-y-1">
        <MetricDelta label="环比" value={metric.deltaMoM} />
        <MetricDelta label="同比" value={metric.deltaYoY} />
      </div>
    </button>
  );
}

export function BusinessOverviewWidget({
  updatedAt,
  requestRefreshAll
}: {
  updatedAt: string | null;
  requestRefreshAll: () => void;
}) {
  const now = useMemo(() => new Date(), []);
  const [clock, setClock] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => {
      setClock(new Date());
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <WidgetContainer title="业务概览" state="ready" onRefresh={requestRefreshAll}>
      <dl className="space-y-3 text-sm text-slate-600">
        <div className="flex justify-between gap-3">
          <dt>本地时间</dt>
          <dd className="font-medium text-slate-900">{clock.toLocaleString()}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt>会话开始</dt>
          <dd className="font-medium text-slate-900">{now.toLocaleTimeString()}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt>服务端更新时间</dt>
          <dd className="font-medium text-slate-900">{updatedAt ?? '-'}</dd>
        </div>
      </dl>
    </WidgetContainer>
  );
}

export function DeviceStatusWidget({ snapshot }: { snapshot: DeviceStatusSnapshot | null }) {
  const [mode, setMode] = useState<'pie' | 'bar'>('pie');
  const items = useMemo(
    () => [
      { name: '在线', value: snapshot?.online ?? 0 },
      { name: '离线', value: snapshot?.offline ?? 0 },
      { name: '故障', value: snapshot?.fault ?? 0 },
      { name: '维修中', value: snapshot?.maintenance ?? 0 }
    ],
    [snapshot]
  );

  const option = useMemo<EChartsOption>(() => {
    if (mode === 'pie') {
      return {
        tooltip: { trigger: 'item' },
        series: [
          {
            type: 'pie',
            radius: ['45%', '70%'],
            itemStyle: { borderRadius: 8 },
            label: { show: false },
            data: items
          }
        ]
      };
    }

    return {
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: items.map((item) => item.name) },
      yAxis: { type: 'value' },
      series: [
        {
          type: 'bar',
          data: items.map((item) => item.value)
        }
      ]
    };
  }, [items, mode]);

  if (!snapshot) {
    return (
      <WidgetContainer title="设备状态" state="empty">
        <div />
      </WidgetContainer>
    );
  }

  return (
    <WidgetContainer
      title="设备状态"
      state="ready"
      extra={
        <div className="flex items-center gap-2">
          <button
            type="button"
            className={[
              'rounded-lg border px-3 py-1.5 text-xs transition',
              mode === 'pie'
                ? 'border-cyan-200 bg-cyan-50 text-cyan-800'
                : 'border-slate-200 text-slate-700 hover:bg-slate-50'
            ].join(' ')}
            onClick={() => setMode('pie')}
          >
            饼图
          </button>
          <button
            type="button"
            className={[
              'rounded-lg border px-3 py-1.5 text-xs transition',
              mode === 'bar'
                ? 'border-cyan-200 bg-cyan-50 text-cyan-800'
                : 'border-slate-200 text-slate-700 hover:bg-slate-50'
            ].join(' ')}
            onClick={() => setMode('bar')}
          >
            柱状图
          </button>
        </div>
      }
    >
      <EChart option={option} height={260} />
      <p className="mt-3 text-xs text-slate-500">
        更新于：{new Date(snapshot.updatedAt).toLocaleTimeString()}
      </p>
    </WidgetContainer>
  );
}

export function RealtimeTrendWidget({ points }: { points: TrendPoint[] }) {
  const [metric, setMetric] = useState<'energy' | 'aiCalls' | 'onlineDevices' | 'alarms'>('energy');

  const series = useMemo(() => {
    return points.map((point) => [Date.parse(point.timestamp), point[metric]] as [number, number]);
  }, [metric, points]);

  const option = useMemo<EChartsOption>(() => {
    return {
      tooltip: { trigger: 'axis' },
      grid: { left: 12, right: 12, bottom: 24, top: 12, containLabel: true },
      xAxis: {
        type: 'time',
        axisLabel: { formatter: (value: number) => new Date(value).toLocaleTimeString() }
      },
      yAxis: { type: 'value' },
      series: [
        {
          type: 'line',
          showSymbol: false,
          smooth: true,
          areaStyle: { opacity: 0.12 },
          data: series
        }
      ]
    };
  }, [series]);

  const state = points.length === 0 ? 'empty' : 'ready';

  return (
    <WidgetContainer
      title="实时趋势"
      state={state}
      extra={
        <select
          className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-700 outline-none"
          value={metric}
          onChange={(event) => {
            const value = event.currentTarget.value;
            if (
              value === 'energy' ||
              value === 'aiCalls' ||
              value === 'onlineDevices' ||
              value === 'alarms'
            ) {
              setMetric(value);
            }
          }}
        >
          <option value="energy">能耗</option>
          <option value="aiCalls">AI 调用</option>
          <option value="onlineDevices">在线设备</option>
          <option value="alarms">告警</option>
        </select>
      }
    >
      <EChart option={option} height={300} />
    </WidgetContainer>
  );
}

function AlarmDetailsModal({
  alarm,
  onClose,
  onAcknowledge
}: {
  alarm: AlarmItem;
  onClose: () => void;
  onAcknowledge: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <button
        type="button"
        aria-label="关闭告警详情"
        className="absolute inset-0 bg-slate-950/40"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-slate-400">告警</p>
            <h3 className="mt-2 text-xl font-semibold text-slate-900">{alarm.title}</h3>
          </div>
          <button
            type="button"
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
            onClick={onClose}
          >
            关闭
          </button>
        </div>

        <div className="mt-4 space-y-3 text-sm text-slate-700">
          <p>{alarm.description}</p>
          <dl className="grid gap-2 md:grid-cols-2">
            <div className="flex justify-between gap-3">
              <dt className="text-slate-500">等级</dt>
              <dd className="font-medium text-slate-900">{alarm.level}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-slate-500">来源</dt>
              <dd className="font-medium text-slate-900">{alarm.source}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-slate-500">发生时间</dt>
              <dd className="font-medium text-slate-900">
                {new Date(alarm.occurredAt).toLocaleString()}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-slate-500">状态</dt>
              <dd className="font-medium text-slate-900">
                {alarm.acknowledged ? '已确认' : '新告警'}
              </dd>
            </div>
          </dl>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          {!alarm.acknowledged ? (
            <button
              type="button"
              className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-cyan-400"
              onClick={onAcknowledge}
            >
              确认
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function AlarmCenterWidget({
  alarms,
  acknowledgeAlarm
}: {
  alarms: AlarmItem[];
  acknowledgeAlarm: (alarmId: string) => Promise<void>;
}) {
  const [selected, setSelected] = useState<AlarmItem | null>(null);
  const state = alarms.length === 0 ? 'empty' : 'ready';

  return (
    <WidgetContainer title="告警中心" state={state}>
      <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
        {alarms.map((alarm) => (
          <div
            key={alarm.id}
            className="flex items-start justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3"
          >
            <button
              type="button"
              className="flex-1 text-left"
              onClick={() => {
                setSelected(alarm);
              }}
            >
              <div className="flex items-center gap-2">
                <span
                  className={[
                    'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium',
                    getAlarmLevelClasses(alarm.level)
                  ].join(' ')}
                >
                  {alarm.level}
                </span>
                <span className="text-xs text-slate-500">{alarm.source}</span>
              </div>
              <p className="mt-2 text-sm font-medium text-slate-900">{alarm.title}</p>
              <p className="mt-1 text-xs text-slate-500">
                {new Date(alarm.occurredAt).toLocaleString()}
              </p>
            </button>

            <div className="flex flex-col items-end gap-2">
              {alarm.acknowledged ? (
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                  已确认
                </span>
              ) : (
                <button
                  type="button"
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 transition hover:bg-slate-50"
                  onClick={() => {
                    void acknowledgeAlarm(alarm.id);
                  }}
                >
                  确认
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {selected ? (
        <AlarmDetailsModal
          alarm={selected}
          onClose={() => setSelected(null)}
          onAcknowledge={() => {
            void acknowledgeAlarm(selected.id);
          }}
        />
      ) : null}
    </WidgetContainer>
  );
}

interface QuickEntry {
  id: string;
  title: string;
  path: string;
}

const QUICK_ENTRIES: QuickEntry[] = [
  { id: 'devices', title: '设备中心', path: '/devices' },
  { id: 'ai-copilot', title: 'AI Copilot', path: '/ai-copilot' },
  { id: 'agents', title: 'AI 智能体', path: '/agents' },
  { id: 'workflows', title: '工作流', path: '/workflows' },
  { id: 'screens', title: '数字大屏', path: '/screens' },
  { id: 'system', title: '系统管理', path: '/system' }
];

const QUICK_ENTRY_STORAGE_KEY = 'enterprise-ai-console.dashboard.quick-entry:v1';

function loadQuickEntryPrefs(): { pinned: string[]; recent: string[] } {
  if (typeof window === 'undefined') {
    return { pinned: [], recent: [] };
  }

  const raw = window.localStorage.getItem(QUICK_ENTRY_STORAGE_KEY);
  if (!raw) {
    return { pinned: [], recent: [] };
  }

  try {
    const parsed = JSON.parse(raw) as { pinned?: unknown; recent?: unknown };
    const pinned = Array.isArray(parsed.pinned)
      ? parsed.pinned.filter((id): id is string => typeof id === 'string')
      : [];
    const recent = Array.isArray(parsed.recent)
      ? parsed.recent.filter((id): id is string => typeof id === 'string')
      : [];
    return { pinned, recent };
  } catch {
    return { pinned: [], recent: [] };
  }
}

function saveQuickEntryPrefs(value: { pinned: string[]; recent: string[] }) {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem(QUICK_ENTRY_STORAGE_KEY, JSON.stringify(value));
}

export function QuickEntryWidget({ navigateTo }: { navigateTo: (path: string) => void }) {
  const [prefs, setPrefs] = useState(() => loadQuickEntryPrefs());
  const pinnedSet = useMemo(() => new Set(prefs.pinned), [prefs.pinned]);

  const ordered = useMemo(() => {
    const pinned = QUICK_ENTRIES.filter((entry) => pinnedSet.has(entry.id));
    const rest = QUICK_ENTRIES.filter((entry) => !pinnedSet.has(entry.id));
    return [...pinned, ...rest];
  }, [pinnedSet]);

  const markRecent = (id: string) => {
    setPrefs((prev) => {
      const nextRecent = [id, ...prev.recent.filter((item) => item !== id)].slice(0, 5);
      const next = { ...prev, recent: nextRecent };
      saveQuickEntryPrefs(next);
      return next;
    });
  };

  return (
    <WidgetContainer title="快捷入口" state="ready">
      <div className="grid gap-2">
        {ordered.map((entry) => (
          <div
            key={entry.id}
            className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
          >
            <button
              type="button"
              className="flex-1 text-left text-sm font-medium text-slate-900"
              onClick={() => {
                markRecent(entry.id);
                navigateTo(entry.path);
              }}
            >
              {entry.title}
              {prefs.recent.includes(entry.id) ? (
                <span className="ml-2 rounded-full bg-cyan-100 px-2 py-0.5 text-xs font-medium text-cyan-800">
                  最近
                </span>
              ) : null}
            </button>

            <button
              type="button"
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 transition hover:bg-slate-50"
              onClick={() => {
                setPrefs((prev) => {
                  const pinned = pinnedSet.has(entry.id)
                    ? prev.pinned.filter((item) => item !== entry.id)
                    : [...prev.pinned, entry.id];
                  const next = { ...prev, pinned };
                  saveQuickEntryPrefs(next);
                  return next;
                });
              }}
            >
              {pinnedSet.has(entry.id) ? '取消置顶' : '置顶'}
            </button>
          </div>
        ))}
      </div>
    </WidgetContainer>
  );
}

type ChatRole = 'user' | 'assistant';

interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
}

function createMessage(role: ChatRole, content: string): ChatMessage {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    role,
    content,
    createdAt: new Date().toISOString()
  };
}

function detectNavigationIntent(text: string): string | null {
  const normalized = text.trim();
  if (!normalized) {
    return null;
  }

  if (normalized.includes('设备中心')) return '/devices';
  if (normalized.toLowerCase().includes('copilot')) return '/ai-copilot';
  if (normalized.toLowerCase().includes('agent')) return '/agents';
  if (normalized.toLowerCase().includes('workflow')) return '/workflows';
  if (normalized.includes('数字大屏')) return '/screens';
  if (normalized.includes('系统管理')) return '/system';

  return null;
}

function buildAlarmSummary(alarms: AlarmItem[]): string {
  if (alarms.length === 0) {
    return '今天暂无告警。';
  }

  const top = alarms.slice(0, 5);
  const lines = top.map((alarm) => `- [${alarm.level}] ${alarm.title} (${alarm.source})`);
  return `最新告警 ${alarms.length} 条：\n${lines.join('\n')}`;
}

function buildAiCallSummary(kpis: KpiMetric[]): string {
  const metric = kpis.find((item) => item.id === 'ai_calls');
  if (!metric) {
    return '暂未获取 AI 调用 KPI。';
  }
  return `最近统计：AI 调用次数 ${formatNumber(metric.value)} 次。`;
}

export function AiAssistantWidget({
  navigateTo,
  alarms,
  kpis,
  trend
}: {
  navigateTo: (path: string) => void;
  alarms: AlarmItem[];
  kpis: KpiMetric[];
  trend: TrendPoint[];
}) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    createMessage(
      'assistant',
      [
        '你好，我是 AI 助手。',
        '示例：',
        '- 今天有哪些告警？',
        '- 帮我打开设备中心',
        '- 查询最近 AI 调用',
        '- 帮助'
      ].join('\n')
    )
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);

  const send = async () => {
    const text = input.trim();
    if (!text || sending) {
      return;
    }

    setSending(true);
    setInput('');
    setMessages((prev) => [...prev, createMessage('user', text)]);

    const lower = text.toLowerCase();

    if (lower.includes('帮助') || lower.includes('help')) {
      setMessages((prev) => [
        ...prev,
        createMessage(
          'assistant',
          [
            '支持：',
            '- 今天有哪些告警？',
            '- 帮我打开设备中心',
            '- 查询最近 AI 调用',
            '- 打开 工作流 / 智能体 / 系统管理'
          ].join('\n')
        )
      ]);
      setSending(false);
      return;
    }

    if (lower.includes('告警')) {
      setMessages((prev) => [...prev, createMessage('assistant', buildAlarmSummary(alarms))]);
      setSending(false);
      return;
    }

    if (lower.includes('ai') && lower.includes('调用')) {
      setMessages((prev) => [...prev, createMessage('assistant', buildAiCallSummary(kpis))]);
      setSending(false);
      return;
    }

    const navPath = detectNavigationIntent(text);
    if (navPath) {
      navigateTo(navPath);
      setMessages((prev) => [...prev, createMessage('assistant', `已为你打开：${navPath}`)]);
      setSending(false);
      return;
    }

    if (lower.includes('趋势')) {
      const latest = trend.at(-1);
      if (!latest) {
        setMessages((prev) => [...prev, createMessage('assistant', '暂无趋势数据。')]);
      } else {
        setMessages((prev) => [
          ...prev,
          createMessage(
            'assistant',
            `最新趋势：能耗 ${formatNumber(latest.energy)}，AI 调用 ${formatNumber(latest.aiCalls)}，在线设备 ${formatNumber(
              latest.onlineDevices
            )}，告警 ${formatNumber(latest.alarms)}。`
          )
        ]);
      }
      setSending(false);
      return;
    }

    setMessages((prev) => [
      ...prev,
      createMessage(
        'assistant',
        '已收到。当前版本仅支持快捷查询与导航指令。输入“帮助”查看支持范围。'
      )
    ]);
    setSending(false);
  };

  return (
    <WidgetContainer title="AI 助手" state="ready">
      <div className="flex h-80 flex-col gap-3">
        <div className="flex-1 space-y-2 overflow-y-auto rounded-2xl bg-slate-50 p-3 text-sm text-slate-700">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={[
                'rounded-2xl px-3 py-2',
                msg.role === 'assistant' ? 'bg-white text-slate-700' : 'bg-cyan-50 text-cyan-900'
              ].join(' ')}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
              <p className="mt-1 text-[11px] text-slate-400">
                {new Date(msg.createdAt).toLocaleTimeString()}
              </p>
            </div>
          ))}
        </div>

        <form
          className="flex items-center gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            void send();
          }}
        >
          <input
            className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-cyan-300"
            value={input}
            placeholder="输入指令，例如：今天有哪些告警？"
            onChange={(event) => setInput(event.currentTarget.value)}
            disabled={sending}
          />
          <button
            type="submit"
            className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-cyan-400 disabled:opacity-50"
            disabled={sending}
          >
            发送
          </button>
        </form>
      </div>
    </WidgetContainer>
  );
}

export function AiDailySummaryWidget({
  summary,
  requestRefresh
}: {
  summary: DailySummary | null;
  requestRefresh: () => void;
}) {
  const state = summary ? 'ready' : 'empty';

  return (
    <WidgetContainer title="AI 今日摘要" state={state} onRefresh={requestRefresh}>
      {summary ? (
        <dl className="space-y-3 text-sm text-slate-600">
          <div className="flex justify-between gap-3">
            <dt>Date</dt>
            <dd className="font-medium text-slate-900">{summary.date}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt>新增设备</dt>
            <dd className="font-medium text-slate-900">{formatNumber(summary.newDevices)}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt>新增告警</dt>
            <dd className="font-medium text-slate-900">{formatNumber(summary.newAlarms)}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt>AI 调用</dt>
            <dd className="font-medium text-slate-900">{formatNumber(summary.aiCalls)}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt>Workflow 成功率</dt>
            <dd className="font-medium text-slate-900">
              {(summary.workflowSuccessRate * 100).toFixed(1)}%
            </dd>
          </div>
        </dl>
      ) : (
        <div />
      )}
    </WidgetContainer>
  );
}

export const DASHBOARD_WIDGET_IDS: WidgetId[] = [
  'kpi',
  'business_overview',
  'device_status',
  'realtime_trend',
  'alarm_center',
  'quick_entry',
  'ai_assistant',
  'ai_daily_summary'
];
