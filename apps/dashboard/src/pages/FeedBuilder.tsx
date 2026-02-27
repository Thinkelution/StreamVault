import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, Loader2, Eye, ArrowLeft, CheckCircle } from 'lucide-react';
import { useFeed, useCreateFeed, useUpdateFeed } from '../hooks/useFeeds';
import FeedPreview from '../components/FeedPreview';
import toast from 'react-hot-toast';

export default function FeedBuilder() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;
  const { data: existing } = useFeed(id);
  const createFeed = useCreateFeed();
  const updateFeed = useUpdateFeed();

  const [form, setForm] = useState({
    name: '',
    type: 'mrss' as 'mrss' | 'json' | 'atom',
    description: '',
    sortOrder: 'newest' as 'newest' | 'oldest' | 'popular',
    itemLimit: 50,
    status: 'active' as 'active' | 'inactive',
  });
  const [showPreview, setShowPreview] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (existing && !initialized) {
      setForm({
        name: existing.name,
        type: existing.type,
        description: existing.description ?? '',
        sortOrder: existing.sortOrder,
        itemLimit: existing.itemLimit,
        status: existing.status,
      });
      setInitialized(true);
    }
  }, [existing, initialized]);

  const handleSave = () => {
    if (!form.name.trim()) {
      toast.error('Feed name is required');
      return;
    }
    if (isEdit && id) {
      updateFeed.mutate({ id, data: form }, { onSuccess: () => navigate('/feeds') });
    } else {
      createFeed.mutate(form, { onSuccess: () => navigate('/feeds') });
    }
  };

  const saving = createFeed.isPending || updateFeed.isPending;

  const samplePreview =
    form.type === 'json'
      ? JSON.stringify(
          {
            feed: { name: form.name, type: form.type, items: [] },
          },
          null,
          2,
        )
      : form.type === 'atom'
        ? `<?xml version="1.0" encoding="UTF-8"?>\n<feed xmlns="http://www.w3.org/2005/Atom">\n  <title>${form.name}</title>\n  <link href="..."/>\n</feed>`
        : `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:media="http://search.yahoo.com/mrss/">\n  <channel>\n    <title>${form.name}</title>\n  </channel>\n</rss>`;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/feeds')}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h1 className="text-2xl font-bold text-zinc-100">
          {isEdit ? 'Edit Feed' : 'Create Feed'}
        </h1>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => setShowPreview((v) => !v)}
            className="flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-700"
          >
            <Eye className="h-4 w-4" /> Preview
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500 disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Feed
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-5">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
            <h3 className="mb-4 text-sm font-semibold text-zinc-300">Feed Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-300">Name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="My Video Feed"
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3.5 py-2.5 text-sm text-zinc-100 outline-none focus:border-violet-500"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-300">Type</label>
                <div className="flex gap-2">
                  {(['mrss', 'json', 'atom'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setForm((f) => ({ ...f, type: t }))}
                      className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                        form.type === t
                          ? 'border-violet-500 bg-violet-500/10 text-violet-400'
                          : 'border-zinc-700 bg-zinc-800 text-zinc-400 hover:border-zinc-600'
                      }`}
                    >
                      {t.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-300">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  rows={3}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3.5 py-2.5 text-sm text-zinc-100 outline-none focus:border-violet-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-zinc-300">Sort Order</label>
                  <select
                    value={form.sortOrder}
                    onChange={(e) => setForm((f) => ({ ...f, sortOrder: e.target.value as typeof form.sortOrder }))}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3.5 py-2.5 text-sm text-zinc-100 outline-none focus:border-violet-500"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="popular">Most Popular</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-zinc-300">Item Limit</label>
                  <input
                    type="number"
                    value={form.itemLimit}
                    onChange={(e) => setForm((f) => ({ ...f, itemLimit: Number(e.target.value) }))}
                    min={1}
                    max={500}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3.5 py-2.5 text-sm text-zinc-100 outline-none focus:border-violet-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
            <h3 className="mb-4 text-sm font-semibold text-zinc-300">Content Source</h3>
            <p className="text-sm text-zinc-500">
              Videos matching your filters will automatically be included in this feed.
            </p>
            <div className="mt-3 flex items-center gap-2 rounded-lg border border-emerald-500/25 bg-emerald-500/5 px-3 py-2 text-sm text-emerald-400">
              <CheckCircle className="h-4 w-4" />
              All published videos (default)
            </div>
          </div>
        </div>

        <div>
          {showPreview && <FeedPreview content={samplePreview} type={form.type} />}
          {!showPreview && (
            <div className="flex h-full min-h-[300px] items-center justify-center rounded-xl border border-dashed border-zinc-800 text-sm text-zinc-500">
              Click "Preview" to see the feed output
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
