import { NavLink, Outlet } from 'react-router-dom';
import { NAV_ITEMS } from '../../config/navigation.js';

const linkClass = ({ isActive }) =>
  `whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-accent ${
    isActive ? 'bg-line text-accent' : 'text-muted hover:bg-line hover:text-ink'
  }`;

const AppLayout = () => (
  <div className="flex min-h-screen flex-col md:flex-row">
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-accent focus:px-3 focus:py-2 focus:text-canvas"
    >
      Skip to content
    </a>

    <header className="border-b border-line bg-panel md:w-56 md:shrink-0 md:border-b-0 md:border-r">
      <div className="px-4 py-4 text-lg font-semibold text-accent">FlowOps</div>
      <nav aria-label="Main" className="flex gap-1 overflow-x-auto px-2 pb-3 md:flex-col md:pb-4">
        {NAV_ITEMS.map(({ to, label }) => (
          <NavLink key={to} to={to} end={to === '/'} className={linkClass}>
            {label}
          </NavLink>
        ))}
      </nav>
    </header>

    <main id="main" className="flex-1 p-4 md:p-8">
      <Outlet />
    </main>
  </div>
);

export default AppLayout;
