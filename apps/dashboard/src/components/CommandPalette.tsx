import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  LayoutDashboard,
  Video,
  Upload,
  Rss,
  ListVideo,
  FolderTree,
  Tag,
  BarChart3,
  Users,
  Settings,
  ScrollText,
} from 'lucide-react';
import clsx from 'clsx';

const commands = [
  { id: 'dashboard', label: 'Go to Dashboard', icon: LayoutDashboard, path: '/' },
  { id: 'videos', label: 'Go to Videos', icon: Video, path: '/videos' },
  { id: 'upload', label: 'Upload Video', icon: Upload, path: '/upload' },
  { id: 'feeds', label: 'Go to Feeds', icon: Rss, path: '/feeds' },
  { id: 'feed-new', label: 'Create New Feed', icon: Rss, path: '/feeds/new' },
  { id: 'playlists', label: 'Go to Playlists', icon: ListVideo, path: '/playlists' },
  { id: 'categories', label: 'Go to Categories', icon: FolderTree, path: '/categories' },
  { id: 'tags', label: 'Go to Tags', icon: Tag, path: '/tags' },
  { id: 'analytics', label: 'Go to Analytics', icon: BarChart3, path: '/analytics' },
  { id: 'users', label: 'Go to Users', icon: Users, path: '/users' },
  { id: 'settings', label: 'Go to Settings', icon: Settings, path: '/settings' },
  { id: 'audit', label: 'Go to Audit Log', icon: ScrollText, path: '/audit-log' },
];

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export default function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const filtered = commands.filter((c) =>
    c.label.toLowerCase().includes(query.toLowerCase()),
  );

  useEffect(() => {
    if (open) {
      setQuery('');
      setActiveIdx(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    setActiveIdx(0);
  }, [query]);

  const run = (idx: number) => {
    const cmd = filtered[idx];
    if (cmd) {
      navigate(cmd.path);
      onClose();
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      run(activeIdx);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 pt-[20vh] backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl">
        <div className="flex items-center gap-3 border-b border-zinc-800 px-4">
          <Search className="h-4 w-4 text-zinc-500" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Type a command or search…"
            className="h-12 flex-1 bg-transparent text-sm text-zinc-100 outline-none placeholder:text-zinc-500"
          />
          <kbd className="rounded border border-zinc-700 bg-zinc-800 px-1.5 py-0.5 text-[10px] font-medium text-zinc-400">
            ESC
          </kbd>
        </div>
        <div className="max-h-72 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="px-3 py-8 text-center text-sm text-zinc-500">
              No results found
            </div>
          ) : (
            filtered.map((cmd, i) => {
              const Icon = cmd.icon;
              return (
                <button
                  key={cmd.id}
                  onClick={() => run(i)}
                  onMouseEnter={() => setActiveIdx(i)}
                  className={clsx(
                    'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
                    i === activeIdx
                      ? 'bg-violet-600/15 text-violet-300'
                      : 'text-zinc-400 hover:text-zinc-200',
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{cmd.label}</span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
