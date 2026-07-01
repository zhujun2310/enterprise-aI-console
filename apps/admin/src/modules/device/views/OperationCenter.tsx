import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import Pagination from '../components/Pagination';
import DeviceTable from '../components/DeviceTable';
import { deviceMeta } from '../api/device';
import type { DeviceListItem } from '../types/device';
import { useAuthStore } from '../../../stores/auth';
import {
  useDeviceStore,
  type DeviceListQueryState,
  type OperationQueryState
} from '../store/deviceStore';

type DeviceDraft = Pick<
  DeviceListQueryState,
  'keyword' | 'keywordField' | 'region' | 'org' | 'online' | 'type' | 'alarm' | 'tags'
>;

const defaultDeviceDraft: DeviceDraft = {
  keyword: '',
  keywordField: 'all',
  region: '',
  org: '',
  online: 'all',
  type: 'all',
  alarm: 'all',
  tags: []
};

type OpDraft = Pick<OperationQueryState, 'keyword' | 'action' | 'deviceId' | 'from' | 'to'>;

const defaultOpDraft: OpDraft = {
  keyword: '',
  action: 'all',
  deviceId: '',
  from: '',
  to: ''
};

function groupCount(items: DeviceListItem[], key: (item: DeviceListItem) => string) {
  const map = new Map<string, number>();
  for (const item of items) {
    const k = key(item);
    map.set(k, (map.get(k) ?? 0) + 1);
  }
  return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
}

export default function OperationCenterView() {
  const store = useDeviceStore();
  const authStore = useAuthStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const deviceIdFromUrl = searchParams.get('deviceId') ?? '';

  const operator = authStore.user?.username ?? 'admin';

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deviceDraft, setDeviceDraft] = useState<DeviceDraft>(() => ({
    ...defaultDeviceDraft,
    keyword: store.listQuery.keyword,
    keywordField: store.listQuery.keywordField,
    region: store.listQuery.region,
    org: store.listQuery.org,
    online: store.listQuery.online,
    type: store.listQuery.type,
    alarm: store.listQuery.alarm,
    tags: store.listQuery.tags
  }));

  const { operationQuery, setOperationQuery, fetchOperationLogs } = store;
  const [opDraft, setOpDraft] = useState<OpDraft>(() => ({
    ...defaultOpDraft,
    keyword: operationQuery.keyword,
    action: operationQuery.action,
    deviceId: deviceIdFromUrl || operationQuery.deviceId,
    from: operationQuery.from,
    to: operationQuery.to
  }));

  useEffect(() => {
    void store.fetchDeviceList();
  }, [store.fetchDeviceList, store.listQuery]);

  useEffect(() => {
    if (deviceIdFromUrl !== operationQuery.deviceId) {
      setOperationQuery({ deviceId: deviceIdFromUrl, page: 1 }, true);
      setOpDraft((prev) => ({ ...prev, deviceId: deviceIdFromUrl }));
    }
  }, [deviceIdFromUrl, operationQuery.deviceId, setOperationQuery]);

  useEffect(() => {
    void fetchOperationLogs();
  }, [fetchOperationLogs, operationQuery]);

  const listResult = store.list.data;
  const devices = listResult?.items ?? [];
  const listTotal = listResult?.total ?? 0;
  const listPage = listResult?.page ?? store.listQuery.page;
  const listPageSize = listResult?.pageSize ?? store.listQuery.pageSize;

  const opResult = store.operations.data;
  const logs = opResult?.items ?? [];
  const opTotal = opResult?.total ?? 0;
  const opPage = opResult?.page ?? operationQuery.page;
  const opPageSize = opResult?.pageSize ?? operationQuery.pageSize;

  const applyDeviceDraft = () => {
    store.setListQuery({ ...deviceDraft, page: 1 }, true);
    setSelectedIds([]);
  };

  const resetDeviceDraft = () => {
    setDeviceDraft(defaultDeviceDraft);
    store.setListQuery({ ...defaultDeviceDraft, page: 1 }, true);
    setSelectedIds([]);
  };

  const applyOpDraft = () => {
    setOperationQuery({ ...opDraft, page: 1 }, true);
  };

  const resetOpDraft = () => {
    setOpDraft(defaultOpDraft);
    setOperationQuery({ ...defaultOpDraft, page: 1 }, true);
  };

  const regionGroups = useMemo(() => groupCount(devices, (d) => d.regionName), [devices]);
  const typeGroups = useMemo(() => groupCount(devices, (d) => d.type), [devices]);
  const tagGroups = useMemo(() => {
    const map = new Map<string, number>();
    for (const device of devices) {
      for (const tag of device.tags) {
        map.set(tag, (map.get(tag) ?? 0) + 1);
      }
    }
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [devices]);

  return (
    <section className="space-y-4">
      <PageHeader
        title="运维中心"
        description="分组概览、操作日志查询、批量操作（启用/停用/删除/导出）。"
      />

      <div className="grid gap-3 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-slate-900">区域分组</h3>
            <span className="text-xs text-slate-500">当前页统计</span>
          </div>
          <div className="mt-3 space-y-2">
            {regionGroups.slice(0, 5).map(([name, count]) => (
              <div key={name} className="flex items-center justify-between gap-2 text-sm">
                <span className="text-slate-700">{name}</span>
                <span className="font-medium text-slate-900">{count}</span>
              </div>
            ))}
            {regionGroups.length === 0 ? (
              <div className="text-sm text-slate-500">暂无数据</div>
            ) : null}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-slate-900">类型分组</h3>
            <span className="text-xs text-slate-500">当前页统计</span>
          </div>
          <div className="mt-3 space-y-2">
            {typeGroups.slice(0, 5).map(([name, count]) => (
              <div key={name} className="flex items-center justify-between gap-2 text-sm">
                <span className="text-slate-700">{name}</span>
                <span className="font-medium text-slate-900">{count}</span>
              </div>
            ))}
            {typeGroups.length === 0 ? (
              <div className="text-sm text-slate-500">暂无数据</div>
            ) : null}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-slate-900">标签分组</h3>
            <span className="text-xs text-slate-500">当前页统计</span>
          </div>
          <div className="mt-3 space-y-2">
            {tagGroups.slice(0, 5).map(([name, count]) => (
              <div key={name} className="flex items-center justify-between gap-2 text-sm">
                <span className="text-slate-700">{name}</span>
                <span className="font-medium text-slate-900">{count}</span>
              </div>
            ))}
            {tagGroups.length === 0 ? <div className="text-sm text-slate-500">暂无数据</div> : null}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">批量操作</h3>
            <p className="mt-1 text-sm text-slate-500">
              选择设备后执行批量启用/停用/删除/导出（Mock）。
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={selectedIds.length === 0}
              onClick={() =>
                store.bulkAction({ action: 'enable', deviceIds: selectedIds, operator })
              }
            >
              批量启用
            </button>
            <button
              type="button"
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={selectedIds.length === 0}
              onClick={() =>
                store.bulkAction({ action: 'disable', deviceIds: selectedIds, operator })
              }
            >
              批量停用
            </button>
            <button
              type="button"
              className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-700 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={selectedIds.length === 0}
              onClick={() =>
                store.bulkAction({ action: 'delete', deviceIds: selectedIds, operator })
              }
            >
              批量删除
            </button>
            <button
              type="button"
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={selectedIds.length === 0}
              onClick={() =>
                store.bulkAction({ action: 'export', deviceIds: selectedIds, operator })
              }
            >
              批量导出
            </button>
          </div>
        </div>

        <div className="mt-4 grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <label className="block text-xs font-medium text-slate-600">关键字</label>
            <div className="mt-1 flex gap-2">
              <select
                className="h-10 w-28 rounded-xl border border-slate-200 bg-white px-3 text-sm"
                value={deviceDraft.keywordField}
                onChange={(event) =>
                  setDeviceDraft((prev) => ({
                    ...prev,
                    keywordField: event.target.value as DeviceDraft['keywordField']
                  }))
                }
              >
                <option value="all">名称/编号</option>
                <option value="name">名称</option>
                <option value="code">编号</option>
              </select>
              <input
                className="h-10 flex-1 rounded-xl border border-slate-200 bg-white px-3 text-sm"
                placeholder="设备名称 / 编号"
                value={deviceDraft.keyword}
                onChange={(event) =>
                  setDeviceDraft((prev) => ({ ...prev, keyword: event.target.value }))
                }
              />
            </div>
          </div>
          <div className="lg:col-span-2">
            <label className="block text-xs font-medium text-slate-600">区域</label>
            <select
              className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm"
              value={deviceDraft.region}
              onChange={(event) =>
                setDeviceDraft((prev) => ({ ...prev, region: event.target.value }))
              }
            >
              <option value="">全部</option>
              {deviceMeta.regions.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          </div>
          <div className="lg:col-span-2">
            <label className="block text-xs font-medium text-slate-600">组织</label>
            <select
              className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm"
              value={deviceDraft.org}
              onChange={(event) => setDeviceDraft((prev) => ({ ...prev, org: event.target.value }))}
            >
              <option value="">全部</option>
              {deviceMeta.orgs.map((org) => (
                <option key={org} value={org}>
                  {org}
                </option>
              ))}
            </select>
          </div>
          <div className="lg:col-span-2">
            <label className="block text-xs font-medium text-slate-600">在线</label>
            <select
              className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm"
              value={deviceDraft.online}
              onChange={(event) =>
                setDeviceDraft((prev) => ({
                  ...prev,
                  online: event.target.value as DeviceDraft['online']
                }))
              }
            >
              <option value="all">全部</option>
              <option value="online">在线</option>
              <option value="offline">离线</option>
            </select>
          </div>
          <div className="lg:col-span-2">
            <label className="block text-xs font-medium text-slate-600">类型</label>
            <select
              className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm"
              value={deviceDraft.type}
              onChange={(event) =>
                setDeviceDraft((prev) => ({
                  ...prev,
                  type: event.target.value as DeviceDraft['type']
                }))
              }
            >
              <option value="all">全部</option>
              {deviceMeta.deviceTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div className="lg:col-span-3">
            <label className="block text-xs font-medium text-slate-600">告警</label>
            <select
              className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm"
              value={deviceDraft.alarm}
              onChange={(event) =>
                setDeviceDraft((prev) => ({
                  ...prev,
                  alarm: event.target.value as DeviceDraft['alarm']
                }))
              }
            >
              <option value="all">全部</option>
              <option value="has_alarm">有告警</option>
              <option value="no_alarm">无告警</option>
            </select>
          </div>
          <div className="lg:col-span-9">
            <label className="block text-xs font-medium text-slate-600">标签</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {deviceMeta.tags.map((tag) => {
                const selected = deviceDraft.tags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    className={`rounded-xl border px-3 py-2 text-sm ${
                      selected
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                    onClick={() => {
                      setDeviceDraft((prev) => {
                        const nextTags = selected
                          ? prev.tags.filter((t) => t !== tag)
                          : [...prev.tags, tag];
                        return { ...prev, tags: nextTags };
                      });
                    }}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="lg:col-span-12">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
                onClick={applyDeviceDraft}
              >
                <span className="i-lucide-search h-4 w-4" />
                查询
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                onClick={resetDeviceDraft}
              >
                <span className="i-lucide-rotate-ccw h-4 w-4" />
                重置
              </button>
              <span className="text-sm text-slate-500">已选 {selectedIds.length} 台</span>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <DeviceTable
            items={devices}
            sort={{ sortBy: store.listQuery.sortBy, sortOrder: store.listQuery.sortOrder }}
            onSortChange={(next) => store.setListQuery(next, true)}
            onOpenDetail={(deviceId) => navigate(`/devices/${deviceId}`)}
            onOpenMonitor={(deviceId) => navigate(`/devices/${deviceId}/monitor`)}
            onOpenLogs={(deviceId) =>
              navigate(`/devices/ops?deviceId=${encodeURIComponent(deviceId)}`)
            }
            selectedIds={selectedIds}
            onToggleSelect={(deviceId) => {
              setSelectedIds((prev) =>
                prev.includes(deviceId) ? prev.filter((id) => id !== deviceId) : [...prev, deviceId]
              );
            }}
            onToggleSelectAll={(nextSelected) => {
              setSelectedIds(nextSelected ? devices.map((d) => d.id) : []);
            }}
          />
        </div>

        <div className="mt-4">
          <Pagination
            page={listPage}
            pageSize={listPageSize}
            total={listTotal}
            onChange={(nextPage) => store.setListQuery({ page: nextPage }, false)}
            onPageSizeChange={(nextSize) =>
              store.setListQuery({ pageSize: nextSize, page: 1 }, false)
            }
          />
          {store.list.loading ? <div className="mt-2 text-sm text-slate-500">加载中...</div> : null}
          {store.list.error ? (
            <div className="mt-2 text-sm text-rose-700">{store.list.error}</div>
          ) : null}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">操作日志</h3>
            <p className="mt-1 text-sm text-slate-500">
              支持查询、时间筛选，并可从设备详情跳转带设备过滤。
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
              onClick={applyOpDraft}
            >
              <span className="i-lucide-search h-4 w-4" />
              查询
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              onClick={resetOpDraft}
            >
              <span className="i-lucide-rotate-ccw h-4 w-4" />
              重置
            </button>
          </div>
        </div>

        <div className="mt-4 grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <label className="block text-xs font-medium text-slate-600">关键字</label>
            <input
              className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm"
              placeholder="日志内容"
              value={opDraft.keyword}
              onChange={(event) => setOpDraft((prev) => ({ ...prev, keyword: event.target.value }))}
            />
          </div>
          <div className="lg:col-span-3">
            <label className="block text-xs font-medium text-slate-600">设备 ID（可选）</label>
            <input
              className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm"
              placeholder="例如 d_1"
              value={opDraft.deviceId}
              onChange={(event) =>
                setOpDraft((prev) => ({ ...prev, deviceId: event.target.value }))
              }
            />
          </div>
          <div className="lg:col-span-2">
            <label className="block text-xs font-medium text-slate-600">动作</label>
            <select
              className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm"
              value={opDraft.action}
              onChange={(event) =>
                setOpDraft((prev) => ({ ...prev, action: event.target.value as OpDraft['action'] }))
              }
            >
              <option value="all">全部</option>
              <option value="login">login</option>
              <option value="edit">edit</option>
              <option value="delete">delete</option>
              <option value="config_change">config_change</option>
              <option value="param_change">param_change</option>
              <option value="query">query</option>
              <option value="bulk_action">bulk_action</option>
            </select>
          </div>
          <div className="lg:col-span-3">
            <label className="block text-xs font-medium text-slate-600">时间（ISO，可选）</label>
            <div className="mt-1 flex gap-2">
              <input
                className="h-10 flex-1 rounded-xl border border-slate-200 bg-white px-3 text-sm"
                placeholder="from"
                value={opDraft.from}
                onChange={(event) => setOpDraft((prev) => ({ ...prev, from: event.target.value }))}
              />
              <input
                className="h-10 flex-1 rounded-xl border border-slate-200 bg-white px-3 text-sm"
                placeholder="to"
                value={opDraft.to}
                onChange={(event) => setOpDraft((prev) => ({ ...prev, to: event.target.value }))}
              />
            </div>
          </div>
        </div>

        {store.operations.error ? (
          <div className="mt-3 text-sm text-rose-700">{store.operations.error}</div>
        ) : null}

        <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200">
          <table className="min-w-[980px] w-full border-collapse bg-white">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  时间
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  设备
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  动作
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  操作人
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  详情
                </th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td className="px-3 py-10 text-center text-sm text-slate-500" colSpan={5}>
                    暂无数据
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="border-t border-slate-100 hover:bg-slate-50/70">
                    <td className="whitespace-nowrap px-3 py-3 text-sm text-slate-700">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-3 py-3 text-sm text-slate-700">
                      {log.deviceId ? (
                        <div className="flex flex-col">
                          <Link
                            className="font-medium text-slate-900 hover:underline"
                            to={`/devices/${log.deviceId}`}
                          >
                            {log.deviceName ?? log.deviceId}
                          </Link>
                          <span className="mt-1 text-xs text-slate-500">{log.deviceId}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-slate-500">-</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-sm text-slate-700">
                      {log.action}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-sm text-slate-700">
                      {log.operator}
                    </td>
                    <td className="px-3 py-3 text-sm text-slate-700">{log.detail}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4">
          <Pagination
            page={opPage}
            pageSize={opPageSize}
            total={opTotal}
            onChange={(nextPage) => setOperationQuery({ page: nextPage }, false)}
            onPageSizeChange={(nextSize) =>
              setOperationQuery({ pageSize: nextSize, page: 1 }, false)
            }
          />
          {store.operations.loading ? (
            <div className="mt-2 text-sm text-slate-500">加载中...</div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
