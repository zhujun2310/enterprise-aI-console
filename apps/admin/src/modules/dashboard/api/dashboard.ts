import type {
  AlarmItem,
  DailySummary,
  DeviceStatusSnapshot,
  KpiMetric,
  TrendPoint
} from '../types/dashboard';
import { requestJson, withBearer } from './client';

export interface DashboardSnapshotResponse {
  kpis: KpiMetric[];
  deviceStatus: DeviceStatusSnapshot;
  alarms: AlarmItem[];
  trend: TrendPoint[];
  updatedAt: string;
}

export async function getDashboardSnapshot(token: string): Promise<DashboardSnapshotResponse> {
  return requestJson<DashboardSnapshotResponse>('/dashboard/snapshot', {
    headers: withBearer(token)
  });
}

export async function listDashboardAlarms(token: string): Promise<{ alarms: AlarmItem[] }> {
  return requestJson<{ alarms: AlarmItem[] }>('/dashboard/alarms', {
    headers: withBearer(token)
  });
}

export async function acknowledgeDashboardAlarm(
  token: string,
  alarmId: string
): Promise<{ alarm: AlarmItem }> {
  return requestJson<{ alarm: AlarmItem }>(`/dashboard/alarms/${encodeURIComponent(alarmId)}/ack`, {
    method: 'POST',
    headers: withBearer(token)
  });
}

export async function getDailySummary(token: string): Promise<{ summary: DailySummary }> {
  return requestJson<{ summary: DailySummary }>('/dashboard/ai/daily-summary', {
    headers: withBearer(token)
  });
}
