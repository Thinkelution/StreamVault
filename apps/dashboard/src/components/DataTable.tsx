import { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import clsx from 'clsx';

export interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  className?: string;
  render: (item: T) => React.ReactNode;
}

interface DataTableProps<T extends { id: string }> {
  columns: Column<T>[];
  data: T[];
  selectable?: boolean;
  selectedIds?: Set<string>;
  onSelectionChange?: (ids: Set<string>) => void;
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
  isLoading?: boolean;
}

export default function DataTable<T extends { id: string }>({
  columns,
  data,
  selectable,
  selectedIds = new Set(),
  onSelectionChange,
  onRowClick,
  emptyMessage = 'No data found',
  isLoading,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const toggleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const toggleAll = () => {
    if (!onSelectionChange) return;
    if (selectedIds.size === data.length) {
      onSelectionChange(new Set());
    } else {
      onSelectionChange(new Set(data.map((d) => d.id)));
    }
  };

  const toggleOne = (id: string) => {
    if (!onSelectionChange) return;
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onSelectionChange(next);
  };

  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-xl border border-zinc-800">
        <div className="animate-pulse space-y-px bg-zinc-900/50">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex h-14 items-center gap-4 px-4">
              <div className="h-3 w-full rounded bg-zinc-800" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-800">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-800 bg-zinc-900/50">
            {selectable && (
              <th className="w-10 px-4 py-3">
                <input
                  type="checkbox"
                  checked={data.length > 0 && selectedIds.size === data.length}
                  onChange={toggleAll}
                  className="rounded border-zinc-600 bg-zinc-800 text-violet-500 focus:ring-violet-500/25"
                />
              </th>
            )}
            {columns.map((col) => (
              <th
                key={col.key}
                className={clsx(
                  'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500',
                  col.sortable && 'cursor-pointer select-none hover:text-zinc-300',
                  col.className,
                )}
                onClick={() => col.sortable && toggleSort(col.key)}
              >
                <div className="flex items-center gap-1">
                  {col.label}
                  {col.sortable && sortKey === col.key && (
                    sortDir === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800/50">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + (selectable ? 1 : 0)}
                className="px-4 py-12 text-center text-zinc-500"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item) => (
              <tr
                key={item.id}
                onClick={() => onRowClick?.(item)}
                className={clsx(
                  'transition-colors',
                  onRowClick && 'cursor-pointer hover:bg-zinc-800/50',
                  selectedIds.has(item.id) && 'bg-violet-600/5',
                )}
              >
                {selectable && (
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedIds.has(item.id)}
                      onChange={() => toggleOne(item.id)}
                      className="rounded border-zinc-600 bg-zinc-800 text-violet-500 focus:ring-violet-500/25"
                    />
                  </td>
                )}
                {columns.map((col) => (
                  <td key={col.key} className={clsx('px-4 py-3', col.className)}>
                    {col.render(item)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
