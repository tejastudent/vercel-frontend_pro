import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Doughnut, Line } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Filler } from 'chart.js';
import { portfoliosAPI, clientsAPI } from '../utils/api';
import toast from 'react-hot-toast';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Filler);

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

const AddHoldingModal = ({ clientId, onClose, onAdd }) => {
  const [form, setForm] = useState({ symbol: '', name: '', quantity: '', purchasePrice: '', sector: 'Technology', exchange: 'NSE' });
  const [saving, setSaving] = useState(false);
  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));
  const inputClass = "w-full bg-surface-700 border border-surface-500 rounded-lg px-3 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-primary-500 transition-colors";

  const handleAdd = async () => {
    if (!form.symbol || !form.name || !form.quantity || !form.purchasePrice) return toast.error('Fill all required fields');
    setSaving(true);
    try {
      const { data } = await portfoliosAPI.addHolding(clientId, {
        ...form,
        symbol: form.symbol.toUpperCase(),
        quantity: +form.quantity,
        purchasePrice: +form.purchasePrice
      });
      onAdd(data);
      toast.success(`${form.symbol.toUpperCase()} added to portfolio`);
      onClose();
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed to add holding');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-surface-800 border border-surface-600 rounded-2xl w-full max-w-md p-6 animate-slide-in">
        <div className="flex justify-between items-center mb-5">
          <h2 className="font-display font-bold text-white">Add Holding</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 text-lg">×</button>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Symbol *</label>
              <input className={inputClass} value={form.symbol} onChange={set('symbol')} placeholder="RELIANCE" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Exchange</label>
              <select className={inputClass} value={form.exchange} onChange={set('exchange')}>
                <option>NSE</option><option>BSE</option><option>NASDAQ</option><option>NYSE</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">Stock Name *</label>
            <input className={inputClass} value={form.name} onChange={set('name')} placeholder="Reliance Industries Ltd." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Quantity *</label>
              <input className={inputClass} type="number" value={form.quantity} onChange={set('quantity')} placeholder="50" min="1" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Purchase Price (₹) *</label>
              <input className={inputClass} type="number" value={form.purchasePrice} onChange={set('purchasePrice')} placeholder="2800" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">Sector</label>
            <select className={inputClass} value={form.sector} onChange={set('sector')}>
              {['Technology', 'Finance', 'Healthcare', 'Energy', 'Consumer', 'Industrial', 'Real Estate', 'Utilities', 'Telecom', 'Materials', 'Other'].map(s => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 border border-surface-500 text-slate-400 rounded-lg py-2.5 text-sm hover:border-slate-400 transition-colors">Cancel</button>
          <button onClick={handleAdd} disabled={saving} className="flex-1 bg-primary-500 hover:bg-primary-600 text-white rounded-lg py-2.5 text-sm font-medium disabled:opacity-50 transition-colors">
            {saving ? 'Adding...' : 'Add Holding'}
          </button>
        </div>
      </div>
    </div>
  );
};

const PortfolioPage = () => {
  const { id } = useParams();
  const [portfolio, setPortfolio] = useState(null);
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [portRes, clientRes] = await Promise.all([
          portfoliosAPI.get(id),
          clientsAPI.getOne(id)
        ]);
        setPortfolio(portRes.data);
        setClient(clientRes.data);
      } catch (e) {
        toast.error('Failed to load portfolio');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const { data } = await portfoliosAPI.refreshPrices(id);
      setPortfolio(data);
      toast.success('Prices refreshed');
    } catch (e) {
      toast.error('Price refresh failed');
    } finally {
      setRefreshing(false);
    }
  };

  const handleRemove = async (holdingId, symbol) => {
    if (!window.confirm(`Remove ${symbol} from portfolio?`)) return;
    try {
      const { data } = await portfoliosAPI.removeHolding(id, holdingId);
      setPortfolio(data);
      toast.success(`${symbol} removed`);
    } catch (e) {
      toast.error('Failed to remove holding');
    }
  };

  if (loading) return <div className="p-6 text-slate-500 text-center pt-20">Loading portfolio...</div>;

  const holdings = portfolio?.holdings || [];
  const totalInvested = holdings.reduce((s, h) => s + h.quantity * h.purchasePrice, 0);
  const totalCurrent = holdings.reduce((s, h) => s + h.quantity * h.currentPrice, 0);
  const totalPnL = totalCurrent - totalInvested;
  const pnLPct = totalInvested > 0 ? ((totalPnL / totalInvested) * 100) : 0;

  // Allocation chart
  const allocationData = {
    labels: holdings.map(h => h.symbol),
    datasets: [{
      data: holdings.map(h => h.quantity * h.currentPrice),
      backgroundColor: COLORS.slice(0, holdings.length),
      borderWidth: 0
    }]
  };

  // Sector distribution
  const sectorMap = {};
  holdings.forEach(h => {
    const sector = h.sector || 'Other';
    sectorMap[sector] = (sectorMap[sector] || 0) + h.quantity * h.currentPrice;
  });
  const sectorData = {
    labels: Object.keys(sectorMap),
    datasets: [{
      data: Object.values(sectorMap),
      backgroundColor: COLORS.slice(0, Object.keys(sectorMap).length),
      borderWidth: 0
    }]
  };

  const fmtINR = v => `₹${v.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

  return (
    <div className="p-6 font-body animate-fade-in space-y-6">
      {showModal && (
        <AddHoldingModal
          clientId={id}
          onClose={() => setShowModal(false)}
          onAdd={setPortfolio}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link to="/clients" className="text-slate-500 hover:text-slate-300 text-sm">Clients</Link>
            <span className="text-slate-600">›</span>
            <Link to={`/clients/${id}`} className="text-slate-500 hover:text-slate-300 text-sm">{client?.name}</Link>
            <span className="text-slate-600">›</span>
            <span className="text-slate-300 text-sm">Portfolio</span>
          </div>
          <h1 className="text-xl font-display font-bold text-white">{client?.name}'s Portfolio</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={handleRefresh} disabled={refreshing} className="border border-surface-500 hover:border-slate-400 text-slate-400 hover:text-slate-200 text-sm px-3 py-2 rounded-lg disabled:opacity-50 transition-colors">
            {refreshing ? 'Refreshing...' : '↻ Refresh'}
          </button>
          <button onClick={() => setShowModal(true)} className="bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
            + Add Holding
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Invested', value: fmtINR(totalInvested) },
          { label: 'Current Value', value: fmtINR(totalCurrent) },
          {
            label: 'Total P&L',
            value: `${totalPnL >= 0 ? '+' : ''}${fmtINR(totalPnL)}`,
            color: totalPnL >= 0 ? 'text-green-400' : 'text-red-400'
          },
          {
            label: 'Returns',
            value: `${pnLPct >= 0 ? '+' : ''}${pnLPct.toFixed(2)}%`,
            color: pnLPct >= 0 ? 'text-green-400' : 'text-red-400'
          }
        ].map(card => (
          <div key={card.label} className="bg-surface-800 border border-surface-600 rounded-xl p-4">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">{card.label}</p>
            <p className={`text-xl font-display font-bold ${card.color || 'text-slate-100'}`}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      {holdings.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-surface-800 border border-surface-600 rounded-xl p-5">
            <h3 className="font-display font-bold text-white text-sm mb-4">Stock Allocation</h3>
            <div style={{ height: 220 }}>
              <Doughnut data={allocationData} options={{
                responsive: true, maintainAspectRatio: false, cutout: '60%',
                plugins: { legend: { position: 'right', labels: { color: '#94a3b8', font: { size: 10 }, padding: 8 } } }
              }} />
            </div>
          </div>
          <div className="bg-surface-800 border border-surface-600 rounded-xl p-5">
            <h3 className="font-display font-bold text-white text-sm mb-4">Sector Exposure</h3>
            <div style={{ height: 220 }}>
              <Doughnut data={sectorData} options={{
                responsive: true, maintainAspectRatio: false, cutout: '60%',
                plugins: { legend: { position: 'right', labels: { color: '#94a3b8', font: { size: 10 }, padding: 8 } } }
              }} />
            </div>
          </div>
        </div>
      )}

      {/* Holdings table */}
      <div className="bg-surface-800 border border-surface-600 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-surface-600 flex justify-between items-center">
          <h3 className="font-display font-bold text-white text-sm">{holdings.length} Holdings</h3>
          <span className="text-xs text-slate-500">Last updated: {portfolio?.lastUpdated ? new Date(portfolio.lastUpdated).toLocaleTimeString('en-IN') : '—'}</span>
        </div>
        {holdings.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500 mb-4">No holdings yet</p>
            <button onClick={() => setShowModal(true)} className="bg-primary-500 text-white text-sm px-4 py-2 rounded-lg hover:bg-primary-600">Add first holding</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-slate-500 uppercase tracking-wider">
                  {['Symbol', 'Qty', 'Buy Price', 'Current', 'Invested', 'Value', 'P&L', 'P&L %', ''].map(h => (
                    <th key={h} className="px-5 py-3 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-700">
                {holdings.map(h => {
                  const invested = h.quantity * h.purchasePrice;
                  const current = h.quantity * h.currentPrice;
                  const pl = current - invested;
                  const plPct = invested > 0 ? (pl / invested) * 100 : 0;
                  const up = pl >= 0;
                  return (
                    <tr key={h._id} className="hover:bg-surface-700/50 transition-colors">
                      <td className="px-5 py-3">
                        <div>
                          <p className="text-sm font-mono font-bold text-slate-100">{h.symbol}</p>
                          <p className="text-xs text-slate-500">{h.name}</p>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-sm text-slate-300">{h.quantity}</td>
                      <td className="px-5 py-3 text-sm text-slate-400">₹{h.purchasePrice?.toLocaleString('en-IN')}</td>
                      <td className="px-5 py-3 text-sm text-slate-200">₹{h.currentPrice?.toLocaleString('en-IN')}</td>
                      <td className="px-5 py-3 text-sm text-slate-400">{fmtINR(invested)}</td>
                      <td className="px-5 py-3 text-sm text-slate-200">{fmtINR(current)}</td>
                      <td className={`px-5 py-3 text-sm font-medium ${up ? 'text-green-400' : 'text-red-400'}`}>
                        {up ? '+' : ''}{fmtINR(pl)}
                      </td>
                      <td className={`px-5 py-3 text-sm ${up ? 'text-green-400' : 'text-red-400'}`}>
                        {up ? '+' : ''}{plPct.toFixed(2)}%
                      </td>
                      <td className="px-5 py-3">
                        <button onClick={() => handleRemove(h._id, h.symbol)} className="text-xs text-red-500 hover:text-red-400 transition-colors">×</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PortfolioPage;
