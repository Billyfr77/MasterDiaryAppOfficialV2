import React, { useState, useMemo } from 'react';
import { Handle, Position, NodeResizer } from '@xyflow/react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    User, Wrench, Package, X, Sparkles, Clock, DollarSign, Activity, Zap, 
    ShieldCheck, Timer, Cpu, Box, AlertTriangle, Ruler, PenTool, Layout, 
    Award, CloudRain, Sun, Snowflake, ChevronDown, Magnet, FileText,
    TrendingUp, Target, BrainCircuit, Waves, PaintBucket, Layers
} from 'lucide-react';
import { useDiaryTheme } from '../PaintDiary/ThemeContext';

// --- SHARED COMPONENT: GLASS JEWEL WRAPPER ---
const JewelWrapper = ({ children, theme: nodeTheme, selected, isGhost, shapeClass }) => {
    const { theme } = useDiaryTheme();
    const activeTheme = nodeTheme || {
        bg: theme.bg.replace('bg-', ''),
        border: theme.border,
        glow: theme.glow,
        text: theme.text
    };

    return (
        <div className={`
            group relative min-w-[280px] p-[2px] 
            transition-[box-shadow,transform,filter,opacity] duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]
            ${shapeClass}
            ${selected ? `scale-105 z-50 ${activeTheme.glow} shadow-[0_0_100px_-20px_currentColor]` : 'hover:scale-[1.02] hover:shadow-2xl'}
            animate-in zoom-in-95 duration-300 fade-in
        `} style={{ willChange: 'transform' }}>
            <div className={`absolute inset-0 ${shapeClass} bg-gradient-to-br ${activeTheme.bg || theme.bg} backdrop-blur-3xl opacity-100 overflow-hidden`}>
                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.05)_50%,transparent_75%)] bg-[length:250%_250%] animate-shimmer" />
                <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />
            </div>
            <div className={`absolute inset-0 ${shapeClass} border-[1.5px] ${activeTheme.border || theme.border} pointer-events-none ring-1 ring-white/10`} />
            <div className="relative p-6">
                {children}
            </div>
        </div>
    );
};

export const DelayNode = ({ id, data, selected }) => {
    const { duration = 0, weatherType = 'none', reason } = data;
    const [isExpanded, setIsExpanded] = useState(false);
    const update = (field, value) => data.onUpdate?.(id, { [field]: value });

    const modes = [
        { id: 'none', icon: <AlertTriangle size={12} />, label: 'Off' },
        { id: 'rain', icon: <CloudRain size={12} />, label: 'Rain' },
        { id: 'storm', icon: <Zap size={12} />, label: 'Storm' },
        { id: 'heat', icon: <Sun size={12} />, label: 'Heat' },
        { id: 'snow', icon: <Snowflake size={12} />, label: 'Snow' },
    ];

    const getTheme = () => {
        switch(weatherType) {
            case 'rain': return { accent: '#60a5fa', border: 'border-blue-500/40', bg: 'from-blue-600/30 to-blue-950/80', glow: 'shadow-blue-500/40' };
            case 'storm': return { accent: '#fbce1b', border: 'border-yellow-400/40', bg: 'from-slate-800/60 to-black', glow: 'shadow-yellow-400/50' };
            case 'heat': return { accent: '#fb923c', border: 'border-orange-400/40', bg: 'from-orange-600/30 to-orange-950/80', glow: 'shadow-orange-500/40' };
            case 'snow': return { accent: '#e2e8f0', border: 'border-slate-300/40', bg: 'from-slate-600/30 to-slate-900/80', glow: 'shadow-white/20' };
            default: return { accent: '#f43f5e', border: 'border-rose-500/40', bg: 'from-rose-600/20 to-rose-950/80', glow: 'shadow-rose-500/30' };
        }
    };

    const s = getTheme();

    return (
        <JewelWrapper theme={s} selected={selected} shapeClass="rounded-[2rem]">
            {/* AI VISION TAG */}
            <div className="absolute top-2 right-4 text-[8px] font-mono text-white font-bold tracking-widest pointer-events-none select-none z-30 drop-shadow-md opacity-50">ID:{id}::DELAY</div>
            <div className="flex flex-col gap-5">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-3">Atmospheric Command</div>
                        <div className="flex gap-1 p-1 bg-black/80 rounded-2xl border border-white/10 nodrag w-full">
                            {modes.map(m => (
                                <button
                                    key={m.id}
                                    onClick={(e) => { e.stopPropagation(); update('weatherType', m.id); }}
                                    className={`flex-1 py-2.5 rounded-xl transition-all flex flex-col items-center justify-center gap-1 border ${
                                        weatherType === m.id 
                                        ? 'bg-emerald-500 border-emerald-400 text-black shadow-lg scale-105 z-10' 
                                        : 'bg-white/5 border-transparent text-gray-300 hover:text-white hover:bg-white/10'
                                    }`}
                                >
                                    <div className={weatherType === m.id ? 'text-black' : 'text-current'}>{m.icon}</div>
                                    <span className={`text-[7px] font-black uppercase tracking-tighter leading-none ${weatherType === m.id ? 'text-black' : 'text-inherit'}`}>
                                        {m.label}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); data.onDelete?.(); }} className="p-2 rounded-xl bg-white/5 text-white/20 hover:bg-rose-500 hover:text-white transition-all"><X size={16} strokeWidth={3} /></button>
                </div>
                <div className="bg-black/40 rounded-3xl p-5 border border-white/5 shadow-inner relative overflow-hidden nodrag pointer-events-auto">
                    <div className="flex justify-between items-center mb-4 cursor-pointer hover:bg-white/5 p-1 rounded-xl transition-colors" onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}>
                        <div>
                            <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1 flex items-center gap-2">Time Displacement <ChevronDown size={10} className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} /></div>
                            <div className="text-3xl font-black text-white font-mono tracking-tighter">{duration}<span className="text-sm text-gray-600 ml-1">HRS</span></div>
                        </div>
                        <div className={`text-[8px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white/60`}>{weatherType === 'none' ? 'Manual Delay' : 'Weather Impact'}</div>
                    </div>
                    {isExpanded && (
                        <div className="grid grid-cols-6 gap-1 animate-in slide-in-from-top-2 duration-300">
                            {[0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8].map((val) => (
                                <button key={val} onClick={(e) => { e.stopPropagation(); update('duration', val); }} className={`py-2 rounded-lg text-[9px] font-black transition-all border cursor-pointer pointer-events-auto ${duration === val ? 'bg-emerald-500 border-emerald-400 text-black shadow-[0_0_15px_rgba(16,185,129,0.4)] scale-105 z-10' : 'bg-white/5 border-transparent text-gray-300 hover:text-white hover:bg-white/10'}`}>{val === 0 ? '0' : val}</button>
                            ))}
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-3 px-1 nodrag">
                    <div className={`w-1.5 h-1.5 rounded-full ${weatherType === 'none' ? 'bg-rose-500' : 'bg-emerald-500 animate-pulse'} shadow-[0_0_10px_currentColor]`} />
                    <input type="text" placeholder="Log reason for delay..." value={reason || ''} onChange={(e) => update('reason', e.target.value)} className="flex-1 bg-transparent border-none outline-none text-[10px] font-medium text-gray-400 placeholder-gray-700" />
                </div>
            </div>
            <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-white !border-2 !border-black shadow-lg" /><Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-white !border-2 !border-black shadow-lg" />
        </JewelWrapper>
    );
};

export const ImpactNode = ({ id, data, selected }) => {
    const { label, condition, prodImpact = 1, costImpact = 1, weatherType = 'none' } = data;
    const update = (field, value) => data.onUpdate?.(id, { [field]: value });
    const isNegative = prodImpact < 1 || costImpact > 1;

    return (
        <JewelWrapper selected={selected} shapeClass="rounded-[2.5rem]">
            {/* AI VISION TAG */}
            <div className="absolute top-2 right-4 text-[8px] font-mono text-white font-bold tracking-widest pointer-events-none select-none z-30 drop-shadow-md opacity-50">ID:{id}::IMPACT</div>
            <div className="flex flex-col gap-5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className={`p-3.5 rounded-2xl ${isNegative ? 'bg-rose-500/20 text-rose-400' : 'bg-indigo-500/20 text-indigo-400'} border border-white/10 shadow-2xl transition-transform group-hover:scale-110`}><Zap size={24} strokeWidth={2.5} className={isNegative ? 'animate-pulse' : ''} /></div>
                        <div><div className="text-[9px] font-black text-white/40 uppercase tracking-[0.4em] mb-0.5">Impact Analysis</div><div className="text-lg font-black text-white uppercase tracking-tight leading-none">{label || 'Site Condition'}</div></div>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); data.onDelete?.(); }} className="p-2 rounded-xl bg-white/5 text-white/20 hover:bg-rose-500 hover:text-white transition-all"><X size={14} strokeWidth={3} /></button>
                </div>
                <div className="bg-black/40 rounded-3xl p-5 border border-white/5 shadow-inner space-y-4">
                    <div className="flex justify-between items-center"><span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Live Status</span><select value={weatherType} onChange={(e) => update('weatherType', e.target.value)} className={`px-3 py-1 rounded-full text-[10px] font-black uppercase outline-none bg-white/5 border border-white/10 cursor-pointer ${weatherType === 'none' ? 'text-gray-400' : 'text-amber-400'}`}><option value="none">Normal</option><option value="heat">Extreme Heat</option><option value="rain">Wet Weather</option></select></div>
                    <div className="grid grid-cols-2 gap-3"><div className="flex flex-col gap-1 p-3 bg-white/5 rounded-2xl border border-white/5"><span className="text-[8px] font-bold text-gray-600 uppercase">Productivity</span><span className={`text-xl font-mono font-black ${prodImpact < 1 ? 'text-rose-400' : 'text-emerald-400'}`}>{prodImpact}x</span></div><div className="flex flex-col gap-1 p-3 bg-white/5 rounded-2xl border border-white/5"><span className="text-[8px] font-bold text-gray-600 uppercase">Cost Factor</span><span className={`text-xl font-mono font-black ${costImpact > 1 ? 'text-rose-400' : 'text-emerald-400'}`}>{costImpact}x</span></div></div>
                </div>
                <div className="flex items-center gap-2 px-1"><div className={`w-1.5 h-1.5 rounded-full ${isNegative ? 'bg-rose-500 animate-ping' : 'bg-emerald-500'} shadow-[0_0_10px_currentColor]`} /><span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">{condition || 'Operational'}</span></div>
            </div>
            <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-white !border-2 !border-black shadow-lg" /><Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-white !border-2 !border-black shadow-lg" />
        </JewelWrapper>
    );
};

export const ChronosNode = ({ id, data, selected }) => {
    const { label, startTime, finishTime, manHours, duration, onDelete, hubData } = data;
    const hasHubData = hubData && (hubData.workers?.length > 0 || hubData.resources?.length > 0);
    const handleTimeChange = (field, value) => {
        const newData = { [field]: value };
        const start = field === 'startTime' ? value : (startTime || '07:00');
        const end = field === 'finishTime' ? value : (finishTime || '17:00');
        const [h1, m1] = start.split(':').map(Number);
        const [h2, m2] = end.split(':').map(Number);
        const totalHours = Math.max(0, (h2 + m2/60) - (h1 + m1/60));
        newData.duration = parseFloat(totalHours.toFixed(2));
        data.onUpdate?.(id, newData);
    };
    return (
        <div className={`
            group relative min-w-[280px] aspect-square transition-all duration-1000
            rounded-full select-none cursor-pointer
            ${selected ? 'scale-110 z-50 shadow-[0_0_150px_-30px_rgba(6,182,212,0.8)]' : 'hover:scale-105 shadow-2xl'}
        `}>
            {/* AI VISION TAG */}
            <div className="absolute top-[15%] left-1/2 -translate-x-1/2 text-[8px] font-mono text-cyan-100 font-bold tracking-widest pointer-events-none select-none z-30 drop-shadow-md opacity-50">ID:{id}::CHRONOS</div>

            <div className={`absolute inset-0 rounded-full border-[6px] border-cyan-500/20 border-t-cyan-400 border-l-cyan-600/50 animate-spin-slow ${hasHubData ? 'shadow-[0_0_50px_rgba(6,182,212,0.5)]' : ''}`} /><div className="absolute inset-2 rounded-full border-[2px] border-dashed border-cyan-300/30 animate-spin-reverse-slower" />
            <div className="absolute inset-4 rounded-full bg-gradient-to-br from-cyan-900/90 via-black to-blue-950/90 backdrop-blur-2xl flex flex-col items-center justify-center border border-cyan-500/30 overflow-hidden cursor-pointer">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.15),transparent_70%)] animate-pulse" />
                <div className="relative z-10 text-center space-y-2 pointer-events-none">
                    <button onClick={(e) => { e.stopPropagation(); onDelete?.(); }} className="absolute -top-10 left-1/2 -translate-x-1/2 p-2 rounded-xl bg-white/5 text-white/20 hover:bg-rose-500 hover:text-white transition-all opacity-0 group-hover:opacity-100 border border-white/10 pointer-events-auto"><X size={16} strokeWidth={3} /></button>
                    <div className="flex items-center justify-center gap-2 text-cyan-400 mb-2"><Clock size={16} className="animate-pulse" /><span className="text-[9px] font-black uppercase tracking-[0.3em]">{hasHubData ? 'Chronos Hub' : 'Chronos'}</span></div>
                    <div className="pointer-events-auto">
                        <input type="time" className="text-4xl font-black text-white font-mono tracking-tighter drop-shadow-[0_0_10px_rgba(34,211,238,0.5)] bg-transparent text-center w-full focus:outline-none cursor-pointer" value={startTime || '07:00'} onChange={(e) => handleTimeChange('startTime', e.target.value)} onClick={(e) => e.stopPropagation()} />
                        <div className="h-px w-12 bg-cyan-500/50 mx-auto my-1" />
                        <input type="time" className="text-2xl font-bold text-cyan-200/50 font-mono tracking-tighter bg-transparent text-center w-full focus:outline-none cursor-pointer" value={finishTime || '17:00'} onChange={(e) => handleTimeChange('finishTime', e.target.value)} onClick={(e) => e.stopPropagation()} />
                    </div>
                    <div className="mt-4 px-4 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-bold">{label || 'Shift A'}</div>
                </div>
            </div>
            {duration > 0 && (
                <div className="absolute -right-4 top-1/2 -translate-y-1/2 bg-black border border-cyan-500 text-cyan-400 px-3 py-1.5 rounded-xl text-xs font-black shadow-xl flex flex-col items-center gap-1 min-w-[60px]">
                    <div className="flex items-center gap-2"><Timer size={12} /> {duration || 0}H</div>
                </div>
            )}
            {hasHubData && (<div className="absolute -left-4 top-1/2 -translate-y-1/2 bg-indigo-600 border border-indigo-400 text-white px-2 py-1 rounded-lg text-[8px] font-black animate-pulse shadow-lg">HUB_SYNC</div>)}
            <Handle type="target" position={Position.Left} className="!w-4 !h-4 !bg-cyan-400 !border-4 !border-black shadow-[0_0_20px_#22d3ee]" /><Handle type="source" position={Position.Right} className="!w-4 !h-4 !bg-cyan-400 !border-4 !border-black shadow-[0_0_20px_#22d3ee]" />
        </div>
    );
};

export const NeuralPrismNode = ({ id, data, selected }) => {
    const { velocity = 1.0, completionTime = '--:--', status = 'analyzing', label = 'Neural Prism', insight, projectFinancials, hubData } = data;
    const [showInsight, setShowInsight] = useState(false);
    const isPluggedIn = status !== 'disconnected' && status !== 'analyzing';
    const update = (field, value) => data.onUpdate?.(id, { [field]: value });

    const branchCost = useMemo(() => {
        if (!hubData) return 0;
        const labor = (hubData.workers || []).reduce((sum, w) => sum + (parseFloat(w.inHouseCost) || 0) * (parseFloat(w.duration) || 0), 0);
        const resources = (hubData.resources || []).reduce((sum, r) => sum + (parseFloat(r.inHouseCost) || 0) * (parseFloat(r.quantity) || 1), 0);
        return labor + resources;
    }, [hubData]);

    const budgetImpact = useMemo(() => {
        if (!projectFinancials?.liveProjectValue || projectFinancials.liveProjectValue === 0) return 0;
        return ((branchCost / projectFinancials.liveProjectValue) * 100).toFixed(1);
    }, [branchCost, projectFinancials]);

    const timelineHealth = useMemo(() => {
        if (!projectFinancials?.startDate || !projectFinancials?.endDate) return null;
        const start = new Date(projectFinancials.startDate).getTime();
        const end = new Date(projectFinancials.endDate).getTime();
        const now = new Date().getTime();
        if (now > end) return { label: 'DELAYED', color: 'text-rose-500', pct: 100 };
        const total = end - start;
        const elapsed = now - start;
        const pct = Math.min(100, Math.max(0, (elapsed / total) * 100));
        return { label: pct > 90 ? 'CRITICAL' : 'ON TRACK', color: pct > 90 ? 'text-amber-500' : 'text-emerald-500', pct };
    }, [projectFinancials]);

    const theme = useMemo(() => {
        if (status === 'disconnected') return { color: '#475569', label: 'UNPLUGGED', glow: 'shadow-slate-500/20' };
        if (status === 'analyzing') return { color: '#818cf8', label: 'Syncing...', glow: 'shadow-indigo-500/40' };
        if (velocity >= 1.2) return { color: '#10b981', label: 'OPTIMAL', glow: 'shadow-emerald-500/50' };
        if (velocity >= 0.9) return { color: '#f59e0b', label: 'STABLE', glow: 'shadow-amber-500/50' };
        return { color: '#f43f5e', label: 'CRITICAL', glow: 'shadow-rose-500/50' };
    }, [status, velocity]);

    return (
        <div className={`relative w-[280px] h-[280px] transition-all duration-1000 ${selected ? 'scale-110' : 'hover:scale-105'}`}>
            {/* AI VISION TAG */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 text-[8px] font-mono text-indigo-200 font-bold tracking-widest pointer-events-none select-none z-30 drop-shadow-md opacity-60">ID:{id}::PRISM</div>

            <button onClick={(e) => { e.stopPropagation(); data.onDelete?.(); }} className="absolute -top-12 left-1/2 -translate-x-1/2 p-2 rounded-xl bg-white/5 text-white/20 hover:bg-rose-500 hover:text-white transition-all opacity-0 group-hover:opacity-100 border border-white/10 z-[100] nodrag"><X size={16} strokeWidth={3} /></button>
            {data.gravityActive && (<div className="absolute inset-0 z-0 pointer-events-none"><motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.4, 0.1] }} transition={{ duration: 4, repeat: Infinity }} className="absolute inset-[-120px] rounded-full border-2 border-dashed border-indigo-500/20" /><div className="absolute inset-[-180px] rounded-full bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.08) 0%,transparent_70%)]" /></div>)}
            <div className="absolute inset-0 rounded-full border-[4px] border-white/5 animate-ping-slow pointer-events-none" style={{ borderColor: `${theme.color}22` }} /><div className={`absolute inset-0 rounded-full border border-white/5 ${isPluggedIn ? 'animate-spin-slow' : 'opacity-20'}`} /><div className={`absolute inset-12 rounded-full blur-[60px] transition-colors duration-1000 ${isPluggedIn ? 'opacity-40' : 'opacity-10'}`} style={{ backgroundColor: theme.color }} />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none"><svg width="160" height="160" viewBox="0 0 100 100" className={`drop-shadow-2xl transition-opacity duration-1000 ${isPluggedIn ? 'opacity-100' : 'opacity-30'}`}><defs><linearGradient id="prismGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#fff" stopOpacity="0.9" /><stop offset="100%" stopColor={theme.color} stopOpacity="0.3" /></linearGradient></defs><motion.path d="M50 5 L95 85 L5 85 Z" fill="url(#prismGrad)" stroke={theme.color} strokeWidth="0.5" animate={isPluggedIn ? { rotateY: [0, 360], rotateZ: [0, 5, -5, 0], scale: [1, 1.08, 1] } : {}} transition={{ rotateY: { duration: 6, repeat: Infinity, ease: "linear" }, default: { duration: 4, repeat: Infinity, ease: "easeInOut" } }} /><path d="M50 5 L50 85" stroke="white" strokeWidth="0.3" strokeOpacity="0.4" /><path d="M50 85 L95 85" stroke="white" strokeWidth="0.3" strokeOpacity="0.4" /></svg></div>
            {insight && isPluggedIn && (
                <div className="absolute -top-6 -right-6 z-50 nodrag">
                    <button onClick={() => setShowInsight(!showInsight)} className="p-4 rounded-3xl bg-white border-2 border-white shadow-[0_0_40px_rgba(255,255,255,0.6)] animate-bounce-slow text-indigo-600 hover:scale-110 transition-transform flex items-center justify-center"><BrainCircuit size={24} fill="currentColor" /></button>
                    <AnimatePresence>{showInsight && (<motion.div initial={{ opacity: 0, scale: 0.9, y: 10, x: 20 }} animate={{ opacity: 1, scale: 1, y: 0, x: 0 }} exit={{ opacity: 0, scale: 0.9, y: 10, x: 20 }} className="absolute top-16 right-0 w-[320px] bg-white text-indigo-950 p-6 rounded-[2.5rem] shadow-[0_30px_60px_-12px_rgba(0,0,0,0.3)] z-[100] border-4 border-indigo-50 font-medium text-xs leading-relaxed italic"><div className="flex items-center gap-3 mb-3 not-italic"><div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-600"><Target size={16} /></div><span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Pinnacle Strategic Suggestion</span></div>"{insight}"<div className="absolute -top-3 right-8 w-6 h-6 bg-white rotate-45 border-l-4 border-t-4 border-indigo-50" /></motion.div>)}</AnimatePresence>
                </div>
            )}
            <div className="absolute inset-0 flex items-center justify-center">
                <div onClick={() => isPluggedIn && update('menuOpen', !data.menuOpen)} className={`p-6 rounded-full border backdrop-blur-xl shadow-2xl z-20 cursor-pointer transition-all active:scale-95 ${!isPluggedIn ? 'bg-slate-900 border-slate-700 cursor-not-allowed grayscale' : status === 'analyzing' ? 'animate-pulse bg-white/10 border-white/40' : 'bg-black/90 border-white/20 hover:border-white/40'}`}>
                    {status === 'analyzing' ? <Activity size={32} className="text-white animate-spin-slow" /> : <Zap size={32} style={{ color: theme.color }} className={isPluggedIn ? 'animate-pulse' : ''} />}
                </div>
                {data.menuOpen && isPluggedIn && (
                    <div className="absolute inset-0 z-10 nodrag">
                        {[
                            { id: 'opt', icon: <Sparkles size={16} />, label: 'Optimize', angle: -60 },
                            { id: 'risk', icon: <AlertTriangle size={16} />, label: 'Risks', angle: 0 },
                            { id: 'sum', icon: <FileText size={16} />, label: 'Summary', angle: 60 }
                        ].map((cmd) => (
                            <motion.button key={cmd.id} initial={{ scale: 0 }} animate={{ scale: 1, x: 100 * Math.cos(cmd.angle * (Math.PI / 180)), y: 100 * Math.sin(cmd.angle * (Math.PI / 180)) }} whileHover={{ scale: 1.2 }} onClick={(e) => { e.stopPropagation(); update('command', cmd.id); update('menuOpen', false); }} className="absolute left-1/2 top-1/2 -ml-7 -mt-7 w-14 h-14 rounded-full bg-black/90 border border-white/20 flex flex-col items-center justify-center text-white shadow-2xl hover:border-indigo-400 group/cmd"><div style={{ color: theme.color }}>{cmd.icon}</div><span className="text-[7px] font-black uppercase tracking-tighter mt-1 opacity-0 group-hover/cmd:opacity-100 transition-opacity">{cmd.label}</span><div className="absolute inset-0 rounded-full blur-md opacity-0 group-hover/cmd:opacity-20 animate-pulse" style={{ backgroundColor: theme.color }} /></motion.button>
                        ))}
                    </div>
                )}
            </div>
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-full text-center pointer-events-none">
                <div className="text-[10px] font-black tracking-[0.5em] text-white/30 uppercase mb-3 leading-none">Neural Prism Engine</div>
                <div className="flex flex-col items-center gap-2">
                    <div className={`text-[10px] font-black px-5 py-2 rounded-full border inline-block backdrop-blur-md transition-all duration-1000 shadow-2xl`} style={{ borderColor: `${theme.color}66`, color: theme.color, boxShadow: `0 0 30px ${theme.color}33` }}>{theme.label}</div>
                    {isPluggedIn && timelineHealth && (<div className="flex items-center gap-2 bg-black/60 px-3 py-1 rounded-full border border-white/5 backdrop-blur-md"><span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Site Health</span><div className="w-16 h-1 bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-indigo-500 transition-all duration-1000" style={{ width: `${timelineHealth.pct}%` }} /></div><span className={`text-[8px] font-black uppercase ${timelineHealth.color}`}>{timelineHealth.label}</span></div>)}
                </div>
            </div>
            <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-[440px] grid grid-cols-4 gap-2 nodrag">
                <button onClick={(e) => { e.stopPropagation(); isPluggedIn && update('gravityActive', !data.gravityActive); }} className={`aspect-square rounded-[1.8rem] border transition-all duration-500 flex flex-col items-center justify-center relative overflow-hidden ${!isPluggedIn ? 'bg-slate-900 border-slate-800 text-slate-600 grayscale cursor-not-allowed' : data.gravityActive ? 'bg-indigo-600 border-indigo-400 text-white shadow-[0_0_40px_rgba(99,102,241,0.5)]' : 'bg-black/80 border-white/10 text-gray-500 hover:text-white'}`}><Magnet size={24} className={data.gravityActive ? 'animate-bounce' : ''} /><span className="text-[7px] font-black uppercase tracking-tighter mt-1">{data.gravityActive ? 'ACTIVE' : 'GRAVITY'}</span>{data.gravityActive && <div className="absolute inset-0 bg-white/10 animate-pulse" />}</button>
                <div className={`bg-black/90 border border-white/10 rounded-[1.8rem] p-4 backdrop-blur-2xl flex flex-col justify-center text-center shadow-2xl relative overflow-hidden ${!isPluggedIn ? 'opacity-20' : 'opacity-100'}`}><div className="text-[7px] font-black text-gray-500 uppercase tracking-widest mb-1 flex items-center justify-center gap-1"><DollarSign size={8} /> Burn</div><div className="text-lg font-black text-rose-400 font-mono leading-none tracking-tighter">{isPluggedIn ? (data.burnRate || '$0/hr') : '---'}</div><div className="text-[6px] font-bold text-gray-600 uppercase mt-1">Cost / Hour</div></div>
                <div className={`bg-black/90 border border-white/10 rounded-[1.8rem] p-4 backdrop-blur-2xl flex-col justify-center text-center shadow-2xl relative overflow-hidden flex ${!isPluggedIn ? 'opacity-20' : 'opacity-100'}`}><div className="text-[7px] font-black text-gray-500 uppercase tracking-widest mb-1 flex items-center justify-center gap-1"><Clock size={8} /> Horizon</div><div className="text-lg font-black text-white font-mono leading-none tracking-tighter">{isPluggedIn ? completionTime : '---'}</div><div className="text-[6px] font-bold text-gray-600 uppercase mt-1">Est. Finish</div></div>
                <div className={`bg-black/90 border border-white/10 rounded-[1.8rem] p-4 backdrop-blur-2xl flex flex-col justify-center text-center shadow-2xl relative overflow-hidden ${!isPluggedIn ? 'opacity-20' : 'opacity-100'}`}><div className="text-[7px] font-black text-gray-500 uppercase tracking-widest mb-1 flex items-center justify-center gap-1"><Waves size={8} /> Momentum</div><div className={`text-2xl font-black font-mono leading-none tracking-tighter ${velocity < 1 && isPluggedIn ? 'text-rose-500 animate-pulse' : 'text-emerald-400'}`}>{isPluggedIn ? `${velocity}x` : '---'}</div><div className="mt-2 flex flex-col items-center gap-1"><div className="w-full h-1 bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${Math.min(100, budgetImpact * 10)}%` }} /></div><span className="text-[6px] font-black text-gray-500 uppercase tracking-widest">{budgetImpact}% CONTRACT IMPACT</span></div></div>
            </div>
            <Handle type="target" position={Position.Left} className="!w-4 !h-4 !bg-white !border-4 !border-black shadow-2xl" /><Handle type="source" position={Position.Right} className="!w-4 !h-4 !bg-white !border-4 !border-black shadow-2xl" />
        </div>
    );
};

export const PhotoNode = ({ id, data, selected }) => {
    const { url, label, onDelete, isBackground } = data;
    const update = (field, value) => data.onUpdate?.(id, { [field]: value });

    return (
        <div 
            className={`relative group transition-all duration-500 ${selected ? 'z-[100]' : isBackground ? 'z-0' : 'z-40 hover:scale-[1.02]'}`} 
            style={{ width: '100%', height: '100%', minWidth: 200, minHeight: 150 }}
        >
            <NodeResizer minWidth={200} minHeight={150} isVisible={selected} />
            
            {/* AI VISION TAG */}
            {!isBackground && <div className="absolute top-4 right-4 text-[8px] font-mono text-white font-bold tracking-widest pointer-events-none select-none z-30 drop-shadow-md opacity-50">ID:{id}::PHOTO</div>}

            <div className={`absolute -inset-4 bg-indigo-500/20 rounded-[2rem] blur-2xl opacity-0 ${!isBackground && 'group-hover:opacity-100'} animate-pulse transition-opacity pointer-events-none`} />
            
            <div className={`relative w-full h-full rounded-[1.8rem] overflow-hidden transition-all duration-500 ${isBackground ? 'opacity-100 border-4 border-white/10 shadow-inner' : 'bg-gradient-to-br from-white/20 via-white/5 to-black border border-white/10 shadow-2xl p-1'}`}>
                
                {/* Image Container */}
                <div className={`relative w-full h-full ${!isBackground && 'rounded-[1.5rem]'} overflow-hidden bg-stone-900`}>
                    <img src={url} alt={label} className="w-full h-full object-cover" />
                    {!isBackground && <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />}
                </div>
            </div>

            {/* CONTROLS (Standardised with ShapeNode) */}
            <div className={`absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 p-1.5 rounded-2xl bg-black/60 border border-white/10 backdrop-blur-md transition-all ${selected || !isBackground ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto'}`}>
                <div className="flex items-center gap-2 px-2 border-r border-white/10 mr-1">
                    <div className={`w-1.5 h-1.5 rounded-full ${isBackground ? 'bg-indigo-500' : 'bg-emerald-500 animate-pulse'}`} />
                    <span className="text-[8px] font-black text-white/60 uppercase tracking-widest truncate max-w-[80px]">{label || 'IMAGE'}</span>
                </div>
                <button onClick={(e) => { e.stopPropagation(); update('isBackground', !isBackground); }} className={`p-2 rounded-xl transition-all ${isBackground ? 'bg-white/20 text-white' : 'text-gray-400 hover:text-white hover:bg-white/10'}`} title="Toggle Background"><Layers size={14} /></button>
                <div className="w-px h-4 bg-white/10" />
                <button onClick={(e) => { e.stopPropagation(); onDelete?.(); }} className="p-2 rounded-xl text-rose-400 hover:bg-rose-500/20 transition-all"><X size={14} /></button>
            </div>
            
            <Handle type="target" position={Position.Top} className={`!w-2 !h-2 !bg-indigo-400 !border-none ${isBackground ? 'opacity-0' : ''}`} />
            <Handle type="source" position={Position.Bottom} className={`!w-2 !h-2 !bg-indigo-400 !border-none ${isBackground ? 'opacity-0' : ''}`} />
        </div>
    );
};

export const DiaryNode = ({ id, data, selected }) => {
  const { label, duration, type, costRate, quantity, onDelete, isGhost } = data;
  const getThemeStyles = (nodeType) => {
      const t = nodeType?.toLowerCase();
      if (isGhost) return { bg: "from-slate-800/60 to-black", border: "border-white/10 border-dashed", glow: "shadow-white/5", icon: "text-slate-400", iconBg: "bg-white/5", accent: "text-slate-500" };
      if (t === 'staff') return { bg: "from-emerald-600/80 via-emerald-900/90 to-black", border: "border-emerald-400/40", glow: "shadow-emerald-500/50", icon: "text-emerald-400", iconBg: "bg-emerald-500/20", accent: "text-emerald-200" };
      if (t === 'equipment') return { bg: "from-amber-600/80 via-amber-900/90 to-black", border: "border-amber-400/40", glow: "shadow-amber-500/50", icon: "text-amber-400", iconBg: "bg-amber-500/20", accent: "text-amber-200" };
      return { bg: "from-indigo-600/80 via-indigo-900/90 to-black", border: "border-indigo-400/40", glow: "shadow-indigo-500/50", icon: "text-indigo-400", iconBg: "bg-indigo-500/20", accent: "text-indigo-200" };
  };
  const nodeTheme = getThemeStyles(type);
  return (
    <JewelWrapper theme={nodeTheme} selected={selected} isGhost={isGhost} shapeClass="rounded-[2rem]">
      {/* AI VISION TAG */}
      <div className="absolute top-2 right-4 text-[8px] font-mono text-white font-bold tracking-widest pointer-events-none select-none z-30 drop-shadow-md opacity-50">ID:{id}::{type?.toUpperCase()}</div>

      <div className="flex flex-col gap-4">
          <div className="flex justify-between items-start">
              <div className="relative"><div className={`absolute inset-0 rounded-2xl ${nodeTheme.iconBg} animate-ping opacity-20`} /><div className={`relative p-3.5 rounded-2xl ${nodeTheme.iconBg} backdrop-blur-md shadow-2xl border border-white/10 transition-all group-hover:rotate-3`}>{type === 'staff' ? <User size={22} className={nodeTheme.icon} /> : type === 'equipment' ? <Wrench size={22} className={nodeTheme.icon} /> : <Package size={22} className={nodeTheme.icon} />}</div></div>
              {!isGhost && (<button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-2 rounded-xl bg-white/5 text-white/20 hover:bg-red-500 hover:text-white transition-all scale-90 group-hover:scale-100"><X size={14} strokeWidth={3} /></button>)}
          </div>
          <div><div className="flex items-center gap-2 mb-1"><span className={`text-[8px] font-black uppercase tracking-[0.4em] ${nodeTheme.accent} opacity-60`}>{isGhost ? 'SUGGESTION' : type}</span></div><div className="text-lg font-black text-white leading-tight tracking-tight uppercase line-clamp-2">{label}</div></div>
          {!isGhost && (<div className="flex gap-2 items-center"><div className="px-3 py-1.5 rounded-xl bg-black/40 border border-white/5 flex items-center gap-2"><Cpu size={10} className={`${nodeTheme.accent} opacity-50`} /><span className="text-[10px] font-mono font-black text-white">{type === 'staff' || type === 'equipment' ? `${duration || quantity}H` : `${quantity} UNIT`}</span></div>{costRate > 0 && (<div className={`px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-1.5`}><DollarSign size={10} className={nodeTheme.icon} /><span className="text-[10px] font-mono font-black text-white">${costRate}</span></div>)}</div>)}
      </div>
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-white !border-2 !border-black" /><Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-white !border-2 !border-black" />
    </JewelWrapper>
  );
};

export const DimensionNode = ({ id, data, selected }) => {
    const { label, width, height } = data;
    const area = (width / 20) * (height / 20);
    return (
        <div className={`relative min-w-[150px] min-h-[150px] p-1 transition-all duration-700 rounded-[2rem] border-2 ${selected ? 'border-indigo-500/50 bg-indigo-500/10 shadow-2xl scale-105' : 'border-white/5 bg-black/20 hover:border-white/20'}`} style={{ width: '100%', height: '100%' }}>
            {/* AI VISION TAG */}
            <div className="absolute top-2 right-4 text-[8px] font-mono text-white font-bold tracking-widest pointer-events-none select-none z-30 drop-shadow-md opacity-60">ID:{id}</div>

            <NodeResizer minWidth={150} minHeight={150} isVisible={selected} onResize={data.onResize} />
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[2rem]"><div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.05),transparent_70%)]" /><div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:20px_20px]" /></div>
            <div className="relative p-6 h-full flex flex-col justify-between"><div><div className="flex items-center gap-3 mb-4"><div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400"><Ruler size={16} /></div><div className="text-sm font-black text-white uppercase tracking-wider truncate">{label}</div></div></div><div className="space-y-2"><div className="flex justify-between items-center text-[10px] font-bold"><span className="text-gray-500 uppercase">Dimensions</span><span className="text-indigo-400 font-mono">{(width/20).toFixed(1)}' x {(height/20).toFixed(1)}'</span></div><div className="flex justify-between items-end"><span className="text-[10px] font-bold text-gray-500 uppercase">Area</span><span className="text-2xl font-black text-white font-mono leading-none">{area.toFixed(0)}<span className="text-xs text-gray-600 ml-1">SQFT</span></span></div></div></div>
            <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-white !border-2 !border-black" /><Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-white !border-2 !border-black" />
        </div>
    );
};

export const AllowanceNode = ({ data, selected }) => {
    const { label, rate, type } = data;
    return (
        <div className={`relative min-w-[220px] p-1 transition-all duration-700 rounded-full ${selected ? 'scale-110 z-50 shadow-[0_0_100px_-10px_rgba(251,191,36,0.8)]' : 'hover:scale-105 shadow-2xl'}`}>
            <div className="absolute -inset-4 rounded-full bg-amber-500/20 blur-xl animate-pulse" />
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-300 via-amber-500 to-yellow-800 p-[6px] shadow-[0_0_30px_rgba(245,158,11,0.4)] overflow-hidden"><div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.9),transparent_50%)] z-10 opacity-70" /><div className="absolute inset-0 rounded-full bg-[#1a1200] ring-1 ring-white/20 backdrop-blur-xl flex items-center justify-center overflow-hidden"><div className="absolute inset-0 opacity-[0.07] bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] animate-spin-slow" /></div></div>
            <div className="relative p-8 flex flex-col items-center justify-center text-center gap-3 z-20"><div className="absolute -top-6 p-3 bg-gradient-to-b from-yellow-200 to-amber-600 rounded-full shadow-[0_4px_10px_rgba(0,0,0,0.5)] border-2 border-yellow-100 animate-bounce-slow"><Award size={24} className="text-amber-950 drop-shadow-md" strokeWidth={3} /></div><button onClick={(e) => { e.stopPropagation(); data.onDelete?.(); }} className="absolute top-4 right-6 text-amber-500/50 hover:text-red-500 transition-colors bg-black/20 rounded-full p-1"><X size={14} strokeWidth={3} /></button><div className="mt-4 space-y-1"><div className="text-[10px] font-black text-amber-400 uppercase tracking-[0.3em] drop-shadow-sm">Allowance</div><div className="text-xl font-black text-white uppercase tracking-tight leading-none drop-shadow-[0_2px_0_rgba(0,0,0,0.5)]">{label || 'Bonus'}</div></div><div className="px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-600/20 to-yellow-600/20 border border-amber-400/50 flex items-center gap-2 shadow-[inset_0_0_10px_rgba(251,191,36,0.2)]"><DollarSign size={12} className="text-yellow-300" /><span className="text-lg font-mono font-black text-yellow-100">${rate || 0}</span><span className="text-[9px] font-bold text-amber-500 uppercase ml-0.5 self-end mb-1">/{type === 'daily' ? 'DAY' : 'HR'}</span></div>{data.allowanceTotal > 0 && (<div className="mt-3 pt-3 border-t border-amber-500/20 w-full flex flex-col items-center"><div className="text-[8px] font-black text-amber-500/40 uppercase tracking-widest mb-1">Live Impact</div><div className="px-3 py-1 bg-emerald-900/40 rounded-lg border border-emerald-500/30 text-emerald-400 text-lg font-mono font-black shadow-[0_0_15px_rgba(16,185,129,0.2)]">+${data.allowanceTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div></div>)}</div>
            <Handle type="source" position={Position.Bottom} className="!w-4 !h-4 !bg-amber-400 !border-4 !border-black shadow-[0_0_15px_#fbbf24]" /><Handle type="target" position={Position.Top} className="!w-4 !h-4 !bg-amber-400 !border-4 !border-black shadow-[0_0_15px_#fbbf24]" />
        </div>
    );
};

export const ZoneNode = ({ data, selected }) => (
    <div className={`relative rounded-[3rem] border-2 transition-all duration-700 group ${selected ? 'border-white/30 bg-white/5 shadow-2xl' : 'border-white/5 bg-black/20'}`} style={{ width: '100%', height: '100%', minWidth: 200, minHeight: 200 }}>
       <NodeResizer minWidth={200} minHeight={200} isVisible={selected} />
       <div className="absolute top-10 left-10"><div className="flex items-center gap-4 opacity-30 group-hover:opacity-60 transition-opacity"><Box size={16} className="text-white" /><span className="text-xs font-black text-white uppercase tracking-[0.6em]">ZONE_MAPPED</span></div>{data.zoneTotal > 0 && <div className="text-4xl font-mono font-black text-white/10 mt-6 tracking-tighter">${data.zoneTotal.toFixed(0)}</div>}</div>
    </div>
);

export const WormholeNode = ({ data, selected }) => (
    <div className={`relative rounded-full border-[12px] border-double border-indigo-500/10 bg-black flex items-center justify-center transition-all duration-1000 ${selected ? 'shadow-[0_0_150px_rgba(99,102,241,0.4)] scale-105 border-indigo-400/30' : 'opacity-90'}`} style={{ width: '100%', height: '100%', minWidth: 380, minHeight: 380 }}>
       <NodeResizer minWidth={380} minHeight={380} isVisible={selected} color="#6366f1" />
       <div className="absolute inset-0 rounded-full animate-spin-slow bg-[conic-gradient(from_0deg,transparent,rgba(99,102,241,0.2),transparent)]" />
       <div className="text-center z-10 p-12 bg-black/60 backdrop-blur-3xl rounded-full border border-white/5 shadow-2xl ring-1 ring-white/10"><div className="flex justify-center mb-4"><Zap size={48} className="text-indigo-400" /></div><div className="text-3xl font-black text-white uppercase tracking-[0.5em] mb-2">WORMHOLE</div><div className="text-[10px] text-indigo-300 font-black uppercase tracking-widest opacity-40">Holographic Container V2</div>{data.zoneTotal > 0 && (<div className="mt-8 pt-6 border-t border-white/10"><div className="text-4xl font-mono font-black text-emerald-400 animate-pulse">${data.zoneTotal.toLocaleString()}</div></div>)}</div>
    </div>
);

export const ShapeNode = ({ id, data, selected }) => {
    const { label, color = 'indigo', shapeType = 'square', isBackground, onDelete } = data;
    const update = (field, value) => data.onUpdate?.(id, { [field]: value });
    const [showColors, setShowColors] = useState(false);

    const colorMap = {
        slate: '#64748b', gray: '#6b7280', zinc: '#71717a', neutral: '#737373', stone: '#78716c',
        red: '#ef4444', orange: '#f97316', amber: '#f59e0b', yellow: '#eab308', lime: '#84cc16',
        green: '#22c55e', emerald: '#10b981', teal: '#14b8a6', cyan: '#06b6d4', sky: '#0ea5e9',
        blue: '#3b82f6', indigo: '#6366f1', violet: '#8b5cf6', purple: '#a855f7', fuchsia: '#d946ef',
        pink: '#ec4899', rose: '#f43f5e'
    };

    const colors = Object.keys(colorMap);
    const activeColor = colorMap[color] || colorMap.indigo;

    const getShapeClass = () => {
        if (shapeType === 'circle') return 'rounded-full';
        if (shapeType === 'pill') return 'rounded-[999px]';
        return 'rounded-[2.5rem]';
    };

    return (
        <div 
            className={`relative group transition-all duration-500 ${selected ? 'z-[100]' : isBackground ? 'z-0 nodrag' : 'z-40 hover:scale-[1.02]'}`} 
            style={{ width: '100%', height: '100%', minWidth: 150, minHeight: 150 }}
        >
            <NodeResizer minWidth={150} minHeight={150} isVisible={selected} />
            
            {/* AI VISION TAG */}
            {!isBackground && <div className="absolute top-4 right-4 text-[8px] font-mono text-white font-bold tracking-widest pointer-events-none select-none z-30 drop-shadow-md opacity-50">ID:{id}::SHAPE</div>}

            <div 
                className={`absolute inset-0 ${getShapeClass()} transition-all duration-500 overflow-hidden backdrop-blur-xl`}
                style={{
                    backgroundColor: isBackground ? activeColor : `${activeColor}33`,
                    borderColor: isBackground ? `${activeColor}66` : `${activeColor}66`,
                    borderWidth: isBackground ? '4px' : '1px',
                    borderStyle: 'solid',
                    boxShadow: isBackground ? 'inset 0 0 100px rgba(0,0,0,0.2)' : `0 0 30px ${activeColor}33`
                }}
            >
                {!isBackground && <div className={`absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50 pointer-events-none`} />}
                {isBackground && <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/grid-me.png')]" />}
            </div>

            {/* CONTROLS */}
            <div className={`absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 transition-all ${selected || !isBackground ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto'}`}>
                
                {/* COLOR PALETTE POPUP */}
                <AnimatePresence>
                    {showColors && (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 10 }}
                            className="mb-2 p-3 bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl grid grid-cols-6 gap-1.5 w-[180px] shadow-2xl"
                        >
                            {colors.map(c => (
                                <button 
                                    key={c}
                                    onClick={(e) => { e.stopPropagation(); update('color', c); }}
                                    title={c}
                                    className={`w-5 h-5 rounded-full border border-white/10 transition-transform hover:scale-125 ${color === c ? 'ring-2 ring-white scale-110' : ''}`}
                                    style={{ backgroundColor: colorMap[c] }}
                                />
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* MAIN BAR */}
                <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-black/60 border border-white/10 backdrop-blur-md">
                    <button onClick={(e) => { e.stopPropagation(); update('isBackground', !isBackground); }} className={`p-2 rounded-xl transition-all ${isBackground ? 'bg-white/20 text-white' : 'text-gray-400 hover:text-white hover:bg-white/10'}`} title="Toggle Background"><Layers size={14} /></button>
                    <div className="w-px h-4 bg-white/10" />
                    <button 
                        onClick={(e) => { e.stopPropagation(); setShowColors(!showColors); }}
                        className={`p-2 rounded-xl transition-all flex items-center gap-2 ${showColors ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                    >
                        <PaintBucket size={14} />
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: activeColor }} />
                    </button>
                    <div className="w-px h-4 bg-white/10" />
                    <button onClick={(e) => { e.stopPropagation(); onDelete?.(); }} className="p-2 rounded-xl text-rose-400 hover:bg-rose-500/20 transition-all"><X size={14} /></button>
                </div>
            </div>
        </div>
    );
};