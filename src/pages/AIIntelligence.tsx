import { useState } from 'react';
import { storage } from '../services/storage';
import ChartCard from '../components/ChartCard';
import {
  Brain, Lightbulb, TrendingUp, Award, Clock, Zap, Gauge, MapPin,
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';

// AI Demo Forecast data
const demandForecast = [
  { day: 'Mon', utilization: 68 },
  { day: 'Tue', utilization: 72 },
  { day: 'Wed', utilization: 78 },
  { day: 'Thu', utilization: 81 },
  { day: 'Fri', utilization: 89 },
  { day: 'Sat', utilization: 94 },
  { day: 'Sun', utilization: 76 },
];

const peakHours = [
  { period: 'Morning', value: 35, highlight: false },
  { period: 'Afternoon', value: 52, highlight: false },
  { period: 'Evening', value: 91, highlight: true },
  { period: 'Night', value: 48, highlight: false },
];

const energyOptData = [
  { name: 'Current Peak', load: 92 },
  { name: 'Optimized', load: 76 },
];

interface Recommendation {
  code: string;
  station: string;
  type: string;
  power: number;
  price: number;
  distance: number;
  waitTime: number;
  score: number;
}

export default function AIIntelligence() {
  const stations = storage.getStations();
  const chargers = storage.getChargers();
  const sessions = storage.getSessions();

  const [selectedStation, setSelectedStation] = useState(stations[0]?.id || '');

  // Smart Charger Recommendation - calculate score
  const recommendations: Recommendation[] = chargers
    .filter((c) => c.status === 'AVAILABLE')
    .map((c) => {
      const station = stations.find((s) => s.id === c.stationId);
      const distance = station?.distance || Math.round(Math.random() * 15 + 1);
      const waitTime = Math.round(Math.random() * 20);

      // Score: availability(30) + distance(25) + power(20) + price(15) + wait(10)
      const distanceScore = Math.max(0, (20 - distance) / 20) * 25;
      const powerScore = (c.power / 120) * 20;
      const priceScore = Math.max(0, (20 - c.price) / 12) * 15;
      const waitScore = Math.max(0, (30 - waitTime) / 30) * 10;
      const score = Math.round(30 + distanceScore + powerScore + priceScore + waitScore);

      return {
        code: c.chargerCode,
        station: station?.name || '',
        type: c.type,
        power: c.power,
        price: c.price,
        distance,
        waitTime,
        score,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  const bestCharger = recommendations[0];

  // Waiting time prediction
  const activeSessions = sessions.filter((s) => s.status === 'IN_PROGRESS').length;
  const availableCount = chargers.filter((c) => c.status === 'AVAILABLE').length;
  const avgDuration = sessions.length > 0 ? sessions.reduce((s, ses) => s + ses.durationMinutes, 0) / sessions.length : 35;
  const estimatedWait = Math.round((activeSessions / Math.max(availableCount, 1)) * avgDuration * 0.5) || 12;

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <Brain className="h-7 w-7 text-emerald-400" />
          <h2 className="text-xl font-bold text-white">AI Intelligence</h2>
        </div>
        <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/15 px-3 py-1 text-xs font-medium text-amber-400">
          <Lightbulb className="h-3.5 w-3.5" />
          AI DEMO FORECAST - Uses historical/demo data for demonstration
        </div>
      </div>

      {/* 1. Demand Forecast */}
      <ChartCard title="1. AI Demand Forecast" subtitle="Predicted charger utilization throughout the week">
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={demandForecast}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="day" stroke="#64748b" fontSize={12} />
            <YAxis stroke="#64748b" fontSize={12} domain={[0, 100]} label={{ value: 'Utilization %', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 11 }} />
            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#fff' }} />
            <Line type="monotone" dataKey="utilization" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
        <p className="mt-3 text-center text-xs text-slate-400">Demo AI Forecast - Peak demand predicted on Saturday at 94%</p>
      </ChartCard>

      {/* 2. Peak Hour Prediction */}
      <ChartCard title="2. Peak Hour Prediction" subtitle="Predicted utilization by time of day">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {peakHours.map((p) => (
            <div key={p.period} className={`rounded-xl border p-4 text-center ${p.highlight ? 'border-red-500/30 bg-red-500/10' : 'border-slate-700/50 bg-slate-800/30'}`}>
              <p className="text-xs text-slate-400">{p.period}</p>
              <p className={`mt-2 text-2xl font-bold ${p.highlight ? 'text-red-400' : 'text-white'}`}>{p.value}%</p>
              {p.highlight && <p className="mt-1 text-xs text-red-400">6 PM - 9 PM</p>}
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/20 p-3">
          <TrendingUp className="h-4 w-4 text-red-400" />
          <p className="text-sm text-slate-300">Predicted peak period: <span className="font-semibold text-red-400">6 PM - 9 PM</span> at 91% utilization</p>
        </div>
      </ChartCard>

      {/* 3. Smart Charger Recommendation */}
      <ChartCard title="3. Smart Charger Recommendation" subtitle="AI-scored best chargers based on availability, distance, power, price, and wait time">
        {bestCharger && (
          <div className="mb-4 rounded-xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-teal-500/5 p-4">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-emerald-400" />
              <span className="text-sm font-semibold text-emerald-400">BEST CHARGER</span>
              <span className="ml-auto text-lg font-bold text-emerald-400">{bestCharger.score}/100</span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div><p className="text-xs text-slate-400">Charger</p><p className="text-sm font-medium text-white">{bestCharger.code}</p></div>
              <div><p className="text-xs text-slate-400">Distance</p><p className="text-sm font-medium text-white">{bestCharger.distance} km</p></div>
              <div><p className="text-xs text-slate-400">Power</p><p className="text-sm font-medium text-white">{bestCharger.power} kW</p></div>
              <div><p className="text-xs text-slate-400">Price</p><p className="text-sm font-medium text-white">₹{bestCharger.price}/kWh</p></div>
            </div>
            <p className="mt-2 text-xs text-emerald-400">Available now - Waiting time: {bestCharger.waitTime} min</p>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 text-left text-xs text-slate-400">
                <th className="pb-2 pr-4 font-medium">Rank</th>
                <th className="pb-2 pr-4 font-medium">Charger</th>
                <th className="pb-2 pr-4 font-medium">Station</th>
                <th className="pb-2 pr-4 font-medium">Power</th>
                <th className="pb-2 pr-4 font-medium">Price</th>
                <th className="pb-2 pr-4 font-medium">Distance</th>
                <th className="pb-2 pr-4 font-medium">Wait</th>
                <th className="pb-2 font-medium">Score</th>
              </tr>
            </thead>
            <tbody>
              {recommendations.map((r, i) => (
                <tr key={r.code} className="border-b border-slate-800/50">
                  <td className="py-2.5 pr-4"><span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${i === 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700/40 text-slate-400'}`}>{i + 1}</span></td>
                  <td className="py-2.5 pr-4 font-medium text-white">{r.code}</td>
                  <td className="py-2.5 pr-4 text-slate-300 max-w-[150px] truncate">{r.station}</td>
                  <td className="py-2.5 pr-4 text-slate-300">{r.power} kW</td>
                  <td className="py-2.5 pr-4 text-slate-300">₹{r.price}</td>
                  <td className="py-2.5 pr-4 text-slate-300">{r.distance} km</td>
                  <td className="py-2.5 pr-4 text-slate-300">{r.waitTime} min</td>
                  <td className="py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-700">
                        <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500" style={{ width: `${r.score}%` }} />
                      </div>
                      <span className="text-xs font-medium text-white">{r.score}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ChartCard>

      {/* 4. Waiting Time Prediction */}
      <ChartCard title="4. Waiting Time Prediction" subtitle="Estimated wait time based on active sessions and queue">
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-4">
              <div className="flex items-center gap-2 text-slate-400"><Clock className="h-4 w-4" /><span className="text-xs">Estimated Waiting Time</span></div>
              <p className="mt-2 text-3xl font-bold text-white">{estimatedWait} <span className="text-lg text-slate-400">min</span></p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-slate-700/50 bg-slate-800/30 p-3">
                <p className="text-xs text-slate-400">Active Sessions</p>
                <p className="mt-1 text-xl font-bold text-cyan-400">{activeSessions}</p>
              </div>
              <div className="rounded-lg border border-slate-700/50 bg-slate-800/30 p-3">
                <p className="text-xs text-slate-400">Available Chargers</p>
                <p className="mt-1 text-xl font-bold text-emerald-400">{availableCount}</p>
              </div>
              <div className="rounded-lg border border-slate-700/50 bg-slate-800/30 p-3">
                <p className="text-xs text-slate-400">Avg Duration</p>
                <p className="mt-1 text-xl font-bold text-white">{Math.round(avgDuration)} min</p>
              </div>
              <div className="rounded-lg border border-slate-700/50 bg-slate-800/30 p-3">
                <p className="text-xs text-slate-400">Queued</p>
                <p className="mt-1 text-xl font-bold text-amber-400">{Math.round(activeSessions * 0.6)}</p>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={[
              { name: 'Active', value: activeSessions },
              { name: 'Queued', value: Math.round(activeSessions * 0.6) },
              { name: 'Available', value: availableCount },
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#fff' }} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                <Cell fill="#06b6d4" />
                <Cell fill="#f59e0b" />
                <Cell fill="#10b981" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* 5. Energy Optimization */}
      <ChartCard title="5. Energy Optimization" subtitle="AI recommendations to reduce peak load">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4">
              <div className="flex items-center gap-2"><Gauge className="h-4 w-4 text-red-400" /><span className="text-xs text-slate-400">Current Peak Load</span></div>
              <p className="mt-2 text-3xl font-bold text-red-400">92%</p>
            </div>
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
              <div className="flex items-center gap-2"><TrendingUp className="h-4 w-4 text-emerald-400" /><span className="text-xs text-slate-400">Recommended Peak Load</span></div>
              <p className="mt-2 text-3xl font-bold text-emerald-400">76%</p>
            </div>
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4">
              <div className="flex items-center gap-2"><Lightbulb className="h-4 w-4 text-amber-400" /><span className="text-sm font-semibold text-amber-400">AI DEMO RECOMMENDATION</span></div>
              <p className="mt-2 text-sm text-slate-300">Shift flexible charging sessions from 6 PM-9 PM to 10 PM-12 AM.</p>
              <p className="mt-1 text-sm text-emerald-400">Estimated energy load reduction: 17%</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={energyOptData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} domain={[0, 100]} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#fff' }} />
              <Bar dataKey="load" radius={[8, 8, 0, 0]}>
                <Cell fill="#ef4444" />
                <Cell fill="#10b981" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>
    </div>
  );
}
