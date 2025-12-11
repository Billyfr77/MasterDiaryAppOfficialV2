import React from 'react';
import { motion } from 'framer-motion';
import { FileText, CheckSquare, MessageSquare, Truck, Clipboard, Bell, User, Zap, GitFork, Clock } from 'lucide-react';

export default function WorkflowSidebar({ onNodeClick, setShowSidebar }) {
  const onDragStart = (event, nodeType, label) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.setData('application/reactflow-label', label);
    event.dataTransfer.effectAllowed = 'move';
  };

  const nodeTypes = [
    { type: 'input', label: 'Start Trigger', icon: Zap, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20', desc: 'Begins the workflow' },
    { type: 'decision', label: 'Logic / Split', icon: GitFork, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20', desc: 'Conditional branching (Yes/No)' },
    { type: 'default', label: 'Standard Task', icon: Clipboard, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', desc: 'General purpose action' },
    { type: 'delay', label: 'Delay / Wait', icon: Clock, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', desc: 'Pause workflow for a set duration' },
    { type: 'resourceAction', label: 'Resource Allocate', icon: Truck, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', desc: 'Schedule staff or equipment' },
    { type: 'milestone', label: 'Milestone', icon: Bell, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', desc: 'Key project event' },
    { type: 'approval', label: 'Approval', icon: User, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20', desc: 'Requires sign-off' },
    { type: 'notification', label: 'Notification', icon: MessageSquare, color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', desc: 'Sends an alert' },
    { type: 'output', label: 'End Goal', icon: CheckSquare, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', desc: 'Completes the flow' },
  ];

  return (
    <aside className="w-72 bg-slate-900 border-r border-slate-800 flex flex-col h-full z-20 shadow-2xl overflow-hidden">
      <div className="p-6 border-b border-slate-800 bg-slate-900/50">
        <h2 className="text-white font-black text-lg tracking-tight">Toolkit</h2>
        <p className="text-slate-500 text-xs mt-1 font-medium">Drag or Tap nodes to build</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {nodeTypes.map((node) => (
          <motion.div
            key={node.label}
            whileHover={{ scale: 1.02, x: 4 }}
            whileTap={{ scale: 0.98 }}
            onDragStart={(event) => onDragStart(event, node.type, node.label)}
            onClick={() => onNodeClick && onNodeClick(node.type, node.label)}
            draggable
            className={`
              flex items-center gap-4 p-4 rounded-xl border ${node.border} ${node.bg} 
              cursor-grab active:cursor-grabbing hover:bg-slate-800 transition-all duration-200
              group shadow-sm hover:shadow-md touch-manipulation
            `}
            title={node.desc}
          >
            <div className={`p-2.5 rounded-lg bg-slate-900 border border-slate-700/50 shadow-inner ${node.color}`}>
              <node.icon size={18} />
            </div>
            <div className="flex flex-col">
              <span className="text-slate-200 text-sm font-bold">{node.label}</span>
              <span className="text-slate-500 text-[10px] font-medium uppercase tracking-wider">{node.type}</span>
            </div>
          </motion.div>
        ))}

        <div className="mt-8 p-5 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-white/5 rounded-bl-full -mr-8 -mt-8 pointer-events-none" />
          <h3 className="text-white text-sm font-bold mb-3 relative z-10">Pro Tips</h3>
          <ul className="text-slate-400 text-xs space-y-2 list-disc list-inside relative z-10 font-medium">
            <li>Connect <span className="text-green-400">Triggers</span> to start flows</li>
            <li>Use <span className="text-purple-400">Approvals</span> to pause for sign-off</li>
            <li><span className="text-yellow-400">Milestones</span> track major progress</li>
          </ul>
        </div>
      </div>
    </aside>
  );
}