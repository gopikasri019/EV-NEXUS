import { useState } from 'react';
import type { User, PageKey } from './types/index';
import { storage } from './services/storage';
import { initializeDemoData } from './data/demoData';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Login from './pages/Login';
import CustomerDashboard from './pages/CustomerDashboard';
import Stations from './pages/Stations';
import Bookings from './pages/Bookings';
import ChargingSession from './pages/ChargingSession';
import Payments from './pages/Payments';
import Analytics from './pages/Analytics';
import AIIntelligence from './pages/AIIntelligence';
import WhatIfSimulator from './pages/WhatIfSimulator';
import OperatorDashboard from './pages/OperatorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Settings from './pages/Settings';

export default function App() {
  const [user, setUser] = useState<User | null>(() => {
    initializeDemoData();
    return storage.getUser();
  });
  const [currentPage, setCurrentPage] = useState<PageKey>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  function handleLogin(u: User) {
    setUser(u);
    setCurrentPage(u.role === 'OPERATOR' ? 'operator' : u.role === 'ADMIN' ? 'admin' : 'dashboard');
  }

  function handleLogout() {
    storage.setUser(null);
    setUser(null);
  }

  function handleNavigate(page: PageKey) {
    setCurrentPage(page);
  }

  function handleReset() {
    setRefreshKey((k) => k + 1);
    setCurrentPage('dashboard');
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  const currentUser = user;

  function renderPage() {
    switch (currentPage) {
      case 'dashboard':
        return <CustomerDashboard key={refreshKey} user={currentUser} onNavigate={handleNavigate} />;
      case 'stations':
        return <Stations key={refreshKey} user={currentUser} onBooked={() => setRefreshKey((k) => k + 1)} />;
      case 'bookings':
        return <Bookings key={refreshKey} user={currentUser} onNavigate={handleNavigate} />;
      case 'charging':
        return <ChargingSession key={refreshKey} user={currentUser} onNavigate={handleNavigate} />;
      case 'payments':
        return <Payments key={refreshKey} user={currentUser} onNavigate={handleNavigate} />;
      case 'analytics':
        return <Analytics key={refreshKey} />;
      case 'ai':
        return <AIIntelligence key={refreshKey} />;
      case 'simulator':
        return <WhatIfSimulator key={refreshKey} />;
      case 'operator':
        return <OperatorDashboard key={refreshKey} />;
      case 'admin':
        return <AdminDashboard key={refreshKey} />;
      case 'settings':
        return <Settings key={refreshKey} user={currentUser} onReset={handleReset} />;
      default:
        return <CustomerDashboard key={refreshKey} user={currentUser} onNavigate={handleNavigate} />;
    }
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <Sidebar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        role={currentUser.role}
        userName={currentUser.name}
        onLogout={handleLogout}
        open={sidebarOpen}
        onOpen={() => setSidebarOpen(true)}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="lg:pl-64">
        <Topbar currentPage={currentPage} />
        <main className="p-4 pt-6 lg:p-8">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}
