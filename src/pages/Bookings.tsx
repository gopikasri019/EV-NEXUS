import { useState } from 'react';
import type { User, PageKey, Booking } from '../types/index';
import { storage } from '../services/storage';
import ChartCard from '../components/ChartCard';
import { CalendarCheck, X } from 'lucide-react';

interface BookingsProps {
  user: User;
  onNavigate: (page: PageKey) => void;
}

export default function Bookings({ user, onNavigate }: BookingsProps) {
  const [bookings, setBookings] = useState<Booking[]>(() => storage.getBookings().filter((b) => b.userId === user.id));

  function cancelBooking(bookingId: string) {
    const allBookings = storage.getBookings();
    const booking = allBookings.find((b) => b.id === bookingId);
    if (!booking) return;

    // Update booking status
    const updated = allBookings.map((b) =>
      b.id === bookingId ? { ...b, status: 'CANCELLED' as const } : b
    );
    storage.setBookings(updated);

    // Change charger status: RESERVED -> AVAILABLE
    const allChargers = storage.getChargers();
    const chargerIdx = allChargers.findIndex((c) => c.id === booking.chargerId);
    if (chargerIdx >= 0 && allChargers[chargerIdx].status === 'RESERVED') {
      allChargers[chargerIdx] = { ...allChargers[chargerIdx], status: 'AVAILABLE' };
      storage.setChargers(allChargers);
    }

    setBookings(updated.filter((b) => b.userId === user.id));
  }

  const confirmedBookings = bookings.filter((b) => b.status === 'CONFIRMED');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="grid grid-cols-3 gap-4">
          <ChartCard><p className="text-xs text-slate-400">Total</p><p className="mt-1 text-xl font-bold text-white">{bookings.length}</p></ChartCard>
          <ChartCard><p className="text-xs text-slate-400">Confirmed</p><p className="mt-1 text-xl font-bold text-emerald-400">{confirmedBookings.length}</p></ChartCard>
          <ChartCard><p className="text-xs text-slate-400">Cancelled</p><p className="mt-1 text-xl font-bold text-red-400">{bookings.filter((b) => b.status === 'CANCELLED').length}</p></ChartCard>
        </div>
      </div>

      {bookings.length === 0 ? (
        <ChartCard>
          <div className="py-12 text-center">
            <CalendarCheck className="mx-auto mb-3 h-10 w-10 text-slate-600" />
            <p className="text-sm text-slate-400">No bookings yet.</p>
            <button onClick={() => onNavigate('stations')} className="mt-2 text-sm text-emerald-400 hover:text-emerald-300">Find a charging station</button>
          </div>
        </ChartCard>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-700/60 bg-slate-800/40 backdrop-blur">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 text-left text-xs text-slate-400">
                <th className="px-5 py-3 font-medium">Booking ID</th>
                <th className="px-5 py-3 font-medium">Station</th>
                <th className="px-5 py-3 font-medium">Charger</th>
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium">Time</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id} className="border-b border-slate-800/50">
                  <td className="px-5 py-3 font-mono text-xs text-slate-300">{b.id.slice(0, 12)}</td>
                  <td className="px-5 py-3 font-medium text-white">{b.stationName}</td>
                  <td className="px-5 py-3 text-slate-300">{b.chargerCode}</td>
                  <td className="px-5 py-3 text-slate-300">{b.date}</td>
                  <td className="px-5 py-3 text-slate-300">{b.time}</td>
                  <td className="px-5 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      b.status === 'CONFIRMED' ? 'bg-emerald-500/15 text-emerald-400' :
                      b.status === 'COMPLETED' ? 'bg-blue-500/15 text-blue-400' :
                      b.status === 'CANCELLED' ? 'bg-red-500/15 text-red-400' :
                      'bg-amber-500/15 text-amber-400'
                    }`}>{b.status}</span>
                  </td>
                  <td className="px-5 py-3">
                    {b.status === 'CONFIRMED' ? (
                      <button
                        onClick={() => cancelBooking(b.id)}
                        className="flex items-center gap-1 rounded-lg bg-red-500/10 px-2.5 py-1 text-xs font-medium text-red-400 transition hover:bg-red-500/20"
                      >
                        <X className="h-3 w-3" /> Cancel
                      </button>
                    ) : (
                      <span className="text-xs text-slate-500">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
