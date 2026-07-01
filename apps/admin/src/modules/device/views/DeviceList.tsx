import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { deviceMeta } from '../api/device';
import DeviceTable from '../components/DeviceTable';
import PageHeader from '../components/PageHeader';
import Pagination from '../components/Pagination';
import { useDeviceStore, type DeviceListQueryState } from '../store/deviceStore';

type FilterDraft = Pick<
  DeviceListQueryState,
  'keyword' | 'keywordField' | 'region' | 'org' | 'online' | 'type' | 'alarm' | 'tags'
>;

const defaultDraft: FilterDraft = {
  keyword: '',
  keywordField: 'all',
  region: '',
  org: '',
  online: 'all',
  type: 'all',
  alarm: 'all',
  tags: []
};

export default function DeviceListView() {
  const store = useDeviceStore();
  const navigate = useNavigate();
  const { listQuery, fetchDeviceList, setListQuery } = store;
  const [draft, setDraft] = useState<FilterDraft>(() => ({
    ...defaultDraft,
    ...{
      keyword: listQuery.keyword,
      keywordField: listQuery.keywordField,
      region: listQuery.region,
      org: listQuery.org,
      online: listQuery.online,
      type: listQuery.type,
      alarm: listQuery.alarm,
      tags: listQuery.tags
    }
  }));

  useEffect(() => {
    void fetchDeviceList();
  }, [fetchDeviceList, listQuery]);

  const listResult = store.list.data;
  const items = listResult?.items ?? [];
  const total = listResult?.total ?? 0;
  const page = listResult?.page ?? store.listQuery.page;
  const pageSize = listResult?.pageSize ?? store.listQuery.pageSize;

  const tagSet = useMemo(() => new Set(draft.tags), [draft.tags]);

  const applyDraft = () => {
    setListQuery({ ...draft, page: 1 }, true);
  };

  const resetDraft = () => {
    setDraft(defaultDraft);
    setListQuery({ ...defaultDraft, page: 1 }, true);
  };

  return (
    <section className="space-y-4">
      <PageHeader
        title="设备列表"
        description="支持查询、筛选、排序、分页，并可跳转到详情/监控/日志。"
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
          <div className="mt-1 flex gap-2">
            <select
              className="h-10 w-28 rounded-xl border border-slate-200 bg-white px-3 text-sm"
              value={draft.keywordField}
              onChange={(event) =>
                setDraft((prev) => ({
                  ...prev,
                  keywordField: event.target.value as FilterDraft['keywordField']
                }))
              }
            >
              <option value="all">名称/编号</option>
              <option value="name">名称</option>
              <option value="code">编号</option>
            </select>
            <input
              className="h-10 flex-1 rounded-xl border border-slate-200 bg-white px-3 text-sm"
              placeholder="支持设备名称 / 设备编号"
              value={draft.keyword}
              onChange={(event) => setDraft((prev) => ({ ...prev, keyword: event.target.value }))}
            />
          </div>
        </div>

        <div className="lg:col-span-2">
          <label className="block text-xs font-medium text-slate-600">区域</label>
          <select
            className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm"
            value={draft.region}
            onChange={(event) => setDraft((prev) => ({ ...prev, region: event.target.value }))}
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
            value={draft.org}
            onChange={(event) => setDraft((prev) => ({ ...prev, org: event.target.value }))}
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
          <label className="block text-xs font-medium text-slate-600">在线状态</label>
          <select
            className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm"
            value={draft.online}
            onChange={(event) =>
              setDraft((prev) => ({ ...prev, online: event.target.value as FilterDraft['online'] }))
            }
          >
            <option value="all">全部</option>
            <option value="online">在线</option>
            <option value="offline">离线</option>
          </select>
        </div>

        <div className="lg:col-span-2">
          <label className="block text-xs font-medium text-slate-600">设备类型</label>
          <select
            className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm"
            value={draft.type}
            onChange={(event) =>
              setDraft((prev) => ({ ...prev, type: event.target.value as FilterDraft['type'] }))
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
          <label className="block text-xs font-medium text-slate-600">告警状态</label>
          <select
            className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm"
            value={draft.alarm}
            onChange={(event) =>
              setDraft((prev) => ({ ...prev, alarm: event.target.value as FilterDraft['alarm'] }))
            }
          >
            <option value="all">全部</option>
            <option value="has_alarm">有告警</option>
            <option value="no_alarm">无告警</option>
          </select>
        </div>

        <div className="lg:col-span-9">
          <label className="block text-xs font-medium text-slate-600">标签筛选</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {deviceMeta.tags.map((tag) => {
              const selected = tagSet.has(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm ${
                    selected
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                  onClick={() => {
                    setDraft((prev) => {
                      const next = new Set(prev.tags);
                      if (next.has(tag)) next.delete(tag);
                      else next.add(tag);
                      return { ...prev, tags: Array.from(next) };
                    });
                  }}
                >
                  <span
                    className={
                      selected ? 'i-lucide-check-circle h-4 w-4' : 'i-lucide-circle h-4 w-4'
                    }
                  />
                  {tag}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {store.list.error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {store.list.error}
        </div>
      ) : null}

      <DeviceTable
        items={items}
        sort={{ sortBy: listQuery.sortBy, sortOrder: listQuery.sortOrder }}
        onSortChange={(next) => setListQuery(next, true)}
        onOpenDetail={(deviceId) => navigate(`/devices/${deviceId}`)}
        onOpenMonitor={(deviceId) => navigate(`/devices/${deviceId}/monitor`)}
        onOpenLogs={(deviceId) => navigate(`/devices/ops?deviceId=${encodeURIComponent(deviceId)}`)}
      />

      <Pagination
        page={page}
        pageSize={pageSize}
        total={total}
        onChange={(nextPage) => setListQuery({ page: nextPage }, false)}
        onPageSizeChange={(nextSize) => setListQuery({ pageSize: nextSize, page: 1 }, false)}
      />

      {store.list.loading ? <div className="text-sm text-slate-500">加载中...</div> : null}
    </section>
  );
}
