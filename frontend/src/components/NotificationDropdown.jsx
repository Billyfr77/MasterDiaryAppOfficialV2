import React, { useState, useEffect } from 'react';
import { Bell, AlertTriangle, Info, CheckCircle, X } from 'lucide-react';
import axios from 'axios';

const NotificationDropdown = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Poll for notifications every 60 seconds
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get('/api/notifications'); // We will create this endpoint
      setNotifications(response.data);
      setUnreadCount(response.data.filter(n => !n.isRead).length);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
      // Fallback/Demo data if API fails (so UI shows something)
      // setNotifications([
      //   { id: 1, type: 'WARNING', title: 'Profit Leak Detected', message: 'Project "Riverside" is 15% over budget.', isRead: false, createdAt: new Date().toISOString() }
      // ]);
      // setUnreadCount(1);
    }
  };

  const markAsRead = async (id) => {
    try {
      await axios.put(`/api/notifications/${id}/read`);
      setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking as read', error);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'WARNING': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'ALERT': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'SUCCESS': return <CheckCircle className="w-5 h-5 text-green-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div className="relative">
      {/* Bell Icon */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors rounded-full hover:bg-gray-100"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <h3 className="font-semibold text-gray-800">Notifications</h3>
            <button onClick={() => setIsOpen(false)}><X className="w-4 h-4 text-gray-400 hover:text-gray-600" /></button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <p>No new alerts.</p>
              </div>
            ) : (
              notifications.map((note) => (
                <div 
                  key={note.id} 
                  className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors flex gap-3 ${!note.isRead ? 'bg-blue-50/50' : ''}`}
                  onClick={() => markAsRead(note.id)}
                >
                  <div className="mt-1 flex-shrink-0">
                    {getIcon(note.type)}
                  </div>
                  <div className="flex-1">
                    <h4 className={`text-sm font-medium ${!note.isRead ? 'text-gray-900' : 'text-gray-600'}`}>
                      {note.title}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">{note.message}</p>
                    <span className="text-[10px] text-gray-400 mt-2 block">
                      {new Date(note.createdAt).toLocaleString()}
                    </span>
                  </div>
                  {!note.isRead && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  )}
                </div>
              ))
            )}
          </div>
          
          <div className="p-2 border-t border-gray-100 bg-gray-50 text-center">
            <button className="text-xs text-blue-600 hover:text-blue-800 font-medium">
              View All History
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
