import type { Request, Response } from "express";
import { TRANSPARENT_GIF, TRANSPARENT_SVG } from "../lib/pixel.js";
import { registerVisit, extractVisitorInfo } from "../lib/visit.js";

/** No-cache headers shared by all pixel responses. */
function setNoCacheHeaders(res: Response): void {
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
}

/**
 * GET /t/:label.gif
 * Serves a 1x1 transparent GIF and registers the visit asynchronously.
 */
export function pixelGifRoute(req: Request, res: Response): void {
  const label = req.params.label;
  if (!label) {
    res.status(400).end();
    return;
  }

  setNoCacheHeaders(res);
  res.setHeader("Content-Type", "image/gif");
  res.setHeader("Content-Length", TRANSPARENT_GIF.length);
  res.end(TRANSPARENT_GIF);

  const { ip, userAgent, referer } = extractVisitorInfo(req);
  void registerVisit(label, ip, userAgent, referer);
}

/**
 * GET /t/:label.svg
 * Serves a 1x1 transparent SVG and registers the visit asynchronously.
 */
export function pixelSvgRoute(req: Request, res: Response): void {
  const label = req.params.label;
  if (!label) {
    res.status(400).end();
    return;
  }

  setNoCacheHeaders(res);
  res.setHeader("Content-Type", "image/svg+xml");
  res.setHeader("Content-Length", Buffer.byteLength(TRANSPARENT_SVG));
  res.end(TRANSPARENT_SVG);

  const { ip, userAgent, referer } = extractVisitorInfo(req);
  void registerVisit(label, ip, userAgent, referer);
}
