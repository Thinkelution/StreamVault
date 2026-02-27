import { NavLink } from 'react-router-dom';
import {
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
  ChevronLeft,
  Play,
} from 'lucide-react';
import clsx from 'clsx';
import { useAuthStore } from '../stores/auth';

interface NavItem {
  to: string;
  icon: React.ElementType;
  label: string;
  end?: boolean;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/videos', icon: Video, label: 'Videos' },
  { to: '/upload', icon: Upload, label: 'Upload' },
  { to: '/feeds', icon: Rss, label: 'Feeds' },
  { to: '/playlists', icon: ListVideo, label: 'Playlists' },
  { to: '/categories', icon: FolderTree, label: 'Categories' },
  { to: '/tags', icon: Tag, label: 'Tags' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/users', icon: Users, label: 'Users', adminOnly: true },
  { to: '/settings', icon: Settings, label: 'Settings' },
  { to: '/audit-log', icon: ScrollText, label: 'Audit Log' },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const user = useAuthStore((s) => s.user);

  return (
    <aside
      className={clsx(
        'fixed left-0 top-0 z-30 flex h-screen flex-col border-r border-zinc-800 bg-zinc-900 transition-all duration-300',
        collapsed ? 'w-16' : 'w-[260px]',
      )}
    >
      <div className="flex h-14 items-center gap-3 border-b border-zinc-800 px-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-600">
          <Play className="h-4 w-4 text-white" fill="white" />
        </div>
        {!collapsed && (
          <span className="text-base font-semibold tracking-tight text-zinc-100">
            StreamVault
          </span>
        )}
        <button
          onClick={onToggle}
          className={clsx(
            'ml-auto flex h-6 w-6 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors',
            collapsed && 'ml-0',
          )}
        >
          <ChevronLeft
            className={clsx('h-4 w-4 transition-transform', collapsed && 'rotate-180')}
          />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3">
        <ul className="space-y-0.5">
          {navItems.map((item) => {
            if (item.adminOnly && !['admin', 'super_admin'].includes(user?.role ?? '')) return null;
            const Icon = item.icon;
            return (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    clsx(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-violet-600/15 text-violet-400'
                        : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200',
                      collapsed && 'justify-center px-0',
                    )
                  }
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className="h-[18px] w-[18px] shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-zinc-800 p-3">
        {!collapsed && user && (
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-600 text-xs font-bold text-white">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-zinc-200">{user.name}</p>
              <p className="truncate text-xs text-zinc-500">{user.role}</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
