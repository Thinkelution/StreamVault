import { useState } from 'react';
import { Eye, Users, Clock, TrendingUp, Globe } from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  useAnalyticsOverview,
  useAnalyticsViews,
  useAnalyticsTopVideos,
  useAnalyticsDevices,
  useAnalyticsCountries,
} from '../hooks/useAnalytics';
import { format, subDays } from 'date-fns';

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

const fallbackViews = Array.from({ length: 30 }, (_, i) => ({
  date: format(subDays(new Date(), 29 - i), 'MMM dd'),
  views: Math.floor(Math.random() * 8000 + 2000),
  uniqueViewers: Math.floor(Math.random() * 4000 + 1000),
}));

const fallbackTopVideos = Array.from({ length: 10 }, (_, i) => ({
  videoId: `v${i}`,
  title: `Video Title ${i + 1}`,
  views: Math.floor(Math.random() * 50000 + 5000),
  watchTime: Math.floor(Math.random() * 10000 + 500),
}));

const fallbackDevices = [
  { device: 'Desktop', count: 45000, percentage: 42 },
  { device: 'Mobile', count: 38000, percentage: 35 },
  { device: 'Tablet', count: 15000, percentage: 14 },
  { device: 'Smart TV', count: 10000, percentage: 9 },
];

const fallbackCountries = [
  { country: 'United States', code: 'US', views: 85000 },
  { country: 'United Kingdom', code: 'GB', views: 32000 },
  { country: 'Germany', code: 'DE', views: 28000 },
  { country: 'France', code: 'FR', views: 21000 },
  { country: 'Canada', code: 'CA', views: 18000 },
  { country: 'India', code: 'IN', views: 15000 },
  { country: 'Australia', code: 'AU', views: 12000 },
  { country: 'Japan', code: 'JP', views: 9000 },
];

export default function Analytics() {
  const [range, setRange] = useState('30d');
  const params = { range };

  const { data: overview } = useAnalyticsOverview(params);
  const { data: views } = useAnalyticsViews(params);
  const { data: topVideos } = useAnalyticsTopVideos(params);
  const { data: devices } = useAnalyticsDevices(params);
  const { data: countries } = useAnalyticsCountries(params);

  const viewsData = views ?? fallbackViews;
  const topVideosData = topVideos ?? fallbackTopVideos;
  const devicesData = devices ?? fallbackDevices;
  const countriesData = countries ?? fallbackCountries;

  const metricCards = [
    {
      label: 'Total Views',
      value: (overview?.totalViews ?? 142800).toLocaleString(),
      icon: Eye,
      trend: overview?.viewsTrend ?? 12,
      color: 'bg-violet-500/15 text-violet-400',
    },
    {
      label: 'Unique Viewers',
      value: (overview?.uniqueViewers ?? 68400).toLocaleString(),
      icon: Users,
      trend: overview?.viewersTrend ?? 8,
      color: 'bg-blue-500/15 text-blue-400',
    },
    {
      label: 'Watch Time',
      value: `${((overview?.watchTimeMinutes ?? 284000) / 60).toFixed(0)}h`,
      icon: Clock,
      color: 'bg-emerald-500/15 text-emerald-400',
    },
    {
      label: 'Avg. Watch Time',
      value: `${overview?.avgWatchTime ?? 4.2}m`,
      icon: TrendingUp,
      color: 'bg-amber-500/15 text-amber-400',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-100">Analytics</h1>
        <div className="flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900 p-0.5">
          {[
            { value: '7d', label: '7D' },
            { value: '30d', label: '30D' },
            { value: '90d', label: '90D' },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setRange(opt.value)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                range === opt.value
                  ? 'bg-violet-600 text-white'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {metricCards.map((m) => {
          const Icon = m.icon;
          return (
            <div
              key={m.label}
              className="rounded-xl border border-zinc-800 bg-zinc-900 p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${m.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                {m.trend !== undefined && (
                  <span className={`text-xs font-medium ${m.trend >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {m.trend >= 0 ? '+' : ''}{m.trend}%
                  </span>
                )}
              </div>
              <p className="text-2xl font-bold text-zinc-100">{m.value}</p>
              <p className="mt-0.5 text-xs text-zinc-500">{m.label}</p>
            </div>
          );
        })}
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
        <h3 className="mb-4 text-sm font-semibold text-zinc-300">Views Over Time</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={viewsData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#71717a' }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#71717a' }} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', borderRadius: '8px', fontSize: 12 }} />
            <Legend />
            <Line type="monotone" dataKey="views" stroke="#8b5cf6" strokeWidth={2} dot={false} name="Views" />
            <Line type="monotone" dataKey="uniqueViewers" stroke="#3b82f6" strokeWidth={2} dot={false} name="Unique" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <h3 className="mb-4 text-sm font-semibold text-zinc-300">Top 10 Videos</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topVideosData.slice(0, 10)} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#71717a' }} tickLine={false} axisLine={false} />
              <YAxis
                type="category"
                dataKey="title"
                tick={{ fontSize: 10, fill: '#a1a1aa' }}
                width={120}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', borderRadius: '8px', fontSize: 12 }} />
              <Bar dataKey="views" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <h3 className="mb-4 text-sm font-semibold text-zinc-300">Devices</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={devicesData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={110}
                dataKey="count"
                nameKey="device"
                label={({ device, percentage }) => `${device} ${percentage}%`}
              >
                {devicesData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', borderRadius: '8px', fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
        <div className="mb-4 flex items-center gap-2">
          <Globe className="h-4 w-4 text-zinc-500" />
          <h3 className="text-sm font-semibold text-zinc-300">Top Countries</h3>
        </div>
        <div className="space-y-2">
          {countriesData.map((c, i) => {
            const maxViews = countriesData[0]?.views ?? 1;
            return (
              <div key={c.code} className="flex items-center gap-3">
                <span className="w-5 text-right text-xs text-zinc-600">{i + 1}</span>
                <span className="w-32 text-sm text-zinc-300">{c.country}</span>
                <div className="flex-1">
                  <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
                    <div
                      className="h-full rounded-full bg-violet-500"
                      style={{ width: `${(c.views / maxViews) * 100}%` }}
                    />
                  </div>
                </div>
                <span className="w-16 text-right text-xs text-zinc-400">
                  {c.views.toLocaleString()}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
