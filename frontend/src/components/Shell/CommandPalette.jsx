import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Command, ArrowRight, Calendar, DollarSign, Users, Wrench, Settings, LayoutDashboard } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

const CommandPalette = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const { addNotification } = useNotification();

  const actions = [
    { id: 'dash', label: 'Go to Dashboard', icon: LayoutDashboard, path: '/dashboard', type: 'nav' },
    { id: 'diary', label: 'Open Diary', icon: Calendar, path: '/diary', type: 'nav' },
    { id: 'quote', label: 'New Quote', icon: DollarSign, path: '/quotes/new', type: 'nav' },
    { id: 'staff', label: 'Manage Staff', icon: Users, path: '/staff', type: 'nav' },
    { id: 'equip', label: 'Equipment Fleet', icon: Wrench, path: '/equipment', type: 'nav' },
    { id: 'settings', label: 'System Settings', icon: Settings, path: '/settings', type: 'nav' },
    { id: 'action-sync', label: 'Sync Database', icon: ArrowRight, action: () => {
        addNotification('success', 'Database Sync', 'Synchronization completed successfully.');
    }, type: 'action' },
  ];

  const filteredActions = actions.filter(action => 
    action.label.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === 'Escape') setIsOpen(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const handleSelect = (action) => {
    if (action.type === 'nav') {
      navigate(action.path);
    } else if (action.type === 'action') {
      action.action();
    }
    setIsOpen(false);
    setQuery('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % filteredActions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredActions.length) % filteredActions.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredActions[selectedIndex]) {
        handleSelect(filteredActions[selectedIndex]);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-start justify-center pt-[20vh] bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setIsOpen(false)}>
      <div 
        className="w-full max-w-2xl bg-stone-900/90 border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-slide-up backdrop-blur-xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center px-4 py-3 border-b border-white/10">
          <Search className="text-gray-500 mr-3" size={20} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search..."
            className="flex-1 bg-transparent text-lg text-white placeholder-gray-500 focus:outline-none"
            value={query}
            onChange={e => { setQuery(e.target.value); setSelectedIndex(0); }}
            onKeyDown={handleKeyDown}
          />
          <div className="px-2 py-1 bg-white/10 rounded text-xs text-gray-400 font-mono border border-white/5">ESC</div>
        </div>
        
        <div className="max-h-[400px] overflow-y-auto p-2 custom-scrollbar">
          {filteredActions.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-sm">No results found.</div>
          ) : (
            filteredActions.map((action, index) => (
              <div
                key={action.id}
                onClick={() => handleSelect(action)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-colors ${
                  index === selectedIndex ? 'bg-indigo-600/20 border border-indigo-500/30' : 'hover:bg-white/5 border border-transparent'
                }`}
              >
                <div className={`p-2 rounded-lg ${index === selectedIndex ? 'bg-indigo-500 text-white' : 'bg-stone-800 text-gray-400'}`}>
                  <action.icon size={18} />
                </div>
                <div className="flex-1">
                  <div className={`text-sm font-bold ${index === selectedIndex ? 'text-indigo-300' : 'text-gray-200'}`}>
                    {action.label}
                  </div>
                  <div className="text-xs text-gray-500">
                    {action.type === 'nav' ? 'Go to Page' : 'Action'}
                  </div>
                </div>
                {index === selectedIndex && (
                  <ArrowRight size={16} className="text-indigo-400 animate-pulse" />
                )}
              </div>
            ))
          )}
        </div>
        
        <div className="px-4 py-2 bg-black/20 border-t border-white/5 flex justify-between items-center text-xs text-gray-500">
          <div className="flex gap-4">
            <span><strong className="text-gray-400">↑↓</strong> to navigate</span>
            <span><strong className="text-gray-400">↵</strong> to select</span>
          </div>
          <div className="flex items-center gap-1">
            <Command size={10} />
            <span>PRODUCIFY OS</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
