import type { Request, Response } from "express";
import { prisma } from "../db.js";
import { buildBadgeSvg } from "../lib/badge.js";
import { registerVisit, extractVisitorInfo } from "../lib/visit.js";
import { logger } from "../logger.js";

/**
 * GET /badge/:label.svg?label=&color=&style=
 *
 * Serves a dynamic SVG badge showing the visit counter for the given label.
 * Also registers the request as a visit (the badge IS the pixel).
 *
 * Query params:
 *   - label:  left-side text (default: "PixelPulse")
 *   - color:  right-side color — named (blue, green, red...) or hex (default: blue)
 *   - style:  "flat" or "rounded" (default: rounded)
 */
export async function badgeRoute(req: Request, res: Response): Promise<void> {
  const label = req.params.label;

  if (!label) {
    res.status(400).end();
    return;
  }

  try {
    // Count existing visits for this label (excluding bots for the display count)
    const count = await prisma.visit.count({
      where: { label, isBot: false },
    });

    const svg = buildBadgeSvg(count, {
      label: req.query.label as string | undefined,
      color: req.query.color as string | undefined,
      style: req.query.style as string | undefined,
    });

    res.setHeader("Content-Type", "image/svg+xml");
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    res.end(svg);

    // Fire-and-forget: register the badge view as a visit
    const { ip, userAgent, referer } = extractVisitorInfo(req);
    void registerVisit(label, ip, userAgent, referer);
  } catch (error) {
    logger.error({ error, label }, "Failed to serve badge");
    if (!res.headersSent) {
      res.status(500).end();
    }
  }
}
