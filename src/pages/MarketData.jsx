import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import CurrencyStrengthMeter from '../components/CurrencyStrengthMeter';
import EconomicCalendar from '../components/EconomicCalendar';
import TradingViewForex, { TradingViewTicker, TradingViewCalendar } from '../components/TradingViewForex';
import {
  ChartBarIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  ArrowPathIcon,
  BellAlertIcon
} from '@heroicons/react/24/outline';

const MarketData = () => {
  const [currencyStrength, setCurrencyStrength] = useState(null);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPair, setSelectedPair] = useState('EURUSD');
  const [refreshing, setRefreshing] = useState(false);

  const majorPairs = [
    { symbol: 'EURUSD', name: 'EUR/USD' },
    { symbol: 'GBPUSD', name: 'GBP/USD' },
    { symbol: 'USDJPY', name: 'USD/JPY' },
    { symbol: 'AUDUSD', name: 'AUD/USD' },
    { symbol: 'USDCAD', name: 'USD/CAD' },
    { symbol: 'USDCHF', name: 'USD/CHF' },
    { symbol: 'NZDUSD', name: 'NZD/USD' },
    { symbol: 'EURGBP', name: 'EUR/GBP' }
  ];

  useEffect(() => {
    fetchData();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [strengthRes, calendarRes] = await Promise.all([
        api.get('/market-data/currency-strength').catch(() => ({ data: { data: null } })),
        api.get('/market-data/calendar').catch(() => ({ data: { events: [] } }))
      ]);

      setCurrencyStrength(strengthRes.data.data);
      setCalendarEvents(calendarRes.data.events || []);
    } catch (error) {
      console.error('Error fetching market data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: ChartBarIcon },
    { id: 'strength', name: 'Currency Strength', icon: CurrencyDollarIcon },
    { id: 'calendar', name: 'Economic Calendar', icon: CalendarIcon },
    { id: 'charts', name: 'Charts', icon: ChartBarIcon }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Market Analysis</h1>
          <p className="mt-1 text-gray-400">
            Forex Factory data, TradingView charts & Currency Strength Meter
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="btn btn-secondary flex items-center space-x-2"
        >
          <ArrowPathIcon className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Price Ticker */}
      <TradingViewTicker />

      {/* Tabs */}
      <div className="border-b border-dark-600">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-500'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Currency Strength */}
          <CurrencyStrengthMeter data={currencyStrength} loading={loading} />

          {/* High Impact Events */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center">
                <BellAlertIcon className="w-5 h-5 mr-2 text-red-500" />
                High Impact Events Today
              </h2>
            </div>
            
            {loading ? (
              <div className="animate-pulse space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 bg-dark-600 rounded"></div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {calendarEvents
                  .filter(e => e.impact === 'high')
                  .slice(0, 5)
                  .map((event, index) => (
                    <div
                      key={event.id || index}
                      className="p-3 bg-red-900/20 border border-red-500/30 rounded-lg"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-white">{event.currency}</span>
                          <span className="text-gray-300">{event.title}</span>
                        </div>
                        <span className="text-sm text-gray-400">{event.time}</span>
                      </div>
                    </div>
                  ))}
                {calendarEvents.filter(e => e.impact === 'high').length === 0 && (
                  <p className="text-gray-400 text-center py-4">
                    No high impact events scheduled
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Quick Chart */}
          <div className="lg:col-span-2">
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Quick Chart</h2>
                <select
                  value={selectedPair}
                  onChange={(e) => setSelectedPair(e.target.value)}
                  className="bg-dark-600 text-white px-3 py-2 rounded-lg border border-dark-500 focus:outline-none focus:border-primary-500"
                >
                  {majorPairs.map(pair => (
                    <option key={pair.symbol} value={pair.symbol}>
                      {pair.name}
                    </option>
                  ))}
                </select>
              </div>
              <TradingViewForex symbol={selectedPair} height={400} />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'strength' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <CurrencyStrengthMeter data={currencyStrength} loading={loading} />
          </div>
          
          <div className="card p-6">
            <h3 className="text-lg font-bold text-white mb-4">Trading Tips</h3>
            <div className="space-y-4 text-sm text-gray-400">
              <div className="p-3 bg-dark-700 rounded-lg">
                <p className="font-semibold text-green-400 mb-1">Strong vs Weak</p>
                <p>Trade the strongest currency against the weakest for highest probability setups.</p>
              </div>
              <div className="p-3 bg-dark-700 rounded-lg">
                <p className="font-semibold text-yellow-400 mb-1">Divergence</p>
                <p>Look for strength divergence between correlated pairs.</p>
              </div>
              <div className="p-3 bg-dark-700 rounded-lg">
                <p className="font-semibold text-blue-400 mb-1">Confirmation</p>
                <p>Use strength meter with technical analysis for best results.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'calendar' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <EconomicCalendar events={calendarEvents} loading={loading} />
          
          <div className="card p-6">
            <h2 className="text-xl font-bold text-white mb-4">TradingView Calendar</h2>
            <TradingViewCalendar height={500} />
          </div>
        </div>
      )}

      {activeTab === 'charts' && (
        <div className="space-y-6">
          <div className="card p-6">
            <div className="flex flex-wrap gap-2 mb-4">
              {majorPairs.map(pair => (
                <button
                  key={pair.symbol}
                  onClick={() => setSelectedPair(pair.symbol)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedPair === pair.symbol
                      ? 'bg-primary-500 text-white'
                      : 'bg-dark-600 text-gray-300 hover:bg-dark-500'
                  }`}
                >
                  {pair.name}
                </button>
              ))}
            </div>
            <TradingViewForex symbol={selectedPair} height={600} />
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketData;
