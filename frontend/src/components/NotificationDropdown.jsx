import React, { useState, useEffect, useRef } from 'react';
import { Bell, AlertTriangle, Info, CheckCircle, X, Sparkles, Zap, ShieldAlert, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../utils/api';

const NotificationDropdown = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);

  // Poll for notifications every 30 seconds for higher fidelity
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
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
      setNotifications(Array.isArray(response.data) ? response.data : []);
      setUnreadCount(response.data.filter(n => !n.isRead).length);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    }
  };

  const markAsRead = async (id) => {
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
          // Assuming backend has a bulk read endpoint or we loop
          await Promise.all(notifications.filter(n => !n.isRead).map(n => api.put(`/notifications/${n.id}/read`)));
          setNotifications(notifications.map(n => ({ ...n, isRead: true })));
          setUnreadCount(0);
      } catch (e) { console.error(e); }
  };

  const getIcon = (type) => {
    switch (type?.toUpperCase()) {
      case 'WARNING': return <ShieldAlert className="w-4 h-4 text-amber-400" />;
      case 'ERROR': case 'ALERT': return <AlertTriangle className="w-4 h-4 text-rose-400" />;
      case 'SUCCESS': return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      case 'INFO': return <Info className="w-4 h-4 text-blue-400" />;
      default: return <Zap className="w-4 h-4 text-indigo-400" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2.5 transition-all duration-300 rounded-xl border ${isOpen ? 'bg-white/10 border-white/20 text-white shadow-[0_0_20px_rgba(255,255,255,0.1)]' : 'bg-transparent border-transparent text-gray-400 hover:text-white hover:bg-white/5'}`}
      >
        <Bell size={20} className={unreadCount > 0 ? 'animate-wiggle' : ''} />
        {unreadCount > 0 && (
          <>
            <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full shadow-[0_0_10px_#6366f1]"></span>
            <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full animate-ping"></span>
          </>
        )}
      </button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-3 w-96 bg-slate-950/95 backdrop-blur-3xl rounded-[2rem] shadow-[0_20px_80px_rgba(0,0,0,0.8)] border border-white/10 overflow-hidden z-[100]"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/5 bg-gradient-to-r from-indigo-600/10 to-transparent flex justify-between items-center">
              <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
                      <Sparkles size={14} className="text-indigo-400" /> Neural Hub
                  </h3>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">{unreadCount} Pending Intel Signals</p>
              </div>
              <div className="flex items-center gap-2">
                  <button 
                    onClick={markAllAsRead}
                    className="p-2 hover:bg-white/5 rounded-lg text-slate-500 hover:text-indigo-400 transition-colors"
                    title="Mark all as read"
                  >
                    <CheckCircle size={16} />
                  </button>
                  <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/5 rounded-lg text-slate-500 hover:text-white transition-colors">
                    <X size={16} />
                  </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="max-h-[450px] overflow-y-auto custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="py-20 px-10 text-center flex flex-col items-center gap-4">
                  <div className="p-4 bg-slate-900 rounded-2xl text-slate-700">
                      <Bell size={32} />
                  </div>
                  <div>
                      <p className="text-xs font-black text-slate-600 uppercase tracking-widest">No Intelligence Detected</p>
                      <p className="text-[10px] text-slate-700 uppercase mt-1">Operational lattice is silent.</p>
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {notifications.map((note) => (
                    <motion.div 
                      key={note.id} 
                      whileHover={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
                      className={`p-5 transition-all flex gap-4 cursor-pointer relative group ${!note.isRead ? 'bg-indigo-500/[0.03]' : ''}`}
                      onClick={() => markAsRead(note.id)}
                    >
                      {/* Read Indicator */}
                      {!note.isRead && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 shadow-[0_0_10px_#6366f1]"></div>
                      )}

                      <div className={`mt-1 flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center border border-white/5 shadow-inner ${!note.isRead ? 'bg-indigo-500/10' : 'bg-slate-900'}`}>
                        {getIcon(note.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                            <h4 className={`text-xs font-black uppercase tracking-widest truncate pr-4 ${!note.isRead ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`}>
                              {note.title}
                            </h4>
                            <span className="text-[8px] font-mono text-slate-600 whitespace-nowrap">
                                {new Date(note.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                        <p className="text-[11px] text-slate-400 font-medium leading-relaxed line-clamp-2">
                            {note.message}
                        </p>
                        
                        <div className="mt-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-[8px] font-black bg-white/5 px-1.5 py-0.5 rounded text-slate-500 uppercase tracking-tighter">OS_SIG_{note.type?.slice(0,3).toUpperCase()}</span>
                            </div>
                            <button className="text-[9px] font-black text-indigo-400 opacity-0 group-hover:opacity-100 transition-all uppercase tracking-widest flex items-center gap-1">
                                View Intel <ArrowRight size={10} />
                            </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Footer */}
            <div className="p-4 border-t border-white/5 bg-black/40 text-center">
              <button className="text-[10px] font-black text-indigo-400 hover:text-indigo-300 uppercase tracking-[0.3em] transition-colors py-2 px-8 rounded-full hover:bg-indigo-500/5">
                View Full Operational History
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes wiggle {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(10deg); }
          75% { transform: rotate(-10deg); }
        }
        .animate-wiggle {
          animation: wiggle 0.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

const ArrowRight = ({ size, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M5 12h14m-7-7 7 7-7 7" />
    </svg>
);

export default NotificationDropdown;