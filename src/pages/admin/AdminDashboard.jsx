import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { UsersIcon, ChartBarIcon, SignalIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    users: {},
    scanner: {},
    trades: {}
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [usersRes, scannerRes, tradesRes] = await Promise.all([
        api.get('/users/stats'),
        api.get('/scanner/stats'),
        api.get('/trades/stats')
      ]);

      setStats({
        users: usersRes.data.stats,
        scanner: scannerRes.data.stats,
        trades: tradesRes.data.stats
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const triggerScanner = async () => {
    try {
      await api.post('/scanner/run');
      alert('Scanner triggered successfully');
    } catch (error) {
      alert('Failed to trigger scanner');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
        <p className="text-gray-400">Platform overview and management</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Total Users</p>
              <p className="text-2xl font-bold text-white mt-2">{stats.users.totalUsers || 0}</p>
            </div>
            <UsersIcon className="w-12 h-12 text-primary-500" />
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Active Subscriptions</p>
              <p className="text-2xl font-bold text-white mt-2">{stats.users.activeSubscriptions || 0}</p>
            </div>
            <CurrencyDollarIcon className="w-12 h-12 text-green-500" />
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Active Signals</p>
              <p className="text-2xl font-bold text-white mt-2">{stats.scanner.totalSignals || 0}</p>
            </div>
            <ChartBarIcon className="w-12 h-12 text-yellow-500" />
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Total Trades</p>
              <p className="text-2xl font-bold text-white mt-2">{stats.trades.totalTrades || 0}</p>
            </div>
            <SignalIcon className="w-12 h-12 text-blue-500" />
          </div>
        </div>
      </div>

      {/* User Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="card p-6">
          <h2 className="text-xl font-bold text-white mb-4">User Breakdown</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-dark-700 rounded-lg">
              <span className="text-gray-300">Clients</span>
              <span className="font-bold text-white">{stats.users.clients || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-dark-700 rounded-lg">
              <span className="text-gray-300">Educators</span>
              <span className="font-bold text-white">{stats.users.educators || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-dark-700 rounded-lg">
              <span className="text-gray-300">Active Subscriptions</span>
              <span className="font-bold text-green-400">{stats.users.activeSubscriptions || 0}</span>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-xl font-bold text-white mb-4">Trade Statistics</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-dark-700 rounded-lg">
              <span className="text-gray-300">Active Trades</span>
              <span className="font-bold text-white">{stats.trades.activeTrades || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-dark-700 rounded-lg">
              <span className="text-gray-300">Closed Trades</span>
              <span className="font-bold text-white">{stats.trades.closedTrades || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-dark-700 rounded-lg">
              <span className="text-gray-300">Win Rate</span>
              <span className="font-bold text-green-400">{stats.trades.winRate || 0}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card p-6">
        <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={triggerScanner}
            className="p-4 bg-dark-700 rounded-lg hover:bg-dark-600 transition-colors text-left"
          >
            <ChartBarIcon className="w-8 h-8 text-primary-500 mb-2" />
            <h3 className="font-semibold text-white mb-1">Run Scanner</h3>
            <p className="text-sm text-gray-400">Manually trigger scanner run</p>
          </button>

          <a
            href="/admin/users"
            className="p-4 bg-dark-700 rounded-lg hover:bg-dark-600 transition-colors"
          >
            <UsersIcon className="w-8 h-8 text-green-500 mb-2" />
            <h3 className="font-semibold text-white mb-1">Manage Users</h3>
            <p className="text-sm text-gray-400">View and manage all users</p>
          </a>

          <a
            href="/admin/scanner"
            className="p-4 bg-dark-700 rounded-lg hover:bg-dark-600 transition-colors"
          >
            <ChartBarIcon className="w-8 h-8 text-yellow-500 mb-2" />
            <h3 className="font-semibold text-white mb-1">Scanner Config</h3>
            <p className="text-sm text-gray-400">Configure scanner strategies</p>
          </a>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
