import { Zap } from 'lucide-react';
import type { PageKey } from '../types/index';

const titles: Record<PageKey, { title: string; subtitle: string }> = {
  dashboard: { title: 'Customer Dashboard', subtitle: 'Monitor your charging activity' },
  stations: { title: 'Charging Stations', subtitle: 'Find and book EV chargers near you' },
  bookings: { title: 'My Bookings', subtitle: 'Manage your charger reservations' },
  charging: { title: 'Charging Session', subtitle: 'Start and monitor your charging session' },
  payments: { title: 'Payments', subtitle: 'Your payment history and invoices' },
  analytics: { title: 'Analytics', subtitle: 'Charging and energy analytics' },
  ai: { title: 'AI Intelligence', subtitle: 'AI-powered demand prediction and optimization' },
  simulator: { title: 'What-If Simulator', subtitle: 'Simulate EV traffic scenarios' },
  operator: { title: 'Operator Dashboard', subtitle: 'Monitor stations and revenue' },
  admin: { title: 'Admin Dashboard', subtitle: 'System-wide overview' },
  settings: { title: 'Settings', subtitle: 'Account and preferences' },
};

export default function Topbar({ currentPage }: { currentPage: PageKey }) {
  const info = titles[currentPage] || titles.dashboard;

  return (
    <header className="sticky top-0 z-20 border-b border-slate-700/60 bg-slate-900/80 px-4 py-4 backdrop-blur lg:px-8 lg:py-5">
      <div className="flex items-center justify-between pl-12 lg:pl-0">
        <div>
          <h1 className="text-lg font-bold text-white lg:text-xl">{info.title}</h1>
          <p className="mt-0.5 text-xs text-slate-400 lg:text-sm">{info.subtitle}</p>
        </div>
        <div className="hidden items-center gap-2 rounded-lg border border-slate-700/60 bg-slate-800/40 px-3 py-1.5 sm:flex">
          <Zap className="h-4 w-4 text-emerald-400" />
          <span className="text-xs font-medium text-slate-300">EV-NEXUS</span>
        </div>
      </div>
    </header>
  );
}
