import { useState, useCallback } from 'react';

export interface Coords {
  lat: number;
  lng: number;
  label?: string;
}

export interface DriverLocationState {
  coords: Coords | null;
  loading: boolean;
  error: string | null;
}

const STORAGE_KEY = 'evnexus_driver_location';

export function haversineKm(a: Coords, b: { lat: number; lng: number }): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return Math.round(R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h)) * 10) / 10;
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

function loadSaved(): Coords | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Coords;
  } catch {
    return null;
  }
}

function saveCoords(c: Coords) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(c));
  } catch {
    /* ignore */
  }
}

export function useDriverLocation() {
  const [state, setState] = useState<DriverLocationState>(() => {
    const saved = loadSaved();
    return { coords: saved, loading: false, error: null };
  });

  const detect = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setState({ coords: null, loading: false, error: 'Geolocation is not supported by your browser.' });
      return;
    }
    setState((s) => ({ ...s, loading: true, error: null }));
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords: Coords = {
          lat: Math.round(pos.coords.latitude * 10000) / 10000,
          lng: Math.round(pos.coords.longitude * 10000) / 10000,
          label: 'Current Location',
        };
        saveCoords(coords);
        setState({ coords, loading: false, error: null });
      },
      (err) => {
        let msg = 'Unable to get your location.';
        if (err.code === err.PERMISSION_DENIED) msg = 'Location access was denied. You can pick a city instead.';
        else if (err.code === err.POSITION_UNAVAILABLE) msg = 'Location information is unavailable.';
        else if (err.code === err.TIMEOUT) msg = 'Location request timed out.';
        setState((s) => ({ ...s, loading: false, error: msg }));
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  }, []);

  const setManualCity = useCallback((coords: Coords) => {
    saveCoords(coords);
    setState({ coords, loading: false, error: null });
  }, []);

  const clear = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setState({ coords: null, loading: false, error: null });
  }, []);

  return { ...state, detect, setManualCity, clear };
}

const cityCoords: Record<string, Coords> = {
  Chennai: { lat: 13.08, lng: 80.27, label: 'Chennai' },
  Coimbatore: { lat: 11.02, lng: 76.97, label: 'Coimbatore' },
  Madurai: { lat: 9.92, lng: 78.12, label: 'Madurai' },
  Trichy: { lat: 10.79, lng: 78.7, label: 'Trichy' },
  Bengaluru: { lat: 12.97, lng: 77.59, label: 'Bengaluru' },
  Salem: { lat: 11.67, lng: 78.16, label: 'Salem' },
  Tiruppur: { lat: 11.11, lng: 77.34, label: 'Tiruppur' },
  Pondicherry: { lat: 11.94, lng: 79.83, label: 'Pondicherry' },
};

export function cityCenter(city: string): Coords | null {
  return cityCoords[city] ?? null;
}

export const cityNames = Object.keys(cityCoords);
