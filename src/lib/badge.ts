/**
 * Generates a shields.io-style SVG badge with PixelPulse branding.
 *
 * Uses the official `badge-maker` library (same engine as shields.io).
 */

import { makeBadge } from "badge-maker";

const BADGE_STYLES = {
  flat: "flat",
  rounded: "flat-square",
  plastic: "plastic",
  "for-the-badge": "for-the-badge",
  social: "social",
} as const;

type BadgeStyleKey = keyof typeof BADGE_STYLES;

function formatCount(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}k`;
  return count.toString();
}

const COLOR_MAP: Record<string, string> = {
  blue: "#007ec6",
  green: "#4c1",
  red: "#e05d44",
  orange: "#fe7d37",
  yellow: "#dfb317",
  purple: "#9f78c4",
  pink: "#e44b8d",
  gray: "#555",
  black: "#333",
  cyan: "#24b3a6",
} as const;

export function resolveColor(input: string | undefined): string {
  if (!input) return "#007ec6"; // default blue
  // Named color
  const named = COLOR_MAP[input.toLowerCase()];
  if (named) return named;
  // Hex color (with or without #)
  if (/^#?[0-9a-fA-F]{3,6}$/.test(input)) {
    return input.startsWith("#") ? input : `#${input}`;
  }
  return "#007ec6";
}

export function buildBadgeSvg(
  count: number,
  options: {
    label?: string;
    color?: string;
    style?: string;
  }
): string {
  const styleKey = (options.style ?? "rounded") as BadgeStyleKey;
  const style = BADGE_STYLES[styleKey] ?? "flat-square";

  return makeBadge({
    label: options.label ?? "PixelPulse",
    message: `${formatCount(count)} views`,
    color: resolveColor(options.color),
    labelColor: "#555",
    style,
  });
}
