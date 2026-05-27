import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-900 flex items-center justify-center p-4 font-body">
      {/* Background grid */}
      <div className="absolute inset-0 opacity-5"
        style={{ backgroundImage: 'linear-gradient(#22c55e 1px, transparent 1px), linear-gradient(90deg, #22c55e 1px, transparent 1px)', backgroundSize: '40px 40px' }}
      />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center">
              <span className="text-white font-display font-bold">A</span>
            </div>
            <span className="font-display font-bold text-white text-xl">Advisor AI</span>
          </div>
          <p className="text-slate-400 text-sm">Sign in to your advisor dashboard</p>
        </div>

        {/* Form card */}
        <div className="bg-surface-800 border border-surface-600 rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm text-slate-400 mb-2">Email address</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                placeholder="advisor@firm.com"
                className="w-full bg-surface-700 border border-surface-500 rounded-lg px-4 py-3 text-slate-200 text-sm placeholder-slate-600 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">Password</label>
              <input
                type="password"
                required
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                placeholder="••••••••"
                className="w-full bg-surface-700 border border-surface-500 rounded-lg px-4 py-3 text-slate-200 text-sm placeholder-slate-600 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30 transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white font-medium rounded-lg py-3 text-sm transition-all duration-150 active:scale-95"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-slate-500 text-sm mt-6">
            No account?{' '}
            <Link to="/register" className="text-primary-400 hover:text-primary-300 transition-colors">
              Create one
            </Link>
          </p>
        </div>

        <p className="text-center text-slate-600 text-xs mt-6">
          Advisor AI – Intelligent Financial Platform
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
