import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Loader2,
  Play,
  FileText,
  Tv,
  Captions,
  BarChart3,
  Rss,
} from 'lucide-react';
import clsx from 'clsx';
import { useVideo, useUpdateVideo } from '../hooks/useVideos';
import StatusBadge from '../components/StatusBadge';

const tabs = [
  { id: 'details', label: 'Details', icon: FileText },
  { id: 'player', label: 'Player', icon: Tv },
  { id: 'transcoding', label: 'Transcoding', icon: Loader2 },
  { id: 'captions', label: 'Captions', icon: Captions },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'feeds', label: 'Feed Memberships', icon: Rss },
] as const;

type TabId = (typeof tabs)[number]['id'];

export default function VideoDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: video, isLoading } = useVideo(id);
  const updateVideo = useUpdateVideo();
  const [activeTab, setActiveTab] = useState<TabId>('details');

  const [form, setForm] = useState<{
    title: string;
    slug: string;
    description: string;
    seoTitle: string;
    seoDescription: string;
    status: 'draft' | 'processing' | 'published' | 'archived' | 'failed';
    categoryId: string;
    scheduledAt: string;
  }>({
    title: '',
    slug: '',
    description: '',
    seoTitle: '',
    seoDescription: '',
    status: 'draft',
    categoryId: '',
    scheduledAt: '',
  });

  const [initialized, setInitialized] = useState(false);
  if (video && !initialized) {
    setForm({
      title: video.title ?? '',
      slug: video.slug ?? '',
      description: video.description ?? '',
      seoTitle: video.seoTitle ?? '',
      seoDescription: video.seoDescription ?? '',
      status: video.status as typeof form.status,
      categoryId: video.categoryId ?? '',
      scheduledAt: video.scheduledAt ?? '',
    });
    setInitialized(true);
  }

  const handleSave = () => {
    if (!id) return;
    updateVideo.mutate({ id, data: form });
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
      </div>
    );
  }

  if (!video) {
    return (
      <div className="flex h-64 flex-col items-center justify-center text-zinc-500">
        <p>Video not found</p>
        <button onClick={() => navigate('/videos')} className="mt-2 text-sm text-violet-400 hover:text-violet-300">
          Back to Videos
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/videos')}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-bold text-zinc-100">{video.title}</h1>
          <div className="mt-0.5 flex items-center gap-2">
            <StatusBadge status={video.status} />
            <span className="text-xs text-zinc-500">{video.id}</span>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={updateVideo.isPending}
          className="flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-500 disabled:opacity-50"
        >
          {updateVideo.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save
        </button>
      </div>

      <div className="flex gap-1 border-b border-zinc-800">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={clsx(
                'flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors',
                activeTab === t.id
                  ? 'border-violet-500 text-violet-400'
                  : 'border-transparent text-zinc-500 hover:text-zinc-300',
              )}
            >
              <Icon className="h-4 w-4" /> {t.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'details' && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-300">Title</label>
              <input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3.5 py-2.5 text-sm text-zinc-100 outline-none focus:border-violet-500"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-300">Slug</label>
              <input
                value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3.5 py-2.5 text-sm text-zinc-100 outline-none focus:border-violet-500"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-300">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={5}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3.5 py-2.5 text-sm text-zinc-100 outline-none focus:border-violet-500"
              />
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-300">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as typeof f.status }))}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3.5 py-2.5 text-sm text-zinc-100 outline-none focus:border-violet-500"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-300">Schedule Date</label>
              <input
                type="datetime-local"
                value={form.scheduledAt}
                onChange={(e) => setForm((f) => ({ ...f, scheduledAt: e.target.value }))}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3.5 py-2.5 text-sm text-zinc-100 outline-none focus:border-violet-500"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-300">SEO Title</label>
              <input
                value={form.seoTitle}
                onChange={(e) => setForm((f) => ({ ...f, seoTitle: e.target.value }))}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3.5 py-2.5 text-sm text-zinc-100 outline-none focus:border-violet-500"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-300">SEO Description</label>
              <textarea
                value={form.seoDescription}
                onChange={(e) => setForm((f) => ({ ...f, seoDescription: e.target.value }))}
                rows={3}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3.5 py-2.5 text-sm text-zinc-100 outline-none focus:border-violet-500"
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'player' && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          {video.hlsUrl ? (
            <video
              src={video.hlsUrl}
              controls
              className="w-full rounded-lg"
              poster={video.thumbnail}
            />
          ) : (
            <div className="flex h-64 flex-col items-center justify-center text-zinc-500">
              <Play className="mb-2 h-12 w-12" />
              <p className="text-sm">No video file available</p>
              <p className="text-xs text-zinc-600">Upload or transcode to generate playback URL</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'transcoding' && (
        <div className="space-y-3">
          {(video.transcodingJobs ?? []).length === 0 ? (
            <div className="flex h-32 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-sm text-zinc-500">
              No transcoding jobs
            </div>
          ) : (
            video.transcodingJobs!.map((job) => (
              <div key={job.id} className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-zinc-200">{job.profile}</span>
                  <StatusBadge status={job.status} />
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
                  <div
                    className="h-full rounded-full bg-violet-500 transition-all"
                    style={{ width: `${job.progress}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-zinc-500">{job.progress}% complete</p>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'captions' && (
        <div className="flex h-32 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-sm text-zinc-500">
          Caption management coming soon
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="flex h-32 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-sm text-zinc-500">
          Video-level analytics — views: {video.views.toLocaleString()}
        </div>
      )}

      {activeTab === 'feeds' && (
        <div className="flex h-32 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-sm text-zinc-500">
          Feed membership management coming soon
        </div>
      )}
    </div>
  );
}
