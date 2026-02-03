import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { toast } from 'react-hot-toast';
import { SignalIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';

const Trades = () => {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('active');

  useEffect(() => {
    fetchTrades();
  }, [filter]);

  const fetchTrades = async () => {
    try {
      const response = await api.get(`/trades?status=${filter}`);
      setTrades(response.data.trades);
    } catch (error) {
      toast.error('Failed to fetch trades');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: 'badge badge-green',
      closed: 'badge badge-blue',
      cancelled: 'badge badge-red'
    };
    return badges[status] || 'badge';
  };

  const getResultBadge = (result) => {
    const badges = {
      win: 'badge badge-green',
      loss: 'badge badge-red',
      breakeven: 'badge badge-yellow',
      pending: 'badge badge-blue'
    };
    return badges[result] || 'badge';
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Trade Signals</h1>
        <p className="text-gray-400">Professional trade ideas from our educators</p>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6 flex space-x-2">
        {['active', 'closed', 'all'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status === 'all' ? '' : status)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === (status === 'all' ? '' : status)
                ? 'bg-primary-600 text-white'
                : 'bg-dark-700 text-gray-300 hover:bg-dark-600'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Trades List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          <p className="mt-4 text-gray-400">Loading trades...</p>
        </div>
      ) : trades.length === 0 ? (
        <div className="card p-12 text-center">
          <SignalIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Trades Found</h3>
          <p className="text-gray-400">Check back later for new trade signals</p>
        </div>
      ) : (
        <div className="space-y-4">
          {trades.map((trade) => (
            <div key={trade.id} className="card p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <h3 className="text-2xl font-bold text-white mr-3">{trade.asset}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      trade.direction === 'buy' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
                    }`}>
                      {trade.direction.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-400">
                    <UserCircleIcon className="w-4 h-4 mr-1" />
                    {trade.educator?.firstName} {trade.educator?.lastName}
                    <span className="mx-2">•</span>
                    {format(new Date(trade.createdAt), 'MMM dd, yyyy HH:mm')}
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <span className={getStatusBadge(trade.status)}>
                    {trade.status}
                  </span>
                  {trade.result && (
                    <span className={getResultBadge(trade.result)}>
                      {trade.result}
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Entry Price</p>
                  <p className="text-lg font-semibold text-white">{parseFloat(trade.entry).toFixed(5)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Stop Loss</p>
                  <p className="text-lg font-semibold text-red-400">{parseFloat(trade.stopLoss).toFixed(5)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Take Profit</p>
                  <p className="text-lg font-semibold text-green-400">{parseFloat(trade.takeProfit).toFixed(5)}</p>
                </div>
                {trade.pips && (
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Pips</p>
                    <p className={`text-lg font-semibold ${
                      parseFloat(trade.pips) >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {trade.pips > 0 ? '+' : ''}{parseFloat(trade.pips).toFixed(1)}
                    </p>
                  </div>
                )}
              </div>

              {trade.notes && (
                <div className="pt-4 border-t border-dark-700">
                  <p className="text-sm text-gray-300">{trade.notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Trades;
