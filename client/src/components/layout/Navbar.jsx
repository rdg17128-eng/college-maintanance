import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Wrench, LogOut, GraduationCap, Briefcase, ShieldCheck } from 'lucide-react';
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

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return { label: 'Admin', color: 'bg-purple-100 text-purple-700 border-purple-200', icon: ShieldCheck };
      case 'faculty':
        return { label: 'Faculty', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: Briefcase };
      default:
        return { label: 'Student', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: GraduationCap };
    }
  };

  const roleInfo = getRoleBadge(user?.role);
  const RoleIcon = roleInfo.icon;

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
            <Wrench className="w-5 h-5 -rotate-45" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 tracking-tight text-base sm:text-lg">
                CampusCare
              </span>
              <span className="hidden sm:inline-block text-[11px] font-semibold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                Maintenance
              </span>
            </div>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2 sm:gap-4">
          
          {/* Quick Demo Role Switcher for instant testing */}
          <div className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            <span className="text-[11px] text-slate-400 font-medium px-2">Switch demo:</span>
            <button
              onClick={() => handleRoleSwitch('student')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                user?.role === 'student' ? 'bg-white text-blue-700 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Student
            </button>
            <button
              onClick={() => handleRoleSwitch('faculty')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                user?.role === 'faculty' ? 'bg-white text-emerald-700 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Faculty
            </button>
            <button
              onClick={() => handleRoleSwitch('admin')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                user?.role === 'admin' ? 'bg-white text-purple-700 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Admin
            </button>
          </div>

          {/* Active User info */}
          <div className="flex items-center gap-2 pl-2">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-semibold text-slate-800 leading-tight">
                {user?.name}
              </div>
              <div className="text-[10px] text-slate-400">
                {user?.department || user?.email}
              </div>
            </div>

            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border ${roleInfo.color}`}>
              <RoleIcon className="w-3.5 h-3.5" />
              <span>{roleInfo.label}</span>
            </span>
          </div>

          {/* Sign Out Button */}
          <button
            onClick={logout}
            title="Sign Out"
            className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all border border-transparent hover:border-rose-200"
          >
            <LogOut className="w-4 h-4" />
          </button>

        </div>
      </div>
    </header>
  );
}
