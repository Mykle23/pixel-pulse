export function Spinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--color-edge-strong)] border-t-[var(--color-signal)]" />
    </div>
  );
}
