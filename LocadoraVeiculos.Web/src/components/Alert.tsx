import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

interface AlertProps {
  type: 'error' | 'success' | 'info';
  message: string;
  onClose?: () => void;
}

export function Alert({ type, message, onClose }: AlertProps) {
  const styles = {
    error: 'border-red-200 bg-red-50 text-red-800',
    success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    info: 'border-blue-200 bg-blue-50 text-blue-800',
  }[type];

  const Icon = {
    error: AlertCircle,
    success: CheckCircle2,
    info: Info,
  }[type];

  return (
    <div className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${styles}`}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <div className="flex-1">{message}</div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="rounded p-0.5 opacity-70 transition hover:opacity-100"
          aria-label="Fechar aviso"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
