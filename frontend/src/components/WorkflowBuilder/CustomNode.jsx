import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { 
    FileText, CheckSquare, Bell, User, Clock, Calendar, 
    CreditCard, Zap, Mail, MoreHorizontal, ListChecks, 
    Lock, Play, ArrowRight, Sparkles, AlertCircle, Activity, ShieldCheck,
    Truck, Folder, Clipboard, DollarSign
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
    case 'taskNode': return <Clipboard size={18} className="text-blue-400" />;
    case 'projectNode': return <Folder size={18} className="text-indigo-400" />;
    case 'quoteAction': return <FileText size={18} className="text-emerald-400" />;
    case 'diaryAction': return <Calendar size={18} className="text-purple-400" />;
    case 'resourceAction': return <Truck size={18} className="text-amber-400" />;
    case 'notification': return <Bell size={18} className="text-indigo-400" />;
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
            case 'taskNode': return 'border-blue-500/50';
            case 'projectNode': return 'border-indigo-500/50';
            case 'quoteAction': return 'border-emerald-500/50';
            case 'diaryAction': return 'border-purple-500/50';
            case 'resourceAction': return 'border-amber-500/50';
            case 'notification': return 'border-indigo-500/50';
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
            case 'taskNode': return 'bg-blue-500/10';
            case 'quoteAction': return 'bg-emerald-500/10';
            case 'diaryAction': return 'bg-purple-500/10';
            case 'resourceAction': return 'bg-amber-500/10';
            case 'notification': return 'bg-indigo-500/10';
            case 'projectNode': return 'bg-indigo-500/10';
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
        case 'projectNode': return 'text-indigo-400';
        case 'quoteAction': return 'text-emerald-400';
        case 'diaryAction': return 'text-purple-400';
        case 'resourceAction': return 'text-amber-400';
        case 'notification': return 'text-indigo-400';
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
  const theme = data.theme || 'indigo';
  const liteMode = data.liteMode || false;
  const isGhost = data.isGhost || false;
  const isSuggestion = data.isSuggestion || false;

  // --- THEME COLOR ENGINE ---
  const themeColors = {
      indigo: '#6366f1',
      emerald: '#10b981',
      solar: '#fbbf24',
      rose: '#f43f5e',
      violet: '#8b5cf6',
      cyan: '#06b6d4',
      amber: '#f59e0b',
      slate: '#64748b'
  };
  const activeColor = themeColors[theme] || themeColors.indigo;
  
  // --- MASTERPIECE: NEURAL HEALTH CALCULATION ---
  const getHealth = () => {
      if (status === 'error' || data.simulationError) return 'broken';
      if (!data.label || data.label.includes('New Node')) return 'incomplete';
      if (!data.assignee || !data.description) return 'warning';
      return 'optimized';
  };
  const health = getHealth();

  // --- SIMULATION OVERLAY LOGIC ---
  const simResult = data.simulationResult;
  const simColorMap = {
      green: 'border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.4)]',
      yellow: 'border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.4)]',
      red: 'border-rose-500 shadow-[0_0_30px_rgba(225,29,72,0.5)]',
      blue: 'border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.4)]',
      grey: 'border-slate-700 opacity-40 grayscale shadow-none'
  };

  // Smart Config Detection
  const hasSmartConfig = (data.automation && Object.keys(data.automation).length > 0) || totalItems > 0 || data.assignee || data.deadline;

  // Styles
  let baseClasses = `relative min-w-[320px] rounded-2xl border backdrop-blur-2xl group ${liteMode ? 'transition-none' : 'transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl'}`;
  
  let borderColor = NodeColor({ type, isBorder: true });
  let bgGradient = 'bg-gradient-to-b from-slate-900/95 to-black';
  
  // --- DYNAMIC HEALTH GLOWS ---
  const healthShadows = {
      optimized: `shadow-[0_0_20px_${activeColor}22]`,
      warning: 'shadow-[0_0_20px_rgba(245,158,11,0.15)]',
      incomplete: 'shadow-[0_0_20px_rgba(59,130,246,0.15)]',
      broken: 'shadow-[0_0_30px_rgba(239,68,68,0.3)]'
  };
  let shadow = selected ? `shadow-[0_0_40px_${activeColor}44]` : healthShadows[health];

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

  if (simResult) {
      const simStyle = simColorMap[simResult.status] || '';
      borderColor = simStyle.split(' ')[0];
      shadow = simStyle.split(' ').slice(1).join(' ');
  }

  // Suggestion Mode Style (Holographic Shadow)
  if (isSuggestion) {
      return (
          <div 
            onClick={data.onManifest}
            className={`relative min-w-[280px] rounded-2xl border-2 border-dashed border-indigo-500/30 bg-indigo-500/5 backdrop-blur-sm p-5 cursor-pointer group ${liteMode ? '' : 'hover:bg-indigo-500/10 hover:border-indigo-500/60 transition-all duration-500'}`}
          >
              <div className="flex items-center gap-3">
                  <div className={`p-2 bg-indigo-500/20 rounded-lg text-indigo-400 ${liteMode ? '' : 'group-hover:scale-110 transition-transform'}`}>
                      <Sparkles size={16} className={liteMode ? '' : "animate-pulse"} />
                  </div>
                  <div>
                      <span className="text-[10px] font-black text-indigo-400/60 uppercase tracking-widest block">AI Suggestion</span>
                      <span className={`text-sm font-bold text-white/40 ${liteMode ? '' : 'group-hover:text-white/80 transition-colors'}`}>{data.label}</span>
                  </div>
              </div>
              <div className={`mt-4 flex justify-end ${liteMode ? '' : 'opacity-0 group-hover:opacity-100 transition-opacity'}`}>
                  <div className="px-3 py-1 bg-indigo-600 rounded-lg text-[8px] font-black text-white uppercase tracking-widest">
                      Manifest Node
                  </div>
              </div>
              
              {/* Corner Accents */}
              <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-indigo-500/40 rounded-tl-lg" />
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-indigo-500/40 rounded-br-lg" />
          </div>
      );
  }

  // Ghost Mode Style
  if (isGhost) {
      return (
        <div className="relative min-w-[320px] rounded-2xl border border-white/5 bg-white/[0.02] opacity-20 grayscale blur-[1px] pointer-events-none scale-95 origin-center">
            <div className="p-5">
                <div className="h-4 w-24 bg-white/10 rounded mb-2" />
                <div className="h-2 w-full bg-white/5 rounded" />
            </div>
        </div>
      );
  }

  return (
    <motion.div 
      initial={liteMode ? { opacity: 1 } : { scale: 0.9, opacity: 0, y: 20 }}
      animate={liteMode ? { opacity: 1 } : { scale: 1, opacity: 1, y: 0 }}
      className={`${baseClasses} ${borderColor} ${bgGradient} ${shadow}`}
      style={{ background: 'transparent', border: 'none' }}
    >
      <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
          {/* Header Theme Stripe */}
          <div className={`absolute top-0 left-0 right-0 h-1`} style={{ backgroundColor: activeColor }} />
          
          {/* MASTERPIECE: PULSE FLASH OVERLAY */}
          <AnimatePresence>
              {data.isSimulating && !liteMode && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0] }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    className="absolute inset-0 bg-indigo-500/20 z-30"
                  />
              )}
          </AnimatePresence>

          {/* MASTERPIECE: SHORT CIRCUIT (ERROR) FLASH */}
          <AnimatePresence>
              {data.simulationError && !liteMode && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0, 1, 0] }}
                    transition={{ duration: 0.4, repeat: Infinity }}
                    className="absolute inset-0 bg-red-500/30 z-30"
                  />
              )}
          </AnimatePresence>

          {/* Active Pulse Overlay */}
          {status === 'in-progress' && !liteMode && (
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
              <div className={`bg-red-500/20 p-1.5 rounded-lg border border-red-500 text-red-500 ${liteMode ? '' : 'animate-pulse'}`}>
                  <Lock size={14} />
              </div>
          </div>
      )}

      {/* Handles */}
      {!isInput && (
        <Handle 
          type="target" 
          position={Position.Left} 
          className="!bg-slate-900 !w-4 !h-4 !border-[3px] !border-indigo-500/30 hover:!bg-indigo-400 transition-all z-50 cursor-crosshair shadow-lg" 
          style={{ left: 0, top: '50%', transform: 'translate(-50%, -50%)' }}
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
            {/* TASK NODE SPECIFIC */}
            {type === 'taskNode' && (
                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl space-y-2">
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">{data.config?.taskType || 'Task Unit'}</span>
                        {data.config?.zone && (
                            <span className="text-[9px] font-bold text-blue-200 bg-blue-500/20 px-1.5 py-0.5 rounded uppercase tracking-tighter max-w-[80px] truncate">
                                {data.config.zone}
                            </span>
                        )}
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-1">
                        {data.config?.plannedHours && (
                            <div className="flex items-center gap-1.5 bg-black/20 p-1.5 rounded-lg border border-blue-500/10">
                                <Clock size={10} className="text-blue-400" />
                                <span className="text-[10px] font-mono font-bold text-white">{data.config.plannedHours}h</span>
                            </div>
                        )}
                        {data.config?.crewSize && (
                            <div className="flex items-center gap-1.5 bg-black/20 p-1.5 rounded-lg border border-blue-500/10">
                                <User size={10} className="text-blue-400" />
                                <span className="text-[10px] font-mono font-bold text-white">{data.config.crewSize}pax</span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* MILESTONE SPECIFIC */}
            {type === 'milestone' && (
                <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl space-y-2">
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black text-yellow-500 uppercase tracking-widest">Progress Impact</span>
                        <span className="text-xs font-mono font-bold text-white">{data.config?.progressImpact || 0}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                        <div className="h-full bg-yellow-500 shadow-[0_0_10px_#eab308]" style={{ width: `${data.config?.progressImpact || 0}%` }} />
                    </div>
                </div>
            )}

            {/* APPROVAL SPECIFIC */}
            {type === 'approval' && (
                <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl space-y-2">
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest">Auth Required</span>
                        <span className="text-[10px] font-bold text-white uppercase">{data.config?.role || 'Manager'}</span>
                    </div>
                    <div className="flex gap-1">
                        {Array.from({ length: data.config?.signatures || 1 }).map((_, i) => (
                            <div key={i} className="w-6 h-6 rounded bg-slate-800 border border-white/5 flex items-center justify-center">
                                <ShieldCheck size={12} className="text-slate-600" />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* TRIGGER SPECIFIC */}
            {type === 'trigger' && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-2">
                    <div className="flex items-center gap-2">
                        <Zap size={14} className={`text-amber-400 ${liteMode ? '' : 'animate-pulse'}`} />
                        <span className="text-[10px] font-black text-white uppercase tracking-widest truncate">
                            {data.event?.replace(/\./g, '_') || 'WAITING_FOR_SIGNAL'}
                        </span>
                    </div>
                    {data.config?.filterVar && (
                        <div className="text-[8px] font-mono text-amber-200/60 uppercase">
                            Filter: {data.config.filterVar} {data.config.filterOp} {data.config.filterVal}
                        </div>
                    )}
                </div>
            )}

            {/* DELAY SPECIFIC */}
            {type === 'delay' && (
                <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Clock size={14} className="text-cyan-400" />
                        <span className="text-[10px] font-black text-white uppercase tracking-widest">Logic Hold</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-cyan-400">{data.config?.duration || 4}H</span>
                </div>
            )}

            {data.description && !['milestone', 'approval', 'trigger', 'delay'].includes(type) && (
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
                            className={`h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full ${liteMode ? '' : 'transition-all duration-500'}`} 
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
                    status === 'in-progress' ? `bg-blue-500 ${liteMode ? '' : 'animate-pulse'}` : 
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

        {/* SIMULATION RESULT OVERLAY */}
        {simResult && (simResult.issues.length > 0 || simResult.suggestions.length > 0) && (
            <div className="mt-4 pt-3 border-t border-white/10 animate-fade-in">
                <div className="flex items-center gap-2 mb-2">
                    <Activity size={12} className="text-blue-400" />
                    <span className="text-[8px] font-black text-white uppercase tracking-widest">Diagnostic_Feedback</span>
                </div>
                
                <div className="space-y-2">
                    {simResult.issues.map((issue, idx) => (
                        <div key={idx} className={`p-2 rounded-lg border text-[9px] font-bold flex gap-2 ${
                            issue.level === 'error' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                        }`}>
                            <AlertCircle size={12} className="shrink-0" />
                            <span>{issue.message}</span>
                        </div>
                    ))}
                    {simResult.suggestions.map((sug, idx) => (
                        <div key={idx} className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[9px] font-bold flex gap-2">
                            <Sparkles size={12} className="shrink-0" />
                            <span>{sug.message}</span>
                        </div>
                    ))}
                </div>
            </div>
        )}
      </div>

      {!isOutput && (
        <Handle 
          type="source" 
          position={Position.Right} 
          className="!bg-slate-900 !w-4 !h-4 !border-[3px] !border-indigo-500/30 hover:!bg-indigo-400 transition-all z-50 cursor-crosshair shadow-lg" 
          style={{ right: 0, top: '50%', transform: 'translate(50%, -50%)' }}
        />
      )}
    </motion.div>
  );
});
