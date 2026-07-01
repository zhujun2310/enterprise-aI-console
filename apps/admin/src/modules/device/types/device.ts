export type DeviceType = 'sensor' | 'gateway' | 'camera' | 'meter' | 'controller';

export type CommStatus = 'ok' | 'unstable' | 'lost';

export type AlarmLevel = 'critical' | 'high' | 'medium' | 'low';

export type AlarmStatus = 'open' | 'acknowledged' | 'ignored' | 'resolved';

export interface DeviceAttribute {
  key: string;
  label: string;
  value: string | number | boolean;
}

export interface DeviceStatusSnapshot {
  online: boolean;
  commStatus: CommStatus;
  lastHeartbeatAt: string;
  alarmLevel: AlarmLevel | null;
  alarmCount: number;
}

export interface DeviceListItem {
  id: string;
  name: string;
  code: string;
  type: DeviceType;
  orgName: string;
  regionName: string;
  tags: string[];
  status: DeviceStatusSnapshot;
  createdAt: string;
}

export interface DeviceDetail extends DeviceListItem {
  location: string;
  attributes: DeviceAttribute[];
  parameters: Array<{ key: string; label: string; value: string | number | boolean }>;
  extended: Array<{ key: string; label: string; value: string }>;
}

export interface AlarmRecord {
  id: string;
  deviceId: string;
  deviceName: string;
  deviceCode: string;
  type: string;
  level: AlarmLevel;
  status: AlarmStatus;
  title: string;
  message: string;
  createdAt: string;
  updatedAt: string;
  history: Array<{
    action: 'create' | 'ack' | 'ignore' | 'resolve';
    operator: string;
    at: string;
    note?: string;
  }>;
}

export interface OperationLogRecord {
  id: string;
  deviceId: string | null;
  deviceName: string | null;
  action: 'login' | 'edit' | 'delete' | 'config_change' | 'param_change' | 'query' | 'bulk_action';
  operator: string;
  createdAt: string;
  detail: string;
}

export interface MonitorMetric {
  key: 'temperature' | 'pressure' | 'voltage' | 'current' | 'cpu' | 'memory' | 'rpm';
  name: string;
  unit: string;
  value: number;
  updatedAt: string;
}

export interface MonitorSnapshot {
  deviceId: string;
  metrics: MonitorMetric[];
  trend: Array<{ at: string; value: number }>;
  gauge: { name: string; value: number; min: number; max: number };
  bars: Array<{ name: string; value: number }>;
  updatedAt: string;
}

export interface HistorySeries {
  deviceId: string;
  metricKey: MonitorMetric['key'];
  from: string;
  to: string;
  points: Array<{ at: string; value: number }>;
  stats: { min: number; max: number; avg: number };
}

export interface PaginatedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
}
