import type { PageKey, UserRole } from '../types/index';
import {
  Zap, LayoutDashboard, MapPin, CalendarCheck, BatteryCharging, CreditCard,
  BarChart3, Brain, FlaskConical, Settings, LogOut, Menu, X, Shield, Briefcase,
} from 'lucide-react';

interface NavItem {
  key: PageKey;
  label: string;
  icon: typeof Zap;
}

const customerNav: NavItem[] = [
  { key: 'dashboard', label: 'Customer Dashboard', icon: LayoutDashboard },
  { key: 'stations', label: 'Stations', icon: MapPin },
  { key: 'bookings', label: 'Bookings', icon: CalendarCheck },
  { key: 'charging', label: 'Charging Session', icon: BatteryCharging },
  { key: 'payments', label: 'Payments', icon: CreditCard },
  { key: 'analytics', label: 'Analytics', icon: BarChart3 },
  { key: 'ai', label: 'AI Intelligence', icon: Brain },
  { key: 'simulator', label: 'What-If Simulator', icon: FlaskConical },
];

const operatorNav: NavItem[] = [
  { key: 'operator', label: 'Operator Dashboard', icon: Briefcase },
  { key: 'stations', label: 'Stations', icon: MapPin },
  { key: 'bookings', label: 'Bookings', icon: CalendarCheck },
  { key: 'charging', label: 'Charging Sessions', icon: BatteryCharging },
  { key: 'analytics', label: 'Analytics', icon: BarChart3 },
  { key: 'ai', label: 'AI Intelligence', icon: Brain },
  { key: 'simulator', label: 'What-If Simulator', icon: FlaskConical },
];

const adminNav: NavItem[] = [
  { key: 'admin', label: 'Admin Dashboard', icon: Shield },
  { key: 'operator', label: 'Operator Dashboard', icon: Briefcase },
  { key: 'stations', label: 'Stations', icon: MapPin },
  { key: 'analytics', label: 'Analytics', icon: BarChart3 },
  { key: 'ai', label: 'AI Intelligence', icon: Brain },
  { key: 'simulator', label: 'What-If Simulator', icon: FlaskConical },
];

const bottomNav: NavItem[] = [
  { key: 'settings', label: 'Settings', icon: Settings },
];

interface SidebarProps {
  currentPage: PageKey;
  onNavigate: (page: PageKey) => void;
  role: UserRole;
  userName: string;
  onLogout: () => void;
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
}

export default function Sidebar({ currentPage, onNavigate, role, userName, onLogout, open, onOpen, onClose }: SidebarProps) {
  let navItems: NavItem[];
  if (role === 'CUSTOMER') navItems = customerNav;
  else if (role === 'OPERATOR') navItems = operatorNav;
  else navItems = adminNav;

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={onOpen}
        className="fixed left-4 top-4 z-30 rounded-lg border border-slate-700 bg-slate-800 p-2 text-slate-300 lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Overlay */}
      {open && <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={onClose} />}

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 z-50 h-screen w-64 transform border-r border-slate-700/60 bg-slate-900/95 backdrop-blur transition-transform duration-200 lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-16 items-center justify-between border-b border-slate-700/60 px-5">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-gradient-to-br from-emerald-400 to-teal-600 p-1.5">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white">EV-NEXUS</span>
          </div>
          <button onClick={onClose} className="text-slate-400 lg:hidden">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex h-[calc(100%-4rem)] flex-col px-3 py-4">
          <div className="mb-4 rounded-lg bg-slate-800/60 p-3">
            <p className="text-sm font-medium text-white">{userName}</p>
            <span className="mt-1 inline-block rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-400">
              {role}
            </span>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => { onNavigate(item.key); onClose(); }}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ${
                  currentPage === item.key
                    ? 'bg-emerald-500/15 text-emerald-400'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                <item.icon style={{ width: 18, height: 18 }} />
                {item.label}
              </button>
            ))}

            <div className="my-2 border-t border-slate-700/40" />

            {bottomNav.map((item) => (
              <button
                key={item.key}
                onClick={() => { onNavigate(item.key); onClose(); }}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ${
                  currentPage === item.key
                    ? 'bg-emerald-500/15 text-emerald-400'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                <item.icon style={{ width: 18, height: 18 }} />
                {item.label}
              </button>
            ))}
          </nav>

          <button
            onClick={onLogout}
            className="mt-2 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-400 transition hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOut style={{ width: 18, height: 18 }} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
