import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';

const links = [
  ['/', 'Dashboard'],
  ['/transactions', 'Transactions'],
  ['/budgets', 'Budgets'],
  ['/analytics', 'Analytics'],
];

export default function Layout() {
  const { user, logout } = useAuth();
  const linkClass = ({ isActive }) =>
    `px-3 py-2 rounded-md text-sm whitespace-nowrap ${isActive ? 'bg-brand-soft text-brand-dark font-semibold' : 'text-ink/70 hover:bg-white'}`;
  return (
    <div className="min-h-screen md:flex">
      <aside className="md:w-56 md:min-h-screen md:border-r border-b md:border-b-0 border-line bg-white/60 p-4 md:flex md:flex-col">
        <div className="flex items-center justify-between md:block">
          <p className="font-display text-2xl md:mb-6">SpendWise</p>
          <button onClick={logout} className="md:hidden text-sm text-ink/70 underline">Log out</button>
        </div>
        <nav className="flex md:flex-col gap-1 overflow-x-auto mt-2 md:mt-0" aria-label="Main">
          {links.map(([to, label]) => (
            <NavLink key={to} to={to} end={to === '/'} className={linkClass}>{label}</NavLink>
          ))}
        </nav>
        <div className="hidden md:block mt-auto pt-6 text-sm">
          <p className="font-medium truncate">{user?.name}</p>
          <p className="text-ink/60 truncate mb-2">{user?.email}</p>
          <button onClick={logout} className="btn-ghost w-full">Log out</button>
        </div>
      </aside>
      <main className="flex-1 p-4 md:p-8 max-w-6xl w-full mx-auto"><Outlet /></main>
    </div>
  );
}
