import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const MAIN_NAV_ITEMS = [
  { to: '/dashboard', icon: '▦', label: 'Dashboard' },
  { to: '/chat', icon: '💬', label: 'AI Chat' },
  { to: '/clients', icon: '👥', label: 'Clients' },
  { to: '/portfolio', icon: '📊', label: 'Portfolio' },
  { to: '/compliance', icon: '🛡️', label: 'Compliance' },
  { to: '/research', icon: '📖', label: 'Research' }
];

const BOTTOM_NAV_ITEMS = [
  { to: '/alerts', icon: '🔔', label: 'Alerts', badge: 3 },
  { to: '/settings', icon: '⚙️', label: 'Settings' }
];

const Layout = () => {
  const { advisor, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = advisor?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'A';

  return (
    <div className="flex h-screen bg-surface-900 text-slate-200 font-body overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 flex flex-col bg-surface-800 border-r border-surface-600 transition-all duration-300">
        
        {/* Brand */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-surface-700">
          <div className="w-8 h-8 rounded-lg bg-surface-700 flex items-center justify-center flex-shrink-0 text-slate-300">
            🤖
          </div>
          <div>
            <div className="font-display font-bold text-white text-sm leading-tight">Advisor AI</div>
            <div className="text-[10px] text-slate-400">Intelligent Agent</div>
          </div>
        </div>

        {/* Advisor info */}
        <div className="p-5 border-b border-surface-700">
          <div className="flex items-center gap-3 mb-4 p-2 bg-surface-700/30 rounded-xl border border-surface-600/50">
            <div className="w-9 h-9 rounded-full bg-primary-600/20 text-primary-400 flex items-center justify-center text-xs font-bold border border-primary-500/30">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-slate-200 truncate">{advisor?.name}</div>
              <div className="text-[10px] text-slate-500 truncate">{advisor?.firm || 'New York - Advisor'}</div>
            </div>
          </div>

          <div className="flex items-end justify-between">
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Total AUM</p>
              <p className="text-lg font-display font-bold text-white">$485.2M</p>
            </div>
            <span className="text-xs text-green-400 font-medium">~ +0.59%</span>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-2 px-3">Navigation</p>
            <nav className="space-y-1">
              {MAIN_NAV_ITEMS.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 ${
                      isActive
                        ? 'bg-primary-500/20 text-slate-200 border border-primary-500/30'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-surface-700/50'
                    }`
                  }
                >
                  <span className="text-base flex-shrink-0 opacity-80">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </NavLink>
              ))}
            </nav>
          </div>
        </div>

        {/* Bottom actions */}
        <div className="p-4 space-y-1 border-t border-surface-700">
          {BOTTOM_NAV_ITEMS.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all duration-150 ${
                  isActive
                    ? 'bg-surface-700 text-slate-200'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-surface-700/50'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <span className="text-base opacity-80">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </div>
              {item.badge && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center">
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 text-slate-400 hover:text-red-400 hover:bg-red-400/10"
          >
            <span className="text-base opacity-80">⏻</span>
            <span className="font-medium">Sign Out</span>
          </button>
          
          <div className="mt-4 pt-4 px-3 border-t border-surface-700">
            <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-lg py-2 px-3">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-[10px] text-green-400 font-medium tracking-wide">All systems operational</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
