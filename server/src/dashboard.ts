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

export interface DashboardSnapshot {
  kpis: KpiMetric[];
  deviceStatus: DeviceStatusSnapshot;
  alarms: AlarmItem[];
  trend: TrendPoint[];
  updatedAt: string;
}

let alarmSeq = 1;
let updatedAt = new Date().toISOString();

const deviceStatus: DeviceStatusSnapshot = {
  online: 168,
  offline: 12,
  fault: 3,
  maintenance: 7,
  updatedAt
};

const alarms: AlarmItem[] = [
  createAlarm('high', 'Edge Gateway', 'Gateway heartbeat lost', 'Device gw-12 heartbeat timeout.'),
  createAlarm(
    'medium',
    'Energy Meter',
    'Voltage fluctuation',
    'Meter em-07 reported voltage variance.'
  ),
  createAlarm(
    'low',
    'AI Workflow',
    'Retry scheduled',
    'Workflow wf-101 retry queued after transient failure.'
  )
];

const trend: TrendPoint[] = createInitialTrend();

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function createAlarm(
  level: AlarmLevel,
  source: string,
  title: string,
  description: string
): AlarmItem {
  const now = new Date();
  return {
    id: `a_${String(alarmSeq++).padStart(4, '0')}`,
    level,
    source,
    title,
    description,
    occurredAt: now.toISOString(),
    acknowledged: false
  };
}

function createInitialTrend(): TrendPoint[] {
  const points: TrendPoint[] = [];
  const now = Date.now();

  for (let i = 59; i >= 0; i -= 1) {
    const timestamp = new Date(now - i * 60_000).toISOString();
    points.push({
      timestamp,
      energy: 480 + rand(-40, 40),
      aiCalls: 240 + rand(-30, 30),
      onlineDevices: 160 + rand(-5, 5),
      alarms: rand(0, 5)
    });
  }

  return points;
}

function updateDeviceStatus(): void {
  const drift = rand(-3, 3);
  deviceStatus.online = clamp(deviceStatus.online + drift, 120, 220);
  deviceStatus.offline = clamp(deviceStatus.offline + rand(-2, 2), 0, 60);
  deviceStatus.fault = clamp(deviceStatus.fault + rand(-1, 1), 0, 20);
  deviceStatus.maintenance = clamp(deviceStatus.maintenance + rand(-1, 1), 0, 30);
  deviceStatus.updatedAt = new Date().toISOString();
}

function updateTrend(): TrendPoint {
  const last = trend.at(-1);
  const timestamp = new Date().toISOString();

  const next: TrendPoint = {
    timestamp,
    energy: clamp((last?.energy ?? 480) + rand(-25, 25), 300, 700),
    aiCalls: clamp((last?.aiCalls ?? 240) + rand(-18, 18), 0, 600),
    onlineDevices: clamp((last?.onlineDevices ?? 160) + rand(-2, 2), 80, 260),
    alarms: rand(0, 6)
  };

  trend.push(next);
  if (trend.length > 60) {
    trend.splice(0, trend.length - 60);
  }

  return next;
}

function computeKpis(): { kpis: KpiMetric[]; updatedAt: string } {
  const nowIso = new Date().toISOString();
  updatedAt = nowIso;

  const aiCalls = trend.reduce((sum, point) => sum + point.aiCalls, 0);
  const todayTickets = rand(3, 18);
  const onlineUsers = rand(8, 42);

  return {
    updatedAt: nowIso,
    kpis: [
      {
        id: 'online_devices',
        title: '在线设备',
        value: deviceStatus.online,
        unit: '台',
        deltaMoM: rand(-30, 30) / 100,
        deltaYoY: rand(-50, 50) / 100,
        href: '/devices'
      },
      {
        id: 'today_alarms',
        title: '今日告警',
        value: alarms.filter((alarm) => !alarm.acknowledged).length,
        unit: '条',
        deltaMoM: rand(-40, 40) / 100,
        deltaYoY: rand(-40, 40) / 100,
        href: '/dashboard'
      },
      {
        id: 'ai_calls',
        title: 'AI 调用',
        value: aiCalls,
        unit: '次',
        deltaMoM: rand(-20, 40) / 100,
        deltaYoY: rand(0, 80) / 100,
        href: '/ai-copilot'
      },
      {
        id: 'today_tickets',
        title: '今日工单',
        value: todayTickets,
        unit: '单',
        deltaMoM: rand(-30, 30) / 100,
        deltaYoY: rand(-30, 30) / 100,
        href: '/workflows'
      },
      {
        id: 'online_users',
        title: '在线用户',
        value: onlineUsers,
        unit: '人',
        deltaMoM: rand(-10, 20) / 100,
        deltaYoY: rand(-10, 30) / 100,
        href: '/system'
      },
      {
        id: 'uptime',
        title: '系统运行',
        value: Math.round(process.uptime()),
        unit: 's',
        deltaMoM: 0,
        deltaYoY: 0,
        href: '/dashboard'
      }
    ]
  };
}

export function getDashboardSnapshot(): DashboardSnapshot {
  updateDeviceStatus();
  updateTrend();
  const { kpis, updatedAt: nextUpdatedAt } = computeKpis();

  return {
    kpis,
    deviceStatus: { ...deviceStatus },
    alarms: alarms.slice(0, 20),
    trend: trend.slice(),
    updatedAt: nextUpdatedAt
  };
}

export function listDashboardAlarms(): AlarmItem[] {
  return alarms.slice(0, 20);
}

export function acknowledgeAlarm(alarmId: string): AlarmItem | null {
  const alarm = alarms.find((item) => item.id === alarmId) ?? null;
  if (!alarm) {
    return null;
  }

  if (!alarm.acknowledged) {
    alarm.acknowledged = true;
    alarm.acknowledgedAt = new Date().toISOString();
  }

  return { ...alarm };
}

export function maybeCreateAlarm(): AlarmItem | null {
  const roll = Math.random();
  if (roll > 0.25) {
    return null;
  }

  const level: AlarmLevel =
    roll < 0.05 ? 'critical' : roll < 0.1 ? 'high' : roll < 0.18 ? 'medium' : 'low';
  const sources = ['Edge Gateway', 'Energy Meter', 'AI Workflow', 'PLC', 'Topology'];
  const source = sources[rand(0, sources.length - 1)];
  const titles = [
    'Threshold exceeded',
    'Heartbeat lost',
    'Unexpected restart',
    'Anomaly detected',
    'Data delayed'
  ];
  const title = titles[rand(0, titles.length - 1)];
  const description = `${source} reported: ${title}.`;

  const alarm = createAlarm(level, source, title, description);
  alarms.unshift(alarm);
  if (alarms.length > 40) {
    alarms.splice(20);
  }

  updatedAt = new Date().toISOString();
  return alarm;
}

export function getDailySummary(): DailySummary {
  const date = new Date().toISOString().slice(0, 10);
  const aiCalls = trend.reduce((sum, point) => sum + point.aiCalls, 0);
  const newAlarms = alarms.filter((alarm) => !alarm.acknowledged).length;

  return {
    date,
    newDevices: rand(4, 16),
    newAlarms,
    aiCalls,
    workflowSuccessRate: clamp((96 + rand(-2, 2)) / 100, 0, 1)
  };
}

export function pushTrendPoint(): TrendPoint {
  updatedAt = new Date().toISOString();
  return updateTrend();
}

export function getUpdatedAt(): string {
  return updatedAt;
}
