/**
 * Maps known data values to emoji/icon prefixes for visual clarity.
 */

/** Converts ISO 3166-1 alpha-2 country code to a flag emoji. */
export function countryFlag(code: string): string {
  if (!code || code === "Unknown") return "🌍";
  try {
    return code
      .toUpperCase()
      .replace(/./g, (c) => String.fromCodePoint(c.charCodeAt(0) + 127397));
  } catch {
    return "🌍";
  }
}

const OS_ICONS: Record<string, string> = {
  windows: "🪟",
  "mac os": "🍎",
  macos: "🍎",
  ios: "🍎",
  android: "🤖",
  linux: "🐧",
  ubuntu: "🐧",
  "chrome os": "💻",
  chromeos: "💻",
};

export function osIcon(name: string): string {
  const key = name.toLowerCase().split(/\s+\d/)[0]?.trim() ?? "";
  return OS_ICONS[key] ?? "💻";
}

const BROWSER_ICONS: Record<string, string> = {
  chrome: "🌐",
  firefox: "🦊",
  safari: "🧭",
  edge: "🔷",
  opera: "🔴",
  brave: "🦁",
  vivaldi: "🎨",
  samsung: "📱",
  "samsung internet": "📱",
  arc: "🌈",
};

export function browserIcon(name: string): string {
  const key = name.toLowerCase().split(/\s+\d/)[0]?.trim() ?? "";
  return BROWSER_ICONS[key] ?? "🌐";
}

const DEVICE_ICONS: Record<string, string> = {
  desktop: "🖥️",
  mobile: "📱",
  tablet: "📟",
  console: "🎮",
  smarttv: "📺",
  wearable: "⌚",
  embedded: "🔌",
};

export function deviceIcon(name: string): string {
  return DEVICE_ICONS[name.toLowerCase()] ?? "🖥️";
}

export function botIcon(): string {
  return "🤖";
}

export function refererIcon(url: string): string {
  const lower = url.toLowerCase();
  if (lower.includes("github")) return "🐙";
  if (lower.includes("google")) return "🔍";
  if (lower.includes("twitter") || lower.includes("x.com")) return "🐦";
  if (lower.includes("reddit")) return "🟠";
  if (lower.includes("linkedin")) return "💼";
  if (lower.includes("facebook") || lower.includes("fb.")) return "📘";
  if (lower.includes("youtube")) return "▶️";
  if (lower.includes("stackoverflow")) return "📚";
  return "🔗";
}

/**
 * Returns the appropriate icon function for a given data category.
 * Used by DataTable to auto-detect which icon mapper to use.
 */
export function getIconMapper(
  key: string
): ((value: string) => string) | null {
  switch (key) {
    case "country":
      return countryFlag;
    case "os":
      return osIcon;
    case "browser":
      return browserIcon;
    case "deviceType":
      return deviceIcon;
    case "botName":
      return botIcon;
    case "referer":
      return refererIcon;
    default:
      return null;
  }
}
