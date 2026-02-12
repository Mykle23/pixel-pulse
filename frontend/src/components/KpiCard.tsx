interface KpiCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  accentClass?: string;
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 10_000) return `${(n / 1_000).toFixed(1)}k`;
  return n.toLocaleString();
}

export function KpiCard({ label, value, icon, accentClass = "text-[var(--color-signal-text)]" }: KpiCardProps) {
  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--color-edge)] bg-[var(--color-surface-1)] px-3 py-3 sm:px-4 sm:py-4">
      <div className="mb-2 flex items-center gap-1.5 sm:mb-3 sm:gap-2">
        <span className={`${accentClass}`}>{icon}</span>
        <span className="truncate text-[10px] font-medium uppercase tracking-wider text-[var(--color-ink-tertiary)] sm:text-xs">
          {label}
        </span>
      </div>
      <span className="font-mono text-xl font-semibold tabular-nums text-[var(--color-ink)] sm:text-2xl">
        {formatNumber(value)}
      </span>
    </div>
  );
}
