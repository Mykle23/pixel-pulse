import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { Eye, Users, Bot, ChevronRight } from "lucide-react";
import { fetchOverview, ApiError } from "../api/client";
import type { StatsOverview } from "../api/types";
import { KpiCard } from "../components/KpiCard";
import { SignalDot } from "../components/SignalDot";
import { Spinner } from "../components/Spinner";
import { ErrorMessage } from "../components/ErrorMessage";

export function Dashboard() {
  const [data, setData] = useState<StatsOverview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  function load() {
    setLoading(true);
    setError(null);
    fetchOverview()
      .then(setData)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          navigate("/login");
          return;
        }
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  if (loading) return <Spinner />;
  if (error) return <ErrorMessage message={error} onRetry={load} />;
  if (!data) return null;

  const sortedLabels = [...data.labels].sort((a, b) => b.total - a.total);

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      {/* Page header */}
      <h1 className="mb-6 text-lg font-semibold tracking-tight text-[var(--color-ink)]">
        Overview
      </h1>

      {/* KPIs */}
      <div className="mb-8 grid grid-cols-3 gap-3">
        <KpiCard
          label="Total Visits"
          value={data.totalVisits}
          icon={<Eye size={14} />}
        />
        <KpiCard
          label="Unique Visitors"
          value={data.uniqueVisitors}
          icon={<Users size={14} />}
          accentClass="text-[var(--color-human-text)]"
        />
        <KpiCard
          label="Bot Visits"
          value={data.botVisits}
          icon={<Bot size={14} />}
          accentClass="text-[var(--color-bot-text)]"
        />
      </div>

      {/* Labels table */}
      <div className="rounded-[var(--radius-md)] border border-[var(--color-edge)] bg-[var(--color-surface-1)]">
        {/* Table header */}
        <div className="grid grid-cols-[1fr_100px_100px_100px_28px] items-center gap-3 border-b border-[var(--color-edge)] px-4 py-2.5">
          <span className="text-[11px] font-medium uppercase tracking-wider text-[var(--color-ink-tertiary)]">
            Label
          </span>
          <span className="text-right text-[11px] font-medium uppercase tracking-wider text-[var(--color-ink-tertiary)]">
            Total
          </span>
          <span className="text-right text-[11px] font-medium uppercase tracking-wider text-[var(--color-ink-tertiary)]">
            Unique
          </span>
          <span className="text-right text-[11px] font-medium uppercase tracking-wider text-[var(--color-ink-tertiary)]">
            Bots
          </span>
          <span />
        </div>

        {/* Rows */}
        {sortedLabels.length === 0 ? (
          <div className="px-4 py-10 text-center text-sm text-[var(--color-ink-tertiary)]">
            No labels yet. Embed a pixel to start tracking.
          </div>
        ) : (
          sortedLabels.map((item) => (
            <Link
              key={item.label}
              to={`/label/${encodeURIComponent(item.label)}`}
              className="grid grid-cols-[1fr_100px_100px_100px_28px] items-center gap-3 border-b border-[var(--color-edge-subtle)] px-4 py-3 transition-colors duration-150 last:border-b-0 hover:bg-[var(--color-surface-2)]"
            >
              <span className="flex items-center gap-2.5">
                <SignalDot alive={item.total > 0} />
                <span className="truncate font-mono text-sm text-[var(--color-ink)]">
                  {item.label}
                </span>
              </span>
              <span className="text-right font-mono text-sm tabular-nums text-[var(--color-ink)]">
                {item.total.toLocaleString()}
              </span>
              <span className="text-right font-mono text-sm tabular-nums text-[var(--color-human-text)]">
                {item.unique.toLocaleString()}
              </span>
              <span className="text-right font-mono text-sm tabular-nums text-[var(--color-bot-text)]">
                {item.bots.toLocaleString()}
              </span>
              <ChevronRight
                size={14}
                className="text-[var(--color-ink-muted)]"
              />
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
