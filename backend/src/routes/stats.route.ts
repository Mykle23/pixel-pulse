import { type Router as RouterType, Router } from "express";
import type { Request, Response } from "express";
import { prisma } from "../db.js";
import { env } from "../config/env.js";
import { logger } from "../logger.js";

export const statsRouter: RouterType = Router();

// Inline auth check — protects all /api/* routes if API_KEY is set
statsRouter.use((req: Request, res: Response, next) => {
  if (env.apiKey && req.headers.authorization !== `Bearer ${env.apiKey}`) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
});

/**
 * GET /api/stats
 * Overview across all labels — includes lastSeen, topCountry per label.
 */
statsRouter.get("/stats", async (_req: Request, res: Response) => {
  try {
    const [totalVisits, botVisits, uniqueResult, labelsRaw] =
      await Promise.all([
        prisma.visit.count(),
        prisma.visit.count({ where: { isBot: true } }),
        prisma.visit.findMany({
          distinct: ["ipHash"],
          select: { ipHash: true },
        }),
        prisma.visit.findMany({
          select: {
            label: true,
            ipHash: true,
            isBot: true,
            country: true,
            createdAt: true,
          },
        }),
      ]);

    // Group by label with enriched data
    const labelMap = new Map<
      string,
      {
        total: number;
        uniqueIps: Set<string>;
        bots: number;
        lastSeen: Date;
        countries: Map<string, number>;
      }
    >();

    for (const v of labelsRaw) {
      let entry = labelMap.get(v.label);
      if (!entry) {
        entry = {
          total: 0,
          uniqueIps: new Set(),
          bots: 0,
          lastSeen: v.createdAt,
          countries: new Map(),
        };
        labelMap.set(v.label, entry);
      }
      entry.total++;
      entry.uniqueIps.add(v.ipHash);
      if (v.isBot) entry.bots++;
      if (v.createdAt > entry.lastSeen) entry.lastSeen = v.createdAt;
      const country = v.country ?? "Unknown";
      entry.countries.set(country, (entry.countries.get(country) ?? 0) + 1);
    }

    const labels = Array.from(labelMap.entries()).map(([label, data]) => {
      // Find the most frequent country
      let topCountry = "Unknown";
      let topCountryCount = 0;
      for (const [country, count] of data.countries) {
        if (count > topCountryCount) {
          topCountry = country;
          topCountryCount = count;
        }
      }

      return {
        label,
        total: data.total,
        unique: data.uniqueIps.size,
        bots: data.bots,
        lastSeen: data.lastSeen.toISOString(),
        topCountry,
      };
    });

    res.json({
      totalVisits,
      uniqueVisitors: uniqueResult.length,
      botVisits,
      labels,
    });
  } catch (error) {
    logger.error(error, "Failed to fetch stats overview");
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

/**
 * GET /api/stats/:label?from=&to=&includeBots=true
 * Full stats for a single label.
 */
statsRouter.get("/stats/:label", async (req: Request, res: Response) => {
  try {
    const { label } = req.params;
    const from = req.query.from as string | undefined;
    const to = req.query.to as string | undefined;
    const includeBots = req.query.includeBots !== "false";

    const where: Record<string, unknown> = { label };
    const dateFilter: Record<string, Date> = {};
    if (from) dateFilter.gte = new Date(from);
    if (to) dateFilter.lte = new Date(to);
    if (Object.keys(dateFilter).length > 0) where.createdAt = dateFilter;
    if (!includeBots) where.isBot = false;

    const [visits, totalCount, botCount] = await Promise.all([
      prisma.visit.findMany({
        where,
        select: {
          ipHash: true,
          country: true,
          browser: true,
          os: true,
          deviceType: true,
          isBot: true,
          botName: true,
          referer: true,
          createdAt: true,
        },
        orderBy: { createdAt: "asc" },
      }),
      prisma.visit.count({ where }),
      prisma.visit.count({ where: { ...where, isBot: true } }),
    ]);

    const uniqueIps = new Set(visits.map((v) => v.ipHash));

    // Timeline
    const timelineMap = new Map<
      string,
      { visits: number; uniqueIps: Set<string> }
    >();
    for (const v of visits) {
      const date = v.createdAt.toISOString().split("T")[0]!;
      let entry = timelineMap.get(date);
      if (!entry) {
        entry = { visits: 0, uniqueIps: new Set() };
        timelineMap.set(date, entry);
      }
      entry.visits++;
      entry.uniqueIps.add(v.ipHash);
    }
    const timeline = Array.from(timelineMap.entries()).map(([date, data]) => ({
      date,
      visits: data.visits,
      unique: data.uniqueIps.size,
    }));

    function countBy<K extends string>(
      key: K,
      defaultLabel: string
    ): Array<Record<K, string> & { visits: number }> {
      const map = new Map<string, number>();
      for (const v of visits) {
        const val =
          (v[key as keyof typeof v] as string | null) ?? defaultLabel;
        map.set(val, (map.get(val) ?? 0) + 1);
      }
      return Array.from(map.entries())
        .map(
          ([name, count]) =>
            ({ [key]: name, visits: count }) as Record<K, string> & {
              visits: number;
            }
        )
        .sort((a, b) => b.visits - a.visits);
    }

    const countries = countBy("country", "Unknown");
    const devices = countBy("deviceType", "unknown");
    const browsers = countBy("browser", "Unknown");
    const operatingSystems = countBy("os", "Unknown");

    const botMap = new Map<string, number>();
    for (const v of visits) {
      if (v.isBot && v.botName) {
        botMap.set(v.botName, (botMap.get(v.botName) ?? 0) + 1);
      }
    }
    const topBots = Array.from(botMap.entries())
      .map(([botName, count]) => ({ botName, visits: count }))
      .sort((a, b) => b.visits - a.visits);

    const refererMap = new Map<string, number>();
    for (const v of visits) {
      if (v.referer) {
        refererMap.set(v.referer, (refererMap.get(v.referer) ?? 0) + 1);
      }
    }
    const referers = Array.from(refererMap.entries())
      .map(([referer, count]) => ({ referer, visits: count }))
      .sort((a, b) => b.visits - a.visits);

    res.json({
      label,
      total: totalCount,
      unique: uniqueIps.size,
      bots: botCount,
      timeline,
      countries,
      devices,
      browsers,
      operatingSystems,
      topBots,
      referers,
    });
  } catch (error) {
    logger.error(
      { error, label: req.params.label },
      "Failed to fetch label stats"
    );
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

/**
 * DELETE /api/stats/:label
 * Deletes ALL visits for a single label.
 */
statsRouter.delete("/stats/:label", async (req: Request, res: Response) => {
  try {
    const label = String(req.params.label);

    const result = await prisma.visit.deleteMany({
      where: { label },
    });

    logger.info({ label, deleted: result.count }, "Deleted label visits");
    res.json({ label, deleted: result.count });
  } catch (error) {
    logger.error(
      { error, label: req.params.label },
      "Failed to delete label"
    );
    res.status(500).json({ error: "Failed to delete label" });
  }
});

/**
 * DELETE /api/stats
 * Batch delete — removes ALL visits for the given labels.
 * Body: { labels: string[] }
 */
statsRouter.delete("/stats", async (req: Request, res: Response) => {
  try {
    const { labels } = req.body as { labels?: string[] };

    if (!Array.isArray(labels) || labels.length === 0) {
      res.status(400).json({ error: "labels array is required" });
      return;
    }

    const result = await prisma.visit.deleteMany({
      where: { label: { in: labels } },
    });

    logger.info(
      { labels, deleted: result.count },
      "Batch deleted label visits"
    );
    res.json({ labels, deleted: result.count });
  } catch (error) {
    logger.error({ error }, "Failed to batch delete labels");
    res.status(500).json({ error: "Failed to batch delete" });
  }
});
