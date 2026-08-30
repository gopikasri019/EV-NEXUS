import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  accent?: 'emerald' | 'teal' | 'cyan' | 'amber' | 'red' | 'blue';
}

const accents: Record<string, string> = {
  emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  teal: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
  cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  red: 'bg-red-500/10 text-red-400 border-red-500/20',
  blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
};

export default function StatCard({ title, value, icon: Icon, accent = 'emerald' }: StatCardProps) {
  return (
    <div className="rounded-xl border border-slate-700/60 bg-slate-800/40 p-5 backdrop-blur transition hover:border-slate-600/60 hover:bg-slate-800/60">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-400">{title}</p>
          <p className="mt-2 text-2xl font-bold text-white">{value}</p>
        </div>
        <div className={`rounded-lg border p-2.5 ${accents[accent]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
