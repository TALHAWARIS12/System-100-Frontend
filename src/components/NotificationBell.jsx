import React, { useState, useEffect, useRef } from 'react';
import useWebSocket from '../hooks/useWebSocket';
import api from '../utils/api';

const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);
  const { on, off } = useWebSocket();

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    on('notification', (notif) => {
      setNotifications(prev => [notif, ...prev].slice(0, 50));
      setUnreadCount(prev => prev + 1);
    });
    return () => off('notification');
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications?limit=20');
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (err) {
      console.error('Notifications fetch error:', err);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'signal': return '📡';
      case 'trade': return '📈';
      case 'calendar': return '📅';
      case 'system': return '⚙️';
      case 'announcement': return '📢';
      case 'subscription': return '💳';
      case 'referral': return '🔗';
      default: return '🔔';
    }
  };

  const getTimeAgo = (date) => {
    const diff = (Date.now() - new Date(date).getTime()) / 1000;
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg hover:bg-primary-500/10 transition-all border border-transparent hover:border-primary-500/30"
      >
        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 max-h-96 bg-dark-800 border border-primary-500/20 rounded-xl shadow-2xl shadow-black/50 overflow-hidden z-50">
          <div className="p-3 border-b border-primary-500/10 flex items-center justify-between">
            <h4 className="text-sm font-bold text-white">Notifications</h4>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-[10px] text-primary-400 hover:text-primary-300 font-bold uppercase">
                Mark all read
              </button>
            )}
          </div>
          <div className="overflow-y-auto max-h-80">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-600">
                <span className="text-2xl block mb-1">🔔</span>
                <p className="text-xs">No notifications</p>
              </div>
            ) : (
              notifications.map((notif, i) => (
                <div
                  key={notif.id || i}
                  onClick={() => !notif.isRead && markAsRead(notif.id)}
                  className={`p-3 border-b border-primary-500/5 hover:bg-primary-500/5 cursor-pointer transition-all ${
                    !notif.isRead ? 'bg-primary-500/5' : ''
                  }`}
                >
                  <div className="flex gap-2">
                    <span className="text-lg flex-shrink-0">{getIcon(notif.type)}</span>
                    <div className="min-w-0 flex-1">
                      <p className={`text-xs font-bold truncate ${notif.isRead ? 'text-gray-400' : 'text-white'}`}>
                        {notif.title}
                      </p>
                      <p className="text-[11px] text-gray-500 line-clamp-2">{notif.message}</p>
                      <p className="text-[9px] text-gray-600 mt-1">{getTimeAgo(notif.createdAt)}</p>
                    </div>
                    {!notif.isRead && (
                      <div className="w-2 h-2 bg-primary-400 rounded-full flex-shrink-0 mt-1" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
