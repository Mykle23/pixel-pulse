import { useState } from "react";
import { Copy, Check } from "lucide-react";

interface BadgePreviewProps {
  label: string;
}

/**
 * Static badge preview + embed snippets for a label.
 * No customization — just a quick visual + copy-paste codes.
 */
export function BadgePreview({ label }: BadgePreviewProps) {
  const badgeUrl = `/badge/${encodeURIComponent(label)}.svg`;
  const pixelGif = `/pixel/${encodeURIComponent(label)}.gif`;
  const fullBadge = `${window.location.origin}${badgeUrl}`;
  const fullPixel = `${window.location.origin}${pixelGif}`;
  // Use preview=true so viewing this page does NOT count as a visit
  const previewBadgeUrl = `${badgeUrl}?preview=true`;

  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--color-edge)] bg-[var(--color-surface-1)] px-4 py-4">
      <h2 className="mb-3 text-[11px] font-medium uppercase tracking-wider text-[var(--color-ink-tertiary)]">
        Embed
      </h2>

      {/* Badge preview — uses preview=true to avoid counting */}
      <div className="mb-4 flex items-center gap-3 rounded-[var(--radius-sm)] border border-[var(--color-edge-subtle)] bg-[var(--color-surface-inset)] px-4 py-3">
        <img src={previewBadgeUrl} alt="Badge" className="h-5" />
        <span className="text-[11px] text-[var(--color-ink-tertiary)]">
          Live badge for this label
        </span>
      </div>

      {/* Snippets */}
      <div className="space-y-2">
        <SnippetRow
          label="Badge (md)"
          code={`![Mykle23](${fullBadge})`}
        />
        <SnippetRow
          label="Pixel (md)"
          code={`![](${fullPixel})`}
        />
        <SnippetRow
          label="HTML"
          code={`<img src="${fullPixel}" alt="" width="1" height="1" />`}
        />
      </div>
    </div>
  );
}

function SnippetRow({ label, code }: { label: string; code: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="flex items-center gap-2">
      <span className="w-20 shrink-0 text-[11px] text-[var(--color-ink-tertiary)]">
        {label}
      </span>
      <pre className="flex-1 overflow-x-auto rounded-[var(--radius-sm)] border border-[var(--color-edge)] bg-[var(--color-surface-inset)] px-2.5 py-1.5 font-mono text-[11px] text-[var(--color-ink-secondary)]">
        {code}
      </pre>
      <button
        onClick={handleCopy}
        className="flex shrink-0 items-center gap-1 text-[11px] text-[var(--color-ink-tertiary)] transition-colors duration-150 hover:text-[var(--color-ink-secondary)]"
        aria-label={copied ? "Copied" : "Copy to clipboard"}
      >
        {copied ? <Check size={11} /> : <Copy size={11} />}
      </button>
    </div>
  );
}
