import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';
import { PlusIcon, PencilIcon, TrashIcon, XMarkIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';

const TradeManagement = () => {
  const [trades, setTrades] = useState([]);
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTrade, setEditingTrade] = useState(null);
  const [formData, setFormData] = useState({
    asset: '',
    direction: 'buy',
    entry: '',
    stopLoss: '',
    takeProfit: '',
    notes: '',
    isVisible: true
  });

  useEffect(() => {
    fetchTrades();
    fetchSignals();
  }, []);

  const fetchTrades = async () => {
    try {
      const response = await api.get('/trades/educator/mine');
      setTrades(response.data.trades);
    } catch (error) {
      toast.error('Failed to fetch trades');
    } finally {
      setLoading(false);
    }
  };

  const fetchSignals = async () => {
    try {
      const response = await api.get('/scanner/results?limit=10');
      setSignals(response.data.results || []);
    } catch (error) {
      console.log('No signals available');
    }
  };

  const handleOpenModal = (trade = null) => {
    if (trade) {
      setEditingTrade(trade);
      setFormData({
        asset: trade.asset,
        direction: trade.direction,
        entry: trade.entry,
        stopLoss: trade.stopLoss,
        takeProfit: trade.takeProfit,
        notes: trade.notes || '',
        isVisible: trade.isVisible
      });
    } else {
      setEditingTrade(null);
      setFormData({
        asset: '',
        direction: 'buy',
        entry: '',
        stopLoss: '',
        takeProfit: '',
        notes: '',
        isVisible: true
      });
    }
    setShowModal(true);
  };

  const populateFromSignal = (signal) => {
    setFormData({
      asset: signal.pair,
      direction: signal.signalType,
      entry: signal.entry,
      stopLoss: signal.stopLoss,
      takeProfit: signal.takeProfit,
      notes: `Signal: ${signal.strategyName} - Confidence: ${signal.confidence}%`,
      isVisible: true
    });
    toast.success('Form populated from signal!');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingTrade) {
        await api.put(`/trades/${editingTrade.id}`, formData);
        toast.success('Trade updated successfully');
      } else {
        await api.post('/trades', formData);
        toast.success('Trade created successfully');
      }
      
      setShowModal(false);
      fetchTrades();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (tradeId) => {
    if (!confirm('Are you sure you want to delete this trade?')) return;

    try {
      await api.delete(`/trades/${tradeId}`);
      toast.success('Trade deleted successfully');
      fetchTrades();
    } catch (error) {
      toast.error('Failed to delete trade');
    }
  };

  const handleCloseTrade = async (tradeId) => {
    const closePrice = prompt('Enter close price:');
    if (!closePrice) return;

    const result = prompt('Enter result (win/loss/breakeven):');
    if (!result || !['win', 'loss', 'breakeven'].includes(result)) {
      toast.error('Invalid result. Must be win, loss, or breakeven');
      return;
    }

    try {
      await api.post(`/trades/${tradeId}/close`, {
        closePrice: parseFloat(closePrice),
        result,
        pips: 0 // Calculate separately if needed
      });
      toast.success('Trade closed successfully');
      fetchTrades();
    } catch (error) {
      toast.error('Failed to close trade');
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
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Trade Management</h1>
          <p className="text-gray-400">Create and manage your trade signals</p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn btn-primary">
          <PlusIcon className="w-5 h-5 mr-2 inline" />
          New Trade
        </button>
      </div>

      {/* Trades List */}
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
                  {!trade.isVisible && (
                    <span className="ml-2 badge badge-yellow">Hidden</span>
                  )}
                </div>
                <p className="text-sm text-gray-400">
                  {format(new Date(trade.createdAt), 'MMM dd, yyyy HH:mm')}
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className={`badge ${
                  trade.status === 'active' ? 'badge-green' :
                  trade.status === 'closed' ? 'badge-blue' : 'badge-red'
                }`}>
                  {trade.status}
                </span>
                {trade.result && trade.result !== 'pending' && (
                  <span className={`badge ${
                    trade.result === 'win' ? 'badge-green' :
                    trade.result === 'loss' ? 'badge-red' : 'badge-yellow'
                  }`}>
                    {trade.result}
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-400 mb-1">Entry</p>
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
              <div className="mb-4 p-3 bg-dark-700 rounded-lg">
                <p className="text-sm text-gray-300">{trade.notes}</p>
              </div>
            )}

            <div className="flex items-center space-x-2 pt-4 border-t border-dark-700">
              {trade.status === 'active' && (
                <button
                  onClick={() => handleCloseTrade(trade.id)}
                  className="btn btn-secondary text-sm"
                >
                  Close Trade
                </button>
              )}
              <button
                onClick={() => handleOpenModal(trade)}
                className="btn btn-secondary text-sm"
              >
                <PencilIcon className="w-4 h-4 mr-1 inline" />
                Edit
              </button>
              <button
                onClick={() => handleDelete(trade.id)}
                className="btn btn-danger text-sm"
              >
                <TrashIcon className="w-4 h-4 mr-1 inline" />
                Delete
              </button>
            </div>
          </div>
        ))}

        {trades.length === 0 && (
          <div className="card p-12 text-center">
            <h3 className="text-xl font-semibold text-white mb-2">No Trades Yet</h3>
            <p className="text-gray-400 mb-4">Create your first trade signal</p>
            <button onClick={() => handleOpenModal()} className="btn btn-primary">
              Create Trade
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="card p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                {editingTrade ? 'Edit Trade' : 'Create New Trade'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Available Signals - DYNAMIC */}
            {!editingTrade && signals.length > 0 && (
              <div className="mb-6 p-4 bg-dark-700 rounded-lg border border-primary-500/30">
                <div className="flex items-center mb-3">
                  <SparklesIcon className="w-5 h-5 text-primary-400 mr-2" />
                  <h3 className="text-sm font-semibold text-primary-400">Quick Select from Signals</h3>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {signals.slice(0, 4).map((signal) => (
                    <button
                      key={signal.id}
                      type="button"
                      onClick={() => populateFromSignal(signal)}
                      className="p-3 bg-dark-600 hover:bg-dark-500 border border-dark-500 hover:border-primary-500 rounded text-left transition-all text-sm"
                    >
                      <div className="font-semibold text-white">{signal.pair}</div>
                      <div className="text-xs text-gray-400">
                        {signal.signalType.toUpperCase()} @ {parseFloat(signal.entry).toFixed(2)}
                      </div>
                      <div className="text-xs text-primary-400">
                        {signal.strategyName}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Asset</label>
                <input
                  type="text"
                  value={formData.asset}
                  onChange={(e) => setFormData({ ...formData, asset: e.target.value })}
                  className="input"
                  placeholder="EURUSD"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Direction</label>
                <select
                  value={formData.direction}
                  onChange={(e) => setFormData({ ...formData, direction: e.target.value })}
                  className="input"
                >
                  <option value="buy">Buy</option>
                  <option value="sell">Sell</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Entry Price</label>
                  <input
                    type="number"
                    step="0.00001"
                    value={formData.entry}
                    onChange={(e) => setFormData({ ...formData, entry: e.target.value })}
                    className="input"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Stop Loss</label>
                  <input
                    type="number"
                    step="0.00001"
                    value={formData.stopLoss}
                    onChange={(e) => setFormData({ ...formData, stopLoss: e.target.value })}
                    className="input"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Take Profit</label>
                  <input
                    type="number"
                    step="0.00001"
                    value={formData.takeProfit}
                    onChange={(e) => setFormData({ ...formData, takeProfit: e.target.value })}
                    className="input"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Notes (Optional)</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="input"
                  rows="3"
                  placeholder="Add trade analysis or reasoning..."
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isVisible"
                  checked={formData.isVisible}
                  onChange={(e) => setFormData({ ...formData, isVisible: e.target.checked })}
                  className="w-4 h-4 text-primary-600 bg-dark-700 border-dark-600 rounded focus:ring-primary-500"
                />
                <label htmlFor="isVisible" className="ml-2 text-sm text-gray-300">
                  Visible to users
                </label>
              </div>

              <div className="flex space-x-4 pt-4">
                <button type="submit" className="btn btn-primary flex-1">
                  {editingTrade ? 'Update Trade' : 'Create Trade'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TradeManagement;
