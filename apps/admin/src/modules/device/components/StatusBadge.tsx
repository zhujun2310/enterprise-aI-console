import type { AlarmLevel, CommStatus } from '../types/device';

function badgeClass(base: string) {
  return `inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${base}`;
}

export function OnlineBadge({ online }: { online: boolean }) {
  return (
    <span
      className={badgeClass(
        online
          ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
          : 'bg-slate-100 text-slate-600 ring-1 ring-slate-200'
      )}
    >
      <span className={online ? 'i-lucide-wifi h-3 w-3' : 'i-lucide-wifi-off h-3 w-3'} />
      {online ? '在线' : '离线'}
    </span>
  );
}

export function CommBadge({ status }: { status: CommStatus }) {
  const config =
    status === 'ok'
      ? {
          label: '通讯正常',
          cls: 'bg-sky-50 text-sky-700 ring-1 ring-sky-200',
          icon: 'i-lucide-signal-high'
        }
      : status === 'unstable'
        ? {
            label: '通讯不稳',
            cls: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
            icon: 'i-lucide-signal-medium'
          }
        : {
            label: '通讯中断',
            cls: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200',
            icon: 'i-lucide-signal-zero'
          };

  return (
    <span className={badgeClass(config.cls)}>
      <span className={`${config.icon} h-3 w-3`} />
      {config.label}
    </span>
  );
}

export function AlarmBadge({ level, count }: { level: AlarmLevel | null; count: number }) {
  if (!level || count <= 0) {
    return (
      <span className={badgeClass('bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200')}>
        <span className="i-lucide-shield-check h-3 w-3" />
        无告警
      </span>
    );
  }

  const config =
    level === 'critical'
      ? { label: 'Critical', cls: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200' }
      : level === 'high'
        ? { label: 'High', cls: 'bg-orange-50 text-orange-700 ring-1 ring-orange-200' }
        : level === 'medium'
          ? { label: 'Medium', cls: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200' }
          : { label: 'Low', cls: 'bg-sky-50 text-sky-700 ring-1 ring-sky-200' };

  return (
    <span className={badgeClass(config.cls)}>
      <span className="i-lucide-triangle-alert h-3 w-3" />
      {config.label} · {count}
    </span>
  );
}
