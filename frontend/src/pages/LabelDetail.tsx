import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { ArrowLeft, Eye, Users, Bot, Copy, Check } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { fetchLabelStats, ApiError } from "../api/client";
import type { LabelStats } from "../api/types";
import { KpiCard } from "../components/KpiCard";
import { Spinner } from "../components/Spinner";
import { ErrorMessage } from "../components/ErrorMessage";

export function LabelDetail() {
  const { name } = useParams<{ name: string }>();
  const [data, setData] = useState<LabelStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  function load() {
    if (!name) return;
    setLoading(true);
    setError(null);
    fetchLabelStats(name)
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
  }, [name]);

  if (loading) return <Spinner />;
  if (error) return <ErrorMessage message={error} onRetry={load} />;
  if (!data) return null;

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      {/* Back + title */}
      <div className="mb-6 flex items-center gap-3">
        <Link
          to="/"
          className="flex items-center justify-center rounded-[var(--radius-sm)] p-1 text-[var(--color-ink-tertiary)] transition-colors duration-150 hover:bg-[var(--color-surface-2)] hover:text-[var(--color-ink)]"
        >
          <ArrowLeft size={16} />
        </Link>
        <h1 className="font-mono text-lg font-semibold tracking-tight text-[var(--color-ink)]">
          {data.label}
        </h1>
      </div>

      {/* KPIs */}
      <div className="mb-6 grid grid-cols-3 gap-3">
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
        <Section title="Timeline">
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.timeline} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
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

      {/* 2x2 Grid: Countries, Devices, Browsers, Referers */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        {data.countries.length > 0 && (
          <Section title="Countries">
            <DataTable
              rows={data.countries}
              labelKey="country"
              valueKey="visits"
              total={data.total}
            />
          </Section>
        )}
        {data.devices.length > 0 && (
          <Section title="Devices">
            <DataTable
              rows={data.devices}
              labelKey="deviceType"
              valueKey="visits"
              total={data.total}
            />
          </Section>
        )}
        {data.browsers.length > 0 && (
          <Section title="Browsers">
            <DataTable
              rows={data.browsers}
              labelKey="browser"
              valueKey="visits"
              total={data.total}
            />
          </Section>
        )}
        {data.referers.length > 0 && (
          <Section title="Referers">
            <DataTable
              rows={data.referers}
              labelKey="referer"
              valueKey="visits"
              total={data.total}
            />
          </Section>
        )}
      </div>

      {/* Bots */}
      {data.topBots.length > 0 && (
        <div className="mt-3">
          <Section title="Bots Detected">
            <DataTable
              rows={data.topBots}
              labelKey="botName"
              valueKey="visits"
              total={data.bots}
            />
          </Section>
        </div>
      )}

      {/* Embed snippets */}
      <div className="mt-6">
        <Section title="Embed">
          <div className="space-y-3">
            <SnippetBlock
              label="Pixel (Markdown)"
              code={`![](${window.location.origin}/pixel/${data.label}.gif)`}
            />
            <SnippetBlock
              label="Badge (Markdown)"
              code={`![visitors](${window.location.origin}/badge/${data.label}.svg)`}
            />
            <SnippetBlock
              label="HTML"
              code={`<img src="${window.location.origin}/pixel/${data.label}.gif" alt="" width="1" height="1" />`}
            />
          </div>
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

function DataTable<T extends Record<string, unknown>>({
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
  return (
    <div className="space-y-1.5">
      {rows.slice(0, 8).map((row, i) => {
        const label = String(row[labelKey]);
        const value = Number(row[valueKey]);
        const pct = total > 0 ? (value / total) * 100 : 0;
        return (
          <div key={i} className="group relative">
            {/* Progress bar background */}
            <div
              className="absolute inset-0 rounded-[var(--radius-sm)] bg-[var(--color-signal-muted)] opacity-40"
              style={{ width: `${Math.max(pct, 2)}%` }}
            />
            <div className="relative flex items-center justify-between px-2 py-1">
              <span className="truncate text-xs text-[var(--color-ink)]">
                {label}
              </span>
              <span className="ml-3 shrink-0 font-mono text-xs tabular-nums text-[var(--color-ink-secondary)]">
                {value.toLocaleString()}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SnippetBlock({ label, code }: { label: string; code: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <span className="text-[11px] text-[var(--color-ink-tertiary)]">{label}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-[11px] text-[var(--color-ink-tertiary)] transition-colors duration-150 hover:text-[var(--color-ink-secondary)]"
        >
          {copied ? <Check size={11} /> : <Copy size={11} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto rounded-[var(--radius-sm)] border border-[var(--color-edge)] bg-[var(--color-surface-inset)] px-3 py-2 font-mono text-xs text-[var(--color-ink-secondary)]">
        {code}
      </pre>
    </div>
  );
}
