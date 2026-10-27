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
    <div className="min-h-[75vh] flex items-center justify-center p-4 bg-white">
      <div className="max-w-md w-full bg-white rounded-xl border border-sky-300 p-8 shadow-sm text-black">
        
        {/* Header with Large Circular Logo */}
        <div className="text-center mb-6">
          <div className="w-36 h-36 rounded-full border-4 border-sky-400 bg-white flex items-center justify-center p-3 mx-auto mb-4 shadow-sm overflow-hidden">
            <img src="/logo.png" alt="CampusCare Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-black">
            CampusCare Maintenance
          </h1>
          <p className="text-xs text-black mt-1">
            College Maintenance Management System
          </p>
        </div>

        {/* 1-Click Demo Section - Sky Blue and White Only */}
        <div className="mb-6 p-4 rounded-lg bg-sky-50 border border-sky-300 text-center">
          <span className="text-xs font-bold text-black block mb-2 uppercase tracking-wide">
            Quick 1-Click Demo Login
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('student')}
              disabled={loading}
              className="py-2 px-2 bg-white hover:bg-sky-100 border border-sky-400 rounded text-xs font-bold text-black transition-colors cursor-pointer"
            >
              Student
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('faculty')}
              disabled={loading}
              className="py-2 px-2 bg-white hover:bg-sky-100 border border-sky-400 rounded text-xs font-bold text-black transition-colors cursor-pointer"
            >
              Faculty
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('admin')}
              disabled={loading}
              className="py-2 px-2 bg-white hover:bg-sky-100 border border-sky-400 rounded text-xs font-bold text-black transition-colors cursor-pointer"
            >
              Admin
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-sky-50 p-1 rounded border border-sky-200 text-xs font-bold mb-6">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(''); }}
            className={`flex-1 py-2 rounded cursor-pointer ${
              mode === 'login' ? 'bg-sky-500 text-white font-bold' : 'text-black hover:bg-sky-100'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError(''); }}
            className={`flex-1 py-2 rounded cursor-pointer ${
              mode === 'register' ? 'bg-sky-500 text-white font-bold' : 'text-black hover:bg-sky-100'
            }`}
          >
            Register Account
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-white border border-black rounded text-xs text-black font-semibold">
            {error}
          </div>
        )}

        {/* Sign In Form */}
        {mode === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-black font-bold mb-1">Campus Email</label>
              <input
                type="email"
                required
                placeholder="name@apexcollege.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white border border-sky-300 rounded px-3 py-2 text-black font-medium focus:outline-none focus:border-sky-600"
              />
            </div>

            <div>
              <label className="block text-black font-bold mb-1">Password</label>
              <input
                type="password"
                required
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white border border-sky-300 rounded px-3 py-2 text-black font-medium focus:outline-none focus:border-sky-600"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded transition-colors text-sm cursor-pointer"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
        ) : (
          /* Register Form */
          <form onSubmit={handleRegisterSubmit} className="space-y-3 text-xs">
            <div>
              <label className="block text-black font-bold mb-1">Full Name *</label>
              <input
                type="text"
                required
                placeholder="Full Name"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                className="w-full bg-white border border-sky-300 rounded px-3 py-2 text-black font-medium focus:outline-none focus:border-sky-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-black font-bold mb-1">Role *</label>
                <select
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value)}
                  className="w-full bg-white border border-sky-300 rounded px-2 py-2 text-black font-medium focus:outline-none focus:border-sky-600"
                >
                  <option value="student">Student</option>
                  <option value="faculty">Faculty</option>
                </select>
              </div>

              <div>
                <label className="block text-black font-bold mb-1">ID Number *</label>
                <input
                  type="text"
                  required
                  placeholder="23CS012"
                  value={regId}
                  onChange={(e) => setRegId(e.target.value)}
                  className="w-full bg-white border border-sky-300 rounded px-3 py-2 text-black font-medium focus:outline-none focus:border-sky-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-black font-bold mb-1">Department *</label>
              <select
                value={regDept}
                onChange={(e) => setRegDept(e.target.value)}
                className="w-full bg-white border border-sky-300 rounded px-2.5 py-2 text-black font-medium focus:outline-none focus:border-sky-600"
              >
                {DEPARTMENTS.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-black font-bold mb-1">Campus Email *</label>
              <input
                type="email"
                required
                placeholder="name@apexcollege.edu"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                className="w-full bg-white border border-sky-300 rounded px-3 py-2 text-black font-medium focus:outline-none focus:border-sky-600"
              />
            </div>

            <div>
              <label className="block text-black font-bold mb-1">Password *</label>
              <input
                type="password"
                required
                placeholder="At least 6 characters"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                className="w-full bg-white border border-sky-300 rounded px-3 py-2 text-black font-medium focus:outline-none focus:border-sky-600"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded transition-colors text-xs cursor-pointer"
            >
              {loading ? 'Creating Account...' : 'Register'}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
