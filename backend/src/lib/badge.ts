/**
 * Generates shields.io-compatible SVG badges.
 *
 * Uses the official `badge-maker` v5 library (same engine as shields.io).
 *
 * Supports three badge modes:
 *   1. Static (one text)  — message-only badge (label = "")
 *   2. Static (two texts)  — label + message
 *   3. Dynamic counter     — label + "{count} views"
 *
 * Each mode can include a logo via `logoBase64` (data URI).
 */

import { makeBadge } from "badge-maker";

/* ------------------------------------------------------------------ */
/* Styles                                                              */
/* ------------------------------------------------------------------ */

const BADGE_STYLES = {
  flat: "flat",
  "flat-square": "flat-square",
  plastic: "plastic",
  "for-the-badge": "for-the-badge",
  social: "social",
} as const;

type BadgeStyleKey = keyof typeof BADGE_STYLES;

/* ------------------------------------------------------------------ */
/* Color resolution                                                    */
/* ------------------------------------------------------------------ */

const COLOR_MAP: Record<string, string> = {
  brightgreen: "#4c1",
  green: "#97ca00",
  yellow: "#dfb317",
  yellowgreen: "#a4a61d",
  orange: "#fe7d37",
  red: "#e05d44",
  blue: "#007ec6",
  grey: "#555",
  gray: "#555",
  lightgrey: "#9f9f9f",
  lightgray: "#9f9f9f",
  purple: "#9f78c4",
  pink: "#e44b8d",
  cyan: "#24b3a6",
  black: "#333",
  white: "#fff",
} as const;

export function resolveColor(
  input: string | undefined,
  fallback: string
): string {
  if (!input) return fallback;
  const named = COLOR_MAP[input.toLowerCase()];
  if (named) return named;
  if (/^#?[0-9a-fA-F]{3,8}$/.test(input)) {
    return input.startsWith("#") ? input : `#${input}`;
  }
  return fallback;
}

/* ------------------------------------------------------------------ */
/* Count formatting                                                    */
/* ------------------------------------------------------------------ */

function formatCount(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}k`;
  return count.toString();
}

/* ------------------------------------------------------------------ */
/* Badge builder                                                       */
/* ------------------------------------------------------------------ */

export interface BadgeOptions {
  /** Left-hand text. Default: "Mykle23". Set to "" for message-only. */
  label?: string;
  /** Right-hand text. If empty/undefined, shows dynamic counter. */
  message?: string;
  /** Background color of the right part. Default: blue */
  color?: string;
  /** Background color of the left part. Default: #555 */
  labelColor?: string;
  /** Badge style. Default: flat */
  style?: string;
  /** Logo as data URI (data:image/svg+xml;base64,...) for badge-maker v5 logoBase64. */
  logoBase64?: string;
  /** Clickable links [left, right] or [both]. */
  links?: string[];
}

/**
 * Build an SVG badge string.
 *
 * @param count   - Visit count (used only when `message` is empty).
 * @param options - shields.io-compatible options.
 */
export function buildBadgeSvg(count: number, options: BadgeOptions): string {
  const styleKey = (options.style ?? "flat") as BadgeStyleKey;
  const style = BADGE_STYLES[styleKey] ?? "flat";

  // Message priority: custom text > dynamic counter > minimal space (icon-only)
  let message: string;
  if (options.message !== undefined && options.message !== "") {
    message = options.message;
  } else if (options.label !== "") {
    // Has a label section → show counter as default message
    message = `${formatCount(count)} views`;
  } else {
    // No label, no message → icon-only / minimal badge
    message = " ";
  }

  // When label is "" → omit it entirely so badge-maker renders message-only
  const hasLabel = options.label !== "";
  const label = hasLabel ? (options.label ?? "Mykle23") : undefined;

  return makeBadge({
    ...(label !== undefined ? { label } : {}),
    message,
    color: resolveColor(options.color, "#007ec6"),
    ...(hasLabel ? { labelColor: resolveColor(options.labelColor, "#555") } : {}),
    style,
    ...(options.logoBase64 ? { logoBase64: options.logoBase64 } : {}),
    ...(options.links && options.links.length > 0
      ? { links: options.links }
      : {}),
  });
}
