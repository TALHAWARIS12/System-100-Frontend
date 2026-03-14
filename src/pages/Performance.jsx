import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { toast } from 'react-hot-toast';
import {
  ChartBarIcon,
  TrophyIcon,
  FireIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  LightBulbIcon,
  ShieldCheckIcon,
  BanknotesIcon,
  PresentationChartLineIcon
} from '@heroicons/react/24/outline';
import TradingViewChart from '../components/TradingViewChart';

const Performance = () => {
  const [analytics, setAnalytics] = useState(null);
  const [psychologyData, setPsychologyData] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('30d');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchAnalytics();
  }, [timeframe]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // Fetch all endpoints independently - don't let one failure break everything
      const [dashboardRes, psychologyRes, monthlyRes] = await Promise.allSettled([
        api.get(`/analytics/dashboard?timeframe=${timeframe}`),
        api.get(`/analytics/psychology?timeframe=90d`),
        api.get('/analytics/monthly?months=6')
      ]);
      
      if (dashboardRes.status === 'fulfilled') {
        setAnalytics(dashboardRes.value.data.data);
      }
      if (psychologyRes.status === 'fulfilled') {
        setPsychologyData(psychologyRes.value.data.data);
      }
      if (monthlyRes.status === 'fulfilled') {
        setMonthlyData(monthlyRes.value.data.data || []);
      }

    } catch (error) {
      console.error('Analytics fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderEmotionAnalysis = () => {
    if (!psychologyData?.emotionAnalysis?.breakdown) return null;
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {Object.entries(psychologyData.emotionAnalysis.breakdown).map(([emotion, data]) => (
          <div key={emotion} className="bg-dark-700/50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="capitalize text-white font-medium">{emotion}</span>
              <span className="text-sm text-gray-400">{data.count} trades</span>
            </div>
            <div className="flex items-center justify-between">
              <span className={`text-sm font-bold ${
                parseFloat(data.winRate) >= 50 ? 'text-green-400' : 'text-red-400'
              }`}>
                {data.winRate}% Win Rate
              </span>
              <span className="text-xs text-gray-500">{data.percentage}% of trades</span>
            </div>
          </div>
        ))}
      </div>
    );
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

  const journal = analytics?.journal;
  if (!journal) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 text-lg">No trading data available. Start trading to see analytics!</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-black text-white mb-2 glow-text uppercase tracking-wider">Performance Dashboard</h1>
        <p className="text-gray-400 font-medium">Advanced trading analytics and performance insights</p>
        
        {/* Timeframe Selector */}
        <div className="mt-4 flex space-x-2">
          {['7d', '30d', '90d', '1y'].map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                timeframe === tf 
                  ? 'bg-primary-500 text-white shadow-lg' 
                  : 'bg-dark-700 text-gray-400 hover:bg-dark-600 hover:text-white'
              }`}
            >
              {tf === '7d' ? '7 Days' : tf === '30d' ? '30 Days' : tf === '90d' ? '90 Days' : '1 Year'}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-8">
        <div className="flex space-x-1 rounded-lg bg-dark-700/50 p-1">
          {[
            { id: 'overview', label: 'Overview', icon: ChartBarIcon },
            { id: 'psychology', label: 'Psychology', icon: LightBulbIcon },
            { id: 'risk', label: 'Risk Analysis', icon: ShieldCheckIcon },
            { id: 'assets', label: 'Assets', icon: BanknotesIcon }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${
                activeTab === tab.id
                  ? 'bg-primary-500 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-dark-600'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
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
              <p className="text-4xl font-black text-white glow-text">{journal.overview?.winRate || 0}%</p>
              <p className="text-xs text-yellow-400 mt-2 font-bold uppercase tracking-wide">
                {journal.overview?.wins || 0}W / {journal.overview?.losses || 0}L
              </p>
            </div>

            <div className="stat-card slide-in group" style={{animationDelay: '0.1s'}}>
              <div className="flex items-center justify-between mb-4 relative z-10">
                <h3 className="text-sm font-black text-green-400 uppercase tracking-wider">Total P&L</h3>
                <div className="relative">
                  <div className={`absolute inset-0 rounded-full blur-xl group-hover:opacity-100 transition-all ${parseFloat(journal.profitability?.totalPnL || 0) >= 0 ? 'bg-green-500/20 group-hover:bg-green-500/30' : 'bg-red-500/20 group-hover:bg-red-500/30'}`}></div>
                  {parseFloat(journal.profitability?.totalPnL || 0) >= 0 ? (
                    <ArrowTrendingUpIcon className="w-8 h-8 text-green-400 relative z-10 group-hover:scale-110 transition-transform" />
                  ) : (
                    <ArrowTrendingDownIcon className="w-8 h-8 text-red-400 relative z-10 group-hover:scale-110 transition-transform" />
                  )}
                </div>
              </div>
              <p className={`text-4xl font-black glow-text ${parseFloat(journal.profitability?.totalPnL || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                ${journal.profitability?.totalPnL || 0}
              </p>
              <p className="text-xs text-gray-400 mt-2 font-bold uppercase tracking-wide">
                {journal.profitability?.totalPips || 0} pips
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
              <p className="text-4xl font-black text-white glow-text">{journal.profitability?.profitFactor || 0}</p>
              <p className="text-xs text-orange-400 mt-2 font-bold uppercase tracking-wide">
                Expectancy: ${journal.profitability?.expectancy || 0}
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
              <p className="text-4xl font-black text-white glow-text">{journal.riskMetrics?.sharpeRatio || 0}</p>
              <p className="text-xs text-blue-400 mt-2 font-bold uppercase tracking-wide">
                Risk-adjusted return
              </p>
            </div>
          </div>

          {/* Additional Risk Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="card p-6">
              <h3 className="text-lg font-bold text-white mb-4">Risk Management</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Max Drawdown</span>
                  <span className="text-red-400 font-bold">${journal.riskMetrics?.maxDrawdown || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Avg Risk:Reward</span>
                  <span className="text-white font-bold">{journal.riskMetrics?.avgRiskReward || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Recovery Factor</span>
                  <span className="text-blue-400 font-bold">{journal.riskMetrics?.recoveryFactor || 0}</span>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <h3 className="text-lg font-bold text-white mb-4">Streak Analysis</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Max Consecutive Wins</span>
                  <span className="text-green-400 font-bold">{journal.riskMetrics?.consecutiveWins || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Max Consecutive Losses</span>
                  <span className="text-red-400 font-bold">{journal.riskMetrics?.consecutiveLosses || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Avg Trades/Day</span>
                  <span className="text-white font-bold">{journal.overview?.avgTradesPerDay || 0}</span>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <h3 className="text-lg font-bold text-white mb-4">Best Performance</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-gray-400 text-sm">Biggest Win</span>
                  <div className="text-green-400 font-bold">
                    {journal.profitability?.biggestWin?.asset} +${journal.profitability?.biggestWin?.pnl || 0}
                  </div>
                </div>
                <div>
                  <span className="text-gray-400 text-sm">Biggest Loss</span>
                  <div className="text-red-400 font-bold">
                    {journal.profitability?.biggestLoss?.asset} ${journal.profitability?.biggestLoss?.pnl || 0}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Psychology Tab */}
      {activeTab === 'psychology' && psychologyData && (
        <div className="space-y-8">
          <div className="card p-6">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center">
              <LightBulbIcon className="w-6 h-6 mr-2 text-purple-400" />
              Trading Psychology Analysis
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Emotional State Analysis</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Coverage: {psychologyData.emotionAnalysis?.coverageRate || 0}% of trades tagged
                </p>
                {renderEmotionAnalysis()}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Trading Discipline</h3>
                <div className="space-y-4">
                  <div className="bg-dark-700/50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white">Discipline Rate</span>
                      <span className={`font-bold ${
                        parseFloat(psychologyData.discipline?.disciplineRate || 0) >= 80 ? 'text-green-400' : 
                        parseFloat(psychologyData.discipline?.disciplineRate || 0) >= 60 ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {psychologyData.discipline?.disciplineRate || 0}%
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm">
                      Based on {psychologyData.discipline?.analyzedTrades || 0} analyzed trades
                    </p>
                  </div>
                  <div className="bg-dark-700/50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white">Avg Hold Time</span>
                      <span className="text-blue-400 font-bold">
                        {psychologyData.averageHoldTime || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Risk Tab */}
      {activeTab === 'risk' && (
        <div className="space-y-8">
          <div className="card p-6">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center">
              <ShieldCheckIcon className="w-6 h-6 mr-2 text-blue-400" />
              Advanced Risk Analysis
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-dark-700/50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-4">Drawdown Analysis</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Max Drawdown</span>
                    <span className="text-red-400 font-bold">${journal.riskMetrics?.maxDrawdown || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Max DD %</span>
                    <span className="text-red-400 font-bold">{journal.riskMetrics?.maxDrawdownPercent || 0}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Recovery Factor</span>
                    <span className="text-blue-400 font-bold">{journal.riskMetrics?.recoveryFactor || 0}</span>
                  </div>
                </div>
              </div>

              <div className="bg-dark-700/50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-4">Risk Consistency</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Avg Risk:Reward</span>
                    <span className="text-white font-bold">{journal.riskMetrics?.avgRiskReward || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Sharpe Ratio</span>
                    <span className="text-blue-400 font-bold">{journal.riskMetrics?.sharpeRatio || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Risk Consistency</span>
                    <span className="text-green-400 font-bold">
                      {psychologyData?.riskConsistency || 'Good'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-dark-700/50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-4">Performance Ratios</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Win Rate</span>
                    <span className="text-yellow-400 font-bold">{journal.overview?.winRate || 0}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Profit Factor</span>
                    <span className="text-orange-400 font-bold">{journal.profitability?.profitFactor || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Expectancy</span>
                    <span className="text-green-400 font-bold">${journal.profitability?.expectancy || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assets Tab */}
      {activeTab === 'assets' && (
        <div className="space-y-8">
          <div className="card p-6">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center">
              <BanknotesIcon className="w-6 h-6 mr-2 text-green-400" />
              Asset Performance Breakdown
            </h2>
            {journal.assetPerformance && journal.assetPerformance.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-dark-700">
                      <th className="text-left py-3 text-sm font-medium text-gray-400">Asset</th>
                      <th className="text-left py-3 text-sm font-medium text-gray-400">Total Trades</th>
                      <th className="text-left py-3 text-sm font-medium text-gray-400">Win Rate</th>
                      <th className="text-left py-3 text-sm font-medium text-gray-400">Total P&L</th>
                      <th className="text-left py-3 text-sm font-medium text-gray-400">Avg P&L</th>
                      <th className="text-left py-3 text-sm font-medium text-gray-400">Avg Pips</th>
                    </tr>
                  </thead>
                  <tbody>
                    {journal.assetPerformance.map(([asset, data]) => (
                      <tr key={asset} className="border-b border-dark-700/50">
                        <td className="py-3 text-white font-medium">{asset}</td>
                        <td className="py-3 text-gray-300">{data.totalTrades}</td>
                        <td className={`py-3 font-semibold ${
                          parseFloat(data.winRate) >= 50 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {data.winRate}%
                        </td>
                        <td className={`py-3 font-semibold ${
                          parseFloat(data.totalPnL) >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          ${data.totalPnL}
                        </td>
                        <td className={`py-3 font-semibold ${
                          parseFloat(data.avgPnL) >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          ${data.avgPnL}
                        </td>
                        <td className="py-3 text-gray-300">{data.avgPips}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400">No asset performance data available yet</p>
              </div>
            )}
      
            {/* Strategy Performance */}
            {journal.strategyPerformance && journal.strategyPerformance.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-white mb-4">Strategy Performance</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {journal.strategyPerformance.map((strategy, index) => (
                    <div key={index} className="bg-dark-700/50 p-4 rounded-lg">
                      <h4 className="text-white font-medium mb-2">{strategy.name}</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Trades</span>
                          <span className="text-white">{strategy.trades}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Win Rate</span>
                          <span className={strategy.winRate >= 50 ? 'text-green-400' : 'text-red-400'}>
                            {strategy.winRate}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">P&L</span>
                          <span className={strategy.pnl >= 0 ? 'text-green-400' : 'text-red-400'}>
                            ${strategy.pnl}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="card p-6">
        <h2 className="text-xl font-bold text-white mb-6">Market Analysis</h2>
        <TradingViewChart symbol="BTCUSD" interval="D" height={500} />
      </div>
    </div>
  );
};

export default Performance;
