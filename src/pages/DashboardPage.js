import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { marketAPI, clientsAPI, alertsAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const StatCard = ({ label, value, sub, trend, color = 'primary', icon }) => (
  <div className="bg-surface-800 border border-surface-700 rounded-2xl p-5 relative overflow-hidden group hover:border-surface-600 transition-colors">
    <div className="flex justify-between items-start mb-4">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg ${
        color === 'primary' ? 'bg-primary-500/20 text-primary-400' :
        color === 'green' ? 'bg-emerald-500/20 text-emerald-400' :
        color === 'purple' ? 'bg-purple-500/20 text-purple-400' :
        'bg-amber-500/20 text-amber-400'
      }`}>
        {icon}
      </div>
      <div className={`text-xs font-medium ${trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-red-400' : 'text-slate-500'}`}>
        {trend === 'up' ? '↗' : trend === 'down' ? '↘' : ''} {sub}
      </div>
    </div>
    <p className="text-2xl font-display font-bold text-white mb-1">{value}</p>
    <p className="text-[10px] text-slate-400 uppercase tracking-wider">{label}</p>
  </div>
);

const DashboardPage = () => {
  const { advisor } = useAuth();
  
  const [alerts, setAlerts] = useState([]);
  const [loadingAlerts, setLoadingAlerts] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const alertsRes = await alertsAPI.getAll({ limit: 5 });
        setAlerts(alertsRes.data.alerts || []);
      } catch (error) {
        toast.error('Failed to load real-time alerts');
      } finally {
        setLoadingAlerts(false);
      }
    };
    fetchDashboardData();
  }, []);

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="p-8 space-y-6 font-body animate-fade-in max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex items-start justify-between border-b border-surface-700/50 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
          <h1 className="text-3xl font-display font-bold text-white mb-1">
            {greeting}, {advisor?.name?.split(' ')[0] || 'Sarah'} 👋
          </h1>
          <p className="text-slate-400 text-sm">Here's your book snapshot for today.</p>
        </div>
        <div>
          <Link
            to="/chat"
            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-all shadow-lg shadow-primary-500/20"
          >
            <span className="text-lg">🤖</span> Ask Advisor AI
          </Link>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard label="Total AUM" value="$485.0M" sub="+0.59%" trend="up" color="primary" icon="$" />
        <StatCard label="Daily P&L" value="$-1935K" sub="+0.59%" trend="up" color="green" icon="📈" />
        <StatCard label="YTD Return" value="13.38%" sub="vs 11.8% benchmark" trend="up" color="purple" icon="⚡" />
        <StatCard label="Clients" value="10" sub="3 need attention" trend="down" color="amber" icon="👥" />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Alerts */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface-800 border border-surface-700 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-display font-bold text-white flex items-center gap-2">
                <span className="text-amber-400">⚠️</span> Today's Alerts
              </h2>
              <Link to="/alerts" className="text-slate-400 hover:text-slate-200 text-xs flex items-center gap-1 transition-colors">
                View all <span className="text-[10px]">›</span>
              </Link>
            </div>
            
            <div className="space-y-3">
              {loadingAlerts ? (
                <div className="text-center py-8 text-slate-500 text-sm">Loading alerts...</div>
              ) : alerts.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-sm">No new alerts today. You're all caught up!</div>
              ) : (
                alerts.map(alert => (
                  <div key={alert._id} className="bg-surface-900/50 border border-surface-700 rounded-xl p-4 flex gap-4 hover:border-surface-600 transition-colors">
                    <div className="mt-1 flex-shrink-0">
                      <div className={`w-2 h-2 rounded-full ${
                        alert.severity === 'critical' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' :
                        alert.severity === 'high' ? 'bg-orange-500' :
                        alert.severity === 'medium' ? 'bg-amber-500' :
                        'bg-emerald-500'
                      }`}></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-sm font-bold text-white">{alert.title}</h3>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          alert.severity === 'critical' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                          alert.severity === 'high' ? 'bg-orange-500/10 border-orange-500/20 text-orange-400' :
                          alert.severity === 'medium' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                          'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                        }`}>
                          {alert.severity}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed mb-2">{alert.message}</p>
                      
                      {/* Show affected clients clearly */}
                      {alert.affectedClients && alert.affectedClients.length > 0 && (
                        <div className="mb-2 p-2 bg-red-500/5 border border-red-500/10 rounded-lg inline-block">
                          <p className="text-[10px] font-medium text-red-400 flex items-center gap-1">
                            <span>👥</span> Clients in Danger: {alert.affectedClients.map(c => c.name).join(', ')}
                          </p>
                        </div>
                      )}

                      <p className="text-[10px] text-slate-500 flex items-center gap-1">
                        <span>🕒</span> {formatTime(alert.createdAt)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Actions */}
        <div className="space-y-6">
          
          {/* Quick Actions */}
          <div className="bg-surface-800 border border-surface-700 rounded-2xl p-6">
            <h2 className="font-display font-bold text-white flex items-center gap-2 mb-5">
              <span className="text-primary-400">⚡</span> Quick Actions
            </h2>
            <div className="space-y-2">
              {[
                { label: 'Prep for client meeting', sub: 'AI briefing ↗', link: '/chat' },
                { label: 'Check portfolio risk', sub: 'Risk analysis ↗', link: '/portfolio' },
                { label: 'Run compliance scan', sub: 'Pre-trade check ↗', link: '/compliance' },
                { label: 'Search research', sub: 'RAG search ↗', link: '/research' },
              ].map((action, i) => (
                <Link key={i} to={action.link} className="block w-full bg-surface-900/50 hover:bg-surface-700 border border-surface-700 hover:border-surface-600 rounded-xl p-4 flex justify-between items-center group transition-all text-left">
                  <span className="text-sm text-slate-200 font-medium group-hover:text-white transition-colors">{action.label}</span>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider group-hover:text-primary-400 transition-colors">{action.sub}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Next-Best Actions */}
          <div className="bg-surface-800 border border-surface-700 rounded-2xl p-6">
            <h2 className="font-display font-bold text-white flex items-center gap-2 mb-5">
              <span className="text-purple-400">◎</span> Next-Best Actions
            </h2>
            
            <div className="bg-surface-900/50 border border-surface-700 rounded-xl p-4">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-[10px] font-bold border border-purple-500/30 flex-shrink-0">
                  4
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Robert Harrington</h3>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">Portfolio Review</p>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Client is holding 40% cash equivalents during high inflation period. Recommend shifting 15% to fixed-income.
              </p>
              <button className="mt-4 w-full bg-surface-700 hover:bg-surface-600 text-white text-xs font-medium py-2 rounded-lg transition-colors border border-surface-600">
                Generate Proposal
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
