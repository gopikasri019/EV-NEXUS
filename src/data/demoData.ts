import type {
  User, Station, Charger, Booking, ChargingSession, Payment, EnergyRecord,
  ChargerType, ChargerStatus, BookingStatus, SessionStatus, PaymentMethod, PaymentStatus,
} from '../types/index';
import { storage, uid, txnId } from '../services/storage';

const cities = [
  { name: 'Chennai', lat: 13.08, lng: 80.27 },
  { name: 'Coimbatore', lat: 11.02, lng: 76.97 },
  { name: 'Madurai', lat: 9.92, lng: 78.12 },
  { name: 'Trichy', lat: 10.79, lng: 78.70 },
  { name: 'Bengaluru', lat: 12.97, lng: 77.59 },
  { name: 'Salem', lat: 11.67, lng: 78.16 },
  { name: 'Tiruppur', lat: 11.11, lng: 77.34 },
  { name: 'Pondicherry', lat: 11.94, lng: 79.83 },
];

const stationNames = [
  'Central Charge Hub', 'GreenVolt Station', 'EcoPower Point', 'VoltWay Station',
  'ElectroFuel Zone', 'ChargeNest Hub', 'SwiftCharge Point', 'ZenithEnergy Station',
];

const chargerSpecs: Array<{ type: ChargerType; power: number; price: number }> = [
  { type: 'AC', power: 7.2, price: 8 },
  { type: 'DC Fast', power: 50, price: 14 },
  { type: 'DC Ultra Fast', power: 120, price: 18 },
];

const statusPool: ChargerStatus[] = ['AVAILABLE', 'AVAILABLE', 'AVAILABLE', 'RESERVED', 'CHARGING', 'OFFLINE', 'MAINTENANCE'];

const customerNames = [
  'Arjun Kumar', 'Priya Sharma', 'Rahul Reddy', 'Sneha Patel', 'Vikram Singh',
  'Ananya Gupta', 'Karthik Raja', 'Divya Nair', 'Rohit Verma', 'Meera Iyer',
  'Suresh Babu', 'Kavya Rao', 'Ajay Mehta', 'Pooja Joshi', 'Manish Tiwari',
  'Riya Kapoor', 'Siddharth Nair', 'Tanvi Desai', 'Aravind Krishnan', 'Nisha Agarwal',
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function dayOffset(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().split('T')[0];
}

function isoOffset(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString();
}

function hhmm(): string {
  const h = Math.floor(Math.random() * 24);
  const m = Math.floor(Math.random() * 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

const DATA_VERSION = 'v2';

export function initializeDemoData(force = false): void {
  const storedVersion = localStorage.getItem('evnexus_data_version');
  if (storage.isInitialized() && !force && storedVersion === DATA_VERSION) return;

  localStorage.setItem('evnexus_data_version', DATA_VERSION);

  const now = isoOffset(0);

  // Users
  const users: User[] = [
    { id: uid('u'), name: 'Customer Demo', email: 'customer@evnexus.com', role: 'CUSTOMER' },
    { id: uid('u'), name: 'Operator Demo', email: 'operator@evnexus.com', role: 'OPERATOR' },
    { id: uid('u'), name: 'Admin Demo', email: 'admin@evnexus.com', role: 'ADMIN' },
  ];

  // Stations (8)
  const stations: Station[] = stationNames.map((name, i) => {
    const city = cities[i];
    return {
      id: uid('s'),
      name: `${name} - ${city.name}`,
      city: city.name,
      address: `${100 + i * 7}, ${city.name} Main Road`,
      distance: Math.round((Math.random() * 18 + 1) * 10) / 10,
      rating: Math.round((3.5 + Math.random() * 1.5) * 10) / 10,
      lat: city.lat + (Math.random() - 0.5) * 0.1,
      lng: city.lng + (Math.random() - 0.5) * 0.1,
    };
  });

  // Chargers (30) — ~4 per station, varied types
  const chargers: Charger[] = [];
  let chargerCounter = 0;
  for (const station of stations) {
    for (let i = 0; i < 4; i++) {
      chargerCounter++;
      const spec = chargerSpecs[i % 3];
      const code = station.name.split(' - ')[0].slice(0, 3).toUpperCase() + '-' + String(chargerCounter).padStart(3, '0');
      chargers.push({
        id: uid('c'),
        stationId: station.id,
        chargerCode: code,
        type: spec.type,
        power: spec.power,
        price: spec.price,
        status: pick(statusPool),
      });
    }
  }

  // Bookings (20)
  const bookings: Booking[] = [];
  for (let i = 0; i < 20; i++) {
    const customer = users[0];
    const station = stations[i % stations.length];
    const stationChargers = chargers.filter((c) => c.stationId === station.id);
    const charger = stationChargers[i % stationChargers.length];
    const status = pick<BookingStatus>(['CONFIRMED', 'CONFIRMED', 'COMPLETED', 'CANCELLED']);
    bookings.push({
      id: uid('b'),
      userId: customer.id,
      userName: customer.name,
      stationId: station.id,
      stationName: station.name,
      chargerId: charger.id,
      chargerCode: charger.chargerCode,
      date: dayOffset(Math.floor(Math.random() * 7) - 3),
      time: hhmm(),
      status,
    });
  }

  // Charging Sessions (10)
  const sessions: ChargingSession[] = [];
  for (let i = 0; i < 10; i++) {
    const station = stations[i % stations.length];
    const stationChargers = chargers.filter((c) => c.stationId === station.id);
    const charger = stationChargers[i % stationChargers.length];
    const duration = 15 + Math.floor(Math.random() * 60);
    const energy = Math.round((charger.power * duration) / 60 * 100) / 100;
    const cost = Math.round(energy * charger.price * 100) / 100;
    const start = isoOffset(-Math.floor(Math.random() * 7));
    const end = new Date(new Date(start).getTime() + duration * 60000).toISOString();
    const status: SessionStatus = i < 2 ? 'IN_PROGRESS' : 'COMPLETED';
    sessions.push({
      id: uid('ses'),
      userId: users[0].id,
      userName: users[0].name,
      stationId: station.id,
      stationName: station.name,
      chargerId: charger.id,
      chargerCode: charger.chargerCode,
      power: charger.power,
      price: charger.price,
      startTime: start,
      endTime: end,
      durationMinutes: duration,
      energy,
      cost,
      status,
    });
  }

  // Payments (20)
  const payments: Payment[] = [];
  const methods: PaymentMethod[] = ['UPI', 'Card', 'Wallet'];
  const payStatuses: PaymentStatus[] = ['SUCCESS', 'SUCCESS', 'PENDING'];
  for (let i = 0; i < 20; i++) {
    const session = sessions[i % sessions.length];
    payments.push({
      id: uid('p'),
      transactionId: txnId(),
      userId: users[0].id,
      userName: users[0].name,
      sessionId: session.id,
      amount: session.cost,
      method: pick(methods),
      status: pick(payStatuses),
      date: isoOffset(-Math.floor(Math.random() * 14)),
    });
  }

  // Energy Records (30)
  const energy: EnergyRecord[] = [];
  for (let i = 0; i < 30; i++) {
    const station = stations[i % stations.length];
    energy.push({
      id: uid('e'),
      stationId: station.id,
      stationName: station.name,
      date: dayOffset(-i),
      energy: Math.round(200 + Math.random() * 400),
      peakLoad: Math.round(50 + Math.random() * 45),
    });
  }

  storage.setStations(stations);
  storage.setChargers(chargers);
  storage.setBookings(bookings);
  storage.setSessions(sessions);
  storage.setPayments(payments);
  storage.setEnergy(energy);
  storage.setInitialized(true);
}

export const demoUsers = customerNames;
