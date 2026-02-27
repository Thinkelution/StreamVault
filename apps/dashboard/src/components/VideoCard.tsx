import { Play, Eye, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Video } from '../api/client';
import StatusBadge from './StatusBadge';

function formatDuration(seconds?: number) {
  if (!seconds) return '--:--';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

interface VideoCardProps {
  video: Video;
}

export default function VideoCard({ video }: VideoCardProps) {
  return (
    <Link
      to={`/videos/${video.id}`}
      className="group overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 transition-all hover:border-zinc-700 hover:shadow-lg"
    >
      <div className="relative aspect-video bg-zinc-800">
        {video.thumbnail ? (
          <img
            src={video.thumbnail}
            alt={video.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Play className="h-10 w-10 text-zinc-600" />
          </div>
        )}
        <div className="absolute bottom-2 right-2 rounded bg-black/75 px-1.5 py-0.5 text-xs font-medium text-white">
          {formatDuration(video.duration)}
        </div>
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/30 group-hover:opacity-100">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-600/90">
            <Play className="h-5 w-5 text-white" fill="white" />
          </div>
        </div>
      </div>
      <div className="p-4">
        <div className="mb-2 flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 text-sm font-medium text-zinc-100">
            {video.title}
          </h3>
          <StatusBadge status={video.status} />
        </div>
        <div className="flex items-center gap-3 text-xs text-zinc-500">
          <span className="flex items-center gap-1">
            <Eye className="h-3 w-3" /> {video.views.toLocaleString()}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" /> {formatDuration(video.duration)}
          </span>
        </div>
      </div>
    </Link>
  );
}
