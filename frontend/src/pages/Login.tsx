import { useState } from "react";
import { useNavigate } from "react-router";
import { Activity, ArrowRight } from "lucide-react";
import { setApiKey } from "../api/client";

export function Login() {
  const [key, setKey] = useState("");
  const navigate = useNavigate();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setApiKey(key.trim());
    navigate("/");
  }

  function handleSkip() {
    setApiKey("");
    navigate("/");
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-[var(--color-canvas)]">
      <div className="w-full max-w-sm px-6">
        {/* Brand */}
        <div className="mb-10 flex items-center justify-center gap-2">
          <Activity size={20} className="text-[var(--color-signal)]" />
          <span className="text-lg font-semibold tracking-tight text-[var(--color-ink)]">
            PixelPulse
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="api-key"
              className="mb-1.5 block text-xs font-medium text-[var(--color-ink-secondary)]"
            >
              API Key
            </label>
            <input
              id="api-key"
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="Enter your API key"
              autoFocus
              className="w-full rounded-[var(--radius-md)] border border-[var(--color-edge-strong)] bg-[var(--color-surface-inset)] px-3 py-2 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-muted)] outline-none transition-colors duration-150 focus:border-[var(--color-edge-focus)]"
            />
          </div>

          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-signal)] px-4 py-2 text-sm font-medium text-white transition-opacity duration-150 hover:opacity-90"
          >
            Connect
            <ArrowRight size={14} />
          </button>
        </form>

        <button
          onClick={handleSkip}
          className="mt-4 w-full text-center text-xs text-[var(--color-ink-tertiary)] transition-colors duration-150 hover:text-[var(--color-ink-secondary)]"
        >
          Continue without key (public endpoints only)
        </button>
      </div>
    </div>
  );
}
