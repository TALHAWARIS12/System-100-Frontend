import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { ChartBarIcon, SignalIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

const EducatorDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentTrades, setRecentTrades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tradesRes, statsRes] = await Promise.all([
        api.get('/trades/educator/mine?limit=5'),
        api.get('/trades/stats')
      ]);

      setRecentTrades(tradesRes.data.trades);
      setStats(statsRes.data.stats);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
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
        <h1 className="text-3xl font-bold text-white mb-2">Educator Dashboard</h1>
        <p className="text-gray-400">Manage your trade signals and performance</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Active Trades</p>
              <p className="text-2xl font-bold text-white mt-2">{stats?.activeTrades || 0}</p>
            </div>
            <SignalIcon className="w-12 h-12 text-green-500" />
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Total Trades</p>
              <p className="text-2xl font-bold text-white mt-2">{stats?.totalTrades || 0}</p>
            </div>
            <ChartBarIcon className="w-12 h-12 text-primary-500" />
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Win Rate</p>
              <p className="text-2xl font-bold text-white mt-2">{stats?.winRate || 0}%</p>
            </div>
            <CheckCircleIcon className="w-12 h-12 text-yellow-500" />
          </div>
        </div>
      </div>

      {/* Recent Trades */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Recent Trades</h2>
          <a href="/educator/trades" className="text-primary-500 hover:text-primary-400 font-medium">
            View All
          </a>
        </div>

        {recentTrades.length === 0 ? (
          <div className="text-center py-8">
            <SignalIcon className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No trades yet</p>
            <a href="/educator/trades" className="btn btn-primary mt-4">
              Create Your First Trade
            </a>
          </div>
        ) : (
          <div className="space-y-3">
            {recentTrades.map((trade) => (
              <div key={trade.id} className="p-4 bg-dark-700 rounded-lg flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    trade.direction === 'buy' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
                  }`}>
                    {trade.direction.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-white">{trade.asset}</p>
                    <p className="text-xs text-gray-400">
                      Entry: {parseFloat(trade.entry).toFixed(5)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`badge ${
                    trade.status === 'active' ? 'badge-green' :
                    trade.status === 'closed' ? 'badge-blue' : 'badge-red'
                  }`}>
                    {trade.status}
                  </span>
                  {trade.result && trade.result !== 'pending' && (
                    <span className={`ml-2 badge ${
                      trade.result === 'win' ? 'badge-green' :
                      trade.result === 'loss' ? 'badge-red' : 'badge-yellow'
                    }`}>
                      {trade.result}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <a href="/educator/trades" className="card p-6 hover:bg-dark-700/50 transition-colors">
          <SignalIcon className="w-12 h-12 text-primary-500 mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">Manage Trades</h3>
          <p className="text-gray-400">Create, edit, and close your trade signals</p>
        </a>

        <a href="/trades" className="card p-6 hover:bg-dark-700/50 transition-colors">
          <ChartBarIcon className="w-12 h-12 text-green-500 mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">View All Signals</h3>
          <p className="text-gray-400">See all published trade signals from educators</p>
        </a>
      </div>
    </div>
  );
};

export default EducatorDashboard;
