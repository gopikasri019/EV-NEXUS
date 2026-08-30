import { useState, useMemo } from 'react';
import type { User, Charger, Station, Booking } from '../types/index';
import { storage, uid } from '../services/storage';
import { useDriverLocation, haversineKm, formatDistance, type Coords } from '../hooks/useDriverLocation';
import DriverLocationBar from '../components/DriverLocationBar';
import StationCard from '../components/StationCard';
import ChargerCard from '../components/ChargerCard';
import ChartCard from '../components/ChartCard';
import { Search, ArrowLeft, Calendar, Clock, X, Zap, MapPin, Navigation } from 'lucide-react';

interface StationsProps {
  user: User;
  onBooked: () => void;
}

export default function Stations({ user, onBooked }: StationsProps) {
  const [stations, setStations] = useState<Station[]>(() => storage.getStations());
  const [chargers, setChargers] = useState<Charger[]>(() => storage.getChargers());
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('ALL');
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [bookingCharger, setBookingCharger] = useState<Charger | null>(null);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [confirmation, setConfirmation] = useState<Booking | null>(null);
  const [sortByDistance, setSortByDistance] = useState(true);

  const driverLoc = useDriverLocation();

  const cities = ['ALL', ...Array.from(new Set(stations.map((s) => s.city)))];

  const stationsWithDist = useMemo(() => {
    return stations.map((s) => {
      const driverDist = driverLoc.coords ? haversineKm(driverLoc.coords, s) : null;
      return { station: s, driverDist };
    });
  }, [stations, driverLoc.coords]);

  const filteredStations = useMemo(() => {
    const filtered = stationsWithDist.filter(({ station }) => {
      const matchSearch = station.name.toLowerCase().includes(search.toLowerCase()) || station.city.toLowerCase().includes(search.toLowerCase());
      const matchCity = cityFilter === 'ALL' || station.city === cityFilter;
      return matchSearch && matchCity;
    });

    if (sortByDistance) {
      filtered.sort((a, b) => {
        const da = a.driverDist ?? a.station.distance;
        const db = b.driverDist ?? b.station.distance;
        return da - db;
      });
    }
    return filtered;
  }, [stationsWithDist, search, cityFilter, sortByDistance]);

  const stationChargers = selectedStation
    ? chargers.filter((c) => c.stationId === selectedStation.id)
    : [];

  const selectedDriverDist = selectedStation && driverLoc.coords
    ? haversineKm(driverLoc.coords, selectedStation)
    : null;

  function openBooking(charger: Charger) {
    setBookingCharger(charger);
    setDate(new Date().toISOString().split('T')[0]);
    setTime(new Date().toTimeString().slice(0, 5));
  }

  function confirmBooking() {
    if (!bookingCharger || !selectedStation || !date || !time) return;

    const booking: Booking = {
      id: uid('b'),
      userId: user.id,
      userName: user.name,
      stationId: selectedStation.id,
      stationName: selectedStation.name,
      chargerId: bookingCharger.id,
      chargerCode: bookingCharger.chargerCode,
      date,
      time,
      status: 'CONFIRMED',
    };

    const allBookings = storage.getBookings();
    allBookings.unshift(booking);
    storage.setBookings(allBookings);

    const allChargers = storage.getChargers();
    const idx = allChargers.findIndex((c) => c.id === bookingCharger.id);
    if (idx >= 0) {
      allChargers[idx] = { ...allChargers[idx], status: 'RESERVED' };
      storage.setChargers(allChargers);
      setChargers([...allChargers]);
    }

    setConfirmation(booking);
    setBookingCharger(null);
  }

  if (confirmation) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="max-w-md rounded-2xl border border-emerald-500/30 bg-slate-800/60 p-8 text-center backdrop-blur">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15">
            <Zap className="h-8 w-8 text-emerald-400" />
          </div>
          <h2 className="text-xl font-bold text-white">Booking Confirmed!</h2>
          <p className="mt-2 text-sm text-slate-400">Your charger has been reserved successfully.</p>
          <div className="mt-6 space-y-2 rounded-lg bg-slate-900/60 p-4 text-left text-sm">
            <div className="flex justify-between"><span className="text-slate-400">Booking ID</span><span className="font-mono text-white">{confirmation.id.slice(0, 12)}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Station</span><span className="text-white">{confirmation.stationName}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Charger</span><span className="text-white">{confirmation.chargerCode}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Date</span><span className="text-white">{confirmation.date}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Time</span><span className="text-white">{confirmation.time}</span></div>
          </div>
          <button
            onClick={() => { setConfirmation(null); setSelectedStation(null); onBooked(); }}
            className="mt-6 w-full rounded-lg border border-slate-700 py-2.5 text-sm font-medium text-slate-300 transition hover:text-white"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  if (selectedStation) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button onClick={() => setSelectedStation(null)} className="rounded-lg border border-slate-700 p-2 text-slate-400 transition hover:text-white">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-white">{selectedStation.name}</h2>
            <p className="flex items-center gap-1 text-sm text-slate-400">
              <MapPin className="h-3.5 w-3.5" />{selectedStation.address}
              {selectedDriverDist != null && (
                <span className="ml-2 inline-flex items-center gap-1 text-emerald-400">
                  <Navigation className="h-3.5 w-3.5" />{formatDistance(selectedDriverDist)} from you
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stationChargers.map((c) => (
            <ChargerCard
              key={c.id}
              charger={c}
              stationName={selectedStation.name}
              onBook={() => openBooking(c)}
            />
          ))}
        </div>

        {bookingCharger && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setBookingCharger(null)}>
            <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-800 p-6" onClick={(e) => e.stopPropagation()}>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Book Charger</h3>
                <button onClick={() => setBookingCharger(null)} className="text-slate-400"><X className="h-5 w-5" /></button>
              </div>
              <div className="mb-4 space-y-2 rounded-lg bg-slate-900/60 p-3 text-sm">
                <div className="flex justify-between"><span className="text-slate-400">Charger</span><span className="text-white">{bookingCharger.chargerCode}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Type</span><span className="text-white">{bookingCharger.type}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Power</span><span className="text-white">{bookingCharger.power} kW</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Price</span><span className="text-white">₹{bookingCharger.price}/kWh</span></div>
                {selectedDriverDist != null && (
                  <div className="flex justify-between"><span className="text-slate-400">Distance</span><span className="text-emerald-400">{formatDistance(selectedDriverDist)} from you</span></div>
                )}
              </div>
              <div className="space-y-3">
                <div>
                  <label className="mb-1.5 flex items-center gap-1 text-sm text-slate-300"><Calendar className="h-3.5 w-3.5" />Date</label>
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500" />
                </div>
                <div>
                  <label className="mb-1.5 flex items-center gap-1 text-sm text-slate-300"><Clock className="h-3.5 w-3.5" />Start Time</label>
                  <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500" />
                </div>
              </div>
              <button onClick={confirmBooking} className="mt-5 w-full rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 py-2.5 text-sm font-semibold text-white transition hover:from-emerald-400 hover:to-teal-500">
                Confirm Booking
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DriverLocationBar
        coords={driverLoc.coords}
        onDetect={driverLoc.detect}
        onPickCity={(c: Coords) => driverLoc.setManualCity(c)}
        onClear={driverLoc.clear}
        loading={driverLoc.loading}
        error={driverLoc.error}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by station or city..."
            className="w-full rounded-lg border border-slate-700 bg-slate-900/60 py-2.5 pl-10 pr-3 text-sm text-white placeholder-slate-500 outline-none focus:border-emerald-500"
          />
        </div>
        <select
          value={cityFilter}
          onChange={(e) => setCityFilter(e.target.value)}
          className="rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2.5 text-sm text-white outline-none focus:border-emerald-500"
        >
          {cities.map((c) => <option key={c} value={c}>{c === 'ALL' ? 'All Cities' : c}</option>)}
        </select>
        <button
          onClick={() => setSortByDistance((s) => !s)}
          className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition ${
            sortByDistance
              ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
              : 'border-slate-700 bg-slate-900/60 text-slate-400 hover:text-white'
          }`}
        >
          {sortByDistance ? 'Sorted by Distance' : 'Sort by Distance'}
        </button>
      </div>

      {driverLoc.coords && sortByDistance && filteredStations.length > 0 && (
        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-4 py-2.5 text-sm text-emerald-300">
          Showing stations sorted by real distance from your location ({driverLoc.coords.label ?? 'Current'}). Closest: {formatDistance(filteredStations[0].driverDist ?? filteredStations[0].station.distance)} away.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredStations.map(({ station, driverDist }) => (
          <StationCard
            key={station.id}
            station={station}
            chargers={chargers}
            onClick={() => setSelectedStation(station)}
            driverDistanceKm={driverDist}
          />
        ))}
      </div>

      {filteredStations.length === 0 && (
        <ChartCard><p className="py-8 text-center text-sm text-slate-400">No stations found matching your search.</p></ChartCard>
      )}
    </div>
  );
}
