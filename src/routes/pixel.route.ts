import type { Request, Response } from "express";
import { prisma } from "../db.js";
import { TRANSPARENT_GIF } from "../lib/pixel.js";
import { hashIp } from "../lib/hash.js";
import { lookupGeo } from "../lib/geo.js";
import { parseUA } from "../lib/ua.js";
import { env } from "../config/env.js";
import { logger } from "../logger.js";

/**
 * Registers a visit asynchronously. Errors are logged but never
 * propagated — the GIF response is already sent.
 */
async function registerVisit(
  label: string,
  ip: string,
  userAgent: string | undefined,
  referer: string | undefined
): Promise<void> {
  try {
    const ipHash = hashIp(ip, env.ipSalt);
    const geo = lookupGeo(ip);
    const ua = parseUA(userAgent);

    await prisma.visit.create({
      data: {
        label,
        ipHash,
        country: geo.country,
        city: geo.city,
        userAgent: userAgent ?? null,
        browser: ua.browser,
        os: ua.os,
        deviceType: ua.deviceType,
        isBot: ua.isBot,
        botName: ua.botName,
        referer: referer ?? null,
      },
    });
  } catch (error) {
    logger.error({ error, label }, "Failed to register visit");
  }
}

/**
 * GET /t/:label.gif
 *
 * Serves a 1x1 transparent GIF and registers the visit asynchronously.
 * The response is sent immediately — the DB write happens in the background.
 */
export function pixelRoute(req: Request, res: Response): void {
  const label = req.params.label;

  if (!label) {
    res.status(400).end();
    return;
  }

  // Send the GIF immediately
  res.setHeader("Content-Type", "image/gif");
  res.setHeader("Content-Length", TRANSPARENT_GIF.length);
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.end(TRANSPARENT_GIF);

  // Fire-and-forget: register the visit in the background
  const ip =
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ??
    req.ip ??
    "unknown";

  const userAgent = req.headers["user-agent"];
  const referer = req.headers["referer"];

  void registerVisit(label, ip, userAgent, referer);
}
