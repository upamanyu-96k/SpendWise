import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { initials } from '../utils.js';
import Icon from './Icons.jsx';
import ThemeToggle from './ThemeToggle.jsx';

const NAV = [
  ['/', 'Dashboard', 'dashboard'],
  ['/transactions', 'Transactions', 'list'],
  ['/budgets', 'Budgets', 'target'],
  ['/analytics', 'Analytics', 'chart'],
];

export function Logo({ size = 'size-9' }) {
  return (
    <span className={`grid ${size} place-items-center rounded-xl bg-gradient-to-br from-brand to-violet-500 text-brand-fg shadow-glow`}>
      <Icon name="wallet" className="size-5" />
    </span>
  );
}

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const sideLink = ({ isActive }) =>
    `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${isActive ? 'bg-brand/10 text-brand' : 'text-muted hover:bg-raised hover:text-main'}`;
  const tabLink = ({ isActive }) =>
    `flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition ${isActive ? 'text-brand' : 'text-muted'}`;

  return (
    <div className="min-h-screen">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-line bg-surface/60 p-5 backdrop-blur-xl md:flex">
        <div className="mb-8 flex items-center gap-3 px-1">
          <Logo />
          <span className="text-lg font-semibold tracking-tight">SpendWise</span>
        </div>
        <nav className="flex flex-col gap-1" aria-label="Main">
          {NAV.map(([to, label, icon]) => (
            <NavLink key={to} to={to} end={to === '/'} className={sideLink}>
              <Icon name={icon} className="size-[18px]" />{label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto space-y-4">
          <ThemeToggle />
          <NavLink to="/profile" className={({ isActive }) => `flex items-center gap-3 rounded-xl border p-3 transition ${isActive ? 'border-brand/40 bg-brand/10' : 'border-line bg-raised/40 hover:bg-raised'}`}>
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand to-violet-500 text-sm font-semibold text-brand-fg">{initials(user?.name)}</span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium">{user?.name}</span>
              <span className="block truncate text-xs text-muted">View profile</span>
            </span>
          </NavLink>
          <button onClick={logout} className="btn-ghost w-full"><Icon name="logout" className="size-4" />Log out</button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-app/80 px-4 py-3 backdrop-blur-xl md:hidden">
        <div className="flex items-center gap-2.5"><Logo size="size-8" /><span className="font-semibold">SpendWise</span></div>
        <ThemeToggle compact />
      </header>

      <main className="md:pl-64">
        <div key={location.pathname} className="mx-auto max-w-6xl animate-fade-up p-4 pb-28 md:p-8 md:pb-10">
          <Outlet />
        </div>
      </main>

      {/* Mobile bottom tabs */}
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-line bg-surface/90 backdrop-blur-xl md:hidden" aria-label="Main">
        {[...NAV, ['/profile', 'Profile', 'user']].map(([to, label, icon]) => (
          <NavLink key={to} to={to} end={to === '/'} className={tabLink}>
            <Icon name={icon} className="size-5" />{label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
