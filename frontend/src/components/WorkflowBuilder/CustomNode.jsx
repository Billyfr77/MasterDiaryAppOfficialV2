import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { 
    FileText, CheckSquare, Bell, User, Clock, Calendar, 
    CreditCard, Zap, Mail, MoreHorizontal, ListChecks, 
    Lock, Play, ArrowRight, Sparkles, AlertCircle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const NodeIcon = ({ type }) => {
  switch (type) {
    case 'input': return <Zap size={18} className="text-amber-400" />;
    case 'trigger': return <Zap size={18} className="text-amber-400" />;
    case 'action': return <Play size={18} className="text-indigo-400" />;
    case 'output': return <CheckSquare size={18} className="text-green-400" />;
    case 'milestone': return <Bell size={18} className="text-yellow-400" />;
    case 'approval': return <User size={18} className="text-purple-400" />;
    case 'delay': return <Clock size={18} className="text-cyan-400" />;
    default: return <FileText size={18} className="text-blue-400" />;
  }
};

const NodeColor = ({ type, isBorder = false, isBg = false }) => {
    if (isBorder) {
        switch (type) {
            case 'input': case 'trigger': return 'border-amber-500/50';
            case 'action': return 'border-indigo-500/50';
            case 'output': return 'border-green-500/50';
            case 'milestone': return 'border-yellow-500/50';
            case 'approval': return 'border-purple-500/50';
            case 'delay': return 'border-cyan-500/50';
            default: return 'border-blue-500/50';
        }
    }
    if (isBg) {
        switch (type) {
            case 'input': case 'trigger': return 'bg-amber-500/10';
            case 'action': return 'bg-indigo-500/10';
            case 'output': return 'bg-green-500/10';
            case 'milestone': return 'bg-yellow-500/10';
            case 'approval': return 'bg-purple-500/10';
            case 'delay': return 'bg-cyan-500/10';
            default: return 'bg-blue-500/10';
        }
    }
    switch (type) {
        case 'input': case 'trigger': return 'text-amber-400';
        case 'action': return 'text-indigo-400';
        case 'output': return 'text-green-400';
        case 'milestone': return 'text-yellow-400';
        case 'approval': return 'text-purple-400';
        case 'delay': return 'text-cyan-400';
        default: return 'text-blue-400';
    }
};

export default memo(({ data, type, selected }) => {
  const isInput = type === 'input' || type === 'trigger';
  const isOutput = type === 'output';
  const status = data.status || 'pending';
  const checklist = data.checklist || [];
  const completedItems = checklist.filter(i => i.completed).length;
  const totalItems = checklist.length;
  const progress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
  
  // Smart Config Detection
  const hasSmartConfig = (data.automation && Object.keys(data.automation).length > 0) || totalItems > 0 || data.assignee || data.deadline;

  // Styles
  let baseClasses = "relative min-w-[320px] rounded-2xl border backdrop-blur-2xl transition-all duration-300 group hover:-translate-y-1 hover:shadow-2xl";
  
  let borderColor = NodeColor({ type, isBorder: true });
  let bgGradient = 'bg-gradient-to-b from-slate-900/95 to-black';
  let shadow = selected ? `shadow-[0_0_40px_rgba(99,102,241,0.3)]` : 'shadow-lg shadow-black/50';

  // Status Overrides
  if (status === 'completed') {
      borderColor = 'border-emerald-500/60';
      shadow = 'shadow-[0_0_20px_rgba(16,185,129,0.2)]';
  } else if (status === 'error') {
      borderColor = 'border-red-500/60';
      shadow = 'shadow-[0_0_20px_rgba(239,68,68,0.2)]';
  } else if (selected) {
      borderColor = 'border-white/40';
      bgGradient = 'bg-slate-900';
  }

  return (
    <motion.div 
      initial={{ scale: 0.9, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      className={`${baseClasses} ${borderColor} ${bgGradient} ${shadow}`}
    >
      <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
          {/* Header Stripe */}
          <div className={`absolute top-0 left-0 right-0 h-1 ${NodeColor({ type }).replace('text-', 'bg-')}`} />
          
          {/* MASTERPIECE: PULSE FLASH OVERLAY */}
          <AnimatePresence>
              {data.isSimulating && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0] }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    className="absolute inset-0 bg-white/20 z-30"
                  />
              )}
          </AnimatePresence>

          {/* MASTERPIECE: SHORT CIRCUIT (ERROR) FLASH */}
          <AnimatePresence>
              {data.simulationError && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0, 1, 0] }}
                    transition={{ duration: 0.4, repeat: Infinity }}
                    className="absolute inset-0 bg-red-500/30 z-30"
                  />
              )}
          </AnimatePresence>

          {/* Active Pulse Overlay */}
          {status === 'in-progress' && (
              <motion.div 
                className="absolute inset-0 border border-blue-400/30 z-20 pointer-events-none box-border"
                initial={{ opacity: 0.5, scale: 1 }}
                animate={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
          )}
      </div>

      {/* Blocked Overlay */}
      {status === 'error' && (
          <div className="absolute top-2 right-2 z-30">
              <div className="bg-red-500/20 p-1.5 rounded-lg border border-red-500 text-red-500 animate-pulse">
                  <Lock size={14} />
              </div>
          </div>
      )}

      {/* Handles */}
      {!isInput && (
        <Handle 
          type="target" 
          position={Position.Left} 
          className="!bg-slate-900 !w-4 !h-4 !-left-2 !border-[3px] !border-white/20 hover:!bg-indigo-400 transition-all z-50 cursor-crosshair shadow-lg" 
        />
      )}

      {/* Main Content */}
      <div className="p-5 relative z-10">
        <div className="flex items-start gap-4 mb-4">
            <div className={`p-3 rounded-xl border border-white/5 shadow-inner ${NodeColor({ type, isBg: true })}`}>
                <NodeIcon type={type} />
            </div>
            
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                    <h3 className="text-white font-bold text-base truncate tracking-tight">{data.label || 'Task Node'}</h3>
                    <MoreHorizontal size={16} className="text-slate-600 hover:text-white cursor-pointer transition-colors" />
                </div>
                <div className="flex items-center gap-2 mt-1">
                    <p className={`text-[10px] uppercase tracking-widest font-bold ${NodeColor({ type })}`}>
                        {type.toUpperCase()}
                    </p>
                    {hasSmartConfig && (
                        <div className="px-1.5 py-0.5 rounded-md bg-white/10 border border-white/10 flex items-center gap-1" title="Smart Configuration Active">
                            <Sparkles size={8} className="text-indigo-400" />
                            <span className="text-[8px] font-bold text-indigo-300 uppercase">Smart</span>
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Data Body */}
        <div className="space-y-3">
            {data.description && (
                <p className="text-slate-400 text-xs leading-relaxed line-clamp-2">
                    {data.description}
                </p>
            )}

            {/* Checklist Progress Bar */}
            {totalItems > 0 && (
                <div className="space-y-1.5 bg-slate-800/50 p-2 rounded-lg border border-white/5">
                    <div className="flex justify-between items-end">
                        <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1 tracking-wider">
                            <ListChecks size={12} /> Checklist
                        </span>
                        <span className="text-[10px] font-mono font-bold text-indigo-300">{completedItems}/{totalItems}</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-white/5">
                        <div 
                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500" 
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Metadata Row */}
            <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                    {data.assignee ? (
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-slate-800 border border-white/10">
                            <div className="w-4 h-4 rounded-full bg-indigo-500 flex items-center justify-center text-[8px] font-bold text-white">
                                {data.assignee.charAt(0)}
                            </div>
                            <span className="text-[10px] text-slate-300 font-bold max-w-[80px] truncate">{data.assignee}</span>
                        </div>
                    ) : (
                        type !== 'trigger' && type !== 'input' && (
                            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full border border-dashed border-slate-700 opacity-60">
                                <User size={10} className="text-slate-500" />
                                <span className="text-[10px] text-slate-500 font-medium">Unassigned</span>
                            </div>
                        )
                    )}
                </div>

                {data.deadline && (
                    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full border ${
                        new Date(data.deadline) < new Date() && status !== 'completed'
                        ? 'bg-red-500/10 border-red-500/30 text-red-400'
                        : 'bg-slate-800 border-white/10 text-slate-400'
                    }`}>
                        <Calendar size={10} />
                        <span className="text-[10px] font-mono font-bold">
                            {new Date(data.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                    </div>
                )}
            </div>
        </div>

        {/* Status Footer */}
        <div className="flex items-center justify-between pt-3 mt-3 border-t border-white/5">
            <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${
                    status === 'completed' ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 
                    status === 'in-progress' ? 'bg-blue-500 animate-pulse' : 
                    status === 'error' ? 'bg-red-500' : 'bg-slate-600'
                }`} />
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">{status}</span>
            </div>
            
            {/* Context Action */}
            {type === 'action' && data.actionType === 'create_quote' && (
                <button 
                    onClick={(e) => { e.stopPropagation(); window.location.href = '/quotes/new'; }}
                    className="flex items-center gap-1 text-[9px] font-bold text-indigo-400 hover:text-indigo-300 uppercase tracking-wider group/btn"
                >
                    Quote <ArrowRight size={10} className="group-hover/btn:translate-x-0.5 transition-transform" />
                </button>
            )}
        </div>
      </div>

      {!isOutput && (
        <Handle 
          type="source" 
          position={Position.Right} 
          className="!bg-slate-900 !w-4 !h-4 !-right-2 !border-[3px] !border-white/20 hover:!bg-indigo-400 transition-all z-50 cursor-crosshair shadow-lg" 
        />
      )}
    </motion.div>
  );
});
