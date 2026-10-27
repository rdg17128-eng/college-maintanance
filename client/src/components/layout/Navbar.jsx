import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export function Navbar() {
  const { user, logout, switchDemoRole } = useAuth();
  const { addToast } = useToast();

  const handleRoleSwitch = async (role) => {
    try {
      await switchDemoRole(role);
      addToast(`Switched view to ${role.toUpperCase()}`, 'info');
    } catch (err) {
      addToast(`Failed to switch: ${err.message}`, 'error');
    }
  };

  return (
    <header className="bg-white border-b border-sky-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand with Logo */}
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="CampusCare Logo" className="w-8 h-8 object-contain" />
          <span className="font-bold text-xl text-black tracking-tight">
            CampusCare
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-black bg-sky-100 px-2.5 py-0.5 rounded border border-sky-300">
            Maintenance
          </span>
        </div>

        {/* Right Navigation Controls */}
        <div className="flex items-center gap-3">
          
          {/* Role Switcher - Sky Blue & White Only */}
          <div className="hidden sm:flex items-center gap-1.5 p-1 rounded bg-sky-50 border border-sky-200 text-xs">
            <span className="text-black font-semibold px-2">Role:</span>
            <button
              onClick={() => handleRoleSwitch('student')}
              className={`px-3 py-1 rounded font-bold cursor-pointer transition-colors ${
                user?.role === 'student'
                  ? 'bg-sky-500 text-white'
                  : 'text-black hover:bg-sky-100'
              }`}
            >
              Student
            </button>
            <button
              onClick={() => handleRoleSwitch('faculty')}
              className={`px-3 py-1 rounded font-bold cursor-pointer transition-colors ${
                user?.role === 'faculty'
                  ? 'bg-sky-500 text-white'
                  : 'text-black hover:bg-sky-100'
              }`}
            >
              Faculty
            </button>
            <button
              onClick={() => handleRoleSwitch('admin')}
              className={`px-3 py-1 rounded font-bold cursor-pointer transition-colors ${
                user?.role === 'admin'
                  ? 'bg-sky-500 text-white'
                  : 'text-black hover:bg-sky-100'
              }`}
            >
              Admin
            </button>
          </div>

          {/* User Details */}
          <div className="text-right hidden md:block">
            <div className="text-xs font-bold text-black">{user?.name}</div>
            <div className="text-[10px] text-black">{user?.department || user?.email}</div>
          </div>

          {/* Current Role Badge */}
          <span className="px-2.5 py-1 rounded text-xs font-bold uppercase bg-sky-100 text-black border border-sky-300">
            {user?.role}
          </span>

          {/* Sign Out Button */}
          <button
            onClick={logout}
            className="px-3 py-1 text-xs font-bold text-black bg-white hover:bg-sky-100 border border-sky-300 rounded cursor-pointer"
          >
            Sign Out
          </button>

        </div>
      </div>
    </header>
  );
}
