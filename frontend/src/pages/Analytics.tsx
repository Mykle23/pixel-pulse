import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import { ResponsiveTreeMap } from "@nivo/treemap";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";
import {
  BarChart3,
  Eye,
  Users,
  Bot,
  Shield,
  Tag,
  Globe,
  Clock,
} from "lucide-react";
import { fetchAnalytics, ApiError } from "../api/client";
import type { AnalyticsData } from "../api/types";
import { KpiCard } from "../components/KpiCard";
import { Spinner } from "../components/Spinner";
import { ErrorMessage } from "../components/ErrorMessage";
import { ALPHA2_TO_NUMERIC, COUNTRY_NAMES } from "../lib/country-codes";

/* ------------------------------------------------------------------ */
/* Constants                                                           */
/* ------------------------------------------------------------------ */

const GEO_URL =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const CHART_COLORS = [
  "#06b6d4", "#8b5cf6", "#f59e0b", "#ef4444",
  "#10b981", "#f97316", "#3b82f6", "#ec4899",
  "#14b8a6", "#a855f7",
];

const PIE_COLORS = [
  "#06b6d4", "#8b5cf6", "#f59e0b", "#ef4444", "#10b981",
  "#f97316", "#3b82f6", "#ec4899", "#6366f1", "#84cc16",
];

const DAYS_OPTIONS = [7, 14, 30, 60, 90] as const;

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function growthColor(growth: number): string {
  if (growth > 30) return "#16a34a";
  if (growth > 10) return "#22c55e";
  if (growth > 0) return "#4ade80";
  if (growth === 0) return "#6b7280";
  if (growth > -10) return "#f87171";
  if (growth > -30) return "#ef4444";
  return "#dc2626";
}

function formatNum(n: number | undefined | null): string {
  if (n == null) return "0";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

/* ------------------------------------------------------------------ */
/* Nivo dark theme                                                     */
/* ------------------------------------------------------------------ */

const NIVO_DARK_THEME = {
  text: { fill: "#94a3b8" },
  tooltip: {
    container: {
      background: "#1e293b",
      border: "1px solid #334155",
      borderRadius: 6,
      fontSize: 11,
      color: "#e2e8f0",
    },
  },
  labels: { text: { fill: "#ffffff", fontSize: 11, fontWeight: 600 } },
};

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export function Analytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);
  const [retryKey, setRetryKey] = useState(0);
  const navigate = useNavigate();

  // Reset loading when deps change (state-during-render pattern)
  const fetchKey = `${days}|${retryKey}`;
  const [prevFetchKey, setPrevFetchKey] = useState(fetchKey);
  if (prevFetchKey !== fetchKey) {
    setPrevFetchKey(fetchKey);
    setLoading(true);
    setError(null);
  }

  useEffect(() => {
    let cancelled = false;
    fetchAnalytics(days)
      .then((d) => { if (!cancelled) setData(d); })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 401) {
          navigate("/login");
          return;
        }
        setError(err.message);
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [days, retryKey, navigate]);

  const retry = () => setRetryKey((k) => k + 1);

  // Build country lookup: alpha-2 → visits
  const countryLookup = useMemo(() => {
    if (!data) return new Map<string, number>();
    const m = new Map<string, number>();
    for (const c of data.countries) {
      m.set(c.country, c.visits);
    }
    return m;
  }, [data]);

  // Build numeric → visits lookup for the world map
  const numericVisits = useMemo(() => {
    const m = new Map<string, number>();
    for (const [alpha2, visits] of countryLookup) {
      const num = ALPHA2_TO_NUMERIC[alpha2];
      if (num) m.set(num, visits);
    }
    return m;
  }, [countryLookup]);

  const maxCountryVisits = useMemo(() => {
    let max = 0;
    for (const v of numericVisits.values()) {
      if (v > max) max = v;
    }
    return max;
  }, [numericVisits]);

  // Nivo treemap data
  const treemapData = useMemo(() => {
    if (!data) return { id: "root", children: [] };
    return {
      id: "root",
      children: data.labels.map((l) => ({
        id: l.label,
        value: l.total,
        growth: l.growth,
      })),
    };
  }, [data]);

  if (loading && !data) return <Spinner />;
  if (error && !data) return <ErrorMessage message={error} onRetry={retry} />;
  if (!data) return null;

  return (
    <div className="mx-auto max-w-screen-2xl px-4 py-6 sm:px-6 sm:py-8">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-center gap-2 text-lg font-semibold tracking-tight text-[var(--color-ink)]">
          <BarChart3 size={18} />
          Analytics
        </h1>
        <div className="flex items-center gap-1.5">
          {DAYS_OPTIONS.map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`rounded-[var(--radius-sm)] px-2.5 py-1 text-[11px] font-medium transition-colors duration-150 ${
                days === d
                  ? "bg-[var(--color-signal-muted)] text-[var(--color-signal-text)]"
                  : "text-[var(--color-ink-tertiary)] hover:text-[var(--color-ink-secondary)]"
              }`}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-5 sm:gap-3">
        <KpiCard label="Total Visits" value={data.summary.totalVisits} icon={<Eye size={14} />} />
        <KpiCard label="Unique" value={data.summary.uniqueVisitors} icon={<Users size={14} />} accentClass="text-[var(--color-human-text)]" />
        <KpiCard label="Human" value={data.summary.humanVisits} icon={<Shield size={14} />} accentClass="text-[var(--color-human-text)]" />
        <KpiCard label="Bots" value={data.summary.botVisits} icon={<Bot size={14} />} accentClass="text-[var(--color-bot-text)]" />
        <KpiCard label="Labels" value={data.summary.totalLabels} icon={<Tag size={14} />} />
      </div>

      {/* ────────── Row 2: Timeline + Label Heatmap ────────── */}
      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-[2fr_1fr]">
        {/* Timeline */}
        {data.timeline.length > 1 ? (
          <Section title="Visits Timeline" icon={<Clock size={12} />}>
            <ResponsiveContainer width="100%" height={280} minWidth={0}>
              <AreaChart data={data.timeline} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-edge)" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: "var(--color-ink-tertiary)" }}
                  tickFormatter={(d: string) => d.slice(5)}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "var(--color-ink-tertiary)" }}
                  width={40}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-surface-2)",
                    border: "1px solid var(--color-edge)",
                    borderRadius: 6,
                    fontSize: 11,
                  }}
                />
                {data.topLabels.map((label, i) => (
                  <Area
                    key={label}
                    type="monotone"
                    dataKey={label}
                    stackId="1"
                    stroke={CHART_COLORS[i % CHART_COLORS.length]}
                    fill={CHART_COLORS[i % CHART_COLORS.length]}
                    fillOpacity={0.6}
                  />
                ))}
                <Area
                  type="monotone"
                  dataKey="other"
                  stackId="1"
                  stroke="#6b7280"
                  fill="#6b7280"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Section>
        ) : (
          <Section title="Visits Timeline" icon={<Clock size={12} />}>
            <p className="py-12 text-center text-[11px] text-[var(--color-ink-muted)]">
              Not enough data for timeline
            </p>
          </Section>
        )}

        {/* Label Heatmap (nivo Treemap) */}
        {data.labels.length > 0 ? (
          <Section title="Label Heatmap" icon={<BarChart3 size={12} />}>
            <div style={{ height: 280 }}>
              <ResponsiveTreeMap
                data={treemapData}
                identity="id"
                value="value"
                leavesOnly
                innerPadding={3}
                outerPadding={2}
                label={(node) => {
                  const g = (node.data as { growth?: number }).growth ?? 0;
                  return `${node.id} (${formatNum(node.value)}${g !== 0 ? `, ${g > 0 ? "+" : ""}${g}%` : ""})`;
                }}
                labelSkipSize={32}
                colors={(node) => {
                  const g = (node.data as { growth?: number }).growth ?? 0;
                  return growthColor(g);
                }}
                borderWidth={1}
                borderColor="var(--color-canvas)"
                theme={NIVO_DARK_THEME}
                tooltip={({ node }) => {
                  const g = (node.data as { growth?: number }).growth ?? 0;
                  return (
                    <div
                      style={{
                        background: "#1e293b",
                        border: "1px solid #334155",
                        borderRadius: 6,
                        padding: "6px 10px",
                        fontSize: 11,
                        color: "#e2e8f0",
                      }}
                    >
                      <strong>{node.id}</strong>
                      <br />
                      Visits: {formatNum(node.value)}
                      <br />
                      Growth:{" "}
                      <span style={{ color: g >= 0 ? "#4ade80" : "#f87171" }}>
                        {g >= 0 ? "+" : ""}{g}%
                      </span>
                    </div>
                  );
                }}
              />
            </div>
          </Section>
        ) : (
          <Section title="Label Heatmap" icon={<BarChart3 size={12} />}>
            <p className="py-12 text-center text-[11px] text-[var(--color-ink-muted)]">
              No labels yet
            </p>
          </Section>
        )}
      </div>

      {/* ────────── Row 3: World Map + Distribution Pies ────────── */}
      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-[3fr_2fr]">
        {/* World Map */}
        <Section title="Geographic Distribution" icon={<Globe size={12} />}>
          {data.countries.length > 0 ? (
            <>
              <div style={{ width: "100%", height: 340 }}>
                <ComposableMap
                  projectionConfig={{ scale: 147 }}
                  style={{ width: "100%", height: "100%" }}
                >
                  <ZoomableGroup>
                    <Geographies geography={GEO_URL}>
                      {({ geographies }) =>
                        geographies.map((geo) => {
                          const numId = geo.id as string;
                          const visits = numericVisits.get(numId) ?? 0;
                          const intensity =
                            maxCountryVisits > 0
                              ? Math.min(visits / maxCountryVisits, 1)
                              : 0;
                          return (
                            <Geography
                              key={geo.rsmKey}
                              geography={geo}
                              fill={
                                visits > 0
                                  ? `rgba(6,182,212,${0.15 + intensity * 0.85})`
                                  : "var(--color-surface-2)"
                              }
                              stroke="var(--color-edge)"
                              strokeWidth={0.4}
                              style={{
                                hover: { fill: "#06b6d4", outline: "none" },
                                pressed: { outline: "none" },
                                default: { outline: "none" },
                              }}
                            />
                          );
                        })
                      }
                    </Geographies>
                  </ZoomableGroup>
                </ComposableMap>
              </div>
              {/* Country list below map */}
              <div className="mt-3 flex flex-wrap gap-2">
                {data.countries.slice(0, 20).map((c) => (
                  <span
                    key={c.country}
                    className="inline-flex items-center gap-1 rounded-[var(--radius-sm)] bg-[var(--color-surface-2)] px-2 py-1 text-[10px] font-medium text-[var(--color-ink-secondary)]"
                  >
                    <span className="font-mono">{c.country}</span>
                    <span className="text-[var(--color-ink-muted)]">
                      {COUNTRY_NAMES[c.country] ?? ""}
                    </span>
                    <span className="ml-0.5 font-mono text-[var(--color-signal-text)]">
                      {formatNum(c.visits)}
                    </span>
                  </span>
                ))}
              </div>
            </>
          ) : (
            <p className="py-12 text-center text-[11px] text-[var(--color-ink-muted)]">
              No geographic data
            </p>
          )}
        </Section>

        {/* Distribution: Browser / OS / Device — stacked vertically */}
        <div className="space-y-4">
          <PieSection title="Browsers" data={data.browsers} />
          <PieSection title="Operating Systems" data={data.operatingSystems} />
          <PieSection title="Devices" data={data.devices} />
        </div>
      </div>

      {/* ────────── Row 4: Hourly Activity + Top Referrers ────────── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Hourly */}
        <Section title="Hourly Activity" icon={<Clock size={12} />}>
          <ResponsiveContainer width="100%" height={200} minWidth={0}>
            <BarChart data={data.hourly} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-edge)" />
              <XAxis
                dataKey="hour"
                tick={{ fontSize: 10, fill: "var(--color-ink-tertiary)" }}
                tickFormatter={(h: number) => `${h}h`}
              />
              <YAxis tick={{ fontSize: 10, fill: "var(--color-ink-tertiary)" }} width={35} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-surface-2)",
                  border: "1px solid var(--color-edge)",
                  borderRadius: 6,
                  fontSize: 11,
                }}
                labelFormatter={(h) => `${h}:00 – ${Number(h) + 0}:59`}
              />
              <Bar dataKey="visits" fill="#06b6d4" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Section>

        {/* Referrers */}
        <Section title="Top Referrers">
          {data.referers.length === 0 ? (
            <p className="py-6 text-center text-[11px] text-[var(--color-ink-muted)]">
              No referrer data
            </p>
          ) : (
            <div className="space-y-1.5">
              {data.referers.slice(0, 10).map((r, i) => {
                const maxVisits = data.referers[0]?.visits ?? 1;
                const pct = (r.visits / maxVisits) * 100;
                return (
                  <div key={r.name} className="flex items-center gap-2">
                    <span className="w-4 shrink-0 text-right text-[10px] tabular-nums text-[var(--color-ink-muted)]">
                      {i + 1}
                    </span>
                    <div className="relative min-w-0 flex-1">
                      <div
                        className="absolute inset-y-0 left-0 rounded-[var(--radius-sm)] bg-[var(--color-signal-muted)]"
                        style={{ width: `${pct}%` }}
                      />
                      <span className="relative z-10 block truncate px-2 py-1 text-[11px] text-[var(--color-ink)]">
                        {r.name}
                      </span>
                    </div>
                    <span className="shrink-0 font-mono text-[11px] tabular-nums text-[var(--color-ink-secondary)]">
                      {formatNum(r.visits)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </Section>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Sub-components                                                      */
/* ------------------------------------------------------------------ */

function Section({
  title,
  icon,
  className = "",
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-[var(--radius-md)] border border-[var(--color-edge)] bg-[var(--color-surface-1)] px-4 py-4 sm:px-5 sm:py-5 ${className}`}
    >
      <h2 className="mb-4 flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-[var(--color-ink-tertiary)]">
        {icon}
        {title}
      </h2>
      {children}
    </div>
  );
}

/* ── Pie chart section ── */

function PieSection({
  title,
  data,
}: {
  title: string;
  data: Array<{ name: string; visits: number }>;
}) {
  const total = data.reduce((s, d) => s + d.visits, 0);

  return (
    <Section title={title}>
      {data.length === 0 ? (
        <p className="py-6 text-center text-[11px] text-[var(--color-ink-muted)]">No data</p>
      ) : (
        <div className="flex items-center gap-4">
          <ResponsiveContainer width={120} height={120} minWidth={0}>
            <PieChart>
              <Pie
                data={data.slice(0, 8)}
                dataKey="visits"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={30}
                outerRadius={55}
                paddingAngle={2}
                strokeWidth={0}
              >
                {data.slice(0, 8).map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="min-w-0 flex-1 space-y-1">
            {data.slice(0, 6).map((d, i) => {
              const pct = total > 0 ? Math.round((d.visits / total) * 100) : 0;
              return (
                <div key={d.name} className="flex items-center gap-2 text-[11px]">
                  <span
                    className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                  />
                  <span className="min-w-0 flex-1 truncate text-[var(--color-ink-secondary)]">
                    {d.name}
                  </span>
                  <span className="shrink-0 tabular-nums text-[var(--color-ink-tertiary)]">
                    {pct}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Section>
  );
}
