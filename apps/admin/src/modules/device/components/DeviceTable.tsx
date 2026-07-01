import type { DeviceListItem, DeviceType } from '../types/device';
import { AlarmBadge, OnlineBadge } from './StatusBadge';

export interface DeviceTableSort {
  sortBy:
    'name' | 'code' | 'regionName' | 'orgName' | 'lastHeartbeatAt' | 'alarmCount' | 'createdAt';
  sortOrder: 'asc' | 'desc';
}

export interface DeviceTableProps {
  items: DeviceListItem[];
  sort: DeviceTableSort;
  onSortChange: (next: DeviceTableSort) => void;
  onOpenDetail: (deviceId: string) => void;
  onOpenMonitor: (deviceId: string) => void;
  onOpenLogs: (deviceId: string) => void;
  selectedIds?: string[];
  onToggleSelect?: (deviceId: string) => void;
  onToggleSelectAll?: (nextSelected: boolean) => void;
}

function formatType(type: DeviceType) {
  if (type === 'sensor') return 'Sensor';
  if (type === 'gateway') return 'Gateway';
  if (type === 'camera') return 'Camera';
  if (type === 'meter') return 'Meter';
  return 'Controller';
}

function thClass(active: boolean) {
  return `select-none whitespace-nowrap px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide ${
    active ? 'text-slate-900' : 'text-slate-500'
  }`;
}

function tdClass(sticky?: boolean) {
  const base = 'whitespace-nowrap px-3 py-3 text-sm text-slate-700';
  if (!sticky) return base;
  return `${base} sticky left-0 bg-white`;
}

function toggleSort(current: DeviceTableSort, key: DeviceTableSort['sortBy']): DeviceTableSort {
  if (current.sortBy !== key) {
    return { sortBy: key, sortOrder: 'asc' };
  }
  return { sortBy: key, sortOrder: current.sortOrder === 'asc' ? 'desc' : 'asc' };
}

export default function DeviceTable({
  items,
  sort,
  onSortChange,
  onOpenDetail,
  onOpenMonitor,
  onOpenLogs,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll
}: DeviceTableProps) {
  const hasSelection = Boolean(selectedIds && onToggleSelect && onToggleSelectAll);
  const selectedSet = new Set(selectedIds ?? []);
  const allSelected = items.length > 0 && items.every((item) => selectedSet.has(item.id));

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200">
      <table className="min-w-[980px] w-full border-collapse bg-white">
        <thead className="bg-slate-50">
          <tr>
            {hasSelection ? (
              <th className="w-12 px-3 py-3">
                <input
                  aria-label="select all"
                  type="checkbox"
                  checked={allSelected}
                  onChange={(event) => onToggleSelectAll?.(Boolean(event.target.checked))}
                />
              </th>
            ) : null}
            <th className={`${thClass(sort.sortBy === 'name')} sticky left-0 bg-slate-50`}>
              <button
                type="button"
                className="inline-flex items-center gap-1 hover:text-slate-900"
                onClick={() => onSortChange(toggleSort(sort, 'name'))}
              >
                名称
                <span
                  className={
                    sort.sortBy === 'name'
                      ? 'i-lucide-arrow-up-down h-3 w-3'
                      : 'i-lucide-arrow-up-down h-3 w-3 opacity-40'
                  }
                />
              </button>
            </th>
            <th className={thClass(sort.sortBy === 'code')}>
              <button
                type="button"
                className="inline-flex items-center gap-1 hover:text-slate-900"
                onClick={() => onSortChange(toggleSort(sort, 'code'))}
              >
                编号
                <span
                  className={
                    sort.sortBy === 'code'
                      ? 'i-lucide-arrow-up-down h-3 w-3'
                      : 'i-lucide-arrow-up-down h-3 w-3 opacity-40'
                  }
                />
              </button>
            </th>
            <th className={thClass(sort.sortBy === 'regionName')}>
              <button
                type="button"
                className="inline-flex items-center gap-1 hover:text-slate-900"
                onClick={() => onSortChange(toggleSort(sort, 'regionName'))}
              >
                区域
                <span
                  className={
                    sort.sortBy === 'regionName'
                      ? 'i-lucide-arrow-up-down h-3 w-3'
                      : 'i-lucide-arrow-up-down h-3 w-3 opacity-40'
                  }
                />
              </button>
            </th>
            <th className={thClass(sort.sortBy === 'orgName')}>
              <button
                type="button"
                className="inline-flex items-center gap-1 hover:text-slate-900"
                onClick={() => onSortChange(toggleSort(sort, 'orgName'))}
              >
                组织
                <span
                  className={
                    sort.sortBy === 'orgName'
                      ? 'i-lucide-arrow-up-down h-3 w-3'
                      : 'i-lucide-arrow-up-down h-3 w-3 opacity-40'
                  }
                />
              </button>
            </th>
            <th className="whitespace-nowrap px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              类型
            </th>
            <th className="whitespace-nowrap px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              在线
            </th>
            <th className={thClass(sort.sortBy === 'alarmCount')}>
              <button
                type="button"
                className="inline-flex items-center gap-1 hover:text-slate-900"
                onClick={() => onSortChange(toggleSort(sort, 'alarmCount'))}
              >
                告警
                <span
                  className={
                    sort.sortBy === 'alarmCount'
                      ? 'i-lucide-arrow-up-down h-3 w-3'
                      : 'i-lucide-arrow-up-down h-3 w-3 opacity-40'
                  }
                />
              </button>
            </th>
            <th className={thClass(sort.sortBy === 'lastHeartbeatAt')}>
              <button
                type="button"
                className="inline-flex items-center gap-1 hover:text-slate-900"
                onClick={() => onSortChange(toggleSort(sort, 'lastHeartbeatAt'))}
              >
                最近心跳
                <span
                  className={
                    sort.sortBy === 'lastHeartbeatAt'
                      ? 'i-lucide-arrow-up-down h-3 w-3'
                      : 'i-lucide-arrow-up-down h-3 w-3 opacity-40'
                  }
                />
              </button>
            </th>
            <th className="whitespace-nowrap px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              标签
            </th>
            <th className="whitespace-nowrap px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              操作
            </th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td
                className="px-3 py-10 text-center text-sm text-slate-500"
                colSpan={hasSelection ? 11 : 10}
              >
                暂无数据
              </td>
            </tr>
          ) : (
            items.map((device) => (
              <tr key={device.id} className="border-t border-slate-100 hover:bg-slate-50/70">
                {hasSelection ? (
                  <td className="px-3 py-3">
                    <input
                      aria-label={`select ${device.name}`}
                      type="checkbox"
                      checked={selectedSet.has(device.id)}
                      onChange={() => onToggleSelect?.(device.id)}
                    />
                  </td>
                ) : null}
                <td className={tdClass(true)}>
                  <div className="flex flex-col">
                    <button
                      type="button"
                      className="max-w-[240px] truncate text-left font-medium text-slate-900 hover:underline"
                      onClick={() => onOpenDetail(device.id)}
                    >
                      {device.name}
                    </button>
                    <span className="mt-1 text-xs text-slate-500">{device.id}</span>
                  </div>
                </td>
                <td className={tdClass()}>{device.code}</td>
                <td className={tdClass()}>{device.regionName}</td>
                <td className={tdClass()}>{device.orgName}</td>
                <td className={tdClass()}>{formatType(device.type)}</td>
                <td className={tdClass()}>
                  <OnlineBadge online={device.status.online} />
                </td>
                <td className={tdClass()}>
                  <AlarmBadge level={device.status.alarmLevel} count={device.status.alarmCount} />
                </td>
                <td className={tdClass()}>
                  {new Date(device.status.lastHeartbeatAt).toLocaleString()}
                </td>
                <td className={tdClass()}>
                  <div className="flex flex-wrap gap-1">
                    {device.tags.length === 0 ? (
                      <span className="text-xs text-slate-400">-</span>
                    ) : (
                      device.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
                        >
                          {tag}
                        </span>
                      ))
                    )}
                  </div>
                </td>
                <td className={tdClass()}>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
                      onClick={() => onOpenDetail(device.id)}
                    >
                      详情
                    </button>
                    <button
                      type="button"
                      className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
                      onClick={() => onOpenMonitor(device.id)}
                    >
                      监控
                    </button>
                    <button
                      type="button"
                      className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
                      onClick={() => onOpenLogs(device.id)}
                    >
                      日志
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
