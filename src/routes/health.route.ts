import type { Request, Response } from "express";
import { prisma } from "../db.js";
import { logger } from "../logger.js";

export async function healthRoute(_req: Request, res: Response): Promise<void> {
  try {
    const totalVisits = await prisma.visit.count();
    const labels = await prisma.visit.findMany({
      select: { label: true },
      distinct: ["label"],
    });

    res.json({
      status: "ok",
      totalVisits,
      totalLabels: labels.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error(error, "Health check failed");
    res.status(500).json({ error: "Health check failed" });
  }
}
