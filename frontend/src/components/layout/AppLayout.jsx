import Sidebar from './Sidebar';

export default function AppLayout({ title, subtitle, children }) {
  return (
    <div className="flex min-h-screen bg-paper">
      <Sidebar />
      <main className="flex-1 px-10 py-9 max-w-6xl">
        <header className="mb-8">
          <p className="text-xs uppercase tracking-widest text-ink-faint font-mono mb-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
          <h1 className="font-display text-3xl text-ink">{title}</h1>
          {subtitle && <p className="text-sm text-ink-faint mt-1">{subtitle}</p>}
        </header>
        {children}
      </main>
    </div>
  );
}
