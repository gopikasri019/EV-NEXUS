import { storage } from '../services/storage';
import StatCard from '../components/StatCard';
import ChartCard from '../components/ChartCard';
import StatusBadge from '../components/StatusBadge';
import { Building2, Plug, BatteryCharging, DollarSign, Zap, Activity } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

export default function OperatorDashboard() {
  const stations = storage.getStations();
  const chargers = storage.getChargers();
  const sessions = storage.getSessions();
  const payments = storage.getPayments();
  const bookings = storage.getBookings();

  const availableChargers = chargers.filter((c) => c.status === 'AVAILABLE').length;
  const activeSessions = sessions.filter((s) => s.status === 'IN_PROGRESS').length;
  const todayRevenue = payments
    .filter((p) => p.status === 'SUCCESS' && new Date(p.date).toDateString() === new Date().toDateString())
    .reduce((s, p) => s + p.amount, 0);
  const todayEnergy = sessions
    .filter((s) => new Date(s.startTime).toDateString() === new Date().toDateString())
    .reduce((s, ses) => s + ses.energy, 0);

  const weeklyRevenue = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dayStr = d.toLocaleDateString('en-IN', { weekday: 'short' });
    const dayRev = payments
      .filter((p) => p.status === 'SUCCESS' && new Date(p.date).toDateString() === d.toDateString())
      .reduce((s, p) => s + p.amount, 0);
    return { name: dayStr, revenue: Math.round(dayRev) };
  });

  const weeklyEnergy = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dayStr = d.toLocaleDateString('en-IN', { weekday: 'short' });
    const dayEnergy = sessions
      .filter((s) => new Date(s.startTime).toDateString() === d.toDateString())
      .reduce((s, ses) => s + ses.energy, 0);
    return { name: dayStr, energy: Math.round(dayEnergy * 10) / 10 };
  });

  const stationUtil = stations.map((s) => {
    const sc = chargers.filter((c) => c.stationId === s.id);
    const active = sc.filter((c) => c.status !== 'AVAILABLE' && c.status !== 'OFFLINE').length;
    return { name: s.city, util: sc.length > 0 ? Math.round((active / sc.length) * 100) : 0 };
  });

  const recentBookings = bookings.slice(0, 6);
  const activeCharging = sessions.filter((s) => s.status === 'IN_PROGRESS');

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard title="Total Stations" value={stations.length} icon={Building2} accent="emerald" />
        <StatCard title="Total Chargers" value={chargers.length} icon={Plug} accent="teal" />
        <StatCard title="Available" value={availableChargers} icon={Plug} accent="cyan" />
        <StatCard title="Active Sessions" value={activeSessions} icon={BatteryCharging} accent="red" />
        <StatCard title="Today's Revenue" value={`₹${todayRevenue.toFixed(0)}`} icon={DollarSign} accent="amber" />
        <StatCard title="Energy Today" value={`${todayEnergy.toFixed(1)} kWh`} icon={Zap} accent="blue" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Revenue Chart" subtitle="Last 7 days revenue trend">
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={weeklyRevenue}>
              <defs>
                <linearGradient id="opRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#fff' }} />
              <Area type="monotone" dataKey="revenue" stroke="#f59e0b" fill="url(#opRev)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Energy Consumption Chart" subtitle="Energy delivered across all stations">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={weeklyEnergy}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#fff' }} />
              <Bar dataKey="energy" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Charger Utilization Chart" subtitle="Utilization rate by station">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={stationUtil} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis type="number" stroke="#64748b" fontSize={12} domain={[0, 100]} />
              <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={11} width={80} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#fff' }} />
              <Bar dataKey="util" fill="#14b8a6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Recent Bookings" subtitle="Latest charger reservations">
          <div className="space-y-3">
            {recentBookings.map((b) => (
              <div key={b.id} className="flex items-center justify-between rounded-lg border border-slate-700/50 bg-slate-800/30 p-3">
                <div>
                  <p className="text-sm font-medium text-white">{b.userName}</p>
                  <p className="text-xs text-slate-400">{b.stationName} - {b.chargerCode}</p>
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
        </ChartCard>
      </div>

      {/* Active Charging Sessions */}
      <ChartCard title="Active Charging Sessions" subtitle={`${activeCharging.length} sessions currently in progress`}>
        {activeCharging.length > 0 ? (
          <div className="space-y-3">
            {activeCharging.map((s) => (
              <div key={s.id} className="flex items-center justify-between rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-3">
                <div className="flex items-center gap-3">
                  <Activity className="h-4 w-4 text-cyan-400 animate-pulse" />
                  <div>
                    <p className="text-sm font-medium text-white">{s.chargerCode} - {s.stationName}</p>
                    <p className="text-xs text-slate-400">{s.userName} - {s.energy.toFixed(1)} kWh</p>
                  </div>
                </div>
                <StatusBadge status="CHARGING" size="sm" />
              </div>
            ))}
          </div>
        ) : (
          <p className="py-6 text-center text-sm text-slate-400">No active charging sessions.</p>
        )}
      </ChartCard>

      {/* Live Charger Status */}
      <ChartCard title="Live Charger Status" subtitle="Real-time charger availability across all stations">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 text-left text-xs text-slate-400">
                <th className="pb-3 pr-4 font-medium">Charger</th>
                <th className="pb-3 pr-4 font-medium">Station</th>
                <th className="pb-3 pr-4 font-medium">Type</th>
                <th className="pb-3 pr-4 font-medium">Power</th>
                <th className="pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {chargers.map((c) => {
                const station = stations.find((s) => s.id === c.stationId);
                return (
                  <tr key={c.id} className="border-b border-slate-800/50">
                    <td className="py-2.5 pr-4 font-medium text-white">{c.chargerCode}</td>
                    <td className="py-2.5 pr-4 text-slate-400">{station?.name || '-'}</td>
                    <td className="py-2.5 pr-4 text-slate-400">{c.type}</td>
                    <td className="py-2.5 pr-4 text-slate-400">{c.power} kW</td>
                    <td className="py-2.5"><StatusBadge status={c.status} size="sm" /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </ChartCard>
    </div>
  );
}
