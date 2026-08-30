import type { Station, Charger } from '../types/index';
import { MapPin, Plug, Star, Navigation } from 'lucide-react';
import StatusBadge from './StatusBadge';

interface StationCardProps {
  station: Station;
  chargers: Charger[];
  onClick: () => void;
  driverDistanceKm?: number | null;
}

export default function StationCard({ station, chargers, onClick, driverDistanceKm }: StationCardProps) {
  const stationChargers = chargers.filter((c) => c.stationId === station.id);
  const available = stationChargers.filter((c) => c.status === 'AVAILABLE').length;
  const minPrice = stationChargers.length > 0 ? Math.min(...stationChargers.map((c) => c.price)) : 0;

  const showDriverDist = driverDistanceKm != null;
  const distLabel = showDriverDist
    ? driverDistanceKm! < 1
      ? `${Math.round(driverDistanceKm! * 1000)} m`
      : `${driverDistanceKm!.toFixed(1)} km`
    : `${station.distance} km`;

  return (
    <div
      onClick={onClick}
      className="cursor-pointer rounded-xl border border-slate-700/60 bg-slate-800/40 p-5 backdrop-blur transition hover:border-emerald-500/40"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-emerald-500/10 p-2.5">
            <MapPin className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <p className="font-semibold text-white">{station.name}</p>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-400">
              {showDriverDist ? (
                <>
                  <Navigation className="h-3 w-3 text-emerald-400" />
                  {distLabel} from you
                </>
              ) : (
                <>
                  <MapPin className="h-3 w-3" />{station.city} - {distLabel}
                </>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-amber-400">
          <Star className="h-3.5 w-3.5 fill-amber-400" />
          <span className="text-xs font-medium">{station.rating}</span>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {stationChargers.slice(0, 4).map((c) => (
          <StatusBadge key={c.id} status={c.status} size="sm" />
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-700/50 pt-3 text-sm">
        <span className="flex items-center gap-1.5 text-slate-300">
          <Plug className="h-4 w-4 text-slate-500" />{stationChargers.length} chargers
        </span>
        <span className="text-emerald-400">{available} available</span>
        <span className="text-slate-400">from ₹{minPrice}/kWh</span>
      </div>
    </div>
  );
}
