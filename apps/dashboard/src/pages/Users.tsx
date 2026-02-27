import { useState } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi, type User } from '../api/client';
import DataTable, { type Column } from '../components/DataTable';
import Pagination from '../components/Pagination';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function Users() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', role: 'editor', password: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['users', { page, pageSize: 20 }],
    queryFn: () => usersApi.list({ page, pageSize: 20 }).then((r) => r.data),
  });

  const createUser = useMutation({
    mutationFn: (data: Partial<User> & { password?: string }) => usersApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      setCreateOpen(false);
      setForm({ name: '', email: '', role: 'editor', password: '' });
      toast.success('User created');
    },
    onError: () => toast.error('Failed to create user'),
  });

  const toggleStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      usersApi.update(id, { status } as Partial<User>),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      toast.success('User updated');
    },
  });

  const users = data?.items ?? [];

  const columns: Column<User>[] = [
    {
      key: 'name',
      label: 'User',
      sortable: true,
      render: (u) => (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-600 text-xs font-bold text-white">
            {u.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-zinc-200">{u.name}</p>
            <p className="text-xs text-zinc-500">{u.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      label: 'Role',
      render: (u) => <StatusBadge status={u.role} />,
    },
    {
      key: 'lastLoginAt',
      label: 'Last Login',
      render: (u) => (
        <span className="text-zinc-500">
          {u.lastLoginAt ? format(new Date(u.lastLoginAt), 'MMM d, HH:mm') : 'Never'}
        </span>
      ),
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (u) => <StatusBadge status={u.isActive ? 'active' : 'inactive'} />,
    },
    {
      key: 'actions',
      label: '',
      className: 'w-24',
      render: (u) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleStatus.mutate({
              id: u.id,
              status: u.isActive ? 'inactive' : 'active',
            });
          }}
          className={`rounded-lg px-3 py-1 text-xs font-medium ${
            u.isActive
              ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
              : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
          }`}
        >
          {u.isActive ? 'Deactivate' : 'Activate'}
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-100">Users</h1>
        <button
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500"
        >
          <Plus className="h-4 w-4" /> Add User
        </button>
      </div>

      <DataTable columns={columns} data={users} isLoading={isLoading} emptyMessage="No users found" />
      <Pagination page={page} totalPages={data?.totalPages ?? 1} onPageChange={setPage} total={data?.total} pageSize={20} />

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Add User" size="sm">
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-300">Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3.5 py-2.5 text-sm text-zinc-100 outline-none focus:border-violet-500"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-300">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3.5 py-2.5 text-sm text-zinc-100 outline-none focus:border-violet-500"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-300">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3.5 py-2.5 text-sm text-zinc-100 outline-none focus:border-violet-500"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-300">Role</label>
            <select
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3.5 py-2.5 text-sm text-zinc-100 outline-none focus:border-violet-500"
            >
              <option value="admin">Admin</option>
              <option value="editor">Editor</option>
              <option value="viewer">Viewer</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setCreateOpen(false)}
              className="rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-700"
            >
              Cancel
            </button>
            <button
              onClick={() => createUser.mutate({ ...form })}
              disabled={!form.name || !form.email || createUser.isPending}
              className="flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500 disabled:opacity-50"
            >
              {createUser.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Create User
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
