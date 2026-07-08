export function Loader({ label = 'Loading' }) {
  return (
    <div className="flex items-center gap-2 text-sm text-ink-faint py-8 justify-center">
      <span className="w-3 h-3 border-2 border-ink-faint border-t-transparent rounded-full animate-spin" />
      {label}
    </div>
  );
}

export function EmptyState({ title, hint, action }) {
  return (
    <div className="text-center py-14 px-6 border border-dashed border-line rounded-sm">
      <p className="font-display text-lg text-ink mb-1">{title}</p>
      {hint && <p className="text-sm text-ink-faint mb-4">{hint}</p>}
      {action}
    </div>
  );
}

export function ErrorBanner({ message }) {
  if (!message) return null;
  return (
    <div className="border border-danger/30 bg-danger-soft text-danger text-sm px-4 py-3 rounded-sm mb-4">
      {message}
    </div>
  );
}
