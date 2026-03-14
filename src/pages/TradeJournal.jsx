import React, { useState, useEffect, useMemo } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const TradeJournal = () => {
  const [entries, setEntries] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [activeTab, setActiveTab] = useState('journal');
  const [filters, setFilters] = useState({ status: '', direction: '', asset: '', timeframe: '' });
  const [form, setForm] = useState({
    asset: 'XAUUSD', direction: 'long', entry: '', exit: '', stopLoss: '', takeProfit: '',
    lotSize: '0.01', strategy: '', timeframe: '1h', notes: '', emotionTag: 'neutral',
    status: 'planned', enteredAt: '', exitedAt: ''
  });

  const emotionOptions = [
    { value: 'confident', label: '😎 Confident', color: 'text-green-400' },
    { value: 'calm', label: '😌 Calm', color: 'text-blue-400' },
    { value: 'neutral', label: '😐 Neutral', color: 'text-gray-400' },
    { value: 'anxious', label: '😰 Anxious', color: 'text-yellow-400' },
    { value: 'fearful', label: '😨 Fearful', color: 'text-orange-400' },
    { value: 'greedy', label: '🤑 Greedy', color: 'text-red-400' },
    { value: 'frustrated', label: '😤 Frustrated', color: 'text-red-500' }
  ];

  const timeframes = ['1m', '5m', '15m', '1h', '4h', '1d', '1w'];
  const assets = ['XAUUSD', 'EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD', 'NZDUSD', 'USDCHF', 'GBPJPY', 'EURJPY'];

  useEffect(() => {
    fetchEntries();
    fetchAnalytics();
    fetchComparison();
  }, []);

  const fetchEntries = async () => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => { if (v) params.append(k, v); });
      const res = await api.get(`/journal?${params}`);
      setEntries(res.data.entries);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await api.get('/journal/analytics');
      const data = res.data?.analytics || {};
      // Flatten analytics shape for easy UI access
      setAnalytics({
        // Overview stats (flat)
        totalTrades: data.overview?.totalTrades || 0,
        wins: data.overview?.wins || 0,
        losses: data.overview?.losses || 0,
        breakeven: data.overview?.breakeven || 0,
        winRate: data.overview?.winRate || 0,
        totalPnl: data.overview?.totalPnl || 0,
        averagePnl: data.overview?.averagePnl || 0,
        totalPips: data.overview?.totalPips || 0,
        averageRiskReward: data.overview?.averageRiskReward || 0,
        maxDrawdown: data.overview?.maxDrawdown || 0,
        profitFactor: data.overview?.profitFactor || 0,
        avgWin: data.overview?.wins > 0 ? (data.overview?.totalPnl > 0 ? data.overview.totalPnl / data.overview.wins : 0) : 0,
        avgLoss: data.overview?.losses > 0 ? (Math.abs(data.overview?.totalPnl) / data.overview.losses) : 0,
        // Breakdowns (mapped to UI keys)
        equityCurve: (data.equityCurve || []).map((d, i, arr) => ({
          ...d,
          cumulative: d.equity != null ? d.equity : (arr.slice(0, i + 1).reduce((s, x) => s + (x.pnl || 0), 0))
        })),
        byStrategy: (data.strategyBreakdown || []).map(s => ({ strategy: s.strategy, pnl: s.pnl, count: s.trades })),
        byEmotion: (data.emotionBreakdown || []).map(e => ({ emotionTag: e.emotion, pnl: e.pnl, count: e.trades })),
        monthly: (data.monthlyBreakdown || []).map(m => ({ month: m.month, pnl: m.pnl, count: m.trades }))
      });
    } catch (err) {
      console.error(err);
    }
  };

  const fetchComparison = async () => {
    try {
      const res = await api.get('/journal/compare');
      setComparison(res.data.comparison || null);
    } catch (err) {
      console.error('Comparison fetch error:', err);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, [filters]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form };
      Object.keys(payload).forEach(k => { if (!payload[k]) delete payload[k]; });

      if (editingEntry) {
        await api.put(`/journal/${editingEntry.id}`, payload);
        toast.success('Entry updated');
      } else {
        await api.post('/journal', payload);
        toast.success('Entry created');
      }
      setShowForm(false);
      setEditingEntry(null);
      resetForm();
      fetchEntries();
      fetchAnalytics();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving entry');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this journal entry?')) return;
    try {
      await api.delete(`/journal/${id}`);
      toast.success('Entry deleted');
      fetchEntries();
      fetchAnalytics();
    } catch (err) {
      toast.error('Error deleting entry');
    }
  };

  const handleEdit = (entry) => {
    setForm({
      asset: entry.asset, direction: entry.direction, entry: entry.entry || '',
      exit: entry.exit || '', stopLoss: entry.stopLoss || '', takeProfit: entry.takeProfit || '',
      lotSize: entry.lotSize || '0.01', strategy: entry.strategy || '', timeframe: entry.timeframe || '1h',
      notes: entry.notes || '', emotionTag: entry.emotionTag || 'neutral',
      status: entry.status, enteredAt: entry.enteredAt || '', exitedAt: entry.exitedAt || ''
    });
    setEditingEntry(entry);
    setShowForm(true);
  };

  const resetForm = () => {
    setForm({
      asset: 'XAUUSD', direction: 'long', entry: '', exit: '', stopLoss: '', takeProfit: '',
      lotSize: '0.01', strategy: '', timeframe: '1h', notes: '', emotionTag: 'neutral',
      status: 'planned', enteredAt: '', exitedAt: ''
    });
  };

  const equityData = useMemo(() => {
    if (!analytics?.equityCurve) return [];
    return analytics.equityCurve;
  }, [analytics]);

  // SVG Equity Curve
  const EquityCurve = ({ data }) => {
    if (!data || data.length < 2) return <div className="text-center text-gray-600 py-8">Not enough data for equity curve</div>;

    const w = 600, h = 200, pad = 40;
    const values = data.map(d => d.cumulative);
    const min = Math.min(...values, 0);
    const max = Math.max(...values);
    const range = max - min || 1;

    const points = data.map((d, i) => ({
      x: pad + (i / (data.length - 1)) * (w - 2 * pad),
      y: h - pad - ((d.cumulative - min) / range) * (h - 2 * pad)
    }));

    const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const areaD = `${pathD} L ${points[points.length - 1].x} ${h - pad} L ${points[0].x} ${h - pad} Z`;

    return (
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full">
        <defs>
          <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Zero line */}
        {min < 0 && (
          <line x1={pad} y1={h - pad - ((0 - min) / range) * (h - 2 * pad)} x2={w - pad} y2={h - pad - ((0 - min) / range) * (h - 2 * pad)} stroke="#888" strokeWidth="0.5" strokeDasharray="4" />
        )}
        <path d={areaD} fill="url(#equityGrad)" />
        <path d={pathD} fill="none" stroke="#06b6d4" strokeWidth="2" />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3" fill={data[i].pnl >= 0 ? '#22c55e' : '#ef4444'} />
        ))}
      </svg>
    );
  };

  // Stats mini cards
  const StatCard = ({ label, value, color = 'text-primary-400', sub }) => (
    <div className="card p-4 text-center">
      <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-2xl font-black ${color}`}>{value}</p>
      {sub && <p className="text-[10px] text-gray-600 mt-1">{sub}</p>}
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="slide-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-wider">Trade Journal</h1>
          <p className="text-gray-400 mt-1">Track, analyze, and improve your trading</p>
        </div>
        <button onClick={() => { resetForm(); setEditingEntry(null); setShowForm(true); }} className="btn btn-primary">
          + New Entry
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {['journal', 'analytics', 'compare'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wider transition-all ${
              activeTab === tab ? 'bg-primary-500/10 text-primary-300 border border-primary-500/30' : 'text-gray-500 hover:text-gray-300 border border-transparent'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'journal' && (
        <>
          {/* Filters */}
          <div className="card p-4 mb-6">
            <div className="grid grid-cols-4 gap-3">
              <select value={filters.status} onChange={e => setFilters(f => ({...f, status: e.target.value}))} className="input text-sm">
                <option value="">All Status</option>
                <option value="planned">Planned</option>
                <option value="active">Active</option>
                <option value="closed">Closed</option>
              </select>
              <select value={filters.direction} onChange={e => setFilters(f => ({...f, direction: e.target.value}))} className="input text-sm">
                <option value="">All Directions</option>
                <option value="long">Long</option>
                <option value="short">Short</option>
              </select>
              <select value={filters.asset} onChange={e => setFilters(f => ({...f, asset: e.target.value}))} className="input text-sm">
                <option value="">All Assets</option>
                {assets.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
              <select value={filters.timeframe} onChange={e => setFilters(f => ({...f, timeframe: e.target.value}))} className="input text-sm">
                <option value="">All Timeframes</option>
                {timeframes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {/* Entries Table */}
          <div className="card p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-primary-500/10">
                    <th className="text-left p-4 text-gray-500 font-bold text-[10px] uppercase tracking-wider">Asset</th>
                    <th className="text-left p-4 text-gray-500 font-bold text-[10px] uppercase tracking-wider">Direction</th>
                    <th className="text-left p-4 text-gray-500 font-bold text-[10px] uppercase tracking-wider">Entry</th>
                    <th className="text-left p-4 text-gray-500 font-bold text-[10px] uppercase tracking-wider">Exit</th>
                    <th className="text-left p-4 text-gray-500 font-bold text-[10px] uppercase tracking-wider">SL / TP</th>
                    <th className="text-left p-4 text-gray-500 font-bold text-[10px] uppercase tracking-wider">P&L</th>
                    <th className="text-left p-4 text-gray-500 font-bold text-[10px] uppercase tracking-wider">Emotion</th>
                    <th className="text-left p-4 text-gray-500 font-bold text-[10px] uppercase tracking-wider">Status</th>
                    <th className="text-center p-4 text-gray-500 font-bold text-[10px] uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="text-center py-12 text-gray-600">
                        <span className="text-3xl block mb-2">📓</span>
                        No journal entries yet. Start tracking your trades!
                      </td>
                    </tr>
                  ) : (
                    entries.map(e => (
                      <tr key={e.id} className="border-b border-primary-500/5 hover:bg-primary-500/5 transition-colors">
                        <td className="p-4 font-bold text-white">{e.asset}</td>
                        <td className="p-4">
                          <span className={`text-xs font-bold px-2 py-1 rounded ${e.direction === 'long' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                            {e.direction?.toUpperCase()}
                          </span>
                        </td>
                        <td className="p-4 text-gray-300">{e.entry || '-'}</td>
                        <td className="p-4 text-gray-300">{e.exit || '-'}</td>
                        <td className="p-4 text-gray-300">
                          <span className="text-red-400">{e.stopLoss || '-'}</span>
                          {' / '}
                          <span className="text-green-400">{e.takeProfit || '-'}</span>
                        </td>
                        <td className={`p-4 font-bold ${e.pnl > 0 ? 'text-green-400' : e.pnl < 0 ? 'text-red-400' : 'text-gray-500'}`}>
                          {e.pnl != null ? `${e.pnl > 0 ? '+' : ''}$${parseFloat(e.pnl).toFixed(2)}` : '-'}
                          {e.pips != null && <span className="text-[10px] block text-gray-500">{e.pips} pips</span>}
                        </td>
                        <td className="p-4">
                          {emotionOptions.find(em => em.value === e.emotionTag)?.label || '-'}
                        </td>
                        <td className="p-4">
                          <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded ${
                            e.status === 'closed' ? 'bg-gray-500/10 text-gray-400' :
                            e.status === 'active' ? 'bg-primary-500/10 text-primary-400' :
                            'bg-yellow-500/10 text-yellow-400'
                          }`}>
                            {e.status}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <button onClick={() => handleEdit(e)} className="text-primary-400 hover:text-primary-300 mr-3 text-xs font-bold">Edit</button>
                          <button onClick={() => handleDelete(e.id)} className="text-red-400 hover:text-red-300 text-xs font-bold">Del</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeTab === 'analytics' && analytics && (
        <div className="space-y-6">
          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-4">
            <StatCard label="Total Trades" value={analytics.totalTrades || 0} />
            <StatCard label="Win Rate" value={`${(analytics.winRate || 0).toFixed(1)}%`}
              color={analytics.winRate >= 50 ? 'text-green-400' : 'text-red-400'} />
            <StatCard label="Total P&L" value={`$${(analytics.totalPnl || 0).toFixed(2)}`}
              color={analytics.totalPnl >= 0 ? 'text-green-400' : 'text-red-400'} />
            <StatCard label="Avg Win" value={`$${(analytics.avgWin || 0).toFixed(2)}`} color="text-green-400" />
            <StatCard label="Avg Loss" value={`$${(analytics.avgLoss || 0).toFixed(2)}`} color="text-red-400" />
            <StatCard label="Profit Factor" value={(analytics.profitFactor || 0).toFixed(2)}
              color={analytics.profitFactor >= 1 ? 'text-green-400' : 'text-red-400'} />
          </div>

          {/* Equity Curve */}
          <div className="card p-6">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Equity Curve</h3>
            <EquityCurve data={equityData} />
          </div>

          {/* Breakdowns */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {/* Strategy Breakdown */}
            {analytics.byStrategy && analytics.byStrategy.length > 0 && (
              <div className="card p-6">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">By Strategy</h3>
                <div className="space-y-3">
                  {analytics.byStrategy.map((s, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">{s.strategy || 'N/A'}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-500">{s.count} trades</span>
                        <span className={`text-sm font-bold ${parseFloat(s.pnl) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          ${parseFloat(s.pnl).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Emotion Breakdown */}
            {analytics.byEmotion && analytics.byEmotion.length > 0 && (
              <div className="card p-6">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">By Emotion</h3>
                <div className="space-y-3">
                  {analytics.byEmotion.map((e, i) => {
                    const emo = emotionOptions.find(em => em.value === e.emotionTag);
                    return (
                      <div key={i} className="flex items-center justify-between">
                        <span className={`text-sm ${emo?.color || 'text-gray-300'}`}>{emo?.label || e.emotionTag}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-500">{e.count} trades</span>
                          <span className={`text-sm font-bold ${parseFloat(e.pnl) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            ${parseFloat(e.pnl).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Monthly Breakdown */}
            {analytics.monthly && analytics.monthly.length > 0 && (
              <div className="card p-6">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Monthly P&L</h3>
                <div className="space-y-3">
                  {analytics.monthly.slice(-6).map((m, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">{m.month}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-500">{m.count} trades</span>
                        <span className={`text-sm font-bold ${parseFloat(m.pnl) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          ${parseFloat(m.pnl).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Signal Comparison Tab */}
      {activeTab === 'compare' && (
        <div className="space-y-6">
          {comparison && comparison.userMetrics ? (
            <>
              {/* Your vs Signal Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard label="Linked Trades" value={comparison.userMetrics.totalTrades || 0} />
                <StatCard label="Your Win Rate" value={`${(comparison.userMetrics.winRate || 0).toFixed(1)}%`}
                  color={comparison.userMetrics.winRate >= 50 ? 'text-green-400' : 'text-red-400'} />
                <StatCard label="Your Total P&L" value={`$${(comparison.userMetrics.totalPnl || 0).toFixed(2)}`}
                  color={comparison.userMetrics.totalPnl >= 0 ? 'text-green-400' : 'text-red-400'} />
              </div>

              {/* Comparison Table */}
              {comparison.comparisons && comparison.comparisons.length > 0 ? (
                <div className="card p-0 overflow-hidden">
                  <div className="p-4 border-b border-primary-500/10">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Your Trades vs Educator Signals</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-primary-500/10">
                          <th className="text-left p-4 text-gray-500 font-bold text-[10px] uppercase">Asset</th>
                          <th className="text-left p-4 text-gray-500 font-bold text-[10px] uppercase">Your Entry</th>
                          <th className="text-left p-4 text-gray-500 font-bold text-[10px] uppercase">Signal Entry</th>
                          <th className="text-left p-4 text-gray-500 font-bold text-[10px] uppercase">Your P&L</th>
                          <th className="text-left p-4 text-gray-500 font-bold text-[10px] uppercase">Timing Diff</th>
                          <th className="text-left p-4 text-gray-500 font-bold text-[10px] uppercase">Result</th>
                        </tr>
                      </thead>
                      <tbody>
                        {comparison.comparisons.map((c, i) => (
                          <tr key={i} className="border-b border-primary-500/5 hover:bg-primary-500/5">
                            <td className="p-4 font-bold text-white">{c.trade?.asset || '-'}</td>
                            <td className="p-4 text-gray-300">{c.trade?.entry || '-'}</td>
                            <td className="p-4 text-gray-300">{c.signal?.entryPrice || c.signal?.entry || '-'}</td>
                            <td className={`p-4 font-bold ${(c.trade?.pnl || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {c.trade?.pnl != null ? `${c.trade.pnl > 0 ? '+' : ''}$${parseFloat(c.trade.pnl).toFixed(2)}` : '-'}
                            </td>
                            <td className="p-4 text-gray-400">
                              {c.timingDifference != null ? `${c.timingDifference > 0 ? '+' : ''}${Math.round(c.timingDifference)}m` : '-'}
                            </td>
                            <td className="p-4">
                              <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded ${
                                c.trade?.result === 'win' ? 'bg-green-500/10 text-green-400' :
                                c.trade?.result === 'loss' ? 'bg-red-500/10 text-red-400' :
                                'bg-gray-500/10 text-gray-400'
                              }`}>
                                {c.trade?.result || '-'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="card p-12 text-center text-gray-600">
                  <span className="text-4xl block mb-3">📊</span>
                  <p className="font-bold">No linked signal trades found</p>
                  <p className="text-sm mt-1">Link your journal entries to educator signals to see comparisons</p>
                </div>
              )}
            </>
          ) : (
            <div className="card p-12 text-center text-gray-600">
              <span className="text-4xl block mb-3">📊</span>
              <p className="font-bold">No comparison data yet</p>
              <p className="text-sm mt-1">Link your trades to educator signals when creating journal entries</p>
            </div>
          )}
        </div>
      )}

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowForm(false)}>
          <div className="card p-6 w-full max-w-2xl max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-black text-white mb-6">{editingEntry ? 'Edit Entry' : 'New Journal Entry'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 uppercase mb-1">Asset</label>
                  <select value={form.asset} onChange={e => setForm(f => ({...f, asset: e.target.value}))} className="input w-full">
                    {assets.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 uppercase mb-1">Direction</label>
                  <div className="flex gap-2">
                    {['long', 'short'].map(d => (
                      <button key={d} type="button"
                        onClick={() => setForm(f => ({...f, direction: d}))}
                        className={`flex-1 py-2 rounded-lg text-sm font-bold uppercase border transition-all ${
                          form.direction === d
                            ? d === 'long' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'
                            : 'border-primary-500/10 text-gray-500'
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 uppercase mb-1">Entry Price</label>
                  <input type="number" step="any" value={form.entry} onChange={e => setForm(f => ({...f, entry: e.target.value}))} className="input w-full" placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 uppercase mb-1">Exit Price</label>
                  <input type="number" step="any" value={form.exit} onChange={e => setForm(f => ({...f, exit: e.target.value}))} className="input w-full" placeholder="0.00" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 uppercase mb-1">Stop Loss</label>
                  <input type="number" step="any" value={form.stopLoss} onChange={e => setForm(f => ({...f, stopLoss: e.target.value}))} className="input w-full" placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 uppercase mb-1">Take Profit</label>
                  <input type="number" step="any" value={form.takeProfit} onChange={e => setForm(f => ({...f, takeProfit: e.target.value}))} className="input w-full" placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 uppercase mb-1">Lot Size</label>
                  <input type="number" step="0.01" value={form.lotSize} onChange={e => setForm(f => ({...f, lotSize: e.target.value}))} className="input w-full" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 uppercase mb-1">Strategy</label>
                  <input type="text" value={form.strategy} onChange={e => setForm(f => ({...f, strategy: e.target.value}))} className="input w-full" placeholder="e.g. System-100 Gold" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 uppercase mb-1">Timeframe</label>
                  <select value={form.timeframe} onChange={e => setForm(f => ({...f, timeframe: e.target.value}))} className="input w-full">
                    {timeframes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 uppercase mb-1">Status</label>
                  <select value={form.status} onChange={e => setForm(f => ({...f, status: e.target.value}))} className="input w-full">
                    <option value="planned">Planned</option>
                    <option value="active">Active</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 uppercase mb-1">Emotion</label>
                  <select value={form.emotionTag} onChange={e => setForm(f => ({...f, emotionTag: e.target.value}))} className="input w-full">
                    {emotionOptions.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-500 uppercase mb-1">Notes</label>
                <textarea value={form.notes} onChange={e => setForm(f => ({...f, notes: e.target.value}))} className="input w-full" rows="3" placeholder="Trade rationale, market context, lessons..." />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn btn-primary flex-1">{editingEntry ? 'Update' : 'Create'} Entry</button>
                <button type="button" onClick={() => setShowForm(false)} className="btn btn-ghost flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TradeJournal;
