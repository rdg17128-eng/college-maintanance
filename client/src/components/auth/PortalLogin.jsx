import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { DEPARTMENTS } from '../../constants';
import { useToast } from '../../context/ToastContext';

export function PortalLogin({ onLoginSuccess }) {
  const { login, register } = useAuth();
  const { addToast } = useToast();

  const [mode, setMode] = useState('login');

  // Login form state
  const [email, setEmail] = useState('student@apexcollege.edu');
  const [password, setPassword] = useState('student123');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState('student');
  const [regDept, setRegDept] = useState(DEPARTMENTS[0]);
  const [regId, setRegId] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleQuickDemo = async (role) => {
    setError('');
    setLoading(true);
    const demoAccounts = {
      student: { email: 'student@apexcollege.edu', pass: 'student123' },
      faculty: { email: 'faculty@apexcollege.edu', pass: 'faculty123' },
      admin: { email: 'admin@apexcollege.edu', pass: 'admin123' }
    };
    const cred = demoAccounts[role];
    try {
      const user = await login(cred.email, cred.pass, role);
      addToast(`Logged in as ${user.name} (${user.role.toUpperCase()})`, 'success');
      if (onLoginSuccess) onLoginSuccess(user);
    } catch (err) {
      setError(err.message || 'Demo login failed');
      addToast(err.message || 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      addToast(`Welcome back, ${user.name}!`, 'success');
      if (onLoginSuccess) onLoginSuccess(user);
    } catch (err) {
      setError(err.message || 'Invalid email or password');
      addToast(err.message || 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!regName.trim() || !regEmail.trim() || !regPassword.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    try {
      const user = await register({
        name: regName.trim(),
        email: regEmail.trim(),
        password: regPassword.trim(),
        role: regRole,
        department: regDept,
        regNumber: regId.trim()
      });
      addToast(`Account created! Welcome, ${user.name}`, 'success');
      if (onLoginSuccess) onLoginSuccess(user);
    } catch (err) {
      setError(err.message || 'Registration failed');
      addToast(err.message || 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl border border-slate-200 p-8 shadow-sm animate-fade-in">
        
        {/* Header */}
        <div className="text-center mb-6">
          <img src="/logo.png" alt="CampusCare Logo" className="w-12 h-12 object-contain mx-auto mb-3" />
          <h1 className="text-xl font-semibold text-slate-900 tracking-tight">
            CampusCare Maintenance
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            College Maintenance Management System
          </p>
        </div>

        {/* Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-lg text-xs font-medium mb-6">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(''); }}
            className={`flex-1 py-1.5 rounded-md transition-all cursor-pointer ${
              mode === 'login' 
                ? 'bg-white text-slate-900 shadow-xs font-semibold' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError(''); }}
            className={`flex-1 py-1.5 rounded-md transition-all cursor-pointer ${
              mode === 'register' 
                ? 'bg-white text-slate-900 shadow-xs font-semibold' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Register
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-xs text-red-600 font-medium">
            {error}
          </div>
        )}

        {/* Sign In Form */}
        {mode === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Campus Email</label>
              <input
                type="email"
                required
                placeholder="name@apexcollege.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-slate-800 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Password</label>
              <input
                type="password"
                required
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-slate-800 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-md transition-colors text-sm cursor-pointer shadow-xs"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
        ) : (
          /* Register Form */
          <form onSubmit={handleRegisterSubmit} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Alex Morgan"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-slate-800 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Role *</label>
                <select
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-md px-2.5 py-2 text-slate-800 text-xs focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="student">Student</option>
                  <option value="faculty">Faculty</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">ID Number *</label>
                <input
                  type="text"
                  required
                  placeholder="23CS012"
                  value={regId}
                  onChange={(e) => setRegId(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-slate-800 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Department *</label>
              <select
                value={regDept}
                onChange={(e) => setRegDept(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-md px-2.5 py-2 text-slate-800 text-xs focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                {DEPARTMENTS.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Campus Email *</label>
              <input
                type="email"
                required
                placeholder="name@apexcollege.edu"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-slate-800 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Password *</label>
              <input
                type="password"
                required
                placeholder="At least 6 characters"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-slate-800 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-md transition-colors text-sm cursor-pointer shadow-xs"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
        )}

        {/* Quick Demo Logins */}
        <div className="mt-6 pt-5 border-t border-slate-200">
          <span className="text-[11px] font-medium text-slate-400 block text-center mb-2.5">
            Quick 1-Click Demo Login:
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('student')}
              disabled={loading}
              className="py-1.5 px-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded text-xs font-medium text-slate-700 transition-colors cursor-pointer text-center"
            >
              Student
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('faculty')}
              disabled={loading}
              className="py-1.5 px-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded text-xs font-medium text-slate-700 transition-colors cursor-pointer text-center"
            >
              Faculty
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('admin')}
              disabled={loading}
              className="py-1.5 px-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded text-xs font-medium text-slate-700 transition-colors cursor-pointer text-center"
            >
              Admin
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
