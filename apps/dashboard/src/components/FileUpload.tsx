import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Film } from 'lucide-react';
import clsx from 'clsx';

interface FileUploadProps {
  onFiles: (files: File[]) => void;
  accept?: Record<string, string[]>;
  maxFiles?: number;
  className?: string;
}

export default function FileUpload({
  onFiles,
  accept = { 'video/*': ['.mp4', '.mov', '.avi', '.mkv', '.webm'] },
  maxFiles = 10,
  className,
}: FileUploadProps) {
  const onDrop = useCallback(
    (accepted: File[]) => {
      if (accepted.length) onFiles(accepted);
    },
    [onFiles],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles,
  });

  return (
    <div
      {...getRootProps()}
      className={clsx(
        'flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 transition-all',
        isDragActive
          ? 'border-violet-500 bg-violet-500/5'
          : 'border-zinc-700 bg-zinc-900 hover:border-zinc-600',
        className,
      )}
    >
      <input {...getInputProps()} />
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-800">
        {isDragActive ? (
          <Film className="h-8 w-8 text-violet-400" />
        ) : (
          <Upload className="h-8 w-8 text-zinc-500" />
        )}
      </div>
      <p className="mb-1 text-sm font-medium text-zinc-200">
        {isDragActive ? 'Drop files here' : 'Drag & drop video files'}
      </p>
      <p className="text-xs text-zinc-500">
        or click to browse · MP4, MOV, AVI, MKV, WebM
      </p>
    </div>
  );
}
