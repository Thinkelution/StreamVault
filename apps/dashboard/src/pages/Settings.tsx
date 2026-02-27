import { useState } from 'react';
import { Save, Loader2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsApi, type AppSettings } from '../api/client';
import toast from 'react-hot-toast';

function SettingsSection({
  title,
  description,
  children,
  onSave,
  saving,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  onSave: () => void;
  saving: boolean;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900">
      <div className="border-b border-zinc-800 px-6 py-4">
        <h3 className="text-base font-semibold text-zinc-100">{title}</h3>
        <p className="mt-0.5 text-sm text-zinc-500">{description}</p>
      </div>
      <div className="space-y-4 p-6">{children}</div>
      <div className="flex justify-end border-t border-zinc-800 px-6 py-3">
        <button
          onClick={onSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500 disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save
        </button>
      </div>
    </div>
  );
}

export default function Settings() {
  const qc = useQueryClient();
  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: () => settingsApi.get().then((r) => r.data),
  });

  const [general, setGeneral] = useState({
    siteName: '',
    siteUrl: '',
  });
  const [storage, setStorage] = useState({
    storageProvider: '',
    storageBucket: '',
    maxUploadSize: 0,
  });
  const [transcoding, setTranscoding] = useState({
    transcodingEnabled: true,
    transcodingProfiles: '',
  });

  const [initialized, setInitialized] = useState(false);
  if (settings && !initialized) {
    setGeneral({ siteName: settings.siteName ?? '', siteUrl: settings.siteUrl ?? '' });
    setStorage({
      storageProvider: settings.storageProvider ?? '',
      storageBucket: settings.storageBucket ?? '',
      maxUploadSize: settings.maxUploadSize ?? 0,
    });
    setTranscoding({
      transcodingEnabled: settings.transcodingEnabled ?? true,
      transcodingProfiles: (settings.transcodingProfiles ?? []).join(', '),
    });
    setInitialized(true);
  }

  const update = useMutation({
    mutationFn: (data: Partial<AppSettings>) => settingsApi.update(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['settings'] });
      toast.success('Settings saved');
    },
    onError: () => toast.error('Failed to save settings'),
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-100">Settings</h1>

      <SettingsSection
        title="General"
        description="Basic site configuration"
        onSave={() => update.mutate(general)}
        saving={update.isPending}
      >
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-300">Site Name</label>
          <input
            value={general.siteName}
            onChange={(e) => setGeneral((g) => ({ ...g, siteName: e.target.value }))}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3.5 py-2.5 text-sm text-zinc-100 outline-none focus:border-violet-500"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-300">Site URL</label>
          <input
            value={general.siteUrl}
            onChange={(e) => setGeneral((g) => ({ ...g, siteUrl: e.target.value }))}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3.5 py-2.5 text-sm text-zinc-100 outline-none focus:border-violet-500"
          />
        </div>
      </SettingsSection>

      <SettingsSection
        title="Storage"
        description="Configure file storage backend"
        onSave={() => update.mutate(storage)}
        saving={update.isPending}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-300">Provider</label>
            <select
              value={storage.storageProvider}
              onChange={(e) => setStorage((s) => ({ ...s, storageProvider: e.target.value }))}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3.5 py-2.5 text-sm text-zinc-100 outline-none focus:border-violet-500"
            >
              <option value="s3">Amazon S3</option>
              <option value="gcs">Google Cloud Storage</option>
              <option value="local">Local Filesystem</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-300">Bucket</label>
            <input
              value={storage.storageBucket}
              onChange={(e) => setStorage((s) => ({ ...s, storageBucket: e.target.value }))}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3.5 py-2.5 text-sm text-zinc-100 outline-none focus:border-violet-500"
            />
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-300">
            Max Upload Size (MB)
          </label>
          <input
            type="number"
            value={storage.maxUploadSize}
            onChange={(e) => setStorage((s) => ({ ...s, maxUploadSize: Number(e.target.value) }))}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3.5 py-2.5 text-sm text-zinc-100 outline-none focus:border-violet-500 sm:max-w-xs"
          />
        </div>
      </SettingsSection>

      <SettingsSection
        title="Transcoding"
        description="Video transcoding settings"
        onSave={() =>
          update.mutate({
            transcodingEnabled: transcoding.transcodingEnabled,
            transcodingProfiles: transcoding.transcodingProfiles
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean),
          })
        }
        saving={update.isPending}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() =>
              setTranscoding((t) => ({ ...t, transcodingEnabled: !t.transcodingEnabled }))
            }
            className={`relative h-6 w-11 rounded-full transition-colors ${
              transcoding.transcodingEnabled ? 'bg-violet-600' : 'bg-zinc-700'
            }`}
          >
            <span
              className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                transcoding.transcodingEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
          <span className="text-sm text-zinc-300">
            {transcoding.transcodingEnabled ? 'Enabled' : 'Disabled'}
          </span>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-300">
            Profiles (comma-separated)
          </label>
          <input
            value={transcoding.transcodingProfiles}
            onChange={(e) =>
              setTranscoding((t) => ({ ...t, transcodingProfiles: e.target.value }))
            }
            placeholder="720p, 1080p, 4k"
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3.5 py-2.5 text-sm text-zinc-100 outline-none focus:border-violet-500"
          />
        </div>
      </SettingsSection>
    </div>
  );
}
