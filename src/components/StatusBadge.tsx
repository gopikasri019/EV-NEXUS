import type { ChargerStatus } from '../types/index';

const cfg: Record<ChargerStatus, { label: string; bg: string; text: string; dot: string }> = {
  AVAILABLE: { label: 'Available', bg: 'bg-emerald-500/15', text: 'text-emerald-400', dot: 'bg-emerald-400' },
  RESERVED: { label: 'Reserved', bg: 'bg-amber-500/15', text: 'text-amber-400', dot: 'bg-amber-400' },
  CHARGING: { label: 'Charging', bg: 'bg-red-500/15', text: 'text-red-400', dot: 'bg-red-400' },
  OFFLINE: { label: 'Offline', bg: 'bg-gray-500/15', text: 'text-gray-400', dot: 'bg-gray-400' },
  MAINTENANCE: { label: 'Maintenance', bg: 'bg-orange-500/15', text: 'text-orange-400', dot: 'bg-orange-400' },
};

export default function StatusBadge({ status, size = 'md' }: { status: ChargerStatus; size?: 'sm' | 'md' }) {
  const c = cfg[status];
  const pad = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium ${pad} ${c.bg} ${c.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${c.dot} ${status === 'CHARGING' ? 'animate-pulse' : ''}`} />
      {c.label}
    </span>
  );
}
