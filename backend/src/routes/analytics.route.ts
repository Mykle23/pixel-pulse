import { type Router as RouterType, Router } from "express";
import type { Request, Response } from "express";
import { prisma } from "../db.js";
import { env } from "../config/env.js";
import { logger } from "../logger.js";

export const analyticsRouter: RouterType = Router();

// Auth — same as statsRouter
analyticsRouter.use((req: Request, res: Response, next) => {
  if (env.apiKey && req.headers.authorization !== `Bearer ${env.apiKey}`) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
});

/**
 * GET /api/analytics?days=30
 *
 * Returns cross-label aggregate data for the analytics dashboard:
 * treemap, timeline, geographic, distribution, hourly, and referrer data.
 */
analyticsRouter.get("/analytics", async (req: Request, res: Response) => {
  try {
    const days = Math.min(Math.max(Number(req.query.days) || 30, 1), 365);
    const now = new Date();
    const since = new Date(now.getTime() - days * 86_400_000);
    const midpoint = new Date(now.getTime() - (days / 2) * 86_400_000);

    const visits = await prisma.visit.findMany({
      where: { createdAt: { gte: since } },
      select: {
        label: true,
        ipHash: true,
        country: true,
        browser: true,
        os: true,
        deviceType: true,
        isBot: true,
        referer: true,
        createdAt: true,
      },
      orderBy: { createdAt: "asc" },
    });

    /* ── Aggregation accumulators ── */

    const uniqueIps = new Set<string>();
    let botCount = 0;

    // Per-label
    const labelMap = new Map<
      string,
      {
        total: number;
        recent: number;
        previous: number;
        unique: Set<string>;
        bots: number;
      }
    >();

    // Timeline: date → (label → count)
    const timelineMap = new Map<string, Map<string, number>>();

    // Simple counters
    const countryMap = new Map<string, number>();
    const browserMap = new Map<string, number>();
    const osMap = new Map<string, number>();
    const deviceMap = new Map<string, number>();
    const refererMap = new Map<string, number>();
    const hourly = new Array<number>(24).fill(0);

    /* ── Single pass over all visits ── */

    for (const v of visits) {
      uniqueIps.add(v.ipHash);
      if (v.isBot) botCount++;

      // Label aggregation
      let le = labelMap.get(v.label);
      if (!le) {
        le = { total: 0, recent: 0, previous: 0, unique: new Set(), bots: 0 };
        labelMap.set(v.label, le);
      }
      le.total++;
      le.unique.add(v.ipHash);
      if (v.isBot) le.bots++;
      if (v.createdAt >= midpoint) le.recent++;
      else le.previous++;

      // Timeline
      const dateKey = v.createdAt.toISOString().split("T")[0]!;
      let dayBucket = timelineMap.get(dateKey);
      if (!dayBucket) {
        dayBucket = new Map();
        timelineMap.set(dateKey, dayBucket);
      }
      dayBucket.set("_total", (dayBucket.get("_total") ?? 0) + 1);
      dayBucket.set(v.label, (dayBucket.get(v.label) ?? 0) + 1);

      // Country
      inc(countryMap, v.country ?? "Unknown");

      // Browser
      inc(browserMap, v.browser ?? "Unknown");

      // OS
      inc(osMap, v.os ?? "Unknown");

      // Device
      inc(deviceMap, v.deviceType ?? "unknown");

      // Hourly
      hourly[v.createdAt.getHours()]++;

      // Referrer
      if (v.referer) inc(refererMap, v.referer);
    }

    /* ── Build labels array with growth ── */

    const labels = Array.from(labelMap.entries())
      .map(([label, d]) => ({
        label,
        total: d.total,
        unique: d.unique.size,
        bots: d.bots,
        growth:
          d.previous > 0
            ? Math.round(((d.recent - d.previous) / d.previous) * 100)
            : d.recent > 0
              ? 100
              : 0,
      }))
      .sort((a, b) => b.total - a.total);

    /* ── Timeline with top N labels + "other" ── */

    const TOP_N = 8;
    const topLabels = labels.slice(0, TOP_N).map((l) => l.label);

    const timeline = Array.from(timelineMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, bucket]) => {
        const total = bucket.get("_total") ?? 0;
        const entry: Record<string, number | string> = { date, total };
        let topSum = 0;
        for (const lbl of topLabels) {
          const c = bucket.get(lbl) ?? 0;
          entry[lbl] = c;
          topSum += c;
        }
        entry.other = total - topSum;
        return entry;
      });

    /* ── Response ── */

    res.json({
      summary: {
        totalVisits: visits.length,
        uniqueVisitors: uniqueIps.size,
        botVisits: botCount,
        humanVisits: visits.length - botCount,
        totalLabels: labelMap.size,
      },
      labels,
      topLabels,
      timeline,
      countries: topN(countryMap, "country", 100),
      browsers: topN(browserMap, "name", 20),
      operatingSystems: topN(osMap, "name", 20),
      devices: topN(deviceMap, "name", 10),
      hourly: hourly.map((count, hour) => ({ hour, visits: count })),
      referers: topN(refererMap, "name", 15),
    });
  } catch (err) {
    logger.error({ err }, "Failed to fetch analytics");
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
});

/* ── Helpers ── */

function inc(map: Map<string, number>, key: string): void {
  map.set(key, (map.get(key) ?? 0) + 1);
}

function topN(
  map: Map<string, number>,
  key: string,
  limit: number
): Array<Record<string, string | number>> {
  return Array.from(map.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name, visits]) => ({ [key]: name, visits }));
}
