import { useState } from 'react';
import { useDriverLocation, cityNames, cityCenter, type Coords } from '../hooks/useDriverLocation';
import { MapPin, Crosshair, Check, ChevronDown, X } from 'lucide-react';

interface DriverLocationBarProps {
  coords: Coords | null;
  onDetect: () => void;
  onPickCity: (c: Coords) => void;
  onClear: () => void;
  loading: boolean;
  error: string | null;
}

export default function DriverLocationBar({ coords, onDetect, onPickCity, onClear, loading, error }: DriverLocationBarProps) {
  const [cityOpen, setCityOpen] = useState(false);

  return (
    <div className="rounded-xl border border-slate-700/60 bg-slate-800/40 p-4 backdrop-blur">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-emerald-500/10 p-2.5">
            <MapPin className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Driver Location</p>
            {coords ? (
              <p className="text-xs text-emerald-400">
                {coords.label ?? 'Current Location'} ({coords.lat.toFixed(4)}, {coords.lng.toFixed(4)})
              </p>
            ) : (
              <p className="text-xs text-slate-400">Not set — stations sorted by default distance</p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onDetect}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-2 text-sm font-medium text-white transition hover:from-emerald-400 hover:to-teal-500 disabled:opacity-50"
          >
            <Crosshair className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Detecting...' : 'Use My Location'}
          </button>

          <div className="relative">
            <button
              onClick={() => setCityOpen((o) => !o)}
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-300 transition hover:text-white"
            >
              Pick City <ChevronDown className="h-4 w-4" />
            </button>
            {cityOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setCityOpen(false)} />
                <div className="absolute right-0 z-20 mt-1 w-44 overflow-hidden rounded-lg border border-slate-700 bg-slate-800 py-1 shadow-xl">
                  {cityNames.map((city) => (
                    <button
                      key={city}
                      onClick={() => {
                        const c = cityCenter(city);
                        if (c) onPickCity(c);
                        setCityOpen(false);
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-300 transition hover:bg-slate-700/60 hover:text-white"
                    >
                      <MapPin className="h-3.5 w-3.5 text-emerald-400" />
                      {city}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {coords && (
            <button
              onClick={onClear}
              className="flex items-center gap-1 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-400 transition hover:text-red-400"
            >
              <X className="h-4 w-4" /> Clear
            </button>
          )}
        </div>
      </div>

      {error && (
        <p className="mt-2 text-xs text-amber-400">{error}</p>
      )}
    </div>
  );
}

export function useDriverLocationBar() {
  const loc = useDriverLocation();
  return loc;
}

export function LocationConfirmedBadge({ coords }: { coords: Coords | null }) {
  if (!coords) return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-400">
      <Check className="h-3 w-3" /> {coords.label ?? 'Located'}
    </span>
  );
}
