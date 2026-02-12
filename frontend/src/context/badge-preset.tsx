import { createContext, useContext, useState, useCallback } from "react";
import type { BadgePreset } from "../lib/badge-presets";

interface BadgePresetState {
  /** Preset waiting to be consumed by the BadgeCreator */
  pending: BadgePreset | null;
  /** Push a preset — BadgeCreator will pick it up and clear it */
  apply: (preset: BadgePreset) => void;
  /** Called by BadgeCreator after it reads the preset */
  consume: () => void;
}

const BadgePresetContext = createContext<BadgePresetState | null>(null);

export function BadgePresetProvider({ children }: { children: React.ReactNode }) {
  const [pending, setPending] = useState<BadgePreset | null>(null);

  const apply = useCallback((preset: BadgePreset) => {
    setPending(preset);
  }, []);

  const consume = useCallback(() => {
    setPending(null);
  }, []);

  return (
    <BadgePresetContext.Provider value={{ pending, apply, consume }}>
      {children}
    </BadgePresetContext.Provider>
  );
}

export function usePreset(): BadgePresetState {
  const ctx = useContext(BadgePresetContext);
  if (!ctx) throw new Error("usePreset must be used inside BadgePresetProvider");
  return ctx;
}
