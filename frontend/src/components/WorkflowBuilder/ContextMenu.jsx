import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, GitFork, Clipboard, Bell, User, CheckSquare, FileText, Calendar, Search } from 'lucide-react';

export default function ContextMenu({ x, y, onClose, onAddNode }) {
  const menuRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    // Focus search on open
    if(inputRef.current) inputRef.current.focus();
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const items = [
    { label: 'General', items: [
        { label: 'Start Trigger', type: 'input', icon: Zap, color: 'text-yellow-400' },
        { label: 'Task', type: 'default', icon: Clipboard, color: 'text-blue-400' },
        { label: 'Logic / Split', type: 'decision', icon: GitFork, color: 'text-orange-400' },
    ]},
    { label: 'Integrations', items: [
        { label: 'Quote Action', type: 'quoteAction', icon: FileText, color: 'text-emerald-400' },
        { label: 'Diary Entry', type: 'diaryAction', icon: Calendar, color: 'text-purple-400' },
    ]},
    { label: 'Management', items: [
        { label: 'Approval', type: 'approval', icon: User, color: 'text-pink-400' },
        { label: 'Milestone', type: 'milestone', icon: Bell, color: 'text-yellow-500' },
        { label: 'End Goal', type: 'output', icon: CheckSquare, color: 'text-green-500' },
    ]}
  ];

  return (
    <motion.div
      ref={menuRef}
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.1 }}
      style={{ top: y, left: x }}
      className="absolute z-50 w-64 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden flex flex-col"
    >
      {/* Search Header */}
      <div className="p-3 border-b border-white/5 relative">
        <Search size={14} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" />
        <input 
            ref={inputRef}
            type="text" 
            placeholder="Search nodes..." 
            className="w-full bg-slate-800/50 border border-white/5 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
        />
      </div>

      <div className="overflow-y-auto max-h-[300px] p-2 custom-scrollbar">
        {items.map((group, i) => (
            <div key={i} className="mb-3 last:mb-0">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2 mb-1">
                    {group.label}
                </div>
                <div className="space-y-0.5">
                    {group.items.map((item) => (
                        <button
                            key={item.label}
                            onClick={() => onAddNode(item.type, item.label)}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-indigo-500/20 hover:text-white text-slate-300 transition-colors group text-left"
                        >
                            <div className={`p-1 rounded bg-slate-800 border border-white/5 group-hover:border-indigo-500/30 ${item.color}`}>
                                <item.icon size={14} />
                            </div>
                            <span className="text-xs font-medium">{item.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        ))}
      </div>
      
      <div className="p-2 bg-black/20 text-[10px] text-slate-600 text-center border-t border-white/5">
        Press <span className="font-mono text-slate-400">ESC</span> to close
      </div>
    </motion.div>
  );
}
