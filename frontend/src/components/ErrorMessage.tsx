import { AlertCircle } from "lucide-react";

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20">
      <AlertCircle size={20} className="text-[var(--color-danger)]" />
      <p className="text-sm text-[var(--color-ink-secondary)]">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-xs text-[var(--color-signal-text)] hover:underline"
        >
          Try again
        </button>
      )}
    </div>
  );
}
