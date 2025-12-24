import React from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, CheckSquare, MessageSquare, Truck, Clipboard, 
  Bell, User, Zap, GitFork, Clock, CreditCard, ShieldCheck, 
  BookOpen, Sparkles, Wand2, AlertTriangle 
} from 'lucide-react';

export default function WorkflowSidebar({ onNodeClick, setShowSidebar }) {
  const onDragStart = (event, nodeType, label) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.setData('application/reactflow-label', label);
    event.dataTransfer.effectAllowed = 'move';
  };

  const categories = [
    {
      name: 'Core & Logic',
      items: [
        { type: 'trigger', label: 'Start Trigger', icon: Zap, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', desc: 'Begins the workflow on event' },
        { type: 'decision', label: 'Logic / Split', icon: GitFork, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20', desc: 'Conditional branching (Yes/No)' },
        { type: 'default', label: 'Standard Task', icon: Clipboard, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', desc: 'General purpose action' },
        { type: 'milestone', label: 'Milestone', icon: Bell, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', desc: 'Key project event' },
        { type: 'approval', label: 'Approval Gate', icon: User, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20', desc: 'Requires manual sign-off' },
      ]
    },
    {
      name: 'App Integrations',
      items: [
        { type: 'invoiceNode', label: 'Invoice Engine', icon: CreditCard, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', desc: 'Auto-generate or track invoices' },
        { type: 'safetyNode', label: 'Safety Document', icon: ShieldCheck, color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20', desc: 'SWMS and Compliance checks' },
        { type: 'resourceNode', label: 'Resource Sync', icon: Truck, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', desc: 'Allocate staff or equipment' },
        { type: 'diaryNode', label: 'Diary Logger', icon: BookOpen, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', desc: 'Log entries or site delays' },
        { type: 'quoteNode', label: 'Quote Link', icon: FileText, color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', desc: 'Track estimation status' },
        { type: 'forensicNode', label: 'Forensic Audit', icon: AlertTriangle, color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20', desc: 'Deep financial risk scan' },
        { type: 'delayNode', label: 'Logic Delay', icon: Clock, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20', desc: 'Temporal flow control' },
      ]
    },
    {
      name: 'Network & Hub',
      items: [
        { type: 'wormholeNode', label: 'Wormhole', icon: Zap, color: 'text-fuchsia-400', bg: 'bg-fuchsia-500/10', border: 'border-fuchsia-500/20', desc: 'Bridge to other workflows' },
        { type: 'mapNode', label: 'Geofence', icon: MapPin, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', desc: 'Location-based logic' },
        { type: 'clientNode', label: 'Client Hub', icon: User, color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', desc: 'Direct link to CRM' },
        { type: 'variationNode', label: 'Variation', icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', desc: 'Track financial variations' },
      ]
    }
  ];

  return (
    <aside className="w-72 bg-slate-900 border-r border-slate-800 flex flex-col h-full z-20 shadow-2xl overflow-hidden">
      <div className="p-6 border-b border-slate-800 bg-slate-900/50">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-indigo-400" />
            <h2 className="text-white font-black text-lg tracking-tight uppercase">Toolkit</h2>
          </div>
          {/* MASTERPIECE: KEYBOARD SHORTCUT BADGES */}
          <div className="flex gap-1">
              {['S', 'P', 'F', 'C'].map(k => (
                  <span key={k} className="w-4 h-4 rounded bg-white/5 border border-white/10 text-[8px] font-black text-slate-500 flex items-center justify-center" title="Architect Shortcut">{k}</span>
              ))}
          </div>
        </div>
        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Architectural Components</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {categories.map((cat, idx) => (
          <div key={cat.name} className={idx > 0 ? 'mt-8' : ''}>
            <h3 className="px-2 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center justify-between">
              {cat.name}
              <div className="h-px bg-slate-800 flex-1 ml-4" />
            </h3>
            
            <div className="space-y-2">
              {cat.items.map((node) => (
                <motion.div
                  key={node.label}
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  onDragStart={(event) => onDragStart(event, node.type, node.label)}
                  onClick={() => onNodeClick && onNodeClick(node.type, node.label)}
                  draggable
                  className={`
                    flex items-center gap-4 p-3 rounded-xl border ${node.border} ${node.bg} 
                    cursor-grab active:cursor-grabbing hover:bg-slate-800 transition-all duration-200
                    group shadow-sm hover:shadow-md touch-manipulation relative overflow-hidden
                    hover:border-opacity-100 hover:${node.color.replace('text-', 'border-').replace('400', '500/50')}
                  `}
                  title={node.desc}
                >
                  <div className="absolute top-0 right-0 p-1 opacity-0 group-hover:opacity-10 transition-opacity">
                     <node.icon size={40} />
                  </div>
                  
                  <div className={`p-2.5 rounded-lg bg-slate-900 border border-slate-700/50 shadow-inner ${node.color} relative z-10`}>
                    <node.icon size={18} />
                  </div>
                  <div className="flex flex-col relative z-10">
                    <span className="text-slate-200 text-xs font-bold">{node.label}</span>
                    <span className="text-slate-500 text-[8px] font-black uppercase tracking-widest">{node.type.replace('Node', '')}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}

        <div className="mt-12 p-5 bg-indigo-600/5 rounded-2xl border border-indigo-500/20 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <h3 className="text-white text-xs font-black uppercase tracking-widest mb-3 flex items-center gap-2">
            <Wand2 size={14} className="text-indigo-400" /> AI Design Tip
          </h3>
          <p className="text-slate-400 text-[10px] font-medium leading-relaxed relative z-10">
            Drag a <span className="text-emerald-400 font-bold">Invoice Engine</span> node to automatically trigger billing when a project phase reaches completion.
          </p>
        </div>
      </div>
    </aside>
  );
}