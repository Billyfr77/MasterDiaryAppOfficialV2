import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Command, ArrowRight, Zap, FileText, Map, Briefcase, Plus, User, CreditCard } from 'lucide-react';

const CommandPalette = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  // Toggle with Ctrl+K or Cmd+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const actions = [
    { id: 'pulse', label: 'Go to Pulse Dashboard', icon: <Zap size={18} />, path: '/pulse', section: 'Navigation' },
    { id: 'projects', label: 'View Projects', icon: <Briefcase size={18} />, path: '/projects', section: 'Navigation' },
    { id: 'map', label: 'Open Map Builder', icon: <Map size={18} />, path: '/map-builder', section: 'Navigation' },
    { id: 'reports', label: 'Generate Reports', icon: <FileText size={18} />, path: '/reports', section: 'Navigation' },
    { id: 'invoices', label: 'Invoices', icon: <CreditCard size={18} />, path: '/invoices', section: 'Navigation' },
    
    // Quick Actions
    { id: 'new-quote', label: 'Create New Quote', icon: <Plus size={18} />, path: '/quotes/builder', section: 'Actions' },
    { id: 'new-project', label: 'Create New Project', icon: <Plus size={18} />, path: '/projects', state: { create: true }, section: 'Actions' },
    { id: 'add-staff', label: 'Add Staff Member', icon: <User size={18} />, path: '/staff', state: { create: true }, section: 'Actions' },
  ];

  const filteredActions = actions.filter(action =>
    action.label.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (action) => {
    navigate(action.path, { state: action.state });
    setIsOpen(false);
    setQuery('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh] px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-lg glass-panel rounded-2xl overflow-hidden flex flex-col shadow-2xl ring-1 ring-white/10"
          >
            <div className="flex items-center px-4 py-4 border-b border-white/10">
              <Search className="text-gray-400 w-5 h-5 mr-3" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="What do you need?"
                className="flex-1 bg-transparent text-white placeholder-gray-500 focus:outline-none text-lg font-medium"
                autoFocus
              />
              <div className="flex items-center gap-1 text-xs text-gray-500 font-mono bg-white/5 px-2 py-1 rounded border border-white/5">
                <span className="text-[10px]">ESC</span>
              </div>
            </div>

            <div className="max-h-[400px] overflow-y-auto p-2 custom-scrollbar">
              {filteredActions.length === 0 ? (
                <div className="text-center py-12 text-gray-500 text-sm">
                  No results found.
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredActions.map((action, index) => (
                    <button
                      key={action.id}
                      onClick={() => handleSelect(action)}
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/10 rounded-xl group transition-all duration-200 text-left"
                    >
                      <div className="flex items-center gap-4">
                        <span className={`p-2 rounded-lg ${action.section === 'Actions' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-indigo-500/10 text-indigo-400'} group-hover:scale-110 transition-transform`}>
                          {action.icon}
                        </span>
                        <span className="text-gray-200 group-hover:text-white font-medium text-sm">
                          {action.label}
                        </span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-indigo-400 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <div className="px-4 py-2 bg-black/40 border-t border-white/5 text-[10px] text-gray-500 flex justify-between items-center font-medium">
               <span className="flex items-center gap-1"><Command size={10} /> MasterDiary OS</span>
               <div className="flex gap-2">
                 <span>Navigate <kbd className="font-mono bg-white/10 px-1.5 py-0.5 rounded text-gray-300">↑↓</kbd></span>
                 <span>Select <kbd className="font-mono bg-white/10 px-1.5 py-0.5 rounded text-gray-300">↵</kbd></span>
               </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CommandPalette;
