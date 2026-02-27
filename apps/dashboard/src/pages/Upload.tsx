import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, X, FileVideo, CheckCircle2 } from 'lucide-react';
import { videosApi } from '../api/client';
import FileUpload from '../components/FileUpload';
import toast from 'react-hot-toast';

interface UploadItem {
  file: File;
  title: string;
  description: string;
  progress: number;
  status: 'pending' | 'uploading' | 'done' | 'error';
}

export default function Upload() {
  const navigate = useNavigate();
  const [items, setItems] = useState<UploadItem[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleFiles = (files: File[]) => {
    const newItems: UploadItem[] = files.map((file) => ({
      file,
      title: file.name.replace(/\.[^.]+$/, ''),
      description: '',
      progress: 0,
      status: 'pending',
    }));
    setItems((prev) => [...prev, ...newItems]);
  };

  const updateItem = (idx: number, patch: Partial<UploadItem>) => {
    setItems((prev) => prev.map((item, i) => (i === idx ? { ...item, ...patch } : item)));
  };

  const removeItem = (idx: number) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleUpload = async () => {
    setUploading(true);
    for (let i = 0; i < items.length; i++) {
      if (items[i].status === 'done') continue;
      updateItem(i, { status: 'uploading', progress: 0 });
      try {
        const fd = new FormData();
        fd.append('file', items[i].file);
        fd.append('title', items[i].title);
        fd.append('description', items[i].description);
        await videosApi.upload(fd, (pct) => updateItem(i, { progress: pct }));
        updateItem(i, { status: 'done', progress: 100 });
      } catch {
        updateItem(i, { status: 'error' });
        toast.error(`Failed to upload ${items[i].file.name}`);
      }
    }
    setUploading(false);
    const allDone = items.every((item) => item.status === 'done');
    if (allDone && items.length > 0) {
      toast.success('All uploads complete!');
      setTimeout(() => navigate('/videos'), 1500);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
    return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Upload Videos</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Drag and drop video files or click to browse
        </p>
      </div>

      <FileUpload onFiles={handleFiles} />

      {items.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-zinc-300">
            Files ({items.length})
          </h2>

          {items.map((item, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-zinc-800 bg-zinc-900 p-4"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-800">
                  {item.status === 'done' ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  ) : (
                    <FileVideo className="h-5 w-5 text-zinc-500" />
                  )}
                </div>
                <div className="min-w-0 flex-1 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-zinc-200">
                        {item.file.name}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {formatSize(item.file.size)}
                      </p>
                    </div>
                    {item.status !== 'uploading' && (
                      <button
                        onClick={() => removeItem(idx)}
                        className="text-zinc-500 hover:text-zinc-300"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs text-zinc-500">Title</label>
                      <input
                        value={item.title}
                        onChange={(e) => updateItem(idx, { title: e.target.value })}
                        disabled={item.status === 'uploading' || item.status === 'done'}
                        className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-violet-500 disabled:opacity-50"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-zinc-500">Description</label>
                      <input
                        value={item.description}
                        onChange={(e) => updateItem(idx, { description: e.target.value })}
                        disabled={item.status === 'uploading' || item.status === 'done'}
                        className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-violet-500 disabled:opacity-50"
                      />
                    </div>
                  </div>

                  {(item.status === 'uploading' || item.status === 'done') && (
                    <div>
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-xs text-zinc-500">
                          {item.status === 'done' ? 'Complete' : 'Uploading…'}
                        </span>
                        <span className="text-xs font-medium text-zinc-400">
                          {item.progress}%
                        </span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800">
                        <div
                          className={`h-full rounded-full transition-all ${
                            item.status === 'done' ? 'bg-emerald-500' : 'bg-violet-500'
                          }`}
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {item.status === 'error' && (
                    <p className="text-xs text-red-400">Upload failed. Please try again.</p>
                  )}
                </div>
              </div>
            </div>
          ))}

          <div className="flex justify-end">
            <button
              onClick={handleUpload}
              disabled={uploading || items.every((i) => i.status === 'done')}
              className="flex items-center gap-2 rounded-lg bg-violet-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-violet-500 disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Uploading…
                </>
              ) : (
                'Upload & Process'
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
