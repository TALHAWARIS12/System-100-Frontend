import React, { useEffect, useState } from 'react';
import useAuthStore from '../store/authStore';
import api from '../utils/api';
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  SignalIcon,
  UserGroupIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const { user, hasActiveSubscription } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [scannerRes, tradesRes] = await Promise.all([
        api.get('/scanner/stats').catch(() => ({ data: { stats: {} } })),
        api.get('/trades/stats').catch(() => ({ data: { stats: {} } }))
      ]);

      setStats({
        scanner: scannerRes.data.stats,
        trades: tradesRes.data.stats
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const hasAccess = hasActiveSubscription();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="mt-2 text-gray-400">
          {user?.role === 'admin' && 'Admin Dashboard'}
          {user?.role === 'educator' && 'Educator Dashboard'}
          {user?.role === 'client' && 'Your Trading Dashboard'}
        </p>
      </div>

      {/* Subscription Warning */}
      {!hasAccess && user?.role === 'client' && (
        <div className="mb-8 card p-6 border-yellow-500 bg-yellow-900/20">
          <div className="flex items-start">
            <ExclamationTriangleIcon className="w-6 h-6 text-yellow-500 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold text-yellow-500 mb-2">
                Subscription Required
              </h3>
              <p className="text-gray-300 mb-4">
                You need an active subscription to access scanner results, trade signals, and calculators.
              </p>
              <a
                href="/subscription"
                className="inline-flex items-center btn btn-primary"
              >
                Subscribe Now
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      {hasAccess && !loading && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="stat-card slide-in group">
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-sm font-bold text-primary-400 uppercase tracking-wider mb-2">Active Signals</p>
                <p className="text-4xl font-black text-white glow-text">
                  {stats.scanner.totalSignals || 0}
                </p>
                <p className="text-xs text-green-400 mt-2 font-semibold">↗ LIVE SCANNING</p>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-primary-500/20 rounded-full blur-xl group-hover:bg-primary-500/30 transition-all"></div>
                <ChartBarIcon className="w-16 h-16 text-primary-400 relative z-10 group-hover:scale-110 transition-transform" />
              </div>
            </div>
          </div>

          <div className="stat-card slide-in group" style={{animationDelay: '0.1s'}}>
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-sm font-bold text-green-400 uppercase tracking-wider mb-2">Active Trades</p>
                <p className="text-4xl font-black text-white glow-text">
                  {stats.trades.activeTrades || 0}
                </p>
                <p className="text-xs text-green-400 mt-2 font-semibold">↗ IN POSITION</p>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-green-500/20 rounded-full blur-xl group-hover:bg-green-500/30 transition-all"></div>
                <SignalIcon className="w-16 h-16 text-green-400 relative z-10 group-hover:scale-110 transition-transform" />
              </div>
            </div>
          </div>

          <div className="stat-card slide-in group" style={{animationDelay: '0.2s'}}>
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-sm font-bold text-yellow-400 uppercase tracking-wider mb-2">Win Rate</p>
                <p className="text-4xl font-black text-white glow-text">
                  {stats.trades.winRate || 0}%
                </p>
                <p className="text-xs text-yellow-400 mt-2 font-semibold">↗ PERFORMANCE</p>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-yellow-500/20 rounded-full blur-xl group-hover:bg-yellow-500/30 transition-all"></div>
                <CurrencyDollarIcon className="w-16 h-16 text-yellow-400 relative z-10 group-hover:scale-110 transition-transform" />
              </div>
            </div>
          </div>

          <div className="stat-card slide-in group" style={{animationDelay: '0.3s'}}>
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-sm font-bold text-blue-400 uppercase tracking-wider mb-2">Total Trades</p>
                <p className="text-4xl font-black text-white glow-text">
                  {stats.trades.totalTrades || 0}
                </p>
                <p className="text-xs text-blue-400 mt-2 font-semibold">↗ ALL TIME</p>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl group-hover:bg-blue-500/30 transition-all"></div>
                <UserGroupIcon className="w-16 h-16 text-blue-400 relative z-10 group-hover:scale-110 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="card p-8">
        <h2 className="text-2xl font-black text-white mb-6 glow-text uppercase tracking-wider">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {hasAccess && (
            <>
              <a
                href="/scanner"
                className="group relative p-6 bg-gradient-to-br from-primary-900/30 to-primary-800/20 rounded-xl border border-primary-500/30 hover:border-primary-500/60 transition-all overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <ChartBarIcon className="w-10 h-10 text-primary-400 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold text-primary-400 uppercase tracking-wider">→</span>
                  </div>
                  <h3 className="font-black text-xl text-white mb-2 group-hover:text-primary-300 transition-colors">View Scanner</h3>
                  <p className="text-sm text-gray-400 font-medium">Check latest market signals</p>
                </div>
              </a>

              <a
                href="/trades"
                className="group relative p-6 bg-gradient-to-br from-green-900/30 to-green-800/20 rounded-xl border border-green-500/30 hover:border-green-500/60 transition-all overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <SignalIcon className="w-10 h-10 text-green-400 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold text-green-400 uppercase tracking-wider">→</span>
                  </div>
                  <h3 className="font-black text-xl text-white mb-2 group-hover:text-green-300 transition-colors">Trade Signals</h3>
                  <p className="text-sm text-gray-400 font-medium">View educator trade ideas</p>
                </div>
              </a>

              <a
                href="/calculators"
                className="group relative p-6 bg-gradient-to-br from-yellow-900/30 to-yellow-800/20 rounded-xl border border-yellow-500/30 hover:border-yellow-500/60 transition-all overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <CurrencyDollarIcon className="w-10 h-10 text-yellow-400 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold text-yellow-400 uppercase tracking-wider">→</span>
                  </div>
                  <h3 className="font-black text-xl text-white mb-2 group-hover:text-yellow-300 transition-colors">Calculators</h3>
                  <p className="text-sm text-gray-400 font-medium">Calculate pips and risk</p>
                </div>
              </a>
            </>
          )}

          {(user?.role === 'educator' || user?.role === 'admin') && (
            <a
              href="/educator/trades"
              className="group relative p-6 bg-gradient-to-br from-purple-900/30 to-purple-800/20 rounded-xl border border-purple-500/30 hover:border-purple-500/60 transition-all overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <SignalIcon className="w-10 h-10 text-purple-400 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">→</span>
                </div>
                <h3 className="font-black text-xl text-white mb-2 group-hover:text-purple-300 transition-colors">Manage Trades</h3>
                <p className="text-sm text-gray-400 font-medium">Create and edit trade signals</p>
              </div>
            </a>
          )}

          {user?.role === 'admin' && (
            <>
              <a
                href="/admin/users"
                className="p-4 bg-dark-700 rounded-lg hover:bg-dark-600 transition-colors"
              >
                <UserGroupIcon className="w-8 h-8 text-blue-500 mb-2" />
                <h3 className="font-semibold text-white mb-1">User Management</h3>
                <p className="text-sm text-gray-400">Manage users and roles</p>
              </a>

              <a
                href="/admin/scanner"
                className="p-4 bg-dark-700 rounded-lg hover:bg-dark-600 transition-colors"
              >
                <ChartBarIcon className="w-8 h-8 text-purple-500 mb-2" />
                <h3 className="font-semibold text-white mb-1">Scanner Config</h3>
                <p className="text-sm text-gray-400">Configure scanner strategies</p>
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
