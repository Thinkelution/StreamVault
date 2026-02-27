import { useState } from 'react';
import { Plus, ChevronRight, ChevronDown, FolderTree, Pencil, Trash2, Loader2, X, Check } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoriesApi, type Category } from '../api/client';
import ConfirmDialog from '../components/ConfirmDialog';
import toast from 'react-hot-toast';

function CategoryNode({
  category,
  onEdit,
  onDelete,
}: {
  category: Category;
  onEdit: (c: Category) => void;
  onDelete: (c: Category) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = category.children && category.children.length > 0;

  return (
    <div>
      <div className="group flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-zinc-800/50">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex h-5 w-5 items-center justify-center"
        >
          {hasChildren ? (
            expanded ? (
              <ChevronDown className="h-4 w-4 text-zinc-500" />
            ) : (
              <ChevronRight className="h-4 w-4 text-zinc-500" />
            )
          ) : (
            <span className="h-4 w-4" />
          )}
        </button>
        <FolderTree className="h-4 w-4 text-zinc-500" />
        <span className="flex-1 text-sm text-zinc-200">{category.name}</span>
        {category.videoCount !== undefined && (
          <span className="text-xs text-zinc-500">{category.videoCount} videos</span>
        )}
        <div className="flex gap-1 opacity-0 group-hover:opacity-100">
          <button
            onClick={() => onEdit(category)}
            className="rounded p-1 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onDelete(category)}
            className="rounded p-1 text-zinc-400 hover:bg-zinc-700 hover:text-red-400"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      {hasChildren && expanded && (
        <div className="ml-6 border-l border-zinc-800 pl-2">
          {category.children!.map((child) => (
            <CategoryNode key={child.id} category={child} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Categories() {
  const qc = useQueryClient();
  const [editTarget, setEditTarget] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [editName, setEditName] = useState('');

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.list().then((r) => r.data),
  });

  const createCategory = useMutation({
    mutationFn: (data: Partial<Category>) => categoriesApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] });
      setAdding(false);
      setNewName('');
      toast.success('Category created');
    },
  });

  const updateCategory = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Category> }) =>
      categoriesApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] });
      setEditTarget(null);
      toast.success('Category updated');
    },
  });

  const deleteCategory = useMutation({
    mutationFn: (id: string) => categoriesApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] });
      setDeleteTarget(null);
      toast.success('Category deleted');
    },
  });

  const handleEdit = (c: Category) => {
    setEditTarget(c);
    setEditName(c.name);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-100">Categories</h1>
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500"
        >
          <Plus className="h-4 w-4" /> Add Category
        </button>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
        {adding && (
          <div className="mb-3 flex items-center gap-2 rounded-lg border border-violet-500/50 bg-violet-500/5 px-3 py-2">
            <input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && newName.trim() && createCategory.mutate({ name: newName })}
              placeholder="Category name"
              className="flex-1 bg-transparent text-sm text-zinc-100 outline-none placeholder:text-zinc-500"
            />
            <button
              onClick={() => newName.trim() && createCategory.mutate({ name: newName })}
              disabled={createCategory.isPending}
              className="rounded p-1 text-emerald-400 hover:bg-zinc-800"
            >
              {createCategory.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            </button>
            <button onClick={() => { setAdding(false); setNewName(''); }} className="rounded p-1 text-zinc-400 hover:bg-zinc-800">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {editTarget && (
          <div className="mb-3 flex items-center gap-2 rounded-lg border border-amber-500/50 bg-amber-500/5 px-3 py-2">
            <span className="text-xs text-zinc-500">Editing:</span>
            <input
              autoFocus
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && editName.trim() && updateCategory.mutate({ id: editTarget.id, data: { name: editName } })}
              className="flex-1 bg-transparent text-sm text-zinc-100 outline-none"
            />
            <button
              onClick={() => editName.trim() && updateCategory.mutate({ id: editTarget.id, data: { name: editName } })}
              className="rounded p-1 text-emerald-400 hover:bg-zinc-800"
            >
              <Check className="h-4 w-4" />
            </button>
            <button onClick={() => setEditTarget(null)} className="rounded p-1 text-zinc-400 hover:bg-zinc-800">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="animate-pulse space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 rounded bg-zinc-800" />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-zinc-500">
            <FolderTree className="mb-2 h-10 w-10" />
            <p className="text-sm">No categories yet</p>
          </div>
        ) : (
          <div className="space-y-0.5">
            {categories.map((cat) => (
              <CategoryNode key={cat.id} category={cat} onEdit={handleEdit} onDelete={setDeleteTarget} />
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => { if (deleteTarget) deleteCategory.mutate(deleteTarget.id); }}
        title="Delete Category"
        message={`Delete "${deleteTarget?.name}" and all its children?`}
        confirmLabel="Delete"
        variant="danger"
        loading={deleteCategory.isPending}
      />
    </div>
  );
}
