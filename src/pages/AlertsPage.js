import React, { useState, useEffect } from 'react';
import { alertsAPI } from '../utils/api';
import toast from 'react-hot-toast';

const SEVERITY_STYLES = {
  critical: { badge: 'bg-red-500/20 text-red-400 border-red-500/30', icon: '⚑', dot: 'bg-red-400' },
  high:     { badge: 'bg-orange-500/20 text-orange-400 border-orange-500/30', icon: '⚠', dot: 'bg-orange-400' },
  medium:   { badge: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', icon: '◉', dot: 'bg-yellow-400' },
  low:      { badge: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: '○', dot: 'bg-blue-400' }
};

const TYPE_LABELS = {
  market_drop: 'Market Drop',
  market_surge: 'Market Surge',
  risk_breach: 'Risk Breach',
  rebalance_needed: 'Rebalance Needed',
  portfolio_alert: 'Portfolio Alert',
  system: 'System'
};

const AlertCard = ({ alert, onMarkRead, onDelete }) => {
  const style = SEVERITY_STYLES[alert.severity] || SEVERITY_STYLES.low;
  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  return (
    <div className={`card p-5 transition-all ${!alert.isRead ? 'border-surface-500' : 'border-surface-700 opacity-70'}`}>
      <div className="flex items-start gap-4">
        {/* Severity dot */}
        <div className="mt-1 flex-shrink-0">
          <div className={`w-2.5 h-2.5 rounded-full ${style.dot} ${!alert.isRead ? 'animate-pulse' : ''}`} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-medium text-slate-100">{alert.title}</h3>
              <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${style.badge}`}>
                {alert.severity}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-surface-600 text-slate-400">
                {TYPE_LABELS[alert.type] || alert.type}
              </span>
            </div>
            <span className="text-xs text-slate-600 flex-shrink-0">{timeAgo(alert.createdAt)}</span>
          </div>

          <p className="text-sm text-slate-400 mb-3">{alert.message}</p>

          {alert.affectedClients?.length > 0 && (
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs text-slate-500">Affected clients:</span>
              <div className="flex gap-1 flex-wrap">
                {alert.affectedClients.map(c => (
                  <span key={c._id || c} className="text-xs bg-surface-700 border border-surface-500 text-slate-300 px-2 py-0.5 rounded-full">
                    {c.name || 'Client'}
                  </span>
                ))}
              </div>
            </div>
          )}

          {alert.symbol && alert.changePercent !== undefined && (
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-mono bg-surface-700 border border-surface-500 text-slate-300 px-2 py-0.5 rounded">
                {alert.symbol}
              </span>
              <span className={`text-xs font-medium ${alert.changePercent < 0 ? 'text-red-400' : 'text-green-400'}`}>
                {alert.changePercent > 0 ? '+' : ''}{alert.changePercent?.toFixed(2)}%
              </span>
            </div>
          )}

          <div className="flex items-center gap-3">
            {!alert.isRead && (
              <button
                onClick={() => onMarkRead(alert._id)}
                className="text-xs text-primary-400 hover:text-primary-300 transition-colors"
              >
                ✓ Mark as read
              </button>
            )}
            <button
              onClick={() => onDelete(alert._id)}
              className="text-xs text-red-500 hover:text-red-400 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AlertsPage = () => {
  const [alerts, setAlerts] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all | unread | critical
  const [typeFilter, setTypeFilter] = useState('');

  const fetchAlerts = async () => {
    try {
      const params = {};
      if (filter === 'unread') params.unread = true;
      if (filter === 'critical') params.severity = 'critical';
      if (typeFilter) params.type = typeFilter;

      const { data } = await alertsAPI.getAll(params);
      setAlerts(data.alerts || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (e) {
      toast.error('Failed to load alerts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAlerts(); }, [filter, typeFilter]);

  const handleMarkRead = async (id) => {
    try {
      await alertsAPI.markRead(id);
      setAlerts(prev => prev.map(a => a._id === id ? { ...a, isRead: true } : a));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (e) {
      toast.error('Failed to mark as read');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await alertsAPI.markAllRead();
      setAlerts(prev => prev.map(a => ({ ...a, isRead: true })));
      setUnreadCount(0);
      toast.success('All alerts marked as read');
    } catch (e) {
      toast.error('Failed to mark all as read');
    }
  };

  const handleDelete = async (id) => {
    try {
      await alertsAPI.delete(id);
      const deleted = alerts.find(a => a._id === id);
      setAlerts(prev => prev.filter(a => a._id !== id));
      if (deleted && !deleted.isRead) setUnreadCount(prev => Math.max(0, prev - 1));
      toast.success('Alert deleted');
    } catch (e) {
      toast.error('Failed to delete alert');
    }
  };

  const filterBtnClass = (val) =>
    `text-sm px-4 py-2 rounded-lg transition-colors ${
      filter === val
        ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
        : 'text-slate-400 hover:text-slate-200 hover:bg-surface-700 border border-transparent'
    }`;

  return (
    <div className="p-6 font-body animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-display font-bold text-white">Alerts</h1>
          <p className="text-sm text-slate-500">
            {unreadCount > 0
              ? `${unreadCount} unread alert${unreadCount !== 1 ? 's' : ''}`
              : 'All caught up'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="text-sm text-primary-400 hover:text-primary-300 border border-primary-500/30 px-4 py-2 rounded-lg hover:bg-primary-500/10 transition-colors"
          >
            ✓ Mark all read
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Alerts', value: alerts.length },
          { label: 'Unread', value: unreadCount, color: 'text-yellow-400' },
          { label: 'Critical', value: alerts.filter(a => a.severity === 'critical').length, color: 'text-red-400' },
          { label: 'Market Alerts', value: alerts.filter(a => a.type === 'market_drop' || a.type === 'market_surge').length, color: 'text-blue-400' }
        ].map(stat => (
          <div key={stat.label} className="bg-surface-800 border border-surface-600 rounded-xl p-4">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">{stat.label}</p>
            <p className={`text-2xl font-display font-bold ${stat.color || 'text-slate-100'}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <button onClick={() => setFilter('all')} className={filterBtnClass('all')}>All</button>
        <button onClick={() => setFilter('unread')} className={filterBtnClass('unread')}>Unread</button>
        <button onClick={() => setFilter('critical')} className={filterBtnClass('critical')}>Critical</button>
        <div className="ml-auto">
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="bg-surface-800 border border-surface-600 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-primary-500"
          >
            <option value="">All Types</option>
            {Object.entries(TYPE_LABELS).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Alert list */}
      {loading ? (
        <div className="text-center py-16 text-slate-500">Loading alerts...</div>
      ) : alerts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 rounded-2xl bg-surface-700 border border-surface-600 flex items-center justify-center mb-4 text-2xl">
            ✓
          </div>
          <h3 className="font-display font-bold text-white mb-2">No alerts</h3>
          <p className="text-slate-500 text-sm">
            {filter !== 'all' ? 'No alerts match the current filter.' : 'All portfolios are stable. Market monitoring is active.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map(alert => (
            <AlertCard
              key={alert._id}
              alert={alert}
              onMarkRead={handleMarkRead}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AlertsPage;
