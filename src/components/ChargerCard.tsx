import type { Charger } from '../types/index';
import { Plug, Zap, DollarSign } from 'lucide-react';
import StatusBadge from './StatusBadge';

interface ChargerCardProps {
  charger: Charger;
  stationName: string;
  onBook?: () => void;
  bookLabel?: string;
}

export default function ChargerCard({ charger, stationName, onBook, bookLabel = 'Book' }: ChargerCardProps) {
  return (
    <div className="rounded-xl border border-slate-700/60 bg-slate-800/40 p-5 backdrop-blur">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-emerald-500/10 p-2">
            <Plug className="h-4 w-4 text-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{charger.chargerCode}</p>
            <p className="text-xs text-slate-400">{charger.type}</p>
          </div>
        </div>
        <StatusBadge status={charger.status} size="sm" />
      </div>

      <p className="mt-3 text-xs text-slate-400">{stationName}</p>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div className="flex items-center gap-1.5">
          <Zap className="h-3.5 w-3.5 text-slate-500" />
          <div><p className="text-xs text-slate-400">Power</p><p className="font-medium text-white">{charger.power} kW</p></div>
        </div>
        <div className="flex items-center gap-1.5">
          <DollarSign className="h-3.5 w-3.5 text-slate-500" />
          <div><p className="text-xs text-slate-400">Price</p><p className="font-medium text-white">₹{charger.price}/kWh</p></div>
        </div>
      </div>

      {onBook && (
        <button
          onClick={onBook}
          disabled={charger.status !== 'AVAILABLE'}
          className="mt-4 w-full rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 py-2 text-sm font-semibold text-white transition hover:from-emerald-400 hover:to-teal-500 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {charger.status === 'AVAILABLE' ? bookLabel : 'Unavailable'}
        </button>
      )}
    </div>
  );
}
