interface KpiCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  accentClass?: string;
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return n.toLocaleString();
}

export function KpiCard({ label, value, icon, accentClass = "text-[var(--color-signal-text)]" }: KpiCardProps) {
  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--color-edge)] bg-[var(--color-surface-1)] px-4 py-4">
      <div className="mb-3 flex items-center gap-2">
        <span className={`${accentClass}`}>{icon}</span>
        <span className="text-xs font-medium text-[var(--color-ink-tertiary)] uppercase tracking-wider">
          {label}
        </span>
      </div>
      <span className="font-mono text-2xl font-semibold tabular-nums text-[var(--color-ink)]">
        {formatNumber(value)}
      </span>
    </div>
  );
}
