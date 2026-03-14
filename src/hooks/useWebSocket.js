/**
 * Phase 2: WebSocket Hook
 * React hook for real-time WebSocket communication
 */
import { useEffect, useRef, useCallback, useState } from 'react';
import { io } from 'socket.io-client';

const WS_URL = import.meta.env.VITE_WS_URL || import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

let socket = null;
let connectAttempted = false;

const initSocket = (token) => {
  if (socket) {
    // If socket exists but disconnected, update auth and reconnect
    if (!socket.connected) {
      socket.auth = { token };
      socket.connect();
    }
    return socket;
  }

  socket = io(WS_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 10000
  });

  return socket;
};

export const getSocket = () => socket;

export const useWebSocket = () => {
  const [connected, setConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const listenersRef = useRef({});

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const s = initSocket(token);

    const onConnect = () => {
      setConnected(true);
      console.log('WebSocket connected');
    };

    const onDisconnect = () => {
      setConnected(false);
      console.log('WebSocket disconnected');
    };

    const onConnectError = (err) => {
      console.log('WebSocket connect error:', err.message);
      setConnected(false);
    };

    const onNotification = (data) => {
      setNotifications(prev => [data, ...prev]);
    };

    s.on('connect', onConnect);
    s.on('disconnect', onDisconnect);
    s.on('connect_error', onConnectError);
    s.on('notification', onNotification);

    // If already connected, update state immediately
    if (s.connected) {
      setConnected(true);
    }

    return () => {
      s.off('connect', onConnect);
      s.off('disconnect', onDisconnect);
      s.off('connect_error', onConnectError);
      s.off('notification', onNotification);
    };
  }, []);

  // Re-check token changes (e.g. after login)
  useEffect(() => {
    const interval = setInterval(() => {
      const token = localStorage.getItem('token');
      if (token && socket && !socket.connected) {
        socket.auth = { token };
        socket.connect();
      }
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const emit = useCallback((event, data) => {
    if (socket && socket.connected) {
      socket.emit(event, data);
    }
  }, []);

  const on = useCallback((event, callback) => {
    if (socket) {
      socket.on(event, callback);
      listenersRef.current[event] = callback;
    }
  }, []);

  const off = useCallback((event) => {
    if (socket && listenersRef.current[event]) {
      socket.off(event, listenersRef.current[event]);
      delete listenersRef.current[event];
    }
  }, []);

  const joinRoom = useCallback((roomId) => {
    emit('chat:join', roomId);
  }, [emit]);

  const leaveRoom = useCallback((roomId) => {
    emit('chat:leave', roomId);
  }, [emit]);

  const subscribeToScanner = useCallback(() => {
    emit('scanner:subscribe');
  }, [emit]);

  const subscribeToMarket = useCallback((pairs) => {
    emit('market:subscribe', pairs);
  }, [emit]);

  const clearNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  return {
    connected,
    emit,
    on,
    off,
    joinRoom,
    leaveRoom,
    subscribeToScanner,
    subscribeToMarket,
    notifications,
    clearNotification,
    socket
  };
};

export default useWebSocket;
