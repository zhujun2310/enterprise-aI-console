import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import Pagination from '../components/Pagination';
import type { AlarmLevel, AlarmRecord, AlarmStatus } from '../types/device';
import { useAuthStore } from '../../../stores/auth';
import { useDeviceStore, type AlarmQueryState } from '../store/deviceStore';

type AlarmDraft = Pick<AlarmQueryState, 'keyword' | 'status' | 'level' | 'deviceId'>;

const defaultDraft: AlarmDraft = {
  keyword: '',
  status: 'all',
  level: 'all',
  deviceId: ''
};

function levelChip(level: AlarmLevel) {
  const cls =
    level === 'critical'
      ? 'bg-rose-50 text-rose-700 ring-1 ring-rose-200'
      : level === 'high'
        ? 'bg-orange-50 text-orange-700 ring-1 ring-orange-200'
        : level === 'medium'
          ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
          : 'bg-sky-50 text-sky-700 ring-1 ring-sky-200';
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${cls}`}>
      {level}
    </span>
  );
}

function statusChip(status: AlarmStatus) {
  const cls =
    status === 'open'
      ? 'bg-rose-50 text-rose-700 ring-1 ring-rose-200'
      : status === 'acknowledged'
        ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
        : status === 'ignored'
          ? 'bg-slate-100 text-slate-600 ring-1 ring-slate-200'
          : 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200';
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${cls}`}>
      {status}
    </span>
  );
}

export default function AlarmCenterView() {
  const store = useDeviceStore();
  const authStore = useAuthStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const deviceIdFromUrl = searchParams.get('deviceId') ?? '';
  const alarmIdFromUrl = searchParams.get('alarmId') ?? '';

  const { alarmQuery, setAlarmQuery, fetchAlarmList, changeAlarmStatus } = store;

  const [draft, setDraft] = useState<AlarmDraft>(() => ({
    ...defaultDraft,
    keyword: alarmQuery.keyword,
    status: alarmQuery.status,
    level: alarmQuery.level,
    deviceId: deviceIdFromUrl || alarmQuery.deviceId
  }));

  useEffect(() => {
    if (deviceIdFromUrl !== alarmQuery.deviceId) {
      setAlarmQuery({ deviceId: deviceIdFromUrl, page: 1 }, true);
      setDraft((prev) => ({ ...prev, deviceId: deviceIdFromUrl }));
    }
  }, [alarmQuery.deviceId, deviceIdFromUrl, setAlarmQuery]);

  useEffect(() => {
    void fetchAlarmList();
  }, [alarmQuery, fetchAlarmList]);

  const result = store.alarms.data;
  const items = result?.items ?? [];
  const total = result?.total ?? 0;
  const page = result?.page ?? alarmQuery.page;
  const pageSize = result?.pageSize ?? alarmQuery.pageSize;

  const selectedAlarm: AlarmRecord | null = useMemo(() => {
    if (!alarmIdFromUrl) return null;
    return items.find((alarm) => alarm.id === alarmIdFromUrl) ?? null;
  }, [alarmIdFromUrl, items]);

  const applyDraft = () => {
    setAlarmQuery(
      {
        keyword: draft.keyword,
        status: draft.status,
        level: draft.level,
        deviceId: draft.deviceId,
        page: 1
      },
      true
    );
  };

  const resetDraft = () => {
    setDraft(defaultDraft);
    setAlarmQuery({ ...defaultDraft, page: 1 }, true);
  };

  const operator = authStore.user?.username ?? 'admin';

  return (
    <section className="space-y-4">
      <PageHeader
        title="告警中心"
        description="支持告警列表、详情查看与状态处理（确认/忽略/已处理）。"
        actions={
          <>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
              onClick={applyDraft}
            >
              <span className="i-lucide-search h-4 w-4" />
              查询
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              onClick={resetDraft}
            >
              <span className="i-lucide-rotate-ccw h-4 w-4" />
              重置
            </button>
          </>
        }
      />

      <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <label className="block text-xs font-medium text-slate-600">关键字</label>
          <input
            className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm"
            placeholder="设备名称 / 编号 / 类型"
            value={draft.keyword}
            onChange={(event) => setDraft((prev) => ({ ...prev, keyword: event.target.value }))}
          />
        </div>
        <div className="lg:col-span-3">
          <label className="block text-xs font-medium text-slate-600">设备 ID（可选）</label>
          <input
            className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm"
            placeholder="例如 d_1"
            value={draft.deviceId}
            onChange={(event) => setDraft((prev) => ({ ...prev, deviceId: event.target.value }))}
          />
        </div>
        <div className="lg:col-span-2">
          <label className="block text-xs font-medium text-slate-600">等级</label>
          <select
            className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm"
            value={draft.level}
            onChange={(event) =>
              setDraft((prev) => ({ ...prev, level: event.target.value as AlarmDraft['level'] }))
            }
          >
            <option value="all">全部</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
        <div className="lg:col-span-3">
          <label className="block text-xs font-medium text-slate-600">状态</label>
          <select
            className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm"
            value={draft.status}
            onChange={(event) =>
              setDraft((prev) => ({ ...prev, status: event.target.value as AlarmDraft['status'] }))
            }
          >
            <option value="all">全部</option>
            <option value="open">Open</option>
            <option value="acknowledged">Acknowledged</option>
            <option value="ignored">Ignored</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      {selectedAlarm ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="max-w-[720px] truncate text-lg font-semibold text-slate-900">
                  {selectedAlarm.title}
                </h3>
                {levelChip(selectedAlarm.level)}
                {statusChip(selectedAlarm.status)}
              </div>
              <div className="mt-2 text-sm text-slate-600">{selectedAlarm.message}</div>
              <div className="mt-2 text-xs text-slate-500">
                {selectedAlarm.deviceName} · {selectedAlarm.deviceCode} ·{' '}
                {new Date(selectedAlarm.createdAt).toLocaleString()}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                onClick={() => navigate(`/devices/${selectedAlarm.deviceId}`)}
              >
                查看设备
              </button>
              <button
                type="button"
                className="rounded-xl bg-slate-900 px-3 py-2 text-sm text-white hover:bg-slate-800"
                onClick={() => navigate(`/devices/${selectedAlarm.deviceId}/monitor`)}
              >
                查看监控
              </button>
            </div>
          </div>
          <div className="mt-4 rounded-xl bg-slate-50 p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              处理记录
            </div>
            <div className="mt-3 space-y-2">
              {selectedAlarm.history.map((h, idx) => (
                <div
                  key={`${selectedAlarm.id}:${idx}`}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <span className="text-slate-700">
                    {h.action} · {h.operator}
                  </span>
                  <span className="text-slate-500">{new Date(h.at).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {store.alarms.error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {store.alarms.error}
        </div>
      ) : null}

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="min-w-[980px] w-full border-collapse">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                时间
              </th>
              <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                设备
              </th>
              <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                类型
              </th>
              <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                等级
              </th>
              <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                状态
              </th>
              <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                操作
              </th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td className="px-3 py-10 text-center text-sm text-slate-500" colSpan={6}>
                  暂无数据
                </td>
              </tr>
            ) : (
              items.map((alarm) => (
                <tr key={alarm.id} className="border-t border-slate-100 hover:bg-slate-50/70">
                  <td className="whitespace-nowrap px-3 py-3 text-sm text-slate-700">
                    {new Date(alarm.createdAt).toLocaleString()}
                  </td>
                  <td className="px-3 py-3 text-sm text-slate-700">
                    <div className="flex flex-col">
                      <Link
                        className="font-medium text-slate-900 hover:underline"
                        to={`/devices/${alarm.deviceId}`}
                      >
                        {alarm.deviceName}
                      </Link>
                      <span className="mt-1 text-xs text-slate-500">{alarm.deviceCode}</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-sm text-slate-700">
                    {alarm.type}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-sm text-slate-700">
                    {levelChip(alarm.level)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-sm text-slate-700">
                    {statusChip(alarm.status)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-sm text-slate-700">
                    <div className="flex flex-wrap gap-2">
                      <Link
                        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
                        to={`/devices/alarms?alarmId=${encodeURIComponent(alarm.id)}${draft.deviceId ? `&deviceId=${encodeURIComponent(draft.deviceId)}` : ''}`}
                      >
                        查看
                      </Link>
                      <button
                        type="button"
                        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={alarm.status !== 'open'}
                        onClick={() =>
                          changeAlarmStatus({ alarmId: alarm.id, action: 'ack', operator })
                        }
                      >
                        确认
                      </button>
                      <button
                        type="button"
                        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={alarm.status === 'resolved'}
                        onClick={() =>
                          changeAlarmStatus({ alarmId: alarm.id, action: 'ignore', operator })
                        }
                      >
                        忽略
                      </button>
                      <button
                        type="button"
                        className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={alarm.status === 'resolved'}
                        onClick={() =>
                          changeAlarmStatus({ alarmId: alarm.id, action: 'resolve', operator })
                        }
                      >
                        已处理
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        page={page}
        pageSize={pageSize}
        total={total}
        onChange={(nextPage) => setAlarmQuery({ page: nextPage }, false)}
        onPageSizeChange={(nextSize) => setAlarmQuery({ pageSize: nextSize, page: 1 }, false)}
      />

      {store.alarms.loading ? <div className="text-sm text-slate-500">加载中...</div> : null}
    </section>
  );
}
