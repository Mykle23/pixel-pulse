import { useState } from "react";
import { Copy, Check, Award, Palette, X, Radio } from "lucide-react";
import { usePreset } from "../context/badge-preset";

interface BadgeCreatorProps {
  existingLabels: string[];
}

/* ------------------------------------------------------------------ */
/* Badge modes                                                         */
/* ------------------------------------------------------------------ */

type BadgeMode = "static-single" | "static-double" | "counter" | "pixel";

const BADGE_MODES = [
  { value: "static-single" as const, name: "One text", desc: "Message only" },
  { value: "static-double" as const, name: "Two texts", desc: "Label + message" },
  { value: "counter" as const, name: "Counter", desc: "Dynamic visits" },
  { value: "pixel" as const, name: "Pixel", desc: "Invisible tracker" },
] as const;

/* ------------------------------------------------------------------ */
/* Shields.io options                                                  */
/* ------------------------------------------------------------------ */

const BADGE_COLORS = [
  { name: "Blue", value: "blue" },
  { name: "Bright Green", value: "brightgreen" },
  { name: "Green", value: "green" },
  { name: "Yellow Green", value: "yellowgreen" },
  { name: "Yellow", value: "yellow" },
  { name: "Orange", value: "orange" },
  { name: "Red", value: "red" },
  { name: "Purple", value: "purple" },
  { name: "Pink", value: "pink" },
  { name: "Gray", value: "gray" },
  { name: "Black", value: "black" },
] as const;

const BADGE_STYLES = [
  { name: "Flat", value: "flat" },
  { name: "Flat Square", value: "flat-square" },
  { name: "Plastic", value: "plastic" },
  { name: "For the Badge", value: "for-the-badge" },
  { name: "Social", value: "social" },
] as const;

const LABEL_COLORS = [
  { name: "Default", value: "" },
  { name: "Gray", value: "555" },
  { name: "Dark", value: "333" },
  { name: "Blue", value: "007ec6" },
  { name: "Purple", value: "9f78c4" },
  { name: "Teal", value: "24b3a6" },
] as const;

const POPULAR_LOGOS = [
  "github", "typescript", "react", "node.js", "javascript",
  "python", "docker", "vercel", "npm", "git",
  "visualstudiocode", "nextdotjs", "tailwindcss", "prisma",
  "postgresql", "mongodb", "rust", "go", "swift", "linux",
] as const;

/* ------------------------------------------------------------------ */
/* URL builder                                                         */
/* ------------------------------------------------------------------ */

function buildQs(params: Record<string, string>, preview: boolean): string {
  const qs = new URLSearchParams();
  if (preview) qs.set("preview", "true");
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined) qs.set(k, v);
  }
  const str = qs.toString();
  return str ? `?${str}` : "";
}

function getQueryParams(
  mode: BadgeMode,
  color: string,
  style: string,
  labelText: string,
  messageText: string,
  labelColor: string,
  logo: string,
  logoColor: string,
  link: string
): Record<string, string> {
  // Pixel mode has no query params for badges
  if (mode === "pixel") return {};

  const params: Record<string, string> = {};

  if (style !== "flat") params.style = style;
  if (color !== "blue") params.color = color;
  if (labelColor) params.labelColor = labelColor;

  switch (mode) {
    case "static-single":
      params.label = "";
      if (messageText) params.message = messageText;
      break;
    case "static-double":
      if (labelText !== "Mykle23") params.label = labelText;
      if (messageText) params.message = messageText;
      break;
    case "counter":
      if (labelText !== "Mykle23") params.label = labelText;
      break;
  }

  if (logo) params.logo = logo;
  if (logo && logoColor && logoColor !== "white") params.logoColor = logoColor;
  if (link) params.link = link;

  return params;
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export function BadgeCreator({ existingLabels }: BadgeCreatorProps) {
  const { pending, consume } = usePreset();

  const [mode, setMode] = useState<BadgeMode>("static-double");
  const [trackingLabel, setTrackingLabel] = useState("repository-name");
  const [labelText, setLabelText] = useState("Mykle23");
  const [messageText, setMessageText] = useState("PixelPulse");
  const [color, setColor] = useState("blue");
  const [style, setStyle] = useState("flat");
  const [labelColor, setLabelColor] = useState("");
  const [logo, setLogo] = useState("");
  const [logoColor, setLogoColor] = useState("white");
  const [link, setLink] = useState("");
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [trackingFocused, setTrackingFocused] = useState(false);
  const [logoFocused, setLogoFocused] = useState(false);
  const [presetName, setPresetName] = useState<string | null>(null);
  // Consume preset from context when gallery pushes one (state-during-render pattern)
  const [prevPresetName, setPrevPresetName] = useState<string | null>(null);

  if (pending && prevPresetName !== pending.name) {
    setPrevPresetName(pending.name);

    // Presets with empty message → single-section badge (message = label text)
    if (pending.message) {
      setMode("static-double");
      setLabelText(pending.label);
      setMessageText(pending.message);
    } else {
      setMode("static-single");
      setMessageText(pending.label); // label text becomes the message in single mode
      setLabelText("Mykle23");
    }

    setColor(pending.color || "blue");
    setStyle(pending.style || "flat");
    setLabelColor(pending.labelColor);
    setLogo(pending.logo);
    setLogoColor(pending.logoColor || "white");
    setPresetName(pending.name);
    consume();
  }

  const trimmed = trackingLabel.trim();
  const hasTrackingLabel = trimmed.length > 0;
  const isPixelMode = mode === "pixel";

  // Badge URL
  const qp = isPixelMode ? {} : getQueryParams(mode, color, style, labelText, messageText, labelColor, logo.trim(), logoColor, link.trim());
  const badgePath = isPixelMode
    ? `/pixel/${encodeURIComponent(trimmed)}.svg`
    : `/badge/${encodeURIComponent(trimmed)}.svg`;
  const publicUrl = hasTrackingLabel ? `${badgePath}${buildQs(qp, false)}` : "";
  const previewUrl = hasTrackingLabel && !isPixelMode ? `${badgePath}${buildQs(qp, true)}` : "";
  const fullUrl = `${window.location.origin}${publicUrl}`;

  const altText = mode === "static-single" ? (messageText || "badge") : (labelText || "badge");
  const hasLink = link.trim().length > 0;

  // Snippets
  let markdownSnippet = "";
  let htmlSnippet = "";
  if (isPixelMode) {
    markdownSnippet = `![](${fullUrl})`;
    htmlSnippet = `<img src="${fullUrl}" width="1" height="1" alt="" />`;
  } else if (hasLink) {
    markdownSnippet = `[![${altText}](${fullUrl})](${link.trim()})`;
    htmlSnippet = `<a href="${link.trim()}"><img src="${fullUrl}" alt="${altText}" /></a>`;
  } else {
    markdownSnippet = `![${altText}](${fullUrl})`;
    htmlSnippet = `<img src="${fullUrl}" alt="${altText}" />`;
  }

  function copySnippet(key: string, value: string) {
    navigator.clipboard.writeText(value).then(() => {
      setCopiedField(key);
      setTimeout(() => setCopiedField(null), 2000);
    });
  }

  const labelSuggestions = trackingLabel.length > 0
    ? existingLabels.filter((l) => l.toLowerCase().includes(trackingLabel.toLowerCase()) && l !== trimmed)
    : [];

  const logoSuggestions = logo.length > 0
    ? POPULAR_LOGOS.filter((l) => l.includes(logo.toLowerCase()) && l !== logo.toLowerCase())
    : [];

  return (
    <div className="min-w-0 rounded-[var(--radius-md)] border border-[var(--color-edge)] bg-[var(--color-surface-1)] px-4 py-4 sm:px-5 sm:py-5">
      <h2 className="mb-4 flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-[var(--color-ink-tertiary)]">
        <Award size={12} />
        Create Badge
      </h2>

      {/* Preset indicator */}
      {presetName && (
        <div className="mb-3 flex items-center gap-2 rounded-[var(--radius-sm)] border border-[var(--color-signal-muted)] bg-[var(--color-signal-muted)] px-2.5 py-1.5">
          <span className="flex-1 text-[11px] text-[var(--color-signal-text)]">
            Using preset: <strong>{presetName}</strong>
          </span>
          <button
            onClick={() => setPresetName(null)}
            className="text-[var(--color-signal-text)] opacity-60 transition-opacity duration-100 hover:opacity-100"
            aria-label="Dismiss preset indicator"
          >
            <X size={12} />
          </button>
        </div>
      )}

      {/* Mode selector */}
      <div className="mb-4">
        <span className="mb-1.5 block text-[11px] font-medium text-[var(--color-ink-tertiary)]">
          Type
        </span>
        <div className="flex flex-wrap gap-1.5">
          {BADGE_MODES.map((m) => (
            <button
              key={m.value}
              onClick={() => setMode(m.value)}
              className={`rounded-[var(--radius-sm)] border px-3 py-1.5 text-[11px] font-medium transition-colors duration-150 ${
                mode === m.value
                  ? "border-[var(--color-signal)] bg-[var(--color-signal-muted)] text-[var(--color-signal-text)]"
                  : "border-[var(--color-edge)] text-[var(--color-ink-tertiary)] hover:text-[var(--color-ink-secondary)]"
              }`}
            >
              <span className="block">{m.name}</span>
              <span className="block text-[9px] opacity-60">{m.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Pixel mode — simplified */}
      {isPixelMode && (
        <div className="mb-3">
          <div className="relative">
            <FieldLabel htmlFor="badge-tracking-label">Tracking label</FieldLabel>
            <input
              id="badge-tracking-label"
              type="text"
              value={trackingLabel}
              onChange={(e) => setTrackingLabel(e.target.value)}
              onFocus={() => setTrackingFocused(true)}
              onBlur={() => setTimeout(() => setTrackingFocused(false), 150)}
              className={INPUT_CLASS}
              placeholder="repository-name"
              autoComplete="off"
            />
            {trackingFocused && labelSuggestions.length > 0 && (
              <SuggestionList items={labelSuggestions.slice(0, 5)} onSelect={(v) => { setTrackingLabel(v); setTrackingFocused(false); }} />
            )}
          </div>
          <div className="mt-3 flex items-center gap-2 rounded-[var(--radius-sm)] bg-[var(--color-surface-inset)] px-3 py-3 text-[11px] text-[var(--color-ink-secondary)]">
            <Radio size={14} className="shrink-0 text-[var(--color-signal)]" />
            Invisible 1x1 SVG pixel. Embed in READMEs, emails, or HTML pages to silently track views.
          </div>
        </div>
      )}

      {/* Badge mode fields */}
      {!isPixelMode && (
        <>
          {/* Row 1: Tracking label + text fields */}
          <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="relative">
              <FieldLabel htmlFor="badge-tracking-label">Tracking label</FieldLabel>
              <input
                id="badge-tracking-label"
                type="text"
                value={trackingLabel}
                onChange={(e) => setTrackingLabel(e.target.value)}
                onFocus={() => setTrackingFocused(true)}
                onBlur={() => setTimeout(() => setTrackingFocused(false), 150)}
                className={INPUT_CLASS}
                placeholder="repository-name"
                autoComplete="off"
              />
              {trackingFocused && labelSuggestions.length > 0 && (
                <SuggestionList items={labelSuggestions.slice(0, 5)} onSelect={(v) => { setTrackingLabel(v); setTrackingFocused(false); }} />
              )}
            </div>

            {mode !== "static-single" && (
              <div>
                <FieldLabel htmlFor="badge-label-text">Label text</FieldLabel>
                <input id="badge-label-text" type="text" value={labelText} onChange={(e) => setLabelText(e.target.value)} className={INPUT_CLASS} placeholder="Mykle23" />
              </div>
            )}

            {mode !== "counter" && (
              <div>
                <FieldLabel htmlFor="badge-message-text">Message text</FieldLabel>
                <input id="badge-message-text" type="text" value={messageText} onChange={(e) => setMessageText(e.target.value)} className={INPUT_CLASS} placeholder={mode === "static-single" ? "optional (icon-only if empty)" : "PixelPulse"} />
              </div>
            )}
          </div>

          {/* Row 2: Color + Style */}
          <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <span className="mb-1.5 flex items-center gap-1 text-[11px] font-medium text-[var(--color-ink-tertiary)]">
                <Palette size={10} /> Color
              </span>
              <ChipGroup items={BADGE_COLORS} selected={color} onSelect={setColor} />
            </div>
            <div>
              <span className="mb-1.5 block text-[11px] font-medium text-[var(--color-ink-tertiary)]">Style</span>
              <ChipGroup items={BADGE_STYLES} selected={style} onSelect={setStyle} />
            </div>
          </div>

          {/* Row 3: Label color */}
          <div className="mb-3">
            <span className="mb-1.5 block text-[11px] font-medium text-[var(--color-ink-tertiary)]">Label color</span>
            <ChipGroup items={LABEL_COLORS} selected={labelColor} onSelect={setLabelColor} />
          </div>

          {/* Row 4: Logo + Logo color + Link */}
          <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="relative">
              <FieldLabel htmlFor="badge-logo">Logo</FieldLabel>
              <input
                id="badge-logo"
                type="text"
                value={logo}
                onChange={(e) => setLogo(e.target.value)}
                onFocus={() => setLogoFocused(true)}
                onBlur={() => setTimeout(() => setLogoFocused(false), 150)}
                className={INPUT_CLASS}
                placeholder="github"
                autoComplete="off"
              />
              {logoFocused && logoSuggestions.length > 0 && (
                <SuggestionList items={logoSuggestions.slice(0, 6)} onSelect={(v) => { setLogo(v); setLogoFocused(false); }} />
              )}
              <p className="mt-1 text-[10px] text-[var(--color-ink-muted)]">
                <a href="https://simpleicons.org" target="_blank" rel="noopener noreferrer" className="text-[var(--color-signal-text)] hover:underline">
                  Browse icons
                </a>
              </p>
            </div>

            <div>
              <FieldLabel htmlFor="badge-logo-color">Logo color</FieldLabel>
              <input id="badge-logo-color" type="text" value={logoColor} onChange={(e) => setLogoColor(e.target.value)} className={INPUT_CLASS} placeholder="white" />
            </div>

            <div>
              <FieldLabel htmlFor="badge-link">Link URL</FieldLabel>
              <input id="badge-link" type="text" value={link} onChange={(e) => setLink(e.target.value)} className={INPUT_CLASS} placeholder="https://github.com/..." />
            </div>
          </div>
        </>
      )}

      {/* Preview + snippets */}
      {hasTrackingLabel && (
        <>
          {!isPixelMode && previewUrl && (
            <div className="mb-4 flex items-center justify-center rounded-[var(--radius-sm)] border border-[var(--color-edge-subtle)] bg-[var(--color-surface-inset)] py-5">
              <img src={previewUrl} alt="Badge preview" className="h-6" key={previewUrl} />
            </div>
          )}

          <div className="min-w-0 space-y-2 border-t border-[var(--color-edge)] pt-3">
            <CopyRow label="Markdown" code={markdownSnippet} copied={copiedField === "md"} onCopy={() => copySnippet("md", markdownSnippet)} />
            <CopyRow label="HTML" code={htmlSnippet} copied={copiedField === "html"} onCopy={() => copySnippet("html", htmlSnippet)} />
            <CopyRow label="URL" code={fullUrl} copied={copiedField === "url"} onCopy={() => copySnippet("url", fullUrl)} />
          </div>
        </>
      )}

      {!hasTrackingLabel && (
        <p className="text-center text-[11px] text-[var(--color-ink-muted)]">
          Type a tracking label to preview the badge
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Sub-components                                                      */
/* ------------------------------------------------------------------ */

const INPUT_CLASS =
  "w-full rounded-[var(--radius-sm)] border border-[var(--color-edge)] bg-[var(--color-surface-2)] px-2.5 py-2 font-mono text-xs text-[var(--color-ink)] outline-none placeholder:text-[var(--color-ink-muted)] focus:border-[var(--color-edge-focus)]";

function FieldLabel({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-[11px] font-medium text-[var(--color-ink-tertiary)]">
      {children}
    </label>
  );
}

function ChipGroup({ items, selected, onSelect }: { items: ReadonlyArray<{ name: string; value: string }>; selected: string; onSelect: (value: string) => void }) {
  return (
    <div className="flex flex-wrap gap-1">
      {items.map((item) => (
        <button
          key={item.value}
          onClick={() => onSelect(item.value)}
          className={`rounded-[var(--radius-sm)] px-2 py-1 text-[10px] font-medium transition-colors duration-150 ${
            selected === item.value
              ? "bg-[var(--color-signal-muted)] text-[var(--color-signal-text)]"
              : "text-[var(--color-ink-tertiary)] hover:text-[var(--color-ink-secondary)]"
          }`}
        >
          {item.name}
        </button>
      ))}
    </div>
  );
}

function SuggestionList({ items, onSelect }: { items: string[]; onSelect: (value: string) => void }) {
  return (
    <div className="absolute top-full z-10 mt-1 w-full rounded-[var(--radius-sm)] border border-[var(--color-edge)] bg-[var(--color-surface-2)] py-1 shadow-lg">
      {items.map((s) => (
        <button
          key={s}
          onClick={() => onSelect(s)}
          className="w-full px-2.5 py-1.5 text-left font-mono text-xs text-[var(--color-ink-secondary)] transition-colors duration-100 hover:bg-[var(--color-surface-3)] hover:text-[var(--color-ink)]"
        >
          {s}
        </button>
      ))}
    </div>
  );
}

function CopyRow({ label, code, copied, onCopy }: { label: string; code: string; copied: boolean; onCopy: () => void }) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <span className="w-16 shrink-0 text-[11px] text-[var(--color-ink-tertiary)]">{label}</span>
      <pre className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap rounded-[var(--radius-sm)] border border-[var(--color-edge)] bg-[var(--color-surface-inset)] px-2.5 py-1.5 font-mono text-[11px] text-[var(--color-ink-secondary)]">
        {code}
      </pre>
      <button
        onClick={onCopy}
        className="flex shrink-0 items-center gap-1 text-[11px] text-[var(--color-ink-tertiary)] transition-colors duration-150 hover:text-[var(--color-ink-secondary)]"
        aria-label={copied ? "Copied" : "Copy to clipboard"}
      >
        {copied ? <Check size={11} /> : <Copy size={11} />}
      </button>
    </div>
  );
}
