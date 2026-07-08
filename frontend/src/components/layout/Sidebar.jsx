import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const memberLinks = [{ to: '/reports', label: 'My Reports', mark: 'MR' }];
const managerLinks = [
  { to: '/dashboard', label: 'Team Dashboard', mark: 'TD' },
  { to: '/projects', label: 'Projects', mark: 'PR' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const links = user?.role === 'manager' ? managerLinks : memberLinks;

  return (
    <aside className="w-60 shrink-0 bg-ink text-paper flex flex-col min-h-screen">
      <div className="px-6 py-7 border-b border-paper/10">
        <p className="font-display text-xl leading-none">Weekly</p>
        <p className="font-display text-xl leading-none text-accent">Ledger</p>
      </div>

      <nav className="flex-1 py-4">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-6 py-3 text-sm transition-colors border-l-2 ${
                isActive
                  ? 'border-accent bg-paper/5 text-paper'
                  : 'border-transparent text-paper/60 hover:text-paper hover:bg-paper/5'
              }`
            }
          >
            <span className="font-mono text-[10px] text-accent w-6">{link.mark}</span>
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="px-6 py-5 border-t border-paper/10">
        <p className="text-sm text-paper/90">{user?.name}</p>
        <p className="text-xs text-paper/50 capitalize mb-3">{user?.role}</p>
        <button
          onClick={logout}
          className="text-xs uppercase tracking-wide text-paper/60 hover:text-accent transition-colors"
        >
          Log out
        </button>
      </div>
    </aside>
  );
}
