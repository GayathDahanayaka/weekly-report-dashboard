export function Field({ label, hint, error, required, children }) {
  return (
    <label className="block">
      <span className="flex items-center gap-1 text-xs uppercase tracking-wide text-ink-faint font-medium mb-1.5">
        {label}
        {required && <span className="text-accent-dark normal-case">*</span>}
      </span>
      {children}
      {hint && !error && <span className="block text-xs text-ink-faint mt-1.5">{hint}</span>}
      {error && <span className="block text-xs text-danger mt-1.5">{error}</span>}
    </label>
  );
}

const fieldClasses =
  'w-full bg-paper border border-line rounded-sm px-3 py-2.5 text-sm text-ink placeholder:text-ink-faint/60 outline-none transition-all duration-150 hover:border-ink-faint focus:border-ink focus:ring-2 focus:ring-accent/25 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:border-line';

export function Input({ className = '', ...props }) {
  return <input className={`${fieldClasses} ${className}`} {...props} />;
}

export function Textarea({ className = '', rows = 3, ...props }) {
  return <textarea className={`${fieldClasses} resize-y min-h-[5.5rem] leading-relaxed ${className}`} rows={rows} {...props} />;
}

export function Select({ children, className = '', ...props }) {
  return (
    <div className="relative">
      <select
        className={`${fieldClasses} appearance-none pr-9 cursor-pointer ${className}`}
        {...props}
      >
        {children}
      </select>
      <svg
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-faint"
        viewBox="0 0 20 20"
        fill="none"
        aria-hidden="true"
      >
        <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}
