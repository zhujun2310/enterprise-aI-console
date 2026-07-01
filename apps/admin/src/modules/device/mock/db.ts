import type {
  AlarmLevel,
  AlarmRecord,
  AlarmStatus,
  DeviceDetail,
  DeviceListItem,
  DeviceType,
  HistorySeries,
  MonitorMetric,
  MonitorSnapshot,
  OperationLogRecord,
  PaginatedResult
} from '../types/device';
import { createSeededRandom, isoMinutesAgo } from './seed';

export interface DeviceListQuery {
  page: number;
  pageSize: number;
  keyword?: string;
  keywordField?: 'name' | 'code' | 'all';
  region?: string;
  org?: string;
  online?: 'all' | 'online' | 'offline';
  type?: DeviceType | 'all';
  alarm?: 'all' | 'has_alarm' | 'no_alarm';
  tags?: string[];
  sortBy?:
    'name' | 'code' | 'regionName' | 'orgName' | 'lastHeartbeatAt' | 'alarmCount' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface AlarmListQuery {
  page: number;
  pageSize: number;
  keyword?: string;
  status?: AlarmStatus | 'all';
  level?: AlarmLevel | 'all';
  deviceId?: string;
}

export interface OperationLogQuery {
  page: number;
  pageSize: number;
  keyword?: string;
  action?: OperationLogRecord['action'] | 'all';
  deviceId?: string;
  from?: string;
  to?: string;
}

export interface BulkDeviceActionRequest {
  action: 'delete' | 'enable' | 'disable' | 'export';
  deviceIds: string[];
  operator: string;
}

const seeded = createSeededRandom(20260701);

const DEVICE_TYPES: Array<{ type: DeviceType; label: string }> = [
  { type: 'sensor', label: 'Sensor' },
  { type: 'gateway', label: 'Gateway' },
  { type: 'camera', label: 'Camera' },
  { type: 'meter', label: 'Meter' },
  { type: 'controller', label: 'Controller' }
];

const REGIONS = ['华东-上海', '华南-深圳', '华北-北京', '西南-成都', '华中-武汉'];
const ORGS = ['总部', '华东分部', '华南分部', '数据中心', '工厂园区'];
const TAGS = ['A类', 'B类', '核心', '边缘', '高频', '低功耗', '试点'];

function pad2(value: number) {
  return String(value).padStart(2, '0');
}

function createDeviceCode(index: number) {
  return `DEV-${pad2(Math.floor(index / 100))}${pad2(index % 100)}`;
}

function createAlarmLevel(roll: number): AlarmLevel | null {
  if (roll > 0.88) return 'critical';
  if (roll > 0.78) return 'high';
  if (roll > 0.64) return 'medium';
  if (roll > 0.52) return 'low';
  return null;
}

function createCommStatus(online: boolean, roll: number) {
  if (!online) return 'lost' as const;
  if (roll > 0.85) return 'unstable' as const;
  return 'ok' as const;
}

function compareByOrder(
  a: string | number | null | undefined,
  b: string | number | null | undefined,
  order: 'asc' | 'desc'
) {
  if (a === b) return 0;
  if (a === null || a === undefined) return order === 'asc' ? 1 : -1;
  if (b === null || b === undefined) return order === 'asc' ? -1 : 1;
  return (a < b ? -1 : 1) * (order === 'asc' ? 1 : -1);
}

function includesKeyword(value: string, keyword: string) {
  return value.toLowerCase().includes(keyword.toLowerCase().trim());
}

function paginate<T>(items: T[], page: number, pageSize: number): PaginatedResult<T> {
  const safePageSize = Math.max(1, Math.min(50, Math.floor(pageSize)));
  const safePage = Math.max(1, Math.floor(page));
  const start = (safePage - 1) * safePageSize;
  const slice = items.slice(start, start + safePageSize);

  return {
    items: slice,
    page: safePage,
    pageSize: safePageSize,
    total: items.length
  };
}

function stableId(prefix: string) {
  return `${prefix}_${Math.floor(seeded.next() * 1_000_000_000)}`;
}

function generateDevices(): DeviceDetail[] {
  const result: DeviceDetail[] = [];

  for (let i = 1; i <= 86; i += 1) {
    const type = seeded.pick(DEVICE_TYPES).type;
    const regionName = seeded.pick(REGIONS);
    const orgName = seeded.pick(ORGS);
    const name = `${type.toUpperCase()}-${regionName.slice(0, 2)}-${pad2(i)}`;
    const online = seeded.next() > 0.12;
    const alarmLevel = createAlarmLevel(seeded.next());
    const alarmCount = alarmLevel ? seeded.int(1, alarmLevel === 'critical' ? 10 : 6) : 0;
    const lastHeartbeatMinutes = online ? seeded.int(1, 15) : seeded.int(30, 480);
    const createdAt = new Date(Date.now() - seeded.int(5, 210) * 86_400_000).toISOString();
    const tagCount = seeded.int(0, 3);
    const tags = Array.from({ length: tagCount }, () => seeded.pick(TAGS)).filter(
      (value, index, arr) => arr.indexOf(value) === index
    );

    result.push({
      id: `d_${i}`,
      name,
      code: createDeviceCode(i),
      type,
      orgName,
      regionName,
      tags,
      createdAt,
      location: `${regionName}-${orgName}-机柜${seeded.int(1, 16)}`,
      status: {
        online,
        commStatus: createCommStatus(online, seeded.next()),
        lastHeartbeatAt: isoMinutesAgo(lastHeartbeatMinutes),
        alarmLevel,
        alarmCount
      },
      attributes: [
        { key: 'model', label: '型号', value: `${type.toUpperCase()}-${seeded.int(1, 8)}` },
        {
          key: 'vendor',
          label: '厂商',
          value: seeded.pick(['ACME', 'Nova', 'Contoso', 'IoTWorks'])
        },
        {
          key: 'firmware',
          label: '固件版本',
          value: `v${seeded.int(1, 3)}.${seeded.int(0, 12)}.${seeded.int(0, 30)}`
        },
        {
          key: 'ip',
          label: 'IP',
          value: `10.${seeded.int(0, 255)}.${seeded.int(0, 255)}.${seeded.int(1, 254)}`
        },
        { key: 'battery', label: '电量', value: seeded.int(15, 100) }
      ],
      parameters: [
        { key: 'reportInterval', label: '上报间隔(s)', value: seeded.pick([10, 30, 60, 300]) },
        { key: 'threshold', label: '阈值', value: seeded.pick([70, 80, 90, 95]) },
        { key: 'retainDays', label: '数据保留(天)', value: seeded.pick([7, 14, 30, 90]) }
      ],
      extended: [
        { key: 'owner', label: '负责人', value: seeded.pick(['李雷', '韩梅梅', '王工', '赵工']) },
        { key: 'sla', label: 'SLA', value: seeded.pick(['99.0%', '99.5%', '99.9%']) }
      ]
    });
  }

  return result;
}

function generateAlarms(devices: DeviceDetail[]): AlarmRecord[] {
  const alarmTypes = ['温度异常', '压力波动', '电压过低', '通讯中断', '传感器漂移', 'CPU 过载'];
  const alarms: AlarmRecord[] = [];

  for (const device of devices) {
    if (!device.status.alarmLevel) {
      continue;
    }

    const count = Math.min(device.status.alarmCount, 6);
    for (let i = 0; i < count; i += 1) {
      const createdAt = isoMinutesAgo(seeded.int(10, 60 * 72));
      const level = device.status.alarmLevel;
      const type = seeded.pick(alarmTypes);
      const statusRoll = seeded.next();
      const status: AlarmStatus =
        statusRoll > 0.82
          ? 'resolved'
          : statusRoll > 0.64
            ? 'acknowledged'
            : statusRoll > 0.56
              ? 'ignored'
              : 'open';
      const updatedAt = isoMinutesAgo(seeded.int(1, 60 * 8));

      alarms.push({
        id: stableId('a'),
        deviceId: device.id,
        deviceName: device.name,
        deviceCode: device.code,
        type,
        level,
        status,
        title: `${type} (${level})`,
        message: `${device.name} 检测到 ${type}，建议检查传感器与链路状态。`,
        createdAt,
        updatedAt,
        history: [
          {
            action: 'create',
            operator: 'system',
            at: createdAt
          }
        ]
      });
    }
  }

  alarms.sort((a, b) => compareByOrder(b.createdAt, a.createdAt, 'asc'));
  return alarms;
}

function generateLogs(devices: DeviceDetail[]): OperationLogRecord[] {
  const actions: OperationLogRecord['action'][] = [
    'login',
    'edit',
    'delete',
    'config_change',
    'param_change',
    'query',
    'bulk_action'
  ];
  const operators = ['admin', 'ops', 'viewer', 'system'];
  const logs: OperationLogRecord[] = [];

  for (let i = 0; i < 240; i += 1) {
    const hasDevice = seeded.next() > 0.15;
    const device = hasDevice ? seeded.pick(devices) : null;
    const action = seeded.pick(actions);
    const operator = seeded.pick(operators);
    const createdAt = isoMinutesAgo(seeded.int(1, 60 * 24 * 7));
    const detail = device
      ? `${operator} 对 ${device.name} 执行 ${action}`
      : `${operator} 执行 ${action}`;

    logs.push({
      id: stableId('l'),
      deviceId: device?.id ?? null,
      deviceName: device?.name ?? null,
      action,
      operator,
      createdAt,
      detail
    });
  }

  logs.sort((a, b) => compareByOrder(b.createdAt, a.createdAt, 'asc'));
  return logs;
}

const mockState = {
  devices: generateDevices(),
  alarms: [] as AlarmRecord[],
  logs: [] as OperationLogRecord[]
};

mockState.alarms = generateAlarms(mockState.devices);
mockState.logs = generateLogs(mockState.devices);

export const mockMeta = {
  regions: REGIONS,
  orgs: ORGS,
  tags: TAGS,
  deviceTypes: DEVICE_TYPES.map((item) => item.type)
};

export function listDevices(query: DeviceListQuery): PaginatedResult<DeviceListItem> {
  const {
    keyword,
    keywordField = 'all',
    region,
    org,
    online = 'all',
    type = 'all',
    alarm = 'all',
    tags,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = query;

  let items: DeviceDetail[] = [...mockState.devices];

  if (keyword && keyword.trim()) {
    items = items.filter((device) => {
      if (keywordField === 'name') return includesKeyword(device.name, keyword);
      if (keywordField === 'code') return includesKeyword(device.code, keyword);
      return includesKeyword(device.name, keyword) || includesKeyword(device.code, keyword);
    });
  }

  if (region && region.trim()) {
    items = items.filter((device) => device.regionName === region);
  }

  if (org && org.trim()) {
    items = items.filter((device) => device.orgName === org);
  }

  if (online !== 'all') {
    items = items.filter((device) => device.status.online === (online === 'online'));
  }

  if (type !== 'all') {
    items = items.filter((device) => device.type === type);
  }

  if (alarm !== 'all') {
    items = items.filter((device) =>
      alarm === 'has_alarm' ? Boolean(device.status.alarmLevel) : !device.status.alarmLevel
    );
  }

  if (tags && tags.length > 0) {
    items = items.filter((device) => tags.every((tag) => device.tags.includes(tag)));
  }

  items.sort((a, b) => {
    if (sortBy === 'lastHeartbeatAt') {
      return compareByOrder(a.status.lastHeartbeatAt, b.status.lastHeartbeatAt, sortOrder);
    }
    if (sortBy === 'alarmCount') {
      return compareByOrder(a.status.alarmCount, b.status.alarmCount, sortOrder);
    }
    return compareByOrder(a[sortBy], b[sortBy], sortOrder);
  });

  return paginate(
    items.map((device) => ({
      id: device.id,
      name: device.name,
      code: device.code,
      type: device.type,
      orgName: device.orgName,
      regionName: device.regionName,
      tags: device.tags,
      status: device.status,
      createdAt: device.createdAt
    })),
    query.page,
    query.pageSize
  );
}

export function getDevice(id: string): DeviceDetail | null {
  return mockState.devices.find((device) => device.id === id) ?? null;
}

export function listAlarms(query: AlarmListQuery): PaginatedResult<AlarmRecord> {
  const { keyword, status = 'all', level = 'all', deviceId } = query;
  let items = [...mockState.alarms];

  if (deviceId) {
    items = items.filter((alarm) => alarm.deviceId === deviceId);
  }

  if (keyword && keyword.trim()) {
    items = items.filter(
      (alarm) =>
        includesKeyword(alarm.deviceName, keyword) ||
        includesKeyword(alarm.deviceCode, keyword) ||
        includesKeyword(alarm.type, keyword) ||
        includesKeyword(alarm.title, keyword)
    );
  }

  if (status !== 'all') {
    items = items.filter((alarm) => alarm.status === status);
  }

  if (level !== 'all') {
    items = items.filter((alarm) => alarm.level === level);
  }

  items.sort((a, b) => compareByOrder(b.createdAt, a.createdAt, 'asc'));
  return paginate(items, query.page, query.pageSize);
}

export function updateAlarmStatus(
  alarmId: string,
  action: 'ack' | 'ignore' | 'resolve',
  operator: string
): AlarmRecord | null {
  const alarm = mockState.alarms.find((item) => item.id === alarmId);
  if (!alarm) {
    return null;
  }

  const nextStatus: AlarmStatus =
    action === 'ack' ? 'acknowledged' : action === 'ignore' ? 'ignored' : 'resolved';

  alarm.status = nextStatus;
  alarm.updatedAt = new Date().toISOString();
  alarm.history = [
    ...alarm.history,
    {
      action,
      operator,
      at: alarm.updatedAt
    }
  ];

  const device = getDevice(alarm.deviceId);
  if (device) {
    const openAlarms = mockState.alarms.filter(
      (item) => item.deviceId === device.id && item.status === 'open'
    );
    const levelWeight: Record<AlarmLevel, number> = {
      critical: 4,
      high: 3,
      medium: 2,
      low: 1
    };
    const currentLevel = openAlarms.reduce<AlarmLevel | null>((acc, item) => {
      if (!acc) return item.level;
      return levelWeight[item.level] > levelWeight[acc] ? item.level : acc;
    }, null);

    device.status.alarmCount = openAlarms.length;
    device.status.alarmLevel = currentLevel;
  }

  return alarm;
}

export function listOperationLogs(query: OperationLogQuery): PaginatedResult<OperationLogRecord> {
  const { keyword, action = 'all', deviceId, from, to } = query;
  let items = [...mockState.logs];

  if (deviceId) {
    items = items.filter((log) => log.deviceId === deviceId);
  }

  if (keyword && keyword.trim()) {
    items = items.filter((log) => includesKeyword(log.detail, keyword));
  }

  if (action !== 'all') {
    items = items.filter((log) => log.action === action);
  }

  const fromTime = from ? Date.parse(from) : null;
  const toTime = to ? Date.parse(to) : null;
  if (fromTime && Number.isFinite(fromTime)) {
    items = items.filter((log) => Date.parse(log.createdAt) >= fromTime);
  }
  if (toTime && Number.isFinite(toTime)) {
    items = items.filter((log) => Date.parse(log.createdAt) <= toTime);
  }

  items.sort((a, b) => compareByOrder(b.createdAt, a.createdAt, 'asc'));
  return paginate(items, query.page, query.pageSize);
}

function createMetricBase(nowIso: string): MonitorMetric[] {
  return [
    { key: 'temperature', name: '温度', unit: '℃', value: seeded.int(18, 86), updatedAt: nowIso },
    { key: 'pressure', name: '压力', unit: 'kPa', value: seeded.int(60, 140), updatedAt: nowIso },
    { key: 'voltage', name: '电压', unit: 'V', value: seeded.int(210, 245), updatedAt: nowIso },
    { key: 'current', name: '电流', unit: 'A', value: seeded.int(3, 18), updatedAt: nowIso },
    { key: 'cpu', name: 'CPU', unit: '%', value: seeded.int(10, 98), updatedAt: nowIso },
    { key: 'memory', name: '内存', unit: '%', value: seeded.int(20, 95), updatedAt: nowIso },
    { key: 'rpm', name: '转速', unit: 'rpm', value: seeded.int(800, 2400), updatedAt: nowIso }
  ];
}

export function getMonitorSnapshot(deviceId: string): MonitorSnapshot | null {
  const device = getDevice(deviceId);
  if (!device) {
    return null;
  }

  const now = new Date();
  const nowIso = now.toISOString();
  const metrics = createMetricBase(nowIso);
  const trend: Array<{ at: string; value: number }> = [];

  for (let i = 11; i >= 0; i -= 1) {
    const at = new Date(now.getTime() - i * 60_000).toISOString();
    const value = seeded.int(40, 100) + Math.round(Math.sin(i / 2) * 6);
    trend.push({ at, value });
  }

  return {
    deviceId,
    metrics,
    trend,
    gauge: {
      name: '健康度',
      value: device.status.online ? seeded.int(62, 96) : seeded.int(18, 45),
      min: 0,
      max: 100
    },
    bars: [
      { name: '上行', value: seeded.int(10, 120) },
      { name: '下行', value: seeded.int(10, 160) },
      { name: '丢包', value: seeded.int(0, 12) },
      { name: '延迟', value: seeded.int(1, 40) }
    ],
    updatedAt: nowIso
  };
}

export function getHistorySeries(
  deviceId: string,
  metricKey: MonitorMetric['key'],
  from: string,
  to: string
): HistorySeries | null {
  const device = getDevice(deviceId);
  if (!device) {
    return null;
  }

  const fromTs = Date.parse(from);
  const toTs = Date.parse(to);
  if (!Number.isFinite(fromTs) || !Number.isFinite(toTs) || toTs <= fromTs) {
    return null;
  }

  const points: Array<{ at: string; value: number }> = [];
  const steps = 24;
  const interval = Math.max(60_000, Math.floor((toTs - fromTs) / steps));

  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;
  let sum = 0;

  for (let i = 0; i <= steps; i += 1) {
    const at = new Date(fromTs + i * interval).toISOString();
    const base = metricKey === 'temperature' ? 45 : metricKey === 'pressure' ? 95 : 60;
    const value = base + seeded.int(-18, 18) + Math.round(Math.sin(i / 2) * 5);
    points.push({ at, value });
    min = Math.min(min, value);
    max = Math.max(max, value);
    sum += value;
  }

  const avg = Math.round((sum / points.length) * 100) / 100;

  return {
    deviceId,
    metricKey,
    from,
    to,
    points,
    stats: {
      min,
      max,
      avg
    }
  };
}

export function createOperationLog(entry: Omit<OperationLogRecord, 'id'>) {
  const record: OperationLogRecord = {
    id: stableId('l'),
    ...entry
  };
  mockState.logs.unshift(record);
  return record;
}

export function performBulkDeviceAction(request: BulkDeviceActionRequest) {
  const { action, deviceIds, operator } = request;
  const targets = mockState.devices.filter((device) => deviceIds.includes(device.id));
  const nowIso = new Date().toISOString();

  if (action === 'delete') {
    mockState.devices = mockState.devices.filter((device) => !deviceIds.includes(device.id));
    mockState.alarms = mockState.alarms.filter((alarm) => !deviceIds.includes(alarm.deviceId));
    mockState.logs = mockState.logs.filter(
      (log) => !log.deviceId || !deviceIds.includes(log.deviceId)
    );
  }

  if (action === 'enable' || action === 'disable') {
    for (const device of targets) {
      const nextOnline = action === 'enable';
      device.status.online = nextOnline;
      device.status.commStatus = createCommStatus(nextOnline, seeded.next());
      device.status.lastHeartbeatAt = nowIso;
    }
  }

  createOperationLog({
    deviceId: null,
    deviceName: null,
    action: 'bulk_action',
    operator,
    createdAt: nowIso,
    detail: `${operator} 执行批量操作 ${action}，影响设备数 ${targets.length}`
  });

  return {
    success: true as const,
    changed: targets.length
  };
}
