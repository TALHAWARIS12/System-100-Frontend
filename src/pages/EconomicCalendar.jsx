import React, { useState, useEffect, useMemo, useCallback } from 'react';
import api from '../utils/api';
import useWebSocket from '../hooks/useWebSocket';

// Live countdown timer component
const CountdownTimer = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const target = new Date(targetDate);
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft('LIVE');
        setIsUrgent(false);
        return;
      }

      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);

      if (hours > 24) {
        const days = Math.floor(hours / 24);
        setTimeLeft(`${days}d ${hours % 24}h`);
        setIsUrgent(false);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes.toString().padStart(2, '0')}m`);
        setIsUrgent(hours < 1);
      } else {
        setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`);
        setIsUrgent(minutes < 15);
      }
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (!timeLeft) return null;

  if (timeLeft === 'LIVE') {
    return (
      <span className="text-[10px] font-bold px-2 py-1 rounded bg-green-500/20 text-green-400 border border-green-500/30 animate-pulse">
        ● LIVE
      </span>
    );
  }

  return (
    <span className={`text-[10px] font-mono font-bold px-2 py-1 rounded border ${
      isUrgent 
        ? 'bg-red-500/20 text-red-400 border-red-500/30 animate-pulse' 
        : 'bg-primary-500/10 text-primary-300 border-primary-500/20'
    }`}>
      ⏳ {timeLeft}
    </span>
  );
};

const EconomicCalendar = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('today');
  const [impactFilter, setImpactFilter] = useState('');
  const [currencyFilter, setCurrencyFilter] = useState('');
  const { on, off } = useWebSocket();

  useEffect(() => {
    fetchEvents();
  }, [dateFilter, impactFilter, currencyFilter]);

  useEffect(() => {
    on('calendar:alert', (event) => {
      // Update the event in our list or add it
      setEvents(prev => {
        const idx = prev.findIndex(e => e.id === event.id || (e.title === event.title && e.date === event.date));
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = { ...updated[idx], isImminent: true };
          return updated;
        }
        return prev;
      });
    });
    return () => off('calendar:alert');
  }, []);

  const fetchEvents = async () => {
    try {
      const params = new URLSearchParams();
      if (dateFilter === 'today') {
        const today = new Date().toISOString().split('T')[0];
        params.append('startDate', today);
        params.append('endDate', today);
      } else if (dateFilter === 'week') {
        const start = new Date();
        const end = new Date();
        end.setDate(end.getDate() + 7);
        params.append('startDate', start.toISOString().split('T')[0]);
        params.append('endDate', end.toISOString().split('T')[0]);
      }
      if (impactFilter) params.append('impact', impactFilter);
      if (currencyFilter) params.append('currency', currencyFilter);

      const res = await api.get(`/calendar/events?${params}`);
      setEvents(res.data.events || []);
    } catch (err) {
      console.error('Calendar fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const impactColor = (impact) => {
    switch (impact?.toLowerCase()) {
      case 'high': return { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30', dot: 'bg-red-400' };
      case 'medium': return { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/30', dot: 'bg-yellow-400' };
      case 'low': return { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/30', dot: 'bg-green-400' };
      default: return { bg: 'bg-gray-500/10', text: 'text-gray-400', border: 'border-gray-500/30', dot: 'bg-gray-400' };
    }
  };

  const currencies = useMemo(() => {
    const set = new Set(events.map(e => e.currency).filter(Boolean));
    return Array.from(set).sort();
  }, [events]);

  const groupedByDate = useMemo(() => {
    const groups = {};
    events.forEach(e => {
      const date = e.date ? new Date(e.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Unknown';
      if (!groups[date]) groups[date] = [];
      groups[date].push(e);
    });
    return groups;
  }, [events]);

  // Timeline SVG
  const TimelineBar = () => {
    const now = new Date();
    const hours = now.getHours() + now.getMinutes() / 60;
    const pct = (hours / 24) * 100;
    
    const todayEvents = events.filter(e => {
      if (!e.date) return false;
      const d = new Date(e.date);
      return d.toDateString() === now.toDateString();
    });

    return (
      <div className="card p-6 mb-6">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Today's Timeline</h3>
        <div className="relative h-16">
          {/* Hour markers */}
          <div className="absolute inset-x-0 top-0 flex justify-between px-2">
            {[0,4,8,12,16,20,24].map(h => (
              <span key={h} className="text-[9px] text-gray-600">{h.toString().padStart(2,'0')}:00</span>
            ))}
          </div>
          {/* Bar */}
          <div className="absolute left-0 right-0 top-6 h-6 bg-dark-800 rounded-full overflow-hidden border border-primary-500/10">
            {/* Progress */}
            <div className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-primary-500/20 to-primary-500/5 rounded-full"
              style={{ width: `${pct}%` }} />
            {/* Now marker */}
            <div className="absolute top-0 bottom-0 w-0.5 bg-primary-400" style={{ left: `${pct}%` }}>
              <div className="absolute -top-1 -translate-x-1/2 w-2 h-2 bg-primary-400 rounded-full" />
            </div>
            {/* Event dots */}
            {todayEvents.map((e, i) => {
              const time = e.time || e.date;
              if (!time) return null;
              const d = new Date(time);
              const h = d.getHours() + d.getMinutes() / 60;
              const p = (h / 24) * 100;
              const ic = impactColor(e.impact);
              return (
                <div key={i} className={`absolute top-1 w-4 h-4 rounded-full ${ic.dot} opacity-70`}
                  style={{ left: `${p}%`, transform: 'translateX(-50%)' }}
                  title={`${e.title} (${e.impact})`} />
              );
            })}
          </div>
          {/* Event labels below */}
          <div className="absolute left-0 right-0 top-[52px] flex justify-between">
            <span className="text-[9px] text-gray-500">Asia</span>
            <span className="text-[9px] text-gray-500">London</span>
            <span className="text-[9px] text-gray-500">New York</span>
            <span className="text-[9px] text-gray-500">Close</span>
          </div>
        </div>
      </div>
    );
  };

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
          <h1 className="text-3xl font-black text-white uppercase tracking-wider">Economic Calendar</h1>
          <p className="text-gray-400 mt-1">High-impact events & market-moving data</p>
        </div>
        <button onClick={() => { setLoading(true); fetchEvents(); }} className="btn btn-ghost text-sm">
          ↻ Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6">
        <div className="flex flex-wrap gap-3">
          <div className="flex gap-1 bg-dark-800 rounded-lg p-1">
            {['today', 'week', 'all'].map(f => (
              <button key={f} onClick={() => setDateFilter(f)}
                className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase transition-all ${
                  dateFilter === f ? 'bg-primary-500/10 text-primary-300' : 'text-gray-500 hover:text-gray-300'
                }`}>
                {f}
              </button>
            ))}
          </div>
          <div className="flex gap-1 bg-dark-800 rounded-lg p-1">
            {['', 'high', 'medium', 'low'].map(f => (
              <button key={f} onClick={() => setImpactFilter(f)}
                className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase transition-all ${
                  impactFilter === f ? 'bg-primary-500/10 text-primary-300' : 'text-gray-500 hover:text-gray-300'
                }`}>
                {f || 'all'}
              </button>
            ))}
          </div>
          {currencies.length > 0 && (
            <select value={currencyFilter} onChange={e => setCurrencyFilter(e.target.value)} className="input text-sm py-1">
              <option value="">All Currencies</option>
              {currencies.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          )}
        </div>
      </div>

      {/* Timeline */}
      {dateFilter === 'today' && <TimelineBar />}

      {/* Stats Banner */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="card p-4 text-center">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider">Total Events</p>
          <p className="text-2xl font-black text-white">{events.length}</p>
        </div>
        <div className="card p-4 text-center border-red-500/20">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider">High Impact</p>
          <p className="text-2xl font-black text-red-400">
            {events.filter(e => e.impact?.toLowerCase() === 'high').length}
          </p>
        </div>
        <div className="card p-4 text-center border-yellow-500/20">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider">Medium Impact</p>
          <p className="text-2xl font-black text-yellow-400">
            {events.filter(e => e.impact?.toLowerCase() === 'medium').length}
          </p>
        </div>
      </div>

      {/* Events List */}
      {Object.keys(groupedByDate).length === 0 ? (
        <div className="card p-12 text-center text-gray-600">
          <span className="text-4xl block mb-3">📅</span>
          <p className="font-bold">No events found</p>
          <p className="text-sm mt-1">Try adjusting your filters</p>
        </div>
      ) : (
        Object.entries(groupedByDate).map(([date, evts]) => (
          <div key={date} className="mb-6">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-primary-500 rounded-full" />
              {date}
            </h3>
            <div className="space-y-2">
              {evts.map((evt, i) => {
                const ic = impactColor(evt.impact);
                return (
                  <div key={i} className={`card p-4 border ${ic.border} ${evt.isImminent ? 'ring-1 ring-red-500/50 animate-pulse' : ''}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="flex flex-col items-center w-16 flex-shrink-0">
                          <span className="text-sm font-bold text-white">
                            {evt.time ? new Date(evt.time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) :
                             evt.date ? new Date(evt.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'TBD'}
                          </span>
                          {evt.currency && (
                            <span className="text-[10px] font-bold text-gray-500 bg-dark-800 px-1.5 py-0.5 rounded mt-1">
                              {evt.currency}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-white truncate">{evt.title || evt.event}</p>
                          {evt.description && <p className="text-xs text-gray-500 truncate">{evt.description}</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 flex-shrink-0">
                        {/* Countdown Timer for upcoming events */}
                        {(() => {
                          const eventTime = evt.time || evt.date;
                          const eventDate = eventTime ? new Date(eventTime) : null;
                          if (eventDate && eventDate > new Date()) {
                            return <CountdownTimer targetDate={eventTime} />;
                          }
                          if (eventDate && (new Date() - eventDate < 300000)) {
                            return (
                              <span className="text-[10px] font-bold px-2 py-1 rounded bg-green-500/20 text-green-400 border border-green-500/30 animate-pulse">
                                ● LIVE
                              </span>
                            );
                          }
                          return null;
                        })()}
                        {(evt.actual !== undefined && evt.actual !== null) && (
                          <div className="text-xs">
                            <span className="text-gray-500">A: </span>
                            <span className="text-white font-bold">{evt.actual}</span>
                          </div>
                        )}
                        {(evt.forecast !== undefined && evt.forecast !== null) && (
                          <div className="text-xs">
                            <span className="text-gray-500">F: </span>
                            <span className="text-gray-300">{evt.forecast}</span>
                          </div>
                        )}
                        {(evt.previous !== undefined && evt.previous !== null) && (
                          <div className="text-xs">
                            <span className="text-gray-500">P: </span>
                            <span className="text-gray-400">{evt.previous}</span>
                          </div>
                        )}
                        <span className={`text-[9px] uppercase font-bold px-2 py-1 rounded ${ic.bg} ${ic.text}`}>
                          {evt.impact || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default EconomicCalendar;
