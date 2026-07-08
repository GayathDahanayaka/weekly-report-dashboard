export function Field({ label, hint, error, children }) {
  return (
    <label className="block">
      <span className="block text-xs uppercase tracking-wide text-ink-faint font-medium mb-1.5">
        {label}
      </span>
      {children}
      {hint && !error && <span className="block text-xs text-ink-faint mt-1">{hint}</span>}
      {error && <span className="block text-xs text-danger mt-1">{error}</span>}
    </label>
  );
}

const fieldClasses =
  'w-full bg-transparent border-b border-line focus:border-ink px-0.5 py-2 text-sm text-ink placeholder:text-ink-faint/60 outline-none transition-colors';

export function Input(props) {
  return <input className={fieldClasses} {...props} />;
}

export function Textarea(props) {
  return <textarea className={`${fieldClasses} resize-none`} rows={3} {...props} />;
}

export function Select({ children, ...props }) {
  return (
    <select className={`${fieldClasses} bg-paper`} {...props}>
      {children}
    </select>
  );
}
