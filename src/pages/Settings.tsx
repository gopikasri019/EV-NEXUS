import type { User } from '../types/index';
import ChartCard from '../components/ChartCard';
import { User as UserIcon, Mail, Shield, Zap, RotateCcw } from 'lucide-react';
import { initializeDemoData } from '../data/demoData';
import { storage } from '../services/storage';

interface SettingsProps {
  user: User;
  onReset: () => void;
}

export default function Settings({ user, onReset }: SettingsProps) {
  function resetData() {
    if (confirm('Reset all demo data? This will clear all bookings, sessions, and payments.')) {
      localStorage.clear();
      initializeDemoData(true);
      storage.setUser(user);
      onReset();
    }
  }

  return (
    <div className="space-y-6">
      <ChartCard title="Account Information">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-emerald-500/10 p-3">
              <UserIcon className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Name</p>
              <p className="text-lg font-medium text-white">{user.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-teal-500/10 p-3">
              <Mail className="h-6 w-6 text-teal-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Email</p>
              <p className="text-lg font-medium text-white">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-cyan-500/10 p-3">
              <Shield className="h-6 w-6 text-cyan-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Role</p>
              <p className="text-lg font-medium text-white">{user.role}</p>
            </div>
          </div>
        </div>
      </ChartCard>

      <ChartCard title="About EV-NEXUS">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-emerald-400">
            <Zap className="h-5 w-5" />
            <span className="text-sm font-semibold">AI-Powered EV Charging Management and Energy Optimization System</span>
          </div>
          <p className="text-sm text-slate-400">
            EV-NEXUS is an intelligent EV charging platform that combines demand prediction,
            smart charger recommendations, and energy optimization to deliver a seamless charging experience.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg border border-slate-700/50 bg-slate-800/30 p-3">
              <p className="text-xs text-slate-400">Core Concept</p>
              <p className="mt-1 font-medium text-white">PREDICT - ANALYZE - OPTIMIZE - RECOMMEND</p>
            </div>
            <div className="rounded-lg border border-slate-700/50 bg-slate-800/30 p-3">
              <p className="text-xs text-slate-400">Data Storage</p>
              <p className="mt-1 font-medium text-white">Browser localStorage</p>
            </div>
          </div>
        </div>
      </ChartCard>

      <ChartCard title="Data Management">
        <p className="mb-4 text-sm text-slate-400">
          Reset all demo data to its initial state. This will clear all bookings, charging sessions, and payments,
          and restore the original demo dataset.
        </p>
        <button
          onClick={resetData}
          className="flex items-center gap-2 rounded-lg bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-400 transition hover:bg-red-500/20"
        >
          <RotateCcw className="h-4 w-4" />
          Reset Demo Data
        </button>
      </ChartCard>
    </div>
  );
}
