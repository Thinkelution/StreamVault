import { useState, useEffect, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import clsx from 'clsx';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import CommandPalette from './CommandPalette';

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      setCommandOpen((v) => !v);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="min-h-screen bg-zinc-950">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />
      <div
        className={clsx(
          'transition-all duration-300',
          collapsed ? 'ml-16' : 'ml-[260px]',
        )}
      >
        <TopBar onCommandPalette={() => setCommandOpen(true)} />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
      <CommandPalette open={commandOpen} onClose={() => setCommandOpen(false)} />
    </div>
  );
}
