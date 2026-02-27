import { useState } from 'react';
import { Search, ScrollText, Calendar } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { auditApi, type AuditEntry } from '../api/client';
import DataTable, { type Column } from '../components/DataTable';
import Pagination from '../components/Pagination';
import { format } from 'date-fns';

export default function AuditLog() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['audit-log', { page, pageSize: 25, search, dateFrom, dateTo }],
    queryFn: () =>
      auditApi
        .list({
          page,
          pageSize: 25,
          search: search || undefined,
          dateFrom: dateFrom || undefined,
          dateTo: dateTo || undefined,
        })
        .then((r) => r.data),
  });

  const entries = data?.items ?? [];

  const actionColors: Record<string, string> = {
    create: 'text-emerald-400',
    update: 'text-blue-400',
    delete: 'text-red-400',
    login: 'text-violet-400',
    publish: 'text-amber-400',
  };

  const columns: Column<AuditEntry>[] = [
    {
      key: 'timestamp',
      label: 'Timestamp',
      sortable: true,
      render: (e) => (
        <span className="whitespace-nowrap text-zinc-400">
          {format(new Date(e.timestamp), 'MMM d, yyyy HH:mm:ss')}
        </span>
      ),
    },
    {
      key: 'user',
      label: 'User',
      render: (e) => (
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-800 text-[10px] font-bold text-zinc-400">
            {e.userName?.charAt(0).toUpperCase() ?? '?'}
          </div>
          <span className="text-zinc-300">{e.userName}</span>
        </div>
      ),
    },
    {
      key: 'action',
      label: 'Action',
      render: (e) => (
        <span
          className={`font-medium capitalize ${
            actionColors[e.action.toLowerCase()] ?? 'text-zinc-400'
          }`}
        >
          {e.action}
        </span>
      ),
    },
    {
      key: 'resource',
      label: 'Resource',
      render: (e) => (
        <div>
          <span className="text-zinc-300">{e.resource}</span>
          {e.resourceId && (
            <span className="ml-1 text-xs text-zinc-600">#{e.resourceId.slice(0, 8)}</span>
          )}
        </div>
      ),
    },
    {
      key: 'ip',
      label: 'IP',
      render: (e) => <span className="font-mono text-xs text-zinc-500">{e.ip}</span>,
    },
  ];

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-zinc-100">Audit Log</h1>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search actions, users, resources…"
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 py-2 pl-9 pr-3 text-sm text-zinc-200 outline-none placeholder:text-zinc-500 focus:border-violet-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-zinc-500" />
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
            className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-300 outline-none focus:border-violet-500"
          />
          <span className="text-zinc-600">to</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
            className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-300 outline-none focus:border-violet-500"
          />
        </div>
      </div>

      {entries.length === 0 && !isLoading ? (
        <div className="flex flex-col items-center py-16 text-zinc-500">
          <ScrollText className="mb-3 h-12 w-12" />
          <p className="text-sm">No audit log entries found</p>
          <p className="text-xs">Activity will appear here as changes are made</p>
        </div>
      ) : (
        <>
          <DataTable columns={columns} data={entries} isLoading={isLoading} />
          <Pagination
            page={page}
            totalPages={data?.totalPages ?? 1}
            onPageChange={setPage}
            total={data?.total}
            pageSize={25}
          />
        </>
      )}
    </div>
  );
}
