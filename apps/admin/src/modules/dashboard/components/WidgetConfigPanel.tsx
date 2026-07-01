import type { WidgetDefinition, WidgetId, WidgetLayout, WidgetUserConfig } from '../types/widgets';

export interface WidgetConfigPanelProps {
  open: boolean;
  definitions: WidgetDefinition[];
  layouts: WidgetLayout[];
  configs: WidgetUserConfig[];
  onClose: () => void;
  onToggleVisible: (widgetId: WidgetId, visible: boolean) => void;
  onMove: (widgetId: WidgetId, direction: 'up' | 'down') => void;
  onRefreshIntervalChange: (widgetId: WidgetId, refreshIntervalMs: number | null) => void;
}

function getConfig(configs: WidgetUserConfig[], id: WidgetId): WidgetUserConfig | undefined {
  return configs.find((item) => item.id === id);
}

function getLayout(layouts: WidgetLayout[], id: WidgetId): WidgetLayout | undefined {
  return layouts.find((item) => item.id === id);
}

function toNumberOrNull(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }

  return Math.round(parsed);
}

export default function WidgetConfigPanel({
  open,
  definitions,
  layouts,
  configs,
  onClose,
  onToggleVisible,
  onMove,
  onRefreshIntervalChange
}: WidgetConfigPanelProps) {
  if (!open) {
    return null;
  }

  const sorted = definitions
    .slice()
    .sort(
      (a, b) => (getLayout(layouts, a.id)?.order ?? 0) - (getLayout(layouts, b.id)?.order ?? 0)
    );

  return (
    <div className="fixed inset-0 z-50 flex">
      <button
        type="button"
        aria-label="关闭组件配置"
        className="absolute inset-0 bg-slate-950/40"
        onClick={onClose}
      />
      <aside className="relative ml-auto h-full w-full max-w-md overflow-y-auto bg-white p-6 shadow-xl">
        <header className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-slate-400">首页</p>
            <h2 className="mt-1 text-xl font-semibold text-slate-900">Widget 配置中心</h2>
          </div>
          <button
            type="button"
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
            onClick={onClose}
          >
            关闭
          </button>
        </header>

        <div className="mt-6 space-y-4">
          {sorted.map((def, index) => {
            const config = getConfig(configs, def.id) ?? def.defaultConfig;
            const refreshIntervalValue =
              typeof config.refreshIntervalMs === 'number' ? String(config.refreshIntervalMs) : '';

            return (
              <div key={def.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{def.title}</p>
                    <p className="mt-1 text-xs text-slate-500">{def.id}</p>
                  </div>

                  <label className="flex items-center gap-2 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={config.visible}
                      onChange={(event) => {
                        onToggleVisible(def.id, event.currentTarget.checked);
                      }}
                    />
                    显示
                  </label>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                    disabled={index === 0}
                    onClick={() => {
                      onMove(def.id, 'up');
                    }}
                  >
                    上移
                  </button>
                  <button
                    type="button"
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                    disabled={index === sorted.length - 1}
                    onClick={() => {
                      onMove(def.id, 'down');
                    }}
                  >
                    下移
                  </button>
                </div>

                <div className="mt-4">
                  <label className="block text-xs font-medium text-slate-600">
                    刷新间隔（ms，可空）
                  </label>
                  <input
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-cyan-300"
                    value={refreshIntervalValue}
                    placeholder="例如 5000"
                    onChange={(event) => {
                      onRefreshIntervalChange(def.id, toNumberOrNull(event.currentTarget.value));
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </aside>
    </div>
  );
}
