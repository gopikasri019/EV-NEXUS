import { useState } from 'react';
import { storage } from '../services/storage';
import ChartCard from '../components/ChartCard';
import {
  FlaskConical, Play, TrendingUp, AlertTriangle, Lightbulb, Activity, Clock, Zap, ArrowRight,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

interface SimResult {
  currentUtil: number;
  predictedUtil: number;
  currentWait: number;
  predictedWait: number;
  currentLoad: number;
  predictedLoad: number;
}

export default function WhatIfSimulator() {
  const stations = storage.getStations();
  const chargers = storage.getChargers();

  const [stationId, setStationId] = useState(stations[0]?.id || '');
  const [additionalEVs, setAdditionalEVs] = useState(20);
  const [arrivalTime, setArrivalTime] = useState('19:00');
  const [result, setResult] = useState<SimResult | null>(null);
  const [running, setRunning] = useState(false);

  function runSimulation() {
    setRunning(true);
    setTimeout(() => {
      const stationChargers = chargers.filter((c) => c.stationId === stationId);
      const total = stationChargers.length || 1;
      const active = stationChargers.filter((c) => c.status === 'CHARGING' || c.status === 'RESERVED').length;
      const available = stationChargers.filter((c) => c.status === 'AVAILABLE').length;

      const currentUtil = Math.round((active / total) * 100) || 72;
      const evImpact = Math.min(additionalEVs / total, 1);
      const predictedUtil = Math.min(100, Math.round(currentUtil + evImpact * 30 + Math.random() * 5));

      const avgDuration = 35;
      const currentWait = Math.round((active / Math.max(available, 1)) * avgDuration * 0.3) || 8;
      const predictedWait = Math.round(currentWait + (additionalEVs / Math.max(available, 1)) * avgDuration * 0.8);

      const currentLoad = Math.round(active * 50 + Math.random() * 100) || 410;
      const predictedLoad = Math.round(currentLoad + additionalEVs * 14 + Math.random() * 50);

      setResult({
        currentUtil,
        predictedUtil,
        currentWait,
        predictedWait,
        currentLoad,
        predictedLoad,
      });
      setRunning(false);
    }, 1200);
  }

  const stationName = stations.find((s) => s.id === stationId)?.name || '';
  const needsRedirect = result && result.predictedUtil > 85;

  const comparisonData = result ? [
    { name: 'Utilization (%)', current: result.currentUtil, predicted: result.predictedUtil },
    { name: 'Wait Time (min)', current: result.currentWait, predicted: result.predictedWait },
    { name: 'Energy Load (kW)', current: result.currentLoad, predicted: result.predictedLoad },
  ] : [];

  // AI improvement estimates
  const improvedWait = result ? Math.round(result.predictedWait * 0.41) : 0;
  const improvedLoad = result ? Math.round(result.predictedLoad * 0.78) : 0;

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <FlaskConical className="h-7 w-7 text-emerald-400" />
          <h2 className="text-xl font-bold text-white">What-If Simulator</h2>
        </div>
        <p className="mt-1 text-sm text-slate-400">Simulate EV traffic scenarios and get AI-driven recommendations</p>
      </div>

      {/* Inputs */}
      <ChartCard title="Simulation Parameters" subtitle="Configure your scenario">
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-sm text-slate-300">Station</label>
            <select
              value={stationId}
              onChange={(e) => setStationId(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2.5 text-sm text-white outline-none focus:border-emerald-500"
            >
              {stations.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-slate-300">Additional EVs</label>
            <input
              type="number"
              value={additionalEVs}
              onChange={(e) => setAdditionalEVs(Math.max(0, parseInt(e.target.value) || 0))}
              min="0"
              max="100"
              className="w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2.5 text-sm text-white outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-slate-300">Arrival Time</label>
            <select
              value={arrivalTime}
              onChange={(e) => setArrivalTime(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2.5 text-sm text-white outline-none focus:border-emerald-500"
            >
              {['06:00', '08:00', '10:00', '12:00', '14:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'].map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>
        <button
          onClick={runSimulation}
          disabled={running}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 py-3 text-sm font-semibold text-white transition hover:from-emerald-400 hover:to-teal-500 disabled:opacity-60"
        >
          {running ? 'Running Simulation...' : <><Play className="h-4 w-4" /> Run Simulation</>}
        </button>
      </ChartCard>

      {/* Results */}
      {result && (
        <>
          <div className="grid gap-6 lg:grid-cols-2">
            <ChartCard title="Current Situation" subtitle={`Station: ${stationName}`}>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg border border-slate-700/50 bg-slate-800/30 p-4">
                  <div className="flex items-center gap-3"><Activity className="h-5 w-5 text-emerald-400" /><span className="text-sm text-slate-300">Utilization</span></div>
                  <span className="text-2xl font-bold text-white">{result.currentUtil}%</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-slate-700/50 bg-slate-800/30 p-4">
                  <div className="flex items-center gap-3"><Clock className="h-5 w-5 text-cyan-400" /><span className="text-sm text-slate-300">Waiting Time</span></div>
                  <span className="text-2xl font-bold text-white">{result.currentWait} min</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-slate-700/50 bg-slate-800/30 p-4">
                  <div className="flex items-center gap-3"><Zap className="h-5 w-5 text-amber-400" /><span className="text-sm text-slate-300">Energy Load</span></div>
                  <span className="text-2xl font-bold text-white">{result.currentLoad} kW</span>
                </div>
              </div>
            </ChartCard>

            <ChartCard title="Predicted Situation" subtitle={`With ${additionalEVs} additional EVs at ${arrivalTime}`}>
              <div className="space-y-3">
                <div className={`flex items-center justify-between rounded-lg border p-4 ${result.predictedUtil > 85 ? 'border-red-500/30 bg-red-500/10' : 'border-amber-500/30 bg-amber-500/10'}`}>
                  <div className="flex items-center gap-3"><Activity className={`h-5 w-5 ${result.predictedUtil > 85 ? 'text-red-400' : 'text-amber-400'}`} /><span className="text-sm text-slate-300">Utilization</span></div>
                  <span className={`text-2xl font-bold ${result.predictedUtil > 85 ? 'text-red-400' : 'text-amber-400'}`}>{result.predictedUtil}%</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
                  <div className="flex items-center gap-3"><Clock className="h-5 w-5 text-amber-400" /><span className="text-sm text-slate-300">Waiting Time</span></div>
                  <span className="text-2xl font-bold text-amber-400">{result.predictedWait} min</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
                  <div className="flex items-center gap-3"><Zap className="h-5 w-5 text-amber-400" /><span className="text-sm text-slate-300">Energy Load</span></div>
                  <span className="text-2xl font-bold text-amber-400">{result.predictedLoad} kW</span>
                </div>
              </div>
            </ChartCard>
          </div>

          {/* Comparison chart */}
          <ChartCard title="Impact Comparison" subtitle="Current vs Predicted metrics">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={comparisonData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis type="number" stroke="#64748b" fontSize={12} />
                <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={11} width={110} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#fff' }} />
                <Bar dataKey="current" fill="#10b981" radius={[0, 4, 4, 0]} name="Current" />
                <Bar dataKey="predicted" fill="#f59e0b" radius={[0, 4, 4, 0]} name="Predicted" />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-3 flex justify-center gap-6">
              <div className="flex items-center gap-2 text-xs text-slate-400"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />Current</div>
              <div className="flex items-center gap-2 text-xs text-slate-400"><span className="h-2.5 w-2.5 rounded-full bg-amber-500" />Predicted</div>
            </div>
          </ChartCard>

          {/* AI Recommendation */}
          <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-teal-500/5 p-6 backdrop-blur">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-6 w-6 text-emerald-400" />
              <h3 className="text-lg font-bold text-white">AI Recommendation</h3>
            </div>

            {needsRedirect ? (
              <div className="mt-4 space-y-3">
                <div className="flex items-start gap-3 rounded-lg border border-red-500/20 bg-red-500/10 p-3">
                  <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-400" />
                  <div>
                    <p className="text-sm font-medium text-white">High Demand Alert</p>
                    <p className="mt-0.5 text-xs text-slate-400">Predicted utilization of {result.predictedUtil}% exceeds safe threshold.</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {[
                    'Redirect vehicles to nearby station with available capacity.',
                    'Encourage off-peak charging by offering discounted rates from 10 PM - 12 AM.',
                    'Allocate available chargers and prioritize DC Fast for quick turnover.',
                    'Reduce peak charging demand through dynamic pricing incentives.',
                  ].map((rec, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-slate-300">
                      <ArrowRight className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-400" />
                      {rec}
                    </div>
                  ))}
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4">
                  <div>
                    <p className="text-xs text-slate-400">Waiting time improvement</p>
                    <p className="mt-1 text-sm font-bold text-white">{result.predictedWait} min → <span className="text-emerald-400">{improvedWait} min</span></p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Energy load improvement</p>
                    <p className="mt-1 text-sm font-bold text-white">{result.predictedLoad} kW → <span className="text-emerald-400">{improvedLoad} kW</span></p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-4 space-y-2">
                <p className="text-sm text-slate-300">The station can handle the additional load. Recommendations:</p>
                {[
                  'Monitor utilization in real-time for any sudden spikes.',
                  'Maintain current pricing strategy.',
                  'Keep maintenance schedule unchanged.',
                ].map((rec, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-slate-300">
                    <ArrowRight className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-400" />
                    {rec}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {!result && !running && (
        <ChartCard>
          <div className="py-12 text-center">
            <FlaskConical className="mx-auto mb-3 h-12 w-12 text-slate-600" />
            <p className="text-sm text-slate-400">Configure parameters above and run the simulation to see predictions.</p>
          </div>
        </ChartCard>
      )}
    </div>
  );
}
