import React, { useState } from 'react';
import api from '../utils/api';
import { toast } from 'react-hot-toast';
import { CalculatorIcon } from '@heroicons/react/24/outline';

const Calculators = () => {
  const [activeTab, setActiveTab] = useState('pips');

  // Pip Calculator State
  const [pipData, setPipData] = useState({
    pair: 'EURUSD',
    entryPrice: '',
    exitPrice: '',
    direction: 'buy'
  });
  const [pipResult, setPipResult] = useState(null);

  // Risk Calculator State
  const [riskData, setRiskData] = useState({
    accountBalance: '',
    riskPercentage: '1',
    entryPrice: '',
    stopLoss: '',
    pair: 'EURUSD'
  });
  const [riskResult, setRiskResult] = useState(null);

  // P/L Calculator State
  const [plData, setPlData] = useState({
    pair: 'EURUSD',
    entryPrice: '',
    exitPrice: '',
    positionSize: '',
    direction: 'buy'
  });
  const [plResult, setPlResult] = useState(null);

  const calculatePips = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/calculators/pips', pipData);
      setPipResult(response.data.result);
      toast.success('Pips calculated successfully');
    } catch (error) {
      toast.error('Failed to calculate pips');
    }
  };

  const calculateRisk = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/calculators/risk', riskData);
      setRiskResult(response.data.result);
      toast.success('Risk calculated successfully');
    } catch (error) {
      toast.error('Failed to calculate risk');
    }
  };

  const calculatePL = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/calculators/profit-loss', plData);
      setPlResult(response.data.result);
      toast.success('Profit/Loss calculated successfully');
    } catch (error) {
      toast.error('Failed to calculate profit/loss');
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Trading Calculators</h1>
        <p className="text-gray-400">Professional tools for risk management and trade analysis</p>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex space-x-2">
        {['pips', 'risk', 'profitloss'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === tab
                ? 'bg-primary-600 text-white'
                : 'bg-dark-700 text-gray-300 hover:bg-dark-600'
            }`}
          >
            {tab === 'pips' && 'Pip Calculator'}
            {tab === 'risk' && 'Risk Calculator'}
            {tab === 'profitloss' && 'P/L Calculator'}
          </button>
        ))}
      </div>

      {/* Pip Calculator */}
      {activeTab === 'pips' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-6">
            <h2 className="text-xl font-bold text-white mb-6">Calculate Pips</h2>
            <form onSubmit={calculatePips} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Currency Pair</label>
                <input
                  type="text"
                  value={pipData.pair}
                  onChange={(e) => setPipData({ ...pipData, pair: e.target.value })}
                  placeholder="EURUSD"
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Direction</label>
                <select
                  value={pipData.direction}
                  onChange={(e) => setPipData({ ...pipData, direction: e.target.value })}
                  className="input"
                >
                  <option value="buy">Buy</option>
                  <option value="sell">Sell</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Entry Price</label>
                <input
                  type="number"
                  step="0.00001"
                  value={pipData.entryPrice}
                  onChange={(e) => setPipData({ ...pipData, entryPrice: e.target.value })}
                  placeholder="1.08500"
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Exit Price</label>
                <input
                  type="number"
                  step="0.00001"
                  value={pipData.exitPrice}
                  onChange={(e) => setPipData({ ...pipData, exitPrice: e.target.value })}
                  placeholder="1.08650"
                  className="input"
                  required
                />
              </div>

              <button type="submit" className="w-full btn btn-primary">
                Calculate Pips
              </button>
            </form>
          </div>

          {pipResult && (
            <div className="card p-6">
              <h2 className="text-xl font-bold text-white mb-6">Result</h2>
              <div className="space-y-4">
                <div className="p-4 bg-dark-700 rounded-lg">
                  <p className="text-sm text-gray-400 mb-1">Pip Difference</p>
                  <p className={`text-3xl font-bold ${pipResult.pips >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {pipResult.pips > 0 ? '+' : ''}{pipResult.pips} pips
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-dark-700 rounded-lg">
                    <p className="text-sm text-gray-400 mb-1">Entry</p>
                    <p className="text-lg font-semibold text-white">{pipResult.entry}</p>
                  </div>
                  <div className="p-4 bg-dark-700 rounded-lg">
                    <p className="text-sm text-gray-400 mb-1">Exit</p>
                    <p className="text-lg font-semibold text-white">{pipResult.exit}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Risk Calculator */}
      {activeTab === 'risk' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-6">
            <h2 className="text-xl font-bold text-white mb-6">Calculate Position Size</h2>
            <form onSubmit={calculateRisk} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Account Balance ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={riskData.accountBalance}
                  onChange={(e) => setRiskData({ ...riskData, accountBalance: e.target.value })}
                  placeholder="10000"
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Risk Percentage (%)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={riskData.riskPercentage}
                  onChange={(e) => setRiskData({ ...riskData, riskPercentage: e.target.value })}
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Currency Pair</label>
                <input
                  type="text"
                  value={riskData.pair}
                  onChange={(e) => setRiskData({ ...riskData, pair: e.target.value })}
                  placeholder="EURUSD"
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Entry Price</label>
                <input
                  type="number"
                  step="0.00001"
                  value={riskData.entryPrice}
                  onChange={(e) => setRiskData({ ...riskData, entryPrice: e.target.value })}
                  placeholder="1.08500"
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Stop Loss</label>
                <input
                  type="number"
                  step="0.00001"
                  value={riskData.stopLoss}
                  onChange={(e) => setRiskData({ ...riskData, stopLoss: e.target.value })}
                  placeholder="1.08300"
                  className="input"
                  required
                />
              </div>

              <button type="submit" className="w-full btn btn-primary">
                Calculate Risk
              </button>
            </form>
          </div>

          {riskResult && (
            <div className="card p-6">
              <h2 className="text-xl font-bold text-white mb-6">Result</h2>
              <div className="space-y-4">
                <div className="p-4 bg-dark-700 rounded-lg">
                  <p className="text-sm text-gray-400 mb-1">Risk Amount</p>
                  <p className="text-3xl font-bold text-yellow-400">${riskResult.riskAmount}</p>
                </div>
                <div className="p-4 bg-dark-700 rounded-lg">
                  <p className="text-sm text-gray-400 mb-1">Position Size (Lots)</p>
                  <p className="text-2xl font-bold text-primary-400">{riskResult.positionSize}</p>
                </div>
                <div className="p-4 bg-dark-700 rounded-lg">
                  <p className="text-sm text-gray-400 mb-1">Position Size (Micro Lots)</p>
                  <p className="text-xl font-semibold text-white">{riskResult.positionSizeMicro}</p>
                </div>
                <div className="p-4 bg-dark-700 rounded-lg">
                  <p className="text-sm text-gray-400 mb-1">Pip Difference</p>
                  <p className="text-lg font-semibold text-white">{riskResult.pipDifference} pips</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* P/L Calculator */}
      {activeTab === 'profitloss' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-6">
            <h2 className="text-xl font-bold text-white mb-6">Calculate Profit/Loss</h2>
            <form onSubmit={calculatePL} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Currency Pair</label>
                <input
                  type="text"
                  value={plData.pair}
                  onChange={(e) => setPlData({ ...plData, pair: e.target.value })}
                  placeholder="EURUSD"
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Direction</label>
                <select
                  value={plData.direction}
                  onChange={(e) => setPlData({ ...plData, direction: e.target.value })}
                  className="input"
                >
                  <option value="buy">Buy</option>
                  <option value="sell">Sell</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Entry Price</label>
                <input
                  type="number"
                  step="0.00001"
                  value={plData.entryPrice}
                  onChange={(e) => setPlData({ ...plData, entryPrice: e.target.value })}
                  placeholder="1.08500"
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Exit Price</label>
                <input
                  type="number"
                  step="0.00001"
                  value={plData.exitPrice}
                  onChange={(e) => setPlData({ ...plData, exitPrice: e.target.value })}
                  placeholder="1.08650"
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Position Size (Lots)</label>
                <input
                  type="number"
                  step="0.01"
                  value={plData.positionSize}
                  onChange={(e) => setPlData({ ...plData, positionSize: e.target.value })}
                  placeholder="0.10"
                  className="input"
                  required
                />
              </div>

              <button type="submit" className="w-full btn btn-primary">
                Calculate P/L
              </button>
            </form>
          </div>

          {plResult && (
            <div className="card p-6">
              <h2 className="text-xl font-bold text-white mb-6">Result</h2>
              <div className="space-y-4">
                <div className="p-4 bg-dark-700 rounded-lg">
                  <p className="text-sm text-gray-400 mb-1">Profit/Loss</p>
                  <p className={`text-4xl font-bold ${plResult.profitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {plResult.profitLoss >= 0 ? '+' : ''}${plResult.profitLoss}
                  </p>
                </div>
                <div className="p-4 bg-dark-700 rounded-lg">
                  <p className="text-sm text-gray-400 mb-1">Pips</p>
                  <p className={`text-2xl font-bold ${plResult.pips >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {plResult.pips > 0 ? '+' : ''}{plResult.pips}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-dark-700 rounded-lg">
                    <p className="text-sm text-gray-400 mb-1">Position Size</p>
                    <p className="text-lg font-semibold text-white">{plResult.positionSize} lots</p>
                  </div>
                  <div className="p-4 bg-dark-700 rounded-lg">
                    <p className="text-sm text-gray-400 mb-1">Direction</p>
                    <p className="text-lg font-semibold text-white">{plResult.direction.toUpperCase()}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Calculators;
