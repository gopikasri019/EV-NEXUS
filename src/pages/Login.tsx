import { useState } from 'react';
import { Zap, Mail, Lock, AlertCircle, Brain, ArrowRight } from 'lucide-react';
import type { User, UserRole } from '../types/index';
import { initializeDemoData } from '../data/demoData';
import { storage } from '../services/storage';

interface LoginProps {
  onLogin: (user: User) => void;
}

const demoAccounts = [
  { role: 'CUSTOMER' as UserRole, email: 'customer@evnexus.com', label: 'Customer' },
  { role: 'OPERATOR' as UserRole, email: 'operator@evnexus.com', label: 'Operator' },
  { role: 'ADMIN' as UserRole, email: 'admin@evnexus.com', label: 'Admin' },
];

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('CUSTOMER');
  const [error, setError] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    initializeDemoData();

    // Check demo credentials
    const matched = demoAccounts.find((a) => a.email.toLowerCase() === email.toLowerCase());
    if (matched && password === '123456') {
      const user: User = {
        id: `u-${matched.role.toLowerCase()}`,
        name: `${matched.label} Demo`,
        email: matched.email,
        role: matched.role,
      };
      storage.setUser(user);
      onLogin(user);
      return;
    }

    // Allow any role selection with demo password
    if (password === '123456' && email.trim().length > 0) {
      const user: User = {
        id: `u-${role.toLowerCase()}`,
        name: `${role.charAt(0) + role.slice(1).toLowerCase()} Demo`,
        email,
        role,
      };
      storage.setUser(user);
      onLogin(user);
      return;
    }

    setError('Use demo password: 123456');
  }

  function quickLogin(acc: typeof demoAccounts[0]) {
    initializeDemoData();
    const user: User = {
      id: `u-${acc.role.toLowerCase()}`,
      name: `${acc.label} Demo`,
      email: acc.email,
      role: acc.role,
    };
    storage.setUser(user);
    onLogin(user);
  }

  function fillDemo(acc: typeof demoAccounts[0]) {
    setEmail(acc.email);
    setPassword('123456');
    setRole(acc.role);
    setError('');
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600">
            <Zap className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">EV-NEXUS</h1>
          <p className="mt-1 text-sm text-slate-400">Intelligent Charging. Smarter Energy.</p>
        </div>

        <div className="rounded-2xl border border-slate-700/60 bg-slate-800/40 p-6 backdrop-blur">
          <div className="mb-5 flex items-center gap-2 text-sm text-emerald-400">
            <Brain className="h-4 w-4" />
            <span>AI-Powered EV Charging Platform</span>
          </div>

          <div className="mb-4">
            <label className="mb-1.5 block text-sm text-slate-300">Select Role</label>
            <div className="grid grid-cols-3 gap-2">
              {demoAccounts.map((acc) => (
                <button
                  key={acc.role}
                  onClick={() => setRole(acc.role)}
                  className={`rounded-lg border py-2 text-xs font-medium transition ${
                    role === acc.role
                      ? 'border-emerald-500 bg-emerald-500/15 text-emerald-400'
                      : 'border-slate-700 bg-slate-900/60 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {acc.label}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-500/10 p-3 text-sm text-red-400">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm text-slate-300">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@evnexus.com"
                  required
                  className="w-full rounded-lg border border-slate-700 bg-slate-900/60 py-2.5 pl-10 pr-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm text-slate-300">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="123456"
                  required
                  className="w-full rounded-lg border border-slate-700 bg-slate-900/60 py-2.5 pl-10 pr-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 py-2.5 text-sm font-semibold text-white transition hover:from-emerald-400 hover:to-teal-500"
            >
              Sign In
            </button>
          </form>
        </div>

        <div className="mt-6 rounded-xl border border-slate-700/60 bg-slate-800/30 p-4">
          <p className="mb-3 text-center text-xs font-medium text-slate-400">Quick Demo Login (password: 123456)</p>
          <div className="grid grid-cols-3 gap-2">
            {demoAccounts.map((acc) => (
              <button
                key={acc.role}
                onClick={() => quickLogin(acc)}
                className="flex flex-col items-center gap-1 rounded-lg border border-slate-700 bg-slate-800/60 py-2.5 text-xs font-medium text-slate-300 transition hover:border-emerald-500/50 hover:text-emerald-400"
              >
                {acc.label}
                <ArrowRight className="h-3 w-3" />
              </button>
            ))}
          </div>
          <div className="mt-3 space-y-1 text-center text-xs text-slate-500">
            <p>customer@evnexus.com / operator@evnexus.com / admin@evnexus.com</p>
            <p>Password: 123456</p>
          </div>
        </div>
      </div>
    </div>
  );
}
