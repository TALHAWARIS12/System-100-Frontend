import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { toast } from 'react-hot-toast';
import {
  ChartBarIcon,
  TrophyIcon,
  FireIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';
import TradingViewChart from '../components/TradingViewChart';

const Performance = () => {
  const [stats, setStats] = useState(null);
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('30');

  useEffect(() => {
    fetchPerformance();
  }, [timeframe]);

  const fetchPerformance = async () => {
    try {
      // Fetch closed trades for performance calculation
      const tradesResponse = await api.get('/trades?status=closed');
      const closedTrades = tradesResponse.data.trades || [];
      setTrades(closedTrades);

      // Calculate performance metrics
      const wins = closedTrades.filter(t => t.result === 'win').length;
      const losses = closedTrades.filter(t => t.result === 'loss').length;
      const total = wins + losses;

      const winRate = total > 0 ? ((wins / total) * 100).toFixed(1) : 0;
      
      // Calculate profit/loss
      const totalProfit = closedTrades.reduce((sum, trade) => {
        if (trade.result === 'win') {
          return sum + Math.abs(parseFloat(trade.takeProfit) - parseFloat(trade.entry));
        } else if (trade.result === 'loss') {
          return sum - Math.abs(parseFloat(trade.entry) - parseFloat(trade.stopLoss));
        }
        return sum;
      }, 0);

      // Calculate average win/loss
      const avgWin = wins > 0 ? closedTrades
        .filter(t => t.result === 'win')
        .reduce((sum, t) => sum + Math.abs(parseFloat(t.takeProfit) - parseFloat(t.entry)), 0) / wins : 0;

      const avgLoss = losses > 0 ? closedTrades
        .filter(t => t.result === 'loss')
        .reduce((sum, t) => sum + Math.abs(parseFloat(t.entry) - parseFloat(t.stopLoss)), 0) / losses : 0;

      const profitFactor = avgLoss > 0 ? (avgWin / avgLoss).toFixed(2) : 0;

      // Calculate Sharpe ratio (simplified)
      const returns = closedTrades.map(t => {
        if (t.result === 'win') return Math.abs(parseFloat(t.takeProfit) - parseFloat(t.entry));
        if (t.result === 'loss') return -Math.abs(parseFloat(t.entry) - parseFloat(t.stopLoss));
        return 0;
      });

      const avgReturn = returns.length > 0 ? returns.reduce((a, b) => a + b, 0) / returns.length : 0;
      const stdDev = returns.length > 0 ? Math.sqrt(
        returns.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) / returns.length
      ) : 0;
      
      const sharpeRatio = stdDev > 0 ? (avgReturn / stdDev).toFixed(2) : 0;

      setStats({
        totalTrades: total,
        wins,
        losses,
        winRate,
        totalProfit: totalProfit.toFixed(2),
        profitFactor,
        sharpeRatio,
        avgWin: avgWin.toFixed(2),
        avgLoss: avgLoss.toFixed(2)
      });

    } catch (error) {
      toast.error('Failed to fetch performance data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="card p-12 text-center">
        <div className="relative inline-block">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500"></div>
          <div className="absolute inset-0 animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-300" style={{animationDelay: '0.3s'}}></div>
        </div>
        <p className="mt-6 text-gray-300 font-bold uppercase tracking-wider">Analyzing Performance...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-black text-white mb-2 glow-text uppercase tracking-wider">Performance Dashboard</h1>
        <p className="text-gray-400 font-medium">Track your trading performance and analytics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="stat-card slide-in group">
          <div className="flex items-center justify-between mb-4 relative z-10">
            <h3 className="text-sm font-black text-yellow-400 uppercase tracking-wider">Win Rate</h3>
            <div className="relative">
              <div className="absolute inset-0 bg-yellow-500/20 rounded-full blur-xl group-hover:bg-yellow-500/30 transition-all"></div>
              <TrophyIcon className="w-8 h-8 text-yellow-400 relative z-10 group-hover:scale-110 transition-transform" />
            </div>
          </div>
          <p className="text-4xl font-black text-white glow-text">{stats?.winRate || 0}%</p>
          <p className="text-xs text-yellow-400 mt-2 font-bold uppercase tracking-wide">
            {stats?.wins || 0}W / {stats?.losses || 0}L
          </p>
        </div>

        <div className="stat-card slide-in group" style={{animationDelay: '0.1s'}}>
          <div className="flex items-center justify-between mb-4 relative z-10">
            <h3 className="text-sm font-black text-green-400 uppercase tracking-wider">Total Profit</h3>
            <div className="relative">
              <div className={`absolute inset-0 rounded-full blur-xl group-hover:opacity-100 transition-all ${parseFloat(stats?.totalProfit || 0) >= 0 ? 'bg-green-500/20 group-hover:bg-green-500/30' : 'bg-red-500/20 group-hover:bg-red-500/30'}`}></div>
              {parseFloat(stats?.totalProfit || 0) >= 0 ? (
                <ArrowTrendingUpIcon className="w-8 h-8 text-green-400 relative z-10 group-hover:scale-110 transition-transform" />
              ) : (
                <ArrowTrendingDownIcon className="w-8 h-8 text-red-400 relative z-10 group-hover:scale-110 transition-transform" />
              )}
            </div>
          </div>
          <p className={`text-4xl font-black glow-text ${parseFloat(stats?.totalProfit || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            ${stats?.totalProfit || 0}
          </p>
          <p className="text-xs text-gray-400 mt-2 font-bold uppercase tracking-wide">
            {stats?.totalTrades || 0} trades
          </p>
        </div>

        <div className="stat-card slide-in group" style={{animationDelay: '0.2s'}}>
          <div className="flex items-center justify-between mb-4 relative z-10">
            <h3 className="text-sm font-black text-orange-400 uppercase tracking-wider">Profit Factor</h3>
            <div className="relative">
              <div className="absolute inset-0 bg-orange-500/20 rounded-full blur-xl group-hover:bg-orange-500/30 transition-all"></div>
              <FireIcon className="w-8 h-8 text-orange-400 relative z-10 group-hover:scale-110 transition-transform" />
            </div>
          </div>
          <p className="text-4xl font-black text-white glow-text">{stats?.profitFactor || 0}</p>
          <p className="text-xs text-orange-400 mt-2 font-bold uppercase tracking-wide">
            Avg Win: ${stats?.avgWin || 0}
          </p>
        </div>

        <div className="stat-card slide-in group" style={{animationDelay: '0.3s'}}>
          <div className="flex items-center justify-between mb-4 relative z-10">
            <h3 className="text-sm font-black text-blue-400 uppercase tracking-wider">Sharpe Ratio</h3>
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl group-hover:bg-blue-500/30 transition-all"></div>
              <ChartBarIcon className="w-8 h-8 text-blue-400 relative z-10 group-hover:scale-110 transition-transform" />
            </div>
          </div>
          <p className="text-4xl font-black text-white glow-text">{stats?.sharpeRatio || 0}</p>
          <p className="text-xs text-blue-400 mt-2 font-bold uppercase tracking-wide">
            Risk-adjusted return
          </p>
        </div>
      </div>

      {/* Recent Trades */}
      <div className="card p-6 mb-8">
        <h2 className="text-xl font-bold text-white mb-6">Recent Closed Trades</h2>
        {trades.length === 0 ? (
          <p className="text-center text-gray-400 py-8">No closed trades yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-700">
                  <th className="text-left py-3 text-sm font-medium text-gray-400">Asset</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-400">Direction</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-400">Entry</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-400">Exit</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-400">P/L</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-400">Result</th>
                </tr>
              </thead>
              <tbody>
                {trades.slice(0, 10).map((trade) => {
                  const pl = trade.result === 'win' 
                    ? Math.abs(parseFloat(trade.closePrice || trade.takeProfit) - parseFloat(trade.entry))
                    : -Math.abs(parseFloat(trade.entry) - parseFloat(trade.closePrice || trade.stopLoss));

                  return (
                    <tr key={trade.id} className="border-b border-dark-700/50">
                      <td className="py-3 text-white font-medium">{trade.asset}</td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded text-xs ${
                          trade.direction === 'buy' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
                        }`}>
                          {trade.direction.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 text-gray-300">{parseFloat(trade.entry).toFixed(2)}</td>
                      <td className="py-3 text-gray-300">{parseFloat(trade.closePrice || 0).toFixed(2)}</td>
                      <td className={`py-3 font-semibold ${pl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {pl >= 0 ? '+' : ''}{pl.toFixed(2)}
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded text-xs ${
                          trade.result === 'win' ? 'bg-green-900 text-green-300' : 
                          trade.result === 'loss' ? 'bg-red-900 text-red-300' : 
                          'bg-yellow-900 text-yellow-300'
                        }`}>
                          {trade.result.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="card p-6">
        <h2 className="text-xl font-bold text-white mb-6">Bitcoin Performance</h2>
        <TradingViewChart symbol="BTCUSD" interval="D" height={500} />
      </div>
    </div>
  );
};

export default Performance;
