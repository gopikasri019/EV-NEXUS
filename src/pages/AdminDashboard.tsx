import { storage } from '../services/storage';
import StatCard from '../components/StatCard';
import ChartCard from '../components/ChartCard';
import { Users, Building2, Plug, DollarSign, Zap, Activity, Shield, TrendingUp, Lightbulb } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line,
} from 'recharts';

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#6b7280', '#f97316'];

export default function AdminDashboard() {
  const stations = storage.getStations();
  const chargers = storage.getChargers();
  const sessions = storage.getSessions();
  const payments = storage.getPayments();
  const energy = storage.getEnergy();

  // Count users from localStorage (we stored demo users implicitly)
  const userCount = 23; // 3 demo + 20 customer names
  const customers = 20;
  const operators = 1;
  const admins = 1;

  const totalRevenue = payments.filter((p) => p.status === 'SUCCESS').reduce((s, p) => s + p.amount, 0);
  const totalEnergy = sessions.reduce((s, ses) => s + ses.energy, 0);
  const availableChargers = chargers.filter((c) => c.status === 'AVAILABLE').length;

  const dailyRevenue = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    const dayStr = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    const dayRev = payments
      .filter((p) => p.status === 'SUCCESS' && new Date(p.date).toDateString() === d.toDateString())
      .reduce((s, p) => s + p.amount, 0);
    return { name: dayStr, revenue: Math.round(dayRev) };
  });

  const energyByCity = Array.from(new Set(stations.map((s) => s.city))).map((city) => {
    const cityStations = stations.filter((s) => s.city === city).map((s) => s.id);
    const cityEnergy = energy.filter((e) => cityStations.includes(e.stationId)).reduce((sum, e) => sum + e.energy, 0);
    return { name: city, energy: Math.round(cityEnergy) };
  });

  const roleDist = [
    { name: 'Customers', value: customers },
    { name: 'Operators', value: operators },
    { name: 'Admins', value: admins },
  ];

  const chargerStatus = [
    { name: 'Available', value: chargers.filter((c) => c.status === 'AVAILABLE').length },
    { name: 'Reserved', value: chargers.filter((c) => c.status === 'RESERVED').length },
    { name: 'Charging', value: chargers.filter((c) => c.status === 'CHARGING').length },
    { name: 'Offline', value: chargers.filter((c) => c.status === 'OFFLINE').length },
    { name: 'Maintenance', value: chargers.filter((c) => c.status === 'MAINTENANCE').length },
  ];

  const peakLoadTrend = energy.slice(0, 14).reverse().map((e) => ({
    name: new Date(e.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
    load: e.peakLoad,
  }));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard title="Total Users" value={userCount} icon={Users} accent="emerald" />
        <StatCard title="Total Stations" value={stations.length} icon={Building2} accent="teal" />
        <StatCard title="Total Chargers" value={chargers.length} icon={Plug} accent="cyan" />
        <StatCard title="Total Revenue" value={`₹${totalRevenue.toFixed(0)}`} icon={DollarSign} accent="amber" />
        <StatCard title="Total Energy" value={`${totalEnergy.toFixed(0)} kWh`} icon={Zap} accent="blue" />
        <StatCard title="Available" value={availableChargers} icon={Activity} accent="red" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Revenue Trend" subtitle="Last 14 days across all stations">
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={dailyRevenue}>
              <defs>
                <linearGradient id="adminRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#fff' }} />
              <Area type="monotone" dataKey="revenue" stroke="#10b981" fill="url(#adminRev)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Energy by City" subtitle="Energy consumption by location">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={energyByCity}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#fff' }} />
              <Bar dataKey="energy" fill="#14b8a6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <ChartCard title="User Distribution" subtitle="Users by role">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={roleDist} cx="50%" cy="50%" innerRadius={40} outerRadius={75} dataKey="value">
                {roleDist.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#fff' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap justify-center gap-3">
            {roleDist.map((r, i) => (
              <div key={r.name} className="flex items-center gap-1.5 text-xs text-slate-400">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[i] }} />{r.name} ({r.value})
              </div>
            ))}
          </div>
        </ChartCard>

        <ChartCard title="Charger Statistics" subtitle="All chargers by status">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={chargerStatus} cx="50%" cy="50%" innerRadius={40} outerRadius={75} dataKey="value">
                {chargerStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#fff' }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Peak Load Trend" subtitle="Network peak load %">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={peakLoadTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
              <YAxis stroke="#64748b" fontSize={12} domain={[0, 100]} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#fff' }} />
              <Line type="monotone" dataKey="load" stroke="#ef4444" strokeWidth={2} dot={{ fill: '#ef4444', r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* AI Alerts */}
      <ChartCard title="AI Alerts & Energy Optimization Recommendations" subtitle="System-wide AI insights">
        <div className="space-y-3">
          <div className="flex items-start gap-3 rounded-lg border border-amber-500/20 bg-amber-500/10 p-3">
            <Shield className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-400" />
            <div>
              <p className="text-sm font-medium text-white">High Demand Alert - Chennai</p>
              <p className="mt-0.5 text-xs text-slate-400">Station at 86% utilization. AI recommends redirecting vehicles to nearby Coimbatore station.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3">
            <TrendingUp className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-400" />
            <div>
              <p className="text-sm font-medium text-white">Energy Optimization Recommendation</p>
              <p className="mt-0.5 text-xs text-slate-400">Move flexible charging sessions to 10 PM-12 AM to reduce peak load from 92% to 76%.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-lg border border-blue-500/20 bg-blue-500/10 p-3">
            <Lightbulb className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-400" />
            <div>
              <p className="text-sm font-medium text-white">Demand Forecast</p>
              <p className="mt-0.5 text-xs text-slate-400">Peak demand expected at 8 PM. Current network load: 72%. Predicted: 93%.</p>
            </div>
          </div>
        </div>
      </ChartCard>
    </div>
  );
}
