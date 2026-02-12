import type { Request, Response } from "express";
import { prisma } from "../db.js";
import { buildBadgeSvg } from "../lib/badge.js";
import { fetchLogo } from "../lib/logo.js";
import { registerVisit, extractVisitorInfo } from "../lib/visit.js";
import { logger } from "../logger.js";

/**
 * GET /badge/:label.svg
 *
 * Serves a dynamic SVG badge for the given tracking label.
 * Also registers the request as a visit — UNLESS `?preview=true`.
 *
 * Query params (shields.io-compatible):
 *   style      — flat | flat-square | plastic | for-the-badge | social
 *   label      — left-hand text (default: "Mykle23", "" = message-only)
 *   labelColor — background of the left part (hex, named)
 *   color      — background of the right part (hex, named, default: blue)
 *   message    — right-hand text (default: "{count} views")
 *   logo       — simple-icons slug (e.g. "github", "typescript")
 *   logoColor  — color of the logo (hex, named, default: white)
 *   link       — URL the badge should link to
 *   preview    — "true" to skip visit registration
 */
export async function badgeRoute(
  req: Request,
  res: Response
): Promise<void> {
  const trackingLabel = req.params.label;

  if (!trackingLabel) {
    res.status(400).end();
    return;
  }

  const isPreview = String(req.query.preview ?? "") === "true";

  try {
    const labelStr = String(trackingLabel);

    // Count existing visits (excluding bots)
    const count = await prisma.visit.count({
      where: { label: labelStr, isBot: false },
    });

    // Resolve logo if a slug was provided
    let logoBase64: string | undefined;
    const logoSlug = req.query.logo as string | undefined;
    if (logoSlug) {
      const logoColor = (req.query.logoColor as string | undefined) ?? "white";
      const fetched = await fetchLogo(logoSlug, logoColor);
      if (fetched) logoBase64 = fetched;
    }

    // Build link array
    const linkParam = req.query.link as string | undefined;
    const links = linkParam ? [linkParam] : undefined;

    const svg = buildBadgeSvg(count, {
      label: req.query.label as string | undefined,
      message: req.query.message as string | undefined,
      color: req.query.color as string | undefined,
      labelColor: req.query.labelColor as string | undefined,
      style: req.query.style as string | undefined,
      logoBase64,
      links,
    });

    res.setHeader("Content-Type", "image/svg+xml");
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    res.end(svg);

    // Register visit (unless preview)
    if (!isPreview) {
      const { ip, userAgent, referer } = extractVisitorInfo(req);
      void registerVisit(labelStr, ip, userAgent, referer);
    }
  } catch (err) {
    logger.error(
      { err, label: trackingLabel },
      "Failed to serve badge"
    );
    if (!res.headersSent) {
      res.status(500).end();
    }
  }
}
