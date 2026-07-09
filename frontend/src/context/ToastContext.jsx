import { createContext, useCallback, useContext, useRef, useState } from 'react';

const ToastContext = createContext(null);

const ICONS = {
  success: '✓',
  error: '!',
  info: 'i',
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const dismiss = useCallback((id) => {
    setToasts((t) => t.map((toast) => (toast.id === id ? { ...toast, leaving: true } : toast)));
    setTimeout(() => {
      setToasts((t) => t.filter((toast) => toast.id !== id));
    }, 150);
  }, []);

  const showToast = useCallback(
    (message, type = 'success') => {
      const id = Date.now() + Math.random();
      setToasts((t) => [...t, { id, message, type, leaving: false }]);
      timers.current[id] = setTimeout(() => dismiss(id), 3500);
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        className="fixed bottom-6 left-6 z-50 flex flex-col gap-2 w-[calc(100vw-3rem)] sm:w-auto"
        role="region"
        aria-live="polite"
        aria-label="Notifications"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`flex items-start gap-2.5 pl-3 pr-2 py-3 rounded-sm text-sm shadow-lg border sm:max-w-sm ${
              t.leaving ? 'animate-fadeOut' : 'animate-scaleIn'
            } ${
              t.type === 'error'
                ? 'bg-danger-soft border-danger/30 text-danger'
                : t.type === 'info'
                  ? 'bg-paper-card border-line text-ink'
                  : 'bg-ink border-ink-soft text-paper'
            }`}
          >
            <span
              className={`shrink-0 w-4 h-4 mt-0.5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                t.type === 'error'
                  ? 'bg-danger text-paper'
                  : t.type === 'info'
                    ? 'bg-ink-faint text-paper'
                    : 'bg-accent text-ink'
              }`}
            >
              {ICONS[t.type] || ICONS.success}
            </span>
            <span className="flex-1 leading-snug">{t.message}</span>
            <button
              onClick={() => dismiss(t.id)}
              className="shrink-0 opacity-60 hover:opacity-100 transition-opacity px-1"
              aria-label="Dismiss notification"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
