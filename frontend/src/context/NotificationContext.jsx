import React, { createContext, useState, useContext, useCallback } from 'react';
import { X, CheckCircle, AlertTriangle, Info, Bell } from 'lucide-react';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((type, title, message, duration = 5000) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, duration);
  }, []);

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ addNotification }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
        {notifications.map(n => (
          <div
            key={n.id}
            className="pointer-events-auto min-w-[320px] max-w-md bg-stone-900/90 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl animate-slide-in-right flex items-start gap-3 group"
          >
            <div className={`mt-1 p-1.5 rounded-full ${
              n.type === 'success' ? 'bg-emerald-500/20 text-emerald-400' :
              n.type === 'error' ? 'bg-rose-500/20 text-rose-400' :
              n.type === 'warning' ? 'bg-amber-500/20 text-amber-400' :
              'bg-blue-500/20 text-blue-400'
            }`}>
              {n.type === 'success' && <CheckCircle size={16} />}
              {n.type === 'error' && <AlertTriangle size={16} />}
              {n.type === 'warning' && <Bell size={16} />}
              {n.type === 'info' && <Info size={16} />}
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-white">{n.title}</h4>
              <p className="text-xs text-gray-400 mt-1">{n.message}</p>
            </div>
            <button 
              onClick={() => removeNotification(n.id)}
              className="text-gray-500 hover:text-white transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};
