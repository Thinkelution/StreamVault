import { useState } from 'react';
import { Plus, Tag as TagIcon, Pencil, Trash2, X, Check, Loader2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tagsApi, type Tag } from '../api/client';
import ConfirmDialog from '../components/ConfirmDialog';
import toast from 'react-hot-toast';

export default function Tags() {
  const qc = useQueryClient();
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Tag | null>(null);

  const { data: tags = [], isLoading } = useQuery({
    queryKey: ['tags'],
    queryFn: () => tagsApi.list().then((r) => r.data),
  });

  const createTag = useMutation({
    mutationFn: (name: string) => tagsApi.create({ name }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tags'] });
      setAdding(false);
      setNewName('');
      toast.success('Tag created');
    },
  });

  const updateTag = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => tagsApi.update(id, { name }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tags'] });
      setEditId(null);
      toast.success('Tag updated');
    },
  });

  const deleteTag = useMutation({
    mutationFn: (id: string) => tagsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tags'] });
      setDeleteTarget(null);
      toast.success('Tag deleted');
    },
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-100">Tags</h1>
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500"
        >
          <Plus className="h-4 w-4" /> Add Tag
        </button>
      </div>

      {adding && (
        <div className="flex items-center gap-2 rounded-xl border border-violet-500/50 bg-zinc-900 px-4 py-3">
          <TagIcon className="h-4 w-4 text-violet-400" />
          <input
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && newName.trim() && createTag.mutate(newName.trim())}
            placeholder="Tag name"
            className="flex-1 bg-transparent text-sm text-zinc-100 outline-none placeholder:text-zinc-500"
          />
          <button
            onClick={() => newName.trim() && createTag.mutate(newName.trim())}
            disabled={createTag.isPending}
            className="text-emerald-400 hover:text-emerald-300"
          >
            {createTag.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          </button>
          <button onClick={() => { setAdding(false); setNewName(''); }} className="text-zinc-400 hover:text-zinc-300">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-zinc-800" />
          ))}
        </div>
      ) : tags.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-zinc-500">
          <TagIcon className="mb-3 h-12 w-12" />
          <p className="text-sm">No tags yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {tags.map((tag) => (
            <div
              key={tag.id}
              className="group flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900 p-4 transition-colors hover:border-zinc-700"
            >
              {editId === tag.id ? (
                <div className="flex flex-1 items-center gap-2">
                  <input
                    autoFocus
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && editName.trim() && updateTag.mutate({ id: tag.id, name: editName.trim() })}
                    className="flex-1 bg-transparent text-sm text-zinc-100 outline-none"
                  />
                  <button onClick={() => editName.trim() && updateTag.mutate({ id: tag.id, name: editName.trim() })} className="text-emerald-400">
                    <Check className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => setEditId(null)} className="text-zinc-400">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <>
                  <TagIcon className="h-4 w-4 shrink-0 text-violet-400" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-zinc-200">{tag.name}</p>
                    {tag.videoCount !== undefined && (
                      <p className="text-xs text-zinc-500">{tag.videoCount} videos</p>
                    )}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                    <button
                      onClick={() => { setEditId(tag.id); setEditName(tag.name); }}
                      className="rounded p-1 text-zinc-400 hover:text-zinc-200"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(tag)}
                      className="rounded p-1 text-zinc-400 hover:text-red-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => { if (deleteTarget) deleteTag.mutate(deleteTarget.id); }}
        title="Delete Tag"
        message={`Delete tag "${deleteTarget?.name}"?`}
        confirmLabel="Delete"
        variant="danger"
        loading={deleteTag.isPending}
      />
    </div>
  );
}
