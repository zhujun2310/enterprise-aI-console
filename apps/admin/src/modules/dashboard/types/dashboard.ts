export type AlarmLevel = 'low' | 'medium' | 'high' | 'critical';

export interface KpiMetric {
  id: string;
  title: string;
  value: number;
  unit?: string;
  deltaMoM?: number;
  deltaYoY?: number;
  href?: string;
}

export interface DeviceStatusSnapshot {
  online: number;
  offline: number;
  fault: number;
  maintenance: number;
  updatedAt: string;
}

export interface AlarmItem {
  id: string;
  level: AlarmLevel;
  source: string;
  title: string;
  description: string;
  occurredAt: string;
  acknowledged: boolean;
  acknowledgedAt?: string;
}

export interface TrendPoint {
  timestamp: string;
  energy: number;
  aiCalls: number;
  onlineDevices: number;
  alarms: number;
}

export interface DailySummary {
  date: string;
  newDevices: number;
  newAlarms: number;
  aiCalls: number;
  workflowSuccessRate: number;
}

export type DashboardSseEvent =
  | {
      type: 'kpi:update';
      payload: { kpis: KpiMetric[]; updatedAt: string };
    }
  | {
      type: 'device:status';
      payload: DeviceStatusSnapshot;
    }
  | {
      type: 'alarm:new';
      payload: AlarmItem;
    }
  | {
      type: 'alarm:update';
      payload: AlarmItem;
    }
  | {
      type: 'trend:point';
      payload: TrendPoint;
    };
