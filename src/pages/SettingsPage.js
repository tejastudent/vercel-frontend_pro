import React from 'react';
import { useAuth } from '../context/AuthContext';

const SettingsPage = () => {
  const { advisor } = useAuth();

  return (
    <div className="p-8 max-w-4xl mx-auto font-body space-y-8 animate-fade-in">
      <div>
        <h1 className="font-display font-bold text-white text-3xl mb-1">Settings</h1>
        <p className="text-slate-400 text-sm">Manage your profile and platform preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Profile Card */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-surface-800 border border-surface-700 rounded-2xl p-6 text-center flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-primary-600 flex items-center justify-center text-white text-3xl font-bold mb-4">
              {advisor?.name ? advisor.name.substring(0,2).toUpperCase() : 'AD'}
            </div>
            <h2 className="text-xl font-bold text-white">{advisor?.name || 'Advisor User'}</h2>
            <p className="text-sm text-slate-400 mb-4">{advisor?.email}</p>
            <span className="px-3 py-1 bg-surface-700 border border-surface-600 rounded-full text-xs font-medium text-slate-300">
              Role: {advisor?.role || 'Advisor'}
            </span>
            <button 
              onClick={() => {
                localStorage.removeItem('advisor_token');
                window.location.href = '/login';
              }}
              className="mt-6 w-full bg-surface-900 border border-surface-700 hover:border-red-500/50 hover:bg-red-500/10 text-red-400 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Settings Forms */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Preferences */}
          <div className="bg-surface-800 border border-surface-700 rounded-2xl p-6">
            <h3 className="font-display font-bold text-white text-lg mb-4">Notifications</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-surface-900/50 rounded-xl border border-surface-700">
                <div>
                  <p className="text-sm font-medium text-slate-200">Email Alerts</p>
                  <p className="text-xs text-slate-500">Receive critical market alerts via email.</p>
                </div>
                <div className="w-11 h-6 bg-primary-500 rounded-full relative cursor-pointer">
                  <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5 shadow-sm transition-all"></div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-surface-900/50 rounded-xl border border-surface-700">
                <div>
                  <p className="text-sm font-medium text-slate-200">Daily Digest</p>
                  <p className="text-xs text-slate-500">Receive a morning summary of portfolio risks.</p>
                </div>
                <div className="w-11 h-6 bg-primary-500 rounded-full relative cursor-pointer">
                  <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5 shadow-sm transition-all"></div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-surface-900/50 rounded-xl border border-surface-700">
                <div>
                  <p className="text-sm font-medium text-slate-200">SMS Notifications</p>
                  <p className="text-xs text-slate-500">Only for high-severity compliance flags.</p>
                </div>
                <div className="w-11 h-6 bg-surface-600 rounded-full relative cursor-pointer">
                  <div className="w-5 h-5 bg-slate-300 rounded-full absolute top-0.5 left-0.5 shadow-sm transition-all"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="bg-surface-800 border border-surface-700 rounded-2xl p-6">
            <h3 className="font-display font-bold text-white text-lg mb-4">Security</h3>
            <form className="space-y-4" onSubmit={e => e.preventDefault()}>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Current Password</label>
                <input type="password" placeholder="••••••••" className="w-full bg-surface-900 border border-surface-600 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-primary-500" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">New Password</label>
                <input type="password" placeholder="••••••••" className="w-full bg-surface-900 border border-surface-600 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-primary-500" />
              </div>
              <button type="submit" className="bg-primary-600 hover:bg-primary-500 text-white px-5 py-2 rounded-xl text-sm font-medium transition-colors mt-2">
                Update Password
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
