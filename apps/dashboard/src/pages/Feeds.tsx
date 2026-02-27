import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Rss, Trash2 } from 'lucide-react';
import { useFeeds, useDeleteFeed } from '../hooks/useFeeds';
import DataTable, { type Column } from '../components/DataTable';
import Pagination from '../components/Pagination';
import StatusBadge from '../components/StatusBadge';
import ConfirmDialog from '../components/ConfirmDialog';
import type { Feed } from '../api/client';
import { format } from 'date-fns';

export default function Feeds() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<Feed | null>(null);

  const { data, isLoading } = useFeeds({ page, pageSize: 20 });
  const deleteFeed = useDeleteFeed();

  const feeds = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;

  const columns: Column<Feed>[] = [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      render: (f) => <span className="font-medium text-zinc-200">{f.name}</span>,
    },
    {
      key: 'type',
      label: 'Type',
      render: (f) => <StatusBadge status={f.type} />,
    },
    {
      key: 'itemCount',
      label: 'Items',
      render: (f) => <span className="text-zinc-400">{f.itemCount}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (f) => <StatusBadge status={f.status} />,
    },
    {
      key: 'lastUpdated',
      label: 'Last Updated',
      render: (f) => (
        <span className="text-zinc-500">{format(new Date(f.lastUpdated), 'MMM d, HH:mm')}</span>
      ),
    },
    {
      key: 'actions',
      label: '',
      className: 'w-10',
      render: (f) => (
        <button
          onClick={(e) => { e.stopPropagation(); setDeleteTarget(f); }}
          className="text-zinc-500 hover:text-red-400"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-100">Feeds</h1>
        <Link
          to="/feeds/new"
          className="flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-500"
        >
          <Plus className="h-4 w-4" /> Create Feed
        </Link>
      </div>

      {feeds.length === 0 && !isLoading ? (
        <div className="flex flex-col items-center py-16 text-zinc-500">
          <Rss className="mb-3 h-12 w-12" />
          <p className="mb-1 text-sm font-medium">No feeds yet</p>
          <p className="mb-4 text-xs">Create your first content feed to get started</p>
          <Link
            to="/feeds/new"
            className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500"
          >
            Create Feed
          </Link>
        </div>
      ) : (
        <>
          <DataTable
            columns={columns}
            data={feeds}
            onRowClick={(f) => navigate(`/feeds/${f.id}`)}
            isLoading={isLoading}
          />
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} total={data?.total} pageSize={20} />
        </>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            deleteFeed.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) });
          }
        }}
        title="Delete Feed"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        loading={deleteFeed.isPending}
      />
    </div>
  );
}
