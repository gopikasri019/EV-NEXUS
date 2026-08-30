export type UserRole = 'CUSTOMER' | 'OPERATOR' | 'ADMIN';

export type ChargerStatus = 'AVAILABLE' | 'RESERVED' | 'CHARGING' | 'OFFLINE' | 'MAINTENANCE';

export type ChargerType = 'AC' | 'DC Fast' | 'DC Ultra Fast';

export type BookingStatus = 'CONFIRMED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export type SessionStatus = 'IN_PROGRESS' | 'COMPLETED';

export type PaymentStatus = 'SUCCESS' | 'PENDING' | 'FAILED';

export type PaymentMethod = 'UPI' | 'Card' | 'Wallet';

export type PageKey =
  | 'dashboard'
  | 'stations'
  | 'bookings'
  | 'charging'
  | 'payments'
  | 'analytics'
  | 'ai'
  | 'simulator'
  | 'operator'
  | 'admin'
  | 'settings';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Station {
  id: string;
  name: string;
  city: string;
  address: string;
  distance: number;
  rating: number;
  lat: number;
  lng: number;
}

export interface Charger {
  id: string;
  stationId: string;
  chargerCode: string;
  type: ChargerType;
  power: number;
  price: number;
  status: ChargerStatus;
}

export interface Booking {
  id: string;
  userId: string;
  userName: string;
  stationId: string;
  stationName: string;
  chargerId: string;
  chargerCode: string;
  date: string;
  time: string;
  status: BookingStatus;
}

export interface ChargingSession {
  id: string;
  userId: string;
  userName: string;
  stationId: string;
  stationName: string;
  chargerId: string;
  chargerCode: string;
  power: number;
  price: number;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  energy: number;
  cost: number;
  status: SessionStatus;
}

export interface Payment {
  id: string;
  transactionId: string;
  userId: string;
  userName: string;
  sessionId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  date: string;
}

export interface EnergyRecord {
  id: string;
  stationId: string;
  stationName: string;
  date: string;
  energy: number;
  peakLoad: number;
}
