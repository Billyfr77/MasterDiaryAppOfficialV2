import React, { useState, useEffect, useRef } from 'react';
import { Bell, AlertTriangle, Info, CheckCircle, X, Sparkles, Zap, ShieldAlert, TrendingUp, Filter, Target, Activity, CheckSquare, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../utils/api';

// Neural Hub Notification Component
const NotificationDropdown = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeTab, setActiveTab] = useState('stream'); // 'stream' | 'critical'
  const dropdownRef = useRef(null);

  // Poll for notifications
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // Faster polling for "Live" feel
    return () => clearInterval(interval);
  }, []);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      const data = Array.isArray(response.data) ? response.data : [];
      // Sort by newness
      data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.isRead).length);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    }
  };

  const markAsRead = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking as read', error);
    }
  };

  const markAllAsRead = async () => {
      try {
          await Promise.all(notifications.filter(n => !n.isRead).map(n => api.put(`/notifications/${n.id}/read`)));
          setNotifications(notifications.map(n => ({ ...n, isRead: true })));
          setUnreadCount(0);
      } catch (e) { console.error(e); }
  };

  const deleteNotification = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n.id !== id));
      const deletedNote = notifications.find(n => n.id === id);
      if (deletedNote && !deletedNote.isRead) {
          setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Failed to delete notification', error);
    }
  };

  const clearStream = async () => {
      if(!window.confirm("Clear all notifications from the stream?")) return;
      try {
          await api.delete('/notifications');
          setNotifications([]);
          setUnreadCount(0);
      } catch(e) { console.error(e); }
  };

  const getIcon = (type) => {
    switch (type?.toUpperCase()) {
      case 'WARNING': return <ShieldAlert className="w-5 h-5 text-amber-400" />;
      case 'ERROR': case 'ALERT': return <AlertTriangle className="w-5 h-5 text-rose-500 animate-pulse" />;
      case 'SUCCESS': return <CheckCircle className="w-5 h-5 text-emerald-400" />;
      case 'INFO': return <Info className="w-5 h-5 text-cyan-400" />;
      default: return <Zap className="w-5 h-5 text-indigo-400" />;
    }
  };

  const getGlowColor = (type) => {
      switch (type?.toUpperCase()) {
          case 'WARNING': return 'shadow-[0_0_15px_rgba(251,191,36,0.2)] border-amber-500/30';
          case 'ERROR': return 'shadow-[0_0_20px_rgba(244,63,94,0.3)] border-rose-500/40';
          case 'SUCCESS': return 'shadow-[0_0_15px_rgba(52,211,153,0.2)] border-emerald-500/30';
          default: return 'hover:shadow-[0_0_15px_rgba(99,102,241,0.15)] border-white/5';
      }
  };

  const filteredNotifications = activeTab === 'critical' 
    ? notifications.filter(n => ['WARNING', 'ERROR', 'ALERT'].includes(n.type?.toUpperCase()))
    : notifications;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon Trigger */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-3 transition-all duration-500 rounded-2xl border ${isOpen ? 'bg-indigo-600/20 border-indigo-500/50 text-white shadow-[0_0_25px_rgba(99,102,241,0.4)]' : 'bg-slate-900/50 border-white/5 text-slate-400 hover:text-white hover:bg-white/10'}`}
      >
        <div className="relative z-10">
            <Bell size={20} className={unreadCount > 0 ? 'animate-wiggle text-indigo-400' : ''} />
        </div>
        
        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-500 opacity-75"></span>
            <span className="relative inline-flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[9px] font-bold text-white shadow-lg border border-indigo-400">
                {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          </div>
        )}
      </button>

      {/* Neural Hub Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.9, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: 20, scale: 0.9, filter: 'blur(10px)' }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="absolute right-0 mt-4 w-[420px] bg-[#050505]/95 backdrop-blur-3xl rounded-[2rem] shadow-[0_50px_100px_rgba(0,0,0,1)] border border-white/10 overflow-hidden z-[100] ring-1 ring-white/5"
          >
            {/* Holographic Header */}
            <div className="relative p-6 border-b border-white/5 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-transparent animate-pulse-slow"></div>
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/20 blur-[50px] rounded-full"></div>
                
                <div className="relative z-10 flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Activity size={16} className="text-indigo-400" />
                            <h3 className="text-sm font-black text-white uppercase tracking-[0.25em] drop-shadow-[0_0_10px_rgba(99,102,241,0.5)]">
                                Neural Command
                            </h3>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="flex h-2 w-2 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <p className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">
                                Lattice Active • {unreadCount} Signals
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex gap-2">
                        {notifications.length > 0 && (
                            <button 
                                onClick={clearStream}
                                className="p-2 hover:bg-rose-500/10 rounded-full text-slate-500 hover:text-rose-400 transition-all border border-transparent hover:border-rose-500/20"
                                title="Clear Stream"
                            >
                                <Trash2 size={16} />
                            </button>
                        )}
                        <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-full text-slate-500 hover:text-white transition-all">
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 mt-6 relative z-10">
                    <button 
                        onClick={() => setActiveTab('stream')}
                        className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border ${activeTab === 'stream' ? 'bg-indigo-600 text-white border-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.3)]' : 'bg-white/5 text-slate-500 border-transparent hover:bg-white/10'}`}
                    >
                        Live Stream
                    </button>
                    <button 
                        onClick={() => setActiveTab('critical')}
                        className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border ${activeTab === 'critical' ? 'bg-rose-600 text-white border-rose-400 shadow-[0_0_15px_rgba(225,29,72,0.3)]' : 'bg-white/5 text-slate-500 border-transparent hover:bg-white/10'}`}
                    >
                        Critical Intel
                    </button>
                </div>
            </div>

            {/* Content Stream */}
            <div className="max-h-[500px] overflow-y-auto custom-scrollbar bg-gradient-to-b from-transparent to-black/40">
                {filteredNotifications.length === 0 ? (
                    <div className="py-24 px-10 text-center flex flex-col items-center justify-center gap-6 relative overflow-hidden">
                         {/* Radar Animation */}
                         <div className="relative w-32 h-32 opacity-20">
                            <div className="absolute inset-0 rounded-full border border-indigo-500/30"></div>
                            <div className="absolute inset-0 rounded-full border border-indigo-500/10 scale-50"></div>
                            <div className="absolute inset-0 flex items-center justify-center animate-spin-slow">
                                <Target size={64} className="text-indigo-500 opacity-50" />
                            </div>
                         </div>
                         <div className="relative z-10">
                             <p className="text-xs font-black text-indigo-300 uppercase tracking-[0.2em] mb-1">Scanning Frequency</p>
                             <p className="text-[10px] text-slate-600 uppercase font-mono">No {activeTab} signals detected within sector.</p>
                         </div>
                    </div>
                ) : (
                    <div className="p-2 space-y-2">
                        {filteredNotifications.map((note) => (
                            <motion.div
                                key={note.id}
                                layout
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className={`
                                    relative p-4 rounded-xl border transition-all duration-300 group cursor-pointer overflow-hidden
                                    ${!note.isRead ? 'bg-indigo-500/[0.03]' : 'bg-transparent'}
                                    ${getGlowColor(note.type)}
                                `}
                                onClick={() => markAsRead(note.id)}
                            >
                                {/* Unread Pulse */}
                                {!note.isRead && (
                                    <div className="absolute top-0 bottom-0 left-0 w-[3px] bg-indigo-500 shadow-[0_0_10px_#6366f1]"></div>
                                )}
                                
                                {/* Delete Button - Individual */}
                                <button 
                                    onClick={(e) => deleteNotification(note.id, e)}
                                    className="absolute top-3 right-3 p-1.5 text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100 z-20"
                                    title="Dismiss Signal"
                                >
                                    <Trash2 size={12} />
                                </button>

                                <div className="flex gap-4 relative z-10">
                                    <div className={`
                                        w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border border-white/10 shadow-inner
                                        ${!note.isRead ? 'bg-white/10' : 'bg-black/40'}
                                    `}>
                                        {getIcon(note.type)}
                                    </div>
                                    
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className={`text-xs font-black uppercase tracking-tight truncate pr-8 ${!note.isRead ? 'text-white' : 'text-slate-500'}`}>
                                                {note.title}
                                            </h4>
                                            <span className="text-[9px] font-mono text-slate-600 whitespace-nowrap">
                                                {getTimeAgo(note.createdAt)}
                                            </span>
                                        </div>
                                        
                                        <p className="text-[11px] text-slate-400 leading-relaxed font-medium line-clamp-2 group-hover:text-slate-300 transition-colors">
                                            {note.message}
                                        </p>
                                        
                                        {/* Action Area */}
                                        <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                            <span className="text-[8px] font-black uppercase text-indigo-400 tracking-wider">
                                                SIG_ID: {String(note.id || 'NULL').slice(0,4)}
                                            </span>
                                            
                                            {/* Smart Action Buttons based on context (mocked for now) */}
                                            {note.type === 'ERROR' ? (
                                                <button className="flex items-center gap-1 text-[9px] font-bold text-rose-400 uppercase tracking-wider hover:underline">
                                                    Review Log <TrendingUp size={10} />
                                                </button>
                                            ) : (
                                                <button className="flex items-center gap-1 text-[9px] font-bold text-slate-400 hover:text-white uppercase tracking-wider transition-colors">
                                                    Details <Sparkles size={10} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Neural Footer */}
            <div className="p-4 border-t border-white/5 bg-[#0a0a0c] flex justify-between items-center">
                <button 
                    onClick={markAllAsRead}
                    disabled={unreadCount === 0}
                    className="flex items-center gap-2 text-[10px] font-bold text-slate-500 hover:text-white disabled:opacity-30 disabled:hover:text-slate-500 transition-colors uppercase tracking-widest"
                >
                    <CheckSquare size={14} /> Ack All Signals
                </button>
                <div className="flex items-center gap-1">
                     <span className="h-1 w-1 rounded-full bg-slate-700"></span>
                     <span className="h-1 w-1 rounded-full bg-slate-700"></span>
                     <span className="h-1 w-1 rounded-full bg-slate-700"></span>
                </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes wiggle {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(15deg); }
          75% { transform: rotate(-15deg); }
        }
        .animate-wiggle {
          animation: wiggle 0.4s ease-in-out infinite;
        }
        .animate-pulse-slow {
            animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .animate-spin-slow {
            animation: spin 3s linear infinite;
        }
      `}</style>
    </div>
  );
};

// Helper for relative time
function getTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
}

export default NotificationDropdown;