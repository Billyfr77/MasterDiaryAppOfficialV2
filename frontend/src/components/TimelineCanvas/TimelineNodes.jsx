import React, { useState } from 'react';
import { Handle, Position, NodeResizer } from '@xyflow/react';
import { motion } from 'framer-motion';
import { User, Wrench, Package, X, Sparkles, Clock, DollarSign, Activity, Zap, ShieldCheck, Timer, Cpu, Box, AlertTriangle, Ruler, PenTool, Layout, Award } from 'lucide-react';
import { useDiaryTheme } from '../PaintDiary/ThemeContext';

// --- SHARED COMPONENT: GLASS JEWEL WRAPPER ---
const JewelWrapper = ({ children, theme: nodeTheme, selected, isGhost, shapeClass }) => {
    const { theme } = useDiaryTheme();
    // If nodeTheme is provided (e.g. from custom override), use it, otherwise fallback to global
    const activeTheme = nodeTheme || {
        bg: theme.bg.replace('bg-', ''),
        border: theme.border,
        glow: theme.glow,
        text: theme.text
    };

    return (
        <div className={`
            group relative min-w-[280px] p-[2px] transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]
            ${shapeClass}
            ${selected ? `scale-105 z-50 ${activeTheme.glow} shadow-[0_0_100px_-20px_currentColor]` : 'hover:scale-[1.02] hover:shadow-2xl'}
            animate-in zoom-in-95 duration-300 fade-in
        `}>
            {/* REFRACTIVE BASE LAYER */}
            <div className={`absolute inset-0 ${shapeClass} bg-gradient-to-br ${activeTheme.bg || theme.bg} backdrop-blur-3xl opacity-90 overflow-hidden`}>
                {/* Internal Shimmer Rays */}
                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.05)_50%,transparent_75%)] bg-[length:250%_250%] animate-shimmer" />
                {/* Subtle Texture */}
                <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />
            </div>
            
            {/* HOLOGRAPHIC BORDER */}
            <div className={`absolute inset-0 ${shapeClass} border-[1.5px] ${activeTheme.border || theme.border} pointer-events-none ring-1 ring-white/10`} />
            
            {/* CONTENT AREA */}
            <div className="relative p-6">
                {children}
            </div>
        </div>
    );
};

export const DelayNode = ({ data, selected }) => {
    const { label, delayHours, reason, status } = data;
    
    return (
        <div className={`
            relative min-w-[240px] p-1 transition-all duration-500 ease-out
            rounded-xl
            ${selected ? 'scale-110 z-50 shadow-[0_0_100px_rgba(244,63,94,0.8)]' : 'hover:scale-105 shadow-2xl'}
        `}>
            {/* HAZARD TAPE BACKGROUND */}
            <div className="absolute inset-0 rounded-xl bg-rose-950 border-2 border-rose-500 overflow-hidden">
                <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,rgba(244,63,94,0.1),rgba(244,63,94,0.1)_10px,transparent_10px,transparent_20px)] opacity-50 animate-pulse" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
            </div>

            <div className="relative p-6 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <div className="p-3 rounded-lg bg-rose-600 text-white shadow-lg animate-bounce">
                        <AlertTriangle size={24} strokeWidth={3} />
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <button onClick={(e) => { e.stopPropagation(); data.onDelete?.(); }} className="p-1.5 rounded-lg bg-white/5 text-white/20 hover:bg-rose-500 hover:text-white transition-all opacity-0 group-hover:opacity-100">
                            <X size={12} strokeWidth={3} />
                        </button>
                        <div className="text-right">
                            <div className="text-[10px] font-black text-rose-400 uppercase tracking-widest animate-pulse">Critical Impact</div>
                            <div className="text-4xl font-black text-white font-mono leading-none tracking-tighter">
                                +{delayHours}<span className="text-lg align-top opacity-50">H</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="h-px w-full bg-gradient-to-r from-transparent via-rose-500 to-transparent opacity-50" />

                <div>
                    <div className="text-lg font-black text-white uppercase tracking-tight">{label || 'Stoppage'}</div>
                    <div className="text-xs text-rose-200/70 font-medium italic mt-1 line-clamp-2">
                        "{reason || 'Unspecified operational delay'}"
                    </div>
                </div>
            </div>

            <Handle type="target" position={Position.Top} className="!w-4 !h-4 !bg-rose-500 !border-4 !border-black shadow-[0_0_20px_#f43f5e]" />
            <Handle type="source" position={Position.Bottom} className="!w-4 !h-4 !bg-rose-500 !border-4 !border-black shadow-[0_0_20px_#f43f5e]" />
        </div>
    );
};

export const ImpactNode = ({ data, selected }) => {
    const { label, condition, prodImpact, costImpact } = data;
    
    const isNegative = prodImpact < 1 || costImpact > 1;

    return (
        <div className={`
            relative min-w-[220px] p-1 transition-all duration-700
            rounded-[2.5rem]
            ${selected ? 'scale-105 z-50 shadow-[0_0_100px_-20px_rgba(236,72,153,0.5)]' : 'hover:scale-[1.02]'}
        `}>
            {/* AMBIENT RADAR SCAN */}
            <div className={`absolute inset-0 rounded-[2.5rem] bg-black/90 border-2 ${isNegative ? 'border-rose-500/50' : 'border-indigo-500/50'} backdrop-blur-3xl overflow-hidden`}>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(236,72,153,0.1),transparent_70%)] animate-pulse" />
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/5 to-transparent" />
            </div>

            <div className="relative p-6 flex flex-col gap-4">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-2xl ${isNegative ? 'bg-rose-500/20 text-rose-400' : 'bg-indigo-500/20 text-indigo-400'} border border-current shadow-lg`}>
                            <Zap size={22} strokeWidth={2.5} />
                        </div>
                        <div>
                            <div className="text-[9px] font-black text-white/40 uppercase tracking-[0.4em] mb-0.5">Impact Anchor</div>
                            <div className="text-base font-black text-white uppercase tracking-tight leading-none">{label || 'Condition'}</div>
                        </div>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); data.onDelete?.(); }} className="p-1.5 rounded-lg bg-white/5 text-white/20 hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100">
                        <X size={12} strokeWidth={3} />
                    </button>
                </div>

                <div className="bg-black/40 rounded-3xl p-4 border border-white/5">
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Effect</span>
                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${isNegative ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                            {condition || 'Active'}
                        </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <div className="flex flex-col gap-1">
                            <span className="text-[7px] font-bold text-gray-600 uppercase">Prod.</span>
                            <span className={`text-sm font-mono font-black ${prodImpact < 1 ? 'text-rose-400' : 'text-emerald-400'}`}>
                                {prodImpact || 1.0}x
                            </span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-[7px] font-bold text-gray-600 uppercase">Cost</span>
                            <span className={`text-sm font-mono font-black ${costImpact > 1 ? 'text-rose-400' : 'text-emerald-400'}`}>
                                {costImpact || 1.0}x
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-white !border-2 !border-black shadow-lg" />
            <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-white !border-2 !border-black shadow-lg" />
        </div>
    );
};

export const ChronosNode = ({ data, selected }) => {
    const { label, startTime, finishTime, manHours, duration } = data;

    const handleTimeChange = (field, value) => {
        const newData = { [field]: value };
        
        // Auto-calc duration
        const start = field === 'startTime' ? value : (startTime || '07:00');
        const end = field === 'finishTime' ? value : (finishTime || '17:00');
        
        const [h1, m1] = start.split(':').map(Number);
        const [h2, m2] = end.split(':').map(Number);
        
        const totalHours = Math.max(0, (h2 + m2/60) - (h1 + m1/60));
        newData.duration = parseFloat(totalHours.toFixed(2));
        
        data.onUpdate?.(data.id, newData);
    };
    
    return (
        <div className={`
            relative min-w-[280px] aspect-square transition-all duration-1000
            rounded-full
            ${selected ? 'scale-110 z-50 shadow-[0_0_150px_-30px_rgba(6,182,212,0.8)]' : 'hover:scale-105 shadow-2xl'}
        `}>
            {/* TIME PORTAL RING */}
            <div className="absolute inset-0 rounded-full border-[6px] border-cyan-500/20 border-t-cyan-400 border-l-cyan-600/50 animate-spin-slow shadow-[0_0_50px_rgba(6,182,212,0.3)]" />
            <div className="absolute inset-2 rounded-full border-[2px] border-dashed border-cyan-300/30 animate-spin-reverse-slower" />
            
            {/* GLASS CORE */}
            <div className="absolute inset-4 rounded-full bg-gradient-to-br from-cyan-900/90 via-black to-blue-950/90 backdrop-blur-2xl flex flex-col items-center justify-center border border-cyan-500/30 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.15),transparent_70%)] animate-pulse" />
                
                {/* CONTENT */}
                <div className="relative z-10 text-center space-y-2">
                    <button onClick={(e) => { e.stopPropagation(); data.onDelete?.(); }} className="absolute -top-10 left-1/2 -translate-x-1/2 p-1.5 rounded-lg bg-white/5 text-white/20 hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100">
                        <X size={12} strokeWidth={3} />
                    </button>
                    <div className="flex items-center justify-center gap-2 text-cyan-400 mb-2">
                        <Clock size={16} className="animate-pulse" />
                        <span className="text-[9px] font-black uppercase tracking-[0.3em]">Chronos Hub</span>
                    </div>
                    
                    {/* EDITABLE TIME INPUTS */}
                    <input 
                        type="time" 
                        className="text-4xl font-black text-white font-mono tracking-tighter drop-shadow-[0_0_10px_rgba(34,211,238,0.5)] bg-transparent text-center w-full focus:outline-none"
                        value={startTime || '07:00'}
                        onChange={(e) => handleTimeChange('startTime', e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                    />
                    <div className="h-px w-12 bg-cyan-500/50 mx-auto" />
                    <input 
                        type="time" 
                        className="text-2xl font-bold text-cyan-200/50 font-mono tracking-tighter bg-transparent text-center w-full focus:outline-none"
                        value={finishTime || '17:00'}
                        onChange={(e) => handleTimeChange('finishTime', e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                    />

                    <div className="mt-4 px-4 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-bold">
                        {label || 'Shift A'}
                    </div>
                </div>
            </div>

            {/* RESOURCE ORBIT INDICATOR */}
            {(duration > 0 || manHours > 0) && (
                <div className="absolute -right-4 top-1/2 -translate-y-1/2 bg-black border border-cyan-500 text-cyan-400 px-3 py-1.5 rounded-xl text-xs font-black shadow-xl flex flex-col items-center gap-1 min-w-[60px]">
                    <div className="flex items-center gap-2">
                        <Timer size={12} /> {duration || 0}H
                    </div>
                    {manHours > 0 && (
                        <div className="text-[8px] text-gray-500 uppercase tracking-tighter border-t border-white/10 pt-1 w-full text-center">
                            {manHours} MAN-HRS
                        </div>
                    )}
                </div>
            )}

            <Handle type="target" position={Position.Left} className="!w-4 !h-4 !bg-cyan-400 !border-4 !border-black shadow-[0_0_20px_#22d3ee]" />
            <Handle type="source" position={Position.Right} className="!w-4 !h-4 !bg-cyan-400 !border-4 !border-black shadow-[0_0_20px_#22d3ee]" />
        </div>
    );
};

export const PhotoNode = ({ data, selected }) => {
    const { url, label, onDelete } = data;
    
    return (
        <div className={`
            relative group transition-all duration-700
            ${selected ? 'scale-105 z-50' : 'hover:scale-[1.02]'}
        `}>
            {/* AMBIENT PULSE GLOW */}
            <div className="absolute -inset-4 bg-indigo-500/20 rounded-[2rem] blur-2xl opacity-0 group-hover:opacity-100 animate-pulse transition-opacity" />
            
            {/* HOLOGRAPHIC FRAME */}
            <div className={`
                relative p-1 rounded-[1.8rem] bg-gradient-to-br from-white/20 via-white/5 to-black border border-white/10 shadow-2xl overflow-hidden
                ${selected ? 'ring-2 ring-indigo-500/50 shadow-[0_0_50px_rgba(99,102,241,0.3)]' : ''}
            `}>
                {/* Photo Content */}
                <div className="relative aspect-video w-64 rounded-[1.5rem] overflow-hidden bg-stone-900">
                    <img src={url} alt={label} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                    
                    {/* Scanning Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <motion.div 
                        animate={{ top: ["-100%", "200%"] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        className="absolute left-0 right-0 h-1/2 bg-gradient-to-b from-transparent via-indigo-500/10 to-transparent pointer-events-none"
                    />
                </div>

                {/* Footer Info */}
                <div className="absolute bottom-3 left-4 right-3 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[8px] font-black text-white/80 uppercase tracking-widest">{label || 'EVIDENCE_01'}</span>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); onDelete?.(); }} className="p-1.5 rounded-lg bg-black/40 text-white/40 hover:bg-rose-500 hover:text-white transition-all">
                        <X size={10} />
                    </button>
                </div>
            </div>

            {/* HANDLES */}
            <Handle type="target" position={Position.Top} className="!w-2 !h-2 !bg-indigo-400 !border-none" />
            <Handle type="source" position={Position.Bottom} className="!w-2 !h-2 !bg-indigo-400 !border-none" />
        </div>
    );
};

export const AllowanceNode = ({ data, selected }) => {
    const { label, rate, type } = data;
    
    return (
        <div className={`
            relative min-w-[200px] p-1 transition-all duration-700
            rounded-full
            ${selected ? 'scale-110 z-50 shadow-[0_0_80px_-10px_rgba(251,191,36,0.6)]' : 'hover:scale-105 shadow-2xl'}
        `}>
            {/* GOLDEN RING WITH SHINE */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-b from-amber-200 via-yellow-500 to-amber-800 p-[4px] shadow-2xl overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.8),transparent_40%)] z-10 opacity-60" />
                <div className="absolute inset-0 rounded-full bg-[#1a1500] ring-1 ring-amber-500/50 backdrop-blur-xl flex items-center justify-center">
                     {/* MICRO TEXTURE */}
                     <div className="absolute inset-0 opacity-[0.05] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
                </div>
            </div>

            <div className="relative p-6 flex flex-col items-center justify-center text-center gap-2">
                <div className="absolute -top-3 p-2 bg-gradient-to-b from-amber-300 to-amber-600 rounded-full shadow-lg border-2 border-amber-200">
                    <Award size={18} className="text-amber-950" strokeWidth={3} />
                </div>
                
                <button onClick={(e) => { e.stopPropagation(); data.onDelete?.(); }} className="absolute top-2 right-4 text-white/20 hover:text-red-500 transition-colors">
                    <X size={12} />
                </button>

                <div className="mt-2">
                    <div className="text-[9px] font-black text-amber-500/80 uppercase tracking-widest">Allowance</div>
                    <div className="text-lg font-black text-white uppercase tracking-tight leading-none text-transparent bg-clip-text bg-gradient-to-b from-amber-200 to-amber-500">
                        {label || 'Bonus'}
                    </div>
                </div>

                <div className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center gap-1.5">
                    <DollarSign size={10} className="text-amber-400" />
                    <span className="text-sm font-mono font-black text-amber-200">${rate || 0}</span>
                    <span className="text-[9px] font-bold text-amber-500/50 uppercase ml-0.5">/{type === 'daily' ? 'DAY' : 'HR'}</span>
                </div>

                {data.allowanceTotal > 0 && (
                    <div className="mt-2 pt-2 border-t border-amber-500/20 w-full">
                        <div className="text-[8px] font-black text-amber-500/40 uppercase tracking-widest">Distributed</div>
                        <div className="text-xl font-mono font-black text-emerald-400 animate-pulse">
                            ${data.allowanceTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                    </div>
                )}
            </div>

            <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-amber-400 !border-2 !border-black" />
            <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-amber-400 !border-2 !border-black" />
        </div>
    );
};

export const DiaryNode = ({ data, selected }) => {
  const { label, duration, type, costRate, quantity, onDelete, isGhost } = data;
  const { theme } = useDiaryTheme();
  
  const getAccentColor = (type) => {
      if (type === 'staff') return theme.primary === 'emerald' ? 'emerald' : theme.primary;
      if (type === 'equipment') return 'amber';
      return 'indigo';
  };

  const accentColor = getAccentColor(type);

  // -- DYNAMIC THEME ENGINE --
  let nodeTheme = {
      bg: `from-${accentColor}-600/80 via-${accentColor}-900/90 to-black`,
      border: `border-${accentColor}-400/40`,
      glow: `shadow-${accentColor}-500/50`,
      icon: `text-${accentColor}-400`,
      iconBg: `bg-${accentColor}-500/20`,
      accent: `text-${accentColor}-200`
  };

  if (isGhost) {
      nodeTheme = { bg: "from-slate-800/60 to-black", border: "border-white/10 border-dashed", glow: "shadow-white/5", iconBg: "bg-white/5", accent: "text-slate-500" };
  }

  // Unified Shape: Elegant Rounded Hexagon (via clip-path) or Squircle
  const shapeClass = "rounded-[2rem]"; 

  return (
    <JewelWrapper theme={nodeTheme} selected={selected} isGhost={isGhost} shapeClass={shapeClass}>
      <div className="flex flex-col gap-4">
          <div className="flex justify-between items-start">
              <div className="relative">
                  <div className={`absolute inset-0 rounded-2xl ${nodeTheme.iconBg} animate-ping opacity-20`} />
                  <div className={`relative p-3.5 rounded-2xl ${nodeTheme.iconBg} backdrop-blur-md shadow-2xl border border-white/10 transition-all group-hover:rotate-3`}>
                      {type === 'staff' ? <User size={22} className="text-white" /> : 
                       type === 'equipment' ? <Wrench size={22} className="text-white" /> : 
                       <Package size={22} className="text-white" />}
                  </div>
              </div>
              
              {!isGhost && (
                  <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-2 rounded-xl bg-white/5 text-white/20 hover:bg-red-500 hover:text-white transition-all scale-90 group-hover:scale-100">
                      <X size={14} strokeWidth={3} />
                  </button>
              )}
          </div>

          <div>
              <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[8px] font-black uppercase tracking-[0.4em] ${nodeTheme.accent} opacity-60`}>
                      {isGhost ? 'SUGGESTION' : type}
                  </span>
              </div>
              <div className="text-lg font-black text-white leading-tight tracking-tight uppercase line-clamp-2">
                  {label}
              </div>
          </div>

          {!isGhost && (
              <div className="flex gap-2 items-center">
                  <div className="px-3 py-1.5 rounded-xl bg-black/40 border border-white/5 flex items-center gap-2">
                      <Cpu size={10} className={`${nodeTheme.accent} opacity-50`} />
                      <span className="text-[10px] font-mono font-black text-white">
                          {type === 'staff' || type === 'equipment' ? `${duration || quantity}H` : `${quantity} UNIT`}
                      </span>
                  </div>
                  {costRate > 0 && (
                      <div className={`px-3 py-1.5 rounded-xl bg-${accentColor}-500/10 border border-${accentColor}-500/20 flex items-center gap-1.5`}>
                          <DollarSign size={10} className={`text-${accentColor}-400`} />
                          <span className="text-[10px] font-mono font-black text-white">${costRate}</span>
                      </div>
                  )}
              </div>
          )}
      </div>

      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-white !border-2 !border-black" />
      <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-white !border-2 !border-black" />
    </JewelWrapper>
  );
};

export const WormholeNode = ({ data, selected }) => (
    <div className={`relative rounded-full border-[12px] border-double border-indigo-500/10 bg-black flex items-center justify-center transition-all duration-1000 ${selected ? 'shadow-[0_0_150px_rgba(99,102,241,0.4)] scale-105 border-indigo-400/30' : 'opacity-90'}`} style={{ width: '100%', height: '100%', minWidth: 380, minHeight: 380 }}>
       <NodeResizer minWidth={380} minHeight={380} isVisible={selected} color="#6366f1" />
       
       <div className="absolute inset-0 rounded-full animate-spin-slow bg-[conic-gradient(from_0deg,transparent,rgba(99,102,241,0.2),transparent)]" />
       
       <div className="text-center z-10 p-12 bg-black/60 backdrop-blur-3xl rounded-full border border-white/5 shadow-2xl ring-1 ring-white/10">
           <div className="flex justify-center mb-4"><Zap size={48} className="text-indigo-400" /></div>
           <div className="text-3xl font-black text-white uppercase tracking-[0.5em] mb-2">WORMHOLE</div>
           <div className="text-[10px] text-indigo-300 font-black uppercase tracking-widest opacity-40">Holographic Container V2</div>
           {data.zoneTotal > 0 && (
               <div className="mt-8 pt-6 border-t border-white/10">
                   <div className="text-4xl font-mono font-black text-emerald-400 animate-pulse">${data.zoneTotal.toLocaleString()}</div>
               </div>
           )}
       </div>
    </div>
);

export const ZoneNode = ({ data, selected }) => (
    <div className={`relative rounded-[3rem] border-2 transition-all duration-700 group ${selected ? 'border-white/30 bg-white/5 shadow-2xl' : 'border-white/5 bg-black/20'}`} style={{ width: '100%', height: '100%', minWidth: 200, minHeight: 200 }}>
       <NodeResizer minWidth={200} minHeight={200} isVisible={selected} />
       <div className="absolute top-10 left-10">
           <div className="flex items-center gap-4 opacity-30 group-hover:opacity-60 transition-opacity">
               <Box size={16} className="text-white" />
               <span className="text-xs font-black text-white uppercase tracking-[0.6em]">ZONE_MAPPED</span>
           </div>
           {data.zoneTotal > 0 && <div className="text-4xl font-mono font-black text-white/10 mt-6 tracking-tighter">${data.zoneTotal.toFixed(0)}</div>}
       </div>
    </div>
);

export const DimensionNode = ({ data, selected }) => {
    const { label, width, height } = data;
    const realWidth = width / 20;
    const realLength = height / 20;
    const area = realWidth * realLength;

    return (
        <div className={`
            relative min-w-[150px] min-h-[150px] p-1 transition-all duration-700
            rounded-[2rem] border-2
            ${selected ? 'border-indigo-500/50 bg-indigo-500/10 shadow-2xl scale-105' : 'border-white/5 bg-black/20 hover:border-white/20'}
        `} style={{ width: '100%', height: '100%' }}>
            <NodeResizer minWidth={150} minHeight={150} isVisible={selected} onResize={data.onResize} />
            
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[2rem]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.05),transparent_70%)]" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:20px_20px]" />
            </div>

            <div className="relative p-6 h-full flex flex-col justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
                            <Ruler size={16} />
                        </div>
                        <div className="text-sm font-black text-white uppercase tracking-wider truncate">{label}</div>
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-bold">
                        <span className="text-gray-500 uppercase">Dimensions</span>
                        <span className="text-indigo-400 font-mono">{realWidth.toFixed(1)}' x {realLength.toFixed(1)}'</span>
                    </div>
                    <div className="flex justify-between items-end">
                        <span className="text-[10px] font-bold text-gray-500 uppercase">Area</span>
                        <span className="text-2xl font-black text-white font-mono leading-none">{area.toFixed(0)}<span className="text-xs text-gray-600 ml-1">SQFT</span></span>
                    </div>
                </div>
            </div>

            <SmartActionsMenu node={{ type: 'dimension', data }} onAutoFit={data.onAutoFit} />

            <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-white !border-2 !border-black" />
            <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-white !border-2 !border-black" />
        </div>
    );
};

const SmartActionsMenu = ({ node, onAutoFit }) => {
    if (!node || node.type !== 'dimension') return null;
    return (
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex gap-2 bg-stone-900 border border-white/20 p-1.5 rounded-xl shadow-xl z-50 animate-in fade-in zoom-in-95 pointer-events-auto">
            <button onClick={(e) => { e.stopPropagation(); onAutoFit(node, 'basic'); }} className="flex items-center gap-1.5 px-2 py-1 hover:bg-white/10 rounded-lg text-[10px] font-bold text-white uppercase transition-colors" title="Add Paint & Floor">
                <Sparkles size={12} className="text-amber-400" /> Auto-Fit
            </button>
            <div className="w-px h-4 bg-white/10 my-auto" />
            <button onClick={(e) => { e.stopPropagation(); onAutoFit(node, 'paint'); }} className="p-1.5 hover:bg-white/10 rounded-lg text-indigo-400" title="Add Wall Paint"><PenTool size={12}/></button>
            <button onClick={(e) => { e.stopPropagation(); onAutoFit(node, 'floor'); }} className="p-1.5 hover:bg-white/10 rounded-lg text-emerald-400" title="Add Flooring"><Layout size={12}/></button>
        </div>
    );
};