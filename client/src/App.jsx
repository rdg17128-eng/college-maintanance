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
      <div className="min-h-screen bg-white text-black flex items-center justify-center p-4">
        <div className="text-center p-6 border border-sky-300 rounded bg-white">
          <p className="text-sm font-bold text-black">Loading CampusCare...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white text-black">
      
      {/* Top Navbar */}
      {user && <Navbar />}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {!user ? (
          <PortalLogin />
        ) : user.role === 'admin' ? (
          <AdminPortal />
        ) : (
          <UserPortal />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-sky-200 py-4 text-center text-xs text-black">
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
