import { useEffect, useState, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router";
import {
  ArrowLeft,
  Eye,
  Users,
  Bot,
  RefreshCw,
  Calendar,
  Trash2,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { fetchLabelStats, deleteLabel, ApiError } from "../api/client";
import type { LabelStats } from "../api/types";
import { KpiCard } from "../components/KpiCard";
import { Spinner } from "../components/Spinner";
import { ErrorMessage } from "../components/ErrorMessage";
import { BadgePreview } from "../components/BadgePreview";
import { getIconMapper } from "../lib/icons";

const DATE_RANGES = {
  "7d": { label: "7d", days: 7 },
  "30d": { label: "30d", days: 30 },
  "90d": { label: "90d", days: 90 },
  all: { label: "All", days: 0 },
} as const;

type RangeKey = keyof typeof DATE_RANGES;

export function LabelDetail() {
  const { name } = useParams<{ name: string }>();
  const [data, setData] = useState<LabelStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<RangeKey>("all");
  const [autoRefresh, setAutoRefresh] = useState(false);
  const navigate = useNavigate();

  const load = useCallback(() => {
    if (!name) return;
    setLoading(true);
    setError(null);

    const params: { from?: string } = {};
    const days = DATE_RANGES[range].days;
    if (days > 0) {
      const from = new Date();
      from.setDate(from.getDate() - days);
      params.from = from.toISOString().split("T")[0];
    }

    fetchLabelStats(name, params)
      .then(setData)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          navigate("/login");
          return;
        }
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [name, range, navigate]);

  useEffect(() => {
    load();
  }, [load]);

  // Auto-refresh: immediate fetch on toggle + interval
  useEffect(() => {
    if (!autoRefresh) return;
    load();
    const interval = setInterval(load, 15_000);
    return () => clearInterval(interval);
  }, [autoRefresh]); // intentionally exclude `load`

  if (loading && !data) return <Spinner />;
  if (error && !data) return <ErrorMessage message={error} onRetry={load} />;
  if (!data) return null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
      {/* Header row */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="flex items-center justify-center rounded-[var(--radius-sm)] p-1 text-[var(--color-ink-tertiary)] transition-colors duration-150 hover:bg-[var(--color-surface-2)] hover:text-[var(--color-ink)]"
          >
            <ArrowLeft size={16} />
          </Link>
          <h1 className="font-mono text-lg font-semibold tracking-tight text-[var(--color-ink)]">
            {data.label}
          </h1>
          <button
            onClick={() => {
              if (
                confirm(
                  `Delete all visits for "${data.label}"? This cannot be undone.`
                )
              ) {
                deleteLabel(data.label).then(() => navigate("/"));
              }
            }}
            className="rounded-[var(--radius-sm)] p-1 text-[var(--color-ink-muted)] transition-colors duration-150 hover:bg-[var(--color-danger-muted)] hover:text-[var(--color-danger)]"
            title="Delete this label"
            aria-label="Delete this label"
          >
            <Trash2 size={14} />
          </button>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* Date range selector */}
          <div className="flex items-center gap-0.5 rounded-[var(--radius-md)] border border-[var(--color-edge)] bg-[var(--color-surface-1)] p-0.5">
            <Calendar size={11} className="ml-1.5 text-[var(--color-ink-muted)]" />
            {(Object.keys(DATE_RANGES) as RangeKey[]).map((key) => (
              <button
                key={key}
                onClick={() => setRange(key)}
                className={`rounded-[var(--radius-sm)] px-1.5 py-1 text-[10px] font-medium transition-colors duration-150 sm:px-2 sm:text-[11px] ${
                  range === key
                    ? "bg-[var(--color-signal-muted)] text-[var(--color-signal-text)]"
                    : "text-[var(--color-ink-tertiary)] hover:text-[var(--color-ink-secondary)]"
                }`}
              >
                {DATE_RANGES[key].label}
              </button>
            ))}
          </div>

          {/* Auto-refresh toggle */}
          <button
            onClick={() => setAutoRefresh((prev) => !prev)}
            className={`flex items-center gap-1.5 rounded-[var(--radius-md)] border px-2 py-1.5 text-[10px] font-medium transition-colors duration-150 sm:px-2.5 sm:text-[11px] ${
              autoRefresh
                ? "border-[var(--color-signal)] bg-[var(--color-signal-muted)] text-[var(--color-signal-text)]"
                : "border-[var(--color-edge)] text-[var(--color-ink-tertiary)] hover:text-[var(--color-ink-secondary)]"
            }`}
            title={autoRefresh ? "Stop auto-refresh" : "Auto-refresh every 15s"}
          >
            <RefreshCw
              size={11}
              className={autoRefresh ? "animate-spin" : ""}
              style={autoRefresh ? { animationDuration: "3s" } : undefined}
            />
            Live
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="mb-6 grid grid-cols-3 gap-2 sm:gap-3">
        <KpiCard label="Total Visits" value={data.total} icon={<Eye size={14} />} />
        <KpiCard
          label="Unique Visitors"
          value={data.unique}
          icon={<Users size={14} />}
          accentClass="text-[var(--color-human-text)]"
        />
        <KpiCard
          label="Bot Visits"
          value={data.bots}
          icon={<Bot size={14} />}
          accentClass="text-[var(--color-bot-text)]"
        />
      </div>

      {/* Timeline */}
      {data.timeline.length > 0 && (
        <Section title="📈 Timeline">
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data.timeline}
                margin={{ top: 4, right: 4, bottom: 0, left: -20 }}
              >
                <defs>
                  <linearGradient id="visitGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="uniqueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22c55e" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  tick={{ fill: "#6b6b78", fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v: string) => v.slice(5)}
                />
                <YAxis
                  tick={{ fill: "#6b6b78", fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "#16161f",
                    border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: 6,
                    fontSize: 12,
                    color: "#e8e8ed",
                  }}
                  labelStyle={{ color: "#9d9daa" }}
                />
                <Area
                  type="monotone"
                  dataKey="visits"
                  stroke="#3b82f6"
                  strokeWidth={1.5}
                  fill="url(#visitGrad)"
                  name="Visits"
                />
                <Area
                  type="monotone"
                  dataKey="unique"
                  stroke="#22c55e"
                  strokeWidth={1.5}
                  fill="url(#uniqueGrad)"
                  name="Unique"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Section>
      )}

      {/* Data grids */}
      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
        {data.countries.length > 0 && (
          <Section title="🌍 Countries">
            <DataTable
              rows={data.countries}
              labelKey="country"
              valueKey="visits"
              total={data.total}
            />
          </Section>
        )}
        {data.devices.length > 0 && (
          <Section title="📱 Devices">
            <DataTable
              rows={data.devices}
              labelKey="deviceType"
              valueKey="visits"
              total={data.total}
            />
          </Section>
        )}
        {data.browsers.length > 0 && (
          <Section title="🌐 Browsers">
            <DataTable
              rows={data.browsers}
              labelKey="browser"
              valueKey="visits"
              total={data.total}
            />
          </Section>
        )}
        {data.operatingSystems.length > 0 && (
          <Section title="💻 Operating Systems">
            <DataTable
              rows={data.operatingSystems}
              labelKey="os"
              valueKey="visits"
              total={data.total}
            />
          </Section>
        )}
      </div>

      {/* Referers + Bots */}
      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
        {data.referers.length > 0 && (
          <Section title="🔗 Referers">
            <DataTable
              rows={data.referers}
              labelKey="referer"
              valueKey="visits"
              total={data.total}
            />
          </Section>
        )}
        {data.topBots.length > 0 && (
          <Section title="🤖 Bots Detected">
            <DataTable
              rows={data.topBots}
              labelKey="botName"
              valueKey="visits"
              total={data.bots}
            />
          </Section>
        )}
      </div>

      {/* Embed (static badge preview + snippets) */}
      <div className="mt-6">
        <BadgePreview label={data.label} />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Sub-components                                                      */
/* ------------------------------------------------------------------ */

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--color-edge)] bg-[var(--color-surface-1)] px-4 py-4">
      <h2 className="mb-3 text-[11px] font-medium uppercase tracking-wider text-[var(--color-ink-tertiary)]">
        {title}
      </h2>
      {children}
    </div>
  );
}

function DataTable<T extends object>({
  rows,
  labelKey,
  valueKey,
  total,
}: {
  rows: T[];
  labelKey: keyof T;
  valueKey: keyof T;
  total: number;
}) {
  const iconMapper = getIconMapper(labelKey as string);

  return (
    <div className="space-y-1.5">
      {rows.slice(0, 8).map((row, i) => {
        const labelText = String(row[labelKey]);
        const value = Number(row[valueKey]);
        const pct = total > 0 ? (value / total) * 100 : 0;
        const icon = iconMapper ? iconMapper(labelText) : null;

        return (
          <div key={i} className="group relative">
            {/* Progress bar background */}
            <div
              className="absolute inset-0 rounded-[var(--radius-sm)] bg-[var(--color-signal-muted)] opacity-40"
              style={{ width: `${Math.max(pct, 2)}%` }}
            />
            <div className="relative flex items-center justify-between px-2 py-1">
              <span className="flex items-center gap-1.5 truncate text-xs text-[var(--color-ink)]">
                {icon && <span className="shrink-0 text-[11px]">{icon}</span>}
                <span className="truncate">{labelText}</span>
              </span>
              <span className="ml-3 flex shrink-0 items-center gap-2">
                <span className="font-mono text-[10px] tabular-nums text-[var(--color-ink-tertiary)]">
                  {pct.toFixed(1)}%
                </span>
                <span className="font-mono text-xs tabular-nums text-[var(--color-ink-secondary)]">
                  {value.toLocaleString()}
                </span>
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

