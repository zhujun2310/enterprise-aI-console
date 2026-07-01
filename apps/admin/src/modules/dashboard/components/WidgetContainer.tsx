import type { ReactNode } from 'react';

export type WidgetState = 'ready' | 'loading' | 'empty' | 'error';

export interface WidgetContainerProps {
  title: string;
  state: WidgetState;
  errorMessage?: string;
  extra?: ReactNode;
  onRefresh?: () => void;
  children: ReactNode;
}

export default function WidgetContainer({
  title,
  state,
  errorMessage,
  extra,
  onRefresh,
  children
}: WidgetContainerProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-slate-400">{title}</p>
          {state === 'error' && errorMessage ? (
            <p className="mt-2 text-sm text-rose-600">{errorMessage}</p>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          {extra}
          {onRefresh ? (
            <button
              type="button"
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-700 transition hover:bg-slate-50"
              onClick={onRefresh}
            >
              Refresh
            </button>
          ) : null}
        </div>
      </header>

      <div className="mt-4">
        {state === 'loading' ? (
          <div className="h-24 animate-pulse rounded-xl bg-slate-100" />
        ) : state === 'empty' ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
            No data.
          </div>
        ) : (
          children
        )}
      </div>
    </section>
  );
}
