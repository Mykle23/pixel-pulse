import type { StatsOverview, LabelStats, HealthStatus, AnalyticsData } from "./types";

const API_KEY_STORAGE = "pixelpulse-api-key";

export function getApiKey(): string {
  return localStorage.getItem(API_KEY_STORAGE) ?? "";
}

export function setApiKey(key: string): void {
  localStorage.setItem(API_KEY_STORAGE, key);
}

export function clearApiKey(): void {
  localStorage.removeItem(API_KEY_STORAGE);
}

async function apiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const key = getApiKey();
  const headers: Record<string, string> = {
    ...(options?.headers as Record<string, string>),
  };
  if (key) headers.Authorization = `Bearer ${key}`;

  const res = await fetch(path, { ...options, headers });

  if (res.status === 401) {
    throw new ApiError("Unauthorized", 401);
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new ApiError(body.error ?? "Request failed", res.status);
  }

  return res.json() as Promise<T>;
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export function fetchOverview(): Promise<StatsOverview> {
  return apiFetch("/api/stats");
}

export function fetchLabelStats(
  label: string,
  params?: { from?: string; to?: string; includeBots?: boolean }
): Promise<LabelStats> {
  const query = new URLSearchParams();
  if (params?.from) query.set("from", params.from);
  if (params?.to) query.set("to", params.to);
  if (params?.includeBots === false) query.set("includeBots", "false");
  const qs = query.toString();
  return apiFetch(`/api/stats/${encodeURIComponent(label)}${qs ? `?${qs}` : ""}`);
}

export function fetchHealth(): Promise<HealthStatus> {
  return apiFetch("/health");
}

export function deleteLabel(
  label: string
): Promise<{ label: string; deleted: number }> {
  return apiFetch(`/api/stats/${encodeURIComponent(label)}`, {
    method: "DELETE",
  });
}

export function fetchAnalytics(days = 30): Promise<AnalyticsData> {
  return apiFetch(`/api/analytics?days=${days}`);
}

export function deleteLabels(
  labels: string[]
): Promise<{ labels: string[]; deleted: number }> {
  return apiFetch("/api/stats", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ labels }),
  });
}
