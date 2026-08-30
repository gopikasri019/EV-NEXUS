import type {
  User, Station, Charger, Booking, ChargingSession, Payment, EnergyRecord,
} from '../types/index';

const KEYS = {
  user: 'evnexus_user',
  stations: 'evnexus_stations',
  chargers: 'evnexus_chargers',
  bookings: 'evnexus_bookings',
  sessions: 'evnexus_sessions',
  payments: 'evnexus_payments',
  energy: 'evnexus_energy',
  init: 'evnexus_initialized',
};

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Storage write failed:', e);
  }
}

export const storage = {
  getUser: () => load<User | null>(KEYS.user, null),
  setUser: (v: User | null) => save(KEYS.user, v),

  getStations: () => load<Station[]>(KEYS.stations, []),
  setStations: (v: Station[]) => save(KEYS.stations, v),

  getChargers: () => load<Charger[]>(KEYS.chargers, []),
  setChargers: (v: Charger[]) => save(KEYS.chargers, v),

  getBookings: () => load<Booking[]>(KEYS.bookings, []),
  setBookings: (v: Booking[]) => save(KEYS.bookings, v),

  getSessions: () => load<ChargingSession[]>(KEYS.sessions, []),
  setSessions: (v: ChargingSession[]) => save(KEYS.sessions, v),

  getPayments: () => load<Payment[]>(KEYS.payments, []),
  setPayments: (v: Payment[]) => save(KEYS.payments, v),

  getEnergy: () => load<EnergyRecord[]>(KEYS.energy, []),
  setEnergy: (v: EnergyRecord[]) => save(KEYS.energy, v),

  isInitialized: () => load<boolean>(KEYS.init, false),
  setInitialized: (v: boolean) => save(KEYS.init, v),
};

export function uid(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function txnId(): string {
  return `TXN${Date.now().toString().slice(-8)}${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}
