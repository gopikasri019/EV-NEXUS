import type { User, PageKey } from '../types/index';
import { storage } from '../services/storage';
import { useDriverLocation, haversineKm, formatDistance } from '../hooks/useDriverLocation';
import StatCard from '../components/StatCard';
import ChartCard from '../components/ChartCard';
import StatusBadge from '../components/StatusBadge';
import DriverLocationBar from '../components/DriverLocationBar';
import {
  Plug, CalendarCheck, Zap, DollarSign, Activity, TrendingUp, ArrowRight, MapPin, Navigation,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';

interface DashboardProps {
  user: User;
  onNavigate: (page: PageKey) => void;
}

const PIE_COLORS = ['#10b981', '#f59e0b', '#ef4444', '#6b7280', '#f97316'];

export default function CustomerDashboard({ user, onNavigate }: DashboardProps) {
  const driverLoc = useDriverLocation();
  const stations = storage.getStations();
  const chargers = storage.getChargers();
  const bookings = storage.getBookings().filter((b) => b.userId === user.id);
  const sessions = storage.getSessions().filter((s) => s.userId === user.id);
  const payments = storage.getPayments().filter((p) => p.userId === user.id);

  const availableChargers = chargers.filter((c) => c.status === 'AVAILABLE').length;
  const totalEnergy = sessions.reduce((s, ses) => s + ses.energy, 0);
  const totalSpent = payments.filter((p) => p.status === 'SUCCESS').reduce((s, p) => s + p.amount, 0);
  const activeSession = sessions.find((s) => s.status === 'IN_PROGRESS');

  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dayStr = d.toLocaleDateString('en-IN', { weekday: 'short' });
    const dayEnergy = sessions
      .filter((s) => new Date(s.startTime).toDateString() === d.toDateString())
      .reduce((sum, s) => sum + s.energy, 0);
    return { name: dayStr, energy: Math.round(dayEnergy * 10) / 10 };
  });

  const statusCounts = (['AVAILABLE', 'RESERVED', 'CHARGING', 'OFFLINE', 'MAINTENANCE'] as const).map((status) => ({
    name: status,
    value: chargers.filter((c) => c.status === status).length,
  }));

  const recentBookings = bookings.slice(0, 5);
  const recentPayments = payments.slice(0, 4);

  const nearbyStations = stations
    .map((s) => ({
      station: s,
      driverDist: driverLoc.coords ? haversineKm(driverLoc.coords, s) : s.distance,
    }))
    .sort((a, b) => a.driverDist - b.driverDist)
    .slice(0, 4);

  return (
    <div className="space-y-6">
      <DriverLocationBar
        coords={driverLoc.coords}
        onDetect={driverLoc.detect}
        onPickCity={(c) => driverLoc.setManualCity(c)}
        onClear={driverLoc.clear}
        loading={driverLoc.loading}
        error={driverLoc.error}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Available Chargers" value={availableChargers} icon={Plug} accent="emerald" />
        <StatCard title="My Bookings" value={bookings.length} icon={CalendarCheck} accent="teal" />
        <StatCard title="Energy Consumed" value={`${totalEnergy.toFixed(1)} kWh`} icon={Zap} accent="cyan" />
        <StatCard title="Total Spent" value={`₹${totalSpent.toFixed(0)}`} icon={DollarSign} accent="amber" />
      </div>

      {activeSession && (
        <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Activity className="h-5 w-5 text-cyan-400 animate-pulse" />
              <div>
                <p className="text-sm font-semibold text-white">Active Charging Session</p>
                <p className="text-xs text-slate-400">{activeSession.chargerCode} - {activeSession.stationName}</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('charging')}
              className="rounded-lg bg-cyan-500/20 px-3 py-1.5 text-xs font-medium text-cyan-400 transition hover:bg-cyan-500/30"
            >
              View Session
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Weekly Energy Consumption" subtitle="Your charging energy over the last 7 days">
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={weeklyData}>
              <defs>
                <linearGradient id="energyGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#fff' }} />
              <Area type="monotone" dataKey="energy" stroke="#10b981" fill="url(#energyGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Charger Status Distribution" subtitle="Live charger availability across all stations">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={statusCounts} cx="50%" cy="50%" innerRadius={45} outerRadius={80} dataKey="value">
                {statusCounts.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#fff' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap justify-center gap-3">
            {statusCounts.map((s, i) => (
              <div key={s.name} className="flex items-center gap-1.5 text-xs text-slate-400">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: PIE_COLORS[i] }} />
                {s.name} ({s.value})
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard
          title="Recent Bookings"
          action={
            <button onClick={() => onNavigate('bookings')} className="flex items-center gap-1 text-sm text-emerald-400 hover:text-emerald-300">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </button>
          }
        >
          {recentBookings.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">
              No bookings yet.{' '}
              <button onClick={() => onNavigate('stations')} className="text-emerald-400">Find a station</button>
            </p>
          ) : (
            <div className="space-y-3">
              {recentBookings.map((b) => (
                <div key={b.id} className="flex items-center justify-between rounded-lg border border-slate-700/50 bg-slate-800/30 p-3">
                  <div>
                    <p className="text-sm font-medium text-white">{b.stationName}</p>
                    <p className="text-xs text-slate-400">{b.chargerCode} - {b.date}</p>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    b.status === 'CONFIRMED' ? 'bg-emerald-500/15 text-emerald-400' :
                    b.status === 'COMPLETED' ? 'bg-blue-500/15 text-blue-400' :
                    b.status === 'CANCELLED' ? 'bg-red-500/15 text-red-400' :
                    'bg-amber-500/15 text-amber-400'
                  }`}>{b.status}</span>
                </div>
              ))}
            </div>
          )}
        </ChartCard>

        <ChartCard
          title="Nearby Stations"
          subtitle={driverLoc.coords ? `Sorted by distance from ${driverLoc.coords.label ?? 'your location'}` : 'Sorted by default distance'}
          action={
            <button onClick={() => onNavigate('stations')} className="flex items-center gap-1 text-sm text-emerald-400 hover:text-emerald-300">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </button>
          }
        >
          <div className="space-y-3">
            {nearbyStations.map(({ station: s, driverDist }) => {
              const stationChargers = chargers.filter((c) => c.stationId === s.id);
              const avail = stationChargers.filter((c) => c.status === 'AVAILABLE').length;
              return (
                <button
                  key={s.id}
                  onClick={() => onNavigate('stations')}
                  className="block w-full rounded-lg border border-slate-700/50 bg-slate-800/30 p-3 text-left transition hover:border-emerald-500/40"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-3">
                      <div className="rounded-lg bg-emerald-500/10 p-2">
                        <MapPin className="h-4 w-4 text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{s.name}</p>
                        <p className="flex items-center gap-1 text-xs text-slate-400">
                          <Navigation className="h-3 w-3 text-emerald-400" />
                          {formatDistance(driverDist)} - {s.rating} stars
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-slate-400">{avail}/{stationChargers.length} avail</span>
                  </div>
                </button>
              );
            })}
          </div>
        </ChartCard>
      </div>

      {recentPayments.length > 0 && (
        <ChartCard title="Recent Payments">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {recentPayments.map((p) => (
              <div key={p.id} className="rounded-lg border border-slate-700/50 bg-slate-800/30 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-400">{p.transactionId.slice(0, 12)}</span>
                  <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                </div>
                <p className="mt-2 text-lg font-bold text-white">₹{p.amount.toFixed(0)}</p>
                <p className="text-xs text-slate-400">{p.method} - {p.status}</p>
              </div>
            ))}
          </div>
        </ChartCard>
      )}
    </div>
  );
}
