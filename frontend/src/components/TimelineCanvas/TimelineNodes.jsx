import React, { useState } from 'react';
import { Handle, Position, NodeResizer } from '@xyflow/react';
import { User, Wrench, Package, X, Sparkles, Clock, DollarSign, Activity, Zap, ShieldCheck, Timer, Cpu, Box, AlertTriangle, Ruler, PenTool, Layout } from 'lucide-react';

// --- SHARED COMPONENT: GLASS JEWEL WRAPPER ---
const JewelWrapper = ({ children, theme, selected, isGhost, shapeClass }) => (
    <div className={`
        group relative min-w-[280px] p-[2px] transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]
        ${shapeClass}
        ${selected ? `scale-105 z-50 ${theme.glow} shadow-[0_0_100px_-20px_currentColor]` : 'hover:scale-[1.02] hover:shadow-2xl'}
    `}>
        {/* REFRACTIVE BASE LAYER */}
        <div className={`absolute inset-0 ${shapeClass} bg-gradient-to-br ${theme.bg} backdrop-blur-3xl opacity-90 overflow-hidden`}>
            {/* Internal Shimmer Rays */}
            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.05)_50%,transparent_75%)] bg-[length:250%_250%] animate-shimmer" />
            {/* Subtle Texture */}
            <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />
        </div>
        
        {/* HOLOGRAPHIC BORDER */}
        <div className={`absolute inset-0 ${shapeClass} border-[1.5px] ${theme.border} pointer-events-none ring-1 ring-white/10`} />
        
        {/* CONTENT AREA */}
        <div className="relative p-6">
            {children}
        </div>
    </div>
);

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
                    <div className="text-right">
                        <div className="text-[10px] font-black text-rose-400 uppercase tracking-widest animate-pulse">Critical Impact</div>
                        <div className="text-4xl font-black text-white font-mono leading-none tracking-tighter">
                            +{delayHours}<span className="text-lg align-top opacity-50">H</span>
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
                <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl ${isNegative ? 'bg-rose-500/20 text-rose-400' : 'bg-indigo-500/20 text-indigo-400'} border border-current shadow-lg`}>
                        <Zap size={22} strokeWidth={2.5} />
                    </div>
                    <div>
                        <div className="text-[9px] font-black text-white/40 uppercase tracking-[0.4em] mb-0.5">Impact Anchor</div>
                        <div className="text-base font-black text-white uppercase tracking-tight leading-none">{label || 'Condition'}</div>
                    </div>
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
    const { label, startTime, finishTime, manHours } = data;
    
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
                    <div className="flex items-center justify-center gap-2 text-cyan-400 mb-2">
                        <Clock size={16} className="animate-pulse" />
                        <span className="text-[9px] font-black uppercase tracking-[0.3em]">Chronos Hub</span>
                    </div>
                    
                    <div className="text-4xl font-black text-white font-mono tracking-tighter drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">
                        {startTime || '07:00'}
                    </div>
                    <div className="h-px w-12 bg-cyan-500/50 mx-auto" />
                    <div className="text-2xl font-bold text-cyan-200/50 font-mono tracking-tighter">
                        {finishTime || '17:00'}
                    </div>

                    <div className="mt-4 px-4 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-bold">
                        {label || 'Shift A'}
                    </div>
                </div>
            </div>

            {/* RESOURCE ORBIT INDICATOR */}
            {manHours > 0 && (
                <div className="absolute -right-4 top-1/2 -translate-y-1/2 bg-black border border-cyan-500 text-cyan-400 px-3 py-1.5 rounded-xl text-xs font-black shadow-xl flex items-center gap-2">
                    <Activity size={12} /> {manHours}H
                </div>
            )}

            <Handle type="target" position={Position.Left} className="!w-4 !h-4 !bg-cyan-400 !border-4 !border-black shadow-[0_0_20px_#22d3ee]" />
            <Handle type="source" position={Position.Right} className="!w-4 !h-4 !bg-cyan-400 !border-4 !border-black shadow-[0_0_20px_#22d3ee]" />
        </div>
    );
};

export const DiaryNode = ({ data, selected }) => {
  const { label, duration, type, costRate, quantity, onDelete, isGhost } = data;
  
  // -- DYNAMIC THEME ENGINE --
  let theme = {
      bg: "from-indigo-600/80 via-blue-900/90 to-black",
      border: "border-indigo-400/40",
      glow: "shadow-indigo-500/50",
      icon: "text-indigo-400",
      iconBg: "bg-indigo-500/20",
      accent: "text-indigo-200"
  };

  if (isGhost) {
      theme = { bg: "from-slate-800/60 to-black", border: "border-white/10 border-dashed", glow: "shadow-white/5", iconBg: "bg-white/5", accent: "text-slate-500" };
  } else if (type === 'staff') {
      theme = { bg: "from-emerald-600/80 via-teal-900/90 to-black", border: "border-emerald-400/40", glow: "shadow-emerald-500/50", iconBg: "bg-emerald-500/20", accent: "text-emerald-200" };
  } else if (type === 'equipment') {
      theme = { bg: "from-amber-500/80 via-orange-900/90 to-black", border: "border-amber-400/40", glow: "shadow-amber-500/50", iconBg: "bg-amber-500/20", accent: "text-amber-200" };
  }

  // Unified Shape: Elegant Rounded Hexagon (via clip-path) or Squircle
  const shapeClass = "rounded-[2rem]"; 

  return (
    <JewelWrapper theme={theme} selected={selected} isGhost={isGhost} shapeClass={shapeClass}>
      <div className="flex flex-col gap-4">
          <div className="flex justify-between items-start">
              <div className="relative">
                  <div className={`absolute inset-0 rounded-2xl ${theme.iconBg} animate-ping opacity-20`} />
                  <div className={`relative p-3.5 rounded-2xl ${theme.iconBg} backdrop-blur-md shadow-2xl border border-white/10 transition-all group-hover:rotate-3`}>
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
                  <span className={`text-[8px] font-black uppercase tracking-[0.4em] ${theme.accent} opacity-60`}>
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
                      <Cpu size={10} className={`${theme.accent} opacity-50`} />
                      <span className="text-[10px] font-mono font-black text-white">
                          {type === 'staff' || type === 'equipment' ? `${duration || quantity}H` : `${quantity} UNIT`}
                      </span>
                  </div>
                  {costRate > 0 && (
                      <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-1.5">
                          <DollarSign size={10} className="text-emerald-400" />
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