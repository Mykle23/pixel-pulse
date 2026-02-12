import { useEffect, useState, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router";
import {
  Eye,
  Users,
  Bot,
  ChevronRight,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  RefreshCw,
  Search,
  Trash2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { fetchOverview, deleteLabels, ApiError } from "../api/client";
import type { StatsOverview, LabelSummary } from "../api/types";
import { KpiCard } from "../components/KpiCard";
import { SignalDot } from "../components/SignalDot";
import { Spinner } from "../components/Spinner";
import { ErrorMessage } from "../components/ErrorMessage";
import { BadgeCreator } from "../components/BadgeCreator";
import { countryFlag } from "../lib/icons";

/* ------------------------------------------------------------------ */
/* Constants                                                           */
/* ------------------------------------------------------------------ */

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;

type SortKey = "label" | "total" | "unique" | "bots" | "lastSeen";
type SortDir = "asc" | "desc";

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

function humanPercent(total: number, bots: number): number {
  if (total === 0) return 0;
  return Math.round(((total - bots) / total) * 100);
}

function compareFn(key: SortKey, dir: SortDir) {
  const m = dir === "asc" ? 1 : -1;
  return (a: LabelSummary, b: LabelSummary): number => {
    switch (key) {
      case "label":
        return m * a.label.localeCompare(b.label);
      case "total":
        return m * (a.total - b.total);
      case "unique":
        return m * (a.unique - b.unique);
      case "bots":
        return m * (a.bots - b.bots);
      case "lastSeen":
        return m * (new Date(a.lastSeen).getTime() - new Date(b.lastSeen).getTime());
      default:
        return 0;
    }
  };
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export function Dashboard() {
  const [data, setData] = useState<StatsOverview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const navigate = useNavigate();

  // Table state
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("total");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);

  // Data loading
  const load = useCallback(() => {
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
  }, [navigate]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!autoRefresh) return;
    load();
    const interval = setInterval(load, 15_000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRefresh, load]);

  // Pipeline: filter -> sort -> paginate
  const filtered = useMemo(() => {
    if (!data) return [];
    let result = [...data.labels];

    // Text search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((l) => l.label.toLowerCase().includes(q));
    }

    // Sort
    result.sort(compareFn(sortBy, sortDir));

    return result;
  }, [data, search, sortBy, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginatedLabels = filtered.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize
  );

  // Reset page on filter/sort change
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { setPage(1); }, [search, sortBy, sortDir, pageSize]);

  // Selection helpers
  const allOnPageSelected =
    paginatedLabels.length > 0 &&
    paginatedLabels.every((l) => selected.has(l.label));

  function toggleOne(label: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  }

  function toggleAllOnPage() {
    if (allOnPageSelected) {
      setSelected((prev) => {
        const next = new Set(prev);
        for (const l of paginatedLabels) next.delete(l.label);
        return next;
      });
    } else {
      setSelected((prev) => {
        const next = new Set(prev);
        for (const l of paginatedLabels) next.add(l.label);
        return next;
      });
    }
  }

  function selectAll() {
    setSelected(new Set(filtered.map((l) => l.label)));
  }

  function handleBulkDelete() {
    const labels = Array.from(selected);
    if (labels.length === 0) return;
    if (
      !confirm(
        `Delete all visits for ${labels.length} label${labels.length > 1 ? "s" : ""}? This cannot be undone.`
      )
    ) {
      return;
    }
    setDeleting(true);
    deleteLabels(labels)
      .then(() => {
        setSelected(new Set());
        load();
      })
      .catch((err) => alert(`Failed to delete: ${err.message}`))
      .finally(() => setDeleting(false));
  }

  function handleSortClick(key: SortKey) {
    if (sortBy === key) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(key);
      setSortDir(key === "label" ? "asc" : "desc");
    }
  }

  if (loading && !data) return <Spinner />;
  if (error && !data) return <ErrorMessage message={error} onRetry={load} />;
  if (!data) return null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      {/* Page header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-semibold tracking-tight text-[var(--color-ink)]">
          Overview
        </h1>
        <button
          onClick={() => setAutoRefresh((prev) => !prev)}
          className={`flex items-center gap-1.5 rounded-[var(--radius-md)] border px-2.5 py-1.5 text-[11px] font-medium transition-colors duration-150 ${
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

      {/* KPIs */}
      <div className="mb-6 grid grid-cols-3 gap-2 sm:gap-3">
        <KpiCard label="Total Visits" value={data.totalVisits} icon={<Eye size={14} />} />
        <KpiCard label="Unique Visitors" value={data.uniqueVisitors} icon={<Users size={14} />} accentClass="text-[var(--color-human-text)]" />
        <KpiCard label="Bot Visits" value={data.botVisits} icon={<Bot size={14} />} accentClass="text-[var(--color-bot-text)]" />
      </div>

      {/* Badge Creator */}
      <div className="mb-6">
        <BadgeCreator existingLabels={data.labels.map((l) => l.label)} />
      </div>

      {/* ============================================================= */}
      {/* Labels table                                                    */}
      {/* ============================================================= */}
      <div className="rounded-[var(--radius-md)] border border-[var(--color-edge)] bg-[var(--color-surface-1)]">
        {/* Toolbar: search + filters */}
        <div className="flex flex-wrap items-center gap-2 border-b border-[var(--color-edge)] px-4 py-2">
          <Search size={13} className="shrink-0 text-[var(--color-ink-muted)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter labels..."
            className="min-w-0 flex-1 bg-transparent text-xs text-[var(--color-ink)] outline-none placeholder:text-[var(--color-ink-muted)]"
          />

          {/* Count */}
          <span className="shrink-0 text-[10px] tabular-nums text-[var(--color-ink-tertiary)]">
            {filtered.length} label{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Bulk actions bar */}
        {selected.size > 0 && (
          <div className="flex flex-wrap items-center gap-3 border-b border-[var(--color-edge)] bg-[var(--color-surface-2)] px-4 py-2">
            <span className="text-xs font-medium text-[var(--color-ink)]">
              {selected.size} selected
            </span>
            {selected.size < filtered.length && (
              <button
                onClick={selectAll}
                className="text-[11px] text-[var(--color-signal-text)] hover:underline"
              >
                Select all {filtered.length}
              </button>
            )}
            <button
              onClick={() => setSelected(new Set())}
              className="text-[11px] text-[var(--color-ink-tertiary)] hover:underline"
            >
              Deselect
            </button>
            <button
              onClick={handleBulkDelete}
              disabled={deleting}
              className="ml-auto flex items-center gap-1 rounded-[var(--radius-sm)] bg-[var(--color-danger-muted)] px-2.5 py-1 text-[11px] font-medium text-[var(--color-danger)] transition-colors duration-150 hover:bg-[var(--color-danger)] hover:text-white disabled:opacity-40"
            >
              <Trash2 size={11} />
              Delete {selected.size}
            </button>
          </div>
        )}

        {/* Table header — sortable columns */}
        <div className="grid grid-cols-[28px_1fr_60px_28px] items-center gap-1 border-b border-[var(--color-edge)] px-4 py-2 sm:grid-cols-[28px_1fr_70px_70px_70px_70px_80px_28px] sm:gap-2">
          {/* Checkbox */}
          <label className="flex items-center justify-center">
            <input
              type="checkbox"
              checked={allOnPageSelected && paginatedLabels.length > 0}
              onChange={toggleAllOnPage}
              className="accent-[var(--color-signal)]"
            />
          </label>

          <SortButton column="label" current={sortBy} dir={sortDir} onClick={handleSortClick}>
            Label
          </SortButton>

          <SortButton column="total" current={sortBy} dir={sortDir} onClick={handleSortClick} align="right">
            Total
          </SortButton>

          <SortButton column="unique" current={sortBy} dir={sortDir} onClick={handleSortClick} align="right" className="hidden sm:flex">
            Unique
          </SortButton>

          <SortButton column="bots" current={sortBy} dir={sortDir} onClick={handleSortClick} align="right" className="hidden sm:flex">
            Bots
          </SortButton>

          <span className="hidden text-right text-[11px] font-medium uppercase tracking-wider text-[var(--color-ink-tertiary)] sm:block">
            Human
          </span>

          <SortButton column="lastSeen" current={sortBy} dir={sortDir} onClick={handleSortClick} align="right" className="hidden sm:flex">
            Last Seen
          </SortButton>

          <span />
        </div>

        {/* Rows */}
        {paginatedLabels.length === 0 ? (
          <div className="px-4 py-10 text-center text-sm text-[var(--color-ink-tertiary)]">
            {search
              ? "No labels match your search."
              : "No labels yet. Embed a pixel to start tracking."}
          </div>
        ) : (
          paginatedLabels.map((item) => {
            const hp = humanPercent(item.total, item.bots);
            const isSelected = selected.has(item.label);
            return (
              <div
                key={item.label}
                className={`grid grid-cols-[28px_1fr_60px_28px] items-center gap-1 border-b border-[var(--color-edge-subtle)] px-4 py-2.5 last:border-b-0 sm:grid-cols-[28px_1fr_70px_70px_70px_70px_80px_28px] sm:gap-2 ${
                  isSelected ? "bg-[var(--color-signal-muted)]" : ""
                }`}
              >
                {/* Checkbox */}
                <label className="flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleOne(item.label)}
                    className="accent-[var(--color-signal)]"
                  />
                </label>

                {/* Label name + signal + flag */}
                <Link
                  to={`/label/${encodeURIComponent(item.label)}`}
                  className="flex items-center gap-2 overflow-hidden transition-opacity duration-150 hover:opacity-80"
                >
                  <SignalDot alive={item.total > 0} />
                  <span className="truncate font-mono text-sm text-[var(--color-ink)]">
                    {item.label}
                  </span>
                  <span className="shrink-0 text-[11px]" title={item.topCountry}>
                    {countryFlag(item.topCountry)}
                  </span>
                </Link>

                {/* Total */}
                <span className="text-right font-mono text-sm tabular-nums text-[var(--color-ink)]">
                  {item.total.toLocaleString()}
                </span>

                {/* Unique — hidden on mobile */}
                <span className="hidden text-right font-mono text-sm tabular-nums text-[var(--color-human-text)] sm:block">
                  {item.unique.toLocaleString()}
                </span>

                {/* Bots — hidden on mobile */}
                <span className="hidden text-right font-mono text-sm tabular-nums text-[var(--color-bot-text)] sm:block">
                  {item.bots.toLocaleString()}
                </span>

                {/* Human % — hidden on mobile */}
                <span className="hidden text-right font-mono text-sm tabular-nums sm:block">
                  <span
                    className={
                      hp >= 80
                        ? "text-[var(--color-human-text)]"
                        : hp >= 50
                          ? "text-[var(--color-ink-secondary)]"
                          : "text-[var(--color-bot-text)]"
                    }
                  >
                    {hp}%
                  </span>
                </span>

                {/* Last Seen — hidden on mobile */}
                <span
                  className="hidden text-right text-[11px] tabular-nums text-[var(--color-ink-tertiary)] sm:block"
                  title={item.lastSeen}
                >
                  {timeAgo(item.lastSeen)}
                </span>

                {/* Arrow */}
                <Link
                  to={`/label/${encodeURIComponent(item.label)}`}
                  className="flex items-center justify-center text-[var(--color-ink-muted)] transition-colors duration-150 hover:text-[var(--color-ink)]"
                >
                  <ChevronRight size={14} />
                </Link>
              </div>
            );
          })
        )}

        {/* Pagination footer */}
        {filtered.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--color-edge)] px-4 py-2">
            {/* Page size */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-[var(--color-ink-tertiary)]">
                Show
              </span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="rounded-[var(--radius-sm)] border border-[var(--color-edge)] bg-[var(--color-surface-2)] px-1.5 py-0.5 text-[11px] text-[var(--color-ink)] outline-none"
              >
                {PAGE_SIZE_OPTIONS.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>

            {/* Page info */}
            <span className="text-[11px] tabular-nums text-[var(--color-ink-tertiary)]">
              {(safePage - 1) * pageSize + 1}–
              {Math.min(safePage * pageSize, filtered.length)} of{" "}
              {filtered.length}
            </span>

            {/* Page controls */}
            <div className="flex items-center gap-1">
              <PaginationBtn
                onClick={() => setPage(1)}
                disabled={safePage <= 1}
                title="First page"
              >
                <ChevronsLeft size={13} />
              </PaginationBtn>
              <PaginationBtn
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage <= 1}
                title="Previous page"
              >
                <ChevronLeft size={13} />
              </PaginationBtn>
              <span className="mx-1 text-[11px] tabular-nums text-[var(--color-ink-secondary)]">
                {safePage} / {totalPages}
              </span>
              <PaginationBtn
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage >= totalPages}
                title="Next page"
              >
                <ChevronRight size={13} />
              </PaginationBtn>
              <PaginationBtn
                onClick={() => setPage(totalPages)}
                disabled={safePage >= totalPages}
                title="Last page"
              >
                <ChevronsRight size={13} />
              </PaginationBtn>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Sub-components                                                      */
/* ------------------------------------------------------------------ */

function SortButton({
  column,
  current,
  dir,
  onClick,
  align = "left",
  className = "",
  children,
}: {
  column: SortKey;
  current: SortKey;
  dir: SortDir;
  onClick: (key: SortKey) => void;
  align?: "left" | "right";
  className?: string;
  children: React.ReactNode;
}) {
  const isActive = current === column;
  return (
    <button
      onClick={() => onClick(column)}
      className={`flex items-center gap-1 text-[11px] font-medium uppercase tracking-wider transition-colors duration-150 ${
        align === "right" ? "justify-end" : ""
      } ${
        isActive
          ? "text-[var(--color-signal-text)]"
          : "text-[var(--color-ink-tertiary)] hover:text-[var(--color-ink-secondary)]"
      } ${className}`}
    >
      {children}
      {isActive ? (
        dir === "asc" ? (
          <ArrowUp size={10} />
        ) : (
          <ArrowDown size={10} />
        )
      ) : (
        <ArrowUpDown size={10} className="opacity-30" />
      )}
    </button>
  );
}

function PaginationBtn({
  onClick,
  disabled,
  title,
  children,
}: {
  onClick: () => void;
  disabled: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="rounded-[var(--radius-sm)] p-1 text-[var(--color-ink-tertiary)] transition-colors duration-150 hover:bg-[var(--color-surface-2)] hover:text-[var(--color-ink)] disabled:opacity-25 disabled:hover:bg-transparent"
    >
      {children}
    </button>
  );
}
