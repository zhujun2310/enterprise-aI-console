import { useMemo } from 'react';

export interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export default function Pagination({
  page,
  pageSize,
  total,
  onChange,
  onPageSizeChange
}: PaginationProps) {
  const totalPages = useMemo(() => {
    const size = Math.max(1, pageSize);
    return Math.max(1, Math.ceil(total / size));
  }, [pageSize, total]);

  const safePage = clamp(page, 1, totalPages);
  const from = total === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const to = Math.min(total, safePage * pageSize);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
      <div className="text-sm text-slate-600">
        {from}-{to} / {total}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {onPageSizeChange ? (
          <select
            className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm"
            value={pageSize}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
          >
            {[10, 20, 30, 50].map((size) => (
              <option key={size} value={size}>
                {size} / 页
              </option>
            ))}
          </select>
        ) : null}
        <button
          type="button"
          className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={safePage <= 1}
          onClick={() => onChange(safePage - 1)}
        >
          上一页
        </button>
        <div className="text-sm text-slate-600">
          {safePage} / {totalPages}
        </div>
        <button
          type="button"
          className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={safePage >= totalPages}
          onClick={() => onChange(safePage + 1)}
        >
          下一页
        </button>
      </div>
    </div>
  );
}
