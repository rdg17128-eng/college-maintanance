import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { Navbar } from './components/layout/Navbar';
import { UserPortal } from './components/portals/UserPortal';
import { AdminPortal } from './components/portals/AdminPortal';
import { PortalLogin } from './components/auth/PortalLogin';

function MainApp() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center p-6 bg-white border border-slate-200 rounded-lg">
          <p className="text-sm font-bold text-slate-700">Loading CampusCare...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      
      {/* Top Navbar */}
      {user && <Navbar />}

      {/* Main Content Sections */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {!user ? (
          <PortalLogin />
        ) : user.role === 'admin' ? (
          <AdminPortal />
        ) : (
          <UserPortal />
        )}
      </main>

      {/* Clean Light Footer - Text Only */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>Campus Facilities Network - Live Status Active</div>
          <div>Copyright {new Date().getFullYear()} CampusCare Maintenance System</div>
        </div>
      </footer>

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <MainApp />
      </ToastProvider>
    </AuthProvider>
  );
}
