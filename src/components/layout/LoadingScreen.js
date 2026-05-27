import React from 'react';

const LoadingScreen = () => (
  <div className="h-screen bg-surface-900 flex flex-col items-center justify-center gap-4">
    <div className="w-12 h-12 rounded-xl bg-primary-500 flex items-center justify-center">
      <span className="text-white font-display font-bold text-xl">A</span>
    </div>
    <div className="flex gap-1">
      {[0, 1, 2].map(i => (
        <div
          key={i}
          className="w-2 h-2 bg-primary-500 rounded-full animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
    <p className="text-slate-500 text-sm font-body">Loading Advisor AI...</p>
  </div>
);

export default LoadingScreen;
