import React, { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import useWebSocket from '../hooks/useWebSocket';
import toast from 'react-hot-toast';

const GoldScanner = () => {
  const [scannerState, setScannerState] = useState(null);
  const [signals, setSignals] = useState([]);
  const [prices, setPrices] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [activeTimeframe, setActiveTimeframe] = useState('15m');
  const [selectedPair, setSelectedPair] = useState('XAUUSD');
  const { on, off, subscribeToScanner, connected } = useWebSocket();
  
  const availablePairs = [
    { symbol: 'XAUUSD', name: 'Gold (XAU/USD)', emoji: '🥇' },
    { symbol: 'EURUSD', name: 'Euro (EUR/USD)', emoji: '💶' },
    { symbol: 'GBPUSD', name: 'Pound (GBP/USD)', emoji: '💷' },
    { symbol: 'GBPJPY', name: 'Pound Yen (GBP/JPY)', emoji: '¥' },
    { symbol: 'XAGUSD', name: 'Silver (XAG/USD)', emoji: '🌑' },
    { symbol: 'US30USD', name: 'US30 Index', emoji: '📊' }
  ];

  const fetchData = useCallback(async () => {
    try {
      const [stateRes, signalsRes, pricesRes] = await Promise.all([
        api.get('/gold-scanner/state'),
        api.get(`/gold-scanner/signals?active=true&limit=10&pair=${selectedPair}`),
        api.get(`/gold-scanner/prices?pair=${selectedPair}`)
      ]);
      setScannerState(stateRes.data.state);
      setSignals(signalsRes.data.signals);
      setPrices(pricesRes.data.data);
    } catch (error) {
      console.error('Gold scanner fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedPair]);

  useEffect(() => {
    fetchData();
    subscribeToScanner();

    on('scanner:newSignal', (signal) => {
      if (signal.pair === selectedPair) {
        setSignals(prev => [signal, ...prev].slice(0, 10));
        const pairInfo = availablePairs.find(p => p.symbol === signal.pair);
        toast.success(`🚨 New ${pairInfo?.name || signal.pair} ${signal.signalType.toUpperCase()} Signal @ ${signal.entry}`);
      }
    });

    on('market:update', (data) => {
      if (data.pair === selectedPair) {
        setPrices(prev => ({ ...prev, ...data }));
      }
    });

    const interval = setInterval(fetchData, 60000);

    return () => {
      off('scanner:newSignal');
      off('market:update');
      clearInterval(interval);
    };
  }, [selectedPair]);

  const triggerScan = async () => {
    setScanning(true);
    try {
      const res = await api.post('/gold-scanner/scan');
      if (res.data.result?.signal) {
        toast.success('Signal detected!');
        fetchData();
      } else {
        toast('Scan complete - no signal at this time', { icon: '🔍' });
      }
    } catch (error) {
      toast.error('Scan failed');
    } finally {
      setScanning(false);
    }
  };

  const currentPrice = prices?.candles?.[prices.candles.length - 1]?.close;
  const prevPrice = prices?.candles?.[prices.candles.length - 2]?.close;
  const priceChange = currentPrice && prevPrice ? ((currentPrice - prevPrice) / prevPrice * 100).toFixed(3) : 0;
  const isPositive = priceChange >= 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-yellow-400 font-bold uppercase tracking-wider">Initializing Freedom Strategy Nehemiah 6:3...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 slide-in bg-gradient-to-br from-amber-950/20 via-amber-900/10 to-yellow-900/20 rounded-lg p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-wider">
            Freedom Strategy Nehemiah 6:3
          </h1>
          <p className="text-gray-400 mt-1 font-mono">XAUUSD • Freedom Strategy • Real-Time Analysis</p>
        </div>
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${connected ? 'border-green-500/30 bg-green-500/10' : 'border-red-500/30 bg-red-500/10'}`}>
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
            <span className={`text-xs font-bold uppercase ${connected ? 'text-green-400' : 'text-red-400'}`}>
              {connected ? 'LIVE' : 'OFFLINE'}
            </span>
          </div>
          <button
            onClick={triggerScan}
            disabled={scanning}
            className="btn btn-gold px-6 py-3"
          >
            {scanning ? 'Scanning...' : '⚡ Scan Now'}
          </button>
        </div>
      </div>

      {/* Currency Pair Selector */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
        {availablePairs.map(pair => (
          <button
            key={pair.symbol}
            onClick={() => setSelectedPair(pair.symbol)}
            className={`p-3 rounded-lg font-bold text-sm uppercase tracking-wider transition-all ${
              selectedPair === pair.symbol
                ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50 shadow-lg shadow-yellow-500/20'
                : 'bg-dark-800/50 text-gray-400 border border-dark-700 hover:border-yellow-500/30 hover:text-yellow-300'
            }`}
          >
            <div className="text-lg mb-1">{pair.emoji}</div>
            <div className="text-[10px] leading-tight">{pair.symbol}</div>
          </button>
        ))}
      </div>

      {/* Price Header Card */}
      <div className="gold-card p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-yellow-400 text-2xl">{availablePairs.find(p => p.symbol === selectedPair)?.emoji}</span>
              <h2 className="text-2xl font-black text-white">{selectedPair}</h2>
              <span className="badge badge-yellow">{availablePairs.find(p => p.symbol === selectedPair)?.name}</span>
            </div>
            <div className="flex items-baseline gap-4">
              <span className="text-5xl font-black text-white font-mono">
                {currentPrice ? currentPrice.toFixed(2) : '----.--'}
              </span>
              <span className={`text-xl font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                {isPositive ? '+' : ''}{priceChange}%
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {prices?.indicators && (
              <>
                <div className="text-center p-3 bg-dark-900/50 rounded-lg border border-primary-500/10">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">MA20</p>
                  <p className="text-lg font-bold text-cyan-400 font-mono">{(prices.indicators.ma20?.current ?? prices.indicators.ma20?.[prices.indicators.ma20?.length - 1])?.toFixed(2) || '—'}</p>
                </div>
                <div className="text-center p-3 bg-dark-900/50 rounded-lg border border-primary-500/10">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">MA50</p>
                  <p className="text-lg font-bold text-orange-400 font-mono">{(prices.indicators.ma50?.current ?? prices.indicators.ma50?.[prices.indicators.ma50?.length - 1])?.toFixed(2) || '—'}</p>
                </div>
                <div className="text-center p-3 bg-dark-900/50 rounded-lg border border-primary-500/10">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">RSI</p>
                  <p className={`text-lg font-bold font-mono ${
                    ((prices.indicators.rsi?.current ?? prices.indicators.rsi?.[prices.indicators.rsi?.length - 1]) || 50) > 70 ? 'text-red-400' :
                    ((prices.indicators.rsi?.current ?? prices.indicators.rsi?.[prices.indicators.rsi?.length - 1]) || 50) < 30 ? 'text-green-400' : 'text-purple-400'
                  }`}>{(prices.indicators.rsi?.current ?? prices.indicators.rsi?.[prices.indicators.rsi?.length - 1])?.toFixed(1) || '—'}</p>
                </div>
                <div className="text-center p-3 bg-dark-900/50 rounded-lg border border-primary-500/10">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">ATR</p>
                  <p className="text-lg font-bold text-yellow-400 font-mono">{(prices.indicators.atr?.current ?? (typeof prices.indicators.atr === 'number' ? prices.indicators.atr : null))?.toFixed(2) || '—'}</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Timeframe Selector */}
      <div className="flex gap-2">
        {['15m', '1h'].map(tf => (
          <button
            key={tf}
            onClick={() => setActiveTimeframe(tf)}
            className={`px-4 py-2 rounded-lg font-bold text-sm uppercase tracking-wider transition-all ${
              activeTimeframe === tf
                ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50'
                : 'bg-dark-800/50 text-gray-500 border border-dark-700 hover:border-gray-600'
            }`}
          >
            {tf}
          </button>
        ))}
      </div>

      {/* Chart Area */}
      <div className="gold-card p-6">
        <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wider">
          Multi-Indicator Full-Spectrum Market Analysis
        </h3>
        <div className="relative" style={{ minHeight: '400px' }}>
          {/* Price Chart */}
          {prices?.candles && prices.candles.length > 0 ? (
            <div className="space-y-4">
              {/* Main price display */}
              <div className="h-64 bg-dark-900/50 rounded-lg border border-primary-500/10 p-4 relative overflow-hidden">
                <div className="absolute top-4 right-4 flex gap-4 text-xs">
                  <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-cyan-400 inline-block" /> MA20</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-orange-400 inline-block" /> MA50</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-purple-400 inline-block" /> RSI</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-gray-400 inline-block" /> BB</span>
                </div>
                {/* SVG Chart */}
                <svg viewBox="0 0 800 200" className="w-full h-full" preserveAspectRatio="none">
                  {(() => {
                    const candles = prices.candles.slice(-50);
                    if (candles.length === 0) return null;
                    const minP = Math.min(...candles.map(c => c.low));
                    const maxP = Math.max(...candles.map(c => c.high));
                    const range = maxP - minP || 1;
                    const scaleY = (v) => 190 - ((v - minP) / range) * 180;
                    const scaleX = (i) => (i / (candles.length - 1)) * 780 + 10;

                    const pricePath = candles.map((c, i) => `${i === 0 ? 'M' : 'L'}${scaleX(i)},${scaleY(c.close)}`).join(' ');
                    
                    // MA paths (handle both new { values, current } and legacy array format)
                    const ma20 = prices.indicators?.ma20?.values || (Array.isArray(prices.indicators?.ma20) ? prices.indicators.ma20 : []);
                    const ma50 = prices.indicators?.ma50?.values || (Array.isArray(prices.indicators?.ma50) ? prices.indicators.ma50 : []);
                    const ma20Slice = ma20.slice(-candles.length);
                    const ma50Slice = ma50.slice(-candles.length);
                    const ma20Path = ma20Slice.map((v, i) => `${i === 0 ? 'M' : 'L'}${scaleX(i + (candles.length - ma20Slice.length))},${scaleY(v)}`).join(' ');
                    const ma50Path = ma50Slice.map((v, i) => `${i === 0 ? 'M' : 'L'}${scaleX(i + (candles.length - ma50Slice.length))},${scaleY(v)}`).join(' ');

                    // BB paths - bollingerBands returns { upper: number[], middle: number[], lower: number[] }
                    const bb = prices.indicators?.bollingerBands;
                    const bbUpper = (Array.isArray(bb?.upper) ? bb.upper : []).slice(-candles.length);
                    const bbLower = (Array.isArray(bb?.lower) ? bb.lower : []).slice(-candles.length);

                    return (
                      <>
                        {/* Grid lines */}
                        {[0.25, 0.5, 0.75].map(pct => (
                          <line key={pct} x1="10" y1={scaleY(minP + range * pct)} x2="790" y2={scaleY(minP + range * pct)} stroke="#1e293b" strokeWidth="0.5" />
                        ))}
                        {/* BB bands */}
                        {bbUpper.length > 0 && (
                          <path d={bbUpper.map((v, i) => `${i === 0 ? 'M' : 'L'}${scaleX(i + (candles.length - bbUpper.length))},${scaleY(v)}`).join(' ')} fill="none" stroke="#64748b" strokeWidth="0.5" strokeDasharray="3,3" opacity="0.5" />
                        )}
                        {bbLower.length > 0 && (
                          <path d={bbLower.map((v, i) => `${i === 0 ? 'M' : 'L'}${scaleX(i + (candles.length - bbLower.length))},${scaleY(v)}`).join(' ')} fill="none" stroke="#64748b" strokeWidth="0.5" strokeDasharray="3,3" opacity="0.5" />
                        )}
                        {/* MA lines */}
                        {ma50Path && <path d={ma50Path} fill="none" stroke="#f97316" strokeWidth="1.5" opacity="0.8" />}
                        {ma20Path && <path d={ma20Path} fill="none" stroke="#06b6d4" strokeWidth="1.5" opacity="0.8" />}
                        {/* Price line */}
                        <path d={pricePath} fill="none" stroke="#22c55e" strokeWidth="2" />
                        {/* Gradient fill */}
                        <defs>
                          <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#22c55e" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                        <path d={`${pricePath} L${scaleX(candles.length - 1)},195 L${scaleX(0)},195 Z`} fill="url(#priceGrad)" />
                      </>
                    );
                  })()}
                </svg>
              </div>

              {/* Volume bars */}
              <div className="h-20 bg-dark-900/50 rounded-lg border border-primary-500/10 p-2">
                <svg viewBox="0 0 800 60" className="w-full h-full" preserveAspectRatio="none">
                  {(() => {
                    const candles = prices.candles.slice(-50);
                    const maxV = Math.max(...candles.map(c => c.volume || 1));
                    return candles.map((c, i) => {
                      const x = (i / candles.length) * 780 + 10;
                      const h = ((c.volume || 0) / (maxV || 1)) * 50;
                      const isUp = c.close >= c.open;
                      return (
                        <rect key={i} x={x} y={55 - h} width={Math.max(780 / candles.length - 2, 2)} height={h}
                          fill={isUp ? '#10b98180' : '#ef444480'} rx="1" />
                      );
                    });
                  })()}
                </svg>
              </div>

              {/* RSI indicator */}
              {(prices.indicators?.rsi?.values || prices.indicators?.rsi) && Array.isArray(prices.indicators.rsi?.values || prices.indicators.rsi) && (
                <div className="h-16 bg-dark-900/50 rounded-lg border border-primary-500/10 p-2 relative">
                  <div className="absolute left-2 top-0 text-[10px] text-gray-600">RSI</div>
                  <svg viewBox="0 0 800 50" className="w-full h-full" preserveAspectRatio="none">
                    {/* Overbought/Oversold lines */}
                    <line x1="0" y1={50 - 70 * 0.5} x2="800" y2={50 - 70 * 0.5} stroke="#ef4444" strokeWidth="0.5" strokeDasharray="3,2" opacity="0.4" />
                    <line x1="0" y1={50 - 30 * 0.5} x2="800" y2={50 - 30 * 0.5} stroke="#22c55e" strokeWidth="0.5" strokeDasharray="3,2" opacity="0.4" />
                    <line x1="0" y1={50 - 50 * 0.5} x2="800" y2={50 - 50 * 0.5} stroke="#64748b" strokeWidth="0.3" strokeDasharray="2,4" opacity="0.3" />
                    {/* RSI line */}
                    <path
                      d={(prices.indicators.rsi?.values || prices.indicators.rsi).slice(-50).map((v, i, arr) =>
                        `${i === 0 ? 'M' : 'L'}${(i / (arr.length - 1)) * 780 + 10},${50 - v * 0.5}`
                      ).join(' ')}
                      fill="none" stroke="#a855f7" strokeWidth="1.5"
                    />
                  </svg>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <p>Loading chart data...</p>
            </div>
          )}

          {/* Signal markers overlay */}
          {signals.filter(s => s.timeframe === activeTimeframe).length > 0 && (
            <div className="absolute top-4 left-4 space-y-2">
              {signals.filter(s => s.timeframe === activeTimeframe).slice(0, 3).map((s, i) => (
                <div key={s.id || i} className={`px-3 py-1 rounded-full text-xs font-bold ${
                  s.signalType === 'buy' ? 'bg-green-500/20 text-green-400 border border-green-500/40' : 'bg-red-500/20 text-red-400 border border-red-500/40'
                }`}>
                  {s.signalType === 'buy' ? '▲' : '▼'} {s.signalType.toUpperCase()} @ {parseFloat(s.entry).toFixed(2)}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Active Signals */}
      <div className="gold-card p-6">
        <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wider flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          Active Signals
        </h3>
        {signals.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-4xl mb-4">🔍</p>
            <p className="font-bold">No active signals</p>
            <p className="text-sm mt-1">The scanner is monitoring {selectedPair}. Signals appear when conditions are met.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {signals.map((signal, idx) => (
              <div key={signal.id || idx} className={`p-4 rounded-xl border transition-all hover:scale-[1.01] ${
                signal.signalType === 'buy'
                  ? 'bg-green-500/5 border-green-500/20 hover:border-green-500/40'
                  : 'bg-red-500/5 border-red-500/20 hover:border-red-500/40'
              }`}>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-black ${
                      signal.signalType === 'buy' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {signal.signalType === 'buy' ? '▲' : '▼'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-lg font-black uppercase ${signal.signalType === 'buy' ? 'text-green-400' : 'text-red-400'}`}>
                          {signal.signalType}
                        </span>
                        <span className="badge badge-yellow text-[10px]">{signal.timeframe || activeTimeframe}</span>
                      </div>
                      <p className="text-xs text-gray-500 font-mono mt-1">
                        {new Date(signal.createdAt || signal.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-6">
                    <div className="text-center">
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider">Entry</p>
                      <p className="text-sm font-bold text-white font-mono">{parseFloat(signal.entry).toFixed(2)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider">Stop Loss</p>
                      <p className="text-sm font-bold text-red-400 font-mono">{parseFloat(signal.stopLoss).toFixed(2)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider">Take Profit</p>
                      <p className="text-sm font-bold text-green-400 font-mono">{parseFloat(signal.takeProfit).toFixed(2)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider">Confidence</p>
                      <div className="flex items-center justify-center gap-1">
                        <p className="text-sm font-bold text-yellow-400 font-mono">{parseFloat(signal.confidence).toFixed(0)}%</p>
                      </div>
                      <div className="w-full bg-dark-900/50 h-1 rounded-full mt-1">
                        <div className="h-full rounded-full bg-gradient-to-r from-yellow-500 to-yellow-300" style={{ width: `${signal.confidence}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GoldScanner;
