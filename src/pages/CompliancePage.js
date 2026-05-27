import React, { useState } from 'react';
import toast from 'react-hot-toast';

const CompliancePage = () => {
  // Mock Data in State
  const [audits, setAudits] = useState([
    { id: 'AL-9021', date: '2026-05-20 10:42 AM', advisor: 'Sarah Mitchell', trigger: 'Keyword: "guaranteed return"', severity: 'High', status: 'Pending Review' },
    { id: 'AL-9020', date: '2026-05-20 09:15 AM', advisor: 'David Chen', trigger: 'Crypto allocation recommendation', severity: 'Medium', status: 'Pending Review' },
    { id: 'AL-9019', date: '2026-05-19 04:30 PM', advisor: 'Sarah Mitchell', trigger: 'Tax avoidance strategy mentioned', severity: 'High', status: 'Escalated' },
    { id: 'AL-9018', date: '2026-05-19 11:20 AM', advisor: 'Marcus Johnson', trigger: 'Off-platform asset discussion', severity: 'Low', status: 'Dismissed' },
  ]);

  const handleReview = (id) => {
    setAudits(prev => prev.map(a => a.id === id ? { ...a, status: 'Reviewed' } : a));
    toast.success(`Audit log ${id} marked as Reviewed.`);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto font-body space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="font-display font-bold text-white text-3xl mb-1">Compliance Center</h1>
        <p className="text-slate-400 text-sm">View audit logs, compliance policies, and system monitoring.</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-surface-800 border border-surface-700 rounded-2xl p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xl">
            🛡️
          </div>
          <div>
            <p className="text-2xl font-bold text-white">4,291</p>
            <p className="text-xs text-slate-400 uppercase">AI Conversations Scanned (30d)</p>
          </div>
        </div>
        <div className="bg-surface-800 border border-surface-700 rounded-2xl p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xl">
            ⚠️
          </div>
          <div>
            <p className="text-2xl font-bold text-white">12</p>
            <p className="text-xs text-slate-400 uppercase">Flagged Interactions</p>
          </div>
        </div>
        <div className="bg-surface-800 border border-surface-700 rounded-2xl p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center text-xl">
            🚨
          </div>
          <div>
            <p className="text-2xl font-bold text-white">2</p>
            <p className="text-xs text-slate-400 uppercase">Pending Critical Reviews</p>
          </div>
        </div>
      </div>

      {/* Audit Logs */}
      <div className="bg-surface-800 border border-surface-700 rounded-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-display font-bold text-white text-lg">Recent AI Audit Logs</h2>
          <button className="text-xs text-primary-400 hover:text-primary-300 font-medium px-3 py-1.5 border border-primary-500/30 rounded-lg hover:bg-primary-500/10 transition-colors">
            Export Report
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-surface-700">
                <th className="pb-3 text-xs text-slate-400 font-medium uppercase tracking-wider">Log ID</th>
                <th className="pb-3 text-xs text-slate-400 font-medium uppercase tracking-wider">Date & Time</th>
                <th className="pb-3 text-xs text-slate-400 font-medium uppercase tracking-wider">Advisor</th>
                <th className="pb-3 text-xs text-slate-400 font-medium uppercase tracking-wider">Trigger Event</th>
                <th className="pb-3 text-xs text-slate-400 font-medium uppercase tracking-wider">Severity</th>
                <th className="pb-3 text-xs text-slate-400 font-medium uppercase tracking-wider text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-700">
              {audits.map(audit => (
                <tr key={audit.id} className="hover:bg-surface-700/30 transition-colors">
                  <td className="py-4 font-mono text-xs text-slate-300">{audit.id}</td>
                  <td className="py-4 text-xs text-slate-400">{audit.date}</td>
                  <td className="py-4 text-sm text-slate-200 font-medium">{audit.advisor}</td>
                  <td className="py-4 text-sm text-slate-300">{audit.trigger}</td>
                  <td className="py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                      audit.severity === 'High' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                      audit.severity === 'Medium' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                      'bg-blue-500/10 border-blue-500/20 text-blue-400'
                    }`}>
                      {audit.severity}
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    {audit.status === 'Pending Review' ? (
                      <button 
                        onClick={() => handleReview(audit.id)}
                        className="text-xs bg-primary-600 hover:bg-primary-500 text-white px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Review
                      </button>
                    ) : (
                      <span className="text-xs text-slate-500 font-medium">{audit.status}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CompliancePage;
