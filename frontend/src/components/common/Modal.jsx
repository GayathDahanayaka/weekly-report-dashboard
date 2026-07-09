import { useEffect, useRef } from 'react';

export default function Modal({ open, onClose, children, labelledBy }) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', handleKeyDown);

    // lock background scroll while the modal is open
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // move focus into the dialog for keyboard users
    panelRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-ink/40 backdrop-blur-[1px] flex items-start sm:items-center justify-center p-4 z-50 overflow-y-auto animate-[fadeIn_0.15s_ease-out]"
      onClick={onClose}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
        className="bg-paper-card rounded-sm border border-line max-w-lg w-full my-8 p-6 sm:p-7 relative shadow-2xl outline-none animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-ink-faint hover:text-ink hover:bg-paper-dim rounded-full w-7 h-7 flex items-center justify-center text-sm transition-colors"
          aria-label="Close"
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}
