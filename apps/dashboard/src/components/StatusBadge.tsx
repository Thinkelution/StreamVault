import clsx from 'clsx';

const statusStyles: Record<string, string> = {
  published: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  draft: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/25',
  processing: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
  archived: 'bg-zinc-500/15 text-zinc-500 border-zinc-500/25',
  failed: 'bg-red-500/15 text-red-400 border-red-500/25',
  active: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  inactive: 'bg-zinc-500/15 text-zinc-500 border-zinc-500/25',
  queued: 'bg-blue-500/15 text-blue-400 border-blue-500/25',
  completed: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  admin: 'bg-violet-500/15 text-violet-400 border-violet-500/25',
  editor: 'bg-blue-500/15 text-blue-400 border-blue-500/25',
  viewer: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/25',
  mrss: 'bg-orange-500/15 text-orange-400 border-orange-500/25',
  json: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/25',
  atom: 'bg-purple-500/15 text-purple-400 border-purple-500/25',
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold capitalize',
        statusStyles[status] ?? 'bg-zinc-500/15 text-zinc-400 border-zinc-500/25',
        className,
      )}
    >
      {status}
    </span>
  );
}
