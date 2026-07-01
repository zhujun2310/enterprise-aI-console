import { useEffect, useMemo, useState } from 'react';
import type { EChartsOption } from 'echarts';
import { Link, useNavigate, useParams } from 'react-router-dom';
import EChart from '../../dashboard/components/charts/EChart';
import PageHeader from '../components/PageHeader';
import { CommBadge, OnlineBadge } from '../components/StatusBadge';
import type { MonitorMetric } from '../types/device';
import { useDeviceStore } from '../store/deviceStore';

function rangeToWindow(range: '1h' | '6h' | '24h' | '7d') {
  const now = Date.now();
  const delta =
    range === '1h'
      ? 60 * 60_000
      : range === '6h'
        ? 6 * 60 * 60_000
        : range === '24h'
          ? 24 * 60 * 60_000
          : 7 * 24 * 60 * 60_000;
  return {
    from: new Date(now - delta).toISOString(),
    to: new Date(now).toISOString()
  };
}

const metricOptions: Array<{ key: MonitorMetric['key']; label: string }> = [
  { key: 'temperature', label: '温度' },
  { key: 'pressure', label: '压力' },
  { key: 'voltage', label: '电压' },
  { key: 'current', label: '电流' },
  { key: 'cpu', label: 'CPU' },
  { key: 'memory', label: '内存' },
  { key: 'rpm', label: '转速' }
];

export default function DeviceMonitorView() {
  const { deviceId } = useParams<{ deviceId: string }>();
  const navigate = useNavigate();
  const store = useDeviceStore();
  const id = deviceId ?? '';

  const detailState = store.details[id] ?? { data: null, loading: false, error: null };
  const monitorState = store.monitor[id] ?? { data: null, loading: false, error: null };

  const [autoRefresh, setAutoRefresh] = useState(true);
  const [range, setRange] = useState<'1h' | '6h' | '24h' | '7d'>('6h');
  const [metricKey, setMetricKey] = useState<MonitorMetric['key']>('temperature');

  const historyWindow = useMemo(() => rangeToWindow(range), [range]);
  const historyKey = `${id}:${metricKey}:${historyWindow.from}:${historyWindow.to}`;
  const historyState = store.history[historyKey] ?? { data: null, loading: false, error: null };

  useEffect(() => {
    if (!id) return;
    void store.fetchDeviceDetail(id);
    void store.fetchDeviceMonitor(id);
  }, [id, store.fetchDeviceDetail, store.fetchDeviceMonitor]);

  useEffect(() => {
    if (!id) return;
    void store.fetchDeviceHistory({
      deviceId: id,
      metricKey,
      from: historyWindow.from,
      to: historyWindow.to
    });
  }, [historyWindow.from, historyWindow.to, id, metricKey, store.fetchDeviceHistory]);

  useEffect(() => {
    if (!id || !autoRefresh) return;
    const timer = window.setInterval(() => {
      void store.fetchDeviceMonitor(id);
    }, 5_000);
    return () => window.clearInterval(timer);
  }, [autoRefresh, id, store.fetchDeviceMonitor]);

  const device = detailState.data;
  const snapshot = monitorState.data;
  const series = historyState.data;

  const breadcrumb = useMemo(
    () => (
      <div className="flex items-center gap-2">
        <Link className="text-slate-600 hover:text-slate-900 hover:underline" to="/devices">
          设备列表
        </Link>
        <span className="text-slate-400">/</span>
        {id ? (
          <Link
            className="text-slate-600 hover:text-slate-900 hover:underline"
            to={`/devices/${encodeURIComponent(id)}`}
          >
            设备详情
          </Link>
        ) : (
          <span className="text-slate-600">设备详情</span>
        )}
        <span className="text-slate-400">/</span>
        <span className="text-slate-900">实时监控</span>
      </div>
    ),
    [id]
  );

  const trendOption: EChartsOption = useMemo(() => {
    const times = snapshot?.trend.map((item) => new Date(item.at).toLocaleTimeString()) ?? [];
    const values = snapshot?.trend.map((item) => item.value) ?? [];
    return {
      tooltip: { trigger: 'axis' },
      grid: { left: 40, right: 16, top: 20, bottom: 30 },
      xAxis: { type: 'category', data: times, axisLabel: { color: '#64748b' } },
      yAxis: { type: 'value', axisLabel: { color: '#64748b' } },
      series: [
        { type: 'line', data: values, smooth: true, showSymbol: false, lineStyle: { width: 2 } }
      ]
    };
  }, [snapshot]);

  const gaugeOption: EChartsOption = useMemo(() => {
    return {
      series: [
        {
          type: 'gauge',
          startAngle: 210,
          endAngle: -30,
          min: snapshot?.gauge.min ?? 0,
          max: snapshot?.gauge.max ?? 100,
          progress: { show: true, width: 14 },
          axisLine: { lineStyle: { width: 14 } },
          pointer: { show: false },
          axisTick: { show: false },
          splitLine: { show: false },
          axisLabel: { color: '#64748b' },
          detail: { valueAnimation: true, formatter: '{value}%', color: '#0f172a', fontSize: 18 },
          data: [{ value: snapshot?.gauge.value ?? 0, name: snapshot?.gauge.name ?? '健康度' }]
        }
      ]
    };
  }, [snapshot]);

  const barOption: EChartsOption = useMemo(() => {
    const labels = snapshot?.bars.map((item) => item.name) ?? [];
    const values = snapshot?.bars.map((item) => item.value) ?? [];
    return {
      tooltip: { trigger: 'axis' },
      grid: { left: 40, right: 16, top: 20, bottom: 30 },
      xAxis: { type: 'category', data: labels, axisLabel: { color: '#64748b' } },
      yAxis: { type: 'value', axisLabel: { color: '#64748b' } },
      series: [{ type: 'bar', data: values, barWidth: 18 }]
    };
  }, [snapshot]);

  const historyOption: EChartsOption = useMemo(() => {
    const times = series?.points.map((item) => new Date(item.at).toLocaleString()) ?? [];
    const values = series?.points.map((item) => item.value) ?? [];
    return {
      tooltip: { trigger: 'axis' },
      grid: { left: 40, right: 16, top: 20, bottom: 30 },
      xAxis: { type: 'category', data: times, axisLabel: { color: '#64748b', hideOverlap: true } },
      yAxis: { type: 'value', axisLabel: { color: '#64748b' } },
      series: [
        {
          type: 'line',
          data: values,
          smooth: true,
          showSymbol: false,
          areaStyle: { opacity: 0.12 }
        }
      ]
    };
  }, [series]);

  return (
    <section className="space-y-4">
      <PageHeader
        title="实时监控"
        breadcrumbs={breadcrumb}
        actions={
          <>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              onClick={() => navigate(id ? `/devices/${id}` : '/devices')}
            >
              <span className="i-lucide-arrow-left h-4 w-4" />
              返回
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
              disabled={!id}
              onClick={() => id && store.fetchDeviceMonitor(id)}
            >
              <span className="i-lucide-refresh-cw h-4 w-4" />
              刷新
            </button>
          </>
        }
      />

      {device ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="max-w-[680px] truncate text-lg font-semibold text-slate-900">
                  {device.name}
                </h2>
                <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs text-slate-600">
                  {device.code}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-500">
                {device.regionName} · {device.orgName} · {device.location}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <OnlineBadge online={device.status.online} />
              <CommBadge status={device.status.commStatus} />
              <label className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(event) => setAutoRefresh(Boolean(event.target.checked))}
                />
                Mock 刷新
              </label>
              <Link
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                to={`/devices/alarms?deviceId=${encodeURIComponent(id)}`}
              >
                告警
              </Link>
              <Link
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                to={`/devices/ops?deviceId=${encodeURIComponent(id)}`}
              >
                运维
              </Link>
            </div>
          </div>

          {monitorState.error ? (
            <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
              {monitorState.error}
            </div>
          ) : null}

          <div className="mt-4 grid gap-3 lg:grid-cols-4">
            {(snapshot?.metrics ?? []).slice(0, 4).map((metric) => (
              <div key={metric.key} className="rounded-2xl bg-slate-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {metric.name}
                </div>
                <div className="mt-2 text-2xl font-semibold text-slate-900">
                  {metric.value}
                  <span className="ml-1 text-sm font-medium text-slate-600">{metric.unit}</span>
                </div>
                <div className="mt-2 text-xs text-slate-500">
                  {new Date(metric.updatedAt).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-7">
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-slate-900">实时趋势</h3>
              <span className="text-sm text-slate-500">
                {snapshot?.updatedAt ? new Date(snapshot.updatedAt).toLocaleTimeString() : '-'}
              </span>
            </div>
            <div className="mt-3">
              <EChart option={trendOption} height={300} loading={monitorState.loading} />
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-slate-900">历史数据</h3>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm"
                  value={metricKey}
                  onChange={(event) => setMetricKey(event.target.value as MonitorMetric['key'])}
                >
                  {metricOptions.map((option) => (
                    <option key={option.key} value={option.key}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <select
                  className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm"
                  value={range}
                  onChange={(event) => setRange(event.target.value as typeof range)}
                >
                  <option value="1h">近 1 小时</option>
                  <option value="6h">近 6 小时</option>
                  <option value="24h">近 24 小时</option>
                  <option value="7d">近 7 天</option>
                </select>
              </div>
            </div>
            {historyState.error ? (
              <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                {historyState.error}
              </div>
            ) : null}
            <div className="mt-3">
              <EChart option={historyOption} height={320} loading={historyState.loading} />
            </div>
            {series ? (
              <div className="mt-3 grid gap-3 rounded-xl bg-slate-50 p-4 text-sm text-slate-700 lg:grid-cols-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-600">最小值</span>
                  <span className="font-medium text-slate-900">{series.stats.min}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-600">最大值</span>
                  <span className="font-medium text-slate-900">{series.stats.max}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-600">平均值</span>
                  <span className="font-medium text-slate-900">{series.stats.avg}</span>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="space-y-4 lg:col-span-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-slate-900">健康度</h3>
              <span className="text-sm text-slate-500">{snapshot?.gauge.name ?? '-'}</span>
            </div>
            <div className="mt-3">
              <EChart option={gaugeOption} height={280} loading={monitorState.loading} />
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-slate-900">链路指标</h3>
              <span className="text-sm text-slate-500">Mock</span>
            </div>
            <div className="mt-3">
              <EChart option={barOption} height={280} loading={monitorState.loading} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
