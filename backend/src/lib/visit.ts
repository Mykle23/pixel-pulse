import { prisma } from "../db.js";
import { hashIp } from "./hash.js";
import { lookupGeo } from "./geo.js";
import { parseUA } from "./ua.js";
import { env } from "../config/env.js";
import { logger } from "../logger.js";
import type { Request } from "express";

/**
 * Extracts visitor info from a request (IP, User-Agent, Referer).
 */
export function extractVisitorInfo(req: Request): {
  ip: string;
  userAgent: string | undefined;
  referer: string | undefined;
} {
  const ip =
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ??
    req.ip ??
    "unknown";

  return {
    ip,
    userAgent: req.headers["user-agent"],
    referer: req.headers["referer"],
  };
}

/**
 * Registers a visit asynchronously. Errors are logged but never
 * propagated — the image response is already sent.
 */
export async function registerVisit(
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
