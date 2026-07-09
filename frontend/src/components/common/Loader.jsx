export function Loader({ label = 'Loading' }) {
  return (
    <div className="flex items-center gap-2 text-sm text-ink-faint py-8 justify-center">
      <span className="w-3 h-3 border-2 border-ink-faint border-t-transparent rounded-full animate-spin" />
      {label}
    </div>
  );
}

export function Skeleton({ className = '' }) {
  return <div className={`skeleton rounded-sm ${className}`} />;
}

export function SummaryCardsSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="border border-line bg-paper-card rounded-sm p-5">
          <Skeleton className="h-8 w-12 mb-3" />
          <Skeleton className="h-3 w-20" />
        </div>
      ))}
    </div>
  );
}

export function ChartSkeleton({ height = 'h-56' }) {
  return (
    <div className="border border-line bg-paper-card rounded-sm p-5">
      <Skeleton className="h-3 w-32 mb-4" />
      <Skeleton className={`w-full ${height}`} />
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div>
      <SummaryCardsSkeleton />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="grid grid-cols-1 gap-6">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
        <div className="grid grid-cols-1 gap-6">
          <ChartSkeleton />
          <ChartSkeleton height="h-40" />
        </div>
      </div>
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
