import { Router } from "express";
import type { Request, Response } from "express";
import { prisma } from "../db.js";
import { env } from "../config/env.js";
import { logger } from "../logger.js";

export const statsRouter = Router();

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
 * Overview across all labels.
 */
statsRouter.get("/stats", async (req: Request, res: Response) => {
  try {
    const visits = await prisma.visit.findMany();

    const totalVisits = visits.length;
    const uniqueIps = new Set(visits.map((v) => v.ipHash));
    const botVisits = visits.filter((v) => v.isBot).length;

    // Group by label
    const labelMap = new Map<
      string,
      { total: number; uniqueIps: Set<string>; bots: number }
    >();

    for (const v of visits) {
      let entry = labelMap.get(v.label);
      if (!entry) {
        entry = { total: 0, uniqueIps: new Set(), bots: 0 };
        labelMap.set(v.label, entry);
      }
      entry.total++;
      entry.uniqueIps.add(v.ipHash);
      if (v.isBot) entry.bots++;
    }

    const labels = Array.from(labelMap.entries()).map(([label, data]) => ({
      label,
      total: data.total,
      unique: data.uniqueIps.size,
      bots: data.bots,
    }));

    res.json({
      totalVisits,
      uniqueVisitors: uniqueIps.size,
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
    const includeBots = req.query.includeBots !== "false"; // default true

    // Build date filter
    const dateFilter: Record<string, Date> = {};
    if (from) dateFilter.gte = new Date(from);
    if (to) dateFilter.lte = new Date(to);

    const visits = await prisma.visit.findMany({
      where: {
        label,
        ...(Object.keys(dateFilter).length > 0
          ? { createdAt: dateFilter }
          : {}),
        ...(!includeBots ? { isBot: false } : {}),
      },
      orderBy: { createdAt: "asc" },
    });

    const totalVisits = visits.length;
    const uniqueIps = new Set(visits.map((v) => v.ipHash));
    const botVisits = visits.filter((v) => v.isBot).length;

    // Timeline (group by date)
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

    // Countries
    const countryMap = new Map<string, number>();
    for (const v of visits) {
      const key = v.country ?? "Unknown";
      countryMap.set(key, (countryMap.get(key) ?? 0) + 1);
    }
    const countries = Array.from(countryMap.entries())
      .map(([country, count]) => ({ country, visits: count }))
      .sort((a, b) => b.visits - a.visits);

    // Devices
    const deviceMap = new Map<string, number>();
    for (const v of visits) {
      const key = v.deviceType ?? "unknown";
      deviceMap.set(key, (deviceMap.get(key) ?? 0) + 1);
    }
    const devices = Array.from(deviceMap.entries())
      .map(([deviceType, count]) => ({ deviceType, visits: count }))
      .sort((a, b) => b.visits - a.visits);

    // Browsers
    const browserMap = new Map<string, number>();
    for (const v of visits) {
      const key = v.browser ?? "Unknown";
      browserMap.set(key, (browserMap.get(key) ?? 0) + 1);
    }
    const browsers = Array.from(browserMap.entries())
      .map(([browser, count]) => ({ browser, visits: count }))
      .sort((a, b) => b.visits - a.visits);

    // Top bots
    const botMap = new Map<string, number>();
    for (const v of visits) {
      if (v.isBot && v.botName) {
        botMap.set(v.botName, (botMap.get(v.botName) ?? 0) + 1);
      }
    }
    const topBots = Array.from(botMap.entries())
      .map(([botName, count]) => ({ botName, visits: count }))
      .sort((a, b) => b.visits - a.visits);

    // Referers
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
      total: totalVisits,
      unique: uniqueIps.size,
      bots: botVisits,
      timeline,
      countries,
      devices,
      browsers,
      topBots,
      referers,
    });
  } catch (error) {
    logger.error({ error, label: req.params.label }, "Failed to fetch label stats");
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});
