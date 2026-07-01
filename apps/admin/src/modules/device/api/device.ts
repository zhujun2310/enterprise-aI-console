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
import type { AlarmListQuery, DeviceListQuery, OperationLogQuery } from '../mock/db';
import {
  getDevice,
  getHistorySeries,
  getMonitorSnapshot,
  listAlarms,
  listDevices,
  listOperationLogs,
  mockMeta,
  performBulkDeviceAction,
  updateAlarmStatus
} from '../mock/db';

function sleep(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

async function withDelay<T>(value: T, ms = 220): Promise<T> {
  await sleep(ms);
  return value;
}

export const deviceMeta = {
  regions: mockMeta.regions,
  orgs: mockMeta.orgs,
  tags: mockMeta.tags,
  deviceTypes: mockMeta.deviceTypes
};

export interface GetDeviceListParams extends Omit<DeviceListQuery, 'type'> {
  type?: DeviceType | 'all';
}

export async function getDeviceList(
  params: GetDeviceListParams
): Promise<PaginatedResult<DeviceListItem>> {
  return withDelay(listDevices(params));
}

export async function getDeviceDetail(deviceId: string): Promise<DeviceDetail> {
  const device = getDevice(deviceId);
  if (!device) {
    await sleep(120);
    throw new Error('Device not found.');
  }

  return withDelay(device);
}

export async function getDeviceStatus(deviceId: string): Promise<DeviceDetail['status']> {
  const device = getDevice(deviceId);
  if (!device) {
    await sleep(120);
    throw new Error('Device not found.');
  }

  return withDelay(device.status, 120);
}

export async function getDeviceMonitor(deviceId: string): Promise<MonitorSnapshot> {
  const snapshot = getMonitorSnapshot(deviceId);
  if (!snapshot) {
    await sleep(120);
    throw new Error('Device not found.');
  }

  return withDelay(snapshot, 260);
}

export async function getDeviceHistory(params: {
  deviceId: string;
  metricKey: MonitorMetric['key'];
  from: string;
  to: string;
}): Promise<HistorySeries> {
  const series = getHistorySeries(params.deviceId, params.metricKey, params.from, params.to);
  if (!series) {
    await sleep(120);
    throw new Error('History series not available.');
  }

  return withDelay(series, 260);
}

export interface GetAlarmListParams extends Omit<AlarmListQuery, 'status' | 'level'> {
  status?: AlarmStatus | 'all';
  level?: AlarmLevel | 'all';
}

export async function getAlarmList(
  params: GetAlarmListParams
): Promise<PaginatedResult<AlarmRecord>> {
  return withDelay(listAlarms(params), 240);
}

export async function setAlarmStatus(params: {
  alarmId: string;
  action: 'ack' | 'ignore' | 'resolve';
  operator: string;
}): Promise<AlarmRecord> {
  const updated = updateAlarmStatus(params.alarmId, params.action, params.operator);
  if (!updated) {
    await sleep(120);
    throw new Error('Alarm not found.');
  }

  return withDelay(updated, 160);
}

export async function getOperationLogs(
  params: OperationLogQuery
): Promise<PaginatedResult<OperationLogRecord>> {
  return withDelay(listOperationLogs(params), 200);
}

export async function bulkDeviceAction(params: {
  action: 'delete' | 'enable' | 'disable' | 'export';
  deviceIds: string[];
  operator: string;
}): Promise<{ success: true; changed: number }> {
  const result = performBulkDeviceAction(params);
  return withDelay(result, 200);
}
