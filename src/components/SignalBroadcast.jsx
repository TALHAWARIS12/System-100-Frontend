import React, { useState } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import {
  BellAlertIcon,
  PaperAirplaneIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const SignalBroadcast = ({ onClose }) => {
  const [formData, setFormData] = useState({
    pair: 'EURUSD',
    signalType: 'buy',
    timeframe: 'H1',
    entryPrice: '',
    stopLoss: '',
    takeProfit: '',
    confidence: 'medium',
    notes: ''
  });
  const [loading, setLoading] = useState(false);

  const pairs = [
    'EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD', 'USDCHF', 'NZDUSD',
    'EURGBP', 'EURJPY', 'GBPJPY', 'AUDJPY', 'CADJPY', 'CHFJPY', 'NZDJPY',
    'EURAUD', 'EURCAD', 'EURCHF', 'GBPAUD', 'GBPCAD', 'GBPCHF'
  ];

  const timeframes = ['M1', 'M5', 'M15', 'M30', 'H1', 'H4', 'D1', 'W1'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.pair || !formData.signalType) {
      toast.error('Pair and signal type are required');
      return;
    }

    try {
      setLoading(true);
      
      const response = await api.post('/signals/broadcast', {
        ...formData,
        entryPrice: formData.entryPrice ? parseFloat(formData.entryPrice) : null,
        stopLoss: formData.stopLoss ? parseFloat(formData.stopLoss) : null,
        takeProfit: formData.takeProfit ? parseFloat(formData.takeProfit) : null
      });

      toast.success(response.data.message || 'Signal broadcast successfully!');
      
      // Reset form
      setFormData({
        pair: 'EURUSD',
        signalType: 'buy',
        timeframe: 'H1',
        entryPrice: '',
        stopLoss: '',
        takeProfit: '',
        confidence: 'medium',
        notes: ''
      });
      
      if (onClose) onClose();
    } catch (error) {
      console.error('Broadcast error:', error);
      toast.error(error.response?.data?.message || 'Failed to broadcast signal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary-500/20 rounded-lg">
            <BellAlertIcon className="w-6 h-6 text-primary-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Broadcast Signal</h2>
            <p className="text-sm text-gray-400">Send trading signal to all subscribers</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-dark-600 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Pair */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Currency Pair *
            </label>
            <select
              name="pair"
              value={formData.pair}
              onChange={handleChange}
              className="w-full bg-dark-600 text-white px-4 py-2 rounded-lg border border-dark-500 focus:outline-none focus:border-primary-500"
              required
            >
              {pairs.map(pair => (
                <option key={pair} value={pair}>{pair}</option>
              ))}
            </select>
          </div>

          {/* Signal Type */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Signal Type *
            </label>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, signalType: 'buy' }))}
                className={`flex-1 py-2 rounded-lg font-bold transition-colors ${
                  formData.signalType === 'buy'
                    ? 'bg-green-500 text-white'
                    : 'bg-dark-600 text-gray-400 hover:bg-dark-500'
                }`}
              >
                BUY
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, signalType: 'sell' }))}
                className={`flex-1 py-2 rounded-lg font-bold transition-colors ${
                  formData.signalType === 'sell'
                    ? 'bg-red-500 text-white'
                    : 'bg-dark-600 text-gray-400 hover:bg-dark-500'
                }`}
              >
                SELL
              </button>
            </div>
          </div>

          {/* Timeframe */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Timeframe
            </label>
            <select
              name="timeframe"
              value={formData.timeframe}
              onChange={handleChange}
              className="w-full bg-dark-600 text-white px-4 py-2 rounded-lg border border-dark-500 focus:outline-none focus:border-primary-500"
            >
              {timeframes.map(tf => (
                <option key={tf} value={tf}>{tf}</option>
              ))}
            </select>
          </div>

          {/* Confidence */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Confidence Level
            </label>
            <select
              name="confidence"
              value={formData.confidence}
              onChange={handleChange}
              className="w-full bg-dark-600 text-white px-4 py-2 rounded-lg border border-dark-500 focus:outline-none focus:border-primary-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          {/* Entry Price */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Entry Price
            </label>
            <input
              type="number"
              name="entryPrice"
              value={formData.entryPrice}
              onChange={handleChange}
              step="0.00001"
              placeholder="e.g., 1.08500"
              className="w-full bg-dark-600 text-white px-4 py-2 rounded-lg border border-dark-500 focus:outline-none focus:border-primary-500"
            />
          </div>

          {/* Stop Loss */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Stop Loss
            </label>
            <input
              type="number"
              name="stopLoss"
              value={formData.stopLoss}
              onChange={handleChange}
              step="0.00001"
              placeholder="e.g., 1.08200"
              className="w-full bg-dark-600 text-white px-4 py-2 rounded-lg border border-dark-500 focus:outline-none focus:border-primary-500"
            />
          </div>

          {/* Take Profit */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Take Profit
            </label>
            <input
              type="number"
              name="takeProfit"
              value={formData.takeProfit}
              onChange={handleChange}
              step="0.00001"
              placeholder="e.g., 1.09000"
              className="w-full bg-dark-600 text-white px-4 py-2 rounded-lg border border-dark-500 focus:outline-none focus:border-primary-500"
            />
          </div>

          {/* Notes */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Notes / Analysis
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              placeholder="Add any additional analysis or notes for this signal..."
              className="w-full bg-dark-600 text-white px-4 py-2 rounded-lg border border-dark-500 focus:outline-none focus:border-primary-500 resize-none"
            />
          </div>
        </div>

        {/* Preview */}
        <div className="p-4 bg-dark-700 rounded-lg border border-dark-600">
          <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Signal Preview</p>
          <div className="flex items-center space-x-4">
            <span className="text-lg font-bold text-white">{formData.pair}</span>
            <span className={`px-3 py-1 rounded font-bold text-sm ${
              formData.signalType === 'buy'
                ? 'bg-green-500/20 text-green-400'
                : 'bg-red-500/20 text-red-400'
            }`}>
              {formData.signalType.toUpperCase()}
            </span>
            <span className="text-gray-400">{formData.timeframe}</span>
            <span className={`px-2 py-1 rounded text-xs ${
              formData.confidence === 'high'
                ? 'bg-green-500/20 text-green-400'
                : formData.confidence === 'medium'
                ? 'bg-yellow-500/20 text-yellow-400'
                : 'bg-gray-500/20 text-gray-400'
            }`}>
              {formData.confidence} confidence
            </span>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full btn btn-primary flex items-center justify-center space-x-2"
        >
          <PaperAirplaneIcon className="w-5 h-5" />
          <span>{loading ? 'Broadcasting...' : 'Broadcast Signal'}</span>
        </button>
      </form>
    </div>
  );
};

export default SignalBroadcast;
