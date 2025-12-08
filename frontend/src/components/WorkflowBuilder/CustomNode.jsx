import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { FileText, CheckSquare, Bell, User, Clock, Calendar, CreditCard, Zap, Mail, MoreHorizontal, ListChecks, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

const NodeIcon = ({ type, status }) => {
  const colorClass = status === 'completed' ? 'text-green-400' :
                     status === 'in-progress' ? 'text-blue-400' :
                     status === 'error' ? 'text-red-400' : 
                     'text-slate-400';

  switch (type) {
    case 'input': return <Zap size={18} className="text-yellow-400" />;
    case 'output': return <CheckSquare size={18} className="text-green-400" />;
    case 'milestone': return <Bell size={18} className="text-yellow-500" />;
    case 'approval': return <User size={18} className="text-purple-400" />;
    default: return <FileText size={18} className={colorClass} />;
  }
};

export default memo(({ data, type, selected }) => {
  const isInput = type === 'input';
  const isOutput = type === 'output';
  const status = data.status || 'pending';
  const checklist = data.checklist || [];
  const completedItems = checklist.filter(i => i.completed).length;
  const totalItems = checklist.length;
  const progress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

  // Styles
  let baseClasses = "relative min-w-[300px] rounded-2xl border backdrop-blur-2xl transition-all duration-300 group hover:-translate-y-1 hover:shadow-2xl";
  
  let borderColor = 'border-white/20';
  let bgGradient = 'bg-gradient-to-b from-slate-800/90 to-slate-950/90';
  let shadow = 'shadow-lg shadow-black/50';

  if (selected) {
    borderColor = 'border-indigo-500';
    bgGradient = 'bg-gradient-to-b from-slate-800 to-slate-950';
    shadow = 'shadow-[0_0_40px_rgba(99,102,241,0.5)]';
  } else if (status === 'completed') {
    borderColor = 'border-emerald-500/50';
    bgGradient = 'bg-gradient-to-br from-emerald-950/60 to-slate-950/90';
  } else if (status === 'in-progress') {
    borderColor = 'border-blue-500/50';
    bgGradient = 'bg-gradient-to-br from-blue-950/60 to-slate-950/90';
  } else if (status === 'error') {
    borderColor = 'border-red-500/50';
    bgGradient = 'bg-gradient-to-br from-red-950/60 to-slate-950/90';
  }

  return (
    <motion.div 
      initial={{ scale: 0.9, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      className={`${baseClasses} ${borderColor} ${bgGradient} ${shadow}`}
    >
      {/* Tech Line Decoration */}
      <div className="absolute top-0 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      
      {/* Selection Glow Indicator */}
      {selected && <div className="absolute inset-0 bg-indigo-500/5 pointer-events-none rounded-2xl" />}

      {/* Active Pulse Overlay */}
      {status === 'in-progress' && (
          <motion.div 
            className="absolute inset-0 border border-blue-400/50 rounded-2xl z-20 pointer-events-none box-border"
            initial={{ opacity: 0.5, scale: 1 }}
            animate={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
      )}

      {/* Blocked Overlay */}
      {status === 'error' && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-20 flex items-center justify-center rounded-2xl">
              <div className="bg-slate-900 p-3 rounded-full border border-red-500 text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)]">
                  <Lock size={24} />
              </div>
          </div>
      )}

      {/* Handles - Larger click area */}
      {!isInput && (
        <Handle 
          type="target" 
          position={Position.Left} 
          className="!bg-slate-900 !w-4 !h-4 !-left-2 !border-[3px] !border-indigo-500 hover:!bg-indigo-400 hover:!scale-125 transition-all z-50 cursor-crosshair shadow-[0_0_10px_rgba(99,102,241,0.5)]" 
        />
      )}

      {/* Header */}
      <div className={`
        px-5 py-4 border-b border-white/5 flex items-center gap-4 relative z-10 rounded-t-2xl
        ${selected ? 'bg-indigo-500/10' : 'bg-white/5'}
      `}>
        <div className="p-2.5 rounded-xl bg-slate-900 border border-white/10 shadow-inner group-hover:border-indigo-500/50 group-hover:shadow-[0_0_15px_rgba(99,102,241,0.3)] transition-all">
          <NodeIcon type={type} status={status} />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-bold text-base truncate leading-tight tracking-tight drop-shadow-sm">
            {data.label || 'New Node'}
          </h3>
          <p className="text-indigo-300 text-[10px] uppercase tracking-widest font-bold flex items-center gap-1 mt-1 opacity-80">
            {type}
          </p>
        </div>

        {/* Integration Badges */}
        <div className="flex items-center gap-1.5">
            {data.automation?.allocateResource && (
                <div className="w-6 h-6 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.2)]" title="Resource Allocation">
                    <User size={12} className="text-amber-400" />
                </div>
            )}
            {data.automation?.createInvoice && (
                <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]" title="Invoice Integration">
                    <CreditCard size={12} className="text-emerald-400" />
                </div>
            )}
            {data.automation?.sendEmail && (
                <div className="w-6 h-6 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shadow-[0_0_10px_rgba(99,102,241,0.2)]" title="Email Notification">
                    <Mail size={12} className="text-indigo-400" />
                </div>
            )}
            <MoreHorizontal size={18} className="text-slate-500 opacity-0 group-hover:opacity-100 transition-all hover:text-white cursor-pointer" />
        </div>
      </div>

      {/* Body */}
      <div className="p-5 space-y-4 relative z-10">
        {data.description && (
          <p className="text-slate-400 text-sm leading-relaxed line-clamp-2 font-medium">
            {data.description}
          </p>
        )}

        {/* Checklist Progress */}
        {totalItems > 0 && (
            <div className="space-y-1.5 pt-1">
                <div className="flex justify-between items-end">
                    <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1 tracking-wider">
                        <ListChecks size={12} /> Checklist
                    </span>
                    <span className="text-[10px] font-mono font-bold text-indigo-300">{completedItems}/{totalItems}</span>
                </div>
                <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-white/5">
                    <div 
                        className="h-full bg-gradient-to-r from-indigo-600 to-purple-500 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" 
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>
        )}

        <div className="flex items-center justify-between pt-2">
           {/* Assignee */}
           {data.assignee ? (
            <div className="flex items-center gap-2 bg-slate-800/80 rounded-full pr-3 pl-1 py-1 border border-white/10 hover:border-indigo-500/50 transition-colors">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[10px] text-white font-bold shadow-lg">
                {data.assignee.charAt(0)}
              </div>
              <span className="text-slate-200 text-[11px] font-bold truncate max-w-[100px]">{data.assignee}</span>
            </div>
           ) : (
             <div className="flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity cursor-pointer">
               <div className="w-6 h-6 rounded-full border border-dashed border-slate-500 flex items-center justify-center bg-slate-900">
                 <User size={12} className="text-slate-400" />
               </div>
               <span className="text-[11px] text-slate-400 font-medium">Unassigned</span>
             </div>
           )}

           {/* Deadline */}
           {data.deadline && (
             <div className={`
               flex items-center gap-2 px-2.5 py-1 rounded-full border shadow-sm
               ${new Date(data.deadline) < new Date() && status !== 'completed' 
                 ? 'bg-red-500/10 border-red-500/30 text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.2)]' 
                 : 'bg-slate-800/80 border-white/10 text-slate-300'}
             `}>
               <Calendar size={12} />
               <span className="text-[11px] font-mono font-bold">
                 {new Date(data.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
               </span>
             </div>
           )}
        </div>
      </div>

      {/* Progress Line */}
      {status === 'in-progress' && (
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-slate-800 rounded-b-2xl overflow-hidden">
           <motion.div 
             className="h-full bg-cyan-400 shadow-[0_0_15px_#22d3ee]" 
             initial={{ width: "0%" }}
             animate={{ width: "100%" }}
             transition={{ duration: 2, repeat: Infinity }}
           />
        </div>
      )}

      {!isOutput && (
        <Handle 
          type="source" 
          position={Position.Right} 
          className="!bg-slate-900 !w-4 !h-4 !-right-2 !border-[3px] !border-indigo-500 hover:!bg-indigo-400 hover:!scale-125 transition-all z-50 cursor-crosshair shadow-[0_0_10px_rgba(99,102,241,0.5)]" 
        />
      )}
    </motion.div>
  );
});