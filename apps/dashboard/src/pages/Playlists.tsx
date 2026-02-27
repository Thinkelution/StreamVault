import { useState } from 'react';
import { Plus, ListVideo, Trash2, Loader2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { playlistsApi, type Playlist } from '../api/client';
import DataTable, { type Column } from '../components/DataTable';
import Pagination from '../components/Pagination';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function Playlists() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Playlist | null>(null);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['playlists', { page, pageSize: 20 }],
    queryFn: () => playlistsApi.list({ page, pageSize: 20 }).then((r) => r.data),
  });

  const createPlaylist = useMutation({
    mutationFn: (data: Partial<Playlist>) => playlistsApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['playlists'] });
      setCreateOpen(false);
      setNewName('');
      setNewDesc('');
      toast.success('Playlist created');
    },
    onError: () => toast.error('Failed to create playlist'),
  });

  const deletePlaylist = useMutation({
    mutationFn: (id: string) => playlistsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['playlists'] });
      setDeleteTarget(null);
      toast.success('Playlist deleted');
    },
  });

  const playlists = data?.items ?? [];

  const columns: Column<Playlist>[] = [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      render: (p) => <span className="font-medium text-zinc-200">{p.name}</span>,
    },
    {
      key: 'videoCount',
      label: 'Videos',
      render: (p) => <span className="text-zinc-400">{p.videoCount}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (p) => <StatusBadge status={p.status} />,
    },
    {
      key: 'updatedAt',
      label: 'Updated',
      render: (p) => (
        <span className="text-zinc-500">{format(new Date(p.updatedAt), 'MMM d, yyyy')}</span>
      ),
    },
    {
      key: 'actions',
      label: '',
      className: 'w-10',
      render: (p) => (
        <button
          onClick={(e) => { e.stopPropagation(); setDeleteTarget(p); }}
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
        <h1 className="text-2xl font-bold text-zinc-100">Playlists</h1>
        <button
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500"
        >
          <Plus className="h-4 w-4" /> New Playlist
        </button>
      </div>

      {playlists.length === 0 && !isLoading ? (
        <div className="flex flex-col items-center py-16 text-zinc-500">
          <ListVideo className="mb-3 h-12 w-12" />
          <p className="mb-1 text-sm font-medium">No playlists yet</p>
          <p className="text-xs">Organize your videos into playlists</p>
        </div>
      ) : (
        <>
          <DataTable columns={columns} data={playlists} isLoading={isLoading} />
          <Pagination page={page} totalPages={data?.totalPages ?? 1} onPageChange={setPage} total={data?.total} pageSize={20} />
        </>
      )}

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="New Playlist" size="sm">
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-300">Name</label>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Playlist name"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3.5 py-2.5 text-sm text-zinc-100 outline-none focus:border-violet-500"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-300">Description</label>
            <textarea
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3.5 py-2.5 text-sm text-zinc-100 outline-none focus:border-violet-500"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setCreateOpen(false)}
              className="rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-700"
            >
              Cancel
            </button>
            <button
              onClick={() => createPlaylist.mutate({ name: newName, description: newDesc })}
              disabled={!newName.trim() || createPlaylist.isPending}
              className="flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500 disabled:opacity-50"
            >
              {createPlaylist.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Create
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => { if (deleteTarget) deletePlaylist.mutate(deleteTarget.id); }}
        title="Delete Playlist"
        message={`Delete "${deleteTarget?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        loading={deletePlaylist.isPending}
      />
    </div>
  );
}
