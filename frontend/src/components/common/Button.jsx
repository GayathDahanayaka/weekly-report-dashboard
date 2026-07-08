export default function Button({ variant = 'primary', className = '', children, ...props }) {
  const base =
    'inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-sm transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-ink text-paper hover:bg-ink-soft',
    accent: 'bg-accent text-ink hover:bg-accent-dark',
    ghost: 'bg-transparent text-ink border border-line hover:bg-paper-dim',
    danger: 'bg-transparent text-danger border border-danger/40 hover:bg-danger-soft',
  };

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
