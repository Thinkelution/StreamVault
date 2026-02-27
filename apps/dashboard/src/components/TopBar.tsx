import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Bell, LogOut, User, Command } from 'lucide-react';
import clsx from 'clsx';
import { useAuthStore } from '../stores/auth';

const breadcrumbMap: Record<string, string> = {
  '': 'Dashboard',
  videos: 'Videos',
  upload: 'Upload',
  feeds: 'Feeds',
  playlists: 'Playlists',
  categories: 'Categories',
  tags: 'Tags',
  analytics: 'Analytics',
  users: 'Users',
  settings: 'Settings',
  'audit-log': 'Audit Log',
};

interface TopBarProps {
  onCommandPalette: () => void;
}

export default function TopBar({ onCommandPalette }: TopBarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const segments = location.pathname.split('/').filter(Boolean);
  const currentPage = breadcrumbMap[segments[0] ?? ''] ?? segments[0] ?? 'Dashboard';

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-4 border-b border-zinc-800 bg-zinc-950/80 px-6 backdrop-blur-sm">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-zinc-500">StreamVault</span>
        <span className="text-zinc-600">/</span>
        <span className="font-medium text-zinc-200">{currentPage}</span>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <button
          onClick={onCommandPalette}
          className="flex h-9 items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-3 text-sm text-zinc-400 transition-colors hover:border-zinc-700 hover:text-zinc-300"
        >
          <Search className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Search…</span>
          <kbd className="hidden items-center gap-0.5 rounded border border-zinc-700 bg-zinc-800 px-1.5 py-0.5 text-[10px] font-medium text-zinc-400 sm:flex">
            <Command className="h-2.5 w-2.5" /> K
          </kbd>
        </button>

        <button className="relative flex h-9 w-9 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200">
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-violet-500" />
        </button>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-600 text-xs font-bold text-white transition-opacity hover:opacity-90"
          >
            {user?.name.charAt(0).toUpperCase() ?? 'U'}
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 top-11 w-56 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 shadow-2xl">
              <div className="border-b border-zinc-800 px-4 py-3">
                <p className="text-sm font-medium text-zinc-200">{user?.name}</p>
                <p className="text-xs text-zinc-500">{user?.email}</p>
              </div>
              <div className="p-1">
                <button
                  onClick={() => { navigate('/settings'); setUserMenuOpen(false); }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
                >
                  <User className="h-4 w-4" /> Profile
                </button>
                <button
                  onClick={logout}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-400 transition-colors hover:bg-zinc-800 hover:text-red-300"
                >
                  <LogOut className="h-4 w-4" /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
