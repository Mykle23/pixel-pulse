/**
 * Fetches simple-icons SVGs from cdn.simpleicons.org and caches them
 * in-memory so repeated requests for the same slug are instant.
 *
 * Returns a base64 data-URI ready for badge-maker's `logo` parameter.
 */

import { logger } from "../logger.js";

const logoCache = new Map<string, string | null>();

/**
 * Fetch a simple-icons logo by slug and return a data URI.
 *
 * @param slug  - simple-icons slug (e.g. "github", "typescript", "react")
 * @param color - hex without # (e.g. "white", "ff0000") — defaults to "white"
 * @returns     - data:image/svg+xml;base64,... or null if not found
 */
export async function fetchLogo(
  slug: string,
  color?: string
): Promise<string | null> {
  const normalizedSlug = slug.toLowerCase().trim().replace(/\s+/g, "");
  const normalizedColor = (color ?? "white").replace(/^#/, "");
  const cacheKey = `${normalizedSlug}:${normalizedColor}`;

  const cached = logoCache.get(cacheKey);
  if (cached !== undefined) return cached;

  try {
    const url = `https://cdn.simpleicons.org/${encodeURIComponent(normalizedSlug)}/${encodeURIComponent(normalizedColor)}`;

    const response = await fetch(url, {
      signal: AbortSignal.timeout(4000),
    });

    if (!response.ok) {
      logger.debug({ slug, status: response.status }, "Logo not found");
      logoCache.set(cacheKey, null);
      return null;
    }

    const svg = await response.text();
    const dataUri = `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
    logoCache.set(cacheKey, dataUri);
    return dataUri;
  } catch (err) {
    logger.debug({ err, slug }, "Failed to fetch logo");
    logoCache.set(cacheKey, null);
    return null;
  }
}
