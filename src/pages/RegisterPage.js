import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const RegisterPage = () => {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', firm: '', license: '', role: 'Advisor' });
  const [loading, setLoading] = useState(false);

  const set = (key) => (e) => setForm(p => ({ ...p, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 8) return toast.error('Password must be at least 8 characters');
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created! Welcome to Advisor AI.');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full bg-surface-700 border border-surface-500 rounded-lg px-4 py-3 text-slate-200 text-sm placeholder-slate-600 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30 transition-colors";

  return (
    <div className="min-h-screen bg-surface-900 flex items-center justify-center p-4 font-body">
      <div className="absolute inset-0 opacity-5"
        style={{ backgroundImage: 'linear-gradient(#22c55e 1px, transparent 1px), linear-gradient(90deg, #22c55e 1px, transparent 1px)', backgroundSize: '40px 40px' }}
      />
      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center">
              <span className="text-white font-display font-bold">A</span>
            </div>
            <span className="font-display font-bold text-white text-xl">Advisor AI</span>
          </div>
          <p className="text-slate-400 text-sm">Create your advisor account</p>
        </div>

        <div className="bg-surface-800 border border-surface-600 rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm text-slate-400 mb-2">Full Name *</label>
                <input type="text" required value={form.name} onChange={set('name')} placeholder="Rajesh Sharma" className={inputClass} />
              </div>
              <div className="col-span-2">
                <label className="block text-sm text-slate-400 mb-2">Email Address *</label>
                <input type="email" required value={form.email} onChange={set('email')} placeholder="rajesh@wealthfirm.in" className={inputClass} />
              </div>
              <div className="col-span-2">
                <label className="block text-sm text-slate-400 mb-2">Password * (min 8 chars)</label>
                <input type="password" required value={form.password} onChange={set('password')} placeholder="••••••••" className={inputClass} />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Firm Name</label>
                <input type="text" value={form.firm} onChange={set('firm')} placeholder="Wealth Advisors" className={inputClass} />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">License No.</label>
                <input type="text" value={form.license} onChange={set('license')} placeholder="INH000XXXXX" className={inputClass} />
              </div>
              <div className="col-span-2">
                <label className="block text-sm text-slate-400 mb-2">Account Role</label>
                <select value={form.role} onChange={set('role')} className={inputClass}>
                  <option value="Advisor">Advisor</option>
                  <option value="Compliance Officer">Compliance Officer</option>
                  <option value="Operations">Operations</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white font-medium rounded-lg py-3 text-sm transition-all duration-150 active:scale-95 mt-2"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
          <p className="text-center text-slate-500 text-sm mt-6">
            Already registered?{' '}
            <Link to="/login" className="text-primary-400 hover:text-primary-300">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
