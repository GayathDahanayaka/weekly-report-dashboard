export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  children,
  ...props
}) {
  const base =
    'inline-flex items-center justify-center gap-2 font-medium rounded-sm transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]';

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-5 py-3 text-sm',
  };

  const variants = {
    primary: 'bg-ink text-paper hover:bg-ink-soft',
    accent: 'bg-accent text-ink hover:bg-accent-dark',
    ghost: 'bg-transparent text-ink border border-line hover:bg-paper-dim hover:border-ink-faint',
    danger: 'bg-transparent text-danger border border-danger/40 hover:bg-danger-soft',
    dangerSolid: 'bg-danger text-paper hover:bg-danger/90',
  };

  return (
    <button
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && (
        <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
      )}
      {children}
    </button>
  );
}
