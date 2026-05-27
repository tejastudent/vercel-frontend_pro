import React from 'react';
import { Line, Doughnut } from 'react-chartjs-2';

const PortfolioGlobalPage = () => {
  // Mock Data
  const aumData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [{
      label: 'Firm AUM ($M)',
      data: [412, 420, 418, 435, 450, 448, 460, 475, 470, 482, 480, 485.2],
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59,130,246,0.1)',
      fill: true,
      tension: 0.4,
      pointRadius: 4,
      pointBackgroundColor: '#3b82f6',
    }]
  };

  const aumOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#64748b' } },
      y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#64748b', callback: v => `$${v}M` } }
    }
  };

  const allocationData = {
    labels: ['Equities', 'Fixed Income', 'Cash', 'Alternatives'],
    datasets: [{
      data: [55, 30, 10, 5],
      backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'],
      borderWidth: 0
    }]
  };

  const topHoldings = [
    { symbol: 'AAPL', name: 'Apple Inc.', weight: '5.2%', value: '$25.2M', trend: 'up' },
    { symbol: 'MSFT', name: 'Microsoft Corp.', weight: '4.8%', value: '$23.3M', trend: 'up' },
    { symbol: 'US T-Bill', name: 'US Treasury 3M', weight: '4.1%', value: '$19.9M', trend: 'flat' },
    { symbol: 'NVDA', name: 'NVIDIA Corp.', weight: '3.9%', value: '$18.9M', trend: 'up' },
    { symbol: 'TSLA', name: 'Tesla Inc.', weight: '2.5%', value: '$12.1M', trend: 'down' },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto font-body space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="font-display font-bold text-white text-3xl mb-1">Global Portfolio</h1>
        <p className="text-slate-400 text-sm">Firm-wide assets under management and holdings.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-surface-800 border border-surface-700 rounded-2xl p-5">
          <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-2">Total AUM</p>
          <p className="text-3xl font-display font-bold text-white mb-1">$485.2M</p>
          <p className="text-xs text-emerald-400 font-medium">↗ +12.4% YTD</p>
        </div>
        <div className="bg-surface-800 border border-surface-700 rounded-2xl p-5">
          <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-2">Active Portfolios</p>
          <p className="text-3xl font-display font-bold text-white mb-1">342</p>
          <p className="text-xs text-emerald-400 font-medium">↗ +8 this month</p>
        </div>
        <div className="bg-surface-800 border border-surface-700 rounded-2xl p-5">
          <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-2">Avg Firm Return (1Y)</p>
          <p className="text-3xl font-display font-bold text-white mb-1">14.2%</p>
          <p className="text-xs text-emerald-400 font-medium">vs 11.5% S&P 500</p>
        </div>
        <div className="bg-surface-800 border border-surface-700 rounded-2xl p-5">
          <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-2">Cash Drag Warning</p>
          <p className="text-3xl font-display font-bold text-amber-400 mb-1">24</p>
          <p className="text-xs text-slate-500">Accounts &gt; 15% cash</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AUM Growth */}
        <div className="lg:col-span-2 bg-surface-800 border border-surface-700 rounded-2xl p-6">
          <h2 className="font-display font-bold text-white mb-6">AUM Growth (12M)</h2>
          <div style={{ height: 300 }}>
            <Line data={aumData} options={aumOptions} />
          </div>
        </div>

        {/* Asset Allocation */}
        <div className="bg-surface-800 border border-surface-700 rounded-2xl p-6 flex flex-col">
          <h2 className="font-display font-bold text-white mb-6">Asset Allocation</h2>
          <div className="flex-1 flex items-center justify-center relative" style={{ minHeight: 250 }}>
            <Doughnut 
              data={allocationData} 
              options={{
                cutout: '75%',
                plugins: {
                  legend: { position: 'bottom', labels: { color: '#94a3b8', font: { size: 12 }, padding: 20 } }
                }
              }} 
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-[-40px]">
              <span className="text-3xl font-bold text-white">55%</span>
              <span className="text-[10px] text-slate-400 uppercase">Equities</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Holdings Table */}
      <div className="bg-surface-800 border border-surface-700 rounded-2xl p-6">
        <h2 className="font-display font-bold text-white mb-6">Top Firm Holdings</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-surface-700">
                <th className="pb-3 text-xs text-slate-400 font-medium uppercase tracking-wider">Symbol</th>
                <th className="pb-3 text-xs text-slate-400 font-medium uppercase tracking-wider">Name</th>
                <th className="pb-3 text-xs text-slate-400 font-medium uppercase tracking-wider text-right">Firm Weight</th>
                <th className="pb-3 text-xs text-slate-400 font-medium uppercase tracking-wider text-right">Total Value</th>
                <th className="pb-3 text-xs text-slate-400 font-medium uppercase tracking-wider text-center">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-700">
              {topHoldings.map(h => (
                <tr key={h.symbol} className="hover:bg-surface-700/30 transition-colors">
                  <td className="py-4 font-mono text-sm text-primary-400 font-bold">{h.symbol}</td>
                  <td className="py-4 text-sm text-slate-200">{h.name}</td>
                  <td className="py-4 text-sm text-white text-right font-medium">{h.weight}</td>
                  <td className="py-4 text-sm text-slate-300 text-right">{h.value}</td>
                  <td className="py-4 text-center">
                    {h.trend === 'up' && <span className="text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded text-xs">▲</span>}
                    {h.trend === 'down' && <span className="text-red-400 bg-red-400/10 px-2 py-1 rounded text-xs">▼</span>}
                    {h.trend === 'flat' && <span className="text-slate-400 bg-slate-400/10 px-2 py-1 rounded text-xs">—</span>}
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

export default PortfolioGlobalPage;
