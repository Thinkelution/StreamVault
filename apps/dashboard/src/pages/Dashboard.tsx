import { Link } from 'react-router-dom';
import {
  Video,
  CheckCircle2,
  Clock,
  HardDrive,
  Rss,
  Eye,
  TrendingUp,
  TrendingDown,
  Upload,
  Plus,
  Activity,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { analyticsApi, auditApi } from '../api/client';
import { format } from 'date-fns';

const fallbackViewsData = Array.from({ length: 30 }, (_, i) => ({
  date: format(new Date(Date.now() - (29 - i) * 86400000), 'MMM dd'),
  views: Math.floor(Math.random() * 5000 + 2000),
}));

const fallbackUploadsData = Array.from({ length: 8 }, (_, i) => ({
  week: `W${i + 1}`,
  uploads: Math.floor(Math.random() * 30 + 5),
}));

interface MetricCard {
  label: string;
  value: string;
  icon: React.ElementType;
  trend?: number;
  color: string;
}

const metrics: MetricCard[] = [
  { label: 'Total Videos', value: '2,847', icon: Video, trend: 12, color: 'violet' },
  { label: 'Published Today', value: '34', icon: CheckCircle2, trend: 8, color: 'emerald' },
  { label: 'Pending Review', value: '12', icon: Clock, trend: -3, color: 'amber' },
  { label: 'Storage Used', value: '1.2 TB', icon: HardDrive, color: 'blue' },
  { label: 'Active Feeds', value: '18', icon: Rss, trend: 2, color: 'orange' },
  { label: 'Total Views', value: '4.2M', icon: Eye, trend: 15, color: 'pink' },
];

const colorMap: Record<string, string> = {
  violet: 'bg-violet-500/15 text-violet-400',
  emerald: 'bg-emerald-500/15 text-emerald-400',
  amber: 'bg-amber-500/15 text-amber-400',
  blue: 'bg-blue-500/15 text-blue-400',
  orange: 'bg-orange-500/15 text-orange-400',
  pink: 'bg-pink-500/15 text-pink-400',
};

export default function Dashboard() {
  const { data: overview } = useQuery({
    queryKey: ['dashboard-overview'],
    queryFn: () => analyticsApi.overview().then((r) => r.data),
  });

  const { data: auditData } = useQuery({
    queryKey: ['dashboard-activity'],
    queryFn: () => auditApi.list({ pageSize: 5 }).then((r) => r.data),
  });

  const displayMetrics = overview
    ? [
        { ...metrics[0], value: overview.totalViews?.toLocaleString() ?? metrics[0].value },
        ...metrics.slice(1),
      ]
    : metrics;

  const activity = auditData?.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Dashboard</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Overview of your video content platform
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/upload"
            className="flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-500"
          >
            <Upload className="h-4 w-4" /> Upload Video
          </Link>
          <Link
            to="/feeds/new"
            className="flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-700"
          >
            <Plus className="h-4 w-4" /> Create Feed
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {displayMetrics.map((m) => {
          const Icon = m.icon;
          return (
            <div
              key={m.label}
              className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 transition-colors hover:border-zinc-700"
            >
              <div className="mb-3 flex items-center justify-between">
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${colorMap[m.color]}`}>
                  <Icon className="h-4 w-4" />
                </div>
                {m.trend !== undefined && (
                  <span
                    className={`flex items-center gap-0.5 text-xs font-medium ${
                      m.trend >= 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  >
                    {m.trend >= 0 ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {Math.abs(m.trend)}%
                  </span>
                )}
              </div>
              <p className="text-2xl font-bold text-zinc-100">{m.value}</p>
              <p className="mt-0.5 text-xs text-zinc-500">{m.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <h3 className="mb-4 text-sm font-semibold text-zinc-300">Views — Last 30 Days</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={fallbackViewsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#71717a' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#71717a' }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', borderRadius: '8px', fontSize: 12 }}
                labelStyle={{ color: '#a1a1aa' }}
                itemStyle={{ color: '#a78bfa' }}
              />
              <Line type="monotone" dataKey="views" stroke="#8b5cf6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <h3 className="mb-4 text-sm font-semibold text-zinc-300">Uploads Per Week</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={fallbackUploadsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#71717a' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#71717a' }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', borderRadius: '8px', fontSize: 12 }}
                labelStyle={{ color: '#a1a1aa' }}
              />
              <Bar dataKey="uploads" fill="#7c3aed" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-zinc-300">Recent Activity</h3>
          <Link to="/audit-log" className="text-xs text-violet-400 hover:text-violet-300">
            View all
          </Link>
        </div>
        {activity.length === 0 ? (
          <div className="flex flex-col items-center py-8 text-zinc-500">
            <Activity className="mb-2 h-8 w-8" />
            <p className="text-sm">No recent activity</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activity.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center gap-3 rounded-lg p-2 text-sm"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-xs font-bold text-zinc-400">
                  {entry.userName?.charAt(0).toUpperCase() ?? 'S'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-zinc-300">
                    <span className="font-medium">{entry.userName}</span>{' '}
                    <span className="text-zinc-500">{entry.action}</span>{' '}
                    <span className="text-zinc-400">{entry.resource}</span>
                  </p>
                </div>
                <span className="shrink-0 text-xs text-zinc-600">
                  {format(new Date(entry.timestamp), 'MMM d, HH:mm')}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
