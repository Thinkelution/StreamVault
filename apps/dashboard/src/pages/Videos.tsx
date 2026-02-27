import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Trash2, CheckCircle, Archive, Video as VideoIcon } from 'lucide-react';
import { useVideos, useBulkVideoAction } from '../hooks/useVideos';
import DataTable, { type Column } from '../components/DataTable';
import Pagination from '../components/Pagination';
import StatusBadge from '../components/StatusBadge';
import ConfirmDialog from '../components/ConfirmDialog';
import type { Video } from '../api/client';
import { format } from 'date-fns';

function formatDuration(seconds?: number) {
  if (!seconds) return '--:--';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function Videos() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [confirmBulk, setConfirmBulk] = useState<string | null>(null);

  const { data, isLoading } = useVideos({
    page,
    pageSize: 20,
    search: search || undefined,
    status: statusFilter || undefined,
  });
  const bulkAction = useBulkVideoAction();

  const videos = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;

  const columns: Column<Video>[] = [
    {
      key: 'thumbnail',
      label: '',
      className: 'w-16',
      render: (v) => (
        <div className="h-10 w-16 overflow-hidden rounded bg-zinc-800">
          {v.thumbnail ? (
            <img src={v.thumbnail} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center">
              <VideoIcon className="h-4 w-4 text-zinc-600" />
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'title',
      label: 'Title',
      sortable: true,
      render: (v) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-zinc-200">{v.title}</p>
          <p className="truncate text-xs text-zinc-500">{v.slug}</p>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (v) => <StatusBadge status={v.status} />,
    },
    {
      key: 'duration',
      label: 'Duration',
      render: (v) => <span className="text-zinc-400">{formatDuration(v.duration)}</span>,
    },
    {
      key: 'views',
      label: 'Views',
      sortable: true,
      render: (v) => <span className="text-zinc-400">{v.views.toLocaleString()}</span>,
    },
    {
      key: 'createdAt',
      label: 'Created',
      sortable: true,
      render: (v) => (
        <span className="text-zinc-500">{format(new Date(v.createdAt), 'MMM d, yyyy')}</span>
      ),
    },
  ];

  const handleBulkAction = () => {
    if (!confirmBulk || selectedIds.size === 0) return;
    bulkAction.mutate(
      { ids: Array.from(selectedIds), action: confirmBulk },
      { onSuccess: () => { setSelectedIds(new Set()); setConfirmBulk(null); } },
    );
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-100">Videos</h1>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search videos…"
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 py-2 pl-9 pr-3 text-sm text-zinc-200 outline-none placeholder:text-zinc-500 focus:border-violet-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-zinc-500" />
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-300 outline-none focus:border-violet-500"
          >
            <option value="">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="processing">Processing</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        {selectedIds.size > 0 && (
          <div className="ml-auto flex items-center gap-2">
            <span className="text-sm text-zinc-500">{selectedIds.size} selected</span>
            <button
              onClick={() => setConfirmBulk('publish')}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600/15 px-3 py-1.5 text-xs font-medium text-emerald-400 hover:bg-emerald-600/25"
            >
              <CheckCircle className="h-3.5 w-3.5" /> Publish
            </button>
            <button
              onClick={() => setConfirmBulk('archive')}
              className="flex items-center gap-1.5 rounded-lg bg-zinc-600/15 px-3 py-1.5 text-xs font-medium text-zinc-400 hover:bg-zinc-600/25"
            >
              <Archive className="h-3.5 w-3.5" /> Archive
            </button>
            <button
              onClick={() => setConfirmBulk('delete')}
              className="flex items-center gap-1.5 rounded-lg bg-red-600/15 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-600/25"
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </button>
          </div>
        )}
      </div>

      <DataTable
        columns={columns}
        data={videos}
        selectable
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        onRowClick={(v) => navigate(`/videos/${v.id}`)}
        isLoading={isLoading}
        emptyMessage="No videos found. Upload your first video to get started."
      />

      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        total={data?.total}
        pageSize={20}
      />

      <ConfirmDialog
        open={confirmBulk !== null}
        onClose={() => setConfirmBulk(null)}
        onConfirm={handleBulkAction}
        title={`${confirmBulk === 'delete' ? 'Delete' : confirmBulk === 'publish' ? 'Publish' : 'Archive'} ${selectedIds.size} videos?`}
        message={`This will ${confirmBulk} the selected videos. ${confirmBulk === 'delete' ? 'This action cannot be undone.' : ''}`}
        confirmLabel={confirmBulk === 'delete' ? 'Delete' : confirmBulk === 'publish' ? 'Publish' : 'Archive'}
        variant={confirmBulk === 'delete' ? 'danger' : 'warning'}
        loading={bulkAction.isPending}
      />
    </div>
  );
}
