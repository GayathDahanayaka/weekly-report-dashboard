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
    <aside className="w-full md:w-60 md:shrink-0 bg-ink text-paper flex flex-col md:min-h-screen">
      <div className="flex md:flex-col items-center md:items-stretch justify-between md:justify-start px-5 md:px-6 py-4 md:py-7 border-b border-paper/10">
        <div className="leading-none">
          <p className="font-display text-lg md:text-xl inline md:block">Weekly </p>
          <p className="font-display text-lg md:text-xl text-accent inline md:block">WorkHub</p>
        </div>
        <button
          onClick={logout}
          className="md:hidden text-xs uppercase tracking-wide text-paper/60 hover:text-accent transition-colors"
        >
          Log out
        </button>
      </div>

      <nav className="flex md:flex-col md:py-4 overflow-x-auto">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center gap-2 md:gap-3 px-5 md:px-6 py-3 text-sm whitespace-nowrap transition-colors border-b-2 md:border-b-0 md:border-l-2 ${
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

      <div className="hidden md:block px-6 py-5 border-t border-paper/10 mt-auto">
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
