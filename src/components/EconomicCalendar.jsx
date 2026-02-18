import React, { useState } from 'react';

const EconomicCalendar = ({ events, loading }) => {
  const [filter, setFilter] = useState('all'); // all, high, medium, low
  const [currencyFilter, setCurrencyFilter] = useState('all');

  const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'NZD'];

  if (loading) {
    return (
      <div className="card p-6 animate-pulse">
        <div className="h-6 bg-dark-600 rounded w-48 mb-4"></div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-dark-600 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  const filteredEvents = events?.filter(event => {
    if (filter !== 'all' && event.impact !== filter) return false;
    if (currencyFilter !== 'all' && event.currency !== currencyFilter) return false;
    return true;
  }) || [];

  const getImpactColor = (impact) => {
    switch (impact) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      default: return 'bg-green-500';
    }
  };

  const getImpactBadgeClass = (impact) => {
    switch (impact) {
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-green-500/20 text-green-400 border-green-500/30';
    }
  };

  const getCurrencyFlag = (currency) => {
    const flags = {
      USD: '🇺🇸', EUR: '🇪🇺', GBP: '🇬🇧', JPY: '🇯🇵',
      AUD: '🇦🇺', CAD: '🇨🇦', CHF: '🇨🇭', NZD: '🇳🇿', CNY: '🇨🇳'
    };
    return flags[currency] || '🏳️';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const isToday = (dateString) => {
    const today = new Date().toISOString().split('T')[0];
    return dateString === today;
  };

  const isFuture = (dateString, time) => {
    if (time === 'All Day') return true;
    const eventDate = new Date(`${dateString} ${time}`);
    return eventDate > new Date();
  };

  return (
    <div className="card p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 space-y-4 sm:space-y-0">
        <h2 className="text-xl font-bold text-white flex items-center">
          <span className="mr-2">📅</span>
          Economic Calendar
        </h2>
        
        <div className="flex flex-wrap gap-2">
          {/* Impact Filter */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-dark-600 text-white text-sm px-3 py-1.5 rounded-lg border border-dark-500 focus:outline-none focus:border-primary-500"
          >
            <option value="all">All Impact</option>
            <option value="high">🔴 High Impact</option>
            <option value="medium">🟡 Medium Impact</option>
            <option value="low">🟢 Low Impact</option>
          </select>

          {/* Currency Filter */}
          <select
            value={currencyFilter}
            onChange={(e) => setCurrencyFilter(e.target.value)}
            className="bg-dark-600 text-white text-sm px-3 py-1.5 rounded-lg border border-dark-500 focus:outline-none focus:border-primary-500"
          >
            <option value="all">All Currencies</option>
            {currencies.map(currency => (
              <option key={currency} value={currency}>
                {getCurrencyFlag(currency)} {currency}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Events List */}
      {filteredEvents.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-400">No events match your filters</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredEvents.map((event, index) => (
            <div
              key={event.id || index}
              className={`p-4 rounded-lg border transition-all hover:border-primary-500/50 ${
                isToday(event.date) 
                  ? 'bg-primary-900/20 border-primary-500/30' 
                  : 'bg-dark-700 border-dark-600'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                {/* Event Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-lg">{getCurrencyFlag(event.currency)}</span>
                    <span className="font-semibold text-white text-sm">{event.currency}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold border ${getImpactBadgeClass(event.impact)}`}>
                      {event.impact.toUpperCase()}
                    </span>
                    {isToday(event.date) && (
                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-primary-500/20 text-primary-400 border border-primary-500/30">
                        TODAY
                      </span>
                    )}
                  </div>
                  <h3 className="font-medium text-white truncate">{event.title}</h3>
                  <div className="flex items-center space-x-4 mt-1 text-sm text-gray-400">
                    <span>{formatDate(event.date)}</span>
                    <span>{event.time}</span>
                  </div>
                </div>

                {/* Data Points */}
                <div className="flex space-x-4 text-sm">
                  <div className="text-center min-w-[60px]">
                    <div className="text-gray-500 text-xs">Forecast</div>
                    <div className="text-yellow-400 font-mono">{event.forecast}</div>
                  </div>
                  <div className="text-center min-w-[60px]">
                    <div className="text-gray-500 text-xs">Previous</div>
                    <div className="text-gray-300 font-mono">{event.previous}</div>
                  </div>
                  <div className="text-center min-w-[60px]">
                    <div className="text-gray-500 text-xs">Actual</div>
                    <div className={`font-mono ${
                      event.actual !== '-' && event.actual !== event.forecast
                        ? parseFloat(event.actual) > parseFloat(event.forecast)
                          ? 'text-green-400'
                          : 'text-red-400'
                        : 'text-gray-400'
                    }`}>
                      {event.actual}
                    </div>
                  </div>
                </div>
              </div>

              {/* Impact Indicator Bar */}
              <div className="mt-3 flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${getImpactColor(event.impact)}`}></div>
                <div className="flex-1 h-1 bg-dark-600 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${getImpactColor(event.impact)} opacity-50`}
                    style={{ width: event.impact === 'high' ? '100%' : event.impact === 'medium' ? '60%' : '30%' }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-dark-600">
        <div className="flex items-center justify-center space-x-6 text-xs text-gray-500">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            <span>High Impact</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
            <span>Medium Impact</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span>Low Impact</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EconomicCalendar;
