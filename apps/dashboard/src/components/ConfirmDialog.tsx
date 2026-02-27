import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  variant?: 'danger' | 'warning';
  loading?: boolean;
}

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  variant = 'danger',
  loading,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onClose} size="sm">
      <div className="flex flex-col items-center text-center">
        <div
          className={`mb-4 flex h-12 w-12 items-center justify-center rounded-full ${
            variant === 'danger' ? 'bg-red-500/15' : 'bg-amber-500/15'
          }`}
        >
          <AlertTriangle
            className={`h-6 w-6 ${
              variant === 'danger' ? 'text-red-400' : 'text-amber-400'
            }`}
          />
        </div>
        <h3 className="mb-2 text-lg font-semibold text-zinc-100">{title}</h3>
        <p className="mb-6 text-sm text-zinc-400">{message}</p>
        <div className="flex w-full gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-700"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-colors disabled:opacity-50 ${
              variant === 'danger'
                ? 'bg-red-600 hover:bg-red-500'
                : 'bg-amber-600 hover:bg-amber-500'
            }`}
          >
            {loading ? 'Processing…' : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
