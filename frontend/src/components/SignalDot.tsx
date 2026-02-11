/**
 * The signature element: a dot that pulses when there's recent activity.
 * Alive = signal received in the last 24h.
 */
interface SignalDotProps {
  alive?: boolean;
  className?: string;
}

export function SignalDot({ alive = false, className = "" }: SignalDotProps) {
  if (!alive) {
    return (
      <span
        className={`inline-block h-1.5 w-1.5 rounded-full bg-[var(--color-ink-muted)] ${className}`}
      />
    );
  }

  return (
    <span className={`relative inline-flex h-2 w-2 ${className}`}>
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-human)] opacity-40" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--color-human)]" />
    </span>
  );
}
