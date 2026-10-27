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

  const getRoleStyle = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-violet-100 text-violet-800 border-violet-300';
      case 'faculty':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      default:
        return 'bg-sky-100 text-sky-800 border-sky-300';
    }
  };

  return (
    <header className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand - Text Only */}
        <div className="flex items-center gap-3">
          <span className="font-bold text-xl text-slate-900 tracking-tight">
            CampusCare
          </span>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            Maintenance
          </span>
        </div>

        {/* Right Navigation Controls */}
        <div className="flex items-center gap-3">
          
          {/* Quick Demo Role Switcher - Text Only */}
          <div className="hidden sm:flex items-center gap-1.5 p-1 rounded-lg bg-slate-100 border border-slate-200 text-xs">
            <span className="text-slate-500 font-medium px-2">Role:</span>
            <button
              onClick={() => handleRoleSwitch('student')}
              className={`px-3 py-1 rounded font-semibold cursor-pointer ${
                user?.role === 'student'
                  ? 'bg-sky-600 text-white'
                  : 'text-slate-700 hover:bg-white'
              }`}
            >
              Student
            </button>
            <button
              onClick={() => handleRoleSwitch('faculty')}
              className={`px-3 py-1 rounded font-semibold cursor-pointer ${
                user?.role === 'faculty'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-700 hover:bg-white'
              }`}
            >
              Faculty
            </button>
            <button
              onClick={() => handleRoleSwitch('admin')}
              className={`px-3 py-1 rounded font-semibold cursor-pointer ${
                user?.role === 'admin'
                  ? 'bg-violet-600 text-white'
                  : 'text-slate-700 hover:bg-white'
              }`}
            >
              Admin
            </button>
          </div>

          {/* User Details */}
          <div className="text-right hidden md:block">
            <div className="text-xs font-bold text-slate-800">{user?.name}</div>
            <div className="text-[10px] text-slate-500">{user?.department || user?.email}</div>
          </div>

          {/* Current Role Badge */}
          <span className={`px-2.5 py-1 rounded text-xs font-bold uppercase border ${getRoleStyle(user?.role)}`}>
            {user?.role}
          </span>

          {/* Sign Out Button - Text Only */}
          <button
            onClick={logout}
            className="px-3 py-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded cursor-pointer"
          >
            Sign Out
          </button>

        </div>
      </div>
    </header>
  );
}
