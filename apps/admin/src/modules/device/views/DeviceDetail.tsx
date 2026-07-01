import { useEffect, useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import { AlarmBadge, CommBadge, OnlineBadge } from '../components/StatusBadge';
import { useDeviceStore } from '../store/deviceStore';

function fieldRow(label: string, value: string) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 py-3">
      <div className="text-sm font-medium text-slate-600">{label}</div>
      <div className="text-sm text-slate-900">{value}</div>
    </div>
  );
}

export default function DeviceDetailView() {
  const { deviceId } = useParams<{ deviceId: string }>();
  const navigate = useNavigate();
  const store = useDeviceStore();
  const id = deviceId ?? '';

  const detailState = store.details[id] ?? { data: null, loading: false, error: null };
  const device = detailState.data;

  useEffect(() => {
    if (!id) return;
    void store.fetchDeviceDetail(id);
  }, [id, store.fetchDeviceDetail]);

  useEffect(() => {
    if (!id) return;
    void store.fetchAlarmListWithQuery({
      page: 1,
      pageSize: 5,
      keyword: '',
      status: 'all',
      level: 'all',
      deviceId: id
    });
  }, [id, store.fetchAlarmListWithQuery]);

  useEffect(() => {
    if (!id) return;
    void store.fetchOperationLogsWithQuery({
      page: 1,
      pageSize: 5,
      keyword: '',
      action: 'all',
      deviceId: id,
      from: '',
      to: ''
    });
  }, [id, store.fetchOperationLogsWithQuery]);

  const recentAlarms = store.alarms.data?.items ?? [];
  const recentOps = store.operations.data?.items ?? [];

  const breadcrumb = useMemo(
    () => (
      <div className="flex items-center gap-2">
        <Link className="text-slate-600 hover:text-slate-900 hover:underline" to="/devices">
          设备列表
        </Link>
        <span className="text-slate-400">/</span>
        <span className="text-slate-900">设备详情</span>
      </div>
    ),
    []
  );

  return (
    <section className="space-y-4">
      <PageHeader
        title="设备详情"
        breadcrumbs={breadcrumb}
        actions={
          <>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              onClick={() => navigate('/devices')}
            >
              <span className="i-lucide-arrow-left h-4 w-4" />
              返回列表
            </button>
            {id ? (
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
                onClick={() => navigate(`/devices/${id}/monitor`)}
              >
                <span className="i-lucide-activity h-4 w-4" />
                查看监控
              </button>
            ) : null}
          </>
        }
      />

      {detailState.error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {detailState.error}
        </div>
      ) : null}

      {detailState.loading && !device ? (
        <div className="text-sm text-slate-500">加载中...</div>
      ) : null}

      {device ? (
        <div className="grid gap-4 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-7">
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="max-w-[520px] truncate text-xl font-semibold text-slate-900">
                      {device.name}
                    </h2>
                    <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs text-slate-600">
                      {device.code}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-500">{device.location}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <OnlineBadge online={device.status.online} />
                  <CommBadge status={device.status.commStatus} />
                  <AlarmBadge level={device.status.alarmLevel} count={device.status.alarmCount} />
                </div>
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <div className="rounded-xl bg-slate-50 p-4">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    基础信息
                  </div>
                  <div className="mt-3">
                    {fieldRow('编号', device.code)}
                    {fieldRow('类型', device.type)}
                    {fieldRow('所属组织', device.orgName)}
                    {fieldRow('所属区域', device.regionName)}
                    {fieldRow('创建时间', new Date(device.createdAt).toLocaleString())}
                  </div>
                </div>
                <div className="rounded-xl bg-slate-50 p-4">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    当前状态
                  </div>
                  <div className="mt-3">
                    {fieldRow('在线状态', device.status.online ? '在线' : '离线')}
                    {fieldRow('通讯状态', device.status.commStatus)}
                    {fieldRow('最近心跳', new Date(device.status.lastHeartbeatAt).toLocaleString())}
                    {fieldRow(
                      '当前告警',
                      device.status.alarmLevel
                        ? `${device.status.alarmLevel} · ${device.status.alarmCount}`
                        : '无告警'
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-lg font-semibold text-slate-900">属性信息</h3>
                <span className="text-sm text-slate-500">参数配置 / 标签 / 扩展信息</span>
              </div>
              <div className="mt-4 grid gap-4 lg:grid-cols-3">
                <div className="rounded-xl bg-slate-50 p-4">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    属性列表
                  </div>
                  <div className="mt-3 space-y-2">
                    {device.attributes.map((attr) => (
                      <div
                        key={attr.key}
                        className="flex items-start justify-between gap-3 text-sm"
                      >
                        <span className="text-slate-600">{attr.label}</span>
                        <span className="text-slate-900">{String(attr.value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-xl bg-slate-50 p-4">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    参数配置
                  </div>
                  <div className="mt-3 space-y-2">
                    {device.parameters.map((param) => (
                      <div
                        key={param.key}
                        className="flex items-start justify-between gap-3 text-sm"
                      >
                        <span className="text-slate-600">{param.label}</span>
                        <span className="text-slate-900">{String(param.value)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 border-t border-slate-200 pt-3">
                    <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      标签
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {device.tags.length === 0 ? (
                        <span className="text-sm text-slate-500">-</span>
                      ) : (
                        device.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-lg bg-white px-2 py-1 text-xs text-slate-600 ring-1 ring-slate-200"
                          >
                            {tag}
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                </div>
                <div className="rounded-xl bg-slate-50 p-4">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    扩展信息
                  </div>
                  <div className="mt-3 space-y-2">
                    {device.extended.map((item) => (
                      <div
                        key={item.key}
                        className="flex items-start justify-between gap-3 text-sm"
                      >
                        <span className="text-slate-600">{item.label}</span>
                        <span className="text-slate-900">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 lg:col-span-5">
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-semibold text-slate-900">最近告警</h3>
                <Link
                  className="text-sm text-slate-600 hover:text-slate-900 hover:underline"
                  to={`/devices/alarms?deviceId=${encodeURIComponent(id)}`}
                >
                  查看全部
                </Link>
              </div>
              {store.alarms.error ? (
                <div className="mt-3 text-sm text-rose-700">{store.alarms.error}</div>
              ) : null}
              <div className="mt-3 space-y-2">
                {recentAlarms.length === 0 ? (
                  <div className="text-sm text-slate-500">暂无告警</div>
                ) : (
                  recentAlarms.map((alarm) => (
                    <div key={alarm.id} className="rounded-xl border border-slate-200 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium text-slate-900">
                            {alarm.title}
                          </div>
                          <div className="mt-1 text-xs text-slate-500">
                            {new Date(alarm.createdAt).toLocaleString()}
                          </div>
                        </div>
                        <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs text-slate-600">
                          {alarm.status}
                        </span>
                      </div>
                      <div className="mt-2 text-sm text-slate-600">{alarm.message}</div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-semibold text-slate-900">最近操作</h3>
                <Link
                  className="text-sm text-slate-600 hover:text-slate-900 hover:underline"
                  to={`/devices/ops?deviceId=${encodeURIComponent(id)}`}
                >
                  查看全部
                </Link>
              </div>
              {store.operations.error ? (
                <div className="mt-3 text-sm text-rose-700">{store.operations.error}</div>
              ) : null}
              <div className="mt-3 space-y-2">
                {recentOps.length === 0 ? (
                  <div className="text-sm text-slate-500">暂无操作记录</div>
                ) : (
                  recentOps.map((log) => (
                    <div key={log.id} className="rounded-xl border border-slate-200 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium text-slate-900">
                            {log.detail}
                          </div>
                          <div className="mt-1 text-xs text-slate-500">
                            {log.operator} · {new Date(log.createdAt).toLocaleString()}
                          </div>
                        </div>
                        <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs text-slate-600">
                          {log.action}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
