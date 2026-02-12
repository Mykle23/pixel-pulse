import { useState, useMemo } from "react";
import {
  PRESET_CATEGORIES,
  ALL_PRESETS,
  type BadgePreset,
} from "../lib/badge-presets";
import { usePreset } from "../context/badge-preset";
import { Sparkles, Search, X } from "lucide-react";

/* ------------------------------------------------------------------ */
/* URL builder — renders each preset as a message-only badge using     */
/* ?preview=true to avoid registering visits.                         */
/* ------------------------------------------------------------------ */

function presetToPreviewUrl(preset: BadgePreset): string {
  const params = new URLSearchParams();
  params.set("preview", "true");
  params.set("label", "");
  params.set("message", preset.label);
  if (preset.color) params.set("color", preset.color);
  if (preset.style && preset.style !== "flat") params.set("style", preset.style);
  if (preset.labelColor) params.set("labelColor", preset.labelColor);
  if (preset.logo) params.set("logo", preset.logo);
  if (preset.logoColor) params.set("logoColor", preset.logoColor);
  return `/badge/preview.svg?${params.toString()}`;
}

/* ------------------------------------------------------------------ */
/* Component                                                          */
/* ------------------------------------------------------------------ */

export function BadgePresetGallery() {
  const { apply } = usePreset();
  const [search, setSearch] = useState("");

  const query = search.trim().toLowerCase();

  // When searching, show flat results across all categories
  const searchResults = useMemo(() => {
    if (!query) return null;
    return ALL_PRESETS.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.logo.toLowerCase().includes(query) ||
        p.label.toLowerCase().includes(query)
    );
  }, [query]);

  function handleClick(preset: BadgePreset) {
    apply(preset);
    const creator = document.getElementById("badge-creator");
    if (creator) {
      creator.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }

  return (
    <div className="min-w-0 rounded-[var(--radius-md)] border border-[var(--color-edge)] bg-[var(--color-surface-1)] px-4 py-4 sm:px-5 sm:py-5">
      <h2 className="mb-3 flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-[var(--color-ink-tertiary)]">
        <Sparkles size={12} />
        Quick Presets
      </h2>

      {/* Search */}
      <div className="relative mb-4">
        <Search
          size={13}
          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-ink-muted)]"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search badges..."
          className="w-full rounded-[var(--radius-sm)] border border-[var(--color-edge)] bg-[var(--color-surface-2)] py-2 pl-8 pr-8 text-xs text-[var(--color-ink)] outline-none placeholder:text-[var(--color-ink-muted)] focus:border-[var(--color-edge-focus)]"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--color-ink-muted)] transition-colors duration-100 hover:text-[var(--color-ink)]"
            aria-label="Clear search"
          >
            <X size={13} />
          </button>
        )}
      </div>

      {/* Content area */}
      <div>
        {searchResults !== null ? (
          /* -------- Search results (flat) -------- */
          searchResults.length === 0 ? (
            <p className="py-6 text-center text-[11px] text-[var(--color-ink-muted)]">
              No badges found for &ldquo;{search.trim()}&rdquo;
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {searchResults.map((preset) => (
                <PresetButton
                  key={preset.name}
                  preset={preset}
                  onClick={handleClick}
                />
              ))}
            </div>
          )
        ) : (
          /* -------- Categories -------- */
          <div className="space-y-4">
            {PRESET_CATEGORIES.map((category) => (
              <section key={category.name}>
                <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-ink-muted)]">
                  {category.name}
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {category.presets.map((preset) => (
                    <PresetButton
                      key={preset.name}
                      preset={preset}
                      onClick={handleClick}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>

      <p className="mt-3 text-[10px] text-[var(--color-ink-muted)]">
        {ALL_PRESETS.length} presets — click to auto-fill the creator
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Preset button                                                       */
/* ------------------------------------------------------------------ */

function PresetButton({
  preset,
  onClick,
}: {
  preset: BadgePreset;
  onClick: (p: BadgePreset) => void;
}) {
  return (
    <button
      onClick={() => onClick(preset)}
      className="group rounded-[var(--radius-sm)] p-0.5 transition-all duration-150 hover:bg-[var(--color-surface-2)] hover:scale-[1.04] focus:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-signal)]"
      title={`Use ${preset.name} preset`}
    >
      <img
        src={presetToPreviewUrl(preset)}
        alt={preset.name}
        className="block h-5"
        loading="lazy"
      />
    </button>
  );
}
