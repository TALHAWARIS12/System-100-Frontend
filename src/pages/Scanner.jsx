import React, { useEffect, useState } from 'react';
import useAuthStore from '../store/authStore';
import api from '../utils/api';
import { toast } from 'react-hot-toast';
import { MagnifyingGlassIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import TradingViewChart from '../components/TradingViewChart';

const Scanner = () => {
  const { fetchUser } = useAuthStore();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSignal, setSelectedSignal] = useState(null);
  const [filters, setFilters] = useState({
    pair: '',
    timeframe: ''
  });

  useEffect(() => {
    // Refresh user to ensure subscription is up to date
    fetchUser();
    fetchResults();
    
    // Auto-refresh every 60 seconds
    const interval = setInterval(() => {
      fetchResults();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const fetchResults = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.pair) params.append('pair', filters.pair);
      if (filters.timeframe) params.append('timeframe', filters.timeframe);

      const response = await api.get(`/scanner/results?${params.toString()}`);
      setResults(response.data.results);
      
      // Show notification only if manually refreshing
      if (loading) {
        toast.success(`${response.data.results.length} signals loaded`);
      }
    } catch (error) {
      if (loading) {
        toast.error('Failed to fetch scanner results');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSearch = () => {
    setLoading(true);
    fetchResults();
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-black text-white mb-2 glow-text uppercase tracking-wider">Market Scanner</h1>
          <p className="text-gray-400 flex items-center font-medium">
            Real-time trading signals based on technical analysis
            <span className="ml-3 flex items-center text-xs text-green-400 font-bold uppercase">
              <span className="relative flex h-2 w-2 mr-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              Live Scanning
            </span>
          </p>
        </div>
        <button
          onClick={() => {setLoading(true); fetchResults();}}
          className="btn btn-primary pulse-glow"
        >
          {loading ? 'Scanning...' : 'Refresh Now'}
        </button>
      </div>

      {/* Filters */}
      <div className="card p-6 mb-6">
        <h2 className="text-lg font-black text-primary-400 uppercase tracking-wider mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-300 uppercase tracking-wide mb-2">Pair</label>
            <input
              type="text"
              name="pair"
              value={filters.pair}
              onChange={handleFilterChange}
              placeholder="e.g., BTCUSD"
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-300 uppercase tracking-wide mb-2">Timeframe</label>
            <select
              name="timeframe"
              value={filters.timeframe}
              onChange={handleFilterChange}
              className="input"
            >
              <option value="">All Timeframes</option>
              <option value="15min">15 Minutes</option>
              <option value="1h">1 Hour</option>
              <option value="4h">4 Hours</option>
              <option value="1d">1 Day</option>
            </select>
          </div>

          <div className="flex items-end">
            <button onClick={handleSearch} className="btn btn-primary w-full">
              <MagnifyingGlassIcon className="w-5 h-5 mr-2 inline" />
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="card p-12 text-center">
          <div className="relative inline-block">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500"></div>
            <div className="absolute inset-0 animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-300" style={{animationDelay: '0.3s'}}></div>
          </div>
          <p className="mt-6 text-gray-300 font-bold uppercase tracking-wider">Scanning Markets...</p>
        </div>
      ) : results.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="relative inline-block mb-6">
            <MagnifyingGlassIcon className="w-20 h-20 text-primary-400 mx-auto" />
            <div className="absolute inset-0 bg-primary-500/20 blur-2xl"></div>
          </div>
          <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-wide">No Signals Found</h3>
          <p className="text-gray-400 font-medium">Try adjusting your filters or check back later</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Chart View - Takes 2 columns */}
          {selectedSignal && (
            <div className="xl:col-span-2 card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-black text-white flex items-center uppercase tracking-wider glow-text">
                  <ChartBarIcon className="w-5 h-5 mr-2 text-primary-400" />
                  {selectedSignal.pair} Chart
                </h3>
                <button
                  onClick={() => setSelectedSignal(null)}
                  className="text-sm text-gray-400 hover:text-white"
                >
                  Close Chart
                </button>
              </div>
              <TradingViewChart 
                symbol={selectedSignal.pair} 
                interval={selectedSignal.timeframe === '1d' ? 'D' : selectedSignal.timeframe === '4h' ? '240' : '60'} 
                height={600}
              />
            </div>
          )}

          {/* Signals List - Takes 1 or 3 columns depending on chart */}
          <div className={selectedSignal ? 'xl:col-span-1' : 'xl:col-span-3'}>
            <div className="grid grid-cols-1 gap-4">
              {results.map((result, index) => (
                <div 
                  key={result.id} 
                  className="group stat-card hover:border-primary-500/50 transition-all cursor-pointer slide-in" 
                  style={{animationDelay: `${index * 0.1}s`}}
                  onClick={() => setSelectedSignal(result)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-2xl font-black text-white mb-1 glow-text group-hover:text-primary-300 transition-colors">{result.pair}</h3>
                      <span className="text-sm text-primary-400 font-bold uppercase tracking-wider">{result.timeframe}</span>
                    </div>
                    <div className={`flex items-center px-4 py-2 rounded-lg font-black uppercase tracking-wider ${
                      result.signalType === 'buy' 
                        ? 'bg-gradient-to-r from-green-900/50 to-green-800/40 text-green-300 border border-green-500/30' 
                        : 'bg-gradient-to-r from-red-900/50 to-red-800/40 text-red-300 border border-red-500/30'
                    }`}>
                      {result.signalType === 'buy' ? (
                        <ArrowTrendingUpIcon className="w-5 h-5 mr-2" />
                      ) : (
                        <ArrowTrendingDownIcon className="w-5 h-5 mr-2" />
                      )}
                      {result.signalType.toUpperCase()}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="bg-dark-900/50 rounded-lg p-3 border border-primary-500/10">
                        <p className="text-xs text-primary-400 mb-1 font-bold uppercase tracking-wider">Entry</p>
                        <p className="text-lg font-black text-white">{parseFloat(result.entry).toFixed(2)}</p>
                      </div>
                      <div className="bg-dark-900/50 rounded-lg p-3 border border-red-500/10">
                        <p className="text-xs text-red-400 mb-1 font-bold uppercase tracking-wider">Stop Loss</p>
                        <p className="text-lg font-black text-red-400">{parseFloat(result.stopLoss).toFixed(2)}</p>
                      </div>
                      <div className="bg-dark-900/50 rounded-lg p-3 border border-green-500/10">
                        <p className="text-xs text-green-400 mb-1 font-bold uppercase tracking-wider">Take Profit</p>
                        <p className="text-lg font-black text-green-400">{parseFloat(result.takeProfit).toFixed(2)}</p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-primary-500/20">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400 font-semibold">Strategy: <span className="text-primary-400">{result.strategyName}</span></span>
                        {result.confidence && (
                          <span className="text-yellow-400 font-bold">Confidence: {result.confidence}%</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-2 font-semibold">
                        {format(new Date(result.createdAt), 'MMM dd, yyyy HH:mm')}
                      </p>
                    </div>

                    <button className="w-full mt-2 text-sm font-bold py-3 bg-gradient-to-r from-primary-600/20 to-primary-500/20 hover:from-primary-600/30 hover:to-primary-500/30 text-primary-400 rounded-lg transition-all flex items-center justify-center border border-primary-500/20 hover:border-primary-500/40 uppercase tracking-wide group">
                      <ChartBarIcon className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                      View Chart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Scanner;
