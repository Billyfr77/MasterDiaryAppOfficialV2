import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Command, ArrowRight, Zap, FileText, Map, Briefcase } from 'lucide-react';

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
    { id: 'pulse', label: 'Go to Pulse Dashboard', icon: <Zap size={18} />, path: '/pulse' },
    { id: 'projects', label: 'View Projects', icon: <Briefcase size={18} />, path: '/projects' },
    { id: 'map', label: 'Open Map Builder', icon: <Map size={18} />, path: '/map-builder' },
    { id: 'reports', label: 'Generate Reports', icon: <FileText size={18} />, path: '/reports' },
    { id: 'quotes', label: 'Create Quote', icon: <FileText size={18} />, path: '/quotes' },
  ];

  const filteredActions = actions.filter(action =>
    action.label.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (path) => {
    navigate(path);
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
            className="relative w-full max-w-lg bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden flex flex-col"
          >
            <div className="flex items-center px-4 py-3 border-b border-white/10">
              <Search className="text-slate-400 w-5 h-5 mr-3" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type a command or search..."
                className="flex-1 bg-transparent text-white placeholder-slate-500 focus:outline-none text-lg"
                autoFocus
              />
              <div className="flex items-center gap-1 text-xs text-slate-500 font-mono bg-slate-800/50 px-2 py-1 rounded">
                <span className="text-[10px]">ESC</span>
              </div>
            </div>

            <div className="max-h-[300px] overflow-y-auto p-2 custom-scrollbar">
              {filteredActions.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-sm">
                  No results found.
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredActions.map((action, index) => (
                    <button
                      key={action.id}
                      onClick={() => handleSelect(action.path)}
                      className="w-full flex items-center justify-between px-3 py-3 hover:bg-white/10 rounded-lg group transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-indigo-400 group-hover:text-white transition-colors">
                          {action.icon}
                        </span>
                        <span className="text-slate-300 group-hover:text-white font-medium">
                          {action.label}
                        </span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <div className="px-4 py-2 bg-slate-950/50 border-t border-white/5 text-[10px] text-slate-500 flex justify-between items-center">
               <span>MasterDiary OS</span>
               <div className="flex gap-2">
                 <span>Navigate <kbd className="font-mono bg-slate-800 px-1 rounded text-slate-400">↑↓</kbd></span>
                 <span>Select <kbd className="font-mono bg-slate-800 px-1 rounded text-slate-400">↵</kbd></span>
               </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CommandPalette;
