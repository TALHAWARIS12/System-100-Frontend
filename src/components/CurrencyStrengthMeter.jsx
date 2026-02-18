import React, { useState, useEffect } from 'react';

const CurrencyStrengthMeter = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="card p-6 animate-pulse">
        <div className="h-6 bg-dark-600 rounded w-48 mb-4"></div>
        <div className="space-y-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-10 bg-dark-600 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!data || !data.currencies) {
    return (
      <div className="card p-6">
        <p className="text-gray-400">Unable to load currency strength data</p>
      </div>
    );
  }

  const getStrengthColor = (strength) => {
    if (strength >= 70) return 'bg-green-500';
    if (strength >= 50) return 'bg-green-400';
    if (strength >= 35) return 'bg-yellow-500';
    if (strength >= 20) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getTrendIcon = (trend) => {
    if (trend === 'bullish') return '↗';
    if (trend === 'bearish') return '↘';
    return '→';
  };

  const getTrendColor = (trend) => {
    if (trend === 'bullish') return 'text-green-400';
    if (trend === 'bearish') return 'text-red-400';
    return 'text-gray-400';
  };

  const getCurrencyFlag = (currency) => {
    const flags = {
      USD: '🇺🇸', EUR: '🇪🇺', GBP: '🇬🇧', JPY: '🇯🇵',
      AUD: '🇦🇺', CAD: '🇨🇦', CHF: '🇨🇭', NZD: '🇳🇿'
    };
    return flags[currency] || '🏳️';
  };

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Currency Strength Meter</h2>
        <span className="text-xs text-gray-500">
          Updated: {new Date(data.timestamp).toLocaleTimeString()}
        </span>
      </div>

      {/* Strength Bars */}
      <div className="space-y-3 mb-6">
        {data.currencies.map((currency, index) => (
          <div key={currency.currency} className="relative">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center space-x-2">
                <span className="text-lg">{getCurrencyFlag(currency.currency)}</span>
                <span className="font-bold text-white">{currency.currency}</span>
                <span className={`text-sm ${getTrendColor(currency.trend)}`}>
                  {getTrendIcon(currency.trend)}
                </span>
              </div>
              <span className="font-mono text-white">{currency.strength.toFixed(1)}</span>
            </div>
            <div className="h-3 bg-dark-600 rounded-full overflow-hidden">
              <div
                className={`h-full ${getStrengthColor(currency.strength)} transition-all duration-500`}
                style={{ 
                  width: `${currency.strength}%`,
                  animationDelay: `${index * 100}ms`
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Analysis Summary */}
      {data.analysis && (
        <div className="border-t border-dark-600 pt-4">
          <h3 className="text-sm font-semibold text-gray-400 uppercase mb-3">Analysis</h3>
          <p className="text-gray-300 text-sm mb-4">{data.analysis.summary}</p>
          
          {data.analysis.opportunities && data.analysis.opportunities.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-gray-500 uppercase">Opportunities</h4>
              {data.analysis.opportunities.map((opp, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg ${
                    opp.confidence === 'high' 
                      ? 'bg-green-900/30 border border-green-600/30' 
                      : 'bg-yellow-900/30 border border-yellow-600/30'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-white">{opp.pair}</span>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                        opp.direction === 'buy' 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {opp.direction.toUpperCase()}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        opp.confidence === 'high' 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {opp.confidence}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400">{opp.reason}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CurrencyStrengthMeter;
