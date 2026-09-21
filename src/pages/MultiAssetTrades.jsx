import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import useAuthStore from '../store/authStore';
import UnlimitedBadge from '../components/UnlimitedBadge';
import UpsellModal from '../components/UpsellModal';
import toast from 'react-hot-toast';

const MultiAssetTrades = () => {
  const { user, isUnlimitedTier } = useAuthStore();
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeTimeframe, setActiveTimeframe] = useState('all');
  const [trades, setTrades] = useState([]);
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpsell, setShowUpsell] = useState(false);
  const [cryptoPrices, setCryptoPrices] = useState({});

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, [activeCategory, activeTimeframe]);

  const fetchData = async () => {
    try {
      const params = {};
      if (activeCategory !== 'all') params.category = activeCategory;
      if (activeTimeframe !== 'all') params.timeframe = activeTimeframe;

      const [tradesRes, signalsRes, marketRes] = await Promise.all([
        api.get('/trades', { params }).catch(() => ({ data: { trades: [] } })),
        api.get('/signals', { params }).catch(() => ({ data: { signals: [] } })),
        api.get('/market-data/latest').catch(() => ({ data: { prices: {} } }))
      ]);

      setTrades(tradesRes.data?.trades || []);
      setSignals(signalsRes.data?.signals || []);
      setCryptoPrices(marketRes.data?.prices || {});
    } catch (err) {
      console.error('Fetch multi-asset trades error:', err);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: 'all', label: 'All Assets', icon: '🌐' },
    { id: 'forex', label: 'Forex Currencies', icon: '💱' },
    { id: 'crypto', label: 'Crypto (BTC/ETH/SOL/XRP)', icon: '₿' },
    { id: 'indices', label: 'Indices & Commodities', icon: '📈' }
  ];

  const timeframes = [
    { id: 'all', label: 'All Timeframes' },
    { id: '15m', label: '15 Min (15m)' },
    { id: '1h', label: '1 Hour (1h)' },
    { id: '4h', label: '4 Hours (4h)' }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <span className="text-3xl">🌐</span>
            <h1 className="text-3xl font-black text-white tracking-tight">Multi-Asset Trades Hub</h1>
            <UnlimitedBadge onClick={() => setShowUpsell(true)} />
          </div>
          <p className="text-slate-400 text-sm">
            Professional educator calls and automated setups across Forex, Crypto, Indices & Commodities.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-slate-950/80 p-3 rounded-xl border border-slate-800">
          <div className="text-xs text-slate-400">Live Feeds:</div>
          <div className="flex items-center space-x-3 text-xs font-mono font-semibold">
            <span className="text-emerald-400">BTC ${cryptoPrices['BTCUSD']?.price?.toLocaleString() || '---'}</span>
            <span className="text-emerald-400">ETH ${cryptoPrices['ETHUSD']?.price?.toLocaleString() || '---'}</span>
            <span className="text-purple-400">SOL ${cryptoPrices['SOLUSD']?.price?.toLocaleString() || '---'}</span>
            <span className="text-blue-400">XRP ${cryptoPrices['XRPUSD']?.price?.toLocaleString() || '---'}</span>
          </div>
        </div>
      </div>

      {/* Category & Timeframe Controls */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center space-x-2 ${
                activeCategory === cat.id
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Timeframe Selector */}
        <div className="flex items-center space-x-2 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
          <span className="text-xs font-medium text-slate-400 px-2">Timeframe:</span>
          {timeframes.map((tf) => (
            <button
              key={tf.id}
              onClick={() => setActiveTimeframe(tf.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTimeframe === tf.id
                  ? 'bg-cyan-500 text-slate-950'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      {/* Trades Grid */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-400 text-sm">Loading multi-asset setups...</p>
        </div>
      ) : trades.length === 0 && signals.length === 0 ? (
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 text-center space-y-4">
          <div className="text-5xl">📡</div>
          <h3 className="text-xl font-bold text-white">No Active Trades in Selected View</h3>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            Our educator scanner and automated engines are monitoring real-time feeds for {activeCategory} on {activeTimeframe}.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            ...trades.map(t => ({ ...t, isTrade: true })),
            ...signals.map(s => ({
              id: s.id,
              asset: s.asset,
              direction: s.direction,
              entry: s.entry,
              stopLoss: s.stopLoss,
              takeProfit1: s.takeProfit || s.takeProfit1,
              takeProfit2: s.takeProfit2,
              takeProfit3: s.takeProfit3,
              timeframe: s.timeframe,
              category: s.category || 'Automated Signal',
              status: 'active',
              educator: { firstName: s.pattern || 'Automated Strategy' },
              isTrade: false
            }))
          ].map((trade) => (
            <div
              key={trade.id}
              className="bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-6 shadow-xl space-y-5 transition group"
            >
              {/* Card Header */}
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xl font-extrabold text-white tracking-wide">{trade.asset}</span>
                    <span className="px-2 py-0.5 bg-slate-800 text-slate-300 text-xs font-bold rounded uppercase">
                      {trade.timeframe || '1h'}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 capitalize">{trade.category || 'Forex'}</span>
                </div>

                <div className="flex flex-col items-end space-y-1">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase ${
                      trade.direction === 'buy'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {trade.direction}
                  </span>
                  <span className="text-[10px] text-amber-400/80 font-mono">Status: {trade.status}</span>
                </div>
              </div>

              {/* Price Levels Grid */}
              <div className="grid grid-cols-2 gap-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 text-sm">
                <div>
                  <div className="text-xs text-slate-500 uppercase font-semibold">Entry</div>
                  <div className="font-mono font-bold text-white">{trade.entry}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 uppercase font-semibold">Stop Loss</div>
                  <div className="font-mono font-bold text-rose-400">{trade.stopLoss}</div>
                </div>

                <div className="col-span-2 pt-2 border-t border-slate-800/60 space-y-1.5">
                  <div className="text-xs text-slate-400 font-medium">Independent Take Profits:</div>
                  <div className="grid grid-cols-3 gap-2 font-mono text-xs text-center">
                    <div className="bg-emerald-950/40 border border-emerald-500/30 p-1.5 rounded">
                      <div className="text-[10px] text-emerald-500 font-bold">TP1</div>
                      <div className="text-emerald-300 font-bold">{trade.takeProfit1 || trade.takeProfit}</div>
                    </div>
                    <div className="bg-emerald-950/40 border border-emerald-500/30 p-1.5 rounded">
                      <div className="text-[10px] text-emerald-400 font-bold">TP2</div>
                      <div className="text-emerald-300 font-bold">{trade.takeProfit2 || '---'}</div>
                    </div>
                    <div className="bg-emerald-950/40 border border-emerald-500/30 p-1.5 rounded">
                      <div className="text-[10px] text-emerald-300 font-bold">TP3</div>
                      <div className="text-emerald-300 font-bold">{trade.takeProfit3 || '---'}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="flex justify-between items-center text-xs text-slate-400 pt-2 border-t border-slate-800/60">
                <div>
                  Educator: <span className="text-slate-200 font-semibold">{trade.educator?.firstName || 'Gold Circle Educator'}</span>
                </div>
                {trade.rrRatio && (
                  <div className="font-mono text-amber-400 font-bold">
                    R:R 1:{trade.rrRatio}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upsell Modal */}
      <UpsellModal isOpen={showUpsell} onClose={() => setShowUpsell(false)} featureName="Multi-Asset Trades Hub" />
    </div>
  );
};

export default MultiAssetTrades;
