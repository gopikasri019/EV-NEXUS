import { useState } from 'react';
import type { User, PageKey } from '../types/index';
import { storage } from '../services/storage';
import ChartCard from '../components/ChartCard';
import { Receipt, DollarSign, TrendingUp } from 'lucide-react';

interface PaymentsProps {
  user: User;
  onNavigate: (page: PageKey) => void;
}

export default function Payments({ user }: PaymentsProps) {
  const [payments] = useState(() => storage.getPayments().filter((p) => p.userId === user.id));
  const [sessions] = useState(() => storage.getSessions().filter((s) => s.userId === user.id));

  const totalSpent = payments.filter((p) => p.status === 'SUCCESS').reduce((s, p) => s + p.amount, 0);
  const successful = payments.filter((p) => p.status === 'SUCCESS').length;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <ChartCard><p className="text-xs text-slate-400">Total Payments</p><p className="mt-1 text-2xl font-bold text-white">{payments.length}</p></ChartCard>
        <ChartCard><p className="text-xs text-slate-400">Total Amount</p><p className="mt-1 text-2xl font-bold text-emerald-400">₹{totalSpent.toFixed(0)}</p></ChartCard>
        <ChartCard><p className="text-xs text-slate-400">Successful</p><p className="mt-1 text-2xl font-bold text-teal-400">{successful}</p></ChartCard>
      </div>

      {payments.length === 0 ? (
        <ChartCard>
          <div className="py-12 text-center">
            <Receipt className="mx-auto mb-3 h-10 w-10 text-slate-600" />
            <p className="text-sm text-slate-400">No payments yet.</p>
            <p className="mt-1 text-xs text-slate-500">Complete a charging session to make a payment.</p>
          </div>
        </ChartCard>
      ) : (
        <>
          {/* Invoice cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {payments.slice(0, 6).map((p) => {
              const session = sessions.find((s) => s.id === p.sessionId);
              return (
                <div key={p.id} className="rounded-xl border border-slate-700/60 bg-slate-800/40 p-5 backdrop-blur">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-slate-400">{p.transactionId}</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      p.status === 'SUCCESS' ? 'bg-emerald-500/15 text-emerald-400' :
                      p.status === 'PENDING' ? 'bg-amber-500/15 text-amber-400' :
                      'bg-red-500/15 text-red-400'
                    }`}>{p.status}</span>
                  </div>
                  <p className="mt-3 text-2xl font-bold text-white">₹{p.amount.toFixed(2)}</p>
                  <div className="mt-3 space-y-1 text-xs text-slate-400">
                    <p>Method: {p.method}</p>
                    <p>Date: {new Date(p.date).toLocaleDateString('en-IN')}</p>
                    {session && <p>Charger: {session.chargerCode} - {session.energy.toFixed(1)} kWh</p>}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Full table */}
          <div className="overflow-x-auto rounded-xl border border-slate-700/60 bg-slate-800/40 backdrop-blur">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 text-left text-xs text-slate-400">
                  <th className="px-5 py-3 font-medium">Transaction ID</th>
                  <th className="px-5 py-3 font-medium">Amount</th>
                  <th className="px-5 py-3 font-medium">Method</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id} className="border-b border-slate-800/50">
                    <td className="px-5 py-3 font-mono text-xs text-slate-300">{p.transactionId}</td>
                    <td className="px-5 py-3 font-medium text-white">₹{p.amount.toFixed(2)}</td>
                    <td className="px-5 py-3 text-slate-300">{p.method}</td>
                    <td className="px-5 py-3 text-slate-300">{new Date(p.date).toLocaleDateString('en-IN')}</td>
                    <td className="px-5 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        p.status === 'SUCCESS' ? 'bg-emerald-500/15 text-emerald-400' :
                        p.status === 'PENDING' ? 'bg-amber-500/15 text-amber-400' :
                        'bg-red-500/15 text-red-400'
                      }`}>{p.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
