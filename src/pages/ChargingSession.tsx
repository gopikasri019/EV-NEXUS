import { useState, useEffect, useRef } from 'react';
import type { User, PageKey, Charger, ChargingSession as SessionType, Payment } from '../types/index';
import { storage, uid, txnId } from '../services/storage';
import ChartCard from '../components/ChartCard';
import StatusBadge from '../components/StatusBadge';
import { BatteryCharging, Zap, Clock, DollarSign, Plug, Play, Square, CheckCircle, Smartphone, CreditCard, Wallet, ArrowRight } from 'lucide-react';

interface ChargingSessionProps {
  user: User;
  onNavigate: (page: PageKey) => void;
}

type PaymentMethod = 'UPI' | 'Card' | 'Wallet';

export default function ChargingSession({ user, onNavigate }: ChargingSessionProps) {
  const [chargers, setChargers] = useState<Charger[]>(() => storage.getChargers());
  const [bookings, setBookings] = useState(() => storage.getBookings().filter((b) => b.userId === user.id && b.status === 'CONFIRMED'));

  const [activeCharger, setActiveCharger] = useState<Charger | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [energy, setEnergy] = useState(0);
  const [duration, setDuration] = useState(0);
  const [cost, setCost] = useState(0);
  const [isCharging, setIsCharging] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Payment state
  const [completedSession, setCompletedSession] = useState<SessionType | null>(null);
  const [method, setMethod] = useState<PaymentMethod>('UPI');
  const [processing, setProcessing] = useState(false);
  const [paidPayment, setPaidPayment] = useState<Payment | null>(null);

  const stations = storage.getStations();

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  function startCharging(charger: Charger) {
    const station = stations.find((s) => s.id === charger.stationId);
    const session: SessionType = {
      id: uid('ses'),
      userId: user.id,
      userName: user.name,
      stationId: charger.stationId,
      stationName: station?.name || '',
      chargerId: charger.id,
      chargerCode: charger.chargerCode,
      power: charger.power,
      price: charger.price,
      startTime: new Date().toISOString(),
      endTime: '',
      durationMinutes: 0,
      energy: 0,
      cost: 0,
      status: 'IN_PROGRESS',
    };

    const allSessions = storage.getSessions();
    allSessions.unshift(session);
    storage.setSessions(allSessions);

    setSessionId(session.id);
    setActiveCharger(charger);
    setEnergy(0);
    setDuration(0);
    setCost(0);
    setIsCharging(true);

    // Charger: RESERVED -> CHARGING
    updateChargerStatus(charger, 'CHARGING');

    // Simulate: update every 2 seconds
    intervalRef.current = setInterval(() => {
      setEnergy((prev) => {
        const newEnergy = prev + (charger.power / 3600) * 2;
        setCost(Math.round(newEnergy * charger.price * 100) / 100);
        return Math.round(newEnergy * 100) / 100;
      });
      setDuration((prev) => prev + 2);
    }, 2000);
  }

  function stopCharging() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsCharging(false);

    if (sessionId && activeCharger) {
      const station = stations.find((s) => s.id === activeCharger.stationId);
      const finalSession: SessionType = {
        id: sessionId,
        userId: user.id,
        userName: user.name,
        stationId: activeCharger.stationId,
        stationName: station?.name || '',
        chargerId: activeCharger.id,
        chargerCode: activeCharger.chargerCode,
        power: activeCharger.power,
        price: activeCharger.price,
        startTime: new Date(Date.now() - duration * 1000).toISOString(),
        endTime: new Date().toISOString(),
        durationMinutes: Math.round((duration / 60) * 100) / 100,
        energy,
        cost,
        status: 'COMPLETED',
      };

      const allSessions = storage.getSessions();
      const idx = allSessions.findIndex((s) => s.id === sessionId);
      if (idx >= 0) allSessions[idx] = finalSession;
      else allSessions.unshift(finalSession);
      storage.setSessions(allSessions);

      // Charger: CHARGING -> AVAILABLE
      updateChargerStatus(activeCharger, 'AVAILABLE');

      // Update booking status to COMPLETED
      const allBookings = storage.getBookings();
      const bookingIdx = allBookings.findIndex((b) => b.chargerId === activeCharger.id && b.status === 'CONFIRMED');
      if (bookingIdx >= 0) {
        allBookings[bookingIdx] = { ...allBookings[bookingIdx], status: 'COMPLETED' };
        storage.setBookings(allBookings);
        setBookings(allBookings.filter((b) => b.userId === user.id && b.status === 'CONFIRMED'));
      }

      setCompletedSession(finalSession);
    }
  }

  function updateChargerStatus(charger: Charger, status: Charger['status']) {
    const allChargers = storage.getChargers();
    const idx = allChargers.findIndex((c) => c.id === charger.id);
    if (idx >= 0) {
      allChargers[idx] = { ...allChargers[idx], status };
      storage.setChargers(allChargers);
      setChargers([...allChargers]);
    }
  }

  function processPayment() {
    if (!completedSession) return;
    setProcessing(true);
    setTimeout(() => {
      const payment: Payment = {
        id: uid('p'),
        transactionId: txnId(),
        userId: user.id,
        userName: user.name,
        sessionId: completedSession.id,
        amount: completedSession.cost,
        method,
        status: 'SUCCESS',
        date: new Date().toISOString(),
      };
      const allPayments = storage.getPayments();
      allPayments.unshift(payment);
      storage.setPayments(allPayments);
      setProcessing(false);
      setPaidPayment(payment);
    }, 1200);
  }

  // Payment success screen
  if (paidPayment) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="max-w-md rounded-2xl border border-emerald-500/30 bg-slate-800/60 p-8 text-center backdrop-blur">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15">
            <CheckCircle className="h-8 w-8 text-emerald-400" />
          </div>
          <h2 className="text-xl font-bold text-white">Payment Successful</h2>
          <div className="mt-6 space-y-2 rounded-lg bg-slate-900/60 p-4 text-left text-sm">
            <div className="flex justify-between"><span className="text-slate-400">Transaction ID</span><span className="font-mono text-white">{paidPayment.transactionId}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Amount</span><span className="font-semibold text-white">₹{paidPayment.amount.toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Method</span><span className="text-white">{paidPayment.method}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Status</span><span className="text-emerald-400">{paidPayment.status}</span></div>
          </div>
          <button onClick={() => { setPaidPayment(null); setCompletedSession(null); setActiveCharger(null); setSessionId(null); onNavigate('dashboard'); }} className="mt-6 w-full rounded-lg border border-slate-700 py-2.5 text-sm font-medium text-slate-300 transition hover:text-white">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Payment screen after charging
  if (completedSession) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-white">Demo Payment</h2>
          <p className="mt-1 text-sm text-slate-400">Complete your payment for the charging session</p>
        </div>

        <div className="mx-auto max-w-2xl space-y-6">
          <ChartCard title="Invoice Summary" subtitle="Charging session details">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-slate-400">Charger</span><span className="text-white">{completedSession.chargerCode}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Station</span><span className="text-white">{completedSession.stationName}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Duration</span><span className="text-white">{completedSession.durationMinutes.toFixed(1)} min</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Energy Consumed</span><span className="text-white">{completedSession.energy.toFixed(2)} kWh</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Price</span><span className="text-white">₹{completedSession.price}/kWh</span></div>
              <div className="flex justify-between border-t border-slate-700 pt-2 text-base"><span className="font-medium text-white">Total Amount</span><span className="font-bold text-emerald-400">₹{completedSession.cost.toFixed(2)}</span></div>
            </div>
          </ChartCard>

          <ChartCard title="Select Payment Method">
            <div className="grid grid-cols-3 gap-3">
              {([
                { m: 'UPI' as const, icon: Smartphone, label: 'UPI' },
                { m: 'Card' as const, icon: CreditCard, label: 'Card' },
                { m: 'Wallet' as const, icon: Wallet, label: 'Wallet' },
              ]).map((opt) => (
                <button
                  key={opt.m}
                  onClick={() => setMethod(opt.m)}
                  className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition ${
                    method === opt.m ? 'border-emerald-500 bg-emerald-500/15 text-emerald-400' : 'border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  <opt.icon className="h-6 w-6" />
                  <span className="text-sm font-medium">{opt.label}</span>
                </button>
              ))}
            </div>
            <button
              onClick={processPayment}
              disabled={processing}
              className="mt-6 w-full rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 py-3 text-sm font-semibold text-white transition hover:from-emerald-400 hover:to-teal-500 disabled:opacity-60"
            >
              {processing ? 'Processing...' : `Pay ₹${completedSession.cost.toFixed(2)} Now`}
            </button>
            <p className="mt-2 text-center text-xs text-slate-500">This is a demo payment. No real transaction will occur.</p>
          </ChartCard>
        </div>
      </div>
    );
  }

  // Live charging screen
  if (isCharging && activeCharger) {
    const station = stations.find((s) => s.id === activeCharger.stationId);
    const progress = Math.min((energy / 50) * 100, 100);

    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-slate-800/60 to-slate-900/60 p-6 backdrop-blur">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-emerald-500/15 p-3">
                <BatteryCharging className="h-6 w-6 text-emerald-400 animate-pulse" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Charging in Progress</h2>
                <p className="text-sm text-slate-400">{activeCharger.chargerCode} - {station?.name}</p>
              </div>
            </div>
            <StatusBadge status="CHARGING" />
          </div>

          <div className="mt-6">
            <div className="mb-2 flex justify-between text-sm text-slate-400">
              <span>Charging Progress</span>
              <span>{progress.toFixed(1)}%</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-slate-700/50">
              <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-1000" style={{ width: `${progress}%` }} />
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-slate-700/50 bg-slate-800/40 p-4">
              <div className="flex items-center gap-2 text-slate-400"><Zap className="h-4 w-4" /><span className="text-xs">Energy Consumed</span></div>
              <p className="mt-2 text-2xl font-bold text-white">{energy.toFixed(2)} kWh</p>
            </div>
            <div className="rounded-xl border border-slate-700/50 bg-slate-800/40 p-4">
              <div className="flex items-center gap-2 text-slate-400"><Clock className="h-4 w-4" /><span className="text-xs">Duration</span></div>
              <p className="mt-2 text-2xl font-bold text-white">{Math.floor(duration / 60)}m {duration % 60}s</p>
            </div>
            <div className="rounded-xl border border-slate-700/50 bg-slate-800/40 p-4">
              <div className="flex items-center gap-2 text-slate-400"><DollarSign className="h-4 w-4" /><span className="text-xs">Current Cost</span></div>
              <p className="mt-2 text-2xl font-bold text-white">₹{cost.toFixed(2)}</p>
            </div>
            <div className="rounded-xl border border-slate-700/50 bg-slate-800/40 p-4">
              <div className="flex items-center gap-2 text-slate-400"><Plug className="h-4 w-4" /><span className="text-xs">Charging Power</span></div>
              <p className="mt-2 text-2xl font-bold text-white">{activeCharger.power} kW</p>
            </div>
          </div>

          <div className="mt-6 rounded-lg bg-slate-900/40 p-4">
            <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
              <div><p className="text-xs text-slate-400">Charger Type</p><p className="font-medium text-white">{activeCharger.type}</p></div>
              <div><p className="text-xs text-slate-400">Price</p><p className="font-medium text-white">₹{activeCharger.price}/kWh</p></div>
              <div><p className="text-xs text-slate-400">Station</p><p className="font-medium text-white">{station?.name}</p></div>
              <div><p className="text-xs text-slate-400">Rate</p><p className="font-medium text-white">{activeCharger.power} kW</p></div>
            </div>
          </div>

          <button
            onClick={stopCharging}
            className="mt-6 w-full rounded-lg bg-gradient-to-r from-red-500 to-red-600 py-3 text-sm font-semibold text-white transition hover:from-red-400 hover:to-red-500"
          >
            <Square className="mr-2 inline h-4 w-4" />
            Stop Charging & Pay
          </button>
        </div>
      </div>
    );
  }

  // Default: show available chargers to start charging
  const availableChargers = chargers.filter((c) => c.status === 'AVAILABLE' || c.status === 'RESERVED');
  const confirmedBookings = bookings;

  return (
    <div className="space-y-6">
        {/* Confirmed bookings - ready to start */}
        {confirmedBookings.length > 0 && (
          <ChartCard title="Ready to Charge" subtitle="Select a confirmed booking to start charging">
            <div className="space-y-3">
              {confirmedBookings.map((b) => {
                const charger = chargers.find((c) => c.id === b.chargerId);
                if (!charger) return null;
                return (
                  <div key={b.id} className="flex items-center justify-between rounded-lg border border-slate-700/50 bg-slate-800/30 p-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-emerald-500/10 p-2.5"><Plug className="h-5 w-5 text-emerald-400" /></div>
                      <div>
                        <p className="text-sm font-semibold text-white">{b.stationName}</p>
                        <p className="text-xs text-slate-400">{b.chargerCode} - {charger.type} - {charger.power} kW</p>
                        <p className="text-xs text-slate-400">Booked for {b.date} at {b.time}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={charger.status} size="sm" />
                      <button
                        onClick={() => startCharging(charger)}
                        disabled={charger.status !== 'RESERVED'}
                        className="rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-2 text-sm font-semibold text-white transition hover:from-emerald-400 hover:to-teal-500 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <Play className="mr-1 inline h-4 w-4" />Start
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </ChartCard>
        )}

        {/* Instant charging */}
        <ChartCard title="Or Start Instant Charging" subtitle="Available chargers ready for immediate use">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {availableChargers.filter((c) => c.status === 'AVAILABLE').slice(0, 6).map((c) => {
              const station = stations.find((s) => s.id === c.stationId);
              return (
                <div key={c.id} className="rounded-lg border border-slate-700/50 bg-slate-800/30 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-white">{c.chargerCode}</p>
                    <StatusBadge status={c.status} size="sm" />
                  </div>
                  <p className="mt-1 text-xs text-slate-400">{station?.name}</p>
                  <div className="mt-2 flex gap-4 text-xs text-slate-400">
                    <span>{c.type}</span>
                    <span>{c.power} kW</span>
                    <span>₹{c.price}/kWh</span>
                  </div>
                  <button
                    onClick={() => startCharging(c)}
                    className="mt-3 flex w-full items-center justify-center gap-1 rounded-lg bg-emerald-500/15 py-1.5 text-xs font-medium text-emerald-400 transition hover:bg-emerald-500/25"
                  >
                    <Play className="h-3 w-3" /> Start Charging
                  </button>
                </div>
              );
            })}
          </div>
        </ChartCard>

        {confirmedBookings.length === 0 && availableChargers.filter((c) => c.status === 'AVAILABLE').length === 0 && (
          <ChartCard>
            <div className="py-12 text-center">
              <BatteryCharging className="mx-auto mb-3 h-10 w-10 text-slate-600" />
              <p className="text-sm text-slate-400">No chargers available to start charging.</p>
              <button onClick={() => onNavigate('stations')} className="mt-2 flex items-center gap-1 text-sm text-emerald-400 hover:text-emerald-300 mx-auto">
                Book a charger <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </ChartCard>
        )}
    </div>
  );
}
