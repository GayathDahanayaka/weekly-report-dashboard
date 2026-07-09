import Sidebar from './Sidebar';
import ChatWidget from '../ai/ChatWidget';
import { useAuth } from '../../context/AuthContext';

export default function AppLayout({ title, subtitle, children }) {
  const { user } = useAuth();

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-paper">
      <Sidebar />
      <main className="flex-1 px-4 sm:px-6 md:px-10 py-6 md:py-9 max-w-6xl w-full">
        <header className="mb-6 md:mb-8">
          <p className="text-xs uppercase tracking-widest text-ink-faint font-mono mb-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
          <h1 className="font-display text-2xl md:text-3xl text-ink">{title}</h1>
          {subtitle && <p className="text-sm text-ink-faint mt-1">{subtitle}</p>}
        </header>
        {children}
      </main>
      {user?.role === 'manager' && <ChatWidget />}
    </div>
  );
}
