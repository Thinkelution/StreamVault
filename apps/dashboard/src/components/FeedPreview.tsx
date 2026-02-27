import { Code } from 'lucide-react';

interface FeedPreviewProps {
  content: string;
  type: 'mrss' | 'json' | 'atom';
}

export default function FeedPreview({ content, type }: FeedPreviewProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-zinc-800">
      <div className="flex items-center gap-2 border-b border-zinc-800 bg-zinc-900 px-4 py-2.5">
        <Code className="h-4 w-4 text-zinc-500" />
        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
          {type} Preview
        </span>
      </div>
      <pre className="max-h-96 overflow-auto bg-zinc-950 p-4 text-xs leading-relaxed text-zinc-400">
        <code>{content}</code>
      </pre>
    </div>
  );
}
