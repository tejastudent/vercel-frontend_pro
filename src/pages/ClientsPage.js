import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { clientsAPI } from '../utils/api';
import toast from 'react-hot-toast';

const INVESTMENT_GOALS = [
  { value: 'wealth_building', label: 'Wealth Building' },
  { value: 'retirement', label: 'Retirement' },
  { value: 'education', label: 'Education' },
  { value: 'tax_saving', label: 'Tax Saving' },
  { value: 'emergency_fund', label: 'Emergency Fund' },
  { value: 'home_purchase', label: 'Home Purchase' },
  { value: 'other', label: 'Other' }
];

const AddClientModal = ({ onClose, onSave }) => {
  const [form, setForm] = useState({
    name: '', age: '', email: '', phone: '', income: '',
    investmentGoal: 'wealth_building', investmentDuration: '',
    riskTolerance: 'medium', notes: ''
  });
  const [saving, setSaving] = useState(false);

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSave = async () => {
    if (!form.name || !form.email || !form.age || !form.income || !form.investmentDuration) {
      return toast.error('Please fill in all required fields');
    }
    setSaving(true);
    try {
      const { data } = await clientsAPI.create({
        ...form, age: +form.age, income: +form.income, investmentDuration: +form.investmentDuration
      });
      onSave(data);
      toast.success(`${form.name} added successfully`);
      onClose();
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed to add client');
    } finally {
      setSaving(false);
    }
  };

  const labelClass = "block text-xs text-slate-400 mb-1.5";
  const inputClass = "w-full bg-surface-700 border border-surface-500 rounded-lg px-3 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-primary-500 transition-colors";

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-surface-800 border border-surface-600 rounded-2xl w-full max-w-lg p-6 animate-slide-in">
        <div className="flex justify-between items-center mb-5">
          <h2 className="font-display font-bold text-white">Add New Client</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 text-lg">×</button>
        </div>
        <div className="grid grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-1">
          <div className="col-span-2">
            <label className={labelClass}>Full Name *</label>
            <input className={inputClass} value={form.name} onChange={set('name')} placeholder="Ravi Kumar" />
          </div>
          <div>
            <label className={labelClass}>Age *</label>
            <input className={inputClass} type="number" value={form.age} onChange={set('age')} placeholder="35" min="18" max="99" />
          </div>
          <div>
            <label className={labelClass}>Phone</label>
            <input className={inputClass} value={form.phone} onChange={set('phone')} placeholder="+91 98765 43210" />
          </div>
          <div className="col-span-2">
            <label className={labelClass}>Email *</label>
            <input className={inputClass} type="email" value={form.email} onChange={set('email')} placeholder="ravi@email.com" />
          </div>
          <div>
            <label className={labelClass}>Annual Income (₹) *</label>
            <input className={inputClass} type="number" value={form.income} onChange={set('income')} placeholder="1200000" />
          </div>
          <div>
            <label className={labelClass}>Investment Duration (years) *</label>
            <input className={inputClass} type="number" value={form.investmentDuration} onChange={set('investmentDuration')} placeholder="10" min="1" />
          </div>
          <div>
            <label className={labelClass}>Investment Goal *</label>
            <select className={inputClass} value={form.investmentGoal} onChange={set('investmentGoal')}>
              {INVESTMENT_GOALS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Risk Tolerance</label>
            <select className={inputClass} value={form.riskTolerance} onChange={set('riskTolerance')}>
              <option value="low">Low Risk</option>
              <option value="medium">Medium Risk</option>
              <option value="high">High Risk</option>
            </select>
          </div>
          <div className="col-span-2">
            <label className={labelClass}>Notes</label>
            <textarea className={inputClass} value={form.notes} onChange={set('notes')} rows={2} placeholder="Any additional notes..." />
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 border border-surface-500 text-slate-400 hover:text-slate-200 hover:border-slate-400 rounded-lg py-2.5 text-sm transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="flex-1 bg-primary-500 hover:bg-primary-600 text-white rounded-lg py-2.5 text-sm font-medium disabled:opacity-50 transition-colors">
            {saving ? 'Saving...' : 'Add Client'}
          </button>
        </div>
      </div>
    </div>
  );
};

const ClientsPage = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('');
  const [showModal, setShowModal] = useState(false);

  const fetchClients = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (riskFilter) params.riskTolerance = riskFilter;
      const { data } = await clientsAPI.getAll(params);
      setClients(data.clients || []);
    } catch (e) {
      toast.error('Failed to load clients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(fetchClients, 300);
    return () => clearTimeout(t);
  }, [search, riskFilter]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete ${name}? This will also delete their portfolio.`)) return;
    try {
      await clientsAPI.delete(id);
      setClients(prev => prev.filter(c => c._id !== id));
      toast.success(`${name} deleted`);
    } catch (e) {
      toast.error('Delete failed');
    }
  };

  const riskBadge = (risk) => {
    const styles = {
      high: 'bg-red-500/20 text-red-400',
      medium: 'bg-yellow-500/20 text-yellow-400',
      low: 'bg-blue-500/20 text-blue-400'
    };
    return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${styles[risk] || ''}`}>{risk}</span>;
  };

  return (
    <div className="p-6 font-body animate-fade-in">
      {showModal && (
        <AddClientModal
          onClose={() => setShowModal(false)}
          onSave={newClient => setClients(prev => [newClient, ...prev])}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-display font-bold text-white">Clients</h1>
          <p className="text-sm text-slate-500">{clients.length} client{clients.length !== 1 ? 's' : ''} total</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors active:scale-95"
        >
          + Add Client
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-5">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search clients..."
          className="flex-1 bg-surface-800 border border-surface-600 rounded-lg px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-primary-500 transition-colors"
        />
        <select
          value={riskFilter}
          onChange={e => setRiskFilter(e.target.value)}
          className="bg-surface-800 border border-surface-600 rounded-lg px-3 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-primary-500"
        >
          <option value="">All Risk Levels</option>
          <option value="low">Low Risk</option>
          <option value="medium">Medium Risk</option>
          <option value="high">High Risk</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-surface-800 border border-surface-600 rounded-xl overflow-hidden">
        {loading ? (
          <div className="text-center py-16 text-slate-500">Loading clients...</div>
        ) : clients.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-slate-500 mb-4">No clients found</p>
            <button onClick={() => setShowModal(true)} className="bg-primary-500 text-white text-sm px-4 py-2 rounded-lg hover:bg-primary-600">
              Add first client
            </button>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-600">
                {['Client', 'Age', 'Investment Goal', 'Duration', 'Risk', 'Actions'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs text-slate-500 uppercase tracking-wider font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-700">
              {clients.map(client => (
                <tr key={client._id} className="hover:bg-surface-700/50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-600/20 text-primary-400 text-xs font-bold flex items-center justify-center">
                        {client.initials}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-200">{client.name}</p>
                        <p className="text-xs text-slate-500">{client.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-400">{client.age}</td>
                  <td className="px-5 py-4 text-sm text-slate-400 capitalize">
                    {client.investmentGoal?.replace(/_/g, ' ')}
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-400">{client.investmentDuration}y</td>
                  <td className="px-5 py-4">{riskBadge(client.riskTolerance)}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <Link to={`/clients/${client._id}`} className="text-xs text-primary-400 hover:text-primary-300 transition-colors">View</Link>
                      <Link to={`/clients/${client._id}/portfolio`} className="text-xs text-slate-400 hover:text-slate-200 transition-colors">Portfolio</Link>
                      <button onClick={() => handleDelete(client._id, client.name)} className="text-xs text-red-500 hover:text-red-400 transition-colors">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ClientsPage;
