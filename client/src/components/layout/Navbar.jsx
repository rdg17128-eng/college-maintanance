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
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        
        {/* Brand */}
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="CampusCare Logo" className="w-8 h-8 object-contain rounded" />
          <div className="flex items-center gap-2">
            <span className="font-semibold text-lg text-slate-900 tracking-tight">
              CampusCare
            </span>
            <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              Maintenance
            </span>
          </div>
        </div>

        {/* Right Navigation Controls */}
        <div className="flex items-center gap-3">
          
          {/* Subtle Demo Role Switcher */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs">
            <label htmlFor="role-select" className="text-slate-400 text-[11px]">Role:</label>
            <select
              id="role-select"
              value={user?.role}
              onChange={(e) => handleRoleSwitch(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-slate-700 text-xs font-medium cursor-pointer focus:outline-none focus:border-blue-500"
            >
              <option value="student">Student</option>
              <option value="faculty">Faculty</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* User Info */}
          <div className="text-right hidden md:block">
            <div className="text-xs font-medium text-slate-800">{user?.name}</div>
            <div className="text-[11px] text-slate-400">{user?.department || user?.email}</div>
          </div>

          <span className="px-2 py-0.5 rounded text-[11px] font-medium uppercase bg-blue-50 text-blue-700 border border-blue-200">
            {user?.role}
          </span>

          {/* Sign Out Button */}
          <button
            onClick={logout}
            className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 rounded-md transition-colors cursor-pointer"
          >
            Sign Out
          </button>

        </div>
      </div>
    </header>
  );
}
