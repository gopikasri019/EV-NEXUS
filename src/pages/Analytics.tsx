import { storage } from '../services/storage';
import ChartCard from '../components/ChartCard';
import StatCard from '../components/StatCard';
import { Zap, DollarSign, Activity, TrendingUp } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

export default function Analytics() {
  const sessions = storage.getSessions();
  const payments = storage.getPayments();
  const energy = storage.getEnergy();

  // Daily energy (last 7 days)
  const dailyEnergy = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dayStr = d.toLocaleDateString('en-IN', { weekday: 'short' });
    const dayEnergy = energy
      .filter((e) => new Date(e.date).toDateString() === d.toDateString())
      .reduce((sum, e) => sum + e.energy, 0);
    return { name: dayStr, energy: Math.round(dayEnergy) };
  });

  // Weekly energy (last 4 weeks)
  const weeklyEnergy = Array.from({ length: 4 }, (_, i) => {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - (3 - i) * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);
    const weekEnergy = energy
      .filter((e) => {
        const ed = new Date(e.date);
        return ed >= weekStart && ed < weekEnd;
      })
      .reduce((sum, e) => sum + e.energy, 0);
    return { name: `Week ${i + 1}`, energy: Math.round(weekEnergy) };
  });

  // Daily revenue (last 14 days)
  const dailyRevenue = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    const dayStr = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    const dayRev = payments
      .filter((p) => p.status === 'SUCCESS' && new Date(p.date).toDateString() === d.toDateString())
      .reduce((s, p) => s + p.amount, 0);
    return { name: dayStr, revenue: Math.round(dayRev) };
  });

  // Charger utilization (from charger statuses)
  const chargers = storage.getChargers();
  const utilization = [
    { name: 'Available', value: chargers.filter((c) => c.status === 'AVAILABLE').length },
    { name: 'Reserved', value: chargers.filter((c) => c.status === 'RESERVED').length },
    { name: 'Charging', value: chargers.filter((c) => c.status === 'CHARGING').length },
    { name: 'Offline', value: chargers.filter((c) => c.status === 'OFFLINE').length },
    { name: 'Maintenance', value: chargers.filter((c) => c.status === 'MAINTENANCE').length },
  ];

  // Charging sessions per day (last 7 days)
  const sessionsPerDay = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dayStr = d.toLocaleDateString('en-IN', { weekday: 'short' });
    const count = sessions.filter((s) => new Date(s.startTime).toDateString() === d.toDateString()).length;
    return { name: dayStr, sessions: count };
  });

  const totalEnergy = sessions.reduce((s, ses) => s + ses.energy, 0);
  const totalRevenue = payments.filter((p) => p.status === 'SUCCESS').reduce((s, p) => s + p.amount, 0);
  const avgSession = sessions.length > 0 ? totalEnergy / sessions.length : 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Energy" value={`${totalEnergy.toFixed(0)} kWh`} icon={Zap} accent="emerald" />
        <StatCard title="Total Revenue" value={`₹${totalRevenue.toFixed(0)}`} icon={DollarSign} accent="amber" />
        <StatCard title="Total Sessions" value={sessions.length} icon={Activity} accent="cyan" />
        <StatCard title="Avg Energy/Session" value={`${avgSession.toFixed(1)} kWh`} icon={TrendingUp} accent="teal" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Daily Energy Consumption" subtitle="Last 7 days">
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={dailyEnergy}>
              <defs>
                <linearGradient id="dailyE" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#fff' }} />
              <Area type="monotone" dataKey="energy" stroke="#10b981" fill="url(#dailyE)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Weekly Energy Consumption" subtitle="Last 4 weeks">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={weeklyEnergy}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#fff' }} />
              <Bar dataKey="energy" fill="#14b8a6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Daily Revenue" subtitle="Last 14 days">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={dailyRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#fff' }} />
              <Line type="monotone" dataKey="revenue" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b', r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Charger Utilization" subtitle="Current charger status distribution">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={utilization} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis type="number" stroke="#64748b" fontSize={12} />
              <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={12} width={90} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#fff' }} />
              <Bar dataKey="value" fill="#06b6d4" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard title="Charging Sessions" subtitle="Sessions per day (last 7 days)">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={sessionsPerDay}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
            <YAxis stroke="#64748b" fontSize={12} />
            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#fff' }} />
            <Bar dataKey="sessions" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}
