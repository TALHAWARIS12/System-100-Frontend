import React, { useState, useEffect, useRef, useCallback } from 'react';
import api from '../utils/api';
import useWebSocket from '../hooks/useWebSocket';
import useAuthStore from '../store/authStore';

const Community = () => {
  const { user } = useAuthStore();
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [typingUsers, setTypingUsers] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);
  const { on, off, emit, joinRoom, leaveRoom, connected } = useWebSocket();

  // Fetch rooms
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await api.get('/chat/rooms');
        setRooms(res.data.rooms);
        if (res.data.rooms.length > 0) {
          setActiveRoom(res.data.rooms[0]);
        }
      } catch (error) {
        console.error('Fetch rooms error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);

  // Fetch messages when room changes
  useEffect(() => {
    if (!activeRoom) return;

    const fetchMessages = async () => {
      try {
        const res = await api.get(`/chat/rooms/${activeRoom.id}/messages?limit=50`);
        setMessages(res.data.messages);
        scrollToBottom();
      } catch (error) {
        console.error('Fetch messages error:', error);
      }
    };

    fetchMessages();
    joinRoom(activeRoom.id);

    return () => {
      if (activeRoom) leaveRoom(activeRoom.id);
    };
  }, [activeRoom?.id]);

  // WebSocket listeners
  useEffect(() => {
    on('chat:newMessage', (msg) => {
      if (msg.roomId === activeRoom?.id) {
        setMessages(prev => [...prev, msg]);
        scrollToBottom();
      }
    });

    on('chat:typing', (data) => {
      if (data.isTyping) {
        setTypingUsers(prev => [...prev.filter(u => u.userId !== data.userId), data]);
      } else {
        setTypingUsers(prev => prev.filter(u => u.userId !== data.userId));
      }
    });

    return () => {
      off('chat:newMessage');
      off('chat:typing');
    };
  }, [activeRoom?.id]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeRoom) return;

    try {
      const res = await api.post(`/chat/rooms/${activeRoom.id}/messages`, {
        content: newMessage.trim()
      });

      // Emit via WebSocket for real-time
      emit('chat:message', {
        ...res.data.message,
        roomId: activeRoom.id
      });

      setNewMessage('');
      emit('chat:typing', { roomId: activeRoom.id, isTyping: false });
    } catch (error) {
      console.error('Send message error:', error);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !activeRoom) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const uploadRes = await api.post('/chat/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const { url, type, name } = uploadRes.data.file;
      const msgContent = type === 'image' ? `[Image: ${name}]` : `[File: ${name}]`;

      const res = await api.post(`/chat/rooms/${activeRoom.id}/messages`, {
        content: msgContent,
        messageType: type,
        fileUrl: url
      });

      emit('chat:message', {
        ...res.data.message,
        roomId: activeRoom.id
      });
    } catch (error) {
      console.error('File upload error:', error);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    if (activeRoom) {
      emit('chat:typing', { roomId: activeRoom.id, isTyping: true });
      
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        emit('chat:typing', { roomId: activeRoom.id, isTyping: false });
      }, 2000);
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'text-yellow-400';
      case 'educator': return 'text-green-400';
      default: return 'text-primary-400';
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin': return 'badge badge-yellow';
      case 'educator': return 'badge badge-green';
      default: return '';
    }
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
        <div className="flex items-center gap-3">
          {/* Mobile sidebar toggle */}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden btn btn-ghost p-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div>
            <h1 className="text-3xl font-black text-white uppercase tracking-wider">Community</h1>
            <p className="text-gray-400 mt-1">Private trading discussion rooms</p>
          </div>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${connected ? 'border-green-500/30 bg-green-500/10' : 'border-red-500/30 bg-red-500/10'}`}>
          <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
          <span className={`text-xs font-bold ${connected ? 'text-green-400' : 'text-red-400'}`}>
            {connected ? 'CONNECTED' : 'RECONNECTING...'}
          </span>
        </div>
      </div>

      <div className="flex gap-4 h-[calc(100vh-220px)]">
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/60 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Room List (sidebar) */}
        <div className={`
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:relative
          fixed left-0 top-0 bottom-0 z-50 md:z-auto
          w-64 flex-shrink-0 card p-0 overflow-hidden flex flex-col
          transition-transform duration-300 ease-in-out
          md:w-64
        `}>
          <div className="p-4 border-b border-primary-500/10 flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Channels</h3>
            <button onClick={() => setSidebarOpen(false)} className="md:hidden text-gray-500 hover:text-gray-300">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {rooms.map(room => (
              <button
                key={room.id}
                onClick={() => { setActiveRoom(room); setSidebarOpen(false); }}
                className={`w-full text-left px-3 py-3 rounded-lg transition-all ${
                  activeRoom?.id === room.id
                    ? 'bg-primary-500/10 text-primary-300 border border-primary-500/30'
                    : 'text-gray-400 hover:bg-dark-700/50 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">#</span>
                  <div className="min-w-0">
                    <p className="text-sm font-bold truncate">{room.name}</p>
                    {room.description && (
                      <p className="text-[10px] text-gray-600 truncate">{room.description}</p>
                    )}
                  </div>
                </div>
                {room.requiredTier && room.requiredTier !== 'none' && (
                  <span className="text-[9px] uppercase tracking-wider text-yellow-500/70 ml-6">
                    {room.requiredTier}+
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 card p-0 overflow-hidden flex flex-col">
          {activeRoom ? (
            <>
              {/* Room Header */}
              <div className="p-4 border-b border-primary-500/10 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">#{activeRoom.name}</h3>
                  <p className="text-xs text-gray-500">{activeRoom.description}</p>
                </div>
                {activeRoom.pinnedMessage && (
                  <div className="text-xs text-yellow-400 bg-yellow-400/10 px-3 py-1 rounded-lg border border-yellow-400/20">
                    📌 {activeRoom.pinnedMessage.substring(0, 50)}...
                  </div>
                )}
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-600">
                    <span className="text-4xl mb-2">💬</span>
                    <p className="font-bold">No messages yet</p>
                    <p className="text-sm">Be the first to start the conversation!</p>
                  </div>
                ) : (
                  messages.map((msg, idx) => (
                    <div key={msg.id || idx} className={`flex gap-3 group ${msg.isDeleted ? 'opacity-50' : ''}`}>
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                        msg.sender?.role === 'admin' ? 'bg-yellow-500/20 text-yellow-400' :
                        msg.sender?.role === 'educator' ? 'bg-green-500/20 text-green-400' :
                        'bg-primary-500/20 text-primary-400'
                      }`}>
                        {(msg.sender?.firstName || '?')[0].toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-sm font-bold ${getRoleColor(msg.sender?.role)}`}>
                            {msg.sender?.firstName} {msg.sender?.lastName}
                          </span>
                          {msg.sender?.role !== 'client' && (
                            <span className={`text-[9px] px-1.5 py-0.5 rounded ${getRoleBadge(msg.sender?.role)}`}>
                              {msg.sender?.role}
                            </span>
                          )}
                          <span className="text-[10px] text-gray-600">
                            {new Date(msg.createdAt || msg.timestamp).toLocaleTimeString()}
                          </span>
                          {msg.isPinned && <span className="text-[10px] text-yellow-400">📌</span>}
                        </div>
                        <p className="text-sm text-gray-300 break-words">
                          {msg.messageType === 'image' && msg.fileUrl ? (
                            <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer">
                              <img src={msg.fileUrl} alt="uploaded" className="max-w-[300px] max-h-[200px] rounded-lg mt-1 border border-primary-500/10" />
                            </a>
                          ) : msg.messageType === 'file' && msg.fileUrl ? (
                            <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-3 py-2 bg-dark-700 rounded-lg border border-primary-500/10 hover:border-primary-500/30 transition-colors mt-1">
                              <svg className="w-4 h-4 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              <span className="text-sm text-primary-400">{msg.content}</span>
                            </a>
                          ) : (
                            msg.content
                          )}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Typing indicator */}
              {typingUsers.length > 0 && (
                <div className="px-4 py-1 text-xs text-gray-500 italic">
                  {typingUsers.map(u => u.firstName).join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
                </div>
              )}

              {/* Input */}
              <form onSubmit={handleSend} className="p-4 border-t border-primary-500/10">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={handleTyping}
                    placeholder={`Message #${activeRoom.name}...`}
                    className="input flex-1"
                    maxLength={2000}
                  />
                  {/* File upload */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileUpload}
                    className="hidden"
                    accept="image/*,.pdf,.doc,.docx"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="btn btn-ghost px-3"
                    title="Upload file"
                  >
                    {uploading ? (
                      <svg className="w-5 h-5 animate-spin text-gray-400" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                    )}
                  </button>
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="btn btn-primary px-6"
                  >
                    Send
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-600">
              <p>Select a channel to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Community;
